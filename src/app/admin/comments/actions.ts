"use server";

import { revalidatePath } from "next/cache";

import { comments,moderationActions } from "@/db/schema";
import { eq } from "drizzle-orm";

import type { Db } from "../_lib/db-context";
import { getAdminDb,requireAdminProfile } from "../_lib/guard";

export async function deleteComment(commentId: string) {
	const db = await getAdminDb();
	await db.delete(comments).where(eq(comments.id, commentId));
	await logAction(db, "DELETE_COMMENT", commentId);
	revalidatePath("/admin/comments");
}

async function logAction(db: Db, action: string, targetId: string) {
	try {
		const { profile } = await requireAdminProfile();
		await db.insert(moderationActions).values({
			moderatorId: profile.id,
			targetType: "COMMENT",
			targetId,
			action,
			reason: "Admin console action",
		});
	} catch {
		// Legacy passkey session has no profile — skip audit row.
	}
}
