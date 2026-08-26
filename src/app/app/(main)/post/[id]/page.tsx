import { FeedCard } from "@/components/ui/feed-card";
import type { FeedPost } from "@/hooks/use-feed";
import { sanitizeAnonRow } from "@/lib/anonymity";
import { getCachedAuthUser,getCachedPostDetail,getCachedUserProfile } from "@/lib/server-cache";
import { ArrowLeft,Lock } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostComments } from "./post-comments";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getCachedPostDetail(id);

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
      description: snippet,
      images: ["https://campusloop.space/og-image.png"],
    },
    robots: { index: true, follow: true },
  };

}

export default async function PostDetailPage({ params }: PostPageProps) {
  const { id } = await params;
  const user = await getCachedAuthUser();

  // Fetch post and profile in parallel with deduplicated cache
  const [rawPost, profile] = await Promise.all([
    getCachedPostDetail(id),
    user ? getCachedUserProfile(user.id) : Promise.resolve(null),
  ]);

  if (!rawPost) {
    notFound();
  }

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

  // Strip identity relations before anything crosses the client boundary.
  const post = {
    ...sanitizeAnonRow(rawPost),
    votesCount,
    commentsCount,
    userVote,
    pollOptions: formattedPollOptions,
    hasVotedPoll,
    totalPollVotes,
    votes: undefined,
  };

  const authorName = rawPost.isAnonymous ? "Anonymous Student" : rawPost.author?.displayName || "Student";

  return (
    <main className="mx-auto flex w-full flex-col min-h-screen max-w-2xl bg-background text-foreground pb-[calc(6rem+env(safe-area-inset-bottom,0px))]">
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

      {/* Header (Exact match to Reference 3 Thread Top Bar) */}
      <div className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/app"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50 hover:bg-muted text-foreground transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-sm font-black tracking-tight text-foreground truncate">
              Thread
            </h1>
            {rawPost.institution && (
              <Link
                href={`/app/college/${rawPost.institution.slug || rawPost.institution.id}`}
                className="text-[10px] text-muted-foreground font-medium hover:text-primary truncate block"
              >
                {rawPost.institution.name.split(",")[0]}
              </Link>
            )}
          </div>
        </div>

        {!user ? (
          <Link href="/join">
            <button className="rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-95 shadow-xs transition-all cursor-pointer">
              Join Campus
            </button>
          </Link>
        ) : (
          <span className="text-[10px] font-bold text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
            {post.type === "CONFESSION" ? "🙈 Confession" : post.type === "POLL" ? "📊 Poll" : "💬 Discussion"}
          </span>
        )}
      </div>

      <div className="flex flex-col px-4 pt-4 gap-4">
        {/* Main Post Card */}
        <FeedCard post={post as FeedPost} currentUserId={profile?.id} disableNavigation />

        {/* Comments Section */}
        {profile ? (
          <PostComments postId={id} />
        ) : (
          <div className="space-y-4">
            {/* Read-Only Comments List for Guests & Crawlers */}
            <div className="rounded-3xl bg-card p-4 space-y-3 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Discussion ({post.commentsCount})
              </h3>
              <div className="space-y-2.5">
                {post.comments?.map((comment) => (
                  <div key={comment.id} className="rounded-2xl bg-muted/40 p-3.5 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-foreground">
                        {comment.isAnonymous ? "Anonymous Student" : comment.author?.displayName || "Student"}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{comment.body}</p>
                  </div>
                ))}
                {!post.comments?.length && (
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
