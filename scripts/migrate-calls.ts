import { getDb } from "@/db";
import { sql } from "drizzle-orm";

async function main() {
  const db = getDb();
  console.log("Creating call_sessions and user_behavior_events tables if they do not exist...");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS call_sessions (
      id TEXT PRIMARY KEY,
      conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
      caller_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
      receiver_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
      type TEXT NOT NULL DEFAULT 'video',
      context TEXT NOT NULL DEFAULT 'chat',
      status TEXT NOT NULL DEFAULT 'CALLING',
      caller_peer_id TEXT,
      receiver_peer_id TEXT,
      ended_reason TEXT,
      duration_seconds INTEGER NOT NULL DEFAULT 0,
      started_at TIMESTAMPTZ,
      accepted_at TIMESTAMPTZ,
      ended_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS user_behavior_events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT,
      metadata JSONB,
      weight INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  console.log("✅ Tables created or verified successfully!");
}

main().catch(console.error);
