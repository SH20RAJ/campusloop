import { and, desc, eq, inArray, ne, notInArray, or, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { posts } from "@/db/schema";
import type { FeedPost } from "@/hooks/use-feed";
import { formatApiFeedPosts } from "@/lib/feed";
import { qdrant } from "@/lib/qdrant/client";
import { COLLECTIONS } from "@/lib/qdrant/collections";
import { generateEmbedding } from "@/lib/qdrant/embeddings";
import type { PostVectorPayload } from "@/lib/qdrant/types";

export interface RelatedPostItem {
  post: FeedPost;
  matchScore?: number;
  matchReason?: "semantic" | "hashtag" | "campus";
}

/**
 * Retrieves semantic related posts for a given post with resilient PostgreSQL fallback.
 */
export async function getRelatedPosts(
  targetPostId: string,
  options: {
    limit?: number;
    currentUserId?: string;
  } = {}
): Promise<RelatedPostItem[]> {
  const limit = options.limit ?? 4;
  const db = getDb();

  // 1. Fetch current post details from Postgres
  const basePost = await db.query.posts.findFirst({
    where: eq(posts.id, targetPostId),
    with: {
      institution: true,
    },
  });

  if (!basePost) {
    return [];
  }

  // 2. Attempt Semantic Vector Search via Qdrant
  try {
    const textToEmbed = `${basePost.body} ${basePost.type}`;
    const vector = await generateEmbedding(textToEmbed);

    const hits = await qdrant.search<PostVectorPayload>(COLLECTIONS.POSTS, vector, {
      limit: limit + 10, // Fetch more to allow author and self filtering
      scoreThreshold: 0.1,
    });

    // Exclude target post AND exclude posts by the same author (so we find other people's discussions)
    const matchingHits = hits
      .filter((h) => {
        if (String(h.id) === targetPostId) return false;
        if (basePost.authorId && h.payload?.authorId && h.payload.authorId === basePost.authorId) {
          return false;
        }
        return true;
      })
      .slice(0, limit);

    if (matchingHits.length > 0) {
      const pointIds = matchingHits.map((h) => String(h.id));
      const scoreMap = new Map(matchingHits.map((h) => [String(h.id), h.score]));

      const hydratedRows = await db.query.posts.findMany({
        where: and(
          inArray(posts.id, pointIds),
          eq(posts.status, "PUBLISHED"),
          basePost.authorId ? ne(posts.authorId, basePost.authorId) : undefined
        ),
        with: {
          author: true,
          institution: true,
          community: true,
          votes: true,
          comments: {
            with: {
              author: true,
            },
          },
          pollOptions: { with: { votes: true } },
        },
      });

      const hydratedFeedPosts = (await formatApiFeedPosts(
        hydratedRows as any,
        options.currentUserId
      )) as unknown as FeedPost[];

      // Sort according to vector similarity score
      hydratedFeedPosts.sort((a, b) => {
        const scoreA = scoreMap.get(a.id) ?? 0;
        const scoreB = scoreMap.get(b.id) ?? 0;
        return scoreB - scoreA;
      });

      if (hydratedFeedPosts.length > 0) {
        return hydratedFeedPosts.map((post) => ({
          post,
          matchScore: Math.min(Math.round((scoreMap.get(post.id) ?? 0.5) * 100), 99),
          matchReason: "semantic",
        }));
      }
    }
  } catch (err) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("[Qdrant Search Fallback] Falling back to Postgres query:", err);
    }
  }

  // 3. Resilient Fallback: Query Postgres for content similarity across other authors and campuses
  try {
    // Extract key content terms (hashtags or significant words > 4 chars)
    const hashtags = (basePost.body.match(/#[a-zA-Z0-9_]+/g) || []).map((t) => t.replace(/^#/, "").toLowerCase());
    const words = basePost.body
      .replace(/[^a-zA-Z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 5)
      .slice(0, 4);

    const matchConditions: any[] = [];
    if (hashtags.length > 0) {
      for (const tag of hashtags.slice(0, 3)) {
        matchConditions.push(sql`${posts.body} ILIKE ${`%#${tag}%`}`);
      }
    }
    for (const word of words) {
      matchConditions.push(sql`${posts.body} ILIKE ${`%${word}%`}`);
    }

    // Always exclude current post and exclude current author
    const baseConditions = [
      ne(posts.id, targetPostId),
      eq(posts.status, "PUBLISHED"),
      basePost.authorId ? ne(posts.authorId, basePost.authorId) : undefined,
    ].filter(Boolean);

    let fallbackRows: any[] = [];
    if (matchConditions.length > 0) {
      fallbackRows = await db.query.posts.findMany({
        where: and(...baseConditions, or(...matchConditions)),
        orderBy: [desc(posts.createdAt)],
        limit,
        with: {
          author: true,
          institution: true,
          community: true,
          votes: true,
          comments: {
            with: {
              author: true,
            },
          },
          pollOptions: { with: { votes: true } },
        },
      });
    }

    // If keyword match didn't yield enough, fill with other authors' discussions in same category or campus
    if (fallbackRows.length < limit) {
      const remainingLimit = limit - fallbackRows.length;
      const existingIds = new Set(fallbackRows.map((r) => r.id));
      existingIds.add(targetPostId);

      const secondaryRows = await db.query.posts.findMany({
        where: and(
          ...baseConditions,
          eq(posts.type, basePost.type),
          notInArray(posts.id, Array.from(existingIds))
        ),
        orderBy: [desc(posts.createdAt)],
        limit: remainingLimit,
        with: {
          author: true,
          institution: true,
          community: true,
          votes: true,
          comments: {
            with: {
              author: true,
            },
          },
          pollOptions: { with: { votes: true } },
        },
      });

      fallbackRows.push(...secondaryRows);
    }

    // If still need more, fetch any top active discussions from other authors
    if (fallbackRows.length < limit) {
      const remainingLimit = limit - fallbackRows.length;
      const existingIds = new Set(fallbackRows.map((r) => r.id));
      existingIds.add(targetPostId);

      const generalRows = await db.query.posts.findMany({
        where: and(
          ...baseConditions,
          notInArray(posts.id, Array.from(existingIds))
        ),
        orderBy: [desc(posts.createdAt)],
        limit: remainingLimit,
        with: {
          author: true,
          institution: true,
          community: true,
          votes: true,
          comments: {
            with: {
              author: true,
            },
          },
          pollOptions: { with: { votes: true } },
        },
      });

      fallbackRows.push(...generalRows);
    }

    const fallbackPosts = (await formatApiFeedPosts(
      fallbackRows as any,
      options.currentUserId
    )) as unknown as FeedPost[];

    return fallbackPosts.map((post) => ({
      post,
      matchScore: 80,
      matchReason: post.institution?.id === basePost.institutionId ? "campus" : "hashtag",
    }));
  } catch {
    return [];
  }
}
