import "server-only";

import { and, count, desc, eq, gte, sql } from "drizzle-orm";

import {
  anonIdentityVault,
  comments,
  institutions,
  marketplaceOrders,
  merchants,
  moderationActions,
  posts,
  reports,
  userProfiles,
  votes,
} from "@/db/schema";
import type { Db } from "./db-context";

export type DashboardStats = {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  totalPosts: number;
  publishedPosts: number;
  pendingPosts: number;
  anonymousPosts: number;
  totalComments: number;
  openReports: number;
  colleges: number;
  lpCirculating: number;
  anonVaultEntries: number;
  totalMerchants: number;
  totalOrders: number;
  totalGmv: number;
};

export async function getDashboardStats(db: Db): Promise<DashboardStats> {
  try {
    const [usersRow] = await db
      .select({
        total: count(),
        active: sql<number>`count(*) filter (where ${userProfiles.status} = 'ACTIVE')::int`,
        banned: sql<number>`count(*) filter (where ${userProfiles.status} = 'BANNED')::int`,
        lp: sql<number>`coalesce(sum(${userProfiles.points}), 0)::int`,
      })
      .from(userProfiles)
      .catch(() => []);

    const [postsRow] = await db
      .select({
        total: count(),
        published: sql<number>`count(*) filter (where ${posts.status} = 'PUBLISHED')::int`,
        pending: sql<number>`count(*) filter (where ${posts.status} = 'PENDING_REVIEW')::int`,
        anonymous: sql<number>`count(*) filter (where ${posts.isAnonymous})::int`,
      })
      .from(posts)
      .catch(() => []);

    const [commentsRes, reportsRes, collegesRes, vaultRes, merchantsRes, ordersRes] = await Promise.all([
      db
        .select({ total: count() })
        .from(comments)
        .catch(() => [{ total: 0 }]),
      db
        .select({ open: sql<number>`count(*) filter (where ${reports.status} = 'OPEN')::int` })
        .from(reports)
        .catch(() => [{ open: 0 }]),
      db
        .select({ total: count() })
        .from(institutions)
        .catch(() => [{ total: 0 }]),
      db
        .select({ total: count() })
        .from(anonIdentityVault)
        .catch(() => [{ total: 0 }]),
      db
        .select({ total: count() })
        .from(merchants)
        .catch(() => [{ total: 0 }]),
      db
        .select({
          total: count(),
          gmv: sql<number>`coalesce(sum(case when ${marketplaceOrders.status} not in ('CANCELLED', 'REJECTED') then ${marketplaceOrders.total} else 0 end), 0)::int`,
        })
        .from(marketplaceOrders)
        .catch(() => [{ total: 0, gmv: 0 }]),
    ]);

    return {
      totalUsers: usersRow?.total ?? 0,
      activeUsers: usersRow?.active ?? 0,
      bannedUsers: usersRow?.banned ?? 0,
      totalPosts: postsRow?.total ?? 0,
      publishedPosts: postsRow?.published ?? 0,
      pendingPosts: postsRow?.pending ?? 0,
      anonymousPosts: postsRow?.anonymous ?? 0,
      totalComments: commentsRes[0]?.total ?? 0,
      openReports: reportsRes[0]?.open ?? 0,
      colleges: collegesRes[0]?.total ?? 0,
      lpCirculating: usersRow?.lp ?? 0,
      anonVaultEntries: vaultRes[0]?.total ?? 0,
      totalMerchants: merchantsRes[0]?.total ?? 0,
      totalOrders: ordersRes[0]?.total ?? 0,
      totalGmv: ordersRes[0]?.gmv ?? 0,
    };
  } catch (error) {
    console.error("[getDashboardStats] error:", error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      bannedUsers: 0,
      totalPosts: 0,
      publishedPosts: 0,
      pendingPosts: 0,
      anonymousPosts: 0,
      totalComments: 0,
      openReports: 0,
      colleges: 0,
      lpCirculating: 0,
      anonVaultEntries: 0,
      totalMerchants: 0,
      totalOrders: 0,
      totalGmv: 0,
    };
  }
}

export type ActivityPoint = { day: string; posts: number; comments: number; signups: number };

/** 14-day activity series in ONE round trip via three grouped subqueries. */
export async function getActivitySeries(db: Db): Promise<ActivityPoint[]> {
  try {
    const result = await db.execute(sql`
			with days as (
				select generate_series(current_date - interval '13 days', current_date, interval '1 day')::date as day
			)
			select
				to_char(days.day, 'Mon DD') as day,
				(select count(*)::int from ${posts} where ${posts.createdAt}::date = days.day) as posts,
				(select count(*)::int from ${comments} where ${comments.createdAt}::date = days.day) as comments,
				(select count(*)::int from ${userProfiles} where ${userProfiles.createdAt}::date = days.day) as signups
			from days
			order by days.day
		`);

    const rawRows = Array.isArray(result) ? result : (result as { rows?: unknown[] })?.rows || [];
    return (rawRows as Record<string, unknown>[]).map((r) => ({
      day: String(r.day ?? ""),
      posts: Number(r.posts ?? 0),
      comments: Number(r.comments ?? 0),
      signups: Number(r.signups ?? 0),
    }));
  } catch (error) {
    console.error("[getActivitySeries] error:", error);
    return [];
  }
}

export type TopCollege = { id: string; name: string; slug: string; students: number; postCount: number };

export async function getTopColleges(db: Db, limit = 6): Promise<TopCollege[]> {
  return db
    .select({
      id: institutions.id,
      name: institutions.name,
      slug: institutions.slug,
      students: sql<number>`count(distinct ${userProfiles.id})::int`,
      postCount: sql<number>`count(${posts.id})::int`,
    })
    .from(institutions)
    .leftJoin(userProfiles, eq(userProfiles.institutionId, institutions.id))
    .leftJoin(posts, eq(posts.institutionId, institutions.id))
    .groupBy(institutions.id, institutions.name, institutions.slug)
    .orderBy(desc(sql`count(${posts.id})`), desc(sql`count(distinct ${userProfiles.id})`))
    .limit(limit);
}

export type AuditEntry = {
  id: string;
  action: string;
  moderatorName: string | null;
  targetType: string;
  targetId: string;
  reason: string | null;
  createdAt: Date;
};

export async function getRecentAuditLog(db: Db, limit = 8): Promise<AuditEntry[]> {
  return db
    .select({
      id: moderationActions.id,
      action: moderationActions.action,
      moderatorName: userProfiles.displayName,
      targetType: moderationActions.targetType,
      targetId: moderationActions.targetId,
      reason: moderationActions.reason,
      createdAt: moderationActions.createdAt,
    })
    .from(moderationActions)
    .leftJoin(userProfiles, eq(moderationActions.moderatorId, userProfiles.id))
    .orderBy(desc(moderationActions.createdAt))
    .limit(limit);
}

export type PendingPost = {
  id: string;
  body: string;
  type: string;
  riskScore: number;
  isAnonymous: boolean;
  pseudonym: string | null;
  createdAt: Date;
  institutionName: string | null;
};

export async function getPendingReviewPosts(db: Db, limit = 30): Promise<PendingPost[]> {
  return db
    .select({
      id: posts.id,
      body: posts.body,
      type: posts.type,
      riskScore: posts.riskScore,
      isAnonymous: posts.isAnonymous,
      pseudonym: posts.pseudonym,
      createdAt: posts.createdAt,
      institutionName: institutions.name,
    })
    .from(posts)
    .leftJoin(institutions, eq(posts.institutionId, institutions.id))
    .where(and(eq(posts.status, "PENDING_REVIEW"), gte(posts.riskScore, 0)))
    .orderBy(desc(posts.riskScore), desc(posts.createdAt))
    .limit(limit);
}

export type FullAuditEntry = AuditEntry & { moderatorUsername: string | null };

export async function getAuditPage(
  db: Db,
  limit = 50,
  offset = 0
): Promise<{ rows: FullAuditEntry[]; total: number }> {
  const [rows, [totals]] = await Promise.all([
    db
      .select({
        id: moderationActions.id,
        action: moderationActions.action,
        moderatorName: userProfiles.displayName,
        moderatorUsername: userProfiles.username,
        targetType: moderationActions.targetType,
        targetId: moderationActions.targetId,
        reason: moderationActions.reason,
        createdAt: moderationActions.createdAt,
      })
      .from(moderationActions)
      .leftJoin(userProfiles, eq(moderationActions.moderatorId, userProfiles.id))
      .orderBy(desc(moderationActions.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(moderationActions),
  ]);

  return { rows, total: totals?.total ?? 0 };
}

export type EngagementTotals = { votes: number };

export async function getTotalEngagement(db: Db): Promise<EngagementTotals> {
  const [row] = await db.select({ votes: sql<number>`coalesce(sum(${votes.value}), 0)::int` }).from(votes);
  return { votes: row?.votes ?? 0 };
}
