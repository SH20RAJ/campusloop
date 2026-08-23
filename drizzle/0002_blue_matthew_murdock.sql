ALTER TABLE "user_profiles" ADD COLUMN "banner_url" text;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "headline" text;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "photos" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "dating_preferences" jsonb;