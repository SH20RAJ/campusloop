"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { requireCompletedProfile } from "@/lib/auth";
import { normalizeUsername, parseInterests } from "@/lib/profile";

export type SettingsState = {
	error?: string;
	success?: string;
};

export async function updateProfileSettings(_state: SettingsState, formData: FormData): Promise<SettingsState> {
	const { profile } = await requireCompletedProfile();
	const db = getDb();
	const displayName = String(formData.get("displayName") ?? "").trim();
	const username = normalizeUsername(String(formData.get("username") ?? ""));
	const bio = String(formData.get("bio") ?? "").trim();
	const course = String(formData.get("course") ?? "").trim();
	const branch = String(formData.get("branch") ?? "").trim();
	const yearValue = String(formData.get("year") ?? "").trim();
	const year = yearValue ? Number.parseInt(yearValue, 10) : null;
	const interests = parseInterests(String(formData.get("interests") ?? ""));

	if (displayName.length < 2) {
		return { error: "Display name must be at least 2 characters." };
	}

	if (username.length < 3) {
		return { error: "Username must be at least 3 characters." };
	}

	if (year !== null && (!Number.isInteger(year) || year < 1 || year > 8)) {
		return { error: "Year should be a number from 1 to 8." };
	}

	const [usernameConflict] = await db
		.select({ id: userProfiles.id })
		.from(userProfiles)
		.where(and(eq(userProfiles.username, username), ne(userProfiles.id, profile.id)))
		.limit(1);

	if (usernameConflict) {
		return { error: "That username is already taken." };
	}

	await db
		.update(userProfiles)
		.set({
			displayName,
			username,
			bio: bio || null,
			course: course || null,
			branch: branch || null,
			year,
			interests,
		})
		.where(eq(userProfiles.id, profile.id));

	revalidatePath("/app/profile");
	revalidatePath("/app/settings");

	return { success: "Profile updated." };
}
