import { boolean,integer,pgTable,text } from "drizzle-orm/pg-core";
import { createdAt,id,updatedAt } from "./common";
import { institutions } from "./institutions";
import { userProfiles } from "./users";

export const marketplaceItems = pgTable("marketplace_items", {
  id: id(),
  institutionId: text("institution_id")
    .notNull()
    .references(() => institutions.id, { onDelete: "cascade" }),
  sellerId: text("seller_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  price: integer("price").notNull(), // in Rupees
  originalPrice: integer("original_price"), // MRP in Rupees
  condition: text("condition").default("GOOD").notNull(), // 'BRAND_NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR'
  category: text("category").default("Other").notNull(), // 'Cycles' | 'Textbooks' | 'Electronics' | 'Lab Coats' | 'Furniture' | 'Coolers' | 'Other'
  hostelLocation: text("hostel_location"), // e.g. 'Hostel 11 Room 204' or 'Day Scholar'
  isNegotiable: boolean("is_negotiable").default(true).notNull(),
  images: text("images"), // JSON stringified array of image URLs
  isSold: boolean("is_sold").default(false).notNull(),
  createdAt,
  updatedAt,
});

export type MarketplaceItem = typeof marketplaceItems.$inferSelect;
export type NewMarketplaceItem = typeof marketplaceItems.$inferInsert;
