"use server";

import { getDb } from "@/db";
import { communities, communityMembers, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { eq, and } from "drizzle-orm";

export async function createCommunity(name: string, description: string) {
  const user = await hexclaveServerApp.getUser();
  if (!user) throw new Error("Not authenticated");

  if (!name || name.trim().length === 0) {
    throw new Error("Community name cannot be empty");
  }

  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (!profile) throw new Error("Profile not found");

  try {
    const [newComm] = await db.insert(communities).values({
      name: name.trim(),
      description: description.trim() || null,
      creatorId: profile.id,
    }).returning();

    // Auto-join the creator to the community
    await db.insert(communityMembers).values({
      communityId: newComm.id,
      userId: profile.id,
    });

    return newComm;
  } catch (error: any) {
    if (error.code === "23505") { // Unique violation
      throw new Error("A community with this name already exists");
    }
    throw error;
  }
}

export async function joinCommunity(communityId: string) {
  const user = await hexclaveServerApp.getUser();
  if (!user) throw new Error("Not authenticated");

  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (!profile) throw new Error("Profile not found");

  // Check if already a member
  const existing = await db.query.communityMembers.findFirst({
    where: and(
      eq(communityMembers.communityId, communityId),
      eq(communityMembers.userId, profile.id)
    )
  });

  if (existing) {
    // Leave community
    await db.delete(communityMembers).where(
      and(
        eq(communityMembers.communityId, communityId),
        eq(communityMembers.userId, profile.id)
      )
    );
    return { joined: false };
  } else {
    // Join community
    await db.insert(communityMembers).values({
      communityId,
      userId: profile.id,
    });
    return { joined: true };
  }
}
