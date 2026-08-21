import type { DashboardBundle } from "./client";
import type { FplPlayer, FplTeam } from "./types";
import { positionName, statusLabel, type PositionName } from "../format";

export interface TeamFixture {
  gw: number | null;
  vs: string;
  vsTeamId: number;
  home: boolean;
  difficulty: number;
  kickoff: string | null;
}

export interface NormalizedPlayer {
  id: number;
  name: string;
  teamId: number;
  teamShort: string;
  position: PositionName;
  elementType: number;
  price: number; // £0.1m units
  form: number;
  ppg: number;
  totalPoints: number;
  ownership: number; // %
  minutes: number;
  status: "available" | "injured" | "suspended" | "doubtful" | "unavailable";
  statusCode: string;
  chanceOfPlaying: number | null;
  news: string;
  code: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  nextFixtures: TeamFixture[];
  avgDiffNext5: number;
  pickPosition: number | null;
  isStarter: boolean;
  isCaptain: boolean;
  isViceCaptain: boolean;
  multiplier: number;
}

export interface NormalizedData {
  currentEventId: number;
  deadline: string | null;
  squad: NormalizedPlayer[];
  pool: NormalizedPlayer[];
  teams: Array<{ id: number; name: string; short: string }>;
  fixturesByTeam: Record<number, TeamFixture[]>;
  freeTransfers: number;
  bank: number; // £0.1m
  squadValue: number;
  activeChip: string | null;
}

export function isFlagged(p: NormalizedPlayer): boolean {
  if (p.status !== "available") return true;
  if (p.chanceOfPlaying != null && p.chanceOfPlaying <= 75) return true;
  return false;
}

/**
 * Short-horizon score — recent form + single-fixture difficulty dominate.
 * Used for the captaincy (armband) decision.
 */
export function captainScore(p: NormalizedPlayer): number {
  if (isFlagged(p)) return -Infinity;
  const next = p.nextFixtures[0];
  if (!next) return p.form + p.ppg;
  return (
    p.form * 2.2 +
    (5 - next.difficulty) * 1.6 +
    p.ppg * 1.2 +
    (next.home ? 0.6 : 0) +
    Math.min(p.minutes, 1500) / 1500
  );
}

/**
 * Medium-horizon score — next-5 fixture run + price efficiency dominate.
 * Used to rank transfer-in candidates.
 */
export function candidateScore(p: NormalizedPlayer, currentEvent: number): number {
  if (isFlagged(p)) return -Infinity;
  const runBoost = (5 - p.avgDiffNext5) * 2.2;
  const minutesCap = 250 * Math.max(1, currentEvent);
  const minutesFactor = Math.min(p.minutes, minutesCap) / minutesCap;
  return p.form * 1.2 + p.ppg * 1.8 + runBoost + minutesFactor * 1.4 + p.totalPoints / 200;
}

/** How dispensable a squad player is — low form + brutal run + flagged. */
export function outScore(p: NormalizedPlayer): number {
  let s = p.form * 1.4 + (5 - p.avgDiffNext5) * 1.8 + p.ppg * 1.1;
  if (isFlagged(p)) s -= 12; // injured/suspended assets head the transfer-out queue
  return s;
}

/** Estimate banked free transfers from the event history (FPL allows up to 5). */
export function estimateFreeTransfers(bundle: DashboardBundle): number {
  const finished = (bundle.history?.current ?? [])
    .filter((r) => r.event < bundle.currentEventId)
    .sort((a, b) => b.event - a.event);
  let bonus = 0;
  for (const row of finished) {
    if (row.event_transfers === 0 && bonus < 4) bonus += 1;
    else break;
  }
  const made = bundle.picks.entry_history.event_transfers ?? 0;
  return Math.max(0, Math.min(5, 1 + bonus - made));
}

export function normalizeBundle(bundle: DashboardBundle): NormalizedData {
  const { bootstrap, fixtures, picks, currentEventId } = bundle;

  // team lookup
  const teamsById = new Map<number, FplTeam>();
  bootstrap.teams.forEach((t) => teamsById.set(t.id, t));

  // future fixtures per team (sorted by event, then kickoff)
  const fixturesByTeam: Record<number, TeamFixture[]> = {};
  bootstrap.teams.forEach((t) => (fixturesByTeam[t.id] = []));

  fixtures
    .filter((f) => !f.finished && (f.event == null || f.event >= currentEventId))
    .sort((a, b) => (a.event ?? 99) - (b.event ?? 99))
    .forEach((f) => {
      const hTeam = teamsById.get(f.team_h);
      const aTeam = teamsById.get(f.team_a);
      if (!hTeam || !aTeam) return;

      fixturesByTeam[f.team_h]?.push({
        gw: f.event,
        vs: aTeam.short_name,
        vsTeamId: aTeam.id,
        home: true,
        difficulty: f.team_h_difficulty,
        kickoff: f.kickoff_time,
      });

      fixturesByTeam[f.team_a]?.push({
        gw: f.event,
        vs: hTeam.short_name,
        vsTeamId: hTeam.id,
        home: false,
        difficulty: f.team_a_difficulty,
        kickoff: f.kickoff_time,
      });
    });

  // player index
  const pickMap = new Map<number, (typeof picks.picks)[number]>();
  picks.picks.forEach((p) => pickMap.set(p.element, p));

  const normalizePlayer = (raw: FplPlayer, isSquad: boolean): NormalizedPlayer => {
    const pick = pickMap.get(raw.id);
    const team = teamsById.get(raw.team);
    const teamShort = team?.short_name ?? "UNK";
    const status = statusLabel(raw.status, raw.chance_of_playing_next_round);

    const nextFixtures = fixturesByTeam[raw.team] ?? [];
    const next5 = nextFixtures.slice(0, 5);
    const avgDiffNext5 =
      next5.length > 0 ? next5.reduce((s, f) => s + f.difficulty, 0) / next5.length : 3;

    return {
      id: raw.id,
      name: raw.web_name,
      teamId: raw.team,
      teamShort,
      position: positionName(raw.element_type),
      elementType: raw.element_type,
      price: raw.now_cost,
      form: parseFloat(raw.form) || 0,
      ppg: parseFloat(raw.points_per_game) || 0,
      totalPoints: raw.total_points,
      ownership: parseFloat(raw.selected_by_percent) || 0,
      minutes: raw.minutes,
      status,
      statusCode: raw.status,
      chanceOfPlaying: raw.chance_of_playing_next_round,
      news: raw.news || "",
      code: raw.code,
      goals: raw.goals_scored ?? 0,
      assists: raw.assists ?? 0,
      cleanSheets: raw.clean_sheets ?? 0,
      nextFixtures,
      avgDiffNext5,
      pickPosition: pick?.position ?? null,
      isStarter: pick ? pick.position <= 11 : false,
      isCaptain: pick ? pick.is_captain : false,
      isViceCaptain: pick ? pick.is_vice_captain : false,
      multiplier: pick ? pick.multiplier : isSquad ? 1 : 0,
    };
  };

  const pool = bootstrap.elements.map((p) => normalizePlayer(p, false));

  // squad is ordered by starter (1..11) then bench (12..15)
  const squad = picks.picks
    .map((pk) => {
      const raw = bootstrap.elements.find((e) => e.id === pk.element);
      if (!raw) return null;
      return normalizePlayer(raw, true);
    })
    .filter((p): p is NormalizedPlayer => p !== null)
    .sort((a, b) => {
      const posA = pickMap.get(a.id)?.position ?? 99;
      const posB = pickMap.get(b.id)?.position ?? 99;
      return posA - posB;
    });

  const event = bootstrap.events.find((e) => e.id === currentEventId);

  return {
    currentEventId,
    deadline: event?.deadline_time ?? null,
    squad,
    pool,
    teams: bootstrap.teams.map((t) => ({ id: t.id, name: t.name, short: t.short_name })),
    fixturesByTeam,
    freeTransfers: estimateFreeTransfers(bundle),
    bank: picks.entry_history.bank ?? 0,
    squadValue: picks.entry_history.value ?? 0,
    activeChip: picks.active_chip ?? null,
  };
}
