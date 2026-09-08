import { desc, isNotNull } from "drizzle-orm";
import type { Metadata } from "next";
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
  description: "Browse interest groups, technical societies, and student-created communities across 1,350+ Indian colleges on CampusLoop.",
  keywords: ["Student Communities", "College Sub-Hubs", "Campus Clubs", "Student Groups India", "Coding Clubs"],
  alternates: { canonical: "https://campusloop.space/app/communities" },
  openGraph: {
    title: "Student Communities & Sub-Hubs | CampusLoop",
    description: "Browse interest groups and student communities on CampusLoop.",
    url: "https://campusloop.space/app/communities",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://campusloop.space/og-communities.png",
        width: 1536,
        height: 1024,
        alt: "CampusLoop Communities & Clubs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Campus Communities, Clubs & Student Hubs | CampusLoop",
    description: "Explore student-run clubs, technical societies, and campus chapters across India.",
    images: ["https://campusloop.space/og-communities.png"],
  },
  robots: { index: true, follow: true },
};

export default async function CommunitiesPage() {
  const user = await getCachedAuthUser();
  const db = getDb();

  // Execute profile, communities, and community posts queries concurrently
  const [profile, allCommunities, rawCommunityPosts] = await Promise.all([
    user ? getCachedUserProfile(user.id) : Promise.resolve(null),
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

  const formattedPosts = rawCommunityPosts.map((post) => {
    const votesCount = (post.votes || []).reduce((acc, vote) => acc + vote.value, 0);
    const commentsCount = (post.comments || []).length;
    const userVote = profile
      ? (post.votes || []).find((v) => v.userId === profile.id)?.value || 0
      : 0;

    const formattedPollOptions = post.pollOptions?.map((opt) => {
      const optVotesCount = (opt.votes || []).length;
      const userVoted = profile
        ? (opt.votes || []).some((v) => v.userId === profile.id)
        : false;
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Student Communities & Campus Sub-Hubs",
    url: "https://campusloop.space/app/communities",
    description: "Directory of student-created technical clubs, cultural societies, and special interest groups across Indian colleges.",
    publisher: {
      "@type": "Organization",
      name: "CampusLoop",
      url: "https://campusloop.space",
      logo: "https://campusloop.space/logo.png",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CommunitiesIndexClient
        initialCommunities={allCommunities as unknown as CommunityItem[]}
        initialPosts={formattedPosts}
        profileId={profile?.id || ""}
      />
    </>
  );
}
