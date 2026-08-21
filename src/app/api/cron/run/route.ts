import { runWeeklyJob } from "@/lib/jobs/weekly";
import { requestOrigin } from "@/lib/origin";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Scheduled weekly report generation + accuracy scoring.
 *
 * Invocation contract:
 *  - With CRON_SECRET set: requires `Authorization: Bearer <CRON_SECRET>`
 *    (Vercel Cron sends this automatically) or `?secret=<CRON_SECRET>`.
 *  - Without CRON_SECRET: runs in open mode so the flow is demonstrable,
 *    and the response says so loudly. Set the secret before going public.
 *
 * The job itself is idempotent (20h staleness gate per entry), so hourly
 * scheduling does not multiply LLM spend.
 */
async function handle(req: Request) {
  const expected = process.env.CRON_SECRET;
  const provided =
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    new URL(req.url).searchParams.get("secret") ??
    "";

  if (expected && provided !== expected) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const summary = await runWeeklyJob(requestOrigin(req));
  return NextResponse.json({
    ok: true,
    guard: expected ? "cron-secret" : "open-no-secret-set",
    ...summary,
  });
}

export { handle as GET, handle as POST };
