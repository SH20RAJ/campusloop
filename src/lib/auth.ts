import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { stackServerApp } from "@/stack/server";

export async function getCurrentUser() {
	return stackServerApp.getUser();
}

export async function requireCurrentUser() {
	return stackServerApp.getUser({ or: "redirect" });
}

export async function getProfileByUserId(userId: string) {
	const db = getDb();
	const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
	return profile ?? null;
}

export async function getCurrentProfile() {
	const user = await getCurrentUser();

	if (!user) {
		return { user: null, profile: null };
	}

	const profile = await getProfileByUserId(user.id);
	return { user, profile };
}

export async function requireCompletedProfile() {
	const user = await requireCurrentUser();
	const profile = await getProfileByUserId(user.id);

	if (!profile?.onboardingCompleted) {
		redirect("/app/onboarding");
	}

	if (profile.status !== "ACTIVE") {
		redirect("/app/safety?account=restricted");
	}

	return { user, profile };
}

export async function requireModeratorProfile() {
	const context = await requireCompletedProfile();

	if (context.profile.role !== "ADMIN" && context.profile.role !== "MODERATOR") {
		redirect("/app/campus");
	}

	return context;
}
