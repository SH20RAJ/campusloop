import { pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { createdAt, id } from "./common";
import { posts } from "./posts";
import { userProfiles } from "./users";

export const savedPosts = pgTable(
  "saved_posts",
  {
    id: id(),
    profileId: text("profile_id")
      .notNull()
      .references(() => userProfiles.id, { onDelete: "cascade" }),
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    createdAt,
  },
  (t) => [uniqueIndex("saved_posts_profile_post_idx").on(t.profileId, t.postId)]
);

export type SavedPost = typeof savedPosts.$inferSelect;
export type NewSavedPost = typeof savedPosts.$inferInsert;
