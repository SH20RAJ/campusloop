import { getDb } from "../src/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Running migration for saved_posts and target_institution_ids...");
  const db = getDb();

  // 1. Create saved_posts table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS saved_posts (
      id text PRIMARY KEY,
      profile_id text NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
      post_id text NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      created_at timestamp DEFAULT now() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS saved_posts_profile_post_idx
    ON saved_posts(profile_id, post_id);
  `);

  // 2. Add target_institution_ids column to user_profiles if missing
  await db.execute(sql`
    ALTER TABLE user_profiles
    ADD COLUMN IF NOT EXISTS target_institution_ids jsonb DEFAULT '[]'::jsonb NOT NULL;
  `);

  console.log("Migration completed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
