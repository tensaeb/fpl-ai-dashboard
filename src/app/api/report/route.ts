import { getDashboardBundle } from "@/lib/fpl/client";
import { normalizeBundle } from "@/lib/fpl/normalize";
import { EntryNotFoundError } from "@/lib/fpl/types";
import { acquireSlot, clientIp } from "@/lib/rateLimit";
import { listReportHistory, regenerateReport } from "@/lib/report/service";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Per-entry: one explicit regeneration every 5 minutes. Per-IP: one a minute. */
const ENTRY_COOLDOWN_MS = 5 * 60 * 1000;
const IP_COOLDOWN_MS = 60 * 1000;

/**
 * Explicit regeneration. This endpoint can trigger LLM spend, so it is
 * rate-limited server-side on two axes — entry AND caller IP — independent
 * of any client-side button state (review finding #1).
 */
export async function POST(req: Request) {
  let body: { entryId?: unknown; demo?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }
  const id = Number(body.entryId);
  if (!Number.isInteger(id) || id < 0 || id > 99_999_999) {
    return NextResponse.json({ ok: false, error: "Invalid entry id" }, { status: 400 });
  }

  const ipSlot = await acquireSlot(`regen:ip:${clientIp(req)}`, IP_COOLDOWN_MS);
  if (!ipSlot.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many requests — slow down.", retryAfterSec: ipSlot.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(ipSlot.retryAfterSec) } },
    );
  }
  const entrySlot = await acquireSlot(`regen:entry:${id}`, ENTRY_COOLDOWN_MS);
  if (!entrySlot.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "This squad was regenerated recently — the brief isn't stale yet.",
        retryAfterSec: entrySlot.retryAfterSec,
      },
      { status: 429, headers: { "Retry-After": String(entrySlot.retryAfterSec) } },
    );
  }

  try {
    const bundle = await getDashboardBundle(id, Boolean(body.demo));
    const norm = normalizeBundle(bundle);
    const { report, engine, claudeRejectedReason } = await regenerateReport(bundle, norm);
    return NextResponse.json({ ok: true, report, engine, mode: bundle.mode, claudeRejectedReason });
  } catch (e) {
    if (e instanceof EntryNotFoundError) {
      return NextResponse.json({ ok: false, error: "Entry not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: false, error: "Report generation failed" }, { status: 500 });
  }
}

/** Report history for an entry. */
export async function GET(req: Request) {
  const id = Number(new URL(req.url).searchParams.get("entryId"));
  if (!Number.isInteger(id) || id < 0) {
    return NextResponse.json({ ok: false, error: "Invalid entry id" }, { status: 400 });
  }
  const history = await listReportHistory(id);
  return NextResponse.json({ ok: true, history });
}
