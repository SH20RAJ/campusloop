import { config } from "dotenv";
config({ path: ".dev.vars" });
import { getDb } from "../src/db/index";
import { sql } from "drizzle-orm";

async function main() {
  const db = getDb();

  console.log("Creating reels table...");
  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS "reels" (
      "id" text PRIMARY KEY,
      "slug" text UNIQUE NOT NULL,
      "caption" text NOT NULL DEFAULT '',
      "title" text,
      "video_url" text NOT NULL,
      "hls_url" text,
      "audio_url" text,
      "thumbnail_url" text,
      "aspect_ratio" text NOT NULL DEFAULT '9:16',
      "width" integer,
      "height" integer,
      "duration" integer,
      "author_id" text REFERENCES "user_profiles"("id") ON DELETE SET NULL,
      "author_name" text,
      "author_handle" text,
      "author_avatar_url" text,
      "institution_id" text REFERENCES "institutions"("id") ON DELETE SET NULL,
      "source" text NOT NULL DEFAULT 'reddit',
      "source_url" text,
      "subreddit" text,
      "tags" jsonb NOT NULL DEFAULT '[]'::jsonb,
      "likes_count" integer NOT NULL DEFAULT 0,
      "comments_count" integer NOT NULL DEFAULT 0,
      "shares_count" integer NOT NULL DEFAULT 0,
      "views_count" integer NOT NULL DEFAULT 0,
      "status" varchar(16) NOT NULL DEFAULT 'PUBLISHED',
      "is_featured" boolean NOT NULL DEFAULT false,
      "created_at" timestamp with time zone NOT NULL DEFAULT now(),
      "updated_at" timestamp with time zone NOT NULL DEFAULT now()
    );
  `));

  console.log("Creating reels indexes...");
  await db.execute(sql.raw(`CREATE INDEX IF NOT EXISTS "reels_status_created_idx" ON "reels" ("status", "created_at");`));
  await db.execute(sql.raw(`CREATE INDEX IF NOT EXISTS "reels_institution_idx" ON "reels" ("institution_id", "status");`));
  await db.execute(sql.raw(`CREATE INDEX IF NOT EXISTS "reels_author_idx" ON "reels" ("author_id");`));
  await db.execute(sql.raw(`CREATE INDEX IF NOT EXISTS "reels_subreddit_idx" ON "reels" ("subreddit");`));
  await db.execute(sql.raw(`CREATE INDEX IF NOT EXISTS "reels_views_idx" ON "reels" ("views_count");`));

  console.log("Creating reel_likes table...");
  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS "reel_likes" (
      "id" text PRIMARY KEY,
      "reel_id" text NOT NULL REFERENCES "reels"("id") ON DELETE CASCADE,
      "user_id" text NOT NULL REFERENCES "user_profiles"("id") ON DELETE CASCADE,
      "created_at" timestamp with time zone NOT NULL DEFAULT now()
    );
  `));
  await db.execute(sql.raw(`CREATE UNIQUE INDEX IF NOT EXISTS "reel_likes_user_reel_unique" ON "reel_likes" ("user_id", "reel_id");`));
  await db.execute(sql.raw(`CREATE INDEX IF NOT EXISTS "reel_likes_reel_idx" ON "reel_likes" ("reel_id");`));

  console.log("Creating reel_comments table...");
  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS "reel_comments" (
      "id" text PRIMARY KEY,
      "reel_id" text NOT NULL REFERENCES "reels"("id") ON DELETE CASCADE,
      "author_id" text NOT NULL REFERENCES "user_profiles"("id") ON DELETE CASCADE,
      "body" text NOT NULL,
      "created_at" timestamp with time zone NOT NULL DEFAULT now(),
      "updated_at" timestamp with time zone NOT NULL DEFAULT now()
    );
  `));
  await db.execute(sql.raw(`CREATE INDEX IF NOT EXISTS "reel_comments_reel_idx" ON "reel_comments" ("reel_id", "created_at");`));

  console.log("Creating reel_bookmarks table...");
  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS "reel_bookmarks" (
      "id" text PRIMARY KEY,
      "reel_id" text NOT NULL REFERENCES "reels"("id") ON DELETE CASCADE,
      "user_id" text NOT NULL REFERENCES "user_profiles"("id") ON DELETE CASCADE,
      "created_at" timestamp with time zone NOT NULL DEFAULT now()
    );
  `));
  await db.execute(sql.raw(`CREATE UNIQUE INDEX IF NOT EXISTS "reel_bookmarks_user_reel_unique" ON "reel_bookmarks" ("user_id", "reel_id");`));
  await db.execute(sql.raw(`CREATE INDEX IF NOT EXISTS "reel_bookmarks_user_idx" ON "reel_bookmarks" ("user_id");`));

  console.log("✅ Successfully created reels tables and indexes in Neon PostgreSQL!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error creating reels tables:", err);
  process.exit(1);
});
