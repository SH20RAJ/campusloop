import { boolean, index, pgTable, text } from "drizzle-orm/pg-core";
import { createdAt, id } from "./common";
import { userProfiles } from "./users";

export const notifications = pgTable(
  "notifications",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // LIKE, COMMENT, REPLY, MENTION, REPOST, MATCH, CRUSH_ALERT, MILESTONE
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
