"use server";

import { hexclaveServerApp } from "@/hexclave/server";
import { getDb } from "@/db";
import { userProfiles, institutionDomains } from "@/db/schema";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

export async function completeOnboarding(formData: FormData) {
  const user = await hexclaveServerApp.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  // Hexclave exposes the user's primary email on the user object
  const email = user.primaryEmail;
  if (!email) {
    throw new Error("No verified email address found on your account.");
  }

  const username = formData.get("username") as string;
  const displayName = formData.get("displayName") as string;
  
  if (!username || !displayName) {
    throw new Error("Missing required fields");
  }

  // Extract domain
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) {
    throw new Error("Invalid email format");
  }

  const db = getDb();

  // Find if domain is whitelisted
  const whitelistedDomain = await db.query.institutionDomains.findFirst({
    where: eq(institutionDomains.domain, domain)
  });

  if (!whitelistedDomain) {
    throw new Error(`Your email domain (@${domain}) is not whitelisted for any campus.`);
  }

  try {
    await db.insert(userProfiles).values({
      userId: user.id,
      username,
      displayName,
      institutionId: whitelistedDomain.institutionId,
      onboardingCompleted: true,
      role: "STUDENT",
      status: "ACTIVE",
    });
  } catch (error: any) {
    if (error.code === '23505') { // Postgres unique violation
      throw new Error("Username already taken");
    }
    throw error;
  }

  redirect("/app/campus");
}
