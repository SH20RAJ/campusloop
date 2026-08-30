import { and, desc, eq, inArray, ne } from "drizzle-orm";
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
      limit: limit + 2, // Fetch slightly more to filter out target post
      scoreThreshold: 0.1,
    });

    const matchingHits = hits.filter((h) => String(h.id) !== targetPostId).slice(0, limit);

    if (matchingHits.length > 0) {
      const pointIds = matchingHits.map((h) => String(h.id));
      const scoreMap = new Map(matchingHits.map((h) => [String(h.id), h.score]));

      const hydratedRows = await db.query.posts.findMany({
        where: and(inArray(posts.id, pointIds), eq(posts.status, "PUBLISHED")),
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

  // 3. Resilient Fallback: Query Postgres for same campus or recent active threads
  try {
    const fallbackRows = await db.query.posts.findMany({
      where: and(
        ne(posts.id, targetPostId),
        eq(posts.status, "PUBLISHED"),
        basePost.institutionId ? eq(posts.institutionId, basePost.institutionId) : undefined
      ),
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

    const fallbackPosts = (await formatApiFeedPosts(
      fallbackRows as any,
      options.currentUserId
    )) as unknown as FeedPost[];

    return fallbackPosts.map((post) => ({
      post,
      matchScore: 75,
      matchReason: post.institution?.id === basePost.institutionId ? "campus" : "hashtag",
    }));
  } catch {
    return [];
  }
}
