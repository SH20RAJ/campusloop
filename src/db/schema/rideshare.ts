import { integer, pgTable, text } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./common";
import { institutions } from "./institutions";
import { userProfiles } from "./users";

export const ridesharePools = pgTable("rideshare_pools", {
  id: id(),
  institutionId: text("institution_id")
    .notNull()
    .references(() => institutions.id, { onDelete: "cascade" }),
  creatorId: text("creator_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  origin: text("origin").notNull(), // e.g. 'BIT Mesra Campus Gate'
  destination: text("destination").notNull(), // e.g. 'Ranchi Railway Station' or 'Airport'
  departureTime: text("departure_time").notNull(), // e.g. 'Tomorrow 6:00 AM'
  vehicleType: text("vehicle_type").default("AUTO").notNull(), // 'AUTO' | 'CAB_SEDAN' | 'CAB_SUV' | 'BIKE' | 'CAR'
  totalSeats: integer("total_seats").default(4).notNull(),
  availableSeats: integer("available_seats").default(3).notNull(),
  pricePerSeat: integer("price_per_seat").notNull(), // in Rupees
  contactInfo: text("contact_info"), // Phone or WhatsApp
  notes: text("notes"),
  status: text("status").default("ACTIVE").notNull(), // 'ACTIVE' | 'FULL' | 'DEPARTED'
  passengers: text("passengers"), // JSON stringified array of [{ userId, username, displayName, seats }]
  createdAt,
  updatedAt,
});

export type RidesharePool = typeof ridesharePools.$inferSelect;
export type NewRidesharePool = typeof ridesharePools.$inferInsert;
