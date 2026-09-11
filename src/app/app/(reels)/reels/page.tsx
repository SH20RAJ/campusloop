import { and, eq, or, sql } from "drizzle-orm";
import type { Metadata } from "next";
import { ReelsFeedClient } from "@/components/reels/reels-feed-client";
import { externalPosts, posts } from "@/db/schema";
import type { FeedPost } from "@/hooks/use-feed";
import { formatApiFeedPosts, resolveFeedPage } from "@/lib/feed";
import { applyReelDiversityFilter, getViewerSeenReelIds } from "@/lib/reels/algorithm";
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

  // Query only published video posts (including external Reddit videos)
  const videoCondition = sql`(${posts.body} ILIKE '%.mp4%' OR ${posts.body} ILIKE '%.webm%' OR ${posts.body} ILIKE '%.mov%' OR ${posts.body} ILIKE '%/api/files/r2/videos/%' OR EXISTS (SELECT 1 FROM external_media em JOIN external_posts ep ON em.external_post_id = ep.id WHERE ep.post_id = ${posts.id} AND em.media_type = 'VIDEO'))`;

  const conditions = [
    eq(posts.status, "PUBLISHED"),
    or(
      eq(posts.isSeeded, false),
      sql`EXISTS (SELECT 1 FROM ${externalPosts} WHERE ${externalPosts.postId} = ${posts.id})`
    )!,
    videoCondition,
  ];

  let seenIds: string[] = [];
  if (profile?.id) {
    seenIds = await getViewerSeenReelIds(profile.id, 500);
    conditions.push(
      sql`NOT EXISTS (
        SELECT 1 FROM user_behavior_events
        WHERE user_id = ${profile.id}
          AND target_id = ${posts.id}
          AND event_type IN ('REEL_WATCH', 'REEL_LOOP', 'REEL_SKIP')
      )`
    );
    if (seenIds.length > 0) {
      const safeIds = seenIds.filter((id) => /^[a-zA-Z0-9_-]+$/.test(id)).slice(0, 300);
      if (safeIds.length > 0) {
        conditions.push(sql`${posts.id} NOT IN (${sql.join(safeIds.map((eid) => sql`${eid}`), sql`, `)})`);
      }
    }
  }

  const rawFeed = await resolveFeedPage({
    conditions,
    sort: "reels",
    limit: 25,
    offset: 0,
    userInstitutionId: null,
    seenIds,
    viewerProfileId: profile?.id,
  });

  const formattedPosts = applyReelDiversityFilter(
    (await formatApiFeedPosts(rawFeed, profile?.id)) as unknown as FeedPost[]
  );
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
        contentUrl: `https://campusloop.space/app/post/${post.id}`,
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
