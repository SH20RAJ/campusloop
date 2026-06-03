"use server";

import { and, eq, ne } from "drizzle-orm";
import { redirect } from "next/navigation";

import { getDb } from "@/db";
import { institutions, userProfiles } from "@/db/schema";
import { requireCurrentUser } from "@/lib/auth";
import { normalizeUsername, parseInterests } from "@/lib/profile";

export type OnboardingActionState = {
	error?: string;
};

export async function completeOnboarding(
	_state: OnboardingActionState,
	formData: FormData,
): Promise<OnboardingActionState> {
	const user = await requireCurrentUser();
	const db = getDb();

	const displayName = String(formData.get("displayName") ?? "").trim();
	const username = normalizeUsername(String(formData.get("username") ?? ""));
	const institutionId = String(formData.get("institutionId") ?? "").trim();
	const course = String(formData.get("course") ?? "").trim();
	const branch = String(formData.get("branch") ?? "").trim();
	const yearValue = String(formData.get("year") ?? "").trim();
	const bio = String(formData.get("bio") ?? "").trim();
	const interests = parseInterests(String(formData.get("interests") ?? ""));
	const year = yearValue ? Number.parseInt(yearValue, 10) : null;

	if (!displayName || displayName.length < 2) {
		return { error: "Add a display name with at least 2 characters." };
	}

	if (!username || username.length < 3) {
		return { error: "Choose a username with at least 3 letters or numbers." };
	}

	if (!institutionId) {
		return { error: "Search and select your college before continuing." };
	}

	if (year !== null && (!Number.isInteger(year) || year < 1 || year > 8)) {
		return { error: "Year should be a number from 1 to 8." };
	}

	const [institution] = await db.select({ id: institutions.id }).from(institutions).where(eq(institutions.id, institutionId)).limit(1);

	if (!institution) {
		return { error: "That college was not found. Search again and select a valid institution." };
	}

	const [existingProfile] = await db
		.select({ id: userProfiles.id })
		.from(userProfiles)
		.where(eq(userProfiles.userId, user.id))
		.limit(1);

	const usernameConflictWhere = existingProfile
		? and(eq(userProfiles.username, username), ne(userProfiles.id, existingProfile.id))
		: eq(userProfiles.username, username);
	const [usernameConflict] = await db
		.select({ id: userProfiles.id })
		.from(userProfiles)
		.where(usernameConflictWhere)
		.limit(1);

	if (usernameConflict) {
		return { error: "That username is already taken. Try a small variation." };
	}

	const profileValues = {
		userId: user.id,
		username,
		displayName,
		avatarUrl: user.profileImageUrl,
		institutionId,
		course: course || null,
		branch: branch || null,
		year,
		bio: bio || null,
		interests,
		onboardingCompleted: true,
	};

	if (existingProfile) {
		await db.update(userProfiles).set(profileValues).where(eq(userProfiles.id, existingProfile.id));
	} else {
		await db.insert(userProfiles).values(profileValues);
	}

	redirect("/app/campus");
}
