import { boolean, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./common";
import { posts } from "./posts";

export const externalSourceEnum = pgEnum("external_source", ["reddit", "twitter", "youtube"]);

export const externalContentTypeEnum = pgEnum("external_content_type", [
  "TEXT",
  "IMAGE",
  "VIDEO",
  "GIF",
  "GALLERY",
  "LINK",
  "OTHER",
]);

export const externalMediaStatusEnum = pgEnum("external_media_status", [
  "ACTIVE",
  "EXPIRED",
  "REMOVED",
  "FAILED",
]);

export const externalMediaTypeEnum = pgEnum("external_media_type", ["IMAGE", "VIDEO", "GIF", "LINK"]);

export const externalPosts = pgTable(
  "external_posts",
  {
    id: id(),
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    source: externalSourceEnum("source").default("reddit").notNull(),
    externalId: text("external_id").notNull(),
    externalFullname: text("external_fullname"),
    subreddit: text("subreddit"),
    externalAuthor: text("external_author"),
    permalink: text("permalink").notNull(),
    canonicalUrl: text("canonical_url").notNull(),
    score: integer("score").default(0).notNull(),
    commentCount: integer("comment_count").default(0).notNull(),
    externalCreatedAt: text("external_created_at"),
    importedAt: timestamp("imported_at", { withTimezone: true }).defaultNow().notNull(),
    relevanceScore: integer("relevance_score").default(0).notNull(),
    contentType: externalContentTypeEnum("content_type").default("TEXT").notNull(),
    sourceMetadata: jsonb("source_metadata").$type<Record<string, unknown>>(),
    lastCheckedAt: text("last_checked_at"),
    mediaStatus: externalMediaStatusEnum("media_status").default("ACTIVE").notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [
    uniqueIndex("external_posts_source_external_id_idx").on(table.source, table.externalId),
    uniqueIndex("external_posts_post_id_idx").on(table.postId),
    index("external_posts_subreddit_idx").on(table.subreddit),
    index("external_posts_content_type_idx").on(table.contentType),
    index("external_posts_source_idx").on(table.source),
    index("external_posts_permalink_idx").on(table.permalink),
  ]
);

export const externalMedia = pgTable(
  "external_media",
  {
    id: id(),
    externalPostId: text("external_post_id")
      .notNull()
      .references(() => externalPosts.id, { onDelete: "cascade" }),
    mediaType: externalMediaTypeEnum("media_type").default("IMAGE").notNull(),
    mediaUrl: text("media_url").notNull(),
    previewUrl: text("preview_url"),
    thumbnailUrl: text("thumbnail_url"),
    hlsUrl: text("hls_url"),
    dashUrl: text("dash_url"),
    width: integer("width"),
    height: integer("height"),
    duration: integer("duration"),
    isGif: boolean("is_gif").default(false).notNull(),
    position: integer("position").default(0).notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt,
  },
  (table) => [
    index("external_media_post_idx").on(table.externalPostId),
    index("external_media_type_idx").on(table.mediaType),
    index("external_media_position_idx").on(table.externalPostId, table.position),
  ]
);

export type ExternalPost = typeof externalPosts.$inferSelect;
export type NewExternalPost = typeof externalPosts.$inferInsert;
export type ExternalMedia = typeof externalMedia.$inferSelect;
export type NewExternalMedia = typeof externalMedia.$inferInsert;
