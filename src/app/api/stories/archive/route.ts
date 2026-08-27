import { getDb } from "@/db";
import { stories,storyHighlights,userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { desc,eq } from "drizzle-orm";
import { NextResponse } from "next/server";

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
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    // Fetch all stories created by the user from all time
    const userStories = await db.query.stories.findMany({
      where: eq(stories.userId, profile.id),
      orderBy: [desc(stories.createdAt)],
      with: {
        likes: true,
      },
    });

    // Also fetch user's highlights to see which stories are currently highlighted
    const highlights = await db.query.storyHighlights.findMany({
      where: eq(storyHighlights.userId, profile.id),
    });

    const highlightedStoryIds = new Set<string>();
    for (const h of highlights) {
      for (const sid of h.storyIds || []) {
        highlightedStoryIds.add(sid);
      }
    }

    const now = new Date();
    const formatted = userStories.map((s) => ({
      id: s.id,
      mediaUrl: s.mediaUrl,
      text: s.text,
      backgroundColor: s.backgroundColor,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      isExpired: new Date(s.expiresAt) <= now,
      likesCount: s.likes?.length || 0,
      isHighlighted: highlightedStoryIds.has(s.id),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching story archive:", error);
    return NextResponse.json({ error: "Failed to fetch story archive" }, { status: 500 });
  }
}
