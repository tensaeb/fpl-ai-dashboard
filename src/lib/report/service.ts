import { db, dbAvailable } from "@/db";
import { entries, reports } from "@/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import type { DashboardBundle } from "../fpl/client";
import type { NormalizedData } from "../fpl/normalize";
import { buildEngineReport } from "./engine";
import { guardReport } from "./guard";
import { buildReportInput } from "./input";
import { generateWithAI, llmAvailable } from "./llm";
import { buildLeagueContext, type LeagueContext } from "./rivals";
import type { Report } from "./types";

export interface StoredReport {
  id: number;
  entryId: number;
  gameweek: number;
  confidence: string;
  engine: string;
  createdAt: string;
  payload: Report;
}

function toStored(row: typeof reports.$inferSelect): StoredReport {
  return {
    id: row.id,
    entryId: row.entryId,
    gameweek: row.gameweek,
    confidence: row.confidence,
    engine: row.engine,
    createdAt: row.createdAt.toISOString(),
    payload: row.payload as Report,
  };
}

function ephemeral(entryId: number, report: Report, engine: string): StoredReport {
  return {
    id: -1,
    entryId,
    gameweek: report.gameweek,
    confidence: report.confidence,
    engine,
    createdAt: new Date().toISOString(),
    payload: report,
  };
}

export async function upsertEntry(bundle: DashboardBundle): Promise<void> {
  if (!dbAvailable()) return;
  try {
    const values = {
      entryId: bundle.entryId,
      playerName: `${bundle.entry.player_first_name} ${bundle.entry.player_last_name}`.trim(),
      teamName: bundle.entry.name,
      overallRank: bundle.entry.summary_overall_rank,
      mode: bundle.mode,
      lastSyncedAt: new Date(),
    };
    await db
      .insert(entries)
      .values(values)
      .onConflictDoUpdate({
        target: entries.entryId,
        set: {
          playerName: sql`excluded.player_name`,
          teamName: sql`excluded.team_name`,
          overallRank: sql`excluded.overall_rank`,
          mode: sql`excluded.mode`,
          lastSyncedAt: sql`excluded.last_synced_at`,
        },
      });
  } catch {
    /* non-fatal — the dashboard still renders without persistence */
  }
}

export async function latestReport(entryId: number, gameweek: number): Promise<StoredReport | null> {
  if (!dbAvailable()) return null;
  try {
    const rows = await db
      .select()
      .from(reports)
      .where(and(eq(reports.entryId, entryId), eq(reports.gameweek, gameweek)))
      .orderBy(desc(reports.createdAt))
      .limit(1);
    return rows[0] ? toStored(rows[0]) : null;
  } catch {
    return null;
  }
}

export async function listReportHistory(entryId: number, limit = 12): Promise<StoredReport[]> {
  if (!dbAvailable()) return [];
  try {
    const rows = await db
      .select()
      .from(reports)
      .where(eq(reports.entryId, entryId))
      .orderBy(desc(reports.createdAt))
      .limit(limit);
    return rows.map(toStored);
  } catch {
    return [];
  }
}

export async function listTrackedEntries(limit = 50): Promise<Array<{ entryId: number; mode: string; teamName: string }>> {
  if (!dbAvailable()) return [];
  try {
    const rows = await db
      .select({ entryId: entries.entryId, mode: entries.mode, teamName: entries.teamName })
      .from(entries)
      .orderBy(desc(entries.lastSyncedAt))
      .limit(limit);
    return rows;
  } catch {
    return [];
  }
}

async function persist(entryId: number, report: Report, engine: string): Promise<StoredReport | null> {
  if (!dbAvailable()) return null;
  try {
    const inserted = await db
      .insert(reports)
      .values({ entryId, gameweek: report.gameweek, payload: report, confidence: report.confidence, engine })
      .returning();
    return inserted[0] ? toStored(inserted[0]) : null;
  } catch {
    return null;
  }
}

/** First-load path: serve stored report, else generate instantly (rules). */
export async function getOrCreateReport(
  bundle: DashboardBundle,
  norm: NormalizedData,
): Promise<StoredReport | null> {
  const existing = await latestReport(bundle.entryId, norm.currentEventId);
  if (existing) return existing;
  const league = await buildLeagueContext(bundle, norm).catch(() => null);
  const report = buildEngineReport(bundle, norm, league);
  const stored = await persist(bundle.entryId, report, "rules-engine");
  return stored ?? ephemeral(bundle.entryId, report, "rules-engine");
}

/**
 * Explicit regeneration (button + cron). Tries Gemini then Claude; the stored
 * engine is decided by *what actually survived validation* — never
 * re-derived from whether a key happens to be configured (review #2).
 * LLM output is also rejected if it violates the hard availability
 * filter or affordability in code (review #3).
 */
export async function regenerateReport(
  bundle: DashboardBundle,
  norm: NormalizedData,
): Promise<{ report: StoredReport; engine: string; claudeRejectedReason?: string }> {
  const league: LeagueContext | null = await buildLeagueContext(bundle, norm).catch(() => null);
  let payload: Report | null = null;
  let engine = "rules-engine";
  let claudeRejectedReason: string | undefined;

  if (llmAvailable()) {
    const viaLlm = await generateWithAI(buildReportInput(norm, league));
    if (viaLlm) {
      const guard = guardReport(viaLlm.report, norm.pool, norm.bank);
      if (guard.ok) {
        payload = viaLlm.report;
        engine = viaLlm.provider;
      } else {
        claudeRejectedReason = guard.reason;
        console.warn(`[report] ${viaLlm.provider} output rejected by guard: ${guard.reason}`);
      }
    }
  }

  if (!payload) payload = buildEngineReport(bundle, norm, league);
  const stored = await persist(bundle.entryId, payload, engine);
  return {
    report: stored ?? ephemeral(bundle.entryId, payload, engine),
    engine,
    claudeRejectedReason,
  };
}
