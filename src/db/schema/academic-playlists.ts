import { boolean, index, integer, jsonb, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { academicResources } from "./academic-resources";
import { createdAt, id, updatedAt } from "./common";
import { institutions } from "./institutions";
import { userProfiles } from "./users";

export const academicPlaylists = pgTable(
  "academic_playlists",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    creatorId: text("creator_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    institutionId: text("institution_id").references(() => institutions.id, { onDelete: "set null" }),
    branch: text("branch").default("All").notNull(),
    semester: integer("semester"),
    category: text("category").default("SEMESTER_PACK").notNull(), // 'SEMESTER_PACK' | 'EXAM_PREP' | 'SUBJECT_BUNDLE' | 'GATE' | 'CUSTOM'
    visibility: text("visibility").default("PUBLIC").notNull(), // 'PUBLIC' | 'UNLISTED' | 'PRIVATE'
    coverGradient: text("cover_gradient").default("from-indigo-600 via-purple-600 to-pink-600").notNull(),
    starsCount: integer("stars_count").default(0).notNull(),
    viewsCount: integer("views_count").default(0).notNull(),
    itemsCount: integer("items_count").default(0).notNull(),
    isVerified: boolean("is_verified").default(false).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    tags: jsonb("tags").default([]).notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("academic_playlists_creator_idx").on(table.creatorId),
    index("academic_playlists_inst_sem_idx").on(table.institutionId, table.semester),
    index("academic_playlists_stars_idx").on(table.starsCount),
    index("academic_playlists_created_idx").on(table.createdAt),
  ]
);

export const academicPlaylistItems = pgTable(
  "academic_playlist_items",
  {
    id: id(),
    playlistId: text("playlist_id")
      .notNull()
      .references(() => academicPlaylists.id, { onDelete: "cascade" }),
    resourceId: text("resource_id")
      .notNull()
      .references(() => academicResources.id, { onDelete: "cascade" }),
    sectionName: text("section_name").default("Core Materials").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    curatorNote: text("curator_note"),
    createdAt,
  },
  (table) => [
    index("academic_items_playlist_order_idx").on(table.playlistId, table.sortOrder),
    index("academic_items_resource_idx").on(table.resourceId),
    uniqueIndex("academic_items_playlist_res_uniq").on(table.playlistId, table.resourceId),
  ]
);

export const academicPlaylistStars = pgTable(
  "academic_playlist_stars",
  {
    id: id(),
    playlistId: text("playlist_id")
      .notNull()
      .references(() => academicPlaylists.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    createdAt,
  },
  (table) => [
    uniqueIndex("academic_playlist_stars_unique_idx").on(table.playlistId, table.userId),
    index("academic_playlist_stars_user_idx").on(table.userId),
  ]
);

export type AcademicPlaylist = typeof academicPlaylists.$inferSelect;
export type NewAcademicPlaylist = typeof academicPlaylists.$inferInsert;
export type AcademicPlaylistItem = typeof academicPlaylistItems.$inferSelect;
export type NewAcademicPlaylistItem = typeof academicPlaylistItems.$inferInsert;
export type AcademicPlaylistStar = typeof academicPlaylistStars.$inferSelect;
export type NewAcademicPlaylistStar = typeof academicPlaylistStars.$inferInsert;
