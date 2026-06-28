"use server";

import { hexclaveServerApp } from "@/hexclave/server";
import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function updateProfile(displayName: string, bio: string) {
  const user = await hexclaveServerApp.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  if (!displayName || displayName.trim().length === 0) {
    throw new Error("Display Name cannot be empty");
  }

  const db = getDb();
  
  await db
    .update(userProfiles)
    .set({
      displayName,
      bio,
      updatedAt: new Date()
    })
    .where(eq(userProfiles.userId, user.id));
}
