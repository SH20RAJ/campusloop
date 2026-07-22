import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { stories, userProfiles, type Story, type UserProfile } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { eq, gt } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const now = new Date();

    const activeStories = await db.query.stories.findMany({
      where: gt(stories.expiresAt, now),
      with: {
        user: true,
      },
    });

    // Group stories by user profile
    type StoryPayload = Pick<
      Story,
      "id" | "mediaUrl" | "text" | "backgroundColor" | "createdAt" | "expiresAt"
    >;
    const userStoriesMap = new Map<
      string,
      UserProfile & { stories: StoryPayload[] }
    >();
    for (const story of activeStories) {
      if (!userStoriesMap.has(story.userId)) {
        userStoriesMap.set(story.userId, {
          ...story.user,
          stories: [],
        });
      }
      const userStories = userStoriesMap.get(story.userId);
      if (userStories) {
        userStories.stories.push({
          id: story.id,
          mediaUrl: story.mediaUrl,
          text: story.text,
          backgroundColor: story.backgroundColor,
          createdAt: story.createdAt,
          expiresAt: story.expiresAt,
        });
      }
    }

    const result = Array.from(userStoriesMap.values());
    return NextResponse.json(result);
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

    const [newStory] = await db.insert(stories).values({
      userId: profile.id,
      text: text || null,
      backgroundColor: backgroundColor || "from-violet-600 to-indigo-600",
      mediaUrl: mediaUrl || null,
      expiresAt,
    }).returning();

    return NextResponse.json(newStory, { status: 201 });
  } catch (error) {
    console.error("Error creating story:", error);
    return NextResponse.json({ error: "Failed to create story" }, { status: 500 });
  }
}
