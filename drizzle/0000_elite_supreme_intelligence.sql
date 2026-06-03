CREATE TYPE "public"."content_status" AS ENUM('PUBLISHED', 'HIDDEN', 'DELETED', 'PENDING_REVIEW');--> statement-breakpoint
CREATE TYPE "public"."domain_verification_status" AS ENUM('UNVERIFIED', 'AUTO_IMPORTED', 'STUDENT_VERIFIED', 'ADMIN_VERIFIED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."institution_domain_type" AS ENUM('WEBSITE', 'EMAIL', 'STUDENT_EMAIL', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."institution_request_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."post_scope" AS ENUM('CAMPUS', 'STATE', 'INDIA', 'GLOBAL');--> statement-breakpoint
CREATE TYPE "public"."post_type" AS ENUM('NORMAL', 'ANONYMOUS', 'CONFESSION', 'POLL', 'QUESTION', 'MEME', 'EVENT', 'LOST_FOUND');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('OPEN', 'REVIEWING', 'RESOLVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."report_target_type" AS ENUM('POST', 'COMMENT', 'USER');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('STUDENT', 'MODERATOR', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('ACTIVE', 'SUSPENDED', 'BANNED');--> statement-breakpoint
CREATE TABLE "blocks" (
	"id" text PRIMARY KEY NOT NULL,
	"blocker_id" text NOT NULL,
	"blocked_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"author_id" text NOT NULL,
	"body" text NOT NULL,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"status" "content_status" DEFAULT 'PUBLISHED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "institution_domains" (
	"id" text PRIMARY KEY NOT NULL,
	"institution_id" text NOT NULL,
	"domain" text NOT NULL,
	"domain_type" "institution_domain_type" DEFAULT 'UNKNOWN' NOT NULL,
	"verification_status" "domain_verification_status" DEFAULT 'UNVERIFIED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "institution_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"email_domain" text,
	"suggested_institution_name" text NOT NULL,
	"state" text,
	"district" text,
	"status" "institution_request_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "institutions" (
	"id" text PRIMARY KEY NOT NULL,
	"aishe_code" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"state" text,
	"district" text,
	"website" text,
	"website_domain" text,
	"year_of_establishment" integer,
	"location_type" text,
	"country" text DEFAULT 'India' NOT NULL,
	"source" text DEFAULT 'colleges_csv' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moderation_actions" (
	"id" text PRIMARY KEY NOT NULL,
	"moderator_id" text NOT NULL,
	"target_type" "report_target_type" NOT NULL,
	"target_id" text NOT NULL,
	"action" text NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poll_options" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "poll_votes" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"option_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" text PRIMARY KEY NOT NULL,
	"author_id" text NOT NULL,
	"institution_id" text NOT NULL,
	"type" "post_type" DEFAULT 'NORMAL' NOT NULL,
	"scope" "post_scope" DEFAULT 'CAMPUS' NOT NULL,
	"title" text,
	"body" text NOT NULL,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"status" "content_status" DEFAULT 'PUBLISHED' NOT NULL,
	"risk_score" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" text PRIMARY KEY NOT NULL,
	"reporter_id" text NOT NULL,
	"target_type" "report_target_type" NOT NULL,
	"target_id" text NOT NULL,
	"reason" text NOT NULL,
	"details" text,
	"status" "report_status" DEFAULT 'OPEN' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"username" text NOT NULL,
	"display_name" text NOT NULL,
	"avatar_url" text,
	"institution_id" text NOT NULL,
	"course" text,
	"branch" text,
	"year" integer,
	"bio" text,
	"interests" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"role" "user_role" DEFAULT 'STUDENT' NOT NULL,
	"status" "user_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"user_id" text NOT NULL,
	"value" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_blocker_id_user_profiles_id_fk" FOREIGN KEY ("blocker_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_blocked_user_id_user_profiles_id_fk" FOREIGN KEY ("blocked_user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_user_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "institution_domains" ADD CONSTRAINT "institution_domains_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderation_actions" ADD CONSTRAINT "moderation_actions_moderator_id_user_profiles_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_options" ADD CONSTRAINT "poll_options_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_option_id_poll_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."poll_options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_user_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_user_profiles_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "blocks_blocker_blocked_idx" ON "blocks" USING btree ("blocker_id","blocked_user_id");--> statement-breakpoint
CREATE INDEX "comments_post_created_idx" ON "comments" USING btree ("post_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "institution_domains_domain_idx" ON "institution_domains" USING btree ("domain");--> statement-breakpoint
CREATE UNIQUE INDEX "institution_domains_institution_domain_idx" ON "institution_domains" USING btree ("institution_id","domain");--> statement-breakpoint
CREATE INDEX "institution_requests_status_created_idx" ON "institution_requests" USING btree ("status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "institutions_aishe_code_idx" ON "institutions" USING btree ("aishe_code");--> statement-breakpoint
CREATE UNIQUE INDEX "institutions_slug_idx" ON "institutions" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "institutions_search_idx" ON "institutions" USING btree ("name","state","district","website_domain");--> statement-breakpoint
CREATE INDEX "moderation_actions_target_idx" ON "moderation_actions" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "poll_options_post_idx" ON "poll_options" USING btree ("post_id");--> statement-breakpoint
CREATE UNIQUE INDEX "poll_votes_user_post_idx" ON "poll_votes" USING btree ("user_id","post_id");--> statement-breakpoint
CREATE INDEX "poll_votes_option_idx" ON "poll_votes" USING btree ("option_id");--> statement-breakpoint
CREATE INDEX "posts_institution_status_created_idx" ON "posts" USING btree ("institution_id","status","created_at");--> statement-breakpoint
CREATE INDEX "posts_scope_status_created_idx" ON "posts" USING btree ("scope","status","created_at");--> statement-breakpoint
CREATE INDEX "posts_author_idx" ON "posts" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "reports_status_created_idx" ON "reports" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "reports_target_idx" ON "reports" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_profiles_user_id_idx" ON "user_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_profiles_username_idx" ON "user_profiles" USING btree ("username");--> statement-breakpoint
CREATE INDEX "user_profiles_institution_idx" ON "user_profiles" USING btree ("institution_id");--> statement-breakpoint
CREATE UNIQUE INDEX "votes_user_post_idx" ON "votes" USING btree ("user_id","post_id");