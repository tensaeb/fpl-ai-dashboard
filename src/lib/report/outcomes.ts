import { db, dbAvailable } from "@/db";
import { entries, reportOutcomes, reports } from "@/db/schema";
import { desc, eq, isNull, sql } from "drizzle-orm";
import { getElementSummary, getPublicBootstrap, getPublicPicks } from "../fpl/client";
import { buildDemoData, mulberry32 } from "../fpl/demo";
import { resolvePoolPlayer } from "./guard";
import type { NormalizedPlayer } from "../fpl/normalize";
import { normalizeBundle } from "../fpl/normalize";
import type { Report } from "./types";

export interface TransferDelta {
  out: string;
  in: string;
  inPts: number;
  outPts: number;
  delta: number;
}

export interface OutcomeRow {
  reportId: number;
  gameweek: number;
  engine: string;
  captainPts: number | null;
  captainBestPts: number | null;
  captainHit: boolean | null;
  transferDeltas: TransferDelta[];
  scoredAt: string;
  reportCreatedAt: string;
  confidence: string;
}

/** Deterministic "actual" points for demo data — per (gw, player). */
function demoPoints(gw: number, playerId: number, elementType: number): number {
  const rng = mulberry32(gw * 1_000_003 + playerId * 9_176);
  const base = rng() * rng() * (elementType >= 3 ? 16 : 11);
  return Math.round(base);
}

async function livePoints(playerId: number, gw: number): Promise<number | null> {
  try {
    const summary = await getElementSummary(playerId);
    return summary.history.find((h) => h.round === gw)?.total_points ?? null;
  } catch {
    return null;
  }
}

async function starterIds(entryId: number, gw: number, demo: boolean): Promise<number[]> {
  if (demo) {
    const d = buildDemoData(entryId);
    return d.picks.picks.filter((p) => p.multiplier > 0).map((p) => p.element);
  }
  try {
    const picks = await getPublicPicks(entryId, gw);
    return picks.picks.filter((p) => p.multiplier > 0).map((p) => p.element);
  } catch {
    return [];
  }
}

/**
 * Accuracy tracking (roadmap Phase 2). For every persisted report whose
 * gameweek has finished, score the captain call against the actually-best
 * captain in that XI, and score each suggested transfer as inPts − outPts
 * over that gameweek. Results land in report_outcomes for the UI + future
 * prompt A/B work.
 */
export async function scorePendingOutcomes(limit = 10): Promise<number> {
  if (!dbAvailable()) return 0;
  let scored = 0;
  try {
    const pending = await db
      .select({
        id: reports.id,
        entryId: reports.entryId,
        gameweek: reports.gameweek,
        engine: reports.engine,
        payload: reports.payload,
        mode: entries.mode,
      })
      .from(reports)
      .leftJoin(reportOutcomes, eq(reportOutcomes.reportId, reports.id))
      .leftJoin(entries, eq(entries.entryId, reports.entryId))
      .where(isNull(reportOutcomes.id))
      .orderBy(desc(reports.createdAt))
      .limit(limit * 3);

    const finished = new Set<number>();
    try {
      const bootstrap = await getPublicBootstrap();
      bootstrap.events.filter((e) => e.finished).forEach((e) => finished.add(e.id));
    } catch {
      /* live bootstrap down — demo rows can still be scored below */
    }

    for (const row of pending) {
      if (scored >= limit) break;
      const report = row.payload as Report;
      const demo = row.mode === "demo";
      if (!demo && !finished.has(row.gameweek)) continue;

      // Resolve player ids with a light pool (name fallback for LLM rows).
      const d = buildDemoData(row.entryId);
      const pool: NormalizedPlayer[] = demo
        ? normalizeBundle({
            mode: "demo", fallbackReason: null, entryId: row.entryId,
            bootstrap: d.bootstrap, fixtures: d.fixtures, entry: d.entry,
            picks: d.picks, history: null, transfers: [], leagues: [],
            currentEventId: d.currentEvent, fetchedAt: "",
          }).pool
        : [];
      const resolve = (id: number | undefined, name: string): number | null =>
        id ?? (demo ? (resolvePoolPlayer(pool, id, name)?.id ?? null) : null);

      const capId = resolve(report.captain_suggestion.playerId, report.captain_suggestion.player);
      if (capId == null) continue;
      const ids = await starterIds(row.entryId, row.gameweek, demo);
      if (!ids.length) continue;

      const pointsById = new Map<number, number>();
      for (const pid of ids) {
        const pts = demo
          ? demoPoints(row.gameweek, pid, d.bootstrap.elements.find((e) => e.id === pid)?.element_type ?? 3)
          : await livePoints(pid, row.gameweek);
        if (pts == null) continue; // later retry
        pointsById.set(pid, pts);
      }
      if (!pointsById.has(capId)) continue;

      const starterPts = [...pointsById.values()].sort((a, b) => b - a);
      const capRaw = pointsById.get(capId) ?? 0;
      const captainPts = capRaw * 2;
      const captainBestPts = (starterPts[0] ?? 0) * 2;
      const thirdBest = starterPts[2] ?? 0;

      const transferDeltas: TransferDelta[] = [];
      for (const t of report.transfer_suggestions) {
        const inId = resolve(t.inId, t.in);
        const outId = resolve(t.outId, t.out);
        if (inId == null || outId == null) continue;
        const inPts = demo
          ? demoPoints(row.gameweek, inId, d.bootstrap.elements.find((e) => e.id === inId)?.element_type ?? 3)
          : await livePoints(inId, row.gameweek);
        const outPts = demo
          ? demoPoints(row.gameweek, outId, d.bootstrap.elements.find((e) => e.id === outId)?.element_type ?? 3)
          : await livePoints(outId, row.gameweek);
        if (inPts == null || outPts == null) continue;
        transferDeltas.push({ out: t.out, in: t.in, inPts, outPts, delta: inPts - outPts });
      }

      await db.insert(reportOutcomes).values({
        reportId: row.id,
        entryId: row.entryId,
        gameweek: row.gameweek,
        engine: row.engine,
        captainPts,
        captainBestPts,
        captainHit: capRaw >= thirdBest ? "yes" : "no",
        transferDeltas: transferDeltas as unknown as object,
      });
      scored += 1;
    }
  } catch {
    /* non-fatal — cron continues */
  }
  return scored;
}

export async function listOutcomes(entryId: number, limit = 10): Promise<OutcomeRow[]> {
  if (!dbAvailable()) return [];
  try {
    const rows = await db
      .select({
        reportId: reportOutcomes.reportId,
        gameweek: reportOutcomes.gameweek,
        engine: reportOutcomes.engine,
        captainPts: reportOutcomes.captainPts,
        captainBestPts: reportOutcomes.captainBestPts,
        captainHit: reportOutcomes.captainHit,
        transferDeltas: reportOutcomes.transferDeltas,
        scoredAt: reportOutcomes.scoredAt,
        reportCreatedAt: reports.createdAt,
        confidence: reports.confidence,
      })
      .from(reportOutcomes)
      .innerJoin(reports, eq(reports.id, reportOutcomes.reportId))
      .where(eq(reportOutcomes.entryId, entryId))
      .orderBy(desc(reportOutcomes.scoredAt))
      .limit(limit);
    return rows.map((r) => ({
      reportId: r.reportId,
      gameweek: r.gameweek,
      engine: r.engine,
      captainPts: r.captainPts,
      captainBestPts: r.captainBestPts,
      captainHit: r.captainHit === "yes" ? true : r.captainHit === "no" ? false : null,
      transferDeltas: (r.transferDeltas as TransferDelta[] | null) ?? [],
      scoredAt: r.scoredAt.toISOString(),
      reportCreatedAt: r.reportCreatedAt.toISOString(),
      confidence: r.confidence ?? "low",
    }));
  } catch {
    return [];
  }
}
