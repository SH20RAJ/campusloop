"use server";

import { getDb } from "@/db";
import { anonIdentityVault, comments, moderationActions, posts, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { openSealedIdentity } from "@/lib/anonymity";
import { eq } from "drizzle-orm";

/**
 * Identity reveal is the single most sensitive operation in the product.
 * It requires a logged-in ADMIN role profile. The legacy admin passkey
 * cookie path is deliberately NOT accepted here.
 */
async function requireAdminProfile() {
	const user = await hexclaveServerApp.getUser();
	if (!user) throw new Error("Unauthorized");

	const db = getDb();
	const profile = await db.query.userProfiles.findFirst({
		where: eq(userProfiles.userId, user.id),
	});

	if (!profile || profile.role !== "ADMIN") {
		throw new Error("Forbidden — ADMIN role required");
	}

	return { db, profile };
}

export type RevealedIdentity = {
	username: string;
	displayName: string;
	institutionName: string | null;
	accountStatus: string;
	pseudonym: string | null;
};

export async function revealAnonymousAuthor(
	targetType: "POST" | "COMMENT",
	targetId: string,
): Promise<RevealedIdentity> {
	const { db, profile } = await requireAdminProfile();

	let pseudonym: string | null = null;
	if (targetType === "POST") {
		const [post] = await db.select({ pseudonym: posts.pseudonym }).from(posts).where(eq(posts.id, targetId)).limit(1);
		if (!post) throw new Error("Post not found");
		pseudonym = post.pseudonym;
	} else {
		const [comment] = await db
			.select({ pseudonym: comments.pseudonym })
			.from(comments)
			.where(eq(comments.id, targetId))
			.limit(1);
		if (!comment) throw new Error("Comment not found");
		pseudonym = comment.pseudonym;
	}

	if (!pseudonym) throw new Error("This content has no sealed identity to reveal");

	// Vault lookup by the exact handle stored on the post/comment row.
	const [vaultEntry] = await db
		.select()
		.from(anonIdentityVault)
		.where(eq(anonIdentityVault.handle, pseudonym))
		.limit(1);

	if (!vaultEntry) throw new Error("No vault entry found for this pseudonym");

	const realProfileId = openSealedIdentity(vaultEntry.sealedIdentity);
	const author = await db.query.userProfiles.findFirst({
		where: eq(userProfiles.id, realProfileId),
		with: { institution: true },
	});

	if (!author) throw new Error("Sealed identity no longer resolves to an account");

	await db.insert(moderationActions).values({
		moderatorId: profile.id,
		targetType,
		targetId,
		action: "REVEAL_ANONYMOUS_AUTHOR",
		reason: `Pseudonym ${pseudonym} resolved for moderation review`,
	});

	return {
		username: author.username,
		displayName: author.displayName,
		institutionName: author.institution?.name ?? null,
		accountStatus: author.status,
		pseudonym,
	};
}
