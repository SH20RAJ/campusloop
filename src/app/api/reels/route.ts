import { and, eq, inArray } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { reelBookmarks, reelLikes, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { getRecommendedReels, type ReelFeedMode } from "@/lib/reels/recommendation";

export const dynamic = "force-dynamic";

function parseIds(value: string | null) {
  if (!value) return [];
  return value
    .split(",")
    .map((id) => id.trim())
    .filter((id) => /^[a-zA-Z0-9_-]+$/.test(id));
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(24, Math.max(1, Number.parseInt(searchParams.get("limit") || "12", 10)));
    const modeParam = searchParams.get("mode") || "for_you";
    const mode: ReelFeedMode =
      modeParam === "campus" ? "campus" : modeParam === "fresh" ? "fresh" : "for_you";

    const seenIds = Array.from(
      new Set([
        ...parseIds(searchParams.get("excludeIds")),
        ...parseIds(searchParams.get("seenIds")),
        ...parseIds(req.headers.get("x-seen-ids")),
        ...parseIds(req.cookies.get("campusloop_seen_reels")?.value || null),
      ]),
    ).slice(0, 800);

    const db = getDb();
    let currentProfileId: string | null = null;
    let viewerInstitutionId: string | null = null;

    try {
      const user = await hexclaveServerApp.getUser();
      if (user) {
        const profile = await db.query.userProfiles.findFirst({
          where: eq(userProfiles.userId, user.id),
          columns: { id: true, institutionId: true },
        });
        if (profile) {
          currentProfileId = profile.id;
          viewerInstitutionId = profile.institutionId;
        }
      }
    } catch {}

    // Exclusion-based pagination is deliberate: the ranking pool is rebuilt for every
    // request instead of applying OFFSET to a moving recommendation order.
    const excludeForRequest = page > 1 ? seenIds : seenIds;
    const rows = await getRecommendedReels({
      viewerProfileId: currentProfileId,
      viewerInstitutionId,
      limit,
      mode,
      excludeIds: excludeForRequest,
    });

    const reelIds = rows.map((row) => row.id);
    const userLikesSet = new Set<string>();
    const userBookmarksSet = new Set<string>();

    if (currentProfileId && reelIds.length > 0) {
      const [likes, bookmarks] = await Promise.all([
        db
          .select({ reelId: reelLikes.reelId })
          .from(reelLikes)
          .where(and(eq(reelLikes.userId, currentProfileId), inArray(reelLikes.reelId, reelIds))),
        db
          .select({ reelId: reelBookmarks.reelId })
          .from(reelBookmarks)
          .where(and(eq(reelBookmarks.userId, currentProfileId), inArray(reelBookmarks.reelId, reelIds))),
      ]);

      for (const like of likes) userLikesSet.add(like.reelId);
      for (const bookmark of bookmarks) userBookmarksSet.add(bookmark.reelId);
    }

    const items = rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      caption: row.caption,
      title: row.title,
      videoUrl: row.videoUrl,
      hlsUrl: row.hlsUrl,
      audioUrl: row.audioUrl,
      thumbnailUrl: row.thumbnailUrl,
      aspectRatio: row.aspectRatio,
      width: row.width,
      height: row.height,
      duration: row.duration,
      author: {
        id: row.authorId,
        name: row.authorName || "Student",
        username: row.authorHandle || "student",
        avatarUrl: row.authorAvatarUrl,
        isVerified: Boolean(row.authorId),
      },
      institution: row.institutionId
        ? {
            id: row.institutionId,
            name: row.institutionName,
            shortName: row.institutionName ? row.institutionName.split(",")[0] : null,
          }
        : null,
      source: row.source,
      sourceUrl: row.sourceUrl,
      subreddit: row.subreddit,
      tags: row.tags,
      likesCount: row.likesCount,
      commentsCount: row.commentsCount,
      sharesCount: row.sharesCount,
      viewsCount: row.viewsCount,
      isLiked: userLikesSet.has(row.id),
      isSaved: userBookmarksSet.has(row.id),
      createdAt: row.createdAt.toISOString(),
    }));

    const posts = items.map((item) => ({
      id: item.id,
      title: item.title,
      body: `${item.caption}${item.tags.length ? `\\n\\n${item.tags.map((tag) => `#${tag}`).join(" ")}` : ""}`,
      type: "MEME" as const,
      scope: "GLOBAL" as const,
      status: "PUBLISHED" as const,
      isAnonymous: false,
      isEdited: false,
      authorId: item.author.id,
      institutionId: item.institution?.id || null,
      author: {
        id: item.author.id || "reel-author",
        userId: item.author.id || "reel-author",
        displayName: item.author.name,
        username: item.author.username,
        avatarUrl: item.author.avatarUrl,
        points: 100,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.createdAt),
      },
      institution: item.institution
        ? {
            id: item.institution.id,
            name: item.institution.name || "University",
            shortName: item.institution.shortName || "Campus",
          }
        : null,
      votesCount: item.likesCount,
      commentsCount: item.commentsCount,
      userVote: item.isLiked ? 1 : 0,
      isSaved: item.isSaved,
      externalPost: {
        id: item.id,
        source: "reddit" as const,
        externalId: item.id,
        subreddit: item.subreddit,
        canonicalUrl: item.sourceUrl || `https://reddit.com/r/${item.subreddit || "campus"}`,
        score: item.likesCount,
        commentCount: item.commentsCount,
        contentType: "VIDEO" as const,
        media: [
          {
            id: item.id,
            mediaType: "VIDEO" as const,
            mediaUrl: item.videoUrl,
            previewUrl: item.thumbnailUrl || item.videoUrl,
            hlsUrl: item.hlsUrl,
            thumbnailUrl: item.thumbnailUrl,
            width: item.width,
            height: item.height,
            duration: item.duration,
            isGif: false,
            position: 0,
          },
        ],
      },
      createdAt: item.createdAt,
      updatedAt: item.createdAt,
    }));

    return NextResponse.json({
      reels: items,
      posts,
      mode,
      hasMore: items.length === limit,
      page,
      limit,
    });
  } catch (error) {
    console.error("[GET /api/reels error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch reels", reels: [], posts: [], hasMore: false },
      { status: 500 },
    );
  }
}
