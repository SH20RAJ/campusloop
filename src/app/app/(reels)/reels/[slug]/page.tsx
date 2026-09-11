import { and, eq, not, or, sql } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReelsFeedClient } from "@/components/reels/reels-feed-client";
import { getDb } from "@/db";
import { externalPosts, posts } from "@/db/schema";
import type { FeedPost } from "@/hooks/use-feed";
import { formatApiFeedPosts, resolveFeedPage } from "@/lib/feed";
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
      eq(posts.status, "PUBLISHED"),
      eq(posts.id, slug)
    ),
    with: {
      institution: true,
      author: true,
    },
  });

  if (!target) {
    return {
      title: "Campus Reel · Student Videos | CampusLoop",
      description: "Watch authentic student campus reels, vibes, and moments.",
    };
  }

  const title = target.title ? `${target.title} · Campus Reel` : "Campus Reel · Student Video | CampusLoop";
  const cleanBody = target.body.replace(MD_IMAGE_REGEX, "").replace(URL_CLEAN_REGEX, "").trim();
  const description = cleanBody.slice(0, 160) || "Watch verified student campus reels on CampusLoop.";
  const url = `https://campusloop.space/app/reels/${target.id}`;

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
      type: "video.other",
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

  const rawRemaining = await resolveFeedPage({
    conditions,
    sort: "reels",
    limit: 24,
    offset: 0,
    userInstitutionId: null,
    viewerProfileId: profile?.id,
  });

  const formattedRemaining = (await formatApiFeedPosts(rawRemaining, profile?.id)) as unknown as FeedPost[];
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
