import { getDb } from "../src/db";
import { sql } from "drizzle-orm";

async function run() {
  const db = getDb();
  console.log("Migrating communities schema...");

  await db.execute(sql`
    ALTER TABLE communities 
    ADD COLUMN IF NOT EXISTS slug text,
    ADD COLUMN IF NOT EXISTS avatar_url text,
    ADD COLUMN IF NOT EXISTS banner_url text,
    ADD COLUMN IF NOT EXISTS privacy text DEFAULT 'PUBLIC' NOT NULL,
    ADD COLUMN IF NOT EXISTS category text DEFAULT 'General' NOT NULL,
    ADD COLUMN IF NOT EXISTS rules text,
    ADD COLUMN IF NOT EXISTS allow_anonymous_posts boolean DEFAULT true NOT NULL,
    ADD COLUMN IF NOT EXISTS points integer DEFAULT 0 NOT NULL,
    ADD COLUMN IF NOT EXISTS invite_code text,
    ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone;
  `);

  await db.execute(sql`
    ALTER TABLE community_members 
    ADD COLUMN IF NOT EXISTS role text DEFAULT 'MEMBER' NOT NULL,
    ADD COLUMN IF NOT EXISTS status text DEFAULT 'ACTIVE' NOT NULL;
  `);

  // Ensure unique index on slug if not exists
  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS communities_slug_idx ON communities (slug) WHERE slug IS NOT NULL;
  `);

  console.log("Migration completed successfully!");
  process.exit(0);
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
