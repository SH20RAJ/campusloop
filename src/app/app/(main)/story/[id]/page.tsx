import { getDb } from "@/db";
import { stories, userProfiles } from "@/db/schema";
import { eq, gt, desc } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { hexclaveServerApp } from "@/hexclave/server";
import { Metadata } from "next";
import { StoryViewerClient } from "./story-viewer-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const db = getDb();
  const story = await db.query.stories.findFirst({
    where: eq(stories.id, id),
    with: { user: true },
  });

  if (!story) {
    return { title: "Campus Story" };
  }

  const title = `Story by ${story.user?.displayName || "Student"}`;
  const description = story.text || "View campus vibe story on CampusLoop.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "CampusLoop",
    },
  };
}

export default async function StoryPage({ params }: PageProps) {
  const { id } = await params;
  const user = await hexclaveServerApp.getUser();
  if (!user) redirect("/join");

  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (!profile) redirect("/app/onboarding");

  // Fetch story details
  const rawStory = await db.query.stories.findFirst({
    where: eq(stories.id, id),
    with: {
      user: {
        with: {
          institution: true,
        },
      },
    },
  });

  if (!rawStory || !rawStory.user) {
    notFound();
  }

  // Fetch all active story IDs for prev/next navigation
  const allStories = await db.query.stories.findMany({
    where: gt(stories.expiresAt, new Date()),
    orderBy: [desc(stories.createdAt)],
    columns: { id: true },
  });

  const storyIds = allStories.map((s) => s.id);
  const currentIndex = storyIds.indexOf(id);
  const prevStoryId = currentIndex > 0 ? storyIds[currentIndex - 1] : null;
  const nextStoryId = currentIndex >= 0 && currentIndex < storyIds.length - 1 ? storyIds[currentIndex + 1] : null;

  const formattedStory = {
    id: rawStory.id,
    mediaUrl: rawStory.mediaUrl,
    text: rawStory.text,
    backgroundColor: rawStory.backgroundColor,
    createdAt: rawStory.createdAt ? new Date(rawStory.createdAt).toISOString() : new Date().toISOString(),
    expiresAt: rawStory.expiresAt ? new Date(rawStory.expiresAt).toISOString() : new Date().toISOString(),
    author: {
      id: rawStory.user.id,
      displayName: rawStory.user.displayName,
      username: rawStory.user.username,
      avatarUrl: rawStory.user.avatarUrl,
      institution: rawStory.user.institution ? { name: rawStory.user.institution.name } : null,
    },
  };

  return (
    <StoryViewerClient
      story={formattedStory}
      currentUserId={profile.id}
      prevStoryId={prevStoryId}
      nextStoryId={nextStoryId}
    />
  );
}
