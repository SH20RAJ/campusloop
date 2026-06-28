"use server";

import { hexclaveServerApp } from "@/hexclave/server";
import { getDb } from "@/db";
import { userProfiles, institutions } from "@/db/schema";
import { redirect } from "next/navigation";

export async function completeOnboarding(formData: FormData) {
  const user = await hexclaveServerApp.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const username = formData.get("username") as string;
  const displayName = formData.get("displayName") as string;
  
  if (!username || !displayName) {
    throw new Error("Missing required fields");
  }

  const db = getDb();

  // For MVP, just assign the first institution as a fallback or get one by default
  const fallbackInst = await db.query.institutions.findFirst();
  if (!fallbackInst) {
    throw new Error("No institutions found. Please run seed script.");
  }

  try {
    await db.insert(userProfiles).values({
      userId: user.id,
      username,
      displayName,
      institutionId: fallbackInst.id,
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
