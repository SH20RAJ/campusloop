"use server";

import { getDb } from "@/db";
import { comments,pollOptions,pollVotes,posts,userProfiles,votes } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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

  // Delete dependent rows and post record
  await db.delete(votes).where(eq(votes.postId, postId)).catch(() => {});
  await db.delete(comments).where(eq(comments.postId, postId)).catch(() => {});
  await db.delete(pollVotes).where(eq(pollVotes.postId, postId)).catch(() => {});
  await db.delete(pollOptions).where(eq(pollOptions.postId, postId)).catch(() => {});
  await db.delete(posts).where(eq(posts.id, postId));

  revalidatePath("/app");
  revalidatePath("/app/profile");
  revalidatePath(`/@${profile.username}`);

  return { success: true };
}

export async function archivePost(postId: string) {
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
    throw new Error("You can only archive your own posts");
  }

  const isCurrentlyArchived = post.status === "ARCHIVED";
  const newStatus = isCurrentlyArchived ? "PUBLISHED" : "ARCHIVED";

  await db.update(posts).set({ status: newStatus }).where(eq(posts.id, postId));

  revalidatePath("/app");
  revalidatePath("/app/profile");
  revalidatePath(`/@${profile.username}`);

  return { success: true, isArchived: newStatus === "ARCHIVED", newStatus };
}

