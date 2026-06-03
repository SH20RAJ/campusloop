"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getDb } from "@/db";
import { comments, moderationActions, posts, reports, userProfiles } from "@/db/schema";
import { requireModeratorProfile } from "@/lib/auth";

type TargetType = "POST" | "COMMENT" | "USER";

async function getTargetAuthor(targetType: TargetType, targetId: string) {
	const db = getDb();

	if (targetType === "POST") {
		const [post] = await db.select({ authorId: posts.authorId }).from(posts).where(eq(posts.id, targetId)).limit(1);
		return post?.authorId ?? null;
	}

	if (targetType === "COMMENT") {
		const [comment] = await db.select({ authorId: comments.authorId }).from(comments).where(eq(comments.id, targetId)).limit(1);
		return comment?.authorId ?? null;
	}

	return targetId;
}

export async function moderationAction(formData: FormData) {
	const { profile } = await requireModeratorProfile();
	const db = getDb();
	const reportId = String(formData.get("reportId") ?? "");
	const targetType = String(formData.get("targetType") ?? "") as TargetType;
	const targetId = String(formData.get("targetId") ?? "");
	const action = String(formData.get("action") ?? "");

	if (!reportId || !["POST", "COMMENT", "USER"].includes(targetType) || !targetId || !action) {
		return;
	}

	const targetAuthorId = await getTargetAuthor(targetType, targetId);

	if (action === "HIDE_TARGET") {
		if (targetType === "POST") {
			await db.update(posts).set({ status: "HIDDEN" }).where(eq(posts.id, targetId));
		}
		if (targetType === "COMMENT") {
			await db.update(comments).set({ status: "HIDDEN" }).where(eq(comments.id, targetId));
		}
	}

	if (action === "DELETE_TARGET") {
		if (targetType === "POST") {
			await db.update(posts).set({ status: "DELETED" }).where(eq(posts.id, targetId));
		}
		if (targetType === "COMMENT") {
			await db.update(comments).set({ status: "DELETED" }).where(eq(comments.id, targetId));
		}
	}

	if (action === "SUSPEND_USER" && targetAuthorId) {
		await db.update(userProfiles).set({ status: "SUSPENDED" }).where(eq(userProfiles.id, targetAuthorId));
	}

	if (action === "BAN_USER" && targetAuthorId) {
		await db.update(userProfiles).set({ status: "BANNED" }).where(eq(userProfiles.id, targetAuthorId));
	}

	if (action === "RESOLVE_REPORT") {
		await db.update(reports).set({ status: "RESOLVED" }).where(eq(reports.id, reportId));
	}

	if (action === "REJECT_REPORT") {
		await db.update(reports).set({ status: "REJECTED" }).where(eq(reports.id, reportId));
	}

	if (action !== "RESOLVE_REPORT" && action !== "REJECT_REPORT") {
		await db.update(reports).set({ status: "REVIEWING" }).where(eq(reports.id, reportId));
	}

	await db.insert(moderationActions).values({
		moderatorId: profile.id,
		targetType,
		targetId,
		action,
		reason: String(formData.get("reason") ?? "").trim() || null,
	});

	revalidatePath("/app/admin");
	revalidatePath("/app/campus");
	revalidatePath(`/app/post/${targetId}`);
}
