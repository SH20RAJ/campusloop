import { boolean,integer,pgTable,text,timestamp } from "drizzle-orm/pg-core";
import { createdAt,id,updatedAt } from "./common";
import { institutions } from "./institutions";
import { userProfiles } from "./users";

export const timeCapsules = pgTable("time_capsules", {
  id: id(),
  institutionId: text("institution_id")
    .notNull()
    .references(() => institutions.id, { onDelete: "cascade" }),
  creatorId: text("creator_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  targetUnlockDate: timestamp("target_unlock_date").notNull(),
  category: text("category").default("CONVOCATION").notNull(), // 'CONVOCATION' | 'BATCH_MEMORIES' | 'PREDICTIONS' | 'FEST' | 'HOSTEL'
  isUnlocked: boolean("is_unlocked").default(false).notNull(),
  entriesCount: integer("entries_count").default(0).notNull(),
  coverImage: text("cover_image"),
  createdAt,
  updatedAt,
});

export const capsuleEntries = pgTable("capsule_entries", {
  id: id(),
  capsuleId: text("capsule_id")
    .notNull()
    .references(() => timeCapsules.id, { onDelete: "cascade" }),
  authorId: text("author_id")
    .notNull()
    .references(() => userProfiles.id, { onDelete: "cascade" }),
  entryType: text("entry_type").default("LETTER").notNull(), // 'LETTER' | 'PREDICTION' | 'PHOTO' | 'AUDIO'
  title: text("title").notNull(),
  content: text("content").notNull(),
  mediaUrl: text("media_url"),
  isAnonymous: boolean("is_anonymous").default(false).notNull(),
  pseudonym: text("pseudonym"),
  createdAt,
  updatedAt,
});

export type TimeCapsule = typeof timeCapsules.$inferSelect;
export type NewTimeCapsule = typeof timeCapsules.$inferInsert;

export type CapsuleEntry = typeof capsuleEntries.$inferSelect;
export type NewCapsuleEntry = typeof capsuleEntries.$inferInsert;
