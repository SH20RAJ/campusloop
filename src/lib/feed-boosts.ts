import { and, asc, eq, gt, isNull, or, type SQL, sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { cache } from "react";
import { getDb } from "@/db";
import { feedBoosts, posts } from "@/db/schema";
import { getRedis } from "@/lib/redis";

/**
 * Editorial ranking overrides, resolved for the feed query.
 *
 * ## Why this is not a join
 *
 * The obvious implementation — LEFT JOIN feed_boosts, or a correlated
 * EXISTS per row — makes every feed query pay for a feature that is usually
 * inactive. The curated set is small and changes rarely, which makes it a
 * perfect fit for a cache-and-inline strategy instead:
 *
 *   1. the active set is read from Redis (one round trip, ~1 ms), or from
 *      Postgres on a miss, and written back with a short TTL;
 *   2. `cache()` memoizes it for the lifetime of a single request, so a page
 *      rendering several feeds pays once;
 *   3. it is inlined into the ORDER BY as a constant CASE expression.
 *
 * The result is O(1) per candidate row with no extra table access, and a feed
 * with zero boosts costs exactly what it did before this feature existed.
 */

const CACHE_KEY = "feed:boosts:active:v1";
/** Short enough that an admin sees their change land; long enough to absorb traffic. */
const CACHE_TTL_SECONDS = 60;
/** A curated set larger than this is not curation. Also bounds the generated SQL. */
const MAX_ACTIVE_BOOSTS = 200;

export type BoostTargetType = "POST" | "PROFILE";
export type BoostScope = "GLOBAL" | "INSTITUTION";

/** See the `mode` column comment in the schema for why tiers exist at all. */
export type BoostMode = "NUDGE" | "PROMOTE" | "PIN" | "BURY";

export interface ActiveBoost {
  targetType: BoostTargetType;
  targetId: string;
  multiplier: number;
  mode: BoostMode;
  priority: number;
  scope: BoostScope;
  institutionId: string | null;
}

/**
 * Ranking tier. Ordered descending ahead of the organic score, so a promoted
 * post is guaranteed to outrank organic results no matter how the underlying
 * sort scores it — which is the only way "make this viral" can be honest when
 * scores span four orders of magnitude.
 *
 * Organic sits at 1 so BURY has somewhere below it to go.
 */
const TIER: Record<BoostMode, number> = { PIN: 3, PROMOTE: 2, NUDGE: 1, BURY: 0 };
const ORGANIC_TIER = 1;

/** Ids come from our own tables; this is belt-and-braces before inlining them. */
const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

function isSafeId(value: string): boolean {
  return ID_PATTERN.test(value);
}

/**
 * Read the active, in-window boost set — Redis first, Postgres on a miss.
 *
 * Never throws. A cache or database failure degrades to "no boosts", which is
 * the ordinary feed: curation failing must never take the feed down with it.
 */
async function loadActiveBoostsUncached(): Promise<ActiveBoost[]> {
  const redis = getRedis();

  if (redis) {
    try {
      const cached = await redis.get<ActiveBoost[]>(CACHE_KEY);
      if (Array.isArray(cached)) return cached;
    } catch {
      // fall through to Postgres
    }
  }

  let rows: ActiveBoost[] = [];
  try {
    const db = getDb();
    const now = new Date();
    const found = await db
      .select({
        targetType: feedBoosts.targetType,
        targetId: feedBoosts.targetId,
        multiplier: feedBoosts.multiplier,
        mode: feedBoosts.mode,
        priority: feedBoosts.priority,
        scope: feedBoosts.scope,
        institutionId: feedBoosts.institutionId,
      })
      .from(feedBoosts)
      .where(
        and(
          eq(feedBoosts.isActive, true),
          sql`${feedBoosts.startsAt} <= ${now}`,
          or(isNull(feedBoosts.expiresAt), gt(feedBoosts.expiresAt, now))
        )
      )
      .orderBy(asc(feedBoosts.createdAt))
      .limit(MAX_ACTIVE_BOOSTS);

    rows = found
      .filter((row) => isSafeId(row.targetId))
      .map((row) => ({
        targetType: row.targetType as BoostTargetType,
        targetId: row.targetId,
        multiplier: Number(row.multiplier) || 1,
        mode: (row.mode as BoostMode) ?? "PROMOTE",
        priority: Number(row.priority) || 0,
        scope: row.scope as BoostScope,
        institutionId: row.institutionId,
      }));
  } catch (error) {
    console.error("loadActiveBoosts failed:", error);
    return [];
  }

  if (redis) {
    // Cached even when empty — "nothing is boosted" is the common answer and
    // deserves the same one-round-trip treatment as a hit.
    redis.set(CACHE_KEY, rows, { ex: CACHE_TTL_SECONDS }).catch(() => {});
  }

  return rows;
}

/** Request-scoped memo on top of the Redis cache. */
export const loadActiveBoosts = cache(loadActiveBoostsUncached);

/** Drop the cache so an admin's change is visible on the next request. */
export async function invalidateBoostCache(): Promise<void> {
  try {
    await getRedis()?.del(CACHE_KEY);
  } catch (error) {
    console.error("invalidateBoostCache failed:", error);
  }
}

/**
 * Narrow the set to the boosts that can apply to this viewer.
 *
 * An INSTITUTION-scoped boost is a campus-desk decision and must not leak into
 * other campuses' feeds.
 */
export function applicableBoosts(boosts: ActiveBoost[], viewerInstitutionId?: string | null): ActiveBoost[] {
  return boosts.filter(
    (boost) =>
      boost.scope === "GLOBAL" ||
      (Boolean(viewerInstitutionId) && boost.institutionId === viewerInstitutionId)
  );
}

/**
 * Render `column IN (a, b, c)` with every id bound as a parameter.
 *
 * Composed through drizzle's `sql` rather than `sql.raw`, so the ids are never
 * concatenated into the statement and the column is table-qualified. There is
 * no string-escaping step to get wrong.
 */
function inList(column: AnyPgColumn, ids: string[]): SQL {
  return sql`${column} in (${sql.join(
    ids.map((id) => sql`${id}`),
    sql`, `
  )})`;
}

/**
 * Build `CASE WHEN ... END` returning the ranking multiplier for a row.
 *
 * Ids are grouped by multiplier so the expression stays compact — one branch
 * per distinct multiplier rather than one per boost. Returns null when nothing
 * applies, which lets callers omit the term entirely rather than multiply every
 * row by a constant 1.
 *
 * PROFILE boosts key on `posts.author_id`, which is NULL for anonymous posts —
 * so a profile boost can never surface, or expose, a confession. That falls out
 * of the data model rather than being a rule anyone has to remember.
 */
export function buildBoostMultiplierSql(boosts: ActiveBoost[]): SQL<number> | null {
  if (boosts.length === 0) return null;

  const postGroups = new Map<number, string[]>();
  const profileGroups = new Map<number, string[]>();

  for (const boost of boosts) {
    if (!isSafeId(boost.targetId)) continue;
    if (!Number.isFinite(boost.multiplier) || boost.multiplier === 1) continue;
    // Clamped so a fat-fingered 1000x cannot take over the whole feed.
    const multiplier = Math.min(Math.max(boost.multiplier, 0.01), 25);

    const group = boost.targetType === "POST" ? postGroups : profileGroups;
    const list = group.get(multiplier) ?? [];
    list.push(boost.targetId);
    group.set(multiplier, list);
  }

  const branches: SQL[] = [];
  // Post-level branches first: a boost aimed at one post is more specific than
  // one aimed at its author, and CASE takes the first matching branch.
  for (const [multiplier, ids] of postGroups) {
    branches.push(sql`when ${inList(posts.id, ids)} then ${multiplier}`);
  }
  for (const [multiplier, ids] of profileGroups) {
    branches.push(sql`when ${inList(posts.authorId, ids)} then ${multiplier}`);
  }

  if (branches.length === 0) return null;
  return sql`(case ${sql.join(branches, sql` `)} else 1.0 end)` as SQL<number>;
}

/**
 * Build the tier expression that orders promoted, organic and buried rows.
 *
 * This is what makes editorial promotion actually work. A multiplier alone
 * cannot lift an old or quiet post — its decayed score is orders of magnitude
 * below the top, so scaling it changes nothing visible. A tier sorts ahead of
 * the score entirely, so PROMOTE means promoted and BURY means buried, while
 * the multiplier still orders rows *within* a tier.
 *
 * Returns null when every live boost is a NUDGE, so the ordinary feed never
 * pays for a clause that would evaluate to the same constant for every row.
 */
export function buildBoostTierSql(boosts: ActiveBoost[]): SQL<number> | null {
  const tiered = boosts.filter((boost) => boost.mode !== "NUDGE" && isSafeId(boost.targetId));
  if (tiered.length === 0) return null;

  // Rank value = tier, plus a small priority offset for ordering within it.
  // Priority is clamped below 1 so it can never promote a row into the tier
  // above.
  const groups = new Map<number, { postIds: string[]; profileIds: string[] }>();
  for (const boost of tiered) {
    const offset = Math.min(Math.max(Number(boost.priority) || 0, 0), 0.99);
    const rank = TIER[boost.mode] + (boost.mode === "BURY" ? 0 : offset);
    const entry = groups.get(rank) ?? { postIds: [], profileIds: [] };
    if (boost.targetType === "POST") entry.postIds.push(boost.targetId);
    else entry.profileIds.push(boost.targetId);
    groups.set(rank, entry);
  }

  const branches: SQL[] = [];
  for (const [rank, entry] of groups) {
    if (entry.postIds.length > 0) {
      branches.push(sql`when ${inList(posts.id, entry.postIds)} then ${rank}`);
    }
    if (entry.profileIds.length > 0) {
      branches.push(sql`when ${inList(posts.authorId, entry.profileIds)} then ${rank}`);
    }
  }

  if (branches.length === 0) return null;
  return sql`(case ${sql.join(branches, sql` `)} else ${ORGANIC_TIER} end)` as SQL<number>;
}
