import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
      with: {
        institution: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching current user profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const existingProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!existingProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = (await req.json()) as {
      displayName?: string;
      username?: string;
      gender?: string;
      course?: string;
      branch?: string;
      year?: number;
      bio?: string;
      avatarUrl?: string;
      interests?: string[];
    };

    const updateData: Partial<typeof userProfiles.$inferInsert> = {};

    if (body.displayName !== undefined) {
      const trimmed = body.displayName.trim();
      if (trimmed.length < 2 || trimmed.length > 50) {
        return NextResponse.json({ error: "Display name must be between 2 and 50 characters" }, { status: 400 });
      }
      updateData.displayName = trimmed;
    }

    if (body.username !== undefined) {
      const trimmed = body.username.trim().toLowerCase();
      if (!/^[a-z0-9_]{3,30}$/.test(trimmed)) {
        return NextResponse.json(
          { error: "Username must be 3-30 characters and contain only letters, numbers, and underscores" },
          { status: 400 }
        );
      }

      if (trimmed !== existingProfile.username) {
        const taken = await db.query.userProfiles.findFirst({
          where: eq(userProfiles.username, trimmed),
        });
        if (taken) {
          return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
        }
        updateData.username = trimmed;
      }
    }

    if (body.gender !== undefined) {
      const validGenders = ["MALE", "FEMALE", "OTHER"];
      if (!validGenders.includes(body.gender)) {
        return NextResponse.json({ error: "Invalid gender selection" }, { status: 400 });
      }
      updateData.gender = body.gender;
    }

    if (body.course !== undefined) updateData.course = body.course.trim();
    if (body.branch !== undefined) updateData.branch = body.branch.trim();
    if (body.year !== undefined) updateData.year = Number(body.year);
    if (body.avatarUrl !== undefined) updateData.avatarUrl = body.avatarUrl.trim() || null;
    if (body.bio !== undefined) {
      if (body.bio.length > 300) {
        return NextResponse.json({ error: "Bio cannot exceed 300 characters" }, { status: 400 });
      }
      updateData.bio = body.bio.trim();
    }
    if (body.interests !== undefined && Array.isArray(body.interests)) {
      updateData.interests = body.interests;
    }

    const [updated] = await db
      .update(userProfiles)
      .set(updateData)
      .where(eq(userProfiles.id, existingProfile.id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
