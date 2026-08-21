import { db, dbAvailable } from "@/db";
import { rateLimits } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Postgres-backed fixed-window rate limiter. Guards spend-bearing paths
 * (LLM report generation) server-side — client-side button disables are
 * cosmetic and bypassed by one curl loop, as the review noted.
 */

export interface RateCheck {
  ok: boolean;
  retryAfterSec: number;
}

export async function checkRateLimit(key: string, cooldownMs: number): Promise<RateCheck> {
  if (!dbAvailable()) return { ok: true, retryAfterSec: 0 }; // can't track — degrade open
  try {
    const rows = await db.select().from(rateLimits).where(eq(rateLimits.key, key)).limit(1);
    const last = rows[0]?.lastAt;
    if (last) {
      const elapsed = Date.now() - new Date(last).getTime();
      if (elapsed < cooldownMs) {
        return { ok: false, retryAfterSec: Math.ceil((cooldownMs - elapsed) / 1000) };
      }
    }
    return { ok: true, retryAfterSec: 0 };
  } catch {
    return { ok: true, retryAfterSec: 0 };
  }
}

export async function touchRateLimit(key: string): Promise<void> {
  if (!dbAvailable()) return;
  try {
    await db
      .insert(rateLimits)
      .values({ key, lastAt: new Date() })
      .onConflictDoUpdate({ target: rateLimits.key, set: { lastAt: new Date() } });
  } catch {
    /* non-fatal */
  }
}

/** True when allowed; if so, stamps the key in one go. */
export async function acquireSlot(key: string, cooldownMs: number): Promise<RateCheck> {
  const check = await checkRateLimit(key, cooldownMs);
  if (!check.ok) return check;
  await touchRateLimit(key);
  return check;
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
