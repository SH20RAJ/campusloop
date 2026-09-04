import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { LoopDeckItem } from "@/components/post/deck/deck-types";
import { PostReelsDeck } from "@/components/post/post-reels-deck";
import { getDb } from "@/db";
import { academicResources, posts } from "@/db/schema";
import type { FeedPost } from "@/hooks/use-feed";
import { slugifyAcademicResource } from "@/lib/academics/slug";
import { sanitizeAnonRow } from "@/lib/anonymity";
import { formatApiFeedPosts, resolveFeedPage } from "@/lib/feed";
import { getRecommendedUsers } from "@/lib/recommendations/recommended-users";
import { getRelatedPosts } from "@/lib/recommendations/related-posts";
import { getCachedAuthUser, getCachedPostDetail, getCachedUserProfile } from "@/lib/server-cache";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getCachedPostDetail(id);

  if (!post) {
    return {
      title: "Campus Loop",
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
      "campus loop",
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
  const db = getDb();

  // 1. Fetch initial post and current user profile
  const [rawPost, profile] = await Promise.all([
    getCachedPostDetail(id),
    user ? getCachedUserProfile(user.id) : Promise.resolve(null),
  ]);

  if (!rawPost) {
    notFound();
  }

  // Format initial post to FeedPost format
  const votesCount = rawPost.votes.reduce((acc, vote) => acc + vote.value, 0);
  const commentsCount = rawPost.comments.length;
  const userVote = profile ? rawPost.votes.find((v) => v.userId === profile.id)?.value || 0 : 0;

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

  const initialPost: FeedPost = {
    ...sanitizeAnonRow(rawPost),
    votesCount,
    commentsCount,
    userVote,
    pollOptions: formattedPollOptions,
    hasVotedPoll,
    totalPollVotes,
    votes: undefined,
  } as unknown as FeedPost;

  // 2. Concurrently fetch Related Posts, Adjacent Campus Feed, User Suggestions, and Academic Vault Drops
  const [relatedItems, feedRows, suggestedPeers, academicDrops] = await Promise.all([
    getRelatedPosts(id, { limit: 6, currentUserId: profile?.id }).catch(() => []),
    resolveFeedPage({
      conditions: [eq(posts.status, "PUBLISHED"), eq(posts.isSeeded, false)],
      sort: "for_you",
      limit: 12,
      offset: 0,
      userInstitutionId: rawPost.institutionId,
      viewerProfileId: profile?.id,
    }).catch(() => []),
    profile ? getRecommendedUsers(profile.id, { limit: 4 }).catch(() => []) : Promise.resolve([]),
    db.query.academicResources
      .findMany({
        where: rawPost.institutionId ? eq(academicResources.institutionId, rawPost.institutionId) : undefined,
        orderBy: [desc(academicResources.downloadsCount), desc(academicResources.createdAt)],
        limit: 2,
      })
      .catch(() => []),
  ]);

  const formattedFeed = await formatApiFeedPosts(feedRows, profile?.id);

  // 3. Assemble Polymorphic Interstitial Deck
  const initialItems: LoopDeckItem[] = [{ type: "POST", post: initialPost }];
  const seenPostIds = new Set<string>([initialPost.id]);

  // Add first related post
  const relatedPosts = relatedItems.map((r) => r.post).filter((p) => !seenPostIds.has(p.id));
  if (relatedPosts[0]) {
    seenPostIds.add(relatedPosts[0].id);
    initialItems.push({ type: "POST", post: relatedPosts[0] });
  }

  // Add adjacent feed posts
  const adjacentPosts = formattedFeed.filter((p) => !seenPostIds.has(p.id));
  if (adjacentPosts[0]) {
    seenPostIds.add(adjacentPosts[0].id);
    initialItems.push({ type: "POST", post: adjacentPosts[0] as unknown as FeedPost });
  }

  // Interstitial 1: User suggestions (who to follow)
  if (suggestedPeers.length > 0) {
    initialItems.push({
      type: "USER_SUGGESTIONS",
      id: "deck-interstitial-users",
      users: suggestedPeers.map((u) => ({
        id: u.id,
        displayName: u.displayName,
        username: u.username,
        avatarUrl: u.avatarUrl,
        bio: u.bio,
        branch: u.branch,
        year: u.year,
        institutionName: u.institution?.name,
        isFollowing: u.isFollowing,
      })),
    });
  }

  // Add second related post
  if (relatedPosts[1]) {
    seenPostIds.add(relatedPosts[1].id);
    initialItems.push({ type: "POST", post: relatedPosts[1] });
  }

  // Add next adjacent feed post
  if (adjacentPosts[1]) {
    seenPostIds.add(adjacentPosts[1].id);
    initialItems.push({ type: "POST", post: adjacentPosts[1] as unknown as FeedPost });
  }

  // Interstitial 2: Academic Vault Drop
  if (academicDrops[0]) {
    const res = academicDrops[0];
    initialItems.push({
      type: "ACADEMIC_DROP",
      id: `deck-academic-${res.id}`,
      resource: {
        id: res.id,
        slug: slugifyAcademicResource({ id: res.id, subjectCode: res.subjectCode, title: res.title || res.subjectName || "" }),
        title: res.title,
        subjectCode: res.subjectCode,
        subjectName: res.subjectName,
        branch: res.branch,
        semester: res.semester,
        resourceType: res.resourceType,
        fileUrl: res.fileUrl,
        driveUrl: res.driveUrl,
        downloadsCount: res.downloadsCount,
        institutionName: rawPost.institution?.name?.split(",")[0],
      },
    });
  }

  // Add remaining related and adjacent posts
  for (let i = 2; i < relatedPosts.length; i++) {
    if (!seenPostIds.has(relatedPosts[i].id)) {
      seenPostIds.add(relatedPosts[i].id);
      initialItems.push({ type: "POST", post: relatedPosts[i] });
    }
  }

  for (let i = 2; i < adjacentPosts.length; i++) {
    if (!seenPostIds.has(adjacentPosts[i].id)) {
      seenPostIds.add(adjacentPosts[i].id);
      initialItems.push({ type: "POST", post: adjacentPosts[i] as unknown as FeedPost });
    }
  }

  const campusName = rawPost.institution?.name?.split(",")[0] || "Campus";

  return (
    <PostReelsDeck
      initialItems={initialItems}
      currentUserId={profile?.id}
      campusName={campusName}
    />
  );
}
