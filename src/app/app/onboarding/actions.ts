"use server";

import { getDb } from "@/db";
import { institutionDomains,userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { validateDisplayName,validateUsername } from "@/lib/validation";
import { getViewerInstitutionId } from "@/lib/viewer";
import { eq,sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function completeOnboarding(formData: FormData) {
  const user = await hexclaveServerApp.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const email = user.primaryEmail;
  if (!email) {
    throw new Error("No verified email address found on your account.");
  }

  const username = formData.get("username") as string;
  const displayName = formData.get("displayName") as string;
  const rawGender = formData.get("gender") as string;
  const avatarUrl = (formData.get("avatarUrl") as string) || null;
  const course = (formData.get("course") as string)?.trim() || null;
  const branch = (formData.get("branch") as string)?.trim() || null;
  const year = Number(formData.get("year")) || 1;
  const bio = (formData.get("bio") as string)?.trim() || null;
  const dob = (formData.get("dob") as string)?.trim() || null;
  const isDobPrivate = formData.get("isDobPrivate") === "true" || formData.get("isDobPrivate") === "on";
  const interestsRaw = (formData.get("interests") as string) || "[]";
  let interests: string[] = [];
  try {
    interests = JSON.parse(interestsRaw);
  } catch {
    interests = [];
  }

  // Strict Gender Validation
  if (!rawGender || !["MALE", "FEMALE", "OTHER"].includes(rawGender)) {
    throw new Error("Please select your gender identification to complete onboarding.");
  }
  const gender = rawGender as "MALE" | "FEMALE" | "OTHER";

  // Strict Name & Username Validation
  const nameVal = validateDisplayName(displayName);
  if (!nameVal.isValid) {
    throw new Error(nameVal.error);
  }

  const userVal = validateUsername(username);
  if (!userVal.isValid) {
    throw new Error(userVal.error);
  }

  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) {
    throw new Error("Invalid email format");
  }

  const db = getDb();

  const whitelistedDomain = await db.query.institutionDomains.findFirst({
    where: eq(institutionDomains.domain, domain),
  });

  // Non-college emails join in Viewer-Only Mode: they get a profile in the
  // reserved Viewer Hub and can browse everything, but write APIs refuse them.
  const institutionId = whitelistedDomain
    ? whitelistedDomain.institutionId
    : await getViewerInstitutionId();

  // Handle referral tracking
  const cookieStore = await cookies();
  const referredByUsername = cookieStore.get("cl_referred_by")?.value;
  let referrerId: string | null = null;
  let referrerProfile = null;

  if (referredByUsername) {
    referrerProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.username, referredByUsername),
    });
    if (referrerProfile) {
      referrerId = referrerProfile.id;
    }
  }

  const rawUsername = email.split("@")[0] || "student";
  const officialName = rawUsername
    .split(/[\._\-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  const cleanAvatarUrl = avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(username)}`;

  try {
    await db
      .insert(userProfiles)
      .values({
        userId: user.id,
        username: username.trim().toLowerCase(),
        displayName: displayName.trim(),
        email: email.trim().toLowerCase(),
        officialName,
        avatarUrl: cleanAvatarUrl,
        gender,
        dob,
        isDobPrivate,
        course,
        branch,
        year,
        bio,
        interests,
        institutionId,
        referredById: referrerId,
        onboardingCompleted: true,
        role: "STUDENT",
        status: "ACTIVE",
      })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: {
          email: email.trim().toLowerCase(),
          username: username.trim().toLowerCase(),
          displayName: displayName.trim(),
          avatarUrl: cleanAvatarUrl,
          gender,
          dob,
          isDobPrivate,
          course,
          branch,
          year,
          bio,
          interests,
          institutionId,
          onboardingCompleted: true,
        },
      });

    if (referrerProfile) {
      await db
        .update(userProfiles)
        .set({
          referralCount: sql`${userProfiles.referralCount} + 1`,
          points: sql`${userProfiles.points} + 20`,
        })
        .where(eq(userProfiles.id, referrerProfile.id));
    }
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "23505") {
      throw new Error("Username already taken. Please pick a different one.");
    }
    throw error;
  }

  redirect("/app");
}
