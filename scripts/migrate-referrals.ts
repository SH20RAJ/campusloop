import { neon } from "@neondatabase/serverless";

async function main() {
  const databaseUrl = process.env.DB_URL || process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  console.log("Creating short_links and link_clicks tables...");

  await sql`
    CREATE TABLE IF NOT EXISTS "short_links" (
      "id" text PRIMARY KEY NOT NULL,
      "slug" varchar(64) NOT NULL UNIQUE,
      "target_url" text NOT NULL,
      "title" varchar(255),
      "clicks" integer DEFAULT 0 NOT NULL,
      "unique_clicks" integer DEFAULT 0 NOT NULL,
      "created_by" text REFERENCES "user_profiles"("id") ON DELETE SET NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS "short_links_slug_idx" ON "short_links" ("slug");
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS "short_links_created_at_idx" ON "short_links" ("created_at");
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "link_clicks" (
      "id" text PRIMARY KEY NOT NULL,
      "short_link_id" text REFERENCES "short_links"("id") ON DELETE CASCADE,
      "ref_code" varchar(128),
      "ip" varchar(64),
      "user_agent" text,
      "device" varchar(32),
      "browser" varchar(32),
      "os" varchar(32),
      "referer" text,
      "country" varchar(32),
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS "link_clicks_short_link_idx" ON "link_clicks" ("short_link_id");
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS "link_clicks_ref_code_idx" ON "link_clicks" ("ref_code");
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS "link_clicks_created_at_idx" ON "link_clicks" ("created_at");
  `;

  console.log("Successfully created short_links and link_clicks tables!");
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
