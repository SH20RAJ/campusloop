import { boolean, pgTable, text } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./common";
import { institutions } from "./institutions";
import { userProfiles } from "./users";

export const lostAndFoundItems = pgTable("lost_and_found_items", {
  id: id(),
  institutionId: text("institution_id")
    .notNull()
    .references(() => institutions.id, { onDelete: "cascade" }),
  authorId: text("author_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'LOST' | 'FOUND'
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").default("Other").notNull(), // 'Electronics' | 'ID & Cards' | 'Keys' | 'Clothing' | 'Bags' | 'Cycles' | 'Other'
  location: text("location").notNull(), // e.g. 'IC Engine Lab', 'CAT Hall Room 204', 'Hostel 7'
  itemDate: text("item_date"), // e.g. '2026-08-27'
  imageUrl: text("image_url"),
  contactInfo: text("contact_info"),
  reward: text("reward"),
  isResolved: boolean("is_resolved").default(false).notNull(),
  createdAt,
  updatedAt,
});

export type LostAndFoundItem = typeof lostAndFoundItems.$inferSelect;
export type NewLostAndFoundItem = typeof lostAndFoundItems.$inferInsert;
