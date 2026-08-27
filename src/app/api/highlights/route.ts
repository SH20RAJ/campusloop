import { getDb } from "@/db";
import { stories,storyHighlights,userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { rejectViewerWrite } from "@/lib/viewer";
import { desc,eq,inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryUserId = searchParams.get("userId");
    const queryUsername = searchParams.get("username");

    const db = getDb();
    let targetProfileId = queryUserId;

    if (!targetProfileId && queryUsername) {
      const p = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.username, queryUsername),
      });
      targetProfileId = p?.id || null;
    }

    if (!targetProfileId) {
      const user = await hexclaveServerApp.getUser();
      if (user) {
        const p = await db.query.userProfiles.findFirst({
          where: eq(userProfiles.userId, user.id),
        });
        targetProfileId = p?.id || null;
      }
    }

    if (!targetProfileId) {
      return NextResponse.json([]);
    }

    const highlights = await db.query.storyHighlights.findMany({
      where: eq(storyHighlights.userId, targetProfileId),
      orderBy: [desc(storyHighlights.createdAt)],
    });

    // Populate story previews for each highlight
    const allStoryIds = Array.from(
      new Set(highlights.flatMap((h) => (h.storyIds as string[]) || []))
    );

    let storiesMap = new Map<string, any>();
    if (allStoryIds.length > 0) {
      const fetchedStories = await db.query.stories.findMany({
        where: inArray(stories.id, allStoryIds),
        with: {
          user: true,
          likes: true,
        },
      });
      for (const s of fetchedStories) {
        storiesMap.set(s.id, s);
      }
    }

    const formatted = highlights.map((h) => {
      const sIds = (h.storyIds as string[]) || [];
      const populatedStories = sIds
        .map((sid) => storiesMap.get(sid))
        .filter(Boolean);

      const cover =
        h.coverUrl ||
        populatedStories.find((s) => s.mediaUrl)?.mediaUrl ||
        populatedStories[0]?.mediaUrl ||
        null;

      return {
        id: h.id,
        title: h.title,
        coverUrl: cover,
        storiesCount: sIds.length,
        stories: populatedStories,
        createdAt: h.createdAt,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching highlights:", error);
    return NextResponse.json({ error: "Failed to fetch highlights" }, { status: 500 });
  }
}

export async function POST(req: Request) {
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

    const viewerBlocked = await rejectViewerWrite(profile);
    if (viewerBlocked) return viewerBlocked;

    const data = await req.json();
    const { title, coverUrl, storyIds } = data as {
      title?: string;
      coverUrl?: string;
      storyIds?: string[];
    };

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Highlight title is required" }, { status: 400 });
    }

    if (!storyIds || !Array.isArray(storyIds) || storyIds.length === 0) {
      return NextResponse.json({ error: "At least one story must be selected" }, { status: 400 });
    }

    // Verify all stories belong to this user
    const userStories = await db.query.stories.findMany({
      where: inArray(stories.id, storyIds),
    });

    const validStoryIds = userStories
      .filter((s) => s.userId === profile.id)
      .map((s) => s.id);

    if (validStoryIds.length === 0) {
      return NextResponse.json({ error: "No valid stories found for user" }, { status: 400 });
    }

    const [newHighlight] = await db
      .insert(storyHighlights)
      .values({
        userId: profile.id,
        title: title.trim().slice(0, 30),
        coverUrl: coverUrl || null,
        storyIds: validStoryIds,
      })
      .returning();

    return NextResponse.json({ success: true, highlight: newHighlight });
  } catch (error) {
    console.error("Error creating highlight:", error);
    return NextResponse.json({ error: "Failed to create highlight" }, { status: 500 });
  }
}
