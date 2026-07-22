import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const db = getDb();

    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.username, username),
      with: {
        institution: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const publicProfile = {
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
      institution: profile.institution,
      course: profile.course,
      branch: profile.branch,
      year: profile.year,
      referralCount: profile.referralCount,
      points: profile.points,
      createdAt: profile.createdAt,
    };

    return NextResponse.json(publicProfile);
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
