-- Notification mutes & per-account notification switches.
--
-- The generated `drizzle/` migration chain is stale (its newest snapshot
-- predates most of the current schema), so `drizzle-kit generate` would emit a
-- full recreate of every table. Schema changes reach the database through
-- `bun run db:push`; this file is the same DDL written out explicitly, for
-- applying by hand against a production Neon branch where an interactive push
-- is not wanted.
--
-- Idempotent: safe to run more than once.

CREATE TABLE IF NOT EXISTS "notification_mutes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"muted_user_id" text NOT NULL,
	"channel" text DEFAULT 'ALL' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "notification_preferences" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"messages" boolean DEFAULT true NOT NULL,
	"followed_posts" boolean DEFAULT true NOT NULL,
	"followed_posts_friends_only" boolean DEFAULT false NOT NULL,
	"likes" boolean DEFAULT true NOT NULL,
	"comments" boolean DEFAULT true NOT NULL,
	"mentions" boolean DEFAULT true NOT NULL,
	"follows" boolean DEFAULT true NOT NULL,
	"reposts" boolean DEFAULT true NOT NULL,
	"matches" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notification_preferences_user_id_unique" UNIQUE("user_id")
);

DO $$ BEGIN
	ALTER TABLE "notification_mutes"
		ADD CONSTRAINT "notification_mutes_user_id_user_profiles_id_fk"
		FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
	ALTER TABLE "notification_mutes"
		ADD CONSTRAINT "notification_mutes_muted_user_id_user_profiles_id_fk"
		FOREIGN KEY ("muted_user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
	ALTER TABLE "notification_preferences"
		ADD CONSTRAINT "notification_preferences_user_id_user_profiles_id_fk"
		FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- One row per (owner, muted actor, channel); the write path relies on this for
-- ON CONFLICT DO NOTHING.
CREATE UNIQUE INDEX IF NOT EXISTS "notification_mutes_user_target_channel_idx"
	ON "notification_mutes" ("user_id", "muted_user_id", "channel");

-- Serves the batched fan-out filter: "of these N actors, which are muted for me?"
CREATE INDEX IF NOT EXISTS "notification_mutes_user_channel_idx"
	ON "notification_mutes" ("user_id", "channel");
