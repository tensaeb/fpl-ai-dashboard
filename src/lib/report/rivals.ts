import { getPublicPicks, type DashboardBundle } from "../fpl/client";
import { mulberry32 } from "../fpl/demo";
import {
  candidateScore,
  isFlagged,
  type NormalizedData,
} from "../fpl/normalize";

/**
 * Mini-league intel, fed into the brief rather than just a standings table:
 * rival captains (are you mirrored or separated?), squad overlap, and one
 * low-owned differential candidate. Rival team names are public data; we
 * keep manager identities out of anything sent to the LLM.
 */

export interface RivalLine {
  entryId: number;
  /** Public FPL team name — used in UI only, never sent to the LLM. */
  teamName: string;
  rank: number;
  captainName: string | null;
  overlap: number;
}

export interface LeagueContext {
  leagueName: string;
  rivals: RivalLine[];
  differentialName: string | null;
  differentialOwnership: number | null;
}

export async function buildLeagueContext(
  bundle: DashboardBundle,
  norm: NormalizedData,
): Promise<LeagueContext | null> {
  const league = bundle.leagues[0];
  if (!league) return null;

  const myIds = new Set(norm.squad.map((p) => p.id));
  const others = league.standings.results
    .filter((r) => r.entry !== bundle.entryId)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 3);

  const rivals: RivalLine[] = [];
  if (bundle.mode === "demo") {
    const rng = mulberry32(4242 + bundle.entryId);
    const pool = norm.pool
      .filter((p) => !isFlagged(p))
      .sort((a, b) => candidateScore(b, norm.currentEventId) - candidateScore(a, norm.currentEventId));
    others.forEach((r, i) => {
      rivals.push({
        entryId: r.entry,
        teamName: r.entry_name,
        rank: r.rank,
        captainName: pool[(i + 1) * 2]?.name ?? pool[0]?.name ?? null,
        overlap: 4 + Math.floor(rng() * 5),
      });
    });
  } else {
    for (const r of others) {
      let captainName: string | null = null;
      let overlap = 0;
      try {
        const picks = await getPublicPicks(r.entry, norm.currentEventId);
        const capt = picks.picks.find((p) => p.is_captain);
        if (capt) captainName = norm.pool.find((p) => p.id === capt.element)?.name ?? null;
        overlap = picks.picks.filter((p) => p.multiplier > 0 && myIds.has(p.element)).length;
      } catch {
        /* rival picks unavailable — keep partial line */
      }
      rivals.push({ entryId: r.entry, teamName: r.entry_name, rank: r.rank, captainName, overlap });
    }
  }

  const squadIds = new Set(norm.squad.map((p) => p.id));
  const differential = norm.pool
    .filter((p) => !squadIds.has(p.id) && !isFlagged(p) && p.ownership <= 12 && p.ownership > 0)
    .sort((a, b) => candidateScore(b, norm.currentEventId) - candidateScore(a, norm.currentEventId))[0];

  return {
    leagueName: league.league.name,
    rivals,
    differentialName: differential?.name ?? null,
    differentialOwnership: differential?.ownership ?? null,
  };
}
