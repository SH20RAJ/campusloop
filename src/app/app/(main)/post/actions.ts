"use server";

import { getDb } from "@/db";
import { posts, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { eq } from "drizzle-orm";

export async function deletePost(postId: string) {
  const user = await hexclaveServerApp.getUser();
  if (!user) throw new Error("Not authenticated");

  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (!profile) throw new Error("Profile not found");

  const post = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
  });

  if (!post) throw new Error("Post not found");

  const isAuthor = post.authorId === profile.id;
  const isAdmin = profile.role === "ADMIN";

  if (!isAuthor && !isAdmin) {
    throw new Error("You can only delete your own posts");
  }

  await db
    .update(posts)
    .set({ status: "DELETED" })
    .where(eq(posts.id, postId));

  return { success: true };
}
