import { boolean, index, integer, jsonb, pgTable, text } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./common";
import { institutions } from "./institutions";
import { userProfiles } from "./users";

export const academicResources = pgTable(
  "academic_resources",
  {
    id: id(),
    institutionId: text("institution_id")
      .notNull()
      .references(() => institutions.id, { onDelete: "cascade" }),
    uploaderId: text("uploader_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    subjectCode: text("subject_code").notNull(), // e.g. 'CS201'
    subjectName: text("subject_name").notNull(), // e.g. 'Data Structures & Algorithms'
    branch: text("branch").default("All").notNull(), // 'Computer Science' | 'ECE' | 'Mechanical' | 'Civil' | 'All'
    semester: integer("semester").default(1).notNull(), // 1 to 8
    resourceType: text("resource_type").default("NOTES").notNull(), // 'NOTES' | 'PYQ' | 'LAB_MANUAL' | 'CHEAT_SHEET' | 'BOOK' | 'PPT' | 'MODULE'
    moduleOrChapter: text("module_or_chapter"), // e.g. 'Module 1', 'Unit 3', 'Complete Course Book'
    fileUrl: text("file_url"),
    driveUrl: text("drive_url"),
    tags: jsonb("tags").default([]).notNull(),
    upvotesCount: integer("upvotes_count").default(0).notNull(),
    downvotesCount: integer("downvotes_count").default(0).notNull(),
    downloadsCount: integer("downloads_count").default(0).notNull(),
    viewsCount: integer("views_count").default(0).notNull(),
    isVerified: boolean("is_verified").default(false).notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("academic_resources_inst_created_idx").on(table.institutionId, table.createdAt),
    index("academic_resources_type_idx").on(table.resourceType),
    index("academic_resources_branch_sem_idx").on(table.branch, table.semester),
  ]
);

export const academicResourceComments = pgTable(
  "academic_resource_comments",
  {
    id: id(),
    resourceId: text("resource_id")
      .notNull()
      .references(() => academicResources.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    isHelpful: boolean("is_helpful").default(true).notNull(),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("academic_comments_res_created_idx").on(table.resourceId, table.createdAt),
    index("academic_comments_author_idx").on(table.authorId),
  ]
);

export const academicResourceVotes = pgTable(
  "academic_resource_votes",
  {
    id: id(),
    resourceId: text("resource_id")
      .notNull()
      .references(() => academicResources.id, { onDelete: "cascade" }),
    profileId: text("profile_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    voteType: text("vote_type").notNull(), // 'UPVOTE' | 'DOWNVOTE'
    createdAt,
  },
  (table) => [index("academic_votes_res_profile_idx").on(table.resourceId, table.profileId)]
);

export type AcademicResource = typeof academicResources.$inferSelect;
export type NewAcademicResource = typeof academicResources.$inferInsert;
export type AcademicResourceComment = typeof academicResourceComments.$inferSelect;
export type NewAcademicResourceComment = typeof academicResourceComments.$inferInsert;
export type AcademicResourceVote = typeof academicResourceVotes.$inferSelect;
export type NewAcademicResourceVote = typeof academicResourceVotes.$inferInsert;
