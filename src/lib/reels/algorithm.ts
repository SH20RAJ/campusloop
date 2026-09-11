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
 * Fetch recently seen reels from Redis for instant deduplication
 */
export async function getViewerSeenReelIds(
  viewerProfileId?: string | null,
  limit: number = 50
): Promise<string[]> {
  if (!viewerProfileId) return [];

  try {
    const redis = getRedis();
    if (!redis) return [];
    const seen = await redis.zrange<string[]>(`user:${viewerProfileId}:seen_reels`, 0, limit - 1, {
      rev: true,
    });
    return Array.isArray(seen) ? seen : [];
  } catch {
    return [];
  }
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
  const videoBehaviorScoreSql = sql<number>`(
    (${loopCountSql} * 35.0)
    + (${completionCountSql} * 20.0)
    - (${skipCountSql} * 18.0)
  )`;

  // 2. Engagement Velocity & Acceleration Derivative
  const viralVelocitySql = sql<number>`(
    ((${recentVoteScoreSql} * 4.5 + ${recentCommentCountSql} * 5.5 + 2.0) / power(${hoursSinceSql} + 0.5, 1.22))
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
    ? sql<number>`(case when "posts"."institution_id" = ${userInstitutionId} then 25.0 else 0.0 end)`
    : sql<number>`0.0`;

  // 6. Stochastic Exploration (Epsilon-Greedy Bandit):
  // 15-20% burst on high-potential fresh reels (< 36 hours) to give emerging creators a breakout shot
  const explorationBanditSql = sql<number>`(case when ${hoursSinceSql} < 36.0 then (random() * 26.0) else (random() * 5.0) end)`;

  // 7. Seen Deduplication Penalty (crucial for short video feeds)
  const safeSeenIds = seenIds
    .slice(0, 150)
    .filter((id): id is string => typeof id === "string" && /^[a-zA-Z0-9_-]+$/.test(id));

  const seenPenaltySql =
    safeSeenIds.length > 0
      ? sql<number>`(case when "posts"."id" in (${sql.join(
          safeSeenIds.map((id) => sql`${id}`),
          sql`, `
        )}) then -250.0 else 0.0 end)`
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
    + ${seenPenaltySql}
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
    return -250;
  }

  const now = Date.now();
  const createdMs = new Date(reel.createdAt).getTime();
  const hoursSince = Math.max(0, (now - createdMs) / (1000 * 60 * 60));

  let score = 0;

  // 1. Rewatches & Loop metric
  const loops = Math.min(reel.loopCount || 0, 5);
  score += loops * 35;

  // 2. Completion rate
  if ((reel.completionRate || 0) >= 0.85) {
    score += 25;
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
    score += 25;
  }

  // 8. Own post penalty
  if (ctx.viewerProfileId && reel.authorId === ctx.viewerProfileId) {
    score -= 100;
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
  return [...reels].sort((a, b) => {
    const scoreA = calculateReelScore(a, ctx);
    const scoreB = calculateReelScore(b, ctx);
    return scoreB - scoreA;
  });
}
