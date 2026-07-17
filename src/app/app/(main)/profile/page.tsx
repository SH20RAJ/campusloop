import { getDb } from "@/db";
import { posts, userProfiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { hexclaveServerApp } from "@/hexclave/server";
import { Metadata } from "next";
import { ProfileClientView } from "./profile-client";

export const metadata: Metadata = {
  title: "Profile | CampusLoop",
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const resolvedParams = await searchParams;
  const targetId = resolvedParams.id;

  const user = await hexclaveServerApp.getUser();
  if (!user) {
    redirect("/join");
  }

  const db = getDb();
  const currentProfile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (!currentProfile) {
    redirect("/app/onboarding");
  }

  const profileId = targetId || currentProfile.id;
  const isOwnProfile = profileId === currentProfile.id;

  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.id, profileId),
    with: {
      institution: true,
    }
  });

  if (!profile) {
    redirect("/app");
  }

  // Fetch posts written by this user
  const userPosts = await db.query.posts.findMany({
    where: eq(posts.authorId, profile.id),
    orderBy: [desc(posts.createdAt)],
    with: {
      author: true,
      institution: true,
      votes: true,
      comments: true,
    }
  });

  // Format posts to match FeedPost type required by FeedCard
  const formattedPosts = userPosts.map(post => {
    const votesCount = post.votes.reduce((acc, vote) => acc + vote.value, 0);
    const commentsCount = post.comments.length;
    const userVote = post.votes.find(v => v.userId === currentProfile.id)?.value || 0;

    return {
      ...post,
      votesCount,
      commentsCount,
      userVote,
      votes: undefined,
      comments: undefined,
    };
  });

  return (
    <ProfileClientView 
      profile={profile}
      formattedPosts={formattedPosts as any[]}
      isOwnProfile={isOwnProfile}
      currentProfileId={currentProfile.id}
    />
  );
}
