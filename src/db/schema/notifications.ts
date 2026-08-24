import { boolean, index, pgTable, text } from "drizzle-orm/pg-core";
import { id, createdAt } from "./common";
import { userProfiles } from "./users";

export const notifications = pgTable(
  "notifications",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    actorId: text("actor_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    referenceId: text("reference_id"),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt,
  },
  (table) => [
    index("notifications_user_idx").on(table.userId),
  ]
);

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
