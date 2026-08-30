import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { institutions, userProfiles, votes } from "@/db/schema";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = getDb();

    const voters = await db
      .select({
        id: userProfiles.id,
        displayName: userProfiles.displayName,
        username: userProfiles.username,
        avatarUrl: userProfiles.avatarUrl,
        points: userProfiles.points,
        branch: userProfiles.branch,
        year: userProfiles.year,
        institutionName: institutions.name,
        likedAt: votes.createdAt,
      })
      .from(votes)
      .innerJoin(userProfiles, eq(votes.userId, userProfiles.id))
      .leftJoin(institutions, eq(userProfiles.institutionId, institutions.id))
      .where(and(eq(votes.postId, id), eq(votes.value, 1)))
      .orderBy(desc(votes.createdAt))
      .limit(100);

    const users = voters.map((v) => ({
      id: v.id,
      displayName: v.displayName,
      username: v.username,
      avatarUrl: v.avatarUrl,
      points: v.points,
      branch: v.branch,
      year: v.year,
      institutionName: v.institutionName?.split(",")[0] || "Campus",
      isVerified: Boolean((v.points || 0) >= 150),
      likedAt: v.likedAt,
    }));

    return NextResponse.json({
      likesCount: users.length,
      users,
    });
  } catch (error) {
    console.error("Error fetching post likes:", error);
    return NextResponse.json({ error: "Failed to fetch likes" }, { status: 500 });
  }
}
