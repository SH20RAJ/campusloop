import { getDb } from "@/db";
import { sql } from "drizzle-orm";

async function main() {
  const db = getDb();
  console.log("Creating secret_crush_attempts table if not exists...");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS secret_crush_attempts (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      sender_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
      target_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS secret_crush_attempts_sender_created_idx
    ON secret_crush_attempts(sender_id, created_at);
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS secret_crush_attempts_sender_target_idx
    ON secret_crush_attempts(sender_id, target_id);
  `);

  console.log("Successfully migrated secret_crush_attempts table!");
}

main().catch(console.error);
