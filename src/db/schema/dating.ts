import { pgEnum, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { id, createdAt } from "./common";
import { userProfiles } from "./users";

export const swipeDirectionEnum = pgEnum("swipe_direction", ["LIKE", "PASS"]);

export const swipes = pgTable(
  "swipes",
  {
    id: id(),
    swiperId: text("swiper_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    targetId: text("target_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    direction: swipeDirectionEnum("direction").notNull(),
    createdAt,
  },
  (table) => [
    uniqueIndex("swipes_swiper_target_idx").on(table.swiperId, table.targetId),
  ]
);

export type Swipe = typeof swipes.$inferSelect;
export type NewSwipe = typeof swipes.$inferInsert;
