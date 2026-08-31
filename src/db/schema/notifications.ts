import { boolean, index, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./common";
import { userProfiles } from "./users";

export const notifications = pgTable(
  "notifications",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    // LIKE, COMMENT, REPLY, MENTION, REPOST, MATCH, CRUSH_ALERT, MILESTONE,
    // FOLLOW, FRIEND, STORY_LIKE, STORY_REPLY, MESSAGE, NEW_POST
    type: text("type").notNull(),
    actorId: text("actor_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    referenceId: text("reference_id"),
    previewText: text("preview_text"),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt,
  },
  (table) => [
    index("notifications_user_idx").on(table.userId),
    index("notifications_user_created_idx").on(table.userId, table.createdAt),
    index("notifications_user_isread_idx").on(table.userId, table.isRead),
    index("notifications_user_type_idx").on(table.userId, table.type),
  ]
);

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

/**
 * Per-recipient, per-actor notification mutes.
 *
 * A student who wants a friend in their feed but not on their lock screen mutes
 * that person for one channel — the row is (owner, muted actor, channel), so
 * muting someone's posts leaves their DMs alone. `channel` "ALL" silences every
 * channel from that actor at once.
 *
 * Absence of a row means "notify" — the default is on, and a mute is an
 * explicit opt-out, which is what keeps the read path a single indexed lookup.
 */
export const notificationMutes = pgTable(
  "notification_mutes",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    mutedUserId: text("muted_user_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    /** ALL | POST | MESSAGE | LIKE | COMMENT | MENTION | REPOST | FOLLOW | STORY */
    channel: text("channel").default("ALL").notNull(),
    createdAt,
  },
  (table) => [
    uniqueIndex("notification_mutes_user_target_channel_idx").on(
      table.userId,
      table.mutedUserId,
      table.channel
    ),
    // Covers the batched fan-out filter: "of these N actors, which are muted for me?"
    index("notification_mutes_user_channel_idx").on(table.userId, table.channel),
  ]
);

/**
 * Account-wide notification switches. One row per student, created lazily on
 * first write; a missing row means every channel is on.
 */
export const notificationPreferences = pgTable("notification_preferences", {
  id: id(),
  userId: text("user_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" })
    .unique(),
  /** Direct messages and community chat */
  messages: boolean("messages").default(true).notNull(),
  /** New posts from people this student follows */
  followedPosts: boolean("followed_posts").default(true).notNull(),
  /** Narrow followed-post alerts to mutual friends only */
  followedPostsFriendsOnly: boolean("followed_posts_friends_only").default(false).notNull(),
  /** Likes / upvotes on this student's own content */
  likes: boolean("likes").default(true).notNull(),
  /** Comments and threaded replies */
  comments: boolean("comments").default(true).notNull(),
  /** @mentions anywhere on the platform */
  mentions: boolean("mentions").default(true).notNull(),
  /** New followers and friend-backs */
  follows: boolean("follows").default(true).notNull(),
  /** Reposts and quote reposts */
  reposts: boolean("reposts").default(true).notNull(),
  /** Campus Match, Secret Crush and story interactions */
  matches: boolean("matches").default(true).notNull(),
  createdAt,
  updatedAt,
});

export type NotificationMute = typeof notificationMutes.$inferSelect;
export type NewNotificationMute = typeof notificationMutes.$inferInsert;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type NewNotificationPreference = typeof notificationPreferences.$inferInsert;
