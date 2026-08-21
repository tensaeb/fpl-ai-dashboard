import { getDashboardBundle } from "../fpl/client";
import { normalizeBundle } from "../fpl/normalize";
import { sendBriefDigest } from "../notify";
import { scorePendingOutcomes } from "../report/outcomes";
import { latestReport, listTrackedEntries, regenerateReport } from "../report/service";

/**
 * Weekly-ish cron body (Vercel Cron → GET /api/cron/run, or any scheduler).
 * For every tracked entry: if the current-GW report is missing or stale and
 * the deadline is near, regenerate server-side, email subscribers, then
 * score finished gameweeks against actual points.
 *
 * Idempotent by design: the 20h staleness gate means repeated daily
 * invocation won't re-spend on the LLM for the same entry. A daily cadence
 * always lands inside the 30h pre-deadline window (window > 24h gap), so a
 * once-per-day Hobby-compatible schedule still regenerates before kickoff.
 */

const STALE_MS = 20 * 3600 * 1000;
const DEADLINE_WINDOW_MS = 30 * 3600 * 1000; // regenerate inside the final ~30h

export interface CronResult {
  action: "generated" | "skipped-fresh" | "skipped-window" | "error";
  entryId: number;
  engine?: string;
  notified?: number;
  mailer?: string;
}

export async function runWeeklyJob(origin: string): Promise<{
  results: CronResult[];
  scoredOutcomes: number;
  ranAt: string;
}> {
  const tracked = await listTrackedEntries(50);
  const results: CronResult[] = [];

  for (const t of tracked) {
    try {
      const bundle = await getDashboardBundle(t.entryId, t.mode === "demo");
      const norm = normalizeBundle(bundle);
      const existing = await latestReport(t.entryId, norm.currentEventId);
      const fresh =
        existing !== null && Date.now() - new Date(existing.createdAt).getTime() < STALE_MS;

      if (fresh) {
        results.push({ action: "skipped-fresh", entryId: t.entryId });
        continue;
      }
      const deadline = norm.deadline ? new Date(norm.deadline).getTime() : null;
      const inWindow = deadline === null || deadline - Date.now() < DEADLINE_WINDOW_MS;
      if (!inWindow && existing) {
        results.push({ action: "skipped-window", entryId: t.entryId });
        continue;
      }

      const { report, engine } = await regenerateReport(bundle, norm);
      const digest = await sendBriefDigest({
        entryId: t.entryId,
        teamName: bundle.entry.name,
        report: report.payload,
        dashboardUrl: `${origin}/dashboard/${bundle.mode === "demo" ? "demo" : t.entryId}`,
      });
      results.push({
        action: "generated",
        entryId: t.entryId,
        engine,
        notified: digest.notified,
        mailer: digest.status,
      });
    } catch {
      results.push({ action: "error", entryId: t.entryId });
    }
  }

  const scoredOutcomes = await scorePendingOutcomes(10);
  return { results, scoredOutcomes, ranAt: new Date().toISOString() };
}
