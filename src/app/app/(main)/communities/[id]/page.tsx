import { desc, eq, ne } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CommunityDetailClient } from "@/components/communities/community-detail-client";
import { getDb } from "@/db";
import { communities, communityMembers, posts } from "@/db/schema";
import type { FeedPost } from "@/hooks/use-feed";
import { sanitizeAnonRow } from "@/lib/anonymity";
import { getCachedAuthUser, getCachedCommunity, getCachedUserProfile } from "@/lib/server-cache";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const comm = await getCachedCommunity(id);

  if (!comm) {
    return {
      title: "Community Sub-Hub | CampusLoop",
    };
  }

  const title = `c/${comm.name} Sub-Hub | CampusLoop`;
  const description =
    comm.description ||
    `Join c/${comm.name} student sub-community on CampusLoop for hot posts, confessions, and campus discussions.`;
  const url = `https://campusloop.space/app/communities/${comm.slug || comm.id}`;

  return {
    title,
    description,
    keywords: [
      `c/${comm.name}`,
      comm.name,
      `${comm.name} college club`,
      "campus sub-hub",
      "student community",
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "CampusLoop",
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: "https://campusloop.space/og-image.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://campusloop.space/og-image.png"],
    },
    robots: { index: comm.privacy === "PUBLIC", follow: comm.privacy === "PUBLIC" },
  };
}

export default async function CommunityDetailPage({ params }: PageProps) {
  const { id } = await params;

  const user = await getCachedAuthUser();
  if (!user) redirect("/handler/sign-in");

  // Parallelize user profile and community lookup
  const [profile, comm] = await Promise.all([getCachedUserProfile(user.id), getCachedCommunity(id)]);

  if (!profile) redirect("/app/onboarding");
  if (!comm) notFound();

  const userMembership = comm.members.find((m) => m.userId === profile.id);
  const isMember = Boolean(userMembership && userMembership.status === "ACTIVE");
  const isAdmin = Boolean(comm.creatorId === profile.id || userMembership?.role === "ADMIN");
  const activeMembersCount = comm.members.filter((m) => m.status === "ACTIVE").length;

  const db = getDb();

  // Parallelize community posts, full members list, and related communities
  const [communityPosts, allMembers, otherCommunities] = await Promise.all([
    db.query.posts.findMany({
      where: eq(posts.communityId, comm.id),
      orderBy: [desc(posts.createdAt)],
      limit: 50,
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
    db.query.communityMembers.findMany({
      where: eq(communityMembers.communityId, comm.id),
      limit: 30,
      with: {
        user: true,
      },
    }),
    db.query.communities.findMany({
      where: ne(communities.id, comm.id),
      limit: 4,
      with: {
        members: true,
      },
    }),
  ]);

  const formattedPosts = communityPosts.map((post) => {
    const votesCount = post.votes.reduce((acc, vote) => acc + vote.value, 0);
    const commentsCount = post.comments.length;
    const userVote = post.votes.find((v) => v.userId === profile.id)?.value || 0;

    const formattedPollOptions = post.pollOptions?.map((opt) => {
      const optVotesCount = opt.votes.length;
      const userVoted = opt.votes.some((v) => v.userId === profile.id);
      return { id: opt.id, text: opt.text, votesCount: optVotesCount, userVoted };
    });

    const hasVotedPoll = formattedPollOptions?.some((opt) => opt.userVoted) || false;
    const totalPollVotes = formattedPollOptions?.reduce((acc, opt) => acc + opt.votesCount, 0) || 0;

    return {
      ...sanitizeAnonRow(post),
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

  const membersList = allMembers
    .filter((m) => m.user)
    .map((m) => ({
      id: m.id,
      role: m.role,
      user: {
        id: m.user.id,
        username: m.user.username,
        displayName: m.user.displayName,
        avatarUrl: m.user.avatarUrl,
        headline: m.user.headline,
        points: m.user.points,
      },
    }));

  const relatedCommunities = otherCommunities.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    category: c.category,
    avatarUrl: c.avatarUrl,
    membersCount: c.members.length,
    isMember: c.members.some((m) => m.userId === profile.id),
  }));

  return (
    <>
      {/* Educational Organization / DiscussionForum JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "DiscussionForum",
            name: `c/${comm.name}`,
            description: comm.description || `Sub-hub community for ${comm.name} on CampusLoop.`,
            url: `https://campusloop.space/app/communities/${comm.slug || comm.id}`,
            memberCount: activeMembersCount,
          }),
        }}
      />

      <CommunityDetailClient
        community={{
          id: comm.id,
          name: comm.name,
          slug: comm.slug,
          description: comm.description,
          category: comm.category,
          privacy: comm.privacy,
          avatarUrl: comm.avatarUrl,
          bannerUrl: comm.bannerUrl,
          points: comm.points,
          rules: comm.rules,
          allowAnonymousPosts: comm.allowAnonymousPosts,
          creatorId: comm.creatorId,
          createdAt: comm.createdAt,
          creator: comm.creator,
        }}
        initialPosts={formattedPosts}
        initialMembersCount={activeMembersCount}
        initialIsMember={isMember}
        isAdmin={isAdmin}
        relatedCommunities={relatedCommunities}
        membersList={membersList}
      />
    </>
  );
}
