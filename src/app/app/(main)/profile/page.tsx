import { getDb } from "@/db";
import { posts, userProfiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { hexclaveServerApp } from "@/hexclave/server";
import { Metadata } from "next";
import { ProfileClientView } from "./profile-client";
import { FeedPost } from "@/hooks/use-feed";

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
  
  if (targetId) {
    const targetProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.id, targetId),
    });
    if (targetProfile) {
      redirect(`/@${targetProfile.username}`);
    }
  }

  const currentProfile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
    with: {
      institution: true,
    }
  });

  if (!currentProfile) {
    redirect("/app/onboarding");
  }

  const profile = currentProfile;
  const isOwnProfile = true;

  // Fetch posts written by this user
  const userPosts = await db.query.posts.findMany({
    where: eq(posts.authorId, profile.id),
    orderBy: [desc(posts.createdAt)],
    with: {
      author: true,
      institution: true,
      votes: true,
      comments: true,
      pollOptions: {
        with: { votes: true }
      }
    }
  });

  // Format posts to match FeedPost type required by FeedCard
  const formattedPosts = userPosts.map(post => {
    const votesCount = post.votes.reduce((acc, vote) => acc + vote.value, 0);
    const commentsCount = post.comments.length;
    const userVote = post.votes.find(v => v.userId === currentProfile.id)?.value || 0;

    const formattedPollOptions = post.pollOptions?.map(opt => {
      const optVotesCount = opt.votes.length;
      const userVoted = opt.votes.some(v => v.userId === currentProfile.id);
      return { id: opt.id, text: opt.text, votesCount: optVotesCount, userVoted };
    });

    const hasVotedPoll = formattedPollOptions?.some(opt => opt.userVoted) || false;
    const totalPollVotes = formattedPollOptions?.reduce((acc, opt) => acc + opt.votesCount, 0) || 0;

    return {
      ...post,
      votesCount,
      commentsCount,
      userVote,
      pollOptions: formattedPollOptions,
      hasVotedPoll,
      totalPollVotes,
      votes: undefined,
      comments: undefined,
    };
  });

  return (
    <ProfileClientView
      profile={profile}
      formattedPosts={formattedPosts as FeedPost[]}
      isOwnProfile={isOwnProfile}
      currentUserId={currentProfile.id}
    />
  );
}
