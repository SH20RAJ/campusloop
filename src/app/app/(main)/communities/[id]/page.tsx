import { getDb } from "@/db";
import { communities, posts, userProfiles } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { FeedPost } from "@/hooks/use-feed";
import { hexclaveServerApp } from "@/hexclave/server";
import { FeedCard } from "@/components/ui/feed-card";
import { PostComposer } from "../../post/new/post-composer";
import { JoinCommunityButton } from "../join-community-button";
import { ArrowLeft, Lock, Flame, Sparkles, Trophy, MessageSquare, ShieldCheck, Users, Clock } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const db = getDb();
  const comm = await db.query.communities.findFirst({
    where: eq(communities.id, id),
  });

  if (!comm) {
    return {
      title: "Community Hub | CampusLoop",
    };
  }

  const title = `c/${comm.name} Sub-Hub Community | CampusLoop`;
  const description = comm.description || `Join c/${comm.name} student sub-community on CampusLoop for hot posts, confessions, and campus discussions.`;
  const url = `https://campusloop.space/app/communities/${comm.id}`;

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
          url: "https://campusloop.space/logo.png",
          width: 512,
          height: 512,
          alt: comm.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://campusloop.space/logo.png"],
    },
  };
}

export default async function CommunityDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { sort = "hot" } = await searchParams;

  const user = await hexclaveServerApp.getUser();
  if (!user) redirect("/join");

  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (!profile) redirect("/app/onboarding");

  // Fetch community details
  const comm = await db.query.communities.findFirst({
    where: eq(communities.id, id),
    with: {
      members: true,
      creator: true,
    },
  });

  if (!comm) {
    notFound();
  }

  const isMember = comm.members.some((m) => m.userId === profile.id);
  const membersCount = comm.members.length;
  const initials = comm.name.slice(0, 2).toUpperCase();

  // Trending & sort calculations
  const trendingSql = sql<number>`
    coalesce((select sum(value)::int from votes where post_id = posts.id), 0) +
    coalesce((select count(*)::int from comments where post_id = posts.id and status = 'PUBLISHED'), 0)
  `;
  const votesSql = sql<number>`coalesce((select sum(value)::int from votes where post_id = posts.id), 0)`;
  const commentsSql = sql<number>`coalesce((select count(*)::int from comments where post_id = posts.id and status = 'PUBLISHED'), 0)`;

  let orderClause = [desc(posts.createdAt)];
  if (sort === "hot") orderClause = [desc(trendingSql), desc(posts.createdAt)];
  if (sort === "top") orderClause = [desc(votesSql), desc(posts.createdAt)];
  if (sort === "discussed") orderClause = [desc(commentsSql), desc(posts.createdAt)];

  // Fetch community posts
  const communityPosts = await db.query.posts.findMany({
    where: eq(posts.communityId, comm.id),
    orderBy: orderClause,
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

  function getInitialsGradient(name: string) {
    const charCodeSum = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradients = [
      "from-indigo-500 to-violet-500",
      "from-purple-500 to-pink-500",
      "from-blue-500 to-indigo-500",
      "from-violet-500 to-fuchsia-500",
      "from-fuchsia-500 to-rose-500",
    ];
    return gradients[charCodeSum % gradients.length];
  }

  return (
    <main className="space-y-6 max-w-2xl mx-auto pb-20 px-4 pt-4">
      {/* Community JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "DiscussionForum",
            name: `c/${comm.name}`,
            description: comm.description || `Sub-hub community for ${comm.name} on CampusLoop.`,
            url: `https://campusloop.space/app/communities/${comm.id}`,
            memberCount: membersCount,
          }),
        }}
      />

      {/* Back button */}
      <Link
        href="/app/communities"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Communities
      </Link>

      {/* Reddit-Style Subreddit Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div
              className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${getInitialsGradient(
                comm.name
              )} flex items-center justify-center text-white text-xl font-black shadow-lg shrink-0`}
            >
              c/{comm.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
                  c/{comm.name}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  Sub-Hub
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground font-semibold">
                <span className="text-primary font-bold">{membersCount} members</span>
                <span>&bull;</span>
                <span>
                  Created by{" "}
                  <Link href={`/@${comm.creator?.username || "admin"}`} className="hover:text-primary transition-colors hover:underline">
                    @{comm.creator?.username || "admin"}
                  </Link>
                </span>
              </div>
            </div>
          </div>
          <div className="shrink-0">
            <JoinCommunityButton communityId={comm.id} initialIsMember={isMember} />
          </div>
        </div>

        {comm.description && (
          <p className="text-xs md:text-sm text-muted-foreground border-t border-border/40 pt-4 leading-relaxed font-medium">
            {comm.description}
          </p>
        )}

        {/* Community Rules snippet */}
        <div className="flex items-center gap-4 pt-2 text-[10px] font-semibold text-muted-foreground border-t border-border/20">
          <span className="flex items-center gap-1 text-emerald-500">
            <ShieldCheck className="size-3" /> Verified Student Hub
          </span>
          <span>&bull;</span>
          <span>No Spam &middot; Respect Classmates</span>
        </div>
      </div>

      {/* Post Composer (For Members) */}
      {isMember ? (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Post to c/{comm.name}
          </h3>
          <PostComposer communityId={comm.id} />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center space-y-2 shadow-inner">
          <div className="h-9 w-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center mx-auto">
            <Lock className="h-4 w-4" />
          </div>
          <h4 className="text-xs font-bold text-foreground">Join to Post & Reply</h4>
          <p className="text-[11px] text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Join the c/{comm.name} community to post secrets, campus polls, and join discussions!
          </p>
        </div>
      )}

      {/* Reddit-Style Sorting Bar */}
      <div className="flex items-center justify-between bg-card/40 border border-border/50 rounded-2xl p-2 px-3 backdrop-blur-md">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Sort Posts
        </span>
        <div className="flex items-center gap-1 text-xs font-semibold">
          {[
            { id: "hot", label: "Hot", icon: Flame },
            { id: "new", label: "New", icon: Clock },
            { id: "top", label: "Top", icon: Trophy },
            { id: "discussed", label: "Comments", icon: MessageSquare },
          ].map((s) => {
            const IconComponent = s.icon;
            return (
              <Link
                key={s.id}
                href={`/app/communities/${comm.id}?sort=${s.id}`}
                className={`flex items-center gap-1 px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  sort === s.id
                    ? "bg-primary text-primary-foreground font-bold shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <IconComponent className="size-3" />
                <span>{s.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Community Posts Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-primary" /> c/{comm.name} Feed
          </h3>
          <span className="text-[10px] text-muted-foreground font-semibold">
            {formattedPosts.length} {formattedPosts.length === 1 ? "Post" : "Posts"}
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {formattedPosts.map((post) => (
            <FeedCard key={post.id} post={post as FeedPost} currentUserId={profile.id} />
          ))}
          {formattedPosts.length === 0 && (
            <div className="text-center py-16 border border-dashed rounded-2xl border-border bg-card text-muted-foreground text-xs font-semibold space-y-2">
              <p>No posts in c/{comm.name} yet.</p>
              {isMember && (
                <p className="text-primary font-bold">Be the first to create a post in this community!</p>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
