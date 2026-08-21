import { db, dbAvailable } from "@/db";
import { magicTokens } from "@/db/schema";
import { hashMagicToken, MAGIC_TTL_MS, newMagicToken } from "@/lib/auth";
import { sendEmail } from "@/lib/notify";
import { requestOrigin } from "@/lib/origin";
import { acquireSlot } from "@/lib/rateLimit";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function linkEmailHtml(link: string): string {
  return `
  <div style="background:#05030b;color:#f2edff;font-family:Inter,Arial,sans-serif;padding:32px 24px;">
    <div style="max-width:480px;margin:0 auto;background:#110a24;border:1px solid #2b2148;border-radius:16px;padding:28px;">
      <p style="font-size:11px;letter-spacing:3px;color:#04f5ff;margin:0 0 14px;">FPL//AI · SIGN IN</p>
      <p style="font-size:14px;color:#8e86b0;margin:0 0 22px;">Your one-time sign-in link (valid 15 minutes):</p>
      <a href="${link}" style="display:inline-block;background:#00ff87;color:#032117;font-weight:700;font-size:12px;letter-spacing:2px;text-decoration:none;padding:12px 20px;border-radius:10px;">SIGN IN</a>
      <p style="font-size:10px;color:#5c5478;margin:22px 0 0;">If you didn't request this, ignore it — no password exists to steal.</p>
    </div>
  </div>`;
}

/**
 * Request a magic link. One per email per minute. When no mailer is
 * configured we return devLink so the flow is demonstrably functional —
 * the alternative is a silently dead feature.
 */
export async function POST(req: Request) {
  let body: { email?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
  }
  if (!dbAvailable()) {
    return NextResponse.json({ ok: false, error: "Accounts unavailable — persistence is disabled." }, { status: 503 });
  }

  const slot = await acquireSlot(`magic:${email}`, 60_000);
  if (!slot.ok) {
    return NextResponse.json(
      { ok: false, error: "Link already sent — check your inbox.", retryAfterSec: slot.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(slot.retryAfterSec) } },
    );
  }

  const token = newMagicToken();
  try {
    await db.insert(magicTokens).values({
      email,
      tokenHash: hashMagicToken(token),
      expiresAt: new Date(Date.now() + MAGIC_TTL_MS),
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Could not create sign-in link." }, { status: 500 });
  }

  const link = `${requestOrigin(req)}/api/auth/verify?token=${token}`;
  const status = await sendEmail({ to: email, subject: "Your FPL//AI sign-in link", html: linkEmailHtml(link) });

  return NextResponse.json({
    ok: true,
    delivered: status === "sent",
    // Only surfaced when email delivery is not configured (or failed):
    // keeps the feature usable in dev/demo without hiding production truth.
    devLink: status === "sent" ? undefined : link,
  });
}
