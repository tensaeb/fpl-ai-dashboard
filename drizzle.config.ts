import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load local secrets the way `next dev` does, so `npm run db:push` targets
// the same Supabase Postgres the app connects to at runtime.
dotenv.config({ path: [".env.local", ".env"] });

// Reads DATABASE_URL from .env.local / .env so schema pushes and migrations
// target whatever Postgres you've wired up (Supabase, Neon, local, ...).
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});