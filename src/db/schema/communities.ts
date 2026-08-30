import { boolean, integer, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { createdAt, id, updatedAt } from "./common";
import { userProfiles } from "./users";

export const communities = pgTable(
  "communities",
  {
    id: id(),
    name: text("name").notNull(),
    slug: text("slug"),
    description: text("description"),
    avatarUrl: text("avatar_url"),
    bannerUrl: text("banner_url"),
    privacy: text("privacy").default("PUBLIC").notNull(), // 'PUBLIC' | 'PRIVATE' | 'UNLISTED'
    category: text("category").default("General").notNull(), // 'Tech & Coding' | 'Music & Arts' | 'Gaming & Anime' | etc.
    rules: text("rules"), // JSON stringified array of rules [{ title, description }]
    allowAnonymousPosts: boolean("allow_anonymous_posts").default(true).notNull(),
    points: integer("points").default(0).notNull(),
    inviteCode: text("invite_code"),
    creatorId: text("creator_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    createdAt,
    updatedAt,
  },
  (table) => [uniqueIndex("communities_name_idx").on(table.name)]
);

export const communityMembers = pgTable(
  "community_members",
  {
    id: id(),
    communityId: text("community_id")
      .notNull()
      .references(() => communities.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    role: text("role").default("MEMBER").notNull(), // 'ADMIN' | 'MODERATOR' | 'MEMBER'
    status: text("status").default("ACTIVE").notNull(), // 'ACTIVE' | 'PENDING' | 'BANNED'
    createdAt,
  },
  (table) => [uniqueIndex("community_members_join_idx").on(table.communityId, table.userId)]
);

export type Community = typeof communities.$inferSelect;
export type NewCommunity = typeof communities.$inferInsert;
export type CommunityMember = typeof communityMembers.$inferSelect;
export type NewCommunityMember = typeof communityMembers.$inferInsert;
