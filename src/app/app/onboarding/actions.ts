"use server";

import { hexclaveServerApp } from "@/hexclave/server";
import { getDb } from "@/db";
import { userProfiles, institutionDomains } from "@/db/schema";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

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
  
  if (!username || !displayName) {
    throw new Error("Missing required fields");
  }

  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) {
    throw new Error("Invalid email format");
  }

  const db = getDb();

  const whitelistedDomain = await db.query.institutionDomains.findFirst({
    where: eq(institutionDomains.domain, domain)
  });

  if (!whitelistedDomain) {
    throw new Error(`Your email domain (@${domain}) is not whitelisted for any campus.`);
  }

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

  const rawUsername = email.split('@')[0] || "student";
  const officialName = rawUsername
    .split(/[\._\-]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  try {
    await db.insert(userProfiles).values({
      userId: user.id,
      username,
      displayName,
      officialName,
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(username)}`,
      institutionId: whitelistedDomain.institutionId,
      referredById: referrerId,
      onboardingCompleted: true,
      role: "STUDENT",
      status: "ACTIVE",
    });

    if (referrerProfile) {
      await db.update(userProfiles)
        .set({ 
          referralCount: (referrerProfile.referralCount || 0) + 1,
          points: (referrerProfile.points || 0) + 20
        })
        .where(eq(userProfiles.id, referrerProfile.id));
    }
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === '23505') {
      throw new Error("Username already taken");
    }
    throw error;
  }

  redirect("/app");
}
