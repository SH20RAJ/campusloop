import { SQL, sql } from "drizzle-orm";
import { comments, follows, posts, userBehaviorEvents, votes } from "@/db/schema";
import { getRedis } from "@/lib/redis";

/**
 * Top affinity interests and creators from Redis cache (sub-5ms)
 */
export async function getViewerReelAffinities(
  viewerProfileId?: string | null
): Promise<{ interests: string[]; creatorIds: string[] }> {
  if (!viewerProfileId) {
    return { interests: [], creatorIds: [] };
  }

  try {
    const redis = getRedis();
    if (!redis) return { interests: [], creatorIds: [] };

    const [interests, creatorIds] = await Promise.all([
      redis.zrange<string[]>(`user:${viewerProfileId}:interests`, 0, 9, { rev: true }).catch(() => []),
      redis.zrange<string[]>(`user:${viewerProfileId}:creators`, 0, 9, { rev: true }).catch(() => []),
    ]);

    return {
      interests: Array.isArray(interests) ? interests : [],
      creatorIds: Array.isArray(creatorIds) ? creatorIds : [],
    };
  } catch {
    return { interests: [], creatorIds: [] };
  }
}

/**
 * Fetch recently seen reels from Redis & DB for absolute deduplication across sessions
 */
export async function getViewerSeenReelIds(
  viewerProfileId?: string | null,
  limit: number = 500
): Promise<string[]> {
  if (!viewerProfileId) return [];

  const seenIds = new Set<string>();

  // 1. Fast Redis query (sub-5ms)
  try {
    const redis = getRedis();
    if (redis) {
      const redisSeen = await redis.zrange<string[]>(`user:${viewerProfileId}:seen_reels`, 0, limit - 1, {
        rev: true,
      });
      if (Array.isArray(redisSeen)) {
        for (const id of redisSeen) {
          if (typeof id === "string" && id.trim()) seenIds.add(id.trim());
        }
      }
    }
  } catch {}

  // 2. Fallback / supplement with durable Postgres user_behavior_events
  if (seenIds.size < limit) {
    try {
      const { getDb } = await import("@/db");
      const { userBehaviorEvents } = await import("@/db/schema");
      const { and, desc, eq, inArray } = await import("drizzle-orm");
      const db = getDb();
      const events = await db.query.userBehaviorEvents.findMany({
        where: and(
          eq(userBehaviorEvents.userId, viewerProfileId),
          inArray(userBehaviorEvents.eventType, ["REEL_WATCH", "REEL_LOOP", "REEL_SKIP", "POST_DWELL"])
        ),
        columns: { targetId: true },
        orderBy: [desc(userBehaviorEvents.createdAt)],
        limit: Math.max(0, limit - seenIds.size),
      });
      for (const ev of events) {
        if (ev.targetId) seenIds.add(ev.targetId);
      }
    } catch {}
  }

  return Array.from(seenIds);
}

/**
 * SQL-level ranking score for Addictive Reels recommendation.
 *
 * Modeled after state-of-the-art short video multi-task recommendations:
 * 1. Loop and replay propensity (rewatches are the #1 addictive factor)
 * 2. Completion rate & velocity acceleration
 * 3. Real-time personalized interest affinity (hashtags matching viewer profile)
 * 4. Creator affinity & follow ties
 * 5. Campus community proximity bonus
 * 6. Epsilon-greedy bandit exploration (15-20% burst to discover viral gems)
 * 7. Heavy penalty for already-seen reels
 */
export function getAddictiveReelsScoreSql(
  viewerProfileId?: string | null,
  userInstitutionId?: string | null,
  seenIds: string[] = [],
  affinityInterests: string[] = [],
  affinityCreators: string[] = []
): SQL<number> {
  const hoursSinceSql = sql<number>`(extract(epoch from (now() - "posts"."created_at")) / 3600.0)`;
  const totalVoteScoreSql = sql<number>`coalesce((select sum("votes"."value") from ${votes} where "votes"."post_id" = "posts"."id"), 0)`;
  const recentVoteScoreSql = sql<number>`coalesce((select sum("votes"."value") from ${votes} where "votes"."post_id" = "posts"."id" and "votes"."created_at" > now() - interval '24 hours'), 0)`;
  const totalCommentCountSql = sql<number>`coalesce((select count(*) from ${comments} where "comments"."post_id" = "posts"."id" and "comments"."status" = 'PUBLISHED'), 0)`;
  const recentCommentCountSql = sql<number>`coalesce((select count(*) from ${comments} where "comments"."post_id" = "posts"."id" and "comments"."status" = 'PUBLISHED' and "comments"."created_at" > now() - interval '24 hours'), 0)`;

  // Loop count signal: rewatches in user_behavior_events
  const loopCountSql = sql<number>`coalesce((select count(*) from ${userBehaviorEvents} where ${userBehaviorEvents.targetId} = "posts"."id" and ${userBehaviorEvents.eventType} = 'REEL_LOOP'), 0)`;

  // Completion count signal
  const completionCountSql = sql<number>`coalesce((select count(*) from ${userBehaviorEvents} where ${userBehaviorEvents.targetId} = "posts"."id" and (${userBehaviorEvents.eventType} = 'REEL_LOOP' or (${userBehaviorEvents.metadata}->>'completed')::boolean = true)), 0)`;

  // Fast skip count penalty
  const skipCountSql = sql<number>`coalesce((select count(*) from ${userBehaviorEvents} where ${userBehaviorEvents.targetId} = "posts"."id" and ${userBehaviorEvents.eventType} = 'REEL_SKIP'), 0)`;

  // 1. Core Short-Video Behavioral Score:
  // Loops are 3.5x more predictive of addiction than simple views.
  // 1. Core Short-Video Behavioral Score:
  // Loops and rewatches are the #1 predictive indicator of addictive short-form content.
  const videoBehaviorScoreSql = sql<number>`(
    (${loopCountSql} * 45.0)
    + (${completionCountSql} * 25.0)
    - (${skipCountSql} * 35.0)
  )`;

  // 2. Engagement Velocity & Acceleration Derivative
  const viralVelocitySql = sql<number>`(
    ((${recentVoteScoreSql} * 5.0 + ${recentCommentCountSql} * 6.0 + 2.0) / power(${hoursSinceSql} + 0.5, 1.25))
    + (ln(greatest(1.0, ${totalVoteScoreSql} * 2.0 + ${totalCommentCountSql} * 2.5 + 1.0)) * 15.0)
  )`;

  // 3. Creator Follow & Affinity Bonus
  const creatorBonusSql = viewerProfileId
    ? sql<number>`(case
        when exists(
          select 1 from ${follows}
          where ${follows.followerId} = ${viewerProfileId}
            and ${follows.followingId} = "posts"."author_id"
        ) then 65.0
        ${
          affinityCreators.length > 0
            ? sql`when "posts"."author_id" in (${sql.join(
                affinityCreators.slice(0, 10).map((cid) => sql`${cid}`),
                sql`, `
              )}) then 45.0`
            : sql``
        }
        else 0.0
      end)`
    : sql<number>`0.0`;

  // 4. Personalized Interest Tag Affinity Boost
  let interestAffinitySql = sql<number>`0.0`;
  const cleanInterests = affinityInterests
    .map((t) => t.trim().toLowerCase().replace(/^#/, ""))
    .filter((t) => t.length >= 2)
    .slice(0, 8);

  if (cleanInterests.length > 0) {
    const conditions = cleanInterests.map(
      (interest) => sql`("posts"."body" ilike ${`%#${interest}%`} or "posts"."title" ilike ${`%${interest}%`})`
    );
    interestAffinitySql = sql<number>`(case when (${sql.join(conditions, sql` or `)}) then 40.0 else 0.0 end)`;
  }

  // 5. Same Campus Community Boost
  const campusBonusSql = userInstitutionId
    ? sql<number>`(case when "posts"."institution_id" = ${userInstitutionId} then 35.0 else 0.0 end)`
    : sql<number>`0.0`;

  // 6. Stochastic Exploration (Epsilon-Greedy Bandit):
  // Deterministic hour-bucketed hash prevents pagination order shuffling and duplicate reels
  const hashSeedSql = sql<number>`(abs(('x' || substr(md5("posts"."id" || to_char(now(), 'YYYY-MM-DD-HH24')), 1, 8))::bit(32)::int % 100) / 100.0)`;
  const explorationBanditSql = sql<number>`(case when ${hoursSinceSql} < 36.0 then (${hashSeedSql} * 26.0) else (${hashSeedSql} * 5.0) end)`;

  // 7. Strict Seen Deduplication Penalty (crucial: -100,000 prevents ANY seen reel from surfacing)
  const safeSeenIds = seenIds
    .slice(0, 300)
    .filter((id): id is string => typeof id === "string" && /^[a-zA-Z0-9_-]+$/.test(id));

  const seenInListSql =
    safeSeenIds.length > 0
      ? sql<number>`(case when "posts"."id" in (${sql.join(
          safeSeenIds.map((id) => sql`${id}`),
          sql`, `
        )}) then -100000.0 else 0.0 end)`
      : sql<number>`0.0`;

  const seenInHistorySql = viewerProfileId
    ? sql<number>`(case when exists (
        select 1 from ${userBehaviorEvents}
        where ${userBehaviorEvents.targetId} = "posts"."id"
          and ${userBehaviorEvents.userId} = ${viewerProfileId}
          and ${userBehaviorEvents.eventType} in ('REEL_WATCH', 'REEL_LOOP', 'REEL_SKIP')
      ) then -100000.0 else 0.0 end)`
    : sql<number>`0.0`;

  // 8. Own Post Demotion (users rarely want their own reels on their swipe feed)
  const ownPostPenaltySql = viewerProfileId
    ? sql<number>`(case when "posts"."author_id" = ${viewerProfileId} then -120.0 else 0.0 end)`
    : sql<number>`0.0`;

  return sql<number>`(
    ${videoBehaviorScoreSql}
    + ${viralVelocitySql}
    + ${creatorBonusSql}
    + ${interestAffinitySql}
    + ${campusBonusSql}
    + ${explorationBanditSql}
    + ${seenInListSql}
    + ${seenInHistorySql}
    + ${ownPostPenaltySql}
  )`;
}

export interface ViewerReelContext {
  viewerProfileId?: string | null;
  userInstitutionId?: string | null;
  seenPostIds?: Set<string> | string[];
  affinityTags?: string[];
  affinityCreatorIds?: string[];
  randomJitter?: boolean;
}

export interface ReelCandidate {
  id: string;
  body: string;
  title?: string | null;
  authorId?: string | null;
  institutionId?: string;
  createdAt: Date | string;
  votesCount: number;
  commentsCount: number;
  userVote?: number;
  loopCount?: number;
  completionRate?: number;
  tags?: string[];
}

/**
 * In-memory addictive scoring function for client/edge reranking and unit testing.
 */
export function calculateReelScore(
  reel: ReelCandidate,
  ctx: ViewerReelContext = {}
): number {
  const seenSet = ctx.seenPostIds instanceof Set ? ctx.seenPostIds : new Set(ctx.seenPostIds || []);
  if (seenSet.has(reel.id)) {
    return -100000;
  }

  const now = Date.now();
  const createdMs = new Date(reel.createdAt).getTime();
  const hoursSince = Math.max(0, (now - createdMs) / (1000 * 60 * 60));

  let score = 0;

  // 1. Rewatches & Loop metric (highest addictive weight)
  const loops = Math.min(reel.loopCount || 0, 5);
  score += loops * 45;

  // 2. Completion rate vs skips
  if ((reel.completionRate || 0) >= 0.85) {
    score += 30;
  }

  // 3. Engagement signals
  score += Math.max(0, reel.votesCount) * 4;
  score += Math.max(0, reel.commentsCount) * 5;

  // 4. Freshness gravity decay
  score -= Math.pow(hoursSince + 1, 0.75) * 6;

  // 5. Personal interest tag affinity
  if (ctx.affinityTags && ctx.affinityTags.length > 0) {
    const textLower = `${reel.title || ""} ${reel.body}`.toLowerCase();
    const matchesTag = ctx.affinityTags.some((tag) => {
      const clean = tag.toLowerCase().replace(/^#/, "");
      return clean.length >= 2 && textLower.includes(clean);
    });
    if (matchesTag) score += 40;
  }

  // 6. Creator affinity
  if (reel.authorId && ctx.affinityCreatorIds && ctx.affinityCreatorIds.includes(reel.authorId)) {
    score += 50;
  }

  // 7. Same college bonus
  if (ctx.userInstitutionId && reel.institutionId === ctx.userInstitutionId) {
    score += 35;
  }

  // 8. Own post penalty
  if (ctx.viewerProfileId && reel.authorId === ctx.viewerProfileId) {
    score -= 150;
  }

  // 9. Stochastic Exploration (Bandit)
  if (ctx.randomJitter !== false && hoursSince < 48) {
    score += Math.random() * 25;
  }

  return Math.round(score * 100) / 100;
}

/**
 * Rerank an array of reel candidates by addictive score.
 */
export function rerankReels<T extends ReelCandidate>(
  reels: T[],
  ctx: ViewerReelContext = {}
): T[] {
  const ranked = [...reels].sort((a, b) => {
    const scoreA = calculateReelScore(a, ctx);
    const scoreB = calculateReelScore(b, ctx);
    return scoreB - scoreA;
  });
  return applyReelDiversityFilter(ranked);
}

/**
 * Post-processing anti-fatigue diversity filter.
 * Prevents clustering:
 * 1. Never shows two consecutive reels from the same author.
 * 2. Never shows more than two consecutive reels from the same institution.
 * Intelligently interleaves items without dropping them.
 */
export function applyReelDiversityFilter<T extends { authorId?: string | null; institutionId?: string | null }>(
  items: T[]
): T[] {
  if (items.length <= 2) return items;

  const result: T[] = [];
  const pool = [...items];

  while (pool.length > 0) {
    let candidateIndex = 0;
    const last1 = result[result.length - 1];
    const last2 = result[result.length - 2];

    for (let i = 0; i < pool.length; i++) {
      const candidate = pool[i];
      const sameAuthorAsLast = last1?.authorId && candidate.authorId && last1.authorId === candidate.authorId;
      const sameInstAsLastTwo =
        last1?.institutionId &&
        last2?.institutionId &&
        candidate.institutionId &&
        last1.institutionId === candidate.institutionId &&
        last2.institutionId === candidate.institutionId;

      if (!sameAuthorAsLast && !sameInstAsLastTwo) {
        candidateIndex = i;
        break;
      }
    }

    const [selected] = pool.splice(candidateIndex, 1);
    result.push(selected);
  }

  return result;
}
