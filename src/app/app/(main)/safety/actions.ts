"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getDb } from "@/db";
import { blocks, reports } from "@/db/schema";
import { requireCompletedProfile } from "@/lib/auth";

const reportReasons = new Set([
	"Harassment or bullying",
	"Hate speech",
	"Doxxing/private info",
	"Threat or violence",
	"Sexual content",
	"Spam",
	"Impersonation",
	"Other",
]);

export async function reportContentAction(formData: FormData) {
	const { profile } = await requireCompletedProfile();
	const db = getDb();
	const targetType = String(formData.get("targetType") ?? "");
	const targetId = String(formData.get("targetId") ?? "");
	const reason = String(formData.get("reason") ?? "Other");
	const details = String(formData.get("details") ?? "").trim();

	if (!["POST", "COMMENT", "USER"].includes(targetType) || !targetId) {
		return;
	}

	await db.insert(reports).values({
		reporterId: profile.id,
		targetType: targetType as "POST" | "COMMENT" | "USER",
		targetId,
		reason: reportReasons.has(reason) ? reason : "Other",
		details: details || null,
	});

	revalidatePath("/app/admin");
	revalidatePath("/app/safety");
}

export async function blockUserAction(formData: FormData) {
	const { profile } = await requireCompletedProfile();
	const db = getDb();
	const blockedUserId = String(formData.get("blockedUserId") ?? "");

	if (!blockedUserId || blockedUserId === profile.id) {
		return;
	}

	await db
		.insert(blocks)
		.values({
			blockerId: profile.id,
			blockedUserId,
		})
		.onConflictDoNothing();

	revalidatePath("/app/safety");
}

export async function unblockUserAction(formData: FormData) {
	const { profile } = await requireCompletedProfile();
	const db = getDb();
	const blockedUserId = String(formData.get("blockedUserId") ?? "");

	if (!blockedUserId) {
		return;
	}

	await db.delete(blocks).where(and(eq(blocks.blockerId, profile.id), eq(blocks.blockedUserId, blockedUserId)));
	revalidatePath("/app/safety");
}
