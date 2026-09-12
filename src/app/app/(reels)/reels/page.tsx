import { desc, eq, inArray, sql } from "drizzle-orm";
import type { Metadata } from "next";
import { ReelsFeedClient } from "@/components/reels/reels-feed-client";
import { getDb } from "@/db";
import { institutions, reelLikes, reels } from "@/db/schema";
import type { FeedPost } from "@/hooks/use-feed";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Campus Reels · Student Videos & Vibes | CampusLoop",
  description:
    "Explore authentic campus reels, late night hackathons, hostel feasts, lab projects, and university moments across Indian colleges.",
  alternates: {
    canonical: "https://campusloop.space/app/reels",
  },
  openGraph: {
    title: "Campus Reels · Student Videos & Vibes | CampusLoop",
    description:
      "Explore authentic campus reels, late night hackathons, hostel feasts, lab projects, and university moments across Indian colleges.",
    url: "https://campusloop.space/app/reels",
    siteName: "CampusLoop Reels",
    images: [
      {
        url: "https://campusloop.space/og-image.png",
        width: 1200,
        height: 630,
        alt: "CampusLoop Reels",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Campus Reels · Student Videos & Vibes | CampusLoop",
    description:
      "Explore authentic campus reels, late night hackathons, hostel feasts, lab projects, and university moments across Indian colleges.",
    images: ["https://campusloop.space/og-image.png"],
  },
};

export default async function ReelsPage() {
  const user = await getCachedAuthUser();
  const profile = user ? await getCachedUserProfile(user.id) : null;
  const db = getDb();

  const rawReels = await db
    .select({
      id: reels.id,
      slug: reels.slug,
      caption: reels.caption,
      title: reels.title,
      videoUrl: reels.videoUrl,
      hlsUrl: reels.hlsUrl,
      audioUrl: reels.audioUrl,
      thumbnailUrl: reels.thumbnailUrl,
      aspectRatio: reels.aspectRatio,
      width: reels.width,
      height: reels.height,
      duration: reels.duration,
      authorId: reels.authorId,
      authorName: reels.authorName,
      authorHandle: reels.authorHandle,
      authorAvatarUrl: reels.authorAvatarUrl,
      institutionId: reels.institutionId,
      institutionName: institutions.name,
      source: reels.source,
      sourceUrl: reels.sourceUrl,
      subreddit: reels.subreddit,
      tags: reels.tags,
      likesCount: reels.likesCount,
      commentsCount: reels.commentsCount,
      sharesCount: reels.sharesCount,
      viewsCount: reels.viewsCount,
      createdAt: reels.createdAt,
    })
    .from(reels)
    .leftJoin(institutions, eq(reels.institutionId, institutions.id))
    .where(eq(reels.status, "PUBLISHED"))
    .orderBy(
      desc(
        sql`(${reels.likesCount} * 3 + ${reels.commentsCount} * 5 + ${reels.sharesCount} * 4 + ${reels.viewsCount} + EXTRACT(EPOCH FROM ${reels.createdAt}) / 86400)`
      ),
      desc(reels.createdAt)
    )
    .limit(20);

  const reelIds = rawReels.map((r) => r.id);
  const likedReelsSet = new Set<string>();
  if (profile?.id && reelIds.length > 0) {
    const userLikes = await db
      .select({ reelId: reelLikes.reelId })
      .from(reelLikes)
      .where(sql`${reelLikes.userId} = ${profile.id} AND ${reelLikes.reelId} IN (${sql.join(reelIds.map((id) => sql`${id}`), sql`, `)})`);
    for (const l of userLikes) likedReelsSet.add(l.reelId);
  }

  const formattedPosts: FeedPost[] = rawReels.map((r) => ({
    id: r.id,
    title: r.title,
    body: `${r.caption}\n\n${((r.tags as string[]) || []).map((t) => `#${t}`).join(" ")}`,
    type: "MEME" as const,
    scope: "GLOBAL" as const,
    status: "PUBLISHED" as const,
    isAnonymous: false,
    isEdited: false,
    authorId: r.authorId,
    institutionId: r.institutionId,
    author: {
      id: r.authorId || "anon",
      userId: r.authorId || "anon",
      displayName: r.authorName || "Student",
      username: r.authorHandle || "student",
      avatarUrl: r.authorAvatarUrl,
      points: 100,
      createdAt: r.createdAt,
      updatedAt: r.createdAt,
    } as any,
    institution: r.institutionId
      ? ({
          id: r.institutionId,
          name: r.institutionName || "University",
          shortName: r.institutionName ? r.institutionName.split(",")[0] : "Campus",
        } as any)
      : (null as any),
    votesCount: r.likesCount,
    commentsCount: r.commentsCount,
    userVote: likedReelsSet.has(r.id) ? 1 : 0,
    isSaved: false,
    externalPost: {
      id: r.id,
      source: "reddit" as const,
      externalId: r.id,
      subreddit: r.subreddit,
      canonicalUrl: r.sourceUrl || `https://reddit.com/r/${r.subreddit || "reels"}`,
      score: r.likesCount,
      commentCount: r.commentsCount,
      contentType: "VIDEO" as const,
      media: [
        {
          id: r.id,
          mediaType: "VIDEO" as const,
          mediaUrl: r.videoUrl,
          previewUrl: r.videoUrl,
          hlsUrl: r.hlsUrl,
          thumbnailUrl: r.thumbnailUrl,
          width: r.width,
          height: r.height,
          duration: r.duration,
          isGif: false,
          position: 0,
        },
      ],
    },
    createdAt: r.createdAt,
    updatedAt: r.createdAt,
  } as unknown as FeedPost));

  const collegeName = profile?.institution?.name ? profile.institution.name.split(",")[0] : undefined;

  // JSON-LD Structured Data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "CampusLoop Video Reels",
    description: "Authentic campus reels, hackathon vibes, and university video clips.",
    itemListElement: formattedPosts.map((post, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "VideoObject",
        name: post.title || "Campus Reel",
        description: post.body.slice(0, 150),
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
        collegeName={collegeName}
      />
    </>
  );
}
