import { getDb } from "@/db";
import { communities, posts, userProfiles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { FeedPost } from "@/hooks/use-feed";
import { hexclaveServerApp } from "@/hexclave/server";
import { FeedCard } from "@/components/ui/feed-card";
import { PostComposer } from "../../post/new/post-composer";
import { JoinCommunityButton } from "../join-community-button";
import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const db = getDb();
  const comm = await db.query.communities.findFirst({
    where: eq(communities.id, id),
  });

  return {
    title: comm ? `${comm.name} | CampusLoop` : "Community | CampusLoop",
  };
}

export default async function CommunityDetailPage({ params }: PageProps) {
  const { id } = await params;
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
    }
  });

  if (!comm) {
    notFound();
  }

  const isMember = comm.members.some((m) => m.userId === profile.id);
  const membersCount = comm.members.length;
  const initials = comm.name.slice(0, 2).toUpperCase();

  // Fetch community posts
  const communityPosts = await db.query.posts.findMany({
    where: eq(posts.communityId, comm.id),
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

  const formattedPosts = communityPosts.map(post => {
    const votesCount = post.votes.reduce((acc, vote) => acc + vote.value, 0);
    const commentsCount = post.comments.length;
    const userVote = post.votes.find(v => v.userId === profile.id)?.value || 0;

    const formattedPollOptions = post.pollOptions?.map(opt => {
      const optVotesCount = opt.votes.length;
      const userVoted = opt.votes.some(v => v.userId === profile.id);
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

  // Helper to generate a unique gradient based on the community name
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
    <main className="space-y-6 max-w-2xl mx-auto pb-20">
      {/* Back button */}
      <Link 
        href="/app/communities" 
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Communities
      </Link>

      {/* Community Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm space-y-6">
        <div className="absolute right-[-10%] top-[-30%] h-48 w-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute left-[-5%] bottom-[-20%] h-36 w-36 rounded-full bg-secondary/10 blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4.5">
            <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${getInitialsGradient(comm.name)} flex items-center justify-center text-white text-lg font-black shadow-inner shadow-black/10 shrink-0`}>
              {initials}
            </div>
            <div className="space-y-1">
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-foreground">{comm.name}</h2>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground font-semibold">
                <span className="text-primary font-bold">{membersCount} {membersCount === 1 ? "member" : "members"}</span>
                <span>•</span>
                <span>Created by @{comm.creator?.username || "admin"}</span>
              </div>
            </div>
          </div>
          <div className="shrink-0 self-start sm:self-center">
            <JoinCommunityButton communityId={comm.id} initialIsMember={isMember} />
          </div>
        </div>

        {comm.description && (
          <p className="text-xs md:text-sm text-muted-foreground/90 border-t border-border/40 pt-4 leading-relaxed font-medium">
            {comm.description}
          </p>
        )}
      </div>

      {/* Post Composer (Only for members) */}
      {isMember ? (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Create a post in {comm.name}</h3>
          <PostComposer communityId={comm.id} />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center space-y-3 shadow-inner my-2">
          <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
            <Lock className="h-5 w-5" />
          </div>
          <h4 className="text-xs font-bold text-foreground">Hub Locked</h4>
          <p className="text-[11px] text-muted-foreground max-w-xs mx-auto leading-relaxed font-medium">
            Join the #{comm.name} student community to start posting, participating in polls, and interacting with classmates!
          </p>
        </div>
      )}

      {/* Community Feed */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Feed</h3>
        
        <div className="space-y-6">
          {formattedPosts.map((post) => (
            <FeedCard key={post.id} post={post as FeedPost} />
          ))}
          {formattedPosts.length === 0 && (
            <div className="text-center py-20 border border-dashed rounded-3xl border-border bg-card text-muted-foreground text-xs font-semibold">
              No posts have been shared in this community yet.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
