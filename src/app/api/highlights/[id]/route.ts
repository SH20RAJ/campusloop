import { eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { stories, storyHighlights, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = getDb();

    const highlight = await db.query.storyHighlights.findFirst({
      where: eq(storyHighlights.id, id),
      with: {
        user: true,
      },
    });

    if (!highlight) {
      return NextResponse.json({ error: "Highlight not found" }, { status: 404 });
    }

    const storyIds = (highlight.storyIds as string[]) || [];
    let populatedStories: any[] = [];

    if (storyIds.length > 0) {
      const rawStories = await db.query.stories.findMany({
        where: inArray(stories.id, storyIds),
        with: {
          user: true,
          likes: true,
        },
      });

      // Maintain user's ordered selection
      const map = new Map(rawStories.map((s) => [s.id, s]));
      populatedStories = storyIds.map((sid) => map.get(sid)).filter(Boolean);
    }

    return NextResponse.json({
      id: highlight.id,
      title: highlight.title,
      coverUrl: highlight.coverUrl,
      author: highlight.user,
      stories: populatedStories,
    });
  } catch (error) {
    console.error("Error fetching highlight details:", error);
    return NextResponse.json({ error: "Failed to fetch highlight" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
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

    const highlight = await db.query.storyHighlights.findFirst({
      where: eq(storyHighlights.id, id),
    });

    if (!highlight) {
      return NextResponse.json({ error: "Highlight not found" }, { status: 404 });
    }

    if (highlight.userId !== profile.id && profile.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.delete(storyHighlights).where(eq(storyHighlights.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting highlight:", error);
    return NextResponse.json({ error: "Failed to delete highlight" }, { status: 500 });
  }
}
