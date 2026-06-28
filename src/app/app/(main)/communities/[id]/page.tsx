import { getDb } from "@/db";
import { communities, communityMembers, posts, userProfiles } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { hexclaveServerApp } from "@/hexclave/server";
import { FeedCard } from "@/components/ui/feed-card";
import { PostComposer } from "../../post/new/post-composer";
import { JoinCommunityButton } from "../join-community-button";
import { Users2, ArrowLeft } from "lucide-react";
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
  if (!user) redirect("/sign-in");

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

  // Fetch community posts
  const communityPosts = await db.query.posts.findMany({
    where: eq(posts.communityId, comm.id),
    orderBy: [desc(posts.createdAt)],
    with: {
      author: true,
      institution: true,
      votes: true,
      comments: true,
    }
  });

  const formattedPosts = communityPosts.map(post => {
    const votesCount = post.votes.reduce((acc, vote) => acc + vote.value, 0);
    const commentsCount = post.comments.length;
    const userVote = post.votes.find(v => v.userId === profile.id)?.value || 0;

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
    <main className="space-y-6">
      {/* Back button */}
      <Link 
        href="/app/communities" 
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Communities
      </Link>

      {/* Community Detail Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-3 text-primary border border-primary/10">
              <Users2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">{comm.name}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {membersCount} {membersCount === 1 ? "member" : "members"} • Created by @{comm.creator?.username || "admin"}
              </p>
            </div>
          </div>
          <JoinCommunityButton communityId={comm.id} initialIsMember={isMember} />
        </div>

        {comm.description && (
          <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-border">
            {comm.description}
          </p>
        )}
      </div>

      {/* Post Composer (Only for members) */}
      {isMember ? (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Create a post in {comm.name}</h3>
          <PostComposer communityId={comm.id} />
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-muted/20 p-6 text-center text-xs text-muted-foreground">
          Join this community to start sharing posts here.
        </div>
      )}

      {/* Community Feed */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Feed</h3>
        
        <div className="space-y-6">
          {formattedPosts.map((post) => (
            <FeedCard key={post.id} post={post as any} />
          ))}
          {formattedPosts.length === 0 && (
            <div className="text-center py-16 border border-dashed rounded-xl border-border bg-card text-muted-foreground text-sm">
              No posts have been shared in this community yet.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
