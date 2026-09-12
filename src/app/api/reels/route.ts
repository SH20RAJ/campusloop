import { type NextRequest, NextResponse } from "next/server";
import { and, desc, eq, inArray, notInArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { institutions, reelBookmarks, reelLikes, reels, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(30, Math.max(1, Number.parseInt(searchParams.get("limit") || "12", 10)));
    const offset = (page - 1) * limit;

    const sort = searchParams.get("sort") || "trending";
    const scope = searchParams.get("scope") || "GLOBAL";
    const subreddit = searchParams.get("subreddit");
    const tag = searchParams.get("tag");

    const excludeIdsParam = searchParams.get("excludeIds");
    const seenIdsParam = searchParams.get("seenIds") || req.headers.get("x-seen-ids");

    let excludeIds: string[] = [];
    if (excludeIdsParam) {
      excludeIds.push(
        ...excludeIdsParam
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && /^[a-zA-Z0-9_-]+$/.test(s))
      );
    }
    if (seenIdsParam) {
      excludeIds.push(
        ...seenIdsParam
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && /^[a-zA-Z0-9_-]+$/.test(s))
      );
    }

    const uniqueExcludeIds = Array.from(new Set(excludeIds)).slice(0, 500);

    const db = getDb();
    let currentProfileId: string | null = null;
    let viewerInstitutionId: string | null = null;

    try {
      const user = await hexclaveServerApp.getUser();
      if (user) {
        const profile = await db.query.userProfiles.findFirst({
          where: eq(userProfiles.userId, user.id),
        });
        if (profile) {
          currentProfileId = profile.id;
          viewerInstitutionId = profile.institutionId;
        }
      }
    } catch {}

    const conditions = [eq(reels.status, "PUBLISHED")];

    if (scope === "CAMPUS" && viewerInstitutionId) {
      conditions.push(eq(reels.institutionId, viewerInstitutionId));
    }

    if (subreddit) {
      conditions.push(eq(reels.subreddit, subreddit));
    }

    if (uniqueExcludeIds.length > 0) {
      conditions.push(notInArray(reels.id, uniqueExcludeIds));
    }

    // Determine ordering: Trending algorithm weights likes, comments, shares, views & freshness
    const orderByClause =
      sort === "latest"
        ? [desc(reels.createdAt)]
        : [
            desc(
              sql`(${reels.likesCount} * 3 + ${reels.commentsCount} * 5 + ${reels.sharesCount} * 4 + ${reels.viewsCount} + EXTRACT(EPOCH FROM ${reels.createdAt}) / 86400)`
            ),
            desc(reels.createdAt),
          ];

    const rows = await db
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
      .where(and(...conditions))
      .orderBy(...orderByClause)
      .limit(limit)
      .offset(offset);

    // If viewer is logged in, fetch their likes and bookmarks for these reels
    const reelIds = rows.map((r) => r.id);
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

      for (const l of likes) userLikesSet.add(l.reelId);
      for (const b of bookmarks) userBookmarksSet.add(b.reelId);
    }

    const items = rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      caption: r.caption,
      title: r.title,
      videoUrl: r.videoUrl,
      hlsUrl: r.hlsUrl,
      audioUrl: r.audioUrl,
      thumbnailUrl: r.thumbnailUrl,
      aspectRatio: r.aspectRatio,
      width: r.width,
      height: r.height,
      duration: r.duration,
      author: {
        id: r.authorId,
        name: r.authorName || "Student",
        username: r.authorHandle || "student",
        avatarUrl: r.authorAvatarUrl,
        isVerified: true,
      },
      institution: r.institutionId
        ? {
            id: r.institutionId,
            name: r.institutionName,
            shortName: r.institutionName ? r.institutionName.split(",")[0] : null,
          }
        : null,
      source: r.source,
      sourceUrl: r.sourceUrl,
      subreddit: r.subreddit,
      tags: (r.tags as string[]) || [],
      likesCount: r.likesCount,
      commentsCount: r.commentsCount,
      sharesCount: r.sharesCount,
      viewsCount: r.viewsCount,
      isLiked: userLikesSet.has(r.id),
      isSaved: userBookmarksSet.has(r.id),
      createdAt: r.createdAt.toISOString(),
    }));

    const posts = items.map((item) => ({
      id: item.id,
      title: item.title,
      body: `${item.caption}\n\n${item.tags.map((t) => `#${t}`).join(" ")}`,
      type: "MEME" as const,
      scope: "GLOBAL" as const,
      status: "PUBLISHED" as const,
      isAnonymous: false,
      isEdited: false,
      authorId: item.author.id,
      institutionId: item.institution?.id || null,
      author: {
        id: item.author.id || "anon",
        userId: item.author.id || "anon",
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
        canonicalUrl: item.sourceUrl || `https://reddit.com/r/${item.subreddit || "reels"}`,
        score: item.likesCount,
        commentCount: item.commentsCount,
        contentType: "VIDEO" as const,
        media: [
          {
            id: item.id,
            mediaType: "VIDEO" as const,
            mediaUrl: item.videoUrl,
            previewUrl: item.videoUrl,
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
      hasMore: items.length === limit,
      page,
      limit,
    });
  } catch (error) {
    console.error("[GET /api/reels error]:", error);
    return NextResponse.json({ error: "Failed to fetch reels", reels: [], hasMore: false }, { status: 500 });
  }
}
