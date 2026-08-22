import type { DashboardBundle } from "../fpl/client";
import {
  candidateScore,
  captainScore,
  isFlagged,
  outScore,
  type NormalizedData,
  type NormalizedPlayer,
} from "../fpl/normalize";
import type { LeagueContext } from "./rivals";
import type { Report } from "./types";

/**
 * Deterministic report generator — encodes the same system-prompt weighting
 * the LLM gets, so the product works with zero external dependencies:
 *   1. HARD FILTER on injured/suspended/doubtful players
 *   2. Captaincy  → form + single-fixture difficulty (short horizon)
 *   3. Transfers  → next-5 fixture run + price trajectory (medium horizon)
 *   4. Hard affordability check against bank + sale price
 *   5. Ownership is a note, never an override
 */

const f = (n: number) => (Math.round(n * 10) / 10).toFixed(1);
const m = (tenths: number) => (tenths / 10).toFixed(1);

function fixtureLabel(p: NormalizedPlayer): string {
  const nxt = p.nextFixtures[0];
  if (!nxt) return "a blank gameweek ahead";
  return `${nxt.vs} ${nxt.home ? "at home" : "away"} (difficulty ${nxt.difficulty}/5)`;
}

function captainBlock(squad: NormalizedPlayer[]) {
  const starters = squad.filter((p) => p.isStarter);
  const ranked = [...starters].sort((a, b) => captainScore(b) - captainScore(a));
  let cap = ranked[0];
  let overridden = false;
  if (!cap || captainScore(cap) === -Infinity) {
    // everyone flagged — least-bad fallback, confidence will drop
    cap = [...starters].sort((a, b) => b.form - a.form)[0];
    overridden = true;
  }
  const vice = ranked.find((p) => p.id !== cap.id && captainScore(p) > -Infinity) ?? ranked[1];

  return {
    captain_suggestion: {
      player: cap.name,
      playerId: cap.id,
      reasoning: overridden
        ? `${cap.name} leads a thin field — your entire attack is carrying doubts, so this is the least-bad armband. ${f(cap.form)} form, ${f(cap.ppg)} ppg, plays ${fixtureLabel(cap)}.`
        : `${f(cap.form)} points/game over recent weeks with ${f(cap.ppg)} ppg on the season, and faces ${fixtureLabel(cap)} — the strongest form-versus-fixture profile in your XI. No availability flags.`,
    },
    vice_captain_suggestion: {
      player: vice.name,
      playerId: vice.id,
      reasoning: `${f(vice.form)} form and ${f(vice.ppg)} ppg, ${fixtureLabel(vice)}. Safe floor: ${vice.minutes} minutes played makes a no-show unlikely.`,
    },
    cap,
  };
}

function transferBlock(norm: NormalizedData): Report["transfer_suggestions"] {
  const squadIds = new Set(norm.squad.map((p) => p.id));
  const chosen = new Set<number>();
  const suggestions: Report["transfer_suggestions"] = [];

  const outs = [...norm.squad].sort((a, b) => outScore(a) - outScore(b));

  const maxGw = norm.currentEventId + 2;
  for (let gw = norm.currentEventId; gw <= maxGw && suggestions.length < 4; gw++) {
    for (const out of outs) {
      if (suggestions.length >= 4) break;
      const budget = norm.bank + out.price;
      const best = norm.pool
        .filter(
          (p) =>
            p.elementType === out.elementType &&
            !squadIds.has(p.id) &&
            !chosen.has(p.id) &&
            !isFlagged(p) &&
            p.price <= budget &&
            p.minutes >= Math.max(270, 180 * Math.min(norm.currentEventId, 10)),
        )
        .sort((a, b) => candidateScore(b, norm.currentEventId) - candidateScore(a, norm.currentEventId))[0];

      if (!best) continue;
      const gain = candidateScore(best, norm.currentEventId) - Math.max(outScore(out), 0);
      if (gain < 2.4) continue;

      const delta = best.price - out.price;
      chosen.add(best.id);
      const gwLabel = gw === norm.currentEventId ? "this gameweek" : `GW${gw}`;
      suggestions.push({
        out: out.name,
        outId: out.id,
        in: best.name,
        inId: best.id,
        cost_delta: Math.round((delta / 10) * 10) / 10,
        gameweek: gw,
        reasoning:
          `${out.name} (${out.teamShort}) is on ${f(out.form)} form with a next-five averaging ${f(
            out.avgDiffNext5,
          )} difficulty${isFlagged(out) ? " and an active availability flag" : ""}. ` +
          `${best.name} (${best.teamShort}) offers ${f(best.form)} form, ${f(best.ppg)} ppg and a ${f(
            best.avgDiffNext5,
          )} difficulty run ${delta > 0 ? `for £${m(delta)}m net` : `releasing £${m(-delta)}m`}. ` +
          `Targeted for ${gwLabel}. Affordable within your £${m(norm.bank)}m bank.`,
      });
    }
  }
  return suggestions;
}

function adviceBlocks(norm: NormalizedData, cap: NormalizedPlayer) {
  const flagged = norm.squad.filter(isFlagged);
  const flaggedStarters = flagged.filter((p) => p.isStarter);
  const dos: string[] = [];
  const donts: string[] = [];

  if (flaggedStarters.length > 0) {
    dos.push(
      `Bench ${flaggedStarters.map((p) => p.name).join(", ")} — flagged players fail the hard filter and shouldn't take a starting spot this week.`,
    );
  }
  dos.push(
    cap.isCaptain
      ? `Keep the armband on ${cap.name} — your current pick still tops the form-versus-fixture table.`
      : `Give ${cap.name} the armband — top form-versus-fixture profile in your squad this gameweek.`,
  );
  if (norm.freeTransfers >= 2) {
    dos.push(
      `You have ~${norm.freeTransfers} free transfers banked — a two-move reset costs you nothing this week.`,
    );
  } else {
    dos.push(`Work with your single free transfer and roll the rest — avoid a −4 unless a starter is ruled out.`);
  }
  if (norm.bank / 10 >= 1.5) {
    dos.push(`Use the £${m(norm.bank)}m sitting in your bank to attack an upgrade rather than letting it sit idle.`);
  }
  const greenRun = norm.squad
    .filter((p) => p.elementType >= 3 && !isFlagged(p))
    .sort((a, b) => a.avgDiffNext5 - b.avgDiffNext5)[0];
  if (greenRun) {
    dos.push(
      `Ride the ${greenRun.teamShort} fixture run — ${greenRun.name}'s next five average just ${f(
        greenRun.avgDiffNext5,
      )} difficulty.`,
    );
  }

  const temptinglyOwnedFlagged = norm.pool
    .filter((p) => isFlagged(p) && p.ownership > 8)
    .sort((a, b) => b.ownership - a.ownership)
    .slice(0, 2);
  if (temptinglyOwnedFlagged.length > 0) {
    donts.push(
      `Don't transfer in ${temptinglyOwnedFlagged
        .map((p) => `${p.name} (${f(p.ownership)}% owned)`)
        .join(" or ")} — availability flags put them on the hard-filter exclusion list regardless of form.`,
    );
  }
  donts.push(
    "Don't chase last week's scoreline — one haul is noise; weight the next-5 fixture run before pulling the trigger.",
  );
  if (norm.bank / 10 <= 0.3) {
    donts.push(`Don't spend the last of your £${m(norm.bank)}m — keep a buffer for price rises on planned buys.`);
  }
  if (flagged.length === 0) {
    donts.push("Don't take a points hit this week — a fully-fit squad means zero urgency to pay −4 for moves.");
  } else {
    donts.push(
      `Don't captain ${flagged[0].name} — flagged at ${flagged[0].chanceOfPlaying ?? 0}% chance of playing.`,
    );
  }
  donts.push("Don't let ownership % drive decisions — template-chasing is a note here, never an override.");

  return { dos: dos.slice(0, 5), donts: donts.slice(0, 5) };
}

function leagueNote(league: LeagueContext | null, capName: string): string | undefined {
  if (!league || !league.rivals.length) return undefined;
  const mirrorers = league.rivals.filter((r) => r.captainName === capName).length;
  const avgOverlap =
    league.rivals.reduce((s, r) => s + r.overlap, 0) / Math.max(1, league.rivals.length);
  if (mirrorers > 0) {
    const diff = league.differentialName
      ? ` ${league.differentialName} (${league.differentialOwnership?.toFixed(1) ?? "?"}% owned) is the separation swing if you're chasing.`
      : "";
    return `${mirrorers} of the top three in "${league.leagueName}" also captain ${capName} — the armband cancels out.${diff}`;
  }
  if (avgOverlap >= 7) {
    return `Your XI overlaps heavily with "${league.leagueName}" rivals (${avgOverlap.toFixed(1)}/11 shared) and nobody rivals-side is on ${capName} — a green week for him climbs you past the pack.`;
  }
  return `None of the tracked "${league.leagueName}" rivals captain ${capName} this week — a genuine rank-mover if he returns.`;
}

export function buildEngineReport(
  bundle: DashboardBundle,
  norm: NormalizedData,
  league: LeagueContext | null = null,
): Report {
  const { captain_suggestion, vice_captain_suggestion, cap } = captainBlock(norm.squad);
  const transfers = transferBlock(norm);
  const { dos, donts } = adviceBlocks(norm, cap);
  const league_note = leagueNote(league, cap.name);

  // Self-reported confidence — thin data drops it a level (blueprint §3 note).
  let score = norm.currentEventId >= 12 ? 2 : norm.currentEventId >= 6 ? 1 : 0;
  const flaggedStarters = norm.squad.filter((p) => p.isStarter && isFlagged(p)).length;
  const anyBlank = norm.squad.some((p) => p.isStarter && p.nextFixtures.length === 0);
  if (flaggedStarters >= 2 || anyBlank) score = Math.max(0, score - 1);
  const confidence = score >= 2 ? "high" : score === 1 ? "medium" : "low";

  const headline =
    transfers.length > 0
      ? `${transfers.length} move${transfers.length > 1 ? "s" : ""} on the table — ${cap.name} leads the armband race.`
      : `Squad holds its shape — ${cap.name} leads the armband race.`;

  return {
    gameweek: norm.currentEventId,
    headline,
    league_note,
    captain_suggestion,
    vice_captain_suggestion,
    transfer_suggestions: transfers,
    dos,
    donts,
    confidence,
  };
}
