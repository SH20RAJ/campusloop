import { index,jsonb,pgTable,text,timestamp,uniqueIndex } from "drizzle-orm/pg-core";
import { createdAt,id,updatedAt } from "./common";
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

export const storyLikes = pgTable(
  "story_likes",
  {
    id: id(),
    storyId: text("story_id")
      .notNull()
      .references(() => stories.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    createdAt,
  },
  (table) => [
    uniqueIndex("story_likes_story_user_unique").on(table.storyId, table.userId),
    index("story_likes_story_idx").on(table.storyId),
  ]
);

export const storyHighlights = pgTable(
  "story_highlights",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    coverUrl: text("cover_url"),
    storyIds: jsonb("story_ids").$type<string[]>().default([]).notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("story_highlights_user_idx").on(table.userId),
  ]
);

export type Story = typeof stories.$inferSelect;
export type NewStory = typeof stories.$inferInsert;
export type StoryLike = typeof storyLikes.$inferSelect;
export type NewStoryLike = typeof storyLikes.$inferInsert;
export type StoryHighlight = typeof storyHighlights.$inferSelect;
export type NewStoryHighlight = typeof storyHighlights.$inferInsert;
