import { db, dbAvailable } from "@/db";
import { accountEntries } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { getPublicEntry } from "@/lib/fpl/client";
import { EntryNotFoundError } from "@/lib/fpl/types";
import { acquireSlot } from "@/lib/rateLimit";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function requireAccount() {
  const session = await getSession();
  if (!session || !dbAvailable()) return null;
  return session;
}

/** Save an entry to the signed-in account. Validated against the live FPL API. */
export async function POST(req: Request) {
  const session = await requireAccount();
  if (!session) return NextResponse.json({ ok: false, error: "Sign in first." }, { status: 401 });

  let body: { entryId?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }
  const entryId = Number(body.entryId);
  if (!Number.isInteger(entryId) || entryId <= 0 || entryId > 99_999_999) {
    return NextResponse.json({ ok: false, error: "Invalid entry id." }, { status: 400 });
  }

  const slot = await acquireSlot(`entry-add:${session.accountId}`, 10_000);
  if (!slot.ok) {
    return NextResponse.json({ ok: false, error: "Slow down a touch." }, { status: 429 });
  }

  try {
    const entry = await getPublicEntry(entryId); // throws EntryNotFoundError on 404
    await db
      .insert(accountEntries)
      .values({ accountId: session.accountId, entryId, teamName: entry.name })
      .onConflictDoNothing();
    return NextResponse.json({ ok: true, teamName: entry.name });
  } catch (e) {
    if (e instanceof EntryNotFoundError) {
      return NextResponse.json({ ok: false, error: "That entry doesn't exist on FPL." }, { status: 404 });
    }
    return NextResponse.json({ ok: false, error: "Could not save entry." }, { status: 500 });
  }
}

/** Toggle weekly notifications for a saved entry. */
export async function PATCH(req: Request) {
  const session = await requireAccount();
  if (!session) return NextResponse.json({ ok: false, error: "Sign in first." }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { entryId?: unknown; notify?: unknown };
  const entryId = Number(body.entryId);
  const notify = body.notify ? "on" : "off";
  if (!Number.isInteger(entryId)) {
    return NextResponse.json({ ok: false, error: "Invalid entry id." }, { status: 400 });
  }
  try {
    await db
      .update(accountEntries)
      .set({ notify })
      .where(and(eq(accountEntries.accountId, session.accountId), eq(accountEntries.entryId, entryId)));
    return NextResponse.json({ ok: true, notify });
  } catch {
    return NextResponse.json({ ok: false, error: "Update failed." }, { status: 500 });
  }
}

/** Stop following an entry. */
export async function DELETE(req: Request) {
  const session = await requireAccount();
  if (!session) return NextResponse.json({ ok: false, error: "Sign in first." }, { status: 401 });

  const entryId = Number(new URL(req.url).searchParams.get("entryId"));
  if (!Number.isInteger(entryId)) {
    return NextResponse.json({ ok: false, error: "Invalid entry id." }, { status: 400 });
  }
  try {
    await db
      .delete(accountEntries)
      .where(and(eq(accountEntries.accountId, session.accountId), eq(accountEntries.entryId, entryId)));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Delete failed." }, { status: 500 });
  }
}
