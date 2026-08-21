import type {
  Bootstrap,
  EntryCore,
  FplEvent,
  FplFixture,
  FplPlayer,
  FplTeam,
  LeagueStandings,
  PicksData,
  TransferRecord,
} from "./types";

/**
 * Deterministic, self-contained dataset that mirrors the shape of the real
 * FPL API. Used when fantasy.premierleague.com is unreachable and for the
 * public "demo squad". Everything is seeded so renders are stable.
 */

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TEAM_LIST: Array<[string, string]> = [
  ["Arsenal", "ARS"],
  ["Aston Villa", "AVL"],
  ["Bournemouth", "BOU"],
  ["Brentford", "BRE"],
  ["Brighton", "BHA"],
  ["Chelsea", "CHE"],
  ["Crystal Palace", "CRY"],
  ["Everton", "EVE"],
  ["Fulham", "FUL"],
  ["Liverpool", "LIV"],
  ["Man City", "MCI"],
  ["Man Utd", "MUN"],
  ["Newcastle", "NEW"],
  ["Nott'm Forest", "NFO"],
  ["Sunderland", "SUN"],
  ["Spurs", "TOT"],
  ["West Ham", "WHU"],
  ["Wolves", "WOL"],
  ["Burnley", "BUR"],
  ["Leeds", "LEE"],
];

const KEEPERS = ["Raya", "Ederson", "Alisson", "Pickford", "Martinez", "Onana", "Pope", "Flekken", "Henderson", "Sels"];

const SURNAMES = [
  "Silva", "Walker", "Stones", "Reid", "Konate", "Varane", "Burn", "Hall",
  "Mitchell", "Aina", "Porro", "Veltman", "Cash", "Konsa", "Bruno F.",
  "Saka-lite", "Palmer", "Foden", "Sarr", "Bowen", "Neto", "Gordon",
  "Diallo", "Mbeumo", "Kudus", "Rogers", "Iwobi", "Haaland", "Watkins",
  "Isak", "Cunha", "Jackson", "Wood", "Delap", "Joao Pedro", "Ekitike",
  "Strand L.", "Mateta", "Sarmiento", "Semenyo", "Wissa", "Calvert-L.",
];

const pick = <T,>(rng: () => number, arr: T[]): T => arr[Math.floor(rng() * arr.length)];

export interface DemoData {
  bootstrap: Bootstrap;
  fixtures: FplFixture[];
  entry: EntryCore;
  picks: PicksData;
  transfers: TransferRecord[];
  leagues: LeagueStandings[];
  currentEvent: number;
}

export function buildDemoData(entryId: number, now = new Date()): DemoData {
  const rng = mulberry32(1337 + entryId);

  // --- Season calendar: 38 gameweeks from mid-August -----------------------
  const seasonStart = new Date(
    Date.UTC(now.getUTCMonth() >= 6 ? now.getUTCFullYear() : now.getUTCFullYear() - 1, 7, 15, 10, 30),
  );
  const weekMs = 7 * 24 * 3600 * 1000;
  let currentEvent = Math.max(1, Math.floor((now.getTime() - seasonStart.getTime()) / weekMs) + 1);
  currentEvent = Math.min(38, Math.max(6, currentEvent)); // demo looks best mid-season

  const events: FplEvent[] = Array.from({ length: 38 }, (_, i) => {
    const id = i + 1;
    const deadline = new Date(seasonStart.getTime() + i * weekMs);
    return {
      id,
      name: `Gameweek ${id}`,
      deadline_time: deadline.toISOString(),
      is_current: id === currentEvent,
      is_next: id === currentEvent + 1,
      finished: id < currentEvent,
      average_entry_score: id < currentEvent ? 45 + Math.floor(rng() * 22) : null,
      highest_score: null,
    };
  });

  // --- Teams ----------------------------------------------------------------
  const teams: FplTeam[] = TEAM_LIST.map(([name, short], i) => ({
    id: i + 1,
    name,
    short_name: short,
    code: 100 + i,
  }));

  // --- Player pool (6 per team = 120) ---------------------------------------
  const elements: FplPlayer[] = [];
  let nextId = 1;
  const pushPlayer = (
    teamId: number,
    elementType: number,
    name: string,
    cost: number,
    form: number,
  ) => {
    const ppg = Math.max(0.5, form * 0.85 + rng() * 1.4);
    elements.push({
      id: nextId,
      web_name: name,
      first_name: name.split(" ")[0],
      second_name: name,
      team: teamId,
      element_type: elementType,
      now_cost: cost,
      form: form.toFixed(1),
      points_per_game: ppg.toFixed(1),
      total_points: Math.round(ppg * (currentEvent - 1) * (0.82 + rng() * 0.3)),
      selected_by_percent: (rng() * 42 + 0.4).toFixed(1),
      minutes: Math.round(900 + rng() * 1100),
      status: "a",
      news: "",
      chance_of_playing_this_round: null,
      chance_of_playing_next_round: null,
      code: 0,
      goals_scored: Math.round(rng() * (elementType >= 3 ? 9 : 2)),
      assists: Math.round(rng() * (elementType >= 3 ? 7 : 3)),
      clean_sheets: elementType <= 2 ? Math.round(rng() * 6) : 0,
    });
    nextId += 1;
  };

  teams.forEach((t) => {
    pushPlayer(t.id, 1, pick(rng, KEEPERS), 45 + Math.round(rng() * 10), 2.5 + rng() * 3.5);
    pushPlayer(t.id, 2, pick(rng, SURNAMES), 42 + Math.round(rng() * 28), 2.5 + rng() * 4);
    pushPlayer(t.id, 2, pick(rng, SURNAMES), 40 + Math.round(rng() * 22), 2 + rng() * 3.6);
    pushPlayer(t.id, 3, pick(rng, SURNAMES), 55 + Math.round(rng() * 75), 3 + rng() * 5.4);
    pushPlayer(t.id, 3, pick(rng, SURNAMES), 50 + Math.round(rng() * 50), 2.6 + rng() * 4.6);
    pushPlayer(t.id, 4, pick(rng, SURNAMES), 62 + Math.round(rng() * 82), 2.8 + rng() * 5.6);
  });

  // --- Squad selection (respects the 3-per-team rule) ----------------------
  const squadIds: number[] = [];
  const teamCount = new Map<number, number>();
  const tryAdd = (p: FplPlayer) => {
    if (squadIds.includes(p.id)) return false;
    const c = teamCount.get(p.team) ?? 0;
    if (c >= 3) return false;
    teamCount.set(p.team, c + 1);
    squadIds.push(p.id);
    return true;
  };
  const byPos = (et: number) =>
    elements.filter((p) => p.element_type === et).sort((a, b) => Number(b.form) - Number(a.form));

  const want: Array<[number, number]> = [[1, 2], [2, 5], [3, 5], [4, 3]]; // 15-man squad
  for (const [et, count] of want) {
    const pool = byPos(et);
    // mix top-form picks with a couple of deliberate duds for narrative
    let added = 0;
    for (const p of pool) {
      if (added >= count) break;
      const takeDud = added === count - 1; // last slot in each line = a struggler
      if (takeDud) {
        const dud = pool
          .slice()
          .reverse()
          .find((q) => !squadIds.includes(q.id) && (teamCount.get(q.team) ?? 0) < 3);
        if (dud) {
          added += tryAdd(dud) ? 1 : 0;
          continue;
        }
      }
      added += tryAdd(p) ? 1 : 0;
    }
  }

  // Inject availability drama: one doubtful, one injured bench piece
  const squadPlayers = squadIds.map((id) => elements.find((p) => p.id === id)!);
  const d = squadPlayers[9]; // a mid
  d.status = "d";
  d.chance_of_playing_next_round = 50;
  d.news = "Knock — 50% chance of playing";
  const inj = squadPlayers[13]; // a fwd on the bench
  inj.status = "i";
  inj.chance_of_playing_next_round = 0;
  inj.news = "Hamstring — expected back in 3 weeks";

  // --- Picks: 4-4-2 starters ------------------------------------------------
  const gk = squadPlayers.filter((p) => p.element_type === 1);
  const defs = squadPlayers.filter((p) => p.element_type === 2);
  const mids = squadPlayers.filter((p) => p.element_type === 3);
  const fwds = squadPlayers.filter((p) => p.element_type === 4);
  // 4-4-2 made of fit players first — flagged assets drop to the bench
  const take = (line: FplPlayer[], n: number) => {
    const fit = line.filter((p) => p.status === "a");
    const rest = line.filter((p) => p.status !== "a");
    return [...fit, ...rest].slice(0, n);
  };
  const starters = [...take(gk, 1), ...take(defs, 4), ...take(mids, 4), ...take(fwds, 2)];
  const bench = squadPlayers.filter((p) => !starters.includes(p));
  const sortedStarters = [...starters].sort((a, b) => Number(b.form) - Number(a.form));
  const captain = sortedStarters.find((p) => p.element_type >= 3) ?? sortedStarters[0];
  const vice = sortedStarters.find((p) => p !== captain && p.element_type >= 3) ?? sortedStarters[1];

  const picks: PicksData = {
    active_chip: null,
    picks: [...starters, ...bench].map((p, i) => ({
      element: p.id,
      position: i + 1,
      is_captain: p === captain,
      is_vice_captain: p === vice,
      multiplier: i < 11 ? (p === captain ? 2 : 1) : 0,
    })),
    entry_history: {
      event: currentEvent,
      points: 58 + Math.floor(rng() * 24),
      total_points: (currentEvent - 1) * 52 + Math.floor(rng() * 80),
      overall_rank: 180_000 + Math.floor(rng() * 900_000),
      rank: 200_000,
      bank: 3 + Math.floor(rng() * 40),
      value: 1000 + Math.floor(rng() * 60),
      event_transfers: 0,
      event_transfers_cost: 0,
      points_on_bench: Math.floor(rng() * 12),
    },
  };

  // --- Entry summary ---------------------------------------------------------
  const entry: EntryCore = {
    id: entryId,
    player_first_name: "Demo",
    player_last_name: "Manager",
    name: "Expected Goals FC",
    summary_overall_points: picks.entry_history.total_points,
    summary_overall_rank: picks.entry_history.overall_rank,
    summary_event_points: picks.entry_history.points,
    current_event: currentEvent,
    leagues: {
      classic: [
        { id: 90210, name: "The Spreadsheet Society", entry_rank: 3 },
        { id: 104729, name: "Sunday League Analysts", entry_rank: 7 },
      ],
    },
  };

  // --- Fixtures: rolling 6 gameweeks for every team --------------------------
  const fixtures: FplFixture[] = [];
  let fid = 1;
  for (let gw = currentEvent; gw < Math.min(38, currentEvent + 6); gw += 1) {
    const order = teams.map((t) => t.id);
    // seeded shuffle
    for (let i = order.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rng() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    for (let m = 0; m < 10; m += 1) {
      const home = order[m * 2];
      const away = order[m * 2 + 1];
      fixtures.push({
        id: fid,
        event: gw,
        team_h: home,
        team_a: away,
        team_h_difficulty: 2 + Math.floor(rng() * 4),
        team_a_difficulty: 2 + Math.floor(rng() * 4),
        kickoff_time: new Date(now.getTime() + (fid % 9) * 24 * 3600 * 1000).toISOString(),
        finished: false,
        team_h_score: null,
        team_a_score: null,
      });
      fid += 1;
    }
  }

  const transfers: TransferRecord[] = [];
  const leagues: LeagueStandings[] = (entry.leagues?.classic ?? []).map((l, li) => {
    const rr = mulberry32(555 + li);
    const rows = [
      { entry_name: "Expected Goals FC", player_name: "Demo Manager", entry: entryId, me: true, total: picks.entry_history.total_points },
      { entry_name: "Kane Will Win It", player_name: "Priya S.", entry: 991, total: picks.entry_history.total_points + 14 + Math.floor(rr() * 30) },
      { entry_name: "Loris Yamal", player_name: "Tom W.", entry: 992, total: picks.entry_history.total_points + 4 + Math.floor(rr() * 20) },
      { entry_name: "Slot Machine", player_name: "Zoe A.", entry: 993, total: picks.entry_history.total_points - 8 - Math.floor(rr() * 20) },
      { entry_name: "Diving AC", player_name: "Mo K.", entry: 994, total: picks.entry_history.total_points - 30 - Math.floor(rr() * 40) },
    ]
      .sort((a, b) => b.total - a.total)
      .map((r, i) => ({
        id: i + 1,
        entry: r.entry,
        entry_name: r.entry_name,
        player_name: r.player_name,
        rank: i + 1,
        last_rank: i + 1,
        total: r.total,
        event_total: 40 + Math.floor(rr() * 40),
      }));
    return {
      league: { id: l.id, name: l.name },
      standings: { has_next: false, page: 1, results: rows },
    };
  });

  return { bootstrap: { events, teams, elements }, fixtures, entry, picks, transfers, leagues, currentEvent };
}
