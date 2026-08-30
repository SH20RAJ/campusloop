import { and, eq, ne, notInArray, type SQL } from "drizzle-orm";
import { getDb } from "@/db";
import { follows, userProfiles } from "@/db/schema";
import { sharedInterestsBetween } from "@/lib/dating";
import { qdrant } from "@/lib/qdrant/client";
import { COLLECTIONS } from "@/lib/qdrant/collections";
import { generateEmbedding } from "@/lib/qdrant/embeddings";
import type { ProfileVectorPayload } from "@/lib/qdrant/types";
import { getViewerInstitutionId } from "@/lib/viewer";

export interface RecommendedUser {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  branch: string | null;
  year: number | null;
  points: number;
  institution: {
    name: string;
    slug: string;
  } | null;
  vibeScore: number;
  matchReason: string;
  isFollowing?: boolean;
}

/**
 * Recommends student profiles tailored to the viewer using:
 * 1. Qdrant Cloud Vector embeddings (semantic vibe similarity from bio & interests).
 * 2. Relational signals (shared campus, mutual academic branch, shared interests).
 * 3. 100% resilient fallback to active campus/global students when vector DB is unreachable.
 */
export async function getRecommendedUsers(
  viewerId: string,
  options: {
    limit?: number;
    scope?: "CAMPUS" | "GLOBAL";
  } = {}
): Promise<RecommendedUser[]> {
  const limit = options.limit ?? 6;
  const db = getDb();

  // 1. Fetch viewer profile and existing follows
  const [viewer, existingFollows] = await Promise.all([
    db.query.userProfiles.findFirst({
      where: eq(userProfiles.id, viewerId),
      with: { institution: true },
    }),
    db.select({ followingId: follows.followingId }).from(follows).where(eq(follows.followerId, viewerId)),
  ]);

  if (!viewer) return [];

  const followedIds = new Set(existingFollows.map((f) => f.followingId));
  const excludedIds = [viewer.id, ...Array.from(followedIds)];
  const viewerInstitutionId = await getViewerInstitutionId();

  const vectorScoreMap = new Map<string, number>();

  // 2. Attempt Qdrant Semantic Vector Retrieval
  try {
    const profileText = [
      viewer.bio || "",
      (viewer.interests || []).join(" "),
      viewer.branch || "",
      viewer.course || "",
    ]
      .filter(Boolean)
      .join(" ");

    if (profileText.trim().length > 0) {
      const queryVector = await generateEmbedding(profileText);
      const hits = await qdrant.search<ProfileVectorPayload>(COLLECTIONS.DATING_PROFILES, queryVector, {
        limit: 30,
        scoreThreshold: 0.08,
      });

      for (const hit of hits) {
        const id = String(hit.id);
        if (!excludedIds.includes(id)) {
          vectorScoreMap.set(id, hit.score);
        }
      }
    }
  } catch (err) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("[Recommended Users] Qdrant vector search failed, falling back to Postgres:", err);
    }
  }

  // 3. Query un-followed active candidate students from Postgres
  const conditions: (SQL | undefined)[] = [
    ne(userProfiles.id, viewer.id),
    eq(userProfiles.status, "ACTIVE"),
    ne(userProfiles.institutionId, viewerInstitutionId),
  ];

  if (excludedIds.length > 0) {
    conditions.push(notInArray(userProfiles.id, excludedIds));
  }

  if (options.scope === "CAMPUS" && viewer.institutionId) {
    conditions.push(eq(userProfiles.institutionId, viewer.institutionId));
  }

  const candidateRows = await db.query.userProfiles.findMany({
    where: and(...conditions.filter((c): c is SQL => c !== undefined)),
    orderBy: (table, { desc }) => [desc(table.updatedAt), desc(table.points)],
    limit: 60,
    with: {
      institution: true,
    },
  });

  if (candidateRows.length === 0) {
    return [];
  }

  // 4. Multi-Factor Scoring
  const scored = candidateRows.map((cand) => {
    let score = 40;
    const sharedInterests = sharedInterestsBetween(viewer as any, cand as any);
    score += Math.min(sharedInterests.length * 10, 25);

    const vectorSim = vectorScoreMap.get(cand.id);
    if (typeof vectorSim === "number" && vectorSim > 0) {
      score += Math.min(Math.round(vectorSim * 30), 30);
    }

    const sameCampus =
      viewer.institutionId && cand.institutionId && viewer.institutionId === cand.institutionId;
    if (sameCampus) {
      score += 15;
    }

    const sameBranch =
      viewer.branch && cand.branch && viewer.branch.trim().toLowerCase() === cand.branch.trim().toLowerCase();
    if (sameBranch) {
      score += 8;
    }

    if ((cand.points || 0) > 100) {
      score += 5;
    }

    const clampedScore = Math.max(35, Math.min(99, score));

    // Determine intuitive match reason badge
    let matchReason = "🌟 Active Looper";
    if (vectorSim && vectorSim >= 0.5) {
      matchReason = `✨ ${clampedScore}% Vibe Match`;
    } else if (sameCampus) {
      matchReason = "🏛️ Same Campus";
    } else if (sharedInterests.length > 0) {
      matchReason = `⚡ ${sharedInterests[0]}`;
    } else if (sameBranch && cand.branch) {
      matchReason = `🎓 ${cand.branch.toUpperCase()}`;
    } else if (clampedScore >= 65) {
      matchReason = `✨ ${clampedScore}% Vibe`;
    }

    return {
      id: cand.id,
      displayName: cand.displayName,
      username: cand.username,
      avatarUrl: cand.avatarUrl,
      bio: cand.bio,
      branch: cand.branch,
      year: cand.year,
      points: cand.points || 0,
      institution: cand.institution ? { name: cand.institution.name, slug: cand.institution.slug } : null,
      vibeScore: clampedScore,
      matchReason,
      isFollowing: false,
    };
  });

  // Sort by calculated vibe score descending
  scored.sort((a, b) => b.vibeScore - a.vibeScore);

  return scored.slice(0, limit);
}
