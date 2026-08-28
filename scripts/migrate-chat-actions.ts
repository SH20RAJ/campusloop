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
  console.log("Running migration for conversation_participants columns...");

  await sql`
    ALTER TABLE conversation_participants 
    ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE;
  `;

  await sql`
    ALTER TABLE conversation_participants 
    ADD COLUMN IF NOT EXISTS is_muted BOOLEAN NOT NULL DEFAULT FALSE;
  `;

  await sql`
    ALTER TABLE conversation_participants 
    ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT FALSE;
  `;

  await sql`
    ALTER TABLE conversation_participants 
    ADD COLUMN IF NOT EXISTS last_cleared_at TIMESTAMP WITH TIME ZONE;
  `;

  console.log("Migration completed successfully!");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
