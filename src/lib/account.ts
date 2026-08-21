import { db, dbAvailable } from "@/db";
import { accountEntries } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export interface SavedEntry {
  entryId: number;
  teamName: string;
  notify: boolean;
  createdAt: string;
}

export async function listSavedEntries(accountId: number): Promise<SavedEntry[]> {
  if (!dbAvailable()) return [];
  try {
    const rows = await db
      .select()
      .from(accountEntries)
      .where(eq(accountEntries.accountId, accountId))
      .orderBy(desc(accountEntries.createdAt));
    return rows.map((r) => ({
      entryId: r.entryId,
      teamName: r.teamName,
      notify: r.notify === "on",
      createdAt: r.createdAt.toISOString(),
    }));
  } catch {
    return [];
  }
}
