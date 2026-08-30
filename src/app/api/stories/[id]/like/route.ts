import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { stories, storyLikes, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { rejectViewerWrite } from "@/lib/viewer";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    const viewerBlocked = await rejectViewerWrite(profile);
    if (viewerBlocked) return viewerBlocked;

    const targetStory = await db.query.stories.findFirst({
      where: eq(stories.id, id),
    });

    if (!targetStory) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    const existingLike = await db.query.storyLikes.findFirst({
      where: and(eq(storyLikes.storyId, id), eq(storyLikes.userId, profile.id)),
    });

    let liked = false;
    if (existingLike) {
      await db.delete(storyLikes).where(eq(storyLikes.id, existingLike.id));
      liked = false;
    } else {
      await db.insert(storyLikes).values({
        storyId: id,
        userId: profile.id,
      });
      liked = true;
    }

    const allLikes = await db.query.storyLikes.findMany({
      where: eq(storyLikes.storyId, id),
    });

    return NextResponse.json({ success: true, liked, likesCount: allLikes.length });
  } catch (error) {
    console.error("Error liking story:", error);
    return NextResponse.json({ error: "Failed to like story" }, { status: 500 });
  }
}
