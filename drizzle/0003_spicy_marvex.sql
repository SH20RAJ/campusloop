CREATE TYPE "public"."external_content_type" AS ENUM('TEXT', 'IMAGE', 'VIDEO', 'GIF', 'GALLERY', 'LINK', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."external_media_status" AS ENUM('ACTIVE', 'EXPIRED', 'REMOVED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."external_media_type" AS ENUM('IMAGE', 'VIDEO', 'GIF', 'LINK');--> statement-breakpoint
CREATE TYPE "public"."external_source" AS ENUM('reddit', 'twitter', 'youtube');--> statement-breakpoint
ALTER TYPE "public"."content_status" ADD VALUE 'ARCHIVED';--> statement-breakpoint
CREATE TABLE "academic_playlist_items" (
	"id" text PRIMARY KEY NOT NULL,
	"playlist_id" text NOT NULL,
	"resource_id" text NOT NULL,
	"section_name" text DEFAULT 'Core Materials' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"curator_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "academic_playlist_stars" (
	"id" text PRIMARY KEY NOT NULL,
	"playlist_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "academic_playlists" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"creator_id" text NOT NULL,
	"institution_id" text,
	"branch" text DEFAULT 'All' NOT NULL,
	"semester" integer,
	"category" text DEFAULT 'SEMESTER_PACK' NOT NULL,
	"visibility" text DEFAULT 'PUBLIC' NOT NULL,
	"cover_gradient" text DEFAULT 'from-indigo-600 via-purple-600 to-pink-600' NOT NULL,
	"stars_count" integer DEFAULT 0 NOT NULL,
	"views_count" integer DEFAULT 0 NOT NULL,
	"items_count" integer DEFAULT 0 NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "academic_playlists_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "academic_resource_comments" (
	"id" text PRIMARY KEY NOT NULL,
	"resource_id" text NOT NULL,
	"author_id" text NOT NULL,
	"body" text NOT NULL,
	"is_helpful" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "academic_resource_votes" (
	"id" text PRIMARY KEY NOT NULL,
	"resource_id" text NOT NULL,
	"profile_id" text NOT NULL,
	"vote_type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "academic_resources" (
	"id" text PRIMARY KEY NOT NULL,
	"institution_id" text NOT NULL,
	"uploader_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"subject_code" text NOT NULL,
	"subject_name" text NOT NULL,
	"branch" text DEFAULT 'All' NOT NULL,
	"semester" integer DEFAULT 1 NOT NULL,
	"resource_type" text DEFAULT 'NOTES' NOT NULL,
	"module_or_chapter" text,
	"file_url" text,
	"drive_url" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"upvotes_count" integer DEFAULT 0 NOT NULL,
	"downvotes_count" integer DEFAULT 0 NOT NULL,
	"downloads_count" integer DEFAULT 0 NOT NULL,
	"views_count" integer DEFAULT 0 NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_academic_resources" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"resource_id" text NOT NULL,
	"semester" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_conversations" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"mode" text DEFAULT 'campus' NOT NULL,
	"title" text,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_message_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "ai_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"message_id" text NOT NULL,
	"rating" text NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"model" text,
	"input_tokens" integer DEFAULT 0,
	"output_tokens" integer DEFAULT 0,
	"tool_calls" jsonb DEFAULT '[]'::jsonb,
	"source_ids" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_usage_events" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"conversation_id" text,
	"request_type" text NOT NULL,
	"model" text NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"tool_count" integer DEFAULT 0 NOT NULL,
	"latency_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "article_comment_votes" (
	"id" text PRIMARY KEY NOT NULL,
	"comment_id" text NOT NULL,
	"profile_id" text NOT NULL,
	"value" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "article_comments" (
	"id" text PRIMARY KEY NOT NULL,
	"article_id" text NOT NULL,
	"author_id" text NOT NULL,
	"parent_id" text,
	"body" text NOT NULL,
	"upvotes_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "article_votes" (
	"id" text PRIMARY KEY NOT NULL,
	"article_id" text NOT NULL,
	"profile_id" text NOT NULL,
	"value" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"excerpt" text,
	"content" text NOT NULL,
	"cover_image_url" text,
	"author_id" text NOT NULL,
	"institution_id" text,
	"category" varchar(32) DEFAULT 'GENERAL' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"reading_time_minutes" integer DEFAULT 3 NOT NULL,
	"views_count" integer DEFAULT 0 NOT NULL,
	"upvotes_count" integer DEFAULT 0 NOT NULL,
	"downvotes_count" integer DEFAULT 0 NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"status" varchar(16) DEFAULT 'PUBLISHED' NOT NULL,
	"published_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "call_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text,
	"caller_id" text NOT NULL,
	"receiver_id" text NOT NULL,
	"type" text DEFAULT 'video' NOT NULL,
	"context" text DEFAULT 'chat' NOT NULL,
	"status" text DEFAULT 'CALLING' NOT NULL,
	"caller_peer_id" text,
	"receiver_peer_id" text,
	"ended_reason" text,
	"duration_seconds" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp with time zone,
	"accepted_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_behavior_events" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"event_type" text NOT NULL,
	"target_type" text,
	"target_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"weight" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "barber_appointments" (
	"id" text PRIMARY KEY NOT NULL,
	"appointment_number" text NOT NULL,
	"token_number" integer DEFAULT 1 NOT NULL,
	"merchant_id" text NOT NULL,
	"student_id" text NOT NULL,
	"institution_id" text NOT NULL,
	"service_id" text NOT NULL,
	"appointment_date" text NOT NULL,
	"time_slot" text NOT NULL,
	"service_name_snapshot" text NOT NULL,
	"service_price_snapshot" integer NOT NULL,
	"duration_minutes" integer DEFAULT 25 NOT NULL,
	"status" text DEFAULT 'BOOKED' NOT NULL,
	"payment_status" text DEFAULT 'PENDING' NOT NULL,
	"payment_method" text DEFAULT 'COD' NOT NULL,
	"customer_name" text NOT NULL,
	"customer_phone" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "barber_appointments_appointment_number_unique" UNIQUE("appointment_number")
);
--> statement-breakpoint
CREATE TABLE "barber_services" (
	"id" text PRIMARY KEY NOT NULL,
	"merchant_id" text NOT NULL,
	"name" text NOT NULL,
	"category" text DEFAULT 'Hair' NOT NULL,
	"duration_minutes" integer DEFAULT 25 NOT NULL,
	"price" integer NOT NULL,
	"original_price" integer,
	"description" text,
	"gender_target" text DEFAULT 'UNISEX' NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bike_availability_blocks" (
	"id" text PRIMARY KEY NOT NULL,
	"bike_id" text NOT NULL,
	"merchant_id" text NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"reason" text DEFAULT 'MAINTENANCE' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bike_booking_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"student_id" text NOT NULL,
	"driving_license_number" text NOT NULL,
	"driving_license_url" text,
	"aadhaar_last_4" text,
	"aadhaar_url" text,
	"student_id_card_url" text,
	"status" text DEFAULT 'VERIFIED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bike_booking_status_history" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"from_status" text,
	"to_status" text NOT NULL,
	"changed_by" text NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bike_bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_number" text NOT NULL,
	"bike_id" text NOT NULL,
	"student_id" text NOT NULL,
	"merchant_id" text NOT NULL,
	"institution_id" text NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"actual_pickup_at" timestamp with time zone,
	"actual_return_at" timestamp with time zone,
	"rental_amount" integer NOT NULL,
	"deposit_amount" integer NOT NULL,
	"late_fee_amount" integer DEFAULT 0 NOT NULL,
	"damage_fee_amount" integer DEFAULT 0 NOT NULL,
	"total_amount" integer NOT NULL,
	"status" text DEFAULT 'REQUESTED' NOT NULL,
	"payment_status" text DEFAULT 'PENDING' NOT NULL,
	"payment_method" text DEFAULT 'COD' NOT NULL,
	"deposit_refund_status" text DEFAULT 'HELD' NOT NULL,
	"cancellation_reason" text,
	"cancelled_by" text,
	"customer_phone" text NOT NULL,
	"hostel_address" text NOT NULL,
	"special_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bike_bookings_booking_number_unique" UNIQUE("booking_number")
);
--> statement-breakpoint
CREATE TABLE "bike_inspections" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"bike_id" text NOT NULL,
	"type" text NOT NULL,
	"front_ok" boolean DEFAULT true NOT NULL,
	"rear_ok" boolean DEFAULT true NOT NULL,
	"tyres_ok" boolean DEFAULT true NOT NULL,
	"lights_ok" boolean DEFAULT true NOT NULL,
	"odometer_km" integer,
	"fuel_level" text DEFAULT 'FULL',
	"has_damage" boolean DEFAULT false NOT NULL,
	"damage_notes" text,
	"photos" jsonb DEFAULT '[]'::jsonb,
	"inspector_role" text DEFAULT 'MERCHANT' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bikes" (
	"id" text PRIMARY KEY NOT NULL,
	"merchant_id" text NOT NULL,
	"name" text NOT NULL,
	"model" text NOT NULL,
	"registration_number" text NOT NULL,
	"image_url" text,
	"hourly_price" integer DEFAULT 50 NOT NULL,
	"daily_price" integer DEFAULT 350 NOT NULL,
	"security_deposit" integer DEFAULT 1500 NOT NULL,
	"pickup_location" text DEFAULT 'Campus Main Gate' NOT NULL,
	"fuel_type" text DEFAULT 'PETROL' NOT NULL,
	"specs" jsonb DEFAULT '{"helmetIncluded":true}'::jsonb,
	"status" text DEFAULT 'AVAILABLE' NOT NULL,
	"rating" text DEFAULT '4.8' NOT NULL,
	"review_count" integer DEFAULT 12 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "laundry_orders" (
	"id" text PRIMARY KEY NOT NULL,
	"order_number" text NOT NULL,
	"bag_tag_number" text,
	"merchant_id" text NOT NULL,
	"student_id" text NOT NULL,
	"institution_id" text NOT NULL,
	"wash_type" text DEFAULT 'Wash & Fold' NOT NULL,
	"estimated_weight_kg" text DEFAULT '4' NOT NULL,
	"actual_weight_kg" text,
	"piece_count" integer,
	"pickup_date" text NOT NULL,
	"pickup_slot" text NOT NULL,
	"delivery_date" text,
	"delivery_slot" text,
	"hostel_block" text NOT NULL,
	"room_number" text NOT NULL,
	"customer_phone" text NOT NULL,
	"special_instructions" text,
	"status" text DEFAULT 'PICKUP_REQUESTED' NOT NULL,
	"total_amount" integer DEFAULT 120 NOT NULL,
	"payment_status" text DEFAULT 'PENDING' NOT NULL,
	"payment_method" text DEFAULT 'COD' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "laundry_orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "laundry_services" (
	"id" text PRIMARY KEY NOT NULL,
	"merchant_id" text NOT NULL,
	"name" text NOT NULL,
	"pricing_type" text DEFAULT 'PER_KG' NOT NULL,
	"price" integer NOT NULL,
	"min_weight_kg" integer DEFAULT 3,
	"turnaround_hours" integer DEFAULT 24 NOT NULL,
	"description" text,
	"is_available" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"icon" text NOT NULL,
	"description" text,
	"parent_id" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "marketplace_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "marketplace_offers" (
	"id" text PRIMARY KEY NOT NULL,
	"merchant_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"discount_type" text DEFAULT 'PERCENTAGE' NOT NULL,
	"discount_value" integer NOT NULL,
	"min_order_value" integer DEFAULT 0 NOT NULL,
	"code" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_order_items" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"product_id" text NOT NULL,
	"product_name_snapshot" text NOT NULL,
	"unit_price_snapshot" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"selected_options" jsonb DEFAULT '{}'::jsonb,
	"selected_addons" jsonb DEFAULT '[]'::jsonb,
	"subtotal" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_orders" (
	"id" text PRIMARY KEY NOT NULL,
	"order_number" text NOT NULL,
	"student_id" text NOT NULL,
	"merchant_id" text NOT NULL,
	"institution_id" text NOT NULL,
	"category_slug" text DEFAULT 'food' NOT NULL,
	"fulfillment_type" text DEFAULT 'DELIVERY' NOT NULL,
	"status" text DEFAULT 'PLACED' NOT NULL,
	"subtotal" integer NOT NULL,
	"delivery_fee" integer DEFAULT 0 NOT NULL,
	"discount" integer DEFAULT 0 NOT NULL,
	"total" integer NOT NULL,
	"payment_status" text DEFAULT 'PENDING' NOT NULL,
	"payment_method" text DEFAULT 'COD' NOT NULL,
	"customer_note" text,
	"rejection_reason" text,
	"delivery_address" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "marketplace_orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "marketplace_reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"merchant_id" text NOT NULL,
	"student_id" text NOT NULL,
	"order_id" text,
	"rating" integer DEFAULT 5 NOT NULL,
	"comment" text,
	"reply" text,
	"reply_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchant_business_hours" (
	"id" text PRIMARY KEY NOT NULL,
	"merchant_id" text NOT NULL,
	"day_of_week" integer NOT NULL,
	"open_time" text DEFAULT '09:00' NOT NULL,
	"close_time" text DEFAULT '23:00' NOT NULL,
	"is_closed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchant_users" (
	"id" text PRIMARY KEY NOT NULL,
	"merchant_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'OWNER' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchants" (
	"id" text PRIMARY KEY NOT NULL,
	"institution_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"category_slug" text DEFAULT 'food' NOT NULL,
	"description" text,
	"logo_url" text,
	"cover_url" text,
	"phone" text,
	"email" text,
	"address" text NOT NULL,
	"location_pin" text,
	"rating" text DEFAULT '4.7' NOT NULL,
	"review_count" integer DEFAULT 24 NOT NULL,
	"is_delivery_enabled" boolean DEFAULT true NOT NULL,
	"is_pickup_enabled" boolean DEFAULT true NOT NULL,
	"delivery_radius_km" integer DEFAULT 3 NOT NULL,
	"delivery_fee" integer DEFAULT 20 NOT NULL,
	"min_order_value" integer DEFAULT 80 NOT NULL,
	"free_delivery_above" integer DEFAULT 299,
	"estimated_prep_time" text DEFAULT '15–25 min' NOT NULL,
	"pickup_instructions" text DEFAULT 'Collect from the main counter by showing your order number.',
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"is_open" boolean DEFAULT true NOT NULL,
	"vertical_type" text DEFAULT 'FOOD' NOT NULL,
	"login_username" text,
	"login_password" text,
	"upi_id" text,
	"bank_account_details" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"merchant_id" text NOT NULL,
	"category_id" text,
	"category_name" text DEFAULT 'Popular Items' NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"image_url" text,
	"price" integer NOT NULL,
	"original_price" integer,
	"preparation_time" text DEFAULT '15 min',
	"is_available" boolean DEFAULT true NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"is_veg" boolean DEFAULT true NOT NULL,
	"is_non_veg" boolean DEFAULT false NOT NULL,
	"spicy_level" text,
	"stock_quantity" integer,
	"sku" text,
	"is_subscription_eligible" boolean DEFAULT false NOT NULL,
	"options" jsonb DEFAULT '[]'::jsonb,
	"addons" jsonb DEFAULT '[]'::jsonb,
	"fulfillment_modes" jsonb DEFAULT '["delivery","pickup"]'::jsonb NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_marketplace_items" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"target_type" text DEFAULT 'MERCHANT' NOT NULL,
	"target_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "water_orders" (
	"id" text PRIMARY KEY NOT NULL,
	"order_number" text NOT NULL,
	"merchant_id" text NOT NULL,
	"student_id" text NOT NULL,
	"institution_id" text NOT NULL,
	"can_count" integer DEFAULT 1 NOT NULL,
	"empty_can_returned_count" integer DEFAULT 1 NOT NULL,
	"delivery_type" text DEFAULT 'INSTANT' NOT NULL,
	"subscription_id" text,
	"hostel_block" text NOT NULL,
	"room_number" text NOT NULL,
	"floor_number" text,
	"customer_phone" text NOT NULL,
	"status" text DEFAULT 'PLACED' NOT NULL,
	"total_amount" integer DEFAULT 35 NOT NULL,
	"payment_status" text DEFAULT 'PENDING' NOT NULL,
	"payment_method" text DEFAULT 'COD' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "water_orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "water_products" (
	"id" text PRIMARY KEY NOT NULL,
	"merchant_id" text NOT NULL,
	"name" text NOT NULL,
	"size_liters" integer DEFAULT 20 NOT NULL,
	"price" integer NOT NULL,
	"deposit_amount" integer DEFAULT 150 NOT NULL,
	"image_url" text,
	"is_subscription_eligible" boolean DEFAULT true NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "water_subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"subscription_number" text NOT NULL,
	"merchant_id" text NOT NULL,
	"student_id" text NOT NULL,
	"institution_id" text NOT NULL,
	"plan_name" text DEFAULT 'Monthly 15 Cans Pass' NOT NULL,
	"total_cans" integer DEFAULT 15 NOT NULL,
	"cans_delivered" integer DEFAULT 0 NOT NULL,
	"cans_remaining" integer DEFAULT 15 NOT NULL,
	"price_paid" integer NOT NULL,
	"hostel_block" text NOT NULL,
	"room_number" text NOT NULL,
	"customer_phone" text NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "water_subscriptions_subscription_number_unique" UNIQUE("subscription_number")
);
--> statement-breakpoint
CREATE TABLE "secret_crush_attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"sender_id" text NOT NULL,
	"target_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "secret_crushes" (
	"id" text PRIMARY KEY NOT NULL,
	"sender_id" text NOT NULL,
	"target_id" text NOT NULL,
	"is_mutual" boolean DEFAULT false NOT NULL,
	"matched_at" timestamp,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_registrations" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"profile_id" text NOT NULL,
	"registration_type" varchar(16) DEFAULT 'SOLO' NOT NULL,
	"team_name" text,
	"team_members" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"contact_phone" text,
	"notes" text,
	"status" varchar(16) DEFAULT 'CONFIRMED' NOT NULL,
	"reminder_set" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"tagline" text,
	"description" text NOT NULL,
	"banner_url" text,
	"club_name" text NOT NULL,
	"organizer_profile_id" text NOT NULL,
	"institution_id" text NOT NULL,
	"eligible_institution_ids" jsonb DEFAULT '["ALL"]'::jsonb NOT NULL,
	"event_type" varchar(32) DEFAULT 'HACKATHON' NOT NULL,
	"mode" varchar(16) DEFAULT 'OFFLINE' NOT NULL,
	"venue" text,
	"meeting_url" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"registration_deadline" timestamp,
	"participation_type" varchar(16) DEFAULT 'SOLO' NOT NULL,
	"min_team_size" integer DEFAULT 1,
	"max_team_size" integer DEFAULT 4,
	"max_participants" integer,
	"is_paid" boolean DEFAULT false NOT NULL,
	"entry_fee" text DEFAULT 'Free',
	"prizes_description" text,
	"perks" jsonb DEFAULT '["Certificates","Prizes","Loop Points"]'::jsonb NOT NULL,
	"loop_points_reward" integer DEFAULT 25 NOT NULL,
	"status" varchar(16) DEFAULT 'PUBLISHED' NOT NULL,
	"visibility" varchar(16) DEFAULT 'PUBLIC' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "external_media" (
	"id" text PRIMARY KEY NOT NULL,
	"external_post_id" text NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "external_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
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
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"relevance_score" integer DEFAULT 0 NOT NULL,
	"content_type" "external_content_type" DEFAULT 'TEXT' NOT NULL,
	"source_metadata" jsonb,
	"last_checked_at" text,
	"media_status" "external_media_status" DEFAULT 'ACTIVE' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feed_boosts" (
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
--> statement-breakpoint
CREATE TABLE "gaming_lobbies" (
	"id" text PRIMARY KEY NOT NULL,
	"institution_id" text NOT NULL,
	"host_id" text NOT NULL,
	"game_name" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"mode" text DEFAULT '5v5' NOT NULL,
	"rank_tier" text,
	"gamer_tag" text,
	"slots_total" integer DEFAULT 5 NOT NULL,
	"slots_filled" integer DEFAULT 1 NOT NULL,
	"discord_or_voice_url" text,
	"scheduled_at" text,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"players" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "housing_listings" (
	"id" text PRIMARY KEY NOT NULL,
	"institution_id" text NOT NULL,
	"author_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"location" text NOT NULL,
	"distance_from_campus" text,
	"rent_per_month" integer NOT NULL,
	"deposit" integer,
	"occupancy_type" text DEFAULT 'SINGLE_ROOM' NOT NULL,
	"gender_preference" text DEFAULT 'ANY' NOT NULL,
	"amenities" text,
	"images" text,
	"contact_info" text,
	"status" text DEFAULT 'AVAILABLE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lost_and_found_items" (
	"id" text PRIMARY KEY NOT NULL,
	"institution_id" text NOT NULL,
	"author_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text DEFAULT 'Other' NOT NULL,
	"location" text NOT NULL,
	"item_date" text,
	"image_url" text,
	"contact_info" text,
	"reward" text,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "marketplace_items" (
	"id" text PRIMARY KEY NOT NULL,
	"institution_id" text NOT NULL,
	"seller_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"original_price" integer,
	"condition" text DEFAULT 'GOOD' NOT NULL,
	"category" text DEFAULT 'Other' NOT NULL,
	"hostel_location" text,
	"is_negotiable" boolean DEFAULT true NOT NULL,
	"images" text,
	"is_sold" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_mutes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"muted_user_id" text NOT NULL,
	"channel" text DEFAULT 'ALL' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
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
--> statement-breakpoint
CREATE TABLE "random_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "random_queue" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"institution_id" text NOT NULL,
	"mode" text DEFAULT 'MY_CAMPUS' NOT NULL,
	"interests" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"year" text,
	"department" text,
	"last_heartbeat" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "random_queue_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "random_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"reporter_id" text NOT NULL,
	"reported_user_id" text NOT NULL,
	"reason" text NOT NULL,
	"details" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "random_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_a_id" text NOT NULL,
	"user_b_id" text NOT NULL,
	"mode" text DEFAULT 'MY_CAMPUS' NOT NULL,
	"institution_id" text,
	"matched_interests" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"ended_reason" text,
	"user_a_revealed" boolean DEFAULT false NOT NULL,
	"user_b_revealed" boolean DEFAULT false NOT NULL,
	"user_a_video_requested" boolean DEFAULT false NOT NULL,
	"user_b_video_requested" boolean DEFAULT false NOT NULL,
	"user_a_peer_id" text,
	"user_b_peer_id" text,
	"user_a_continued" boolean DEFAULT false NOT NULL,
	"user_b_continued" boolean DEFAULT false NOT NULL,
	"conversation_id" text,
	"rating_a" text,
	"rating_b" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "link_clicks" (
	"id" text PRIMARY KEY NOT NULL,
	"short_link_id" text,
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
--> statement-breakpoint
CREATE TABLE "short_links" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" varchar(64) NOT NULL,
	"target_url" text NOT NULL,
	"title" varchar(255),
	"clicks" integer DEFAULT 0 NOT NULL,
	"unique_clicks" integer DEFAULT 0 NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "short_links_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "rideshare_pools" (
	"id" text PRIMARY KEY NOT NULL,
	"institution_id" text NOT NULL,
	"creator_id" text NOT NULL,
	"origin" text NOT NULL,
	"destination" text NOT NULL,
	"departure_time" text NOT NULL,
	"vehicle_type" text DEFAULT 'AUTO' NOT NULL,
	"total_seats" integer DEFAULT 4 NOT NULL,
	"available_seats" integer DEFAULT 3 NOT NULL,
	"price_per_seat" integer NOT NULL,
	"contact_info" text,
	"notes" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"passengers" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"profile_id" text NOT NULL,
	"post_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "story_highlights" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"cover_url" text,
	"story_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "story_likes" (
	"id" text PRIMARY KEY NOT NULL,
	"story_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "capsule_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"capsule_id" text NOT NULL,
	"author_id" text NOT NULL,
	"entry_type" text DEFAULT 'LETTER' NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"media_url" text,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"pseudonym" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_capsules" (
	"id" text PRIMARY KEY NOT NULL,
	"institution_id" text NOT NULL,
	"creator_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"target_unlock_date" timestamp NOT NULL,
	"category" text DEFAULT 'CONVOCATION' NOT NULL,
	"is_unlocked" boolean DEFAULT false NOT NULL,
	"entries_count" integer DEFAULT 0 NOT NULL,
	"cover_image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"id" text PRIMARY KEY NOT NULL,
	"follower_id" text NOT NULL,
	"following_id" text NOT NULL,
	"is_mutual" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"user_agent" text,
	"failure_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "posts_author_idx";--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "banner_url" text;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "privacy" text DEFAULT 'PUBLIC' NOT NULL;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "category" text DEFAULT 'General' NOT NULL;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "rules" text;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "allow_anonymous_posts" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "points" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "invite_code" text;--> statement-breakpoint
ALTER TABLE "communities" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "community_members" ADD COLUMN "role" text DEFAULT 'MEMBER' NOT NULL;--> statement-breakpoint
ALTER TABLE "community_members" ADD COLUMN "status" text DEFAULT 'ACTIVE' NOT NULL;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD COLUMN "is_archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD COLUMN "is_muted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD COLUMN "is_pinned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "conversation_participants" ADD COLUMN "last_cleared_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "community_id" text;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "type" text DEFAULT 'DIRECT' NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "institutions" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "institutions" ADD COLUMN "banner_url" text;--> statement-breakpoint
ALTER TABLE "institutions" ADD COLUMN "nirf_rank" integer;--> statement-breakpoint
ALTER TABLE "institutions" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "institutions" ADD COLUMN "extra_data" jsonb;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "read_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "reactions" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "preview_text" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "is_seeded" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "dob" text;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "is_dob_private" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "target_institution_ids" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "anonymous_username" text;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "feed_visibility" text DEFAULT 'ALL' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "social_links" jsonb DEFAULT '{"platforms":{},"custom":[]}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "last_seen_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "is_seeded" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "academic_playlist_items" ADD CONSTRAINT "academic_playlist_items_playlist_id_academic_playlists_id_fk" FOREIGN KEY ("playlist_id") REFERENCES "public"."academic_playlists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_playlist_items" ADD CONSTRAINT "academic_playlist_items_resource_id_academic_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."academic_resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_playlist_stars" ADD CONSTRAINT "academic_playlist_stars_playlist_id_academic_playlists_id_fk" FOREIGN KEY ("playlist_id") REFERENCES "public"."academic_playlists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_playlist_stars" ADD CONSTRAINT "academic_playlist_stars_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_playlists" ADD CONSTRAINT "academic_playlists_creator_id_user_profiles_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_playlists" ADD CONSTRAINT "academic_playlists_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_resource_comments" ADD CONSTRAINT "academic_resource_comments_resource_id_academic_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."academic_resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_resource_comments" ADD CONSTRAINT "academic_resource_comments_author_id_user_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_resource_votes" ADD CONSTRAINT "academic_resource_votes_resource_id_academic_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."academic_resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_resource_votes" ADD CONSTRAINT "academic_resource_votes_profile_id_user_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_resources" ADD CONSTRAINT "academic_resources_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_resources" ADD CONSTRAINT "academic_resources_uploader_id_user_profiles_id_fk" FOREIGN KEY ("uploader_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_academic_resources" ADD CONSTRAINT "saved_academic_resources_profile_id_user_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_academic_resources" ADD CONSTRAINT "saved_academic_resources_resource_id_academic_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."academic_resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_feedback" ADD CONSTRAINT "ai_feedback_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_feedback" ADD CONSTRAINT "ai_feedback_message_id_ai_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."ai_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversation_id_ai_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."ai_conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_usage_events" ADD CONSTRAINT "ai_usage_events_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_comment_votes" ADD CONSTRAINT "article_comment_votes_comment_id_article_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."article_comments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_comment_votes" ADD CONSTRAINT "article_comment_votes_profile_id_user_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_comments" ADD CONSTRAINT "article_comments_author_id_user_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_votes" ADD CONSTRAINT "article_votes_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_votes" ADD CONSTRAINT "article_votes_profile_id_user_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_user_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_sessions" ADD CONSTRAINT "call_sessions_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_sessions" ADD CONSTRAINT "call_sessions_caller_id_user_profiles_id_fk" FOREIGN KEY ("caller_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_sessions" ADD CONSTRAINT "call_sessions_receiver_id_user_profiles_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_behavior_events" ADD CONSTRAINT "user_behavior_events_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barber_appointments" ADD CONSTRAINT "barber_appointments_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barber_appointments" ADD CONSTRAINT "barber_appointments_student_id_user_profiles_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barber_appointments" ADD CONSTRAINT "barber_appointments_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barber_appointments" ADD CONSTRAINT "barber_appointments_service_id_barber_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."barber_services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barber_services" ADD CONSTRAINT "barber_services_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bike_availability_blocks" ADD CONSTRAINT "bike_availability_blocks_bike_id_bikes_id_fk" FOREIGN KEY ("bike_id") REFERENCES "public"."bikes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bike_availability_blocks" ADD CONSTRAINT "bike_availability_blocks_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bike_booking_documents" ADD CONSTRAINT "bike_booking_documents_booking_id_bike_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bike_bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bike_booking_documents" ADD CONSTRAINT "bike_booking_documents_student_id_user_profiles_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bike_booking_status_history" ADD CONSTRAINT "bike_booking_status_history_booking_id_bike_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bike_bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bike_bookings" ADD CONSTRAINT "bike_bookings_bike_id_bikes_id_fk" FOREIGN KEY ("bike_id") REFERENCES "public"."bikes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bike_bookings" ADD CONSTRAINT "bike_bookings_student_id_user_profiles_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bike_bookings" ADD CONSTRAINT "bike_bookings_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bike_bookings" ADD CONSTRAINT "bike_bookings_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bike_inspections" ADD CONSTRAINT "bike_inspections_booking_id_bike_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bike_bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bike_inspections" ADD CONSTRAINT "bike_inspections_bike_id_bikes_id_fk" FOREIGN KEY ("bike_id") REFERENCES "public"."bikes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bikes" ADD CONSTRAINT "bikes_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laundry_orders" ADD CONSTRAINT "laundry_orders_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laundry_orders" ADD CONSTRAINT "laundry_orders_student_id_user_profiles_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laundry_orders" ADD CONSTRAINT "laundry_orders_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laundry_services" ADD CONSTRAINT "laundry_services_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_offers" ADD CONSTRAINT "marketplace_offers_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_order_items" ADD CONSTRAINT "marketplace_order_items_order_id_marketplace_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."marketplace_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_orders" ADD CONSTRAINT "marketplace_orders_student_id_user_profiles_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_orders" ADD CONSTRAINT "marketplace_orders_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_orders" ADD CONSTRAINT "marketplace_orders_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_reviews" ADD CONSTRAINT "marketplace_reviews_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_reviews" ADD CONSTRAINT "marketplace_reviews_student_id_user_profiles_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant_business_hours" ADD CONSTRAINT "merchant_business_hours_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant_users" ADD CONSTRAINT "merchant_users_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant_users" ADD CONSTRAINT "merchant_users_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchants" ADD CONSTRAINT "merchants_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_marketplace_items" ADD CONSTRAINT "saved_marketplace_items_student_id_user_profiles_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "water_orders" ADD CONSTRAINT "water_orders_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "water_orders" ADD CONSTRAINT "water_orders_student_id_user_profiles_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "water_orders" ADD CONSTRAINT "water_orders_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "water_products" ADD CONSTRAINT "water_products_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "water_subscriptions" ADD CONSTRAINT "water_subscriptions_merchant_id_merchants_id_fk" FOREIGN KEY ("merchant_id") REFERENCES "public"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "water_subscriptions" ADD CONSTRAINT "water_subscriptions_student_id_user_profiles_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "water_subscriptions" ADD CONSTRAINT "water_subscriptions_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secret_crush_attempts" ADD CONSTRAINT "secret_crush_attempts_sender_id_user_profiles_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secret_crush_attempts" ADD CONSTRAINT "secret_crush_attempts_target_id_user_profiles_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secret_crushes" ADD CONSTRAINT "secret_crushes_sender_id_user_profiles_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secret_crushes" ADD CONSTRAINT "secret_crushes_target_id_user_profiles_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_profile_id_user_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organizer_profile_id_user_profiles_id_fk" FOREIGN KEY ("organizer_profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_media" ADD CONSTRAINT "external_media_external_post_id_external_posts_id_fk" FOREIGN KEY ("external_post_id") REFERENCES "public"."external_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "external_posts" ADD CONSTRAINT "external_posts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_boosts" ADD CONSTRAINT "feed_boosts_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feed_boosts" ADD CONSTRAINT "feed_boosts_created_by_profile_id_user_profiles_id_fk" FOREIGN KEY ("created_by_profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gaming_lobbies" ADD CONSTRAINT "gaming_lobbies_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gaming_lobbies" ADD CONSTRAINT "gaming_lobbies_host_id_user_profiles_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "housing_listings" ADD CONSTRAINT "housing_listings_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "housing_listings" ADD CONSTRAINT "housing_listings_author_id_user_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lost_and_found_items" ADD CONSTRAINT "lost_and_found_items_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lost_and_found_items" ADD CONSTRAINT "lost_and_found_items_author_id_user_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_items" ADD CONSTRAINT "marketplace_items_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "marketplace_items" ADD CONSTRAINT "marketplace_items_seller_id_user_profiles_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_mutes" ADD CONSTRAINT "notification_mutes_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_mutes" ADD CONSTRAINT "notification_mutes_muted_user_id_user_profiles_id_fk" FOREIGN KEY ("muted_user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "random_messages" ADD CONSTRAINT "random_messages_session_id_random_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."random_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "random_messages" ADD CONSTRAINT "random_messages_sender_id_user_profiles_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "random_queue" ADD CONSTRAINT "random_queue_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "random_queue" ADD CONSTRAINT "random_queue_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "random_reports" ADD CONSTRAINT "random_reports_session_id_random_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."random_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "random_reports" ADD CONSTRAINT "random_reports_reporter_id_user_profiles_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "random_reports" ADD CONSTRAINT "random_reports_reported_user_id_user_profiles_id_fk" FOREIGN KEY ("reported_user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "random_sessions" ADD CONSTRAINT "random_sessions_user_a_id_user_profiles_id_fk" FOREIGN KEY ("user_a_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "random_sessions" ADD CONSTRAINT "random_sessions_user_b_id_user_profiles_id_fk" FOREIGN KEY ("user_b_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "random_sessions" ADD CONSTRAINT "random_sessions_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "link_clicks" ADD CONSTRAINT "link_clicks_short_link_id_short_links_id_fk" FOREIGN KEY ("short_link_id") REFERENCES "public"."short_links"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "short_links" ADD CONSTRAINT "short_links_created_by_user_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rideshare_pools" ADD CONSTRAINT "rideshare_pools_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rideshare_pools" ADD CONSTRAINT "rideshare_pools_creator_id_user_profiles_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_posts" ADD CONSTRAINT "saved_posts_profile_id_user_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_posts" ADD CONSTRAINT "saved_posts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_highlights" ADD CONSTRAINT "story_highlights_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_likes" ADD CONSTRAINT "story_likes_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "story_likes" ADD CONSTRAINT "story_likes_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capsule_entries" ADD CONSTRAINT "capsule_entries_capsule_id_time_capsules_id_fk" FOREIGN KEY ("capsule_id") REFERENCES "public"."time_capsules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capsule_entries" ADD CONSTRAINT "capsule_entries_author_id_user_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_capsules" ADD CONSTRAINT "time_capsules_institution_id_institutions_id_fk" FOREIGN KEY ("institution_id") REFERENCES "public"."institutions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_capsules" ADD CONSTRAINT "time_capsules_creator_id_user_profiles_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_user_profiles_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_user_profiles_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "academic_items_playlist_order_idx" ON "academic_playlist_items" USING btree ("playlist_id","sort_order");--> statement-breakpoint
CREATE INDEX "academic_items_resource_idx" ON "academic_playlist_items" USING btree ("resource_id");--> statement-breakpoint
CREATE UNIQUE INDEX "academic_items_playlist_res_uniq" ON "academic_playlist_items" USING btree ("playlist_id","resource_id");--> statement-breakpoint
CREATE UNIQUE INDEX "academic_playlist_stars_unique_idx" ON "academic_playlist_stars" USING btree ("playlist_id","user_id");--> statement-breakpoint
CREATE INDEX "academic_playlist_stars_user_idx" ON "academic_playlist_stars" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "academic_playlists_creator_idx" ON "academic_playlists" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "academic_playlists_inst_sem_idx" ON "academic_playlists" USING btree ("institution_id","semester");--> statement-breakpoint
CREATE INDEX "academic_playlists_stars_idx" ON "academic_playlists" USING btree ("stars_count");--> statement-breakpoint
CREATE INDEX "academic_playlists_created_idx" ON "academic_playlists" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "academic_comments_res_created_idx" ON "academic_resource_comments" USING btree ("resource_id","created_at");--> statement-breakpoint
CREATE INDEX "academic_comments_author_idx" ON "academic_resource_comments" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "academic_votes_res_profile_idx" ON "academic_resource_votes" USING btree ("resource_id","profile_id");--> statement-breakpoint
CREATE INDEX "academic_resources_inst_created_idx" ON "academic_resources" USING btree ("institution_id","created_at");--> statement-breakpoint
CREATE INDEX "academic_resources_type_idx" ON "academic_resources" USING btree ("resource_type");--> statement-breakpoint
CREATE INDEX "academic_resources_branch_sem_idx" ON "academic_resources" USING btree ("branch","semester");--> statement-breakpoint
CREATE UNIQUE INDEX "saved_academic_res_profile_res_idx" ON "saved_academic_resources" USING btree ("profile_id","resource_id");--> statement-breakpoint
CREATE INDEX "saved_academic_res_profile_idx" ON "saved_academic_resources" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "saved_academic_res_sem_idx" ON "saved_academic_resources" USING btree ("semester");--> statement-breakpoint
CREATE INDEX "ai_conversations_user_updated_idx" ON "ai_conversations" USING btree ("user_id","updated_at");--> statement-breakpoint
CREATE INDEX "ai_feedback_message_idx" ON "ai_feedback" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "ai_messages_conversation_created_idx" ON "ai_messages" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX "ai_usage_user_created_idx" ON "ai_usage_events" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "secret_crush_attempts_sender_created_idx" ON "secret_crush_attempts" USING btree ("sender_id","created_at");--> statement-breakpoint
CREATE INDEX "secret_crush_attempts_sender_target_idx" ON "secret_crush_attempts" USING btree ("sender_id","target_id");--> statement-breakpoint
CREATE UNIQUE INDEX "secret_crushes_sender_target_idx" ON "secret_crushes" USING btree ("sender_id","target_id");--> statement-breakpoint
CREATE INDEX "secret_crushes_target_idx" ON "secret_crushes" USING btree ("target_id");--> statement-breakpoint
CREATE INDEX "secret_crushes_sender_idx" ON "secret_crushes" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "external_media_post_idx" ON "external_media" USING btree ("external_post_id");--> statement-breakpoint
CREATE INDEX "external_media_type_idx" ON "external_media" USING btree ("media_type");--> statement-breakpoint
CREATE INDEX "external_media_position_idx" ON "external_media" USING btree ("external_post_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "external_posts_source_external_id_idx" ON "external_posts" USING btree ("source","external_id");--> statement-breakpoint
CREATE UNIQUE INDEX "external_posts_post_id_idx" ON "external_posts" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "external_posts_subreddit_idx" ON "external_posts" USING btree ("subreddit");--> statement-breakpoint
CREATE INDEX "external_posts_content_type_idx" ON "external_posts" USING btree ("content_type");--> statement-breakpoint
CREATE INDEX "external_posts_source_idx" ON "external_posts" USING btree ("source");--> statement-breakpoint
CREATE INDEX "external_posts_permalink_idx" ON "external_posts" USING btree ("permalink");--> statement-breakpoint
CREATE INDEX "feed_boosts_active_idx" ON "feed_boosts" USING btree ("is_active","expires_at");--> statement-breakpoint
CREATE INDEX "feed_boosts_target_idx" ON "feed_boosts" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "feed_boosts_scope_idx" ON "feed_boosts" USING btree ("scope","institution_id");--> statement-breakpoint
CREATE UNIQUE INDEX "notification_mutes_user_target_channel_idx" ON "notification_mutes" USING btree ("user_id","muted_user_id","channel");--> statement-breakpoint
CREATE INDEX "notification_mutes_user_channel_idx" ON "notification_mutes" USING btree ("user_id","channel");--> statement-breakpoint
CREATE INDEX "link_clicks_short_link_idx" ON "link_clicks" USING btree ("short_link_id");--> statement-breakpoint
CREATE INDEX "link_clicks_ref_code_idx" ON "link_clicks" USING btree ("ref_code");--> statement-breakpoint
CREATE INDEX "link_clicks_created_at_idx" ON "link_clicks" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "short_links_slug_idx" ON "short_links" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "short_links_created_at_idx" ON "short_links" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "saved_posts_profile_post_idx" ON "saved_posts" USING btree ("profile_id","post_id");--> statement-breakpoint
CREATE INDEX "story_highlights_user_idx" ON "story_highlights" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "story_likes_story_user_unique" ON "story_likes" USING btree ("story_id","user_id");--> statement-breakpoint
CREATE INDEX "story_likes_story_idx" ON "story_likes" USING btree ("story_id");--> statement-breakpoint
CREATE UNIQUE INDEX "follows_follower_following_idx" ON "follows" USING btree ("follower_id","following_id");--> statement-breakpoint
CREATE INDEX "follows_following_follower_idx" ON "follows" USING btree ("following_id","follower_id");--> statement-breakpoint
CREATE INDEX "follows_following_created_idx" ON "follows" USING btree ("following_id","created_at");--> statement-breakpoint
CREATE INDEX "follows_follower_created_idx" ON "follows" USING btree ("follower_id","created_at");--> statement-breakpoint
CREATE INDEX "follows_mutual_created_idx" ON "follows" USING btree ("follower_id","created_at") WHERE "follows"."is_mutual";--> statement-breakpoint
CREATE UNIQUE INDEX "push_subscriptions_endpoint_idx" ON "push_subscriptions" USING btree ("endpoint");--> statement-breakpoint
CREATE INDEX "push_subscriptions_user_idx" ON "push_subscriptions" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "comments_parent_created_idx" ON "comments" USING btree ("parent_id","created_at");--> statement-breakpoint
CREATE INDEX "comments_author_idx" ON "comments" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "conversation_participants_conv_idx" ON "conversation_participants" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "conversations_updated_idx" ON "conversations" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "conversations_community_idx" ON "conversations" USING btree ("community_id");--> statement-breakpoint
CREATE INDEX "messages_sender_created_idx" ON "messages" USING btree ("sender_id","created_at");--> statement-breakpoint
CREATE INDEX "messages_read_idx" ON "messages" USING btree ("conversation_id","read_at");--> statement-breakpoint
CREATE INDEX "notifications_user_created_idx" ON "notifications" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "notifications_user_isread_idx" ON "notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "notifications_user_type_idx" ON "notifications" USING btree ("user_id","type");--> statement-breakpoint
CREATE INDEX "posts_author_created_idx" ON "posts" USING btree ("author_id","created_at");--> statement-breakpoint
CREATE INDEX "posts_type_status_created_idx" ON "posts" USING btree ("type","status","created_at");--> statement-breakpoint
CREATE INDEX "posts_community_status_created_idx" ON "posts" USING btree ("community_id","status","created_at");--> statement-breakpoint
CREATE INDEX "posts_repost_idx" ON "posts" USING btree ("repost_of_id");--> statement-breakpoint
CREATE INDEX "posts_is_seeded_idx" ON "posts" USING btree ("is_seeded","status","created_at");--> statement-breakpoint
CREATE INDEX "stories_user_expires_idx" ON "stories" USING btree ("user_id","expires_at");--> statement-breakpoint
CREATE INDEX "swipes_target_direction_idx" ON "swipes" USING btree ("target_id","direction");--> statement-breakpoint
CREATE UNIQUE INDEX "user_profiles_anon_username_idx" ON "user_profiles" USING btree ("anonymous_username");--> statement-breakpoint
CREATE INDEX "user_profiles_points_idx" ON "user_profiles" USING btree ("points");--> statement-breakpoint
CREATE INDEX "user_profiles_branch_idx" ON "user_profiles" USING btree ("branch");--> statement-breakpoint
CREATE INDEX "user_profiles_last_seen_idx" ON "user_profiles" USING btree ("last_seen_at");--> statement-breakpoint
CREATE INDEX "user_profiles_is_seeded_idx" ON "user_profiles" USING btree ("is_seeded");--> statement-breakpoint
CREATE INDEX "votes_post_idx" ON "votes" USING btree ("post_id");