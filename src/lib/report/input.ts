import { candidateScore, isFlagged, type NormalizedData, type NormalizedPlayer } from "../fpl/normalize";
import type { LeagueContext } from "./rivals";

/**
 * Compact, factual JSON payload for the LLM (blueprint §2 step 3) — never
 * raw API dumps. Also consumed by the deterministic rules engine.
 *
 * Privacy note (review finding): manager/team names add zero analytical
 * value to captaincy/transfer logic, so they are deliberately omitted.
 * Identity stays in our own DB/UI; third parties get numbers only.
 */

const num = (n: number) => Math.round(n * 100) / 100;
const priceM = (tenths: number) => num(tenths / 10);

function playerPayload(p: NormalizedPlayer) {
  return {
    id: p.id,
    name: p.name,
    team: p.teamShort,
    position: p.position,
    price_m: priceM(p.price),
    form: p.form,
    points_per_game: p.ppg,
    total_points: p.totalPoints,
    ownership_pct: p.ownership,
    minutes: p.minutes,
    status: p.status,
    chance_of_playing_pct: p.chanceOfPlaying,
    news: p.news || undefined,
    next_fixtures: p.nextFixtures.map((f) => ({
      gw: f.gw,
      vs: f.vs,
      home: f.home,
      difficulty: f.difficulty,
    })),
    avg_difficulty_next5: num(p.avgDiffNext5),
    role: p.isCaptain ? "captain" : p.isViceCaptain ? "vice-captain" : p.isStarter ? "starter" : "bench",
  };
}

export function buildReportInput(norm: NormalizedData, league: LeagueContext | null) {
  const squadIds = new Set(norm.squad.map((p) => p.id));

  // Top transfer candidates per position — the LLM chooses only from this
  // shortlist, keeping the prompt small and factual.
  const candidates: ReturnType<typeof playerPayload>[] = [];
  for (const et of [1, 2, 3, 4]) {
    const top = norm.pool
      .filter((p) => p.elementType === et && !squadIds.has(p.id))
      .sort((a, b) => candidateScore(b, norm.currentEventId) - candidateScore(a, norm.currentEventId))
      .slice(0, 10);
    candidates.push(...top.map(playerPayload));
  }

  const flaggedCount = norm.squad.filter(isFlagged).length;

  return {
    gameweek: norm.currentEventId,
    deadline_utc: norm.deadline,
    // No manager/team identity — deliberately.
    manager: {
      overall_rank: null as number | null,
      overall_points: null as number | null,
      last_gw_points: null as number | null,
    },
    bank_m: priceM(norm.bank),
    squad_value_m: priceM(norm.squadValue),
    free_transfers_est: norm.freeTransfers,
    active_chip: norm.activeChip ?? "none",
    flagged_players_in_squad: flaggedCount,
    league_context: league
      ? {
          tracked_rival_captains: league.rivals
            .map((r) => r.captainName)
            .filter((n): n is string => n !== null),
          squad_overlap_with_rivals: league.rivals.map((r) => r.overlap),
          differential_candidate: league.differentialName,
          differential_ownership_pct: league.differentialOwnership,
        }
      : null,
    squad: norm.squad.map(playerPayload),
    transfer_candidates: candidates,
  };
}

export type ReportInput = ReturnType<typeof buildReportInput>;
