"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { contentStatusEnum } from "@/db/schema";
import { moderationActions, posts } from "@/db/schema";

import type { Db } from "../_lib/db-context";
import { getAdminDb, requireAdminProfile } from "../_lib/guard";

type PostStatus = (typeof contentStatusEnum.enumValues)[number];

export async function deletePost(postId: string) {
  const db = await getAdminDb();
  await db.update(posts).set({ status: "DELETED" }).where(eq(posts.id, postId));
  await logAction(db, "DELETE_POST", postId);
  revalidatePath("/admin/posts");
}

export async function setPostStatus(postId: string, status: PostStatus) {
  const db = await getAdminDb();
  await db.update(posts).set({ status }).where(eq(posts.id, postId));
  await logAction(db, `SET_POST_${status}`, postId);
  revalidatePath("/admin/posts");
  revalidatePath("/admin/review");
}

export async function toggleHidePost(postId: string) {
  const db = await getAdminDb();
  const existing = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
    columns: { id: true, status: true },
  });

  if (!existing) {
    throw new Error("Post not found");
  }

  const nextStatus: PostStatus = existing.status === "PUBLISHED" ? "HIDDEN" : "PUBLISHED";
  await db.update(posts).set({ status: nextStatus }).where(eq(posts.id, postId));
  await logAction(db, nextStatus === "HIDDEN" ? "HIDE_POST" : "UNHIDE_POST", postId);
  revalidatePath("/admin/posts");
  revalidatePath("/admin/review");
  return { status: nextStatus };
}

export async function unlistAllSeededPosts() {
  const db = await getAdminDb();
  const res = await db.update(posts).set({ status: "HIDDEN" }).where(eq(posts.isSeeded, true));

  await logAction(db, "UNLIST_ALL_SEEDED_POSTS", "BULK");
  revalidatePath("/admin/posts");
  return { success: true };
}

export async function restoreAllSeededPosts() {
  const db = await getAdminDb();
  await db.update(posts).set({ status: "PUBLISHED" }).where(eq(posts.isSeeded, true));

  await logAction(db, "RESTORE_ALL_SEEDED_POSTS", "BULK");
  revalidatePath("/admin/posts");
  return { success: true };
}

export async function togglePostSeededStatus(postId: string, isSeeded: boolean) {
  const db = await getAdminDb();
  await db.update(posts).set({ isSeeded }).where(eq(posts.id, postId));
  await logAction(db, isSeeded ? "MARK_POST_SEEDED" : "MARK_POST_REAL", postId);
  revalidatePath("/admin/posts");
}

export async function approvePendingPost(postId: string) {
  return setPostStatus(postId, "PUBLISHED");
}

export async function rejectPendingPost(postId: string) {
  return setPostStatus(postId, "HIDDEN");
}

async function logAction(db: Db, action: string, targetId: string) {
  try {
    const { profile } = await requireAdminProfile();
    await db.insert(moderationActions).values({
      moderatorId: profile.id,
      targetType: "POST",
      targetId,
      action,
      reason: "Admin console action",
    });
  } catch {
    // Legacy passkey session has no profile — skip audit row rather than fail the action.
  }
}
