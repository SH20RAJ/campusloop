import { desc, isNotNull } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  CommunitiesIndexClient,
  type CommunityItem,
} from "@/components/communities/communities-index-client";
import { getDb } from "@/db";
import { communities, posts } from "@/db/schema";
import type { FeedPost } from "@/hooks/use-feed";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";

export const metadata: Metadata = {
  title: "Student Communities & Sub-Hubs",
  description: "Browse interest groups, technical societies, and student-created communities on CampusLoop.",
  keywords: ["Student Communities", "College Sub-Hubs", "Campus Clubs", "Student Groups India"],
  alternates: { canonical: "https://campusloop.space/app/communities" },
  openGraph: {
    title: "Student Communities & Sub-Hubs",
    description: "Browse interest groups and student communities on CampusLoop.",
    url: "https://campusloop.space/app/communities",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://campusloop.space/og-image.png",
        width: 1200,
        height: 630,
        alt: "Student Communities & Sub-Hubs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Student Communities & Sub-Hubs",
    description: "Browse interest groups and student communities on CampusLoop.",
    images: ["https://campusloop.space/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default async function CommunitiesPage() {
  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  const db = getDb();

  // Execute profile, communities, and community posts queries concurrently in a single round-trip
  const [profile, allCommunities, rawCommunityPosts] = await Promise.all([
    getCachedUserProfile(user.id),
    db.query.communities.findMany({
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
    }),
    db.query.posts.findMany({
      where: isNotNull(posts.communityId),
      orderBy: [desc(posts.createdAt)],
      limit: 40,
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
    }),
  ]);

  if (!profile) redirect("/app/onboarding");

  const formattedPosts = rawCommunityPosts.map((post) => {
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

  return (
    <CommunitiesIndexClient
      initialCommunities={allCommunities as unknown as CommunityItem[]}
      initialPosts={formattedPosts}
      profileId={profile.id}
    />
  );
}
