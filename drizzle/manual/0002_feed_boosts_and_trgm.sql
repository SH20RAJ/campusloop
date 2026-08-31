-- Editorial feed curation, plus the trigram indexes that make substring search
-- on this database viable at all.
--
-- Idempotent: safe to run more than once.

-- ─────────────────────────────────────────────────────────────
-- 1. feed_boosts
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "feed_boosts" (
	"id" text PRIMARY KEY NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"multiplier" double precision DEFAULT 2 NOT NULL,
	"mode" text DEFAULT 'PROMOTE' NOT NULL,
	"priority" double precision DEFAULT 0 NOT NULL,
	"scope" text DEFAULT 'GLOBAL' NOT NULL,
	"institution_id" text,
	"starts_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"reason" text,
	"created_by_profile_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

DO $$ BEGIN
	ALTER TABLE "feed_boosts" ADD CONSTRAINT "feed_boosts_institution_id_fk"
		FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
	ALTER TABLE "feed_boosts" ADD CONSTRAINT "feed_boosts_created_by_profile_id_fk"
		FOREIGN KEY ("created_by_profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE set null;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- The loader's only query: active rows still inside their window.
CREATE INDEX IF NOT EXISTS "feed_boosts_active_idx" ON "feed_boosts" ("is_active", "expires_at");
CREATE INDEX IF NOT EXISTS "feed_boosts_target_idx" ON "feed_boosts" ("target_type", "target_id");
CREATE INDEX IF NOT EXISTS "feed_boosts_scope_idx" ON "feed_boosts" ("scope", "institution_id");

-- One live boost per target, so re-boosting replaces instead of stacking and
-- the effective multiplier is always the number the admin sees.
CREATE UNIQUE INDEX IF NOT EXISTS "feed_boosts_target_unique_idx"
	ON "feed_boosts" ("target_type", "target_id");

-- Reshape for installs created before `mode` replaced the pin flag. The table
-- ships empty, so this is a no-op on a fresh database.
ALTER TABLE "feed_boosts" ADD COLUMN IF NOT EXISTS "mode" text DEFAULT 'PROMOTE' NOT NULL;
ALTER TABLE "feed_boosts" ADD COLUMN IF NOT EXISTS "priority" double precision DEFAULT 0 NOT NULL;
ALTER TABLE "feed_boosts" DROP COLUMN IF EXISTS "is_pinned";
ALTER TABLE "feed_boosts" DROP COLUMN IF EXISTS "pin_priority";

-- ─────────────────────────────────────────────────────────────
-- 2. pg_trgm — substring search that uses an index
-- ─────────────────────────────────────────────────────────────
-- Several hot paths do `ILIKE '%needle%'`: the hashtag filter in /api/feed,
-- global search, and admin lookups. A leading wildcard defeats a B-tree, so
-- every one of those was a sequential scan over posts. GIN + trigram ops fixes
-- that without changing a line of query code — the planner picks it up on its
-- own.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "posts_body_trgm_idx" ON "posts" USING gin ("body" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "posts_title_trgm_idx" ON "posts" USING gin ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "user_profiles_username_trgm_idx"
	ON "user_profiles" USING gin ("username" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS "user_profiles_display_name_trgm_idx"
	ON "user_profiles" USING gin ("display_name" gin_trgm_ops);

-- ─────────────────────────────────────────────────────────────
-- 3. Feed ranking support
-- ─────────────────────────────────────────────────────────────
-- The ranking subqueries count recent votes and comments per candidate post.
-- These composite indexes let both be answered index-only rather than by
-- visiting the heap for rows that are then discarded on date.
CREATE INDEX IF NOT EXISTS "votes_post_created_idx" ON "votes" ("post_id", "created_at");
CREATE INDEX IF NOT EXISTS "comments_post_status_created_idx"
	ON "comments" ("post_id", "status", "created_at");

-- Partial index for the overwhelmingly common feed predicate. Most rows are
-- PUBLISHED, but excluding the rest keeps the index smaller and hotter.
CREATE INDEX IF NOT EXISTS "posts_published_created_idx"
	ON "posts" ("created_at" DESC)
	WHERE "status" = 'PUBLISHED';
