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
  console.log("Running migration for follows table...");

  await sql`
    CREATE TABLE IF NOT EXISTS follows (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      follower_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
      following_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `;

  // Denormalized mutual-follow ("friend") flag.
  await sql`
    ALTER TABLE follows ADD COLUMN IF NOT EXISTS is_mutual BOOLEAN NOT NULL DEFAULT FALSE;
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS follows_follower_following_idx ON follows(follower_id, following_id);
  `;
  // Reverse covering index so the mutual-edge lookup stays index-only.
  await sql`
    CREATE INDEX IF NOT EXISTS follows_following_follower_idx ON follows(following_id, follower_id);
  `;
  // Keyset pagination indexes for the follower / following list pages
  await sql`
    CREATE INDEX IF NOT EXISTS follows_following_created_idx ON follows(following_id, created_at);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS follows_follower_created_idx ON follows(follower_id, created_at);
  `;
  // Partial index: the friends list only ever scans mutual edges.
  await sql`
    CREATE INDEX IF NOT EXISTS follows_mutual_created_idx ON follows(follower_id, created_at) WHERE is_mutual;
  `;

  // Backfill is_mutual for edges that already have a reverse counterpart.
  const backfilled = await sql`
    UPDATE follows f
    SET is_mutual = TRUE
    WHERE NOT f.is_mutual
      AND EXISTS (
        SELECT 1 FROM follows r
        WHERE r.follower_id = f.following_id
          AND r.following_id = f.follower_id
      )
    RETURNING f.id;
  `;
  console.log(`backfilled is_mutual on ${backfilled.length} rows`);

  console.log("follows migration successful!");
}

main().catch(console.error);
