import { getDb } from "@/db";
import { posts, userProfiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { hexclaveServerApp } from "@/hexclave/server";
import { Metadata } from "next";
import { ProfileClientView } from "../profile-client";

interface ProfileDetailProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfileDetailProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username} | CampusLoop`,
    description: `View @${username}'s student profile, posts, and campus activities on CampusLoop.`,
  };
}

export default async function ProfileDetailPage({ params }: ProfileDetailProps) {
  const { username } = await params;

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

  // Look up profile by username
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.username, username),
    with: {
      institution: true,
    }
  });

  if (!profile) {
    notFound();
  }

  const isOwnProfile = profile.id === currentProfile.id;

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
