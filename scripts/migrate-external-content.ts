/**
 * Migrate external_posts and external_media tables to Neon DB
 * Run: bun run scripts/migrate-external-content.ts
 */
import postgres from "postgres";
import { loadLocalEnv } from "../src/lib/load-env";

loadLocalEnv();

async function main() {
  const dbUrl = process.env.DATABASE_URL ?? process.env.DB_URL;
  if (!dbUrl) throw new Error("Missing DATABASE_URL");
  const sql = postgres(dbUrl);

  console.log("Applying external content tables migration...");

  await sql`
    DO $$ BEGIN
      CREATE TYPE "public"."external_content_type" AS ENUM('TEXT', 'IMAGE', 'VIDEO', 'GIF', 'GALLERY', 'LINK', 'OTHER');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    DO $$ BEGIN
      CREATE TYPE "public"."external_media_status" AS ENUM('ACTIVE', 'EXPIRED', 'REMOVED', 'FAILED');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    DO $$ BEGIN
      CREATE TYPE "public"."external_media_type" AS ENUM('IMAGE', 'VIDEO', 'GIF', 'LINK');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    DO $$ BEGIN
      CREATE TYPE "public"."external_source" AS ENUM('reddit', 'twitter', 'youtube');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "external_posts" (
      "id" text PRIMARY KEY NOT NULL,
      "post_id" text NOT NULL REFERENCES "posts"("id") ON DELETE cascade,
      "source" "external_source" DEFAULT 'reddit' NOT NULL,
      "external_id" text NOT NULL,
      "external_fullname" text,
      "subreddit" text,
      "external_author" text,
      "permalink" text NOT NULL,
      "canonical_url" text NOT NULL,
      "score" integer DEFAULT 0 NOT NULL,
      "comment_count" integer DEFAULT 0 NOT NULL,
      "external_created_at" text,
      "imported_at" timestamp with time zone DEFAULT now() NOT NULL,
      "relevance_score" integer DEFAULT 0 NOT NULL,
      "content_type" "external_content_type" DEFAULT 'TEXT' NOT NULL,
      "source_metadata" jsonb,
      "last_checked_at" text,
      "media_status" "external_media_status" DEFAULT 'ACTIVE' NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "external_posts_source_external_id_idx" ON "external_posts" ("source", "external_id");
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "external_posts_post_id_idx" ON "external_posts" ("post_id");
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "external_posts_subreddit_idx" ON "external_posts" ("subreddit");
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "external_posts_content_type_idx" ON "external_posts" ("content_type");
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "external_posts_source_idx" ON "external_posts" ("source");
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "external_posts_permalink_idx" ON "external_posts" ("permalink");
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "external_media" (
      "id" text PRIMARY KEY NOT NULL,
      "external_post_id" text NOT NULL REFERENCES "external_posts"("id") ON DELETE cascade,
      "media_type" "external_media_type" DEFAULT 'IMAGE' NOT NULL,
      "media_url" text NOT NULL,
      "preview_url" text,
      "thumbnail_url" text,
      "hls_url" text,
      "dash_url" text,
      "width" integer,
      "height" integer,
      "duration" integer,
      "is_gif" boolean DEFAULT false NOT NULL,
      "position" integer DEFAULT 0 NOT NULL,
      "metadata" jsonb,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS "external_media_post_idx" ON "external_media" ("external_post_id");
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "external_media_type_idx" ON "external_media" ("media_type");
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "external_media_position_idx" ON "external_media" ("external_post_id", "position");
  `;

  console.log("Migration applied successfully!");
  await sql.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
