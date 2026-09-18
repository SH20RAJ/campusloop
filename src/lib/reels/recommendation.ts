import { and, asc, desc, eq, inArray, notInArray, or, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { institutions, reels, userBehaviorEvents } from "@/db/schema";
import {
  applyReelDiversityFilter,
  calculateReelScore,
  getViewerReelAffinities,
  getViewerSeenReelIds,
  type ReelCandidate,
} from "@/lib/reels/algorithm";

export type ReelFeedMode = "for_you" | "campus" | "fresh";

export interface RecommendedReel {
  id: string;
  slug: string;
  caption: string;
  title: string | null;
  videoUrl: string;
  hlsUrl: string | null;
  audioUrl: string | null;
  thumbnailUrl: string | null;
  aspectRatio: string;
  width: number | null;
  height: number | null;
  duration: number | null;
  authorId: string | null;
  authorName: string | null;
  authorHandle: string | null;
  authorAvatarUrl: string | null;
  institutionId: string | null;
  institutionName: string | null;
  source: string;
  sourceUrl: string | null;
  subreddit: string | null;
  tags: string[];
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  viewsCount: number;
  isFeatured: boolean;
  createdAt: Date;
}

const GENERIC_SUBREDDITS = new Set([
  "unexpected",
  "nextfuckinglevel",
  "blackmagicfuckery",
  "oddlysatisfying",
  "AnimalsBeingDerps",
  "AnimalsBeingJerks",
  "NatureIsFuckingLit",
  "beamazed",
  "interestingasfuck",
  "Damnthatsinteresting",
  "aww",
  "Eyebleach",
  "woahdude",
  "gamephysics",
  "chemicalreactiongifs",
  "mechanical_gifs",
  "CatSlaps",
  "IdiotsInCars",
  "climbing",
  "skateboarding",
  "calisthenics",
  "standupcomedy",
  "funny",
]);

const CAMPUS_TERMS = [
  "campus",
  "college",
  "university",
  "hostel",
  "student",
  "semester",
  "exam",
  "midsem",
  "endsem",
  "placement",
  "placements",
  "fest",
  "hackathon",
  "club",
  "society",
  "canteen",
  "mess",
  "professor",
  "prof",
  "lab",
  "lecture",
  "viva",
  "assignment",
  "internship",
  "batch",
  "batchmate",
  "freshers",
  "senior",
  "junior",
  "roommate",
  "dorm",
  "engineering",
  "btech",
  "coding",
  "project",
  "library",
  "campuslife",
  "hostellife",
];

const CAMPUS_SUBREDDITS = new Set([
  "Btechtards",
  "college",
  "EngineeringMemes",
  "JEENEETards",
  "IndianTeenagers",
  "ProgrammerHumor",
  "IndianDankMemes",
  "IndiaMeme",
  "DesiVideoMemes",
]);

function textOf(reel: Pick<RecommendedReel, "title" | "caption" | "tags">) {
  return [reel.title || "", reel.caption || "", ...reel.tags]
    .join(" ")
    .toLowerCase();
}

function campusRelevance(reel: Pick<RecommendedReel, "title" | "caption" | "tags" | "subreddit">) {
  const text = textOf(reel);
  let score = 0;

  for (const term of CAMPUS_TERMS) {
    if (text.includes(term)) score += 10;
  }

  if (reel.tags.some((tag) => CAMPUS_TERMS.includes(tag.toLowerCase().replace(/^#/, "")))) {
    score += 20;
  }

  if (reel.subreddit && CAMPUS_SUBREDDITS.has(reel.subreddit)) score += 35;
  if (reel.subreddit && GENERIC_SUBREDDITS.has(reel.subreddit)) score -= 90;

  return score;
}

function stableVariation(id: string, hourBucket: string) {
  let hash = 2166136261;
  for (const char of `${id}:${hourBucket}`) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash % 1000) / 1000;
}

function topicBoost(reel: RecommendedReel, interests: string[]) {
  if (!interests.length) return 0;
  const text = textOf(reel);
  let matches = 0;

  for (const interest of interests.slice(0, 10)) {
    const clean = interest.toLowerCase().replace(/^#/, "");
    if (clean.length >= 2 && text.includes(clean)) matches += 1;
  }

  return Math.min(matches, 3) * 26;
}

export async function getRecommendedReels({
  viewerProfileId,
  viewerInstitutionId,
  limit = 12,
  mode = "for_you",
  excludeIds = [],
}: {
  viewerProfileId?: string | null;
  viewerInstitutionId?: string | null;
  limit?: number;
  mode?: ReelFeedMode;
  excludeIds?: string[];
}): Promise<RecommendedReel[]> {
  const db = getDb();
  const safeLimit = Math.min(30, Math.max(1, limit));

  const persistedSeen = viewerProfileId ? await getViewerSeenReelIds(viewerProfileId, 800) : [];
  const seen = new Set(
    [...persistedSeen, ...excludeIds]
      .filter((id) => typeof id === "string" && /^[a-zA-Z0-9_-]+$/.test(id))
      .slice(0, 900)
  );

  const conditions = [eq(reels.status, "PUBLISHED")];

  if (mode === "campus" && viewerInstitutionId) {
    conditions.push(eq(reels.institutionId, viewerInstitutionId));
  }

  if (seen.size > 0) {
    conditions.push(notInArray(reels.id, Array.from(seen).slice(0, 800)));
  }

  const candidateLimit = Math.min(240, Math.max(72, safeLimit * 8));

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
      isFeatured: reels.isFeatured,
      createdAt: reels.createdAt,
    })
    .from(reels)
    .leftJoin(institutions, eq(reels.institutionId, institutions.id))
    .where(and(...conditions))
    .orderBy(
      desc(
        sql`(
          ${reels.likesCount} * 2.5
          + ${reels.commentsCount} * 4
          + ${reels.sharesCount} * 5
          + ln(greatest(1, ${reels.viewsCount})) * 3
          + case when ${reels.isFeatured} then 12 else 0 end
        )`,
      ),
      desc(reels.createdAt),
      asc(reels.id),
    )
    .limit(candidateLimit);

  if (rows.length === 0) return [];

  const candidateIds = rows.map((row) => row.id);

  const behaviorRows = await db
    .select({
      targetId: userBehaviorEvents.targetId,
      eventType: userBehaviorEvents.eventType,
      count: sql<number>`count(*)`,
      completedCount: sql<number>`count(*) filter (where (${userBehaviorEvents.metadata}->>'completed') = 'true')`,
    })
    .from(userBehaviorEvents)
    .where(
      and(
        inArray(userBehaviorEvents.targetId, candidateIds),
        or(
          eq(userBehaviorEvents.eventType, "REEL_LOOP"),
          eq(userBehaviorEvents.eventType, "REEL_WATCH"),
          eq(userBehaviorEvents.eventType, "REEL_SKIP"),
        ),
      ),
    )
    .groupBy(userBehaviorEvents.targetId, userBehaviorEvents.eventType);

  const behavior = new Map<string, { loops: number; watches: number; skips: number; completed: number }>();
  for (const row of behaviorRows) {
    if (!row.targetId) continue;
    const current = behavior.get(row.targetId) || { loops: 0, watches: 0, skips: 0, completed: 0 };
    const count = Number(row.count || 0);
    if (row.eventType === "REEL_LOOP") current.loops += count;
    if (row.eventType === "REEL_WATCH") {
      current.watches += count;
      current.completed += Number(row.completedCount || 0);
    }
    if (row.eventType === "REEL_SKIP") current.skips += count;
    behavior.set(row.targetId, current);
  }

  const { interests, creatorIds } = await getViewerReelAffinities(viewerProfileId);
  const hourBucket = new Date().toISOString().slice(0, 13);

  const ranked = rows
    .map((row) => {
      const tags = Array.isArray(row.tags) ? row.tags : [];
      const reel: RecommendedReel = { ...row, tags };
      const signals = behavior.get(row.id) || { loops: 0, watches: 0, skips: 0, completed: 0 };
      const candidate: ReelCandidate = {
        id: row.id,
        body: row.caption || "",
        title: row.title,
        authorId: row.authorId,
        institutionId: row.institutionId || undefined,
        createdAt: row.createdAt,
        votesCount: row.likesCount,
        commentsCount: row.commentsCount,
        loopCount: Math.min(signals.loops, 20),
        completionRate:
          signals.watches > 0
            ? Math.min(1, (signals.completed + signals.loops) / Math.max(1, signals.watches + signals.loops))
            : signals.loops > 0
              ? 0.9
              : 0,
        tags,
      };

      let score = calculateReelScore(candidate, {
        viewerProfileId,
        userInstitutionId: viewerInstitutionId,
        affinityTags: interests,
        affinityCreatorIds: creatorIds,
        randomJitter: false,
      });

      const relevance = campusRelevance(reel);
      const hoursOld = Math.max(0, (Date.now() - row.createdAt.getTime()) / 3600000);

      score += topicBoost(reel, interests);
      score += Math.min(28, row.sharesCount * 2.5);
      score += Math.min(18, Math.log10(Math.max(1, row.viewsCount)) * 6);
      score += relevance * (mode === "for_you" ? 1.3 : 0.75);
      score += row.isFeatured ? 10 : 0;

      if (mode === "fresh") {
        score += Math.max(0, 80 - hoursOld * 3.5);
      } else {
        score += Math.max(0, 30 - hoursOld * 0.9);
      }

      score -= Math.min(70, signals.skips * 9);
      score += stableVariation(row.id, hourBucket) * (mode === "fresh" ? 4 : 9);

      return { reel, score, relevance };
    })
    .filter(({ relevance }) => mode === "for_you" ? relevance >= 0 || rows.length < safeLimit * 2 : true)
    .sort((a, b) => b.score - a.score);

  // Keep generic viral material out of the main experience whenever the candidate pool
  // contains enough campus-relevant alternatives.
  const relevant = ranked.filter((item) => item.relevance >= 10);
  const preferred = mode === "for_you" && relevant.length >= safeLimit ? relevant : ranked;

  const diverse = applyReelDiversityFilter(preferred.map((item) => item.reel));

  // Mix fresh discovery into the top personalized results so the feed learns without
  // becoming repetitive or collapsing into one creator/topic.
  const freshSet = new Set(
    ranked
      .filter(({ reel }) => Date.now() - reel.createdAt.getTime() < 36 * 3600000)
      .map(({ reel }) => reel.id),
  );

  const final: RecommendedReel[] = [];
  const remaining = new Map(diverse.map((reel) => [reel.id, reel]));

  for (const reel of diverse) {
    if (final.length >= safeLimit) break;

    final.push(reel);
    remaining.delete(reel.id);

    if (final.length % 4 === 0) {
      const fresh = diverse.find((candidate) => freshSet.has(candidate.id) && remaining.has(candidate.id));
      if (fresh) {
        final.push(fresh);
        remaining.delete(fresh.id);
      }
    }
  }

  return final.slice(0, safeLimit);
}
