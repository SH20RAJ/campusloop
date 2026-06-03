"use server";

import { redirect } from "next/navigation";

import { getDb } from "@/db";
import { pollOptions, posts } from "@/db/schema";
import { requireCompletedProfile } from "@/lib/auth";
import { runSafetyCheck } from "@/lib/moderation/rules";

const postTypes = ["NORMAL", "ANONYMOUS", "CONFESSION", "POLL", "QUESTION", "MEME", "EVENT", "LOST_FOUND"] as const;
const postScopes = ["CAMPUS", "STATE", "INDIA", "GLOBAL"] as const;

type PostType = (typeof postTypes)[number];
type PostScope = (typeof postScopes)[number];

export type CreatePostState = {
	error?: string;
};

function parsePostType(value: FormDataEntryValue | null): PostType {
	return postTypes.includes(value as PostType) ? (value as PostType) : "NORMAL";
}

function parsePostScope(value: FormDataEntryValue | null): PostScope {
	return postScopes.includes(value as PostScope) ? (value as PostScope) : "CAMPUS";
}

export async function createPost(_state: CreatePostState, formData: FormData): Promise<CreatePostState> {
	const { profile } = await requireCompletedProfile();
	const db = getDb();

	const type = parsePostType(formData.get("type"));
	const scope = parsePostScope(formData.get("scope"));
	const title = String(formData.get("title") ?? "").trim();
	const body = String(formData.get("body") ?? "").trim();
	const requestedAnonymous = formData.get("isAnonymous") === "on";
	const isAnonymous = type === "CONFESSION" || type === "ANONYMOUS" || requestedAnonymous;
	const options = formData
		.getAll("pollOption")
		.map((option) => String(option).trim())
		.filter(Boolean)
		.slice(0, 8);

	if (!body || body.length < 8) {
		return { error: "Write at least 8 characters before posting." };
	}

	if (title.length > 120) {
		return { error: "Keep titles under 120 characters." };
	}

	if (type === "POLL" && options.length < 2) {
		return { error: "Polls need at least 2 options." };
	}

	const safety = runSafetyCheck({ title, body });

	if (safety.blocked) {
		return {
			error: safety.messages[0] ?? "This post cannot be published in its current form. Please rewrite it.",
		};
	}

	const [createdPost] = await db.transaction(async (tx) => {
		const [post] = await tx
			.insert(posts)
			.values({
				authorId: profile.id,
				institutionId: profile.institutionId,
				type,
				scope,
				title: title || null,
				body,
				isAnonymous,
				status: safety.status,
				riskScore: safety.riskScore,
			})
			.returning({ id: posts.id });

		if (type === "POLL") {
			await tx.insert(pollOptions).values(
				options.map((option) => ({
					postId: post.id,
					text: option,
				})),
			);
		}

		return [post];
	});

	if (safety.status === "PENDING_REVIEW") {
		redirect("/app/campus?review=1");
	}

	redirect(`/app/campus?created=${createdPost.id}`);
}
