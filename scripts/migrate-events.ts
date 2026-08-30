import { sql } from "drizzle-orm";
import { getDb } from "../src/db";

async function main() {
  console.log("Running migration for events and event_registrations...");
  const db = getDb();

  // 1. Create events table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS events (
      id text PRIMARY KEY,
      slug text UNIQUE NOT NULL,
      title text NOT NULL,
      tagline text,
      description text NOT NULL,
      banner_url text,
      club_name text NOT NULL,
      organizer_profile_id text NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
      institution_id text NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
      eligible_institution_ids jsonb DEFAULT '["ALL"]'::jsonb NOT NULL,
      event_type varchar(32) DEFAULT 'HACKATHON' NOT NULL,
      mode varchar(16) DEFAULT 'OFFLINE' NOT NULL,
      venue text,
      meeting_url text,
      start_date timestamp NOT NULL,
      end_date timestamp NOT NULL,
      registration_deadline timestamp,
      participation_type varchar(16) DEFAULT 'SOLO' NOT NULL,
      min_team_size integer DEFAULT 1,
      max_team_size integer DEFAULT 4,
      max_participants integer,
      is_paid boolean DEFAULT false NOT NULL,
      entry_fee text DEFAULT 'Free',
      prizes_description text,
      perks jsonb DEFAULT '["Certificates", "Prizes", "Loop Points"]'::jsonb NOT NULL,
      loop_points_reward integer DEFAULT 25 NOT NULL,
      status varchar(16) DEFAULT 'PUBLISHED' NOT NULL,
      created_at timestamp DEFAULT now() NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL
    );
  `);

  // 2. Create event_registrations table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS event_registrations (
      id text PRIMARY KEY,
      event_id text NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      profile_id text NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
      registration_type varchar(16) DEFAULT 'SOLO' NOT NULL,
      team_name text,
      team_members jsonb DEFAULT '[]'::jsonb NOT NULL,
      contact_phone text,
      notes text,
      status varchar(16) DEFAULT 'CONFIRMED' NOT NULL,
      reminder_set boolean DEFAULT false NOT NULL,
      created_at timestamp DEFAULT now() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS event_registrations_profile_event_idx
    ON event_registrations(profile_id, event_id);
  `);

  console.log("Events migration completed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
