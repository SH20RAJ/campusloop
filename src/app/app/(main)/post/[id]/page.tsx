import { getDb } from "@/db";
import { posts, userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { FeedCard } from "@/components/ui/feed-card";
import { PostComments } from "./post-comments";
import { hexclaveServerApp } from "@/hexclave/server";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Post ${id} | CampusLoop`,
  };
}

export default async function PostDetailPage({ params }: PostPageProps) {
  const { id } = await params;
  const user = await hexclaveServerApp.getUser();
  if (!user) {
    redirect("/join");
  }

  const db = getDb();
  
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
  });

  if (!profile) {
    redirect("/app/onboarding");
  }

  const rawPost = await db.query.posts.findFirst({
    where: eq(posts.id, id),
    with: {
      author: true,
      institution: true,
      votes: true,
      comments: true,
      pollOptions: {
        with: {
          votes: true,
        }
      }
    }
  });

  if (!rawPost) {
    notFound();
  }

  // Format post to match FeedPost type required by FeedCard
  const votesCount = rawPost.votes.reduce((acc, vote) => acc + vote.value, 0);
  const commentsCount = rawPost.comments.length;
  const userVote = rawPost.votes.find(v => v.userId === profile.id)?.value || 0;

  // Format poll options if type is POLL
  const formattedPollOptions = rawPost.pollOptions?.map(opt => {
    const optVotesCount = opt.votes.length;
    const userVoted = opt.votes.some(v => v.userId === profile.id);
    return {
      id: opt.id,
      text: opt.text,
      votesCount: optVotesCount,
      userVoted,
    };
  });

  const hasVotedPoll = formattedPollOptions?.some(opt => opt.userVoted) || false;
  const totalPollVotes = formattedPollOptions?.reduce((acc, opt) => acc + opt.votesCount, 0) || 0;

  const post = {
    ...rawPost,
    votesCount,
    commentsCount,
    userVote,
    pollOptions: formattedPollOptions,
    hasVotedPoll,
    totalPollVotes,
    votes: undefined,
    comments: undefined,
  };

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      {/* Header with back button */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40 px-4 py-4 flex items-center gap-3">
        <Link href="/app" className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/80 hover:bg-muted transition-colors cursor-pointer shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-foreground">Post Details</h2>
          <p className="text-[10px] text-muted-foreground font-semibold">Join the discussion</p>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <FeedCard post={post as any} />
        <PostComments postId={id} currentUser={profile} />
      </div>
    </main>
  );
}
