/**
 * Presence heartbeat column + Web Push subscription storage.
 *
 *   bun run scripts/migrate-presence-push.ts
 */
import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const dbUrl = process.env.DB_URL;
if (!dbUrl) {
  console.error("DB_URL is required");
  process.exit(1);
}

const sql = neon(dbUrl);

async function main() {
  console.log("Running presence + push migration...");

  // Presence is derived from a heartbeat timestamp, never a stored boolean.
  await sql`
    ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE;
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS user_profiles_last_seen_idx ON user_profiles(last_seen_at);
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
      endpoint TEXT NOT NULL,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      user_agent TEXT,
      failure_count INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS push_subscriptions_endpoint_idx ON push_subscriptions(endpoint);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS push_subscriptions_user_idx ON push_subscriptions(user_id);
  `;

  console.log("presence + push migration successful!");
}

main().catch(console.error);
