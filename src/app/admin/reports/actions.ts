"use server";

import { revalidatePath } from "next/cache";

import { posts, reports, moderationActions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

import { getAdminDb, requireAdminProfile } from "../_lib/guard";
import type { Db } from "../_lib/db-context";

type ReportStatus = "OPEN" | "REVIEWING" | "RESOLVED" | "REJECTED";

async function resolveReportsForPost(db: Db, postId: string, status: ReportStatus) {
	await db
		.update(reports)
		.set({ status })
		.where(and(eq(reports.targetId, postId), eq(reports.targetType, "POST")));
}

export async function keepPost(postId: string) {
	const db = await getAdminDb();

	await db.update(posts).set({ status: "PUBLISHED" }).where(eq(posts.id, postId));
	await resolveReportsForPost(db, postId, "RESOLVED");
	await logAction(db, "REPORT_KEEP_POST", postId);
	revalidatePath("/admin/reports");
}

export async function deletePost(postId: string) {
	const db = await getAdminDb();

	await db.update(posts).set({ status: "DELETED" }).where(eq(posts.id, postId));
	await resolveReportsForPost(db, postId, "RESOLVED");
	await logAction(db, "REPORT_DELETE_POST", postId);
	revalidatePath("/admin/reports");
}

export async function hidePost(postId: string) {
	const db = await getAdminDb();

	await db.update(posts).set({ status: "HIDDEN" }).where(eq(posts.id, postId));
	await resolveReportsForPost(db, postId, "REVIEWING");
	await logAction(db, "REPORT_HIDE_POST", postId);
	revalidatePath("/admin/reports");
}

export async function dismissReport(reportId: string) {
	const db = await getAdminDb();
	await db.update(reports).set({ status: "REJECTED" }).where(eq(reports.id, reportId));
	await logAction(db, "REPORT_DISMISS", reportId);
	revalidatePath("/admin/reports");
}

async function logAction(db: Db, action: string, targetId: string) {
	try {
		const { profile } = await requireAdminProfile();
		await db.insert(moderationActions).values({
			moderatorId: profile.id,
			targetType: "POST",
			targetId,
			action,
			reason: "Report review action",
		});
	} catch {
		// Legacy passkey session has no profile — skip audit row.
	}
}
