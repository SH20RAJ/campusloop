import { getDb } from "@/db";
import { communities, posts, userProfiles } from "@/db/schema";
import { eq, desc, isNotNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { hexclaveServerApp } from "@/hexclave/server";
import { CommunitiesClientView, Community } from "./communities-client";
import { FeedPost } from "@/hooks/use-feed";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Communities & Sub-Hub Posts | CampusLoop",
  description: "Browse student communities and community posts on CampusLoop.",
};

export default async function CommunitiesPage() {
  const user = await hexclaveServerApp.getUser();
  if (!user) redirect("/join");

  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (!profile) redirect("/app/onboarding");

  let allCommunities: unknown[] = [];
  let formattedPosts: FeedPost[] = [];

  try {
    // Fetch all communities
    allCommunities = await db.query.communities.findMany({
      orderBy: [desc(communities.createdAt)],
      with: {
        members: true,
        creator: {
          columns: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });

    // Fetch community posts (posts with a communityId)
    const rawCommunityPosts = await db.query.posts.findMany({
      where: isNotNull(posts.communityId),
      orderBy: [desc(posts.createdAt)],
      limit: 20,
      with: {
        author: true,
        institution: true,
        community: true,
        votes: true,
        comments: true,
        pollOptions: {
          with: { votes: true },
        },
      },
    });

    formattedPosts = rawCommunityPosts.map((post) => {
      const votesCount = (post.votes || []).reduce((acc, vote) => acc + vote.value, 0);
      const commentsCount = (post.comments || []).length;
      const userVote = (post.votes || []).find((v) => v.userId === profile.id)?.value || 0;

      const formattedPollOptions = post.pollOptions?.map((opt) => {
        const optVotesCount = (opt.votes || []).length;
        const userVoted = (opt.votes || []).some((v) => v.userId === profile.id);
        return { id: opt.id, text: opt.text, votesCount: optVotesCount, userVoted };
      });

      const hasVotedPoll = formattedPollOptions?.some((opt) => opt.userVoted) || false;
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
      } as unknown as FeedPost;
    });
  } catch (err) {
    console.error("Error fetching communities page data:", err);
  }

  return (
    <CommunitiesClientView
      initialCommunities={allCommunities as unknown as Community[]}
      initialPosts={formattedPosts}
      profileId={profile.id}
    />
  );
}
