import { and, eq, not, or, sql } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReelsFeedClient } from "@/components/reels/reels-feed-client";
import { getDb } from "@/db";
import { externalPosts, posts } from "@/db/schema";
import type { FeedPost } from "@/hooks/use-feed";
import { formatApiFeedPosts, resolveFeedPage } from "@/lib/feed";
import { applyReelDiversityFilter, getViewerSeenReelIds } from "@/lib/reels/algorithm";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const MD_IMAGE_REGEX = /!\[.*?\]\(.*?\)/g;
const URL_CLEAN_REGEX = /https?:\/\/\S+/g;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const db = getDb();

  const target = await db.query.posts.findFirst({
    where: and(
      eq(posts.id, slug),
      eq(posts.status, "PUBLISHED"),
      or(
        eq(posts.isSeeded, false),
        sql`EXISTS (SELECT 1 FROM ${externalPosts} WHERE ${externalPosts.postId} = ${posts.id})`
      )
    ),
  });

  if (!target) {
    return {
      title: "Reel Not Found | CampusLoop",
      description: "The requested campus reel could not be found.",
    };
  }

  const cleanBody = target.body
    .replace(MD_IMAGE_REGEX, "")
    .replace(URL_CLEAN_REGEX, "")
    .trim();

  const title = target.title
    ? `${target.title} · Campus Reel | CampusLoop`
    : `Campus Reel: "${cleanBody.slice(0, 48)}..." | CampusLoop`;

  const description =
    cleanBody.slice(0, 150) ||
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
      description,
      images: ["https://campusloop.space/og-image.png"],
    },
  };
}

export default async function SingleReelPage({ params }: PageProps) {
  const { slug } = await params;
  const user = await getCachedAuthUser();
  const profile = user ? await getCachedUserProfile(user.id) : null;

  // 1. Fetch targeted reel via resolveFeedPage
  const rawTarget = await resolveFeedPage({
    conditions: [eq(posts.id, slug), eq(posts.status, "PUBLISHED")],
    sort: "latest",
    limit: 1,
    offset: 0,
    userInstitutionId: null,
    viewerProfileId: profile?.id,
  });

  if (!rawTarget || rawTarget.length === 0) {
    notFound();
  }

  const formattedTarget = (await formatApiFeedPosts(rawTarget, profile?.id))[0] as unknown as FeedPost;

  // 2. Fetch subsequent video reels excluding the target post
  const videoCondition = sql`(${posts.body} ILIKE '%.mp4%' OR ${posts.body} ILIKE '%.webm%' OR ${posts.body} ILIKE '%.mov%' OR ${posts.body} ILIKE '%/api/files/r2/videos/%' OR EXISTS (SELECT 1 FROM external_media em JOIN external_posts ep ON em.external_post_id = ep.id WHERE ep.post_id = ${posts.id} AND em.media_type = 'VIDEO'))`;

  const conditions = [
    eq(posts.status, "PUBLISHED"),
    or(
      eq(posts.isSeeded, false),
      sql`EXISTS (SELECT 1 FROM ${externalPosts} WHERE ${externalPosts.postId} = ${posts.id})`
    )!,
    videoCondition,
    not(eq(posts.id, rawTarget[0].id)),
  ];

  let seenIds: string[] = [rawTarget[0].id];
  if (profile?.id) {
    const viewerSeen = await getViewerSeenReelIds(profile.id, 500);
    seenIds = Array.from(new Set([...seenIds, ...viewerSeen]));
    conditions.push(
      sql`NOT EXISTS (
        SELECT 1 FROM user_behavior_events
        WHERE user_id = ${profile.id}
          AND target_id = ${posts.id}
          AND event_type IN ('REEL_WATCH', 'REEL_LOOP', 'REEL_SKIP')
      )`
    );
    const safeIds = seenIds.filter((id) => /^[a-zA-Z0-9_-]+$/.test(id)).slice(0, 300);
    if (safeIds.length > 0) {
      conditions.push(sql`${posts.id} NOT IN (${sql.join(safeIds.map((eid) => sql`${eid}`), sql`, `)})`);
    }
  }

  const rawRemaining = await resolveFeedPage({
    conditions,
    sort: "reels",
    limit: 24,
    offset: 0,
    userInstitutionId: null,
    seenIds,
    viewerProfileId: profile?.id,
  });

  const formattedRemaining = applyReelDiversityFilter(
    (await formatApiFeedPosts(rawRemaining, profile?.id)) as unknown as FeedPost[]
  );
  const allPosts = [formattedTarget, ...formattedRemaining];

  const collegeName = profile?.institution?.name ? profile.institution.name.split(",")[0] : undefined;

  // JSON-LD Structured Data for SEO (meets Google Search Console VideoObject specifications)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: formattedTarget.title || "Campus Reel",
    description: formattedTarget.body.slice(0, 160) || "Campus reel video on CampusLoop",
    uploadDate: formattedTarget.createdAt,
    contentUrl: `https://campusloop.space/app/reels/${formattedTarget.id}`,
    thumbnailUrl: [
      formattedTarget.author?.avatarUrl || "https://campusloop.space/og-image.png",
    ],
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
