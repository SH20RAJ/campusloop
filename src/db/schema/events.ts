import { boolean, integer, jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { institutions } from "./institutions";
import { userProfiles } from "./users";

export const eventTypeEnum = [
  "HACKATHON",
  "WORKSHOP",
  "CULTURAL",
  "SPORTS",
  "SEMINAR",
  "FEST",
  "MEETUP",
  "COMPETITION",
] as const;

export const eventModeEnum = ["OFFLINE", "ONLINE", "HYBRID"] as const;
export const participationTypeEnum = ["SOLO", "TEAM", "BOTH"] as const;
export const eventStatusEnum = ["PUBLISHED", "DRAFT", "COMPLETED", "CANCELLED"] as const;
export const eventVisibilityEnum = ["PUBLIC", "UNLISTED", "PRIVATE"] as const;
export const registrationStatusEnum = ["CONFIRMED", "WAITLISTED", "ATTENDED", "CANCELLED"] as const;

export const events = pgTable("events", {
  id: text("id").primaryKey(),
  slug: text("slug").unique().notNull(),
  title: text("title").notNull(),
  tagline: text("tagline"),
  description: text("description").notNull(),
  bannerUrl: text("banner_url"),
  clubName: text("club_name").notNull(), // e.g. ACM BIT Mesra, IEEE Student Branch, EDC BITM
  organizerProfileId: text("organizer_profile_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  institutionId: text("institution_id")
    .notNull()
    .references(() => institutions.id, { onDelete: "cascade" }),
  eligibleInstitutionIds: jsonb("eligible_institution_ids").default(["ALL"]).notNull(), // ["ALL"] or specific IDs
  eventType: varchar("event_type", { length: 32 }).default("HACKATHON").notNull(),
  mode: varchar("mode", { length: 16 }).default("OFFLINE").notNull(),
  venue: text("venue"),
  meetingUrl: text("meeting_url"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  registrationDeadline: timestamp("registration_deadline"),
  participationType: varchar("participation_type", { length: 16 }).default("SOLO").notNull(),
  minTeamSize: integer("min_team_size").default(1),
  maxTeamSize: integer("max_team_size").default(4),
  maxParticipants: integer("max_participants"),
  isPaid: boolean("is_paid").default(false).notNull(),
  entryFee: text("entry_fee").default("Free"),
  prizesDescription: text("prizes_description"),
  perks: jsonb("perks").default(["Certificates", "Prizes", "Loop Points"]).notNull(),
  loopPointsReward: integer("loop_points_reward").default(25).notNull(),
  status: varchar("status", { length: 16 }).default("PUBLISHED").notNull(),
  visibility: varchar("visibility", { length: 16 }).default("PUBLIC").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const eventRegistrations = pgTable("event_registrations", {
  id: text("id").primaryKey(),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  profileId: text("profile_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  registrationType: varchar("registration_type", { length: 16 }).default("SOLO").notNull(),
  teamName: text("team_name"),
  teamMembers: jsonb("team_members").default([]).notNull(), // [{ name, email, rollNo, username }]
  contactPhone: text("contact_phone"),
  notes: text("notes"),
  status: varchar("status", { length: 16 }).default("CONFIRMED").notNull(),
  reminderSet: boolean("reminder_set").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type NewEventRegistration = typeof eventRegistrations.$inferInsert;
