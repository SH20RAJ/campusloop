import { boolean, integer, jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { institutions } from "./institutions";
import { userProfiles } from "./users";

export const articleStatusEnum = ["PUBLISHED", "DRAFT", "ARCHIVED"] as const;

export const articleCategoryEnum = [
  "GENERAL",
  "TECH_AND_CODE",
  "PLACEMENTS",
  "CAMPUS_LIFE",
  "RESEARCH",
  "INTERNSHIPS",
  "PROJECTS",
  "GUIDES",
  "OPINION",
] as const;

export const articles = pgTable("articles", {
  id: text("id").primaryKey(),
  slug: text("slug").unique().notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  excerpt: text("excerpt"),
  content: text("content").notNull(), // Markdown or rich HTML content
  coverImageUrl: text("cover_image_url"),
  authorId: text("author_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  institutionId: text("institution_id").references(() => institutions.id, { onDelete: "set null" }),
  category: varchar("category", { length: 32 }).default("GENERAL").notNull(),
  tags: jsonb("tags").$type<string[]>().default([]).notNull(),
  readingTimeMinutes: integer("reading_time_minutes").default(3).notNull(),
  viewsCount: integer("views_count").default(0).notNull(),
  upvotesCount: integer("upvotes_count").default(0).notNull(),
  downvotesCount: integer("downvotes_count").default(0).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  status: varchar("status", { length: 16 }).default("PUBLISHED").notNull(),
  publishedAt: timestamp("published_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const articleVotes = pgTable("article_votes", {
  id: text("id").primaryKey(),
  articleId: text("article_id")
    .notNull()
    .references(() => articles.id, { onDelete: "cascade" }),
  profileId: text("profile_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  value: integer("value").notNull(), // 1 for upvote, -1 for downvote
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
export type ArticleVote = typeof articleVotes.$inferSelect;
export type NewArticleVote = typeof articleVotes.$inferInsert;
