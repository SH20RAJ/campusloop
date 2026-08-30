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
