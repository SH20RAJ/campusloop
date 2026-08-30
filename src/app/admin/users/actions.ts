"use server";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { userProfiles } from "@/db/schema";

import { getAdminDb } from "../_lib/guard";

export async function updateUserRole(profileId: string, role: "STUDENT" | "MODERATOR" | "ADMIN") {
  const db = await getAdminDb();

  await db.update(userProfiles).set({ role, updatedAt: new Date() }).where(eq(userProfiles.id, profileId));
}

export async function updateUserStatus(profileId: string, status: "ACTIVE" | "SUSPENDED" | "BANNED") {
  const db = await getAdminDb();

  await db.update(userProfiles).set({ status, updatedAt: new Date() }).where(eq(userProfiles.id, profileId));
}

export async function deleteUserProfile(profileId: string) {
  const db = await getAdminDb();

  await db.delete(userProfiles).where(eq(userProfiles.id, profileId));
}

export async function createUserProfile(data: {
  username: string;
  displayName: string;
  institutionId: string;
  role: "STUDENT" | "MODERATOR" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "BANNED";
}) {
  const db = await getAdminDb();

  const userId = `mock_${randomUUID()}`;

  await db.insert(userProfiles).values({
    userId,
    username: data.username,
    displayName: data.displayName,
    institutionId: data.institutionId,
    role: data.role,
    status: data.status,
    onboardingCompleted: true,
  });
}
