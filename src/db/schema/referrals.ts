import { index, integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./common";
import { userProfiles } from "./users";

export const shortLinks = pgTable(
  "short_links",
  {
    id: id(),
    slug: varchar("slug", { length: 64 }).notNull().unique(),
    targetUrl: text("target_url").notNull(),
    title: varchar("title", { length: 255 }),
    clicks: integer("clicks").default(0).notNull(),
    uniqueClicks: integer("unique_clicks").default(0).notNull(),
    createdBy: text("created_by").references(() => userProfiles.id, { onDelete: "set null" }),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("short_links_slug_idx").on(table.slug),
    index("short_links_created_at_idx").on(table.createdAt),
  ]
);

export const linkClicks = pgTable(
  "link_clicks",
  {
    id: id(),
    shortLinkId: text("short_link_id").references(() => shortLinks.id, { onDelete: "cascade" }),
    refCode: varchar("ref_code", { length: 128 }),
    ip: varchar("ip", { length: 64 }),
    userAgent: text("user_agent"),
    device: varchar("device", { length: 32 }), // 'mobile' | 'desktop' | 'tablet' | 'bot'
    browser: varchar("browser", { length: 32 }),
    os: varchar("os", { length: 32 }),
    referer: text("referer"),
    country: varchar("country", { length: 32 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("link_clicks_short_link_idx").on(table.shortLinkId),
    index("link_clicks_ref_code_idx").on(table.refCode),
    index("link_clicks_created_at_idx").on(table.createdAt),
  ]
);

export type ShortLink = typeof shortLinks.$inferSelect;
export type NewShortLink = typeof shortLinks.$inferInsert;
export type LinkClick = typeof linkClicks.$inferSelect;
export type NewLinkClick = typeof linkClicks.$inferInsert;
