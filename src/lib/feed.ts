import { and, asc, desc, eq, inArray, or, sql, type SQL } from "drizzle-orm";

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

// ─── API Feed Sort Engine (used by /api/feed) ───

export type ApiFeedSort = "for_you" | "latest" | "trending" | "top_voted" | "most_discussed";

const recentVoteScoreSql = sql<number>`coalesce((select sum(${votes.value})::int from ${votes} where ${votes.postId} = ${posts.id} and ${votes.createdAt} > now() - interval '7 days'), 0)`;
const recentCommentCountSql = sql<number>`coalesce((select count(*)::int from ${comments} where ${comments.postId} = ${posts.id} and ${comments.status} = 'PUBLISHED' and ${comments.createdAt} > now() - interval '7 days'), 0)`;
const hoursSinceSql = sql<number>`(extract(epoch from (now() - ${posts.createdAt})) / 3600.0)`;
const forYouScoreSql = sql<number>`((${voteScoreSql} * 3 + ${commentCountSql} * 2 + 1) / power(${hoursSinceSql} + 2, 1.5))`;
const trendingScoreSql = sql<number>`(${recentVoteScoreSql} * 3 + ${recentCommentCountSql} * 2)`;

export function normalizeApiFeedSort(value?: string | null): ApiFeedSort {
	if (
		value === "for_you" ||
		value === "latest" ||
		value === "trending" ||
		value === "top_voted" ||
		value === "most_discussed"
	) {
		return value;
	}
	return "latest";
}

export function getFeedOrderBy(sort: ApiFeedSort) {
	switch (sort) {
		case "top_voted":
			return [desc(voteScoreSql), desc(posts.createdAt), asc(posts.id)];
		case "most_discussed":
			return [desc(commentCountSql), desc(posts.createdAt), asc(posts.id)];
		case "trending":
			return [desc(trendingScoreSql), desc(posts.createdAt), asc(posts.id)];
		case "for_you":
			return [desc(forYouScoreSql), asc(posts.id)];
		default:
			return [desc(posts.createdAt), asc(posts.id)];
	}
}

type HydratedFeedPost = Awaited<ReturnType<typeof resolveFeedPage>>[number];

/**
 * Two-phase feed resolution: select the page's post IDs with full SQL
 * ordering flexibility (aggregates, time decay), then hydrate relations
 * via the relational query builder and restore order in JS.
 */
export async function resolveFeedPage(options: {
	conditions: SQL[];
	sort: ApiFeedSort;
	limit: number;
	offset: number;
}) {
	const db = getDb();

	const idRows = await db
		.select({ id: posts.id })
		.from(posts)
		.where(and(...options.conditions))
		.orderBy(...getFeedOrderBy(options.sort))
		.limit(options.limit)
		.offset(options.offset);

	const ids = idRows.map((row) => row.id);
	if (ids.length === 0) return [];

	const hydrated = await db.query.posts.findMany({
		where: inArray(posts.id, ids),
		with: {
			author: true,
			institution: true,
			community: true,
			votes: true,
			comments: true,
			pollOptions: {
				with: { votes: true },
			},
		},
	});

	const byId = new Map(hydrated.map((post) => [post.id, post]));
	return ids
		.map((postId) => byId.get(postId))
		.filter((post): post is NonNullable<typeof post> => Boolean(post));
}

/**
 * Batch-resolve repost originals and format hydrated posts into the
 * JSON contract consumed by the client feed hooks.
 */
export async function formatApiFeedPosts(rawFeed: HydratedFeedPost[], viewerProfileId: string) {
	const db = getDb();

	const repostOfIds = Array.from(
		new Set(rawFeed.map((p) => p.repostOfId).filter((id): id is string => Boolean(id)))
	);

	const repostedPostsMap = new Map<string, HydratedFeedPost>();
	if (repostOfIds.length > 0) {
		try {
			const repostedPosts = await db.query.posts.findMany({
				where: inArray(posts.id, repostOfIds),
				with: {
					author: true,
					institution: true,
				},
			});
			for (const p of repostedPosts) {
				repostedPostsMap.set(p.id, p as HydratedFeedPost);
			}
		} catch (e) {
			console.error("Error fetching reposted posts:", e);
		}
	}

	return rawFeed.map((post) => {
		const votesList = post.votes || [];
		const commentsList = post.comments || [];
		const votesCount = votesList.reduce((acc, vote) => acc + (vote?.value || 0), 0);
		const commentsCount = commentsList.length;
		const userVoteObj = votesList.find((v) => v?.userId === viewerProfileId);
		const userVote = userVoteObj ? userVoteObj.value : 0;

		const formattedPollOptions = post.pollOptions?.map((opt) => {
			const optVotesList = opt.votes || [];
			const optVotesCount = optVotesList.length;
			const userVoted = optVotesList.some((v) => v?.userId === viewerProfileId);
			return { id: opt.id, text: opt.text, votesCount: optVotesCount, userVoted };
		});

		const hasVotedPoll = formattedPollOptions?.some((opt) => opt.userVoted) || false;
		const totalPollVotes = formattedPollOptions?.reduce((acc, opt) => acc + opt.votesCount, 0) || 0;
		const repostOf = post.repostOfId ? repostedPostsMap.get(post.repostOfId) || null : null;

		return {
			...post,
			repostOf,
			votesCount,
			commentsCount,
			userVote,
			pollOptions: formattedPollOptions,
			hasVotedPoll,
			totalPollVotes,
			votes: undefined,
			comments: undefined,
		};
	});
}

export function sortFeedPosts<T extends { 
	createdAt: Date | string; 
	votesCount: number; 
	commentsCount: number; 
	institutionId: string;
}>(items: T[], sort: string | null, userInstitutionId?: string): T[] {
	const sorted = [...items];

	switch (sort) {
		case "latest":
			return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

		case "trending":
			return sorted.sort((a, b) => {
				const scoreA = a.votesCount + a.commentsCount * 2;
				const scoreB = b.votesCount + b.commentsCount * 2;
				if (scoreB !== scoreA) return scoreB - scoreA;
				return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
			});

		case "top_voted":
			return sorted.sort((a, b) => {
				if (b.votesCount !== a.votesCount) return b.votesCount - a.votesCount;
				return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
			});

		case "most_discussed":
		case "discussed":
			return sorted.sort((a, b) => {
				if (b.commentsCount !== a.commentsCount) return b.commentsCount - a.commentsCount;
				return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
			});

		case "for_you":
		default:
			return sorted.sort((a, b) => {
				const campusBonusA = userInstitutionId && a.institutionId === userInstitutionId ? 500 : 0;
				const campusBonusB = userInstitutionId && b.institutionId === userInstitutionId ? 500 : 0;
				const scoreA = campusBonusA + a.votesCount * 2 + a.commentsCount * 3;
				const scoreB = campusBonusB + b.votesCount * 2 + b.commentsCount * 3;
				if (scoreB !== scoreA) return scoreB - scoreA;
				return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
			});
	}
}

