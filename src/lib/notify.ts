import { db, dbAvailable } from "@/db";
import { accountEntries, accounts } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { Report } from "./report/types";

/**
 * Transactional email via Resend's REST API (plain fetch — no SDK needed).
 * With no RESEND_API_KEY configured the sender degrades to a logged no-op
 * and callers report "not-configured", keeping the cron path honest.
 */

export function mailerConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

function briefEmailHtml(opts: {
  teamName: string;
  gameweek: number;
  headline: string;
  captain: string;
  captainReasoning: string;
  moves: number;
  dashboardUrl: string;
}): string {
  return `
  <div style="background:#05030b;color:#f2edff;font-family:Inter,Arial,sans-serif;padding:32px 24px;">
    <div style="max-width:520px;margin:0 auto;background:#110a24;border:1px solid #2b2148;border-radius:16px;padding:28px;">
      <p style="font-size:11px;letter-spacing:3px;color:#04f5ff;margin:0 0 14px;">FPL//AI · GW${opts.gameweek} BRIEF</p>
      <h1 style="font-size:20px;margin:0 0 6px;color:#f2edff;">${escapeHtml(opts.teamName)}</h1>
      <p style="font-size:14px;color:#8e86b0;margin:0 0 18px;">${escapeHtml(opts.headline)}</p>
      <div style="background:#0b0618;border:1px solid #2b2148;border-radius:12px;padding:16px;margin-bottom:14px;">
        <p style="font-size:10px;letter-spacing:2px;color:#ffc800;margin:0;">CAPTAIN PICK</p>
        <p style="font-size:22px;font-weight:700;margin:6px 0 6px;color:#00ff87;">${escapeHtml(opts.captain)}</p>
        <p style="font-size:12px;color:#8e86b0;margin:0;">${escapeHtml(opts.captainReasoning)}</p>
      </div>
      <p style="font-size:12px;color:#8e86b0;margin:0 0 18px;">
        ${opts.moves > 0 ? `${opts.moves} transfer move${opts.moves > 1 ? "s" : ""} on the table.` : "No responsible moves — hold the free transfer."}
      </p>
      <a href="${opts.dashboardUrl}" style="display:inline-block;background:#00ff87;color:#032117;font-weight:700;font-size:12px;letter-spacing:2px;text-decoration:none;padding:12px 20px;border-radius:10px;">OPEN THE WAR ROOM</a>
      <p style="font-size:10px;color:#5c5478;margin:22px 0 0;">
        Not affiliated with the Premier League or FPL. Advice only — execute transfers on the official site.
        You received this because you saved this entry with notifications on.
      </p>
    </div>
  </div>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<"sent" | "not-configured" | "failed"> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.info(`[notify] RESEND_API_KEY unset — skipping email to ${opts.to}`);
    return "not-configured";
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM ?? "FPL//AI <briefs@resend.dev>",
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    return res.ok ? "sent" : "failed";
  } catch {
    return "failed";
  }
}

/** Emails that follow this entry with notifications on. */
export async function subscribersFor(entryId: number): Promise<string[]> {
  if (!dbAvailable()) return [];
  try {
    const rows = await db
      .select({ email: accounts.email })
      .from(accountEntries)
      .innerJoin(accounts, eq(accountEntries.accountId, accounts.id))
      .where(and(eq(accountEntries.entryId, entryId), eq(accountEntries.notify, "on")));
    return rows.map((r) => r.email);
  } catch {
    return [];
  }
}

export async function sendBriefDigest(opts: {
  entryId: number;
  teamName: string;
  report: Report;
  dashboardUrl: string;
}): Promise<{ notified: number; status: string }> {
  const emails = await subscribersFor(opts.entryId);
  if (!emails.length) return { notified: 0, status: "no-subscribers" };
  let sent = 0;
  let lastStatus = "sent";
  for (const to of emails) {
    const status = await sendEmail({
      to,
      subject: `GW${opts.report.gameweek} brief — captain ${opts.report.captain_suggestion.player}`,
      html: briefEmailHtml({
        teamName: opts.teamName,
        gameweek: opts.report.gameweek,
        headline: opts.report.headline ?? "Your gameweek brief is ready.",
        captain: opts.report.captain_suggestion.player,
        captainReasoning: opts.report.captain_suggestion.reasoning,
        moves: opts.report.transfer_suggestions.length,
        dashboardUrl: opts.dashboardUrl,
      }),
    });
    lastStatus = status;
    if (status === "sent") sent += 1;
  }
  return { notified: sent, status: lastStatus };
}
