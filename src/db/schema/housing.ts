import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./common";
import { institutions } from "./institutions";
import { userProfiles } from "./users";

export const housingListings = pgTable("housing_listings", {
  id: id(),
  institutionId: text("institution_id")
    .notNull()
    .references(() => institutions.id, { onDelete: "cascade" }),
  authorId: text("author_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location").notNull(), // e.g. 'Green Garden Apartments, Mesra'
  distanceFromCampus: text("distance_from_campus"), // e.g. '5 min walk from Back Gate'
  rentPerMonth: integer("rent_per_month").notNull(), // in Rupees
  deposit: integer("deposit"), // Security deposit
  occupancyType: text("occupancy_type").default("SINGLE_ROOM").notNull(), // 'SINGLE_ROOM' | 'SHARED_ROOM' | '1BHK' | '2BHK' | '3BHK'
  genderPreference: text("gender_preference").default("ANY").notNull(), // 'BOYS_ONLY' | 'GIRLS_ONLY' | 'ANY'
  amenities: text("amenities"), // JSON stringified array of string amenities
  images: text("images"), // JSON stringified array of image URLs
  contactInfo: text("contact_info"), // Phone or WhatsApp
  status: text("status").default("AVAILABLE").notNull(), // 'AVAILABLE' | 'OCCUPIED'
  createdAt,
  updatedAt,
});

export type HousingListing = typeof housingListings.$inferSelect;
export type NewHousingListing = typeof housingListings.$inferInsert;
