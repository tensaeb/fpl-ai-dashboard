import crypto from "node:crypto";
import { cookies } from "next/headers";

/**
 * Passwordless session auth. Magic-link tokens are single-use, SHA-256
 * hashed at rest, and expire in 15 minutes. Sessions are stateless
 * HMAC-signed cookies — httpOnly, Secure, SameSite=Lax (never localStorage),
 * per the blueprint's security section.
 */

const COOKIE = "fplai_session";
const SESSION_TTL_MS = 30 * 24 * 3600 * 1000;
export const MAGIC_TTL_MS = 15 * 60 * 1000;

function secret(): string {
  return (
    process.env.SESSION_SECRET ??
    process.env.DATABASE_URL ??
    "fplai-dev-secret-change-me"
  );
}

export interface Session {
  accountId: number;
  email: string;
  exp: number;
}

function hmac(payloadB64: string): string {
  return crypto.createHmac("sha256", secret()).update(payloadB64).digest("base64url");
}

function encode(session: Session): string {
  const b = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${b}.${hmac(b)}`;
}

function decode(value: string | undefined | null): Session | null {
  if (!value) return null;
  const dot = value.lastIndexOf(".");
  if (dot <= 0) return null;
  const b = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  const expected = hmac(b);
  const a = Buffer.from(sig);
  const x = Buffer.from(expected);
  if (a.length !== x.length || !crypto.timingSafeEqual(a, x)) return null;
  try {
    const session = JSON.parse(Buffer.from(b, "base64url").toString()) as Session;
    if (!session.exp || session.exp < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  try {
    const store = await cookies();
    return decode(store.get(COOKIE)?.value);
  } catch {
    return null;
  }
}

export async function setSession(session: Omit<Session, "exp">): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, encode({ ...session, exp: Date.now() + SESSION_TTL_MS }), {
    httpOnly: true,
    // Secure in production (all real traffic is HTTPS); relaxed only for
    // plain-HTTP local development — the NextAuth convention.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function clearSession(): Promise<void> {
  try {
    (await cookies()).delete(COOKIE);
  } catch {
    /* non-fatal */
  }
}

export function newMagicToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashMagicToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
