import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  // Deliberately a warning, not a throw: the whole app is designed around
  // graceful degradation (FPL fetch caching, report persistence, accounts)
  // so a missing DATABASE_URL must not nuke the render path at import time.
  console.warn("[db] DATABASE_URL is not set — persistence features disabled, running in stateless mode.");
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool: Pool | null = databaseUrl
  ? (globalForDb.__arenaNextJsPostgresqlPool ?? new Pool({ connectionString: databaseUrl }))
  : null;

if (pool && process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

/**
 * When the pool is absent we hand out a throwing proxy instead of crashing at
 * import. Callers wrap DB work in try/catch by design, so this degrades
 * exactly like a failed query — consistent with the rest of the codebase.
 */
export const db: NodePgDatabase = pool
  ? drizzle(pool)
  : (new Proxy(
      {},
      {
        get() {
          throw new Error("DATABASE_URL not configured — database unavailable");
        },
      },
    ) as unknown as NodePgDatabase);

/** Cheap capability check for code paths that should no-op early. */
export const dbAvailable = (): boolean => pool !== null;
