import { type NextRequest, NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { reelLikes, reels, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reelId } = await props.params;
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const existingLike = await db.query.reelLikes.findFirst({
      where: and(eq(reelLikes.reelId, reelId), eq(reelLikes.userId, profile.id)),
    });

    let isLiked = false;
    if (existingLike) {
      // Unlike
      await db.delete(reelLikes).where(eq(reelLikes.id, existingLike.id));
      isLiked = false;
    } else {
      // Like
      await db.insert(reelLikes).values({
        reelId,
        userId: profile.id,
      });
      isLiked = true;
    }

    // Always synchronize with real count of likes from reelLikes table
    const [actualCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(reelLikes)
      .where(eq(reelLikes.reelId, reelId));

    const likesCount = actualCount?.count || 0;

    await db
      .update(reels)
      .set({ likesCount })
      .where(eq(reels.id, reelId));

    return NextResponse.json({
      success: true,
      isLiked,
      likesCount,
    });
  } catch (error) {
    console.error("[POST /api/reels/[id]/like error]:", error);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
