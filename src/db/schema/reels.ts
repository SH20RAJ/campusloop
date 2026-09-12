import { boolean, index, integer, jsonb, pgTable, text, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./common";
import { institutions } from "./institutions";
import { userProfiles } from "./users";

export const reels = pgTable(
  "reels",
  {
    id: id(),
    slug: text("slug").unique().notNull(),
    caption: text("caption").notNull().default(""),
    title: text("title"),
    videoUrl: text("video_url").notNull(),
    hlsUrl: text("hls_url"),
    audioUrl: text("audio_url"),
    thumbnailUrl: text("thumbnail_url"),
    aspectRatio: text("aspect_ratio").default("9:16").notNull(),
    width: integer("width"),
    height: integer("height"),
    duration: integer("duration"), // Duration in seconds
    authorId: text("author_id").references(() => userProfiles.id, { onDelete: "set null" }),
    authorName: text("author_name"),
    authorHandle: text("author_handle"),
    authorAvatarUrl: text("author_avatar_url"),
    institutionId: text("institution_id").references(() => institutions.id, { onDelete: "set null" }),
    source: text("source").default("reddit").notNull(),
    sourceUrl: text("source_url"),
    subreddit: text("subreddit"),
    tags: jsonb("tags").$type<string[]>().default([]).notNull(),
    likesCount: integer("likes_count").default(0).notNull(),
    commentsCount: integer("comments_count").default(0).notNull(),
    sharesCount: integer("shares_count").default(0).notNull(),
    viewsCount: integer("views_count").default(0).notNull(),
    status: varchar("status", { length: 16 }).default("PUBLISHED").notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("reels_status_created_idx").on(table.status, table.createdAt),
    index("reels_institution_idx").on(table.institutionId, table.status),
    index("reels_author_idx").on(table.authorId),
    index("reels_subreddit_idx").on(table.subreddit),
    index("reels_views_idx").on(table.viewsCount),
  ]
);

export const reelLikes = pgTable(
  "reel_likes",
  {
    id: id(),
    reelId: text("reel_id")
      .notNull()
      .references(() => reels.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    createdAt,
  },
  (table) => [
    uniqueIndex("reel_likes_user_reel_unique").on(table.userId, table.reelId),
    index("reel_likes_reel_idx").on(table.reelId),
  ]
);

export const reelComments = pgTable(
  "reel_comments",
  {
    id: id(),
    reelId: text("reel_id")
      .notNull()
      .references(() => reels.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [index("reel_comments_reel_idx").on(table.reelId, table.createdAt)]
);

export const reelBookmarks = pgTable(
  "reel_bookmarks",
  {
    id: id(),
    reelId: text("reel_id")
      .notNull()
      .references(() => reels.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    createdAt,
  },
  (table) => [
    uniqueIndex("reel_bookmarks_user_reel_unique").on(table.userId, table.reelId),
    index("reel_bookmarks_user_idx").on(table.userId),
  ]
);

export type Reel = typeof reels.$inferSelect;
export type NewReel = typeof reels.$inferInsert;
export type ReelLike = typeof reelLikes.$inferSelect;
export type NewReelLike = typeof reelLikes.$inferInsert;
export type ReelComment = typeof reelComments.$inferSelect;
export type NewReelComment = typeof reelComments.$inferInsert;
export type ReelBookmark = typeof reelBookmarks.$inferSelect;
export type NewReelBookmark = typeof reelBookmarks.$inferInsert;
