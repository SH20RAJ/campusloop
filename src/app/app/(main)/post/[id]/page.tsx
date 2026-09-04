import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostReelsDeck } from "@/components/post/post-reels-deck";
import type { FeedPost } from "@/hooks/use-feed";
import { sanitizeAnonRow } from "@/lib/anonymity";
import { getCachedAuthUser, getCachedPostDetail, getCachedUserProfile } from "@/lib/server-cache";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getCachedPostDetail(id);

  if (!post) {
    return {
      title: "Post Details",
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
    <main className="w-full h-[calc(100dvh-3.5rem)] md:h-[calc(100dvh-4rem)] bg-background text-foreground overflow-hidden">
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

      {/* ─── Reels Vertical Post Deck (Twitter + Facebook + Instagram Fusion) ─── */}
      <PostReelsDeck initialPost={post as FeedPost} currentUserId={profile?.id} />
    </main>
  );
}
