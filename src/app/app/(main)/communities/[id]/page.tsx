import { CommunityFeedView } from "@/components/communities/community-feed-view";
import { CommunityHeader } from "@/components/communities/community-header";
import { getDb } from "@/db";
import { posts } from "@/db/schema";
import { FeedPost } from "@/hooks/use-feed";
import { sanitizeAnonRow } from "@/lib/anonymity";
import { getCachedAuthUser,getCachedCommunity,getCachedUserProfile } from "@/lib/server-cache";
import { desc,eq } from "drizzle-orm";
import { Metadata } from "next";
import { notFound,redirect } from "next/navigation";

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
  const description = comm.description || `Join c/${comm.name} student sub-community on CampusLoop for hot posts, confessions, and campus discussions.`;
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
  const [profile, comm] = await Promise.all([
    getCachedUserProfile(user.id),
    getCachedCommunity(id),
  ]);

  if (!profile) redirect("/app/onboarding");
  if (!comm) notFound();

  const userMembership = comm.members.find((m) => m.userId === profile.id);
  const isMember = Boolean(userMembership && userMembership.status === "ACTIVE");
  const isAdmin = Boolean(comm.creatorId === profile.id || userMembership?.role === "ADMIN");
  const memberStatus = userMembership?.status || "NONE";
  const activeMembersCount = comm.members.filter((m) => m.status === "ACTIVE").length;

  const db = getDb();
  // Fetch community posts
  const communityPosts = await db.query.posts.findMany({
    where: eq(posts.communityId, comm.id),
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
  });

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


  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col min-h-screen pb-24 px-3 sm:px-4 pt-3 gap-5 select-none">
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

      {/* Community Grand Header */}
      <CommunityHeader
        community={comm}
        membersCount={activeMembersCount}
        postsCount={formattedPosts.length}
        isMember={isMember}
        isAdmin={isAdmin}
        memberStatus={memberStatus}
      />

      {/* Main Feed View */}
      <CommunityFeedView
        community={{
          id: comm.id,
          slug: comm.slug,
          name: comm.name,
          privacy: comm.privacy,
          allowAnonymousPosts: comm.allowAnonymousPosts,
          rules: comm.rules,
        }}
        posts={formattedPosts}
        isMember={isMember}
        currentUserId={profile.id}
      />
    </main>
  );
}

