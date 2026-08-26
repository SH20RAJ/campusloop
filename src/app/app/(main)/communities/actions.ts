"use server";

import { getDb } from "@/db";
import { communities,communityMembers,userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { and,eq,sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface CreateCommunityInput {
  name: string;
  slug?: string;
  description?: string;
  category?: string;
  privacy?: "PUBLIC" | "PRIVATE" | "UNLISTED";
  allowAnonymousPosts?: boolean;
  rules?: string; // JSON stringified array of { title: string, description: string }
  avatarUrl?: string;
  bannerUrl?: string;
}

export interface UpdateCommunitySettingsInput {
  id: string;
  name?: string;
  description?: string;
  category?: string;
  privacy?: "PUBLIC" | "PRIVATE" | "UNLISTED";
  allowAnonymousPosts?: boolean;
  rules?: string;
  avatarUrl?: string;
  bannerUrl?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createCommunity(input: CreateCommunityInput) {
  const user = await hexclaveServerApp.getUser();
  if (!user) throw new Error("Not authenticated");

  const name = input.name?.trim();
  if (!name) {
    throw new Error("Community name cannot be empty");
  }

  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (!profile) throw new Error("Profile not found");

  const baseSlug = input.slug?.trim() ? slugify(input.slug) : slugify(name);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  const uniqueSlug = `${baseSlug}-${randomSuffix}`;
  const inviteCode = `join_${Math.random().toString(36).substring(2, 10)}`;

  try {
    const [newComm] = await db
      .insert(communities)
      .values({
        name,
        slug: uniqueSlug,
        description: input.description?.trim() || null,
        category: input.category || "General",
        privacy: input.privacy || "PUBLIC",
        allowAnonymousPosts: input.allowAnonymousPosts ?? true,
        rules: input.rules || null,
        avatarUrl: input.avatarUrl || null,
        bannerUrl: input.bannerUrl || null,
        creatorId: profile.id,
        inviteCode,
        points: 100, // Founding bonus
      })
      .returning();

    // Auto-join the creator as ADMIN
    await db.insert(communityMembers).values({
      communityId: newComm.id,
      userId: profile.id,
      role: "ADMIN",
      status: "ACTIVE",
    });

    // Reward creator with +100 LP
    await db
      .update(userProfiles)
      .set({ points: sql`${userProfiles.points} + 100` })
      .where(eq(userProfiles.id, profile.id));

    revalidatePath("/app/communities");
    return newComm;
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      throw new Error("A community with this name or slug already exists. Please choose a different name.");
    }
    throw error;
  }
}

export async function updateCommunitySettings(input: UpdateCommunitySettingsInput) {
  const user = await hexclaveServerApp.getUser();
  if (!user) throw new Error("Not authenticated");

  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (!profile) throw new Error("Profile not found");

  // Verify that user is the creator or an ADMIN
  const membership = await db.query.communityMembers.findFirst({
    where: and(
      eq(communityMembers.communityId, input.id),
      eq(communityMembers.userId, profile.id),
      eq(communityMembers.role, "ADMIN")
    ),
  });

  const comm = await db.query.communities.findFirst({
    where: eq(communities.id, input.id),
  });

  if (!comm) throw new Error("Community not found");
  if (comm.creatorId !== profile.id && !membership) {
    throw new Error("Only community admins can modify community settings");
  }

  const [updated] = await db
    .update(communities)
    .set({
      name: input.name ? input.name.trim() : comm.name,
      description: input.description !== undefined ? input.description?.trim() : comm.description,
      category: input.category || comm.category,
      privacy: input.privacy || comm.privacy,
      allowAnonymousPosts: input.allowAnonymousPosts ?? comm.allowAnonymousPosts,
      rules: input.rules !== undefined ? input.rules : comm.rules,
      avatarUrl: input.avatarUrl !== undefined ? input.avatarUrl : comm.avatarUrl,
      bannerUrl: input.bannerUrl !== undefined ? input.bannerUrl : comm.bannerUrl,
      updatedAt: new Date(),
    })
    .where(eq(communities.id, input.id))
    .returning();

  revalidatePath(`/app/communities/${input.id}`);
  revalidatePath(`/app/communities/${input.id}/settings`);
  return updated;
}

export async function joinCommunity(communityId: string) {
  const user = await hexclaveServerApp.getUser();
  if (!user) throw new Error("Not authenticated");

  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (!profile) throw new Error("Profile not found");

  const comm = await db.query.communities.findFirst({
    where: eq(communities.id, communityId),
  });

  if (!comm) throw new Error("Community not found");

  // Check if already a member or requested
  const existing = await db.query.communityMembers.findFirst({
    where: and(
      eq(communityMembers.communityId, communityId),
      eq(communityMembers.userId, profile.id)
    ),
  });

  if (existing) {
    // Leave community / cancel request
    await db
      .delete(communityMembers)
      .where(
        and(
          eq(communityMembers.communityId, communityId),
          eq(communityMembers.userId, profile.id)
        )
      );

    revalidatePath(`/app/communities/${communityId}`);
    revalidatePath("/app/communities");
    return { joined: false, status: "NONE" };
  } else {
    // Join community: for PRIVATE groups, status is PENDING; for PUBLIC or UNLISTED, status is ACTIVE
    const initialStatus = comm.privacy === "PRIVATE" ? "PENDING" : "ACTIVE";

    await db.insert(communityMembers).values({
      communityId,
      userId: profile.id,
      role: "MEMBER",
      status: initialStatus,
    });

    // Reward community with +15 LP on new active member join
    if (initialStatus === "ACTIVE") {
      await db
        .update(communities)
        .set({ points: sql`${communities.points} + 15` })
        .where(eq(communities.id, communityId));
    }

    revalidatePath(`/app/communities/${communityId}`);
    revalidatePath("/app/communities");
    return { joined: initialStatus === "ACTIVE", status: initialStatus };
  }
}

export async function approveJoinRequest(communityId: string, targetUserId: string) {
  const user = await hexclaveServerApp.getUser();
  if (!user) throw new Error("Not authenticated");

  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (!profile) throw new Error("Profile not found");

  // Verify caller is ADMIN or creator
  const comm = await db.query.communities.findFirst({
    where: eq(communities.id, communityId),
  });
  if (!comm) throw new Error("Community not found");

  const callerMembership = await db.query.communityMembers.findFirst({
    where: and(
      eq(communityMembers.communityId, communityId),
      eq(communityMembers.userId, profile.id),
      eq(communityMembers.role, "ADMIN")
    ),
  });

  if (comm.creatorId !== profile.id && !callerMembership) {
    throw new Error("Unauthorized to approve member requests");
  }

  await db
    .update(communityMembers)
    .set({ status: "ACTIVE" })
    .where(
      and(
        eq(communityMembers.communityId, communityId),
        eq(communityMembers.userId, targetUserId)
      )
    );

  // Award +15 LP to community
  await db
    .update(communities)
    .set({ points: sql`${communities.points} + 15` })
    .where(eq(communities.id, communityId));

  revalidatePath(`/app/communities/${communityId}/members`);
  return { success: true };
}

export async function rejectJoinRequest(communityId: string, targetUserId: string) {
  const user = await hexclaveServerApp.getUser();
  if (!user) throw new Error("Not authenticated");

  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (!profile) throw new Error("Profile not found");

  await db
    .delete(communityMembers)
    .where(
      and(
        eq(communityMembers.communityId, communityId),
        eq(communityMembers.userId, targetUserId),
        eq(communityMembers.status, "PENDING")
      )
    );

  revalidatePath(`/app/communities/${communityId}/members`);
  return { success: true };
}

export async function recordCommunityInviteShare(communityId: string) {
  const user = await hexclaveServerApp.getUser();
  if (!user) return { success: false };

  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (!profile) return { success: false };

  // Reward user +10 LP for sharing community link
  await db
    .update(userProfiles)
    .set({ points: sql`${userProfiles.points} + 10` })
    .where(eq(userProfiles.id, profile.id));

  // Reward community +10 LP
  await db
    .update(communities)
    .set({ points: sql`${communities.points} + 10` })
    .where(eq(communities.id, communityId));

  return { success: true, pointsAwarded: 10 };
}

