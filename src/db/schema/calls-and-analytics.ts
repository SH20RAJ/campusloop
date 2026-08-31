import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { conversations } from "./chat";
import { createdAt, id, updatedAt } from "./common";
import { userProfiles } from "./users";

/**
 * 1-to-1 Audio & Video Call Sessions for /chat & Random Loop
 */
export const callSessions = pgTable("call_sessions", {
  id: id(),
  // Nullable if originating from Random Loop
  conversationId: text("conversation_id").references(() => conversations.id, { onDelete: "cascade" }),

  callerId: text("caller_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  receiverId: text("receiver_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),

  // Type: "audio" | "video"
  type: text("type").default("video").notNull(),

  // Context: "chat" | "random_loop"
  context: text("context").default("chat").notNull(),

  // Authoritative server state:
  // "IDLE" | "CALLING" | "RINGING" | "ACCEPTED" | "CONNECTING" | "CONNECTED" | "DECLINED" | "MISSED" | "BUSY" | "FAILED" | "CANCELLED" | "ENDED"
  status: text("status").default("CALLING").notNull(),

  // Ephemeral peer ID used for WebRTC handshake
  callerPeerId: text("caller_peer_id"),
  receiverPeerId: text("receiver_peer_id"),

  endedReason: text("ended_reason"), // "USER_HUNG_UP", "REJECTED", "MISSED", "NETWORK_FAILED", "BLOCKED"
  durationSeconds: integer("duration_seconds").default(0).notNull(),

  startedAt: timestamp("started_at", { withTimezone: true }),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  endedAt: timestamp("ended_at", { withTimezone: true }),

  createdAt,
  updatedAt,
});

/**
 * User Behaviour Analytics Event Log
 * Tracks real user interactions (post views, dwell time, searches, profile clicks, call completions)
 * to continually power collaborative filtering, personalization, and vector recommendations.
 */
export const userBehaviorEvents = pgTable("user_behavior_events", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),

  // Event category: "POST_VIEW", "POST_DWELL", "SEARCH", "PROFILE_VISIT", "STORY_VIEW", "CHAT_CALL", "COMMUNITY_JOIN", "MARKETPLACE_VIEW"
  eventType: text("event_type").notNull(),

  // Target entity
  targetType: text("target_type"), // "POST", "USER", "COLLEGE", "COMMUNITY", "SEARCH_QUERY", "CALL"
  targetId: text("target_id"),

  // Additional behavioral metadata (dwellMs, query, tags, category, referrer)
  metadata: jsonb("metadata").$type<Record<string, any>>().default({}).notNull(),

  // Weight for algorithmic ranking (e.g. 1 for click, 5 for dwell > 10s, 10 for save/comment)
  weight: integer("weight").default(1).notNull(),

  createdAt,
});

export type CallSession = typeof callSessions.$inferSelect;
export type NewCallSession = typeof callSessions.$inferInsert;
export type UserBehaviorEvent = typeof userBehaviorEvents.$inferSelect;
export type NewUserBehaviorEvent = typeof userBehaviorEvents.$inferInsert;
