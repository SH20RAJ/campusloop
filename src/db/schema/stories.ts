import { index,pgTable,text,timestamp } from "drizzle-orm/pg-core";
import { createdAt,id } from "./common";
import { userProfiles } from "./users";

export const stories = pgTable(
  "stories",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    mediaUrl: text("media_url"),
    text: text("text"),
    backgroundColor: text("background_color"),
    createdAt,
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (table) => [
    index("stories_user_idx").on(table.userId),
    index("stories_expires_idx").on(table.expiresAt),
    index("stories_user_expires_idx").on(table.userId, table.expiresAt),
  ]
);

export type Story = typeof stories.$inferSelect;
export type NewStory = typeof stories.$inferInsert;
