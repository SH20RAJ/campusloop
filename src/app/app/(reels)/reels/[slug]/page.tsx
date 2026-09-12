import { desc, eq, ne, or, sql } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReelsFeedClient } from "@/components/reels/reels-feed-client";
import { getDb } from "@/db";
import { institutions, reelLikes, reels } from "@/db/schema";
import type { FeedPost } from "@/hooks/use-feed";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const db = getDb();

  const target = await db.query.reels.findFirst({
    where: or(eq(reels.id, slug), eq(reels.slug, slug)),
  });

  if (!target) {
    return {
      title: "Reel Not Found | CampusLoop",
      description: "The requested campus reel could not be found.",
    };
  }

  const title = target.title
    ? `${target.title} · Campus Reel | CampusLoop`
    : `Campus Reel: "${target.caption.slice(0, 48)}..." | CampusLoop`;

  const description =
    target.caption.slice(0, 150) ||
    "Watch authentic campus reels, late night hostel vibes, hackathons, and student moments on CampusLoop.";

  const url = `https://campusloop.space/app/reels/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "CampusLoop Reels",
      images: [
        {
          url: target.thumbnailUrl || "https://campusloop.space/og-image.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [target.thumbnailUrl || "https://campusloop.space/og-image.png"],
    },
  };
}

function mapReelToFeedPost(r: any, likedSet: Set<string>): FeedPost {
  return {
    id: r.id,
    title: r.title,
    body: `${r.caption}\n\n${((r.tags as string[]) || []).map((t: string) => `#${t}`).join(" ")}`,
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
    userVote: likedSet.has(r.id) ? 1 : 0,
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
  } as unknown as FeedPost;
}

export default async function SingleReelPage({ params }: PageProps) {
  const { slug } = await params;
  const user = await getCachedAuthUser();
  const profile = user ? await getCachedUserProfile(user.id) : null;
  const db = getDb();

  // 1. Fetch targeted reel
  const rawTarget = await db
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
    .where(or(eq(reels.id, slug), eq(reels.slug, slug)))
    .limit(1);

  if (!rawTarget || rawTarget.length === 0) {
    notFound();
  }

  const targetReel = rawTarget[0];

  // 2. Fetch subsequent reels excluding target
  const remainingReels = await db
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
    .where(ne(reels.id, targetReel.id))
    .orderBy(
      desc(
        sql`(${reels.likesCount} * 3 + ${reels.commentsCount} * 5 + ${reels.sharesCount} * 4 + ${reels.viewsCount} + EXTRACT(EPOCH FROM ${reels.createdAt}) / 86400)`
      ),
      desc(reels.createdAt)
    )
    .limit(15);

  const allRaw = [targetReel, ...remainingReels];
  const allIds = allRaw.map((r) => r.id);
  const likedReelsSet = new Set<string>();

  if (profile?.id && allIds.length > 0) {
    const userLikes = await db
      .select({ reelId: reelLikes.reelId })
      .from(reelLikes)
      .where(sql`${reelLikes.userId} = ${profile.id} AND ${reelLikes.reelId} IN (${sql.join(allIds.map((id) => sql`${id}`), sql`, `)})`);
    for (const l of userLikes) likedReelsSet.add(l.reelId);
  }

  const allPosts = allRaw.map((r) => mapReelToFeedPost(r, likedReelsSet));
  const collegeName = profile?.institution?.name ? profile.institution.name.split(",")[0] : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: targetReel.title || "Campus Reel",
    description: targetReel.caption.slice(0, 160) || "Campus reel video on CampusLoop",
    uploadDate: targetReel.createdAt,
    contentUrl: `https://campusloop.space/app/reels/${targetReel.id}`,
    thumbnailUrl: [targetReel.thumbnailUrl || "https://campusloop.space/og-image.png"],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReelsFeedClient
        initialPosts={allPosts}
        currentUserId={profile?.id}
        collegeName={collegeName}
      />
    </>
  );
}
