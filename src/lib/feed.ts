import { and, desc, eq, inArray, or, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { comments, institutions, posts, reports, userProfiles, votes } from "@/db/schema";

export type FeedPost = {
	id: string;
	type: "NORMAL" | "ANONYMOUS" | "CONFESSION" | "POLL" | "QUESTION" | "MEME" | "EVENT" | "LOST_FOUND";
	scope: "CAMPUS" | "STATE" | "INDIA" | "GLOBAL";
	title: string | null;
	body: string;
	isAnonymous: boolean;
	status: "PUBLISHED" | "HIDDEN" | "DELETED" | "PENDING_REVIEW";
	riskScore: number;
	createdAt: Date;
	authorDisplayName: string | null;
	authorUsername: string | null;
	institutionName: string;
	institutionState: string | null;
	commentCount: number;
	voteScore: number;
	reportCount: number;
};

export type FeedFilter = "trending" | "latest" | "confessions" | "polls" | "questions";

const published = eq(posts.status, "PUBLISHED");
const commentCountSql = sql<number>`coalesce((select count(*)::int from ${comments} where ${comments.postId} = ${posts.id} and ${comments.status} = 'PUBLISHED'), 0)`;
const voteScoreSql = sql<number>`coalesce((select sum(${votes.value})::int from ${votes} where ${votes.postId} = ${posts.id}), 0)`;
const reportCountSql = sql<number>`coalesce((select count(*)::int from ${reports} where ${reports.targetType} = 'POST' and ${reports.targetId} = ${posts.id}), 0)`;
const trendingSql = sql<number>`(${voteScoreSql} + ${commentCountSql} - ${reportCountSql})`;

function filterCondition(filter: FeedFilter) {
	if (filter === "confessions") {
		return eq(posts.type, "CONFESSION");
	}

	if (filter === "polls") {
		return eq(posts.type, "POLL");
	}

	if (filter === "questions") {
		return eq(posts.type, "QUESTION");
	}

	return undefined;
}

function normalizeFilter(value?: string): FeedFilter {
	if (value === "trending" || value === "confessions" || value === "polls" || value === "questions") {
		return value;
	}

	return "latest";
}

export function getFeedFilter(value?: string) {
	return normalizeFilter(value);
}

function feedSelect() {
	return {
		id: posts.id,
		type: posts.type,
		scope: posts.scope,
		title: posts.title,
		body: posts.body,
		isAnonymous: posts.isAnonymous,
		status: posts.status,
		riskScore: posts.riskScore,
		createdAt: posts.createdAt,
		authorDisplayName: userProfiles.displayName,
		authorUsername: userProfiles.username,
		institutionName: institutions.name,
		institutionState: institutions.state,
		commentCount: commentCountSql,
		voteScore: voteScoreSql,
		reportCount: reportCountSql,
	};
}

export async function getCampusFeed(institutionId: string, filterValue?: string) {
	const db = getDb();
	const filter = getFeedFilter(filterValue);
	const typeFilter = filterCondition(filter);
	const where = typeFilter ? and(eq(posts.institutionId, institutionId), published, typeFilter) : and(eq(posts.institutionId, institutionId), published);

	return db
		.select(feedSelect())
		.from(posts)
		.innerJoin(userProfiles, eq(posts.authorId, userProfiles.id))
		.innerJoin(institutions, eq(posts.institutionId, institutions.id))
		.where(where)
		.orderBy(filter === "trending" ? desc(trendingSql) : desc(posts.createdAt))
		.limit(40);
}

export async function getGlobalFeed(profile: { institutionId: string }, state: string | null, filterValue?: string) {
	const db = getDb();
	const filter = getFeedFilter(filterValue);
	const typeFilter = filterCondition(filter);
	const scopeFilter = state
		? or(inArray(posts.scope, ["GLOBAL", "INDIA"]), and(eq(posts.scope, "STATE"), eq(institutions.state, state)), eq(posts.institutionId, profile.institutionId))
		: or(inArray(posts.scope, ["GLOBAL", "INDIA"]), eq(posts.institutionId, profile.institutionId));
	const where = typeFilter ? and(published, scopeFilter, typeFilter) : and(published, scopeFilter);

	return db
		.select(feedSelect())
		.from(posts)
		.innerJoin(userProfiles, eq(posts.authorId, userProfiles.id))
		.innerJoin(institutions, eq(posts.institutionId, institutions.id))
		.where(where)
		.orderBy(filter === "trending" ? desc(trendingSql) : desc(posts.createdAt))
		.limit(40);
}

export async function getConfessionsFeed(institutionId: string, scope: "campus" | "india" = "campus") {
	const db = getDb();
	const where =
		scope === "india"
			? and(published, eq(posts.type, "CONFESSION"), inArray(posts.scope, ["INDIA", "GLOBAL"]))
			: and(published, eq(posts.type, "CONFESSION"), eq(posts.institutionId, institutionId));

	return db
		.select(feedSelect())
		.from(posts)
		.innerJoin(userProfiles, eq(posts.authorId, userProfiles.id))
		.innerJoin(institutions, eq(posts.institutionId, institutions.id))
		.where(where)
		.orderBy(desc(trendingSql), desc(posts.createdAt))
		.limit(40);
}

export async function getPollFeed(institutionId: string, scope: "campus" | "global" = "campus") {
	const db = getDb();
	const where =
		scope === "global"
			? and(published, eq(posts.type, "POLL"), inArray(posts.scope, ["GLOBAL", "INDIA"]))
			: and(published, eq(posts.type, "POLL"), eq(posts.institutionId, institutionId));

	return db
		.select(feedSelect())
		.from(posts)
		.innerJoin(userProfiles, eq(posts.authorId, userProfiles.id))
		.innerJoin(institutions, eq(posts.institutionId, institutions.id))
		.where(where)
		.orderBy(desc(posts.createdAt))
		.limit(40);
}

export async function getVisibleProfilePosts(profileId: string) {
	const db = getDb();

	return db
		.select(feedSelect())
		.from(posts)
		.innerJoin(userProfiles, eq(posts.authorId, userProfiles.id))
		.innerJoin(institutions, eq(posts.institutionId, institutions.id))
		.where(and(published, eq(posts.authorId, profileId), eq(posts.isAnonymous, false)))
		.orderBy(desc(posts.createdAt))
		.limit(30);
}
