"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getDb } from "@/db";
import { comments, pollOptions, pollVotes, posts, votes } from "@/db/schema";
import { requireCompletedProfile } from "@/lib/auth";
import { runSafetyCheck } from "@/lib/moderation/rules";

function revalidatePostSurfaces(postId: string) {
	revalidatePath("/app/campus");
	revalidatePath("/app/global");
	revalidatePath("/app/confessions");
	revalidatePath("/app/polls");
	revalidatePath(`/app/post/${postId}`);
}

export async function votePostAction(formData: FormData) {
	const { profile } = await requireCompletedProfile();
	const db = getDb();
	const postId = String(formData.get("postId") ?? "");
	const value = Number(formData.get("value")) === -1 ? -1 : 1;

	if (!postId) {
		return;
	}

	await db
		.insert(votes)
		.values({
			postId,
			userId: profile.id,
			value,
		})
		.onConflictDoUpdate({
			target: [votes.userId, votes.postId],
			set: { value },
		});

	revalidatePostSurfaces(postId);
}

export async function addCommentAction(formData: FormData) {
	const { profile } = await requireCompletedProfile();
	const db = getDb();
	const postId = String(formData.get("postId") ?? "");
	const body = String(formData.get("body") ?? "").trim();
	const isAnonymous = formData.get("isAnonymous") === "on";

	if (!postId || body.length < 2) {
		redirect(`/app/post/${postId}?comment=short`);
	}

	const safety = runSafetyCheck({ body });

	if (safety.blocked) {
		redirect(`/app/post/${postId}?comment=blocked`);
	}

	await db.insert(comments).values({
		postId,
		authorId: profile.id,
		body,
		isAnonymous,
		status: safety.status,
	});

	revalidatePostSurfaces(postId);
	redirect(`/app/post/${postId}${safety.status === "PENDING_REVIEW" ? "?comment=review" : ""}`);
}

export async function votePollAction(formData: FormData) {
	const { profile } = await requireCompletedProfile();
	const db = getDb();
	const postId = String(formData.get("postId") ?? "");
	const optionId = String(formData.get("optionId") ?? "");

	if (!postId || !optionId) {
		return;
	}

	const [option] = await db
		.select({ id: pollOptions.id })
		.from(pollOptions)
		.where(and(eq(pollOptions.id, optionId), eq(pollOptions.postId, postId)))
		.limit(1);

	if (!option) {
		return;
	}

	await db
		.insert(pollVotes)
		.values({
			postId,
			optionId,
			userId: profile.id,
		})
		.onConflictDoNothing();

	revalidatePostSurfaces(postId);
}

export async function deletePostAction(formData: FormData) {
	const { profile } = await requireCompletedProfile();
	const db = getDb();
	const postId = String(formData.get("postId") ?? "");

	if (!postId) {
		return;
	}

	const [post] = await db.select({ authorId: posts.authorId }).from(posts).where(eq(posts.id, postId)).limit(1);

	if (!post || (post.authorId !== profile.id && profile.role !== "ADMIN" && profile.role !== "MODERATOR")) {
		return;
	}

	await db.update(posts).set({ status: "DELETED" }).where(eq(posts.id, postId));
	revalidatePostSurfaces(postId);
	redirect("/app/campus");
}

export async function deleteCommentAction(formData: FormData) {
	const { profile } = await requireCompletedProfile();
	const db = getDb();
	const commentId = String(formData.get("commentId") ?? "");
	const postId = String(formData.get("postId") ?? "");

	if (!commentId || !postId) {
		return;
	}

	const [comment] = await db.select({ authorId: comments.authorId }).from(comments).where(eq(comments.id, commentId)).limit(1);

	if (!comment || (comment.authorId !== profile.id && profile.role !== "ADMIN" && profile.role !== "MODERATOR")) {
		return;
	}

	await db.update(comments).set({ status: "DELETED" }).where(eq(comments.id, commentId));
	revalidatePostSurfaces(postId);
}
