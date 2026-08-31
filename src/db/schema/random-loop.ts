import { boolean, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./common";
import { institutions } from "./institutions";
import { userProfiles } from "./users";

// ─── 1. Random Loop Queue ───
export const randomQueue = pgTable("random_queue", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  institutionId: text("institution_id")
    .notNull()
    .references(() => institutions.id, { onDelete: "cascade" }),

  // Scope: "MY_CAMPUS" (same college) or "ANY_CAMPUS" (cross-campus discovery)
  mode: text("mode").default("MY_CAMPUS").notNull(),
  interests: jsonb("interests").$type<string[]>().default([]).notNull(),

  // Optional Context
  year: text("year"), // e.g. "1st", "2nd", "3rd", "4th+"
  department: text("department"),

  lastHeartbeat: timestamp("last_heartbeat", { withTimezone: true }).defaultNow().notNull(),
  createdAt,
});

// ─── 2. Random Loop Sessions ───
export const randomSessions = pgTable("random_sessions", {
  id: id(),
  userAId: text("user_a_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  userBId: text("user_b_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),

  mode: text("mode").default("MY_CAMPUS").notNull(),
  institutionId: text("institution_id").references(() => institutions.id, { onDelete: "set null" }),

  matchedInterests: jsonb("matched_interests").$type<string[]>().default([]).notNull(),

  // Status: "ACTIVE" | "ENDED" | "REPORTED" | "CONTINUED"
  status: text("status").default("ACTIVE").notNull(),
  endedReason: text("ended_reason"), // "NEXT", "LEAVE", "REPORT", "DISCONNECT", "TIMEOUT"

  // Mutual Identity Reveal Flow
  userARevealed: boolean("user_a_revealed").default(false).notNull(),
  userBRevealed: boolean("user_b_revealed").default(false).notNull(),

  // Mutual Video Request Flow
  userAVideoRequested: boolean("user_a_video_requested").default(false).notNull(),
  userBVideoRequested: boolean("user_b_video_requested").default(false).notNull(),
  userAPeerId: text("user_a_peer_id"),
  userBPeerId: text("user_b_peer_id"),

  // Mutual Keep Talking / Continue to Messages Flow
  userAContinued: boolean("user_a_continued").default(false).notNull(),
  userBContinued: boolean("user_b_continued").default(false).notNull(),
  conversationId: text("conversation_id"), // Linked persistent chat when both agree to continue

  // Post-Session Ratings
  ratingA: text("rating_a"), // "FUN", "INTERESTING", "HELPFUL", "OKAY", "UNCOMFORTABLE"
  ratingB: text("rating_b"),

  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  endedAt: timestamp("ended_at", { withTimezone: true }),
  createdAt,
  updatedAt,
});

// ─── 3. Random Loop Realtime Messages ───
export const randomMessages = pgTable("random_messages", {
  id: id(),
  sessionId: text("session_id")
    .notNull()
    .references(() => randomSessions.id, { onDelete: "cascade" }),
  senderId: text("sender_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt,
});

// ─── 4. Random Loop Safety Reports ───
export const randomReports = pgTable("random_reports", {
  id: id(),
  sessionId: text("session_id")
    .notNull()
    .references(() => randomSessions.id, { onDelete: "cascade" }),
  reporterId: text("reporter_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  reportedUserId: text("reported_user_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(), // "HARASSMENT", "SEXUAL", "THREAT", "PII_ASK", "SPAM", "HATE", "OTHER"
  details: text("details"),
  status: text("status").default("PENDING").notNull(), // "PENDING", "RESOLVED", "DISMISSED"
  createdAt,
});

export type RandomQueueItem = typeof randomQueue.$inferSelect;
export type RandomSession = typeof randomSessions.$inferSelect;
export type RandomMessage = typeof randomMessages.$inferSelect;
export type RandomReport = typeof randomReports.$inferSelect;
