/** TypeScript shapes for the public, undocumented FPL endpoints. */

export interface FplEvent {
  id: number;
  name: string;
  deadline_time: string;
  is_current: boolean;
  is_next: boolean;
  finished: boolean;
  average_entry_score: number | null;
  highest_score?: number | null;
}

export interface FplTeam {
  id: number;
  name: string;
  short_name: string;
  code?: number;
}

export interface FplPlayer {
  id: number;
  web_name: string;
  first_name: string;
  second_name: string;
  team: number;
  element_type: number; // 1 GK, 2 DEF, 3 MID, 4 FWD
  now_cost: number; // in £0.1m units
  form: string;
  points_per_game: string;
  total_points: number;
  selected_by_percent: string;
  minutes: number;
  status: string; // 'a' available, 'i' injured, 's' suspended, 'd' doubtful
  news: string;
  chance_of_playing_this_round: number | null;
  chance_of_playing_next_round: number | null;
  code: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
}

export interface Bootstrap {
  events: FplEvent[];
  teams: FplTeam[];
  elements: FplPlayer[];
}

export interface FplFixture {
  id: number;
  event: number | null;
  team_h: number;
  team_a: number;
  team_h_difficulty: number;
  team_a_difficulty: number;
  kickoff_time: string | null;
  finished: boolean;
  team_h_score: number | null;
  team_a_score: number | null;
}

export interface ClassicLeagueRef {
  id: number;
  name: string;
  entry_rank?: number | null;
}

export interface H2hLeagueRef {
  id: number;
  name: string;
  entry_rank?: number | null;
}

export interface EntryCore {
  id: number;
  player_first_name: string;
  player_last_name: string;
  name: string; // team name
  summary_overall_points: number | null;
  summary_overall_rank: number | null;
  summary_event_points: number | null;
  current_event: number | null;
  leagues?: { classic?: ClassicLeagueRef[]; h2h?: H2hLeagueRef[] };
}

export interface Pick {
  element: number;
  position: number;
  is_captain: boolean;
  is_vice_captain: boolean;
  multiplier: number;
}

export interface PicksEntryHistory {
  event: number;
  points: number;
  total_points: number;
  overall_rank: number;
  rank: number;
  bank: number;
  value: number;
  event_transfers: number;
  event_transfers_cost: number;
  points_on_bench: number;
}

export interface PicksData {
  active_chip: string | null;
  picks: Pick[];
  entry_history: PicksEntryHistory;
}

export interface TransferRecord {
  element_in: number;
  element_out: number;
  event: number;
  element_in_cost: number;
  element_out_cost: number;
}

export interface EntryHistoryEvent {
  event: number;
  points: number;
  total_points: number;
  overall_rank: number;
  bank: number;
  value: number;
  event_transfers: number;
}

export interface EntryHistory {
  current: EntryHistoryEvent[];
}

export interface StandingRow {
  id: number;
  entry: number;
  entry_name: string;
  player_name: string;
  rank: number;
  last_rank: number;
  total: number;
  event_total: number;
}

export interface LeagueStandings {
  kind: "classic" | "h2h";
  league: { id: number; name: string };
  standings: { has_next: boolean; page: number; results: StandingRow[] };
}

export class EntryNotFoundError extends Error {
  constructor(public readonly entryId: number) {
    super(`Entry ${entryId} not found`);
    this.name = "EntryNotFoundError";
  }
}
