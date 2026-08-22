import { getDb } from "@/db";
import { posts, userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { FeedCard } from "@/components/ui/feed-card";
import { PostComments } from "./post-comments";
import { hexclaveServerApp } from "@/hexclave/server";
import type { FeedPost } from "@/hooks/use-feed";
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Lock, Sparkles, UserCheck } from "lucide-react";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { id } = await params;
  const db = getDb();
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, id),
    with: { author: true, institution: true },
  });

  if (!post) {
    return {
      title: "Post Details | CampusLoop",
      description: "Explore student yaps, confessions, and campus discussions on CampusLoop.",
    };
  }

  const authorName = post.isAnonymous ? "Anonymous Student" : post.author?.displayName || "Student";
  const snippet = post.body.length > 150 ? `${post.body.slice(0, 147)}...` : post.body;
  const title = `${post.type === "CONFESSION" ? "Confession" : "Discussion"} by ${authorName} in ${post.institution?.name?.split(",")[0] || "Campus"}`;
  const url = `https://campusloop.space/app/post/${id}`;

  return {
    title,
    description: snippet,
    keywords: [
      "campus post",
      authorName,
      post.institution?.name || "Indian College",
      "college confession",
      "student discussion",
      "CampusLoop feed",
    ],
    alternates: { canonical: url },
    openGraph: {
      title,
      description: snippet,
      url,
      siteName: "CampusLoop",
      type: "article",
      images: [
        {
          url: "https://campusloop.space/logo.png",
          width: 512,
          height: 512,
          alt: "CampusLoop Post",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: snippet,
      images: ["https://campusloop.space/logo.png"],
    },
  };
}

export default async function PostDetailPage({ params }: PostPageProps) {
  const { id } = await params;
  const user = await hexclaveServerApp.getUser();
  const db = getDb();

  const rawPost = await db.query.posts.findFirst({
    where: eq(posts.id, id),
    with: {
      author: true,
      institution: true,
      votes: true,
      comments: {
        with: {
          author: true,
        },
      },
      pollOptions: {
        with: {
          votes: true,
        },
      },
    },
  });

  if (!rawPost) {
    notFound();
  }

  // Fetch current user profile if authenticated
  const profile = user
    ? await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, user.id),
      })
    : null;

  // Format post to match FeedPost type required by FeedCard
  const votesCount = rawPost.votes.reduce((acc, vote) => acc + vote.value, 0);
  const commentsCount = rawPost.comments.length;
  const userVote = profile ? rawPost.votes.find((v) => v.userId === profile.id)?.value || 0 : 0;

  // Format poll options if type is POLL
  const formattedPollOptions = rawPost.pollOptions?.map((opt) => {
    const optVotesCount = opt.votes.length;
    const userVoted = profile ? opt.votes.some((v) => v.userId === profile.id) : false;
    return {
      id: opt.id,
      text: opt.text,
      votesCount: optVotesCount,
      userVoted,
    };
  });

  const hasVotedPoll = formattedPollOptions?.some((opt) => opt.userVoted) || false;
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

  const authorName = rawPost.isAnonymous ? "Anonymous Student" : rawPost.author?.displayName || "Student";

  return (
    <main className="mx-auto flex w-full flex-col min-h-screen max-w-2xl bg-background text-foreground pb-24">
      {/* DiscussionForumPosting JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "DiscussionForumPosting",
            headline: rawPost.body.slice(0, 110),
            articleBody: rawPost.body,
            datePublished: rawPost.createdAt,
            url: `https://campusloop.space/app/post/${id}`,
            author: {
              "@type": "Person",
              name: authorName,
            },
            publisher: {
              "@type": "Organization",
              name: "CampusLoop",
              url: "https://campusloop.space",
              logo: "https://campusloop.space/logo.png",
            },
            interactionStatistic: [
              {
                "@type": "InteractionCounter",
                interactionType: "https://schema.org/LikeAction",
                userInteractionCount: votesCount,
              },
              {
                "@type": "InteractionCounter",
                interactionType: "https://schema.org/CommentAction",
                userInteractionCount: commentsCount,
              },
            ],
          }),
        }}
      />

      {/* Header with back button */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/app"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/80 hover:bg-muted transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-sm font-black uppercase tracking-wider text-foreground">Post Details</h1>
            <p className="text-[10px] text-muted-foreground font-semibold">
              {rawPost.institution?.name?.split(",")[0] || "Campus Community"}
            </p>
          </div>
        </div>

        {!user && (
          <Link href="/join">
            <button className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white hover:opacity-95 shadow-sm shadow-primary/20 transition-all cursor-pointer">
              Join Campus
            </button>
          </Link>
        )}
      </div>

      <div className="flex flex-col px-4 pt-4 gap-4">
        {/* Main Post Card */}
        <FeedCard post={post as FeedPost} currentUserId={profile?.id} disableNavigation />

        {/* Comments Section */}
        {profile ? (
          <PostComments postId={id} currentUser={profile} />
        ) : (
          <div className="space-y-4">
            {/* Read-Only Comments List for Guests & Crawlers */}
            <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Discussion ({rawPost.comments.length})
              </h3>
              <div className="space-y-2.5">
                {rawPost.comments.map((comment) => (
                  <div key={comment.id} className="rounded-xl border border-border/50 bg-muted/20 p-3 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-foreground">
                        {comment.isAnonymous ? "Anonymous Student 🙈" : comment.author?.displayName || "Student"}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{comment.body}</p>
                  </div>
                ))}
                {rawPost.comments.length === 0 && (
                  <p className="text-xs text-muted-foreground py-4 text-center">No comments yet.</p>
                )}
              </div>
            </div>

            {/* Locked Guest CTA Banner */}
            <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center space-y-3 shadow-xs">
              <div className="size-10 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                <Lock className="size-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">Reply &amp; Vote on this Post</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  Join your verified campus network on CampusLoop to comment, upvote, and start discussions.
                </p>
              </div>
              <div className="flex justify-center gap-2.5 pt-1">
                <Link href="/join">
                  <button className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white hover:opacity-95 shadow-md shadow-primary/20 transition-all cursor-pointer">
                    Join Campus &amp; Reply (+2 LP)
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
