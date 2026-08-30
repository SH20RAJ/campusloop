import { boolean,index,pgEnum,pgTable,text,timestamp,uniqueIndex } from "drizzle-orm/pg-core";
import { createdAt,id } from "./common";
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
    index("swipes_target_direction_idx").on(table.targetId, table.direction),
  ]
);

export type Swipe = typeof swipes.$inferSelect;
export type NewSwipe = typeof swipes.$inferInsert;

export const secretCrushes = pgTable(
  "secret_crushes",
  {
    id: id(),
    senderId: text("sender_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    targetId: text("target_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    isMutual: boolean("is_mutual").default(false).notNull(),
    matchedAt: timestamp("matched_at"),
    createdAt,
  },
  (table) => [
    uniqueIndex("secret_crushes_sender_target_idx").on(table.senderId, table.targetId),
    index("secret_crushes_target_idx").on(table.targetId),
    index("secret_crushes_sender_idx").on(table.senderId),
  ]
);

export type SecretCrush = typeof secretCrushes.$inferSelect;
export type NewSecretCrush = typeof secretCrushes.$inferInsert;

export const secretCrushAttempts = pgTable(
  "secret_crush_attempts",
  {
    id: id(),
    senderId: text("sender_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    targetId: text("target_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    createdAt,
  },
  (table) => [
    index("secret_crush_attempts_sender_created_idx").on(table.senderId, table.createdAt),
    index("secret_crush_attempts_sender_target_idx").on(table.senderId, table.targetId),
  ]
);

export type SecretCrushAttempt = typeof secretCrushAttempts.$inferSelect;
export type NewSecretCrushAttempt = typeof secretCrushAttempts.$inferInsert;

