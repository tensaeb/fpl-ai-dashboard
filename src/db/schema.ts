import {
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * A tracked FPL manager entry. We only ever store the *public* entry id —
 * never FPL credentials (by design, see project blueprint).
 */
export const entries = pgTable("fpl_entries", {
  id: serial("id").primaryKey(),
  entryId: integer("entry_id").notNull().unique(),
  playerName: text("player_name").notNull().default(""),
  teamName: text("team_name").notNull().default(""),
  overallRank: integer("overall_rank"),
  mode: text("mode").notNull().default("live"),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/**
 * Immutable history of generated AI reports — one row per generation,
 * tied to an entry + gameweek.
 */
export const reports = pgTable(
  "fpl_reports",
  {
    id: serial("id").primaryKey(),
    entryId: integer("entry_id").notNull(),
    gameweek: integer("gameweek").notNull(),
    payload: jsonb("payload").notNull(),
    confidence: text("confidence").notNull().default("low"),
    engine: text("engine").notNull().default("rules"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("fpl_reports_entry_gw_idx").on(t.entryId, t.gameweek)],
);

/**
 * Postgres-backed response cache for the public FPL endpoints
 * (Redis substitute — same TTL semantics). Outbound calls to
 * fantasy.premierleague.com are rate-limited by us, so we don't get
 * throttled by their infrastructure.
 */
export const fplCache = pgTable("fpl_cache", {
  key: text("key").primaryKey(),
  payload: jsonb("payload").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

/** Rate-limit ledger — protects spend-bearing endpoints (LLM calls). */
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  lastAt: timestamp("last_at", { withTimezone: true }).notNull(),
});

/** Lightweight accounts — magic-link email sign-in, no passwords. */
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

export const magicTokens = pgTable("magic_tokens", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  consumedAt: timestamp("consumed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Entries an account follows — feeds the weekly cron + notifications. */
export const accountEntries = pgTable(
  "account_entries",
  {
    id: serial("id").primaryKey(),
    accountId: integer("account_id").notNull(),
    entryId: integer("entry_id").notNull(),
    teamName: text("team_name").notNull().default(""),
    notify: text("notify").notNull().default("on"), // 'on' | 'off'
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("account_entries_unique").on(t.accountId, t.entryId),
    index("account_entries_entry_idx").on(t.entryId),
    index("account_entries_account_idx").on(t.accountId),
  ],
);

/**
 * Post-hoc accuracy outcomes: once a gameweek finishes, we score each
 * report's captain/transfer calls against actual player points.
 */
export const reportOutcomes = pgTable(
  "report_outcomes",
  {
    id: serial("id").primaryKey(),
    reportId: integer("report_id").notNull().unique(),
    entryId: integer("entry_id").notNull(),
    gameweek: integer("gameweek").notNull(),
    engine: text("engine").notNull().default("rules-engine"),
    captainPts: integer("captain_pts"), // doubled, as captain scores
    captainBestPts: integer("captain_best_pts"), // best possible from that XI
    captainHit: text("captain_hit"), // 'yes' | 'no' — top-3 of starters or better
    transferDeltas: jsonb("transfer_deltas"), // [{in,out,inPts,outPts,delta}]
    scoredAt: timestamp("scored_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("report_outcomes_entry_idx").on(t.entryId)],
);
