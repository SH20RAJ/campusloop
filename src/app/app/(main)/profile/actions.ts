"use server";

import { hexclaveServerApp } from "@/hexclave/server";
import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function updateProfile(
  displayName: string,
  bio: string,
  username: string,
  avatarUrl: string
) {
  const user = await hexclaveServerApp.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  if (!displayName || displayName.trim().length === 0) {
    throw new Error("Display Name cannot be empty");
  }

  if (!username || username.trim().length === 0) {
    throw new Error("Username cannot be empty");
  }

  const cleanUsername = username.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();

  const db = getDb();

  const existingUser = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.username, cleanUsername),
  });

  if (existingUser && existingUser.userId !== user.id) {
    throw new Error("Username is already taken");
  }
  
  await db
    .update(userProfiles)
    .set({
      displayName,
      username: cleanUsername,
      bio,
      avatarUrl: avatarUrl || null,
      updatedAt: new Date()
    })
    .where(eq(userProfiles.userId, user.id));
}
