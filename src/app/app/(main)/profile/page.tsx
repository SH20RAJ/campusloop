import { getDb } from "@/db";
import { posts,userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { FeedPost } from "@/hooks/use-feed";
import { getFollowCounts } from "@/lib/follows";
import { and,desc,eq } from "drizzle-orm";
import { Metadata } from "next";
import { redirect } from "next/navigation";
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
    redirect("/handler/sign-in");
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

  // Fetch posts written by this user (exclude anonymous confessions/posts)
  const userPosts = await db.query.posts.findMany({
    where: and(
      eq(posts.authorId, profile.id),
      eq(posts.status, "PUBLISHED"),
      eq(posts.isAnonymous, false)
    ),
    orderBy: [desc(posts.createdAt)],
    limit: 20,
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

  const followCounts = await getFollowCounts(profile.id);

  return (
    <ProfileClientView
      profile={profile}
      formattedPosts={formattedPosts as FeedPost[]}
      isOwnProfile={isOwnProfile}
      currentUserId={currentProfile.id}
      followersCount={followCounts.followersCount}
      followingCount={followCounts.followingCount}
      friendsCount={followCounts.friendsCount}
    />
  );
}
