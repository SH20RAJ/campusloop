import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { ReelsFeedClient } from "@/components/reels/reels-feed-client";
import { getDb } from "@/db";
import { reelLikes } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { reelLikes } from "@/db/schema";
import { getDb } from "@/db";
import type { FeedPost } from "@/hooks/use-feed";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { getRecommendedReels } from "@/lib/reels/recommendation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Campus Reels | College Life, Clubs, Memes & Student Videos",
  description:
    "Discover campus-first short videos: college life, hostel moments, hackathons, clubs, student humor, events and study culture across Indian campuses.",
  alternates: {
    canonical: "https://campusloop.space/app/reels",
  },
  openGraph: {
    title: "Campus Reels | College Life, Clubs, Memes & Student Videos",
    description:
      "A campus-first reel feed for college life, student culture, clubs, events and campus moments.",
    url: "https://campusloop.space/app/reels",
    siteName: "CampusLoop",
    images: [
      {
        url: "https://campusloop.space/og-image.png",
        width: 1200,
        height: 630,
        alt: "CampusLoop campus reels",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Campus Reels | CampusLoop",
    description:
      "College life, student culture, clubs, events and campus moments from Indian colleges.",
    images: ["https://campusloop.space/og-image.png"],
  },
};

export default async function ReelsPage() {
  const user = await getCachedAuthUser();
  const profile = user ? await getCachedUserProfile(user.id) : null;
  const db = getDb();

  const seenCookie = (await cookies()).get("campusloop_seen_reels")?.value;
  const cookieSeenIds =
    seenCookie
      ?.split(",")
      .map((id) => id.trim())
      .filter((id) => /^[a-zA-Z0-9_-]+$/.test(id))
      .slice(0, 800) || [];

  const rows = await getRecommendedReels({
    viewerProfileId: profile?.id,
    viewerInstitutionId: profile?.institutionId,
    limit: 16,
    mode: "for_you",
    excludeIds: cookieSeenIds,
  });

  const reelIds = rows.map((row) => row.id);
  const likedReels = new Set<string>();

  if (profile?.id && reelIds.length > 0) {
    const likes = await db
      .select({ reelId: reelLikes.reelId })
      .from(reelLikes)
      .where(
        and(eq(reelLikes.userId, profile.id), inArray(reelLikes.reelId, reelIds))
      );
    for (const like of likes) likedReels.add(like.reelId);
  }

  const formattedPosts: FeedPost[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    body: row.tags.length ? `${row.caption}\\n\\n${row.tags.map((tag) => `#${tag}`).join(" ")}` : row.caption,
    type: "MEME" as const,
    scope: "GLOBAL" as const,
    status: "PUBLISHED" as const,
    isAnonymous: false,
    isEdited: false,
    authorId: row.authorId,
    institutionId: row.institutionId,
    author: {
      id: row.authorId || "reel-author",
      userId: row.authorId || "reel-author",
      displayName: row.authorName || "Student",
      username: row.authorHandle || "student",
      avatarUrl: row.authorAvatarUrl,
      points: 100,
      createdAt: row.createdAt,
      updatedAt: row.createdAt,
    } as any,
    institution: row.institutionId
      ? ({
          id: row.institutionId,
          name: row.institutionName || "University",
          shortName: row.institutionName ? row.institutionName.split(",")[0] : "Campus",
        } as any)
      : null,
    votesCount: row.likesCount,
    commentsCount: row.commentsCount,
    userVote: likedReels.has(row.id) ? 1 : 0,
    isSaved: false,
    externalPost: {
      id: row.id,
      source: "reddit" as const,
      externalId: row.id,
      subreddit: row.subreddit,
      canonicalUrl: row.sourceUrl || `https://reddit.com/r/${row.subreddit || "campus"}`,
      score: row.likesCount,
      commentCount: row.commentsCount,
      contentType: "VIDEO" as const,
      media: [
        {
          id: row.id,
          mediaType: "VIDEO" as const,
          mediaUrl: row.videoUrl,
          previewUrl: row.thumbnailUrl || row.videoUrl,
          hlsUrl: row.hlsUrl,
          thumbnailUrl: row.thumbnailUrl,
          width: row.width,
          height: row.height,
          duration: row.duration,
          isGif: false,
          position: 0,
        },
      ],
    },
    createdAt: row.createdAt,
    updatedAt: row.createdAt,
  } as unknown as FeedPost));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "CampusLoop Campus Reels",
    description:
      "Campus-first short videos covering college life, student culture, clubs, events and campus moments.",
    itemListElement: formattedPosts.map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "VideoObject",
        name: post.title || "Campus Reel",
        description: post.body.slice(0, 180),
        uploadDate: post.createdAt,
        contentUrl: `https://campusloop.space/app/reels/${post.id}`,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReelsFeedClient
        initialPosts={formattedPosts}
        currentUserId={profile?.id}
        collegeName={profile?.institution?.name?.split(",")[0]}
      />
    </>
  );
}
