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
  console.log("Running migration for secret_crushes table...");

  await sql`
    CREATE TABLE IF NOT EXISTS secret_crushes (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      sender_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
      target_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
      is_mutual BOOLEAN NOT NULL DEFAULT FALSE,
      matched_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS secret_crushes_sender_target_idx ON secret_crushes(sender_id, target_id);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS secret_crushes_target_idx ON secret_crushes(target_id);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS secret_crushes_sender_idx ON secret_crushes(sender_id);
  `;

  console.log("secret_crushes migration successful!");
}

main().catch(console.error);
