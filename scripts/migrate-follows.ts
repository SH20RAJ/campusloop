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

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS follows_follower_following_idx ON follows(follower_id, following_id);
  `;
  // Keyset pagination indexes for the follower / following list pages
  await sql`
    CREATE INDEX IF NOT EXISTS follows_following_created_idx ON follows(following_id, created_at);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS follows_follower_created_idx ON follows(follower_id, created_at);
  `;

  console.log("follows migration successful!");
}

main().catch(console.error);
