import { db } from "@/db";
import { fplCache } from "@/db/schema";
import { eq } from "drizzle-orm";
import { buildDemoData } from "./demo";
import type {
  Bootstrap,
  EntryCore,
  EntryHistory,
  FplFixture,
  LeagueStandings,
  PicksData,
  TransferRecord,
} from "./types";
import { EntryNotFoundError } from "./types";

const BASE = "https://fantasy.premierleague.com/api";

/** Self-imposed outbound TTLs so we never hammer the unofficial API. */
const MIN = 60_000;
const TTL = {
  bootstrap: 30 * MIN,
  fixtures: 30 * MIN,
  entry: 5 * MIN,
  picks: 2 * MIN,
  history: 15 * MIN,
  transfers: 15 * MIN,
  league: 30 * MIN,
};

async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const rows = await db
      .select()
      .from(fplCache)
      .where(eq(fplCache.key, key))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    if (new Date(row.expiresAt).getTime() < Date.now()) return null;
    return row.payload as T;
  } catch {
    return null; // cache is an optimisation, never a failure mode
  }
}

async function cacheSet(key: string, payload: unknown, ttlMs: number): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + ttlMs);
    await db
      .insert(fplCache)
      .values({ key, payload: payload as object, expiresAt })
      .onConflictDoUpdate({ target: fplCache.key, set: { payload: payload as object, expiresAt } });
  } catch {
    /* non-fatal */
  }
}

async function fplGet<T>(path: string, ttlMs: number): Promise<T> {
  const key = `fpl:${path}`;
  const hit = await cacheGet<T>(key);
  if (hit !== null) return hit;

  const res = await fetch(`${BASE}${path}`, {
    cache: "no-store",
    signal: AbortSignal.timeout(9_000),
    headers: {
      "User-Agent": "fpl-ai-dashboard/1.0 (+public-data-client)",
      Accept: "application/json",
    },
  });
  if (res.status === 404) throw new EntryNotFoundError(-1);
  if (!res.ok) throw new Error(`FPL ${path} responded ${res.status}`);
  const data = (await res.json()) as T;
  await cacheSet(key, data, ttlMs);
  return data;
}

export interface DashboardBundle {
  mode: "live" | "demo";
  /** Set when the demo dataset is standing in for a failed live fetch. */
  fallbackReason: string | null;
  entryId: number;
  bootstrap: Bootstrap;
  fixtures: FplFixture[];
  entry: EntryCore;
  picks: PicksData;
  history: EntryHistory | null;
  transfers: TransferRecord[];
  leagues: LeagueStandings[];
  currentEventId: number;
  fetchedAt: string;
}

function resolveCurrentEvent(bootstrap: Bootstrap): number {
  const cur = bootstrap.events.find((e) => e.is_current);
  if (cur) return cur.id;
  const nxt = bootstrap.events.find((e) => e.is_next);
  if (nxt) return Math.max(1, nxt.id - 1);
  const finished = bootstrap.events.filter((e) => e.finished).map((e) => e.id);
  return finished.length ? Math.max(...finished) : 1;
}

async function liveBundle(entryId: number): Promise<DashboardBundle> {
  const [bootstrap, fixtures, entry] = await Promise.all([
    fplGet<Bootstrap>("/bootstrap-static/", TTL.bootstrap),
    fplGet<FplFixture[]>("/fixtures/", TTL.fixtures),
    fplGet<EntryCore>(`/entry/${entryId}/`, TTL.entry).catch((e) => {
      if (e instanceof EntryNotFoundError) throw new EntryNotFoundError(entryId);
      throw e;
    }),
  ]);

  const currentEventId = resolveCurrentEvent(bootstrap);

  let picks: PicksData | null = null;
  for (const gw of [currentEventId, currentEventId - 1]) {
    if (gw < 1) continue;
    try {
      picks = await fplGet<PicksData>(`/entry/${entryId}/event/${gw}/picks/`, TTL.picks);
      break;
    } catch {
      /* try previous gw */
    }
  }
  if (!picks) throw new Error("Picks unavailable for this entry");

  const [history, transfers] = await Promise.all([
    fplGet<EntryHistory>(`/entry/${entryId}/history/`, TTL.history).catch(() => null),
    fplGet<TransferRecord[]>(`/entry/${entryId}/transfers/`, TTL.transfers).catch(() => [] as TransferRecord[]),
  ]);

  const leagueRefs = (entry.leagues?.classic ?? []).slice(0, 2);
  const leagues = (
    await Promise.all(
      leagueRefs.map((l) =>
        fplGet<LeagueStandings>(`/leagues-classic/${l.id}/standings/?page_standings=1`, TTL.league).catch(
          () => null,
        ),
      ),
    )
  ).filter((l): l is LeagueStandings => l !== null);

  return {
    mode: "live",
    fallbackReason: null,
    entryId,
    bootstrap,
    fixtures,
    entry,
    picks,
    history,
    transfers,
    leagues,
    currentEventId,
    fetchedAt: new Date().toISOString(),
  };
}

/** Live first; demo dataset as a resilience fallback (or when forced). */
export async function getDashboardBundle(entryId: number, forceDemo = false): Promise<DashboardBundle> {
  if (forceDemo) {
    const d = buildDemoData(entryId);
    return {
      mode: "demo",
      fallbackReason: null,
      entryId,
      bootstrap: d.bootstrap,
      fixtures: d.fixtures,
      entry: d.entry,
      picks: d.picks,
      history: null,
      transfers: d.transfers,
      leagues: d.leagues,
      currentEventId: d.currentEvent,
      fetchedAt: new Date().toISOString(),
    };
  }
  try {
    return await liveBundle(entryId);
  } catch (e) {
    if (e instanceof EntryNotFoundError) throw new EntryNotFoundError(entryId);
    const reason = e instanceof Error ? e.message : "live fetch failed";
    const demo = await getDashboardBundle(entryId, true);
    return { ...demo, fallbackReason: reason };
  }
}

/** Small cached public-data helpers reused by accounts, cron and scoring. */
export const getPublicBootstrap = () => fplGet<Bootstrap>("/bootstrap-static/", TTL.bootstrap);

export const getPublicEntry = (entryId: number) =>
  fplGet<EntryCore>(`/entry/${entryId}/`, TTL.entry).catch((e) => {
    if (e instanceof EntryNotFoundError) throw new EntryNotFoundError(entryId);
    throw e;
  });

export const getPublicPicks = (entryId: number, gw: number) =>
  fplGet<PicksData>(`/entry/${entryId}/event/${gw}/picks/`, TTL.picks);

export interface ElementSummary {
  history: Array<{ round: number; total_points: number }>;
}

export const getElementSummary = (playerId: number) =>
  fplGet<ElementSummary>(`/element-summary/${playerId}/`, 24 * MIN);

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
