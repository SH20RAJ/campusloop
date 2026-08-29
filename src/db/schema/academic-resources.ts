import { boolean,integer,pgTable,text } from "drizzle-orm/pg-core";
import { createdAt,id,updatedAt } from "./common";
import { institutions } from "./institutions";
import { userProfiles } from "./users";

export const academicResources = pgTable("academic_resources", {
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
  resourceType: text("resource_type").default("NOTES").notNull(), // 'NOTES' | 'PYQ' | 'LAB_MANUAL' | 'CHEAT_SHEET'
  fileUrl: text("file_url"),
  driveUrl: text("drive_url"),
  upvotesCount: integer("upvotes_count").default(0).notNull(),
  downloadsCount: integer("downloads_count").default(0).notNull(),
  viewsCount: integer("views_count").default(0).notNull(),
  isVerified: boolean("is_verified").default(false).notNull(),
  createdAt,
  updatedAt,
});

export type AcademicResource = typeof academicResources.$inferSelect;
export type NewAcademicResource = typeof academicResources.$inferInsert;
