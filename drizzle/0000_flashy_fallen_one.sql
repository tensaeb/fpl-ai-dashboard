CREATE TABLE "account_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" integer NOT NULL,
	"entry_id" integer NOT NULL,
	"team_name" text DEFAULT '' NOT NULL,
	"notify" text DEFAULT 'on' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_at" timestamp with time zone,
	CONSTRAINT "accounts_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "fpl_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"entry_id" integer NOT NULL,
	"player_name" text DEFAULT '' NOT NULL,
	"team_name" text DEFAULT '' NOT NULL,
	"overall_rank" integer,
	"mode" text DEFAULT 'live' NOT NULL,
	"last_synced_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fpl_entries_entry_id_unique" UNIQUE("entry_id")
);
--> statement-breakpoint
CREATE TABLE "fpl_cache" (
	"key" text PRIMARY KEY NOT NULL,
	"payload" jsonb NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "magic_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "magic_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"last_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_outcomes" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_id" integer NOT NULL,
	"entry_id" integer NOT NULL,
	"gameweek" integer NOT NULL,
	"engine" text DEFAULT 'rules-engine' NOT NULL,
	"captain_pts" integer,
	"captain_best_pts" integer,
	"captain_hit" text,
	"transfer_deltas" jsonb,
	"scored_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "report_outcomes_report_id_unique" UNIQUE("report_id")
);
--> statement-breakpoint
CREATE TABLE "fpl_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"entry_id" integer NOT NULL,
	"gameweek" integer NOT NULL,
	"payload" jsonb NOT NULL,
	"confidence" text DEFAULT 'low' NOT NULL,
	"engine" text DEFAULT 'rules' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "account_entries_unique" ON "account_entries" USING btree ("account_id","entry_id");--> statement-breakpoint
CREATE INDEX "account_entries_entry_idx" ON "account_entries" USING btree ("entry_id");--> statement-breakpoint
CREATE INDEX "account_entries_account_idx" ON "account_entries" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "report_outcomes_entry_idx" ON "report_outcomes" USING btree ("entry_id");--> statement-breakpoint
CREATE INDEX "fpl_reports_entry_gw_idx" ON "fpl_reports" USING btree ("entry_id","gameweek");