import { getDb } from "@/db";
import { follows, stories, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { rankAndFilterStories } from "@/lib/stories-ranker";
import { rejectViewerWrite } from "@/lib/viewer";
import { eq, gt } from "drizzle-orm";
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

    const now = new Date();

    // 1. Fetch active stories within 24h
    const activeStories = await db.query.stories.findMany({
      where: gt(stories.expiresAt, now),
      with: {
        user: true,
      },
    });

    // 2. Fetch users followed by viewer
    const userFollows = await db.query.follows.findMany({
      where: eq(follows.followerId, profile.id),
    });

    const followingIds = userFollows.map((f) => f.followingId);
    const friendIds = userFollows.filter((f) => f.isMutual).map((f) => f.followingId);

    // 3. Rank and filter: Friends prioritized first, then general followings, only show followings + self
    const rankedResult = rankAndFilterStories({
      viewerProfileId: profile.id,
      activeStories,
      followingIds,
      friendIds,
    });

    return NextResponse.json(rankedResult);
  } catch (error) {
    console.error("Error fetching stories:", error);
    return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 });
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
    const { text, backgroundColor, mediaUrl } = data as {
      text?: string;
      backgroundColor?: string;
      mediaUrl?: string;
    };

    if (!text && !mediaUrl) {
      return NextResponse.json({ error: "Story content cannot be empty" }, { status: 400 });
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const [newStory] = await db
      .insert(stories)
      .values({
        userId: profile.id,
        text: text || null,
        backgroundColor: backgroundColor || "from-violet-600 to-indigo-600",
        mediaUrl: mediaUrl || null,
        expiresAt,
      })
      .returning();

    return NextResponse.json(newStory, { status: 201 });
  } catch (error) {
    console.error("Error creating story:", error);
    return NextResponse.json({ error: "Failed to create story" }, { status: 500 });
  }
}
