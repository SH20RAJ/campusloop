"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";

export async function updateProfile(
  displayName: string,
  bio: string,
  username: string,
  avatarUrl: string,
  anonymousUsername?: string | null
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

  let cleanAnon = anonymousUsername
    ? anonymousUsername
        .trim()
        .toLowerCase()
        .replace(/^@/, "")
        .replace(/[^a-z0-9_]/g, "")
    : null;
  if (cleanAnon && cleanAnon.length === 0) cleanAnon = null;

  await db
    .update(userProfiles)
    .set({
      displayName,
      username: cleanUsername,
      bio,
      avatarUrl: avatarUrl || null,
      anonymousUsername: cleanAnon,
      updatedAt: new Date(),
    })
    .where(eq(userProfiles.userId, user.id));

  revalidatePath("/app/profile");
  revalidatePath("/app");
}
