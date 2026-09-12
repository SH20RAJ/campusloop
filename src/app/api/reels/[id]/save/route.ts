import { type NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { reelBookmarks, userProfiles } from "@/db/schema";
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

    const existingBookmark = await db.query.reelBookmarks.findFirst({
      where: and(eq(reelBookmarks.reelId, reelId), eq(reelBookmarks.userId, profile.id)),
    });

    let isSaved = false;
    if (existingBookmark) {
      await db.delete(reelBookmarks).where(eq(reelBookmarks.id, existingBookmark.id));
      isSaved = false;
    } else {
      await db.insert(reelBookmarks).values({
        reelId,
        userId: profile.id,
      });
      isSaved = true;
    }

    return NextResponse.json({
      success: true,
      isSaved,
    });
  } catch (error) {
    console.error("[POST /api/reels/[id]/save error]:", error);
    return NextResponse.json({ error: "Failed to toggle bookmark" }, { status: 500 });
  }
}
