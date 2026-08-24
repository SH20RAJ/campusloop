import { pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { id, createdAt } from "./common";
import { userProfiles } from "./users";

export const communities = pgTable(
  "communities",
  {
    id: id(),
    name: text("name").notNull(),
    description: text("description"),
    creatorId: text("creator_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    createdAt,
  },
  (table) => [
    uniqueIndex("communities_name_idx").on(table.name),
  ]
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
    createdAt,
  },
  (table) => [
    uniqueIndex("community_members_join_idx").on(table.communityId, table.userId),
  ]
);

export type Community = typeof communities.$inferSelect;
export type NewCommunity = typeof communities.$inferInsert;
export type CommunityMember = typeof communityMembers.$inferSelect;
export type NewCommunityMember = typeof communityMembers.$inferInsert;
