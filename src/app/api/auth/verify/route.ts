import { db, dbAvailable } from "@/db";
import { accounts, magicTokens } from "@/db/schema";
import { hashMagicToken, setSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/** Consume a magic link, upsert the account, set the session cookie. */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  if (!token || !dbAvailable()) redirect("/account?error=invalid");

  const hash = hashMagicToken(token);
  let email: string | null = null;
  let accountId: number | null = null;

  try {
    const rows = await db.select().from(magicTokens).where(eq(magicTokens.tokenHash, hash)).limit(1);
    const row = rows[0];
    if (!row || row.consumedAt || new Date(row.expiresAt).getTime() < Date.now()) {
      redirect("/account?error=expired");
    }
    email = row.email;
    await db.update(magicTokens).set({ consumedAt: new Date() }).where(eq(magicTokens.id, row.id));

    const upserted = await db
      .insert(accounts)
      .values({ email, lastLoginAt: new Date() })
      .onConflictDoUpdate({ target: accounts.email, set: { lastLoginAt: new Date() } })
      .returning({ id: accounts.id });
    accountId = upserted[0]?.id ?? null;
    if (accountId == null) {
      const found = await db.select({ id: accounts.id }).from(accounts).where(eq(accounts.email, email)).limit(1);
      accountId = found[0]?.id ?? null;
    }
  } catch {
    redirect("/account?error=invalid");
  }

  if (accountId == null || email == null) redirect("/account?error=invalid");
  await setSession({ accountId, email });
  redirect("/account");
}
