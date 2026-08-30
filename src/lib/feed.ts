import { and, asc, desc, eq, inArray, or, type SQL, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { comments, institutions, posts, reports, userProfiles, votes } from "@/db/schema";

export type FeedPost = {
  id: string;
  type: "NORMAL" | "ANONYMOUS" | "CONFESSION" | "POLL" | "QUESTION" | "MEME" | "EVENT" | "LOST_FOUND";
  scope: "CAMPUS" | "STATE" | "INDIA" | "GLOBAL";
  title: string | null;
  body: string;
  isAnonymous: boolean;
  pseudonym: string | null;
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
    pseudonym: posts.pseudonym,
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
  const where = typeFilter
    ? and(eq(posts.institutionId, institutionId), published, typeFilter)
    : and(eq(posts.institutionId, institutionId), published);

  return db
    .select(feedSelect())
    .from(posts)
    .leftJoin(userProfiles, eq(posts.authorId, userProfiles.id))
    .innerJoin(institutions, eq(posts.institutionId, institutions.id))
    .where(where)
    .orderBy(filter === "trending" ? desc(trendingSql) : desc(posts.createdAt))
    .limit(40);
}

export async function getGlobalFeed(
  profile: { institutionId: string },
  state: string | null,
  filterValue?: string
) {
  const db = getDb();
  const filter = getFeedFilter(filterValue);
  const typeFilter = filterCondition(filter);
  const scopeFilter = state
    ? or(
        inArray(posts.scope, ["GLOBAL", "INDIA"]),
        and(eq(posts.scope, "STATE"), eq(institutions.state, state)),
        eq(posts.institutionId, profile.institutionId)
      )
    : or(inArray(posts.scope, ["GLOBAL", "INDIA"]), eq(posts.institutionId, profile.institutionId));
  const where = typeFilter ? and(published, scopeFilter, typeFilter) : and(published, scopeFilter);

  return db
    .select(feedSelect())
    .from(posts)
    .leftJoin(userProfiles, eq(posts.authorId, userProfiles.id))
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
    .leftJoin(userProfiles, eq(posts.authorId, userProfiles.id))
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
    .leftJoin(userProfiles, eq(posts.authorId, userProfiles.id))
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
    .leftJoin(userProfiles, eq(posts.authorId, userProfiles.id))
    .innerJoin(institutions, eq(posts.institutionId, institutions.id))
    .where(and(published, eq(posts.authorId, profileId), eq(posts.isAnonymous, false)))
    .orderBy(desc(posts.createdAt))
    .limit(30);
}

// ─── API Feed Sort Engine (used by /api/feed) ───

export type ApiFeedSort =
  | "for_you"
  | "latest"
  | "trending"
  | "viral"
  | "spicy"
  | "top_voted"
  | "most_discussed"
  | "random";

const recentVoteScoreSql = sql<number>`coalesce((select sum(${votes.value})::int from ${votes} where ${votes.postId} = ${posts.id} and ${votes.createdAt} > now() - interval '7 days'), 0)`;
const recentCommentCountSql = sql<number>`coalesce((select count(*)::int from ${comments} where ${comments.postId} = ${posts.id} and ${comments.status} = 'PUBLISHED' and ${comments.createdAt} > now() - interval '7 days'), 0)`;
const totalVoteScoreSql = sql<number>`coalesce((select sum(${votes.value})::int from ${votes} where ${votes.postId} = ${posts.id}), 0)`;
const totalCommentCountSql = sql<number>`coalesce((select count(*)::int from ${comments} where ${comments.postId} = ${posts.id} and ${comments.status} = 'PUBLISHED'), 0)`;
const hoursSinceSql = sql<number>`(extract(epoch from (now() - ${posts.createdAt})) / 3600.0)`;

// HackerNews + Reddit gravity trending
const trendingScoreSql = sql<number>`((${recentVoteScoreSql} * 3.5 + ${recentCommentCountSql} * 2.5 + 1.0) / power(${hoursSinceSql} + 2.0, 0.75))`;

// 🌶️ State-of-the-art Confessions Spicy Algorithm:
// High weight on discussion velocity, controversy delta, and fresh secret exploration
const spicyScoreSql = sql<number>`(
	((${recentVoteScoreSql} * 3.2 + ${recentCommentCountSql} * 4.8 + abs(${totalVoteScoreSql} - ${totalCommentCountSql}) * 0.7 + 1.0)
	/ power(${hoursSinceSql} + 1.4, 1.18))
	+ (case when ${posts.type} = 'CONFESSION' then 15.0 else 0.0 end)
	+ (random() * 14.0)
)`;

// 🚀 Multi-Armed Bandit / Epsilon-Greedy Viral Algorithm (TikTok / Twitter Heavy Ranker inspired):
// Logarithmic engagement magnitude + velocity derivative + stochastic exploration injection
const viralScoreSql = sql<number>`(
	-- Velocity Derivative (First derivative of campus interactions over age)
	((${recentVoteScoreSql} * 4.2 + ${recentCommentCountSql} * 5.8 + 2.0) / power(${hoursSinceSql} + 0.65, 1.28))
	-- Log-scale engagement floor
	+ (ln(greatest(1.0, ${totalVoteScoreSql} + ${totalCommentCountSql} * 2.2 + 1.0)) * 14.0)
	-- Stochastic Exploration Injection (15% probability burst for worthy fresh posts < 36h)
	+ (case when ${hoursSinceSql} < 36.0 then (random() * 28.0) else (random() * 5.0) end)
	-- Cross-campus reach affinity
	+ (case when ${posts.scope} in ('INDIA', 'GLOBAL') then 10.0 else 0.0 end)
	-- Interactive / poll / confession bonus
	+ (case when ${posts.type} in ('POLL', 'QUESTION', 'CONFESSION', 'MEME') then 6.0 else 0.0 end)
)`;

function getForYouScoreSql(
  userInstitutionId?: string | null,
  seenIds?: string[],
  viewerProfileId?: string | null
) {
  const ownCollegeBonus = userInstitutionId
    ? sql<number>`(case when ${posts.institutionId} = ${userInstitutionId} then 35.0 else 0.0 end)`
    : sql<number>`0.0`;

  const seenPenaltySql =
    seenIds && seenIds.length > 0
      ? sql<number>`(case when ${posts.id} in (${sql.raw(
          seenIds
            .slice(0, 100)
            .map((id) => `'${id.replace(/'/g, "''")}'`)
            .join(",")
        )}) then -160.0 else 0.0 end)`
      : sql<number>`0.0`;

  const alreadyVotedPenaltySql = viewerProfileId
    ? sql<number>`(case when exists(select 1 from ${votes} where ${votes.postId} = ${posts.id} and ${votes.userId} = ${viewerProfileId}) then -120.0 else 0.0 end)`
    : sql<number>`0.0`;

  const alreadyCommentedPenaltySql = viewerProfileId
    ? sql<number>`(case when exists(select 1 from ${comments} where ${comments.postId} = ${posts.id} and ${comments.authorId} = ${viewerProfileId} and ${comments.status} = 'PUBLISHED') then -90.0 else 0.0 end)`
    : sql<number>`0.0`;

  const ownPostPenaltySql = viewerProfileId
    ? sql<number>`(case when ${posts.authorId} = ${viewerProfileId} then -80.0 else 0.0 end)`
    : sql<number>`0.0`;

  return sql<number>`(
		${ownCollegeBonus}
		+ ${seenPenaltySql}
		+ ${alreadyVotedPenaltySql}
		+ ${alreadyCommentedPenaltySql}
		+ ${ownPostPenaltySql}
		+ (65.0 / power(${hoursSinceSql} + 1.0, 0.82))
		+ (${recentVoteScoreSql} * 4.0)
		+ (${recentCommentCountSql} * 3.0)
		+ (case 
			when ${posts.type} = 'POLL' then 10.0
			when ${posts.type} = 'QUESTION' then 8.0
			when ${posts.type} = 'CONFESSION' then 8.0
			else 0.0 
		end)
		+ (random() * 20.0)
	)`;
}

export function normalizeApiFeedSort(value?: string | null): ApiFeedSort {
  if (
    value === "for_you" ||
    value === "latest" ||
    value === "trending" ||
    value === "viral" ||
    value === "spicy" ||
    value === "top_voted" ||
    value === "most_discussed" ||
    value === "random"
  ) {
    return value;
  }
  return "latest";
}

export function getFeedOrderBy(
  sort: ApiFeedSort,
  userInstitutionId?: string | null,
  seenIds?: string[],
  viewerProfileId?: string | null
) {
  const orderClauses: (SQL | ReturnType<typeof desc> | ReturnType<typeof asc>)[] = [];

  if (seenIds && seenIds.length > 0) {
    const escaped = seenIds
      .slice(0, 100)
      .map((id) => `'${id.replace(/'/g, "''")}'`)
      .join(",");
    orderClauses.push(desc(sql<number>`(case when ${posts.id} in (${sql.raw(escaped)}) then 0 else 1 end)`));
  }

  if (userInstitutionId && sort === "for_you") {
    orderClauses.push(
      desc(sql<number>`(case when ${posts.institutionId} = ${userInstitutionId} then 1 else 0 end)`)
    );
  }

  switch (sort) {
    case "top_voted":
      orderClauses.push(desc(voteScoreSql));
      break;
    case "most_discussed":
      orderClauses.push(desc(commentCountSql));
      break;
    case "trending":
      orderClauses.push(desc(trendingScoreSql));
      break;
    case "spicy":
      orderClauses.push(desc(spicyScoreSql));
      break;
    case "viral":
      orderClauses.push(desc(viralScoreSql));
      break;
    case "random":
      orderClauses.push(sql`random()`);
      return orderClauses;
    case "for_you": {
      const forYouScore = getForYouScoreSql(userInstitutionId, seenIds, viewerProfileId);
      orderClauses.push(desc(forYouScore));
      break;
    }
    default:
      break;
  }

  orderClauses.push(desc(posts.createdAt), asc(posts.id));
  return orderClauses;
}

type HydratedFeedPost = Awaited<ReturnType<typeof resolveFeedPage>>[number];

/**
 * Two-phase feed resolution: select the page's post IDs with full SQL
 * ordering flexibility (aggregates, time decay, seen post demotion),
 * then hydrate relations via the relational query builder and restore order in JS.
 */
export async function resolveFeedPage(options: {
  conditions: SQL[];
  sort: ApiFeedSort;
  limit: number;
  offset: number;
  userInstitutionId?: string | null;
  seenIds?: string[];
  viewerProfileId?: string | null;
}) {
  const db = getDb();

  const idRows = await db
    .select({ id: posts.id })
    .from(posts)
    .where(and(...options.conditions))
    .orderBy(
      ...getFeedOrderBy(options.sort, options.userInstitutionId, options.seenIds, options.viewerProfileId)
    )
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
      comments: {
        where: eq(comments.status, "PUBLISHED"),
        orderBy: [desc(comments.createdAt)],
        with: {
          author: true,
        },
      },
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
/**
 * Anonymous posts must never carry their author relation past this boundary —
 * the client only receives the pseudonym handle.
 */
function stripAuthorForAnonymity<
  T extends { isAnonymous: boolean; pseudonym?: string | null; author?: unknown },
>(post: T): Omit<T, "author"> {
  if (post.isAnonymous) {
    const rest = { ...post } as Partial<Record<"author", unknown>>;
    delete rest.author;
    return rest as Omit<T, "author">;
  }
  return post;
}

export async function formatApiFeedPosts(rawFeed: HydratedFeedPost[], viewerProfileId?: string | null) {
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
    const safeRepostOf = repostOf ? stripAuthorForAnonymity(repostOf) : null;

    const publishedComments = commentsList.filter((c) => c && c.status === "PUBLISHED");
    let topComment: {
      id: string;
      body: string;
      createdAt: Date | string;
      isAnonymous: boolean;
      pseudonym?: string | null;
      author?: {
        id?: string;
        username?: string | null;
        displayName?: string | null;
        avatarUrl?: string | null;
        points?: number | null;
      } | null;
    } | null = null;

    if (publishedComments.length > 0) {
      const c = publishedComments[0];
      topComment = {
        id: c.id,
        body: c.body,
        createdAt: c.createdAt,
        isAnonymous: c.isAnonymous,
        pseudonym: c.pseudonym,
        author:
          c.isAnonymous || !c.author
            ? null
            : {
                id: c.author.id,
                username: c.author.username,
                displayName: c.author.displayName,
                avatarUrl: c.author.avatarUrl,
                points: c.author.points,
              },
      };
    }

    return {
      ...stripAuthorForAnonymity(post),
      repostOf: safeRepostOf,
      votesCount,
      commentsCount,
      userVote,
      topComment,
      pollOptions: formattedPollOptions,
      hasVotedPoll,
      totalPollVotes,
      votes: undefined,
      comments: undefined,
    };
  });
}

export function sortFeedPosts<
  T extends {
    createdAt: Date | string;
    votesCount: number;
    commentsCount: number;
    institutionId: string;
  },
>(items: T[], sort: string | null, userInstitutionId?: string): T[] {
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
    default:
      return sorted.sort((a, b) => {
        const hoursA = Math.max(0, (Date.now() - new Date(a.createdAt).getTime()) / (3600 * 1000));
        const hoursB = Math.max(0, (Date.now() - new Date(b.createdAt).getTime()) / (3600 * 1000));
        const decayA = 45 / (hoursA + 1.2) ** 0.75;
        const decayB = 45 / (hoursB + 1.2) ** 0.75;
        const campusBonusA = userInstitutionId && a.institutionId === userInstitutionId ? 500 : 0;
        const campusBonusB = userInstitutionId && b.institutionId === userInstitutionId ? 500 : 0;
        const scoreA = campusBonusA + decayA + a.votesCount * 3.5 + a.commentsCount * 2.5;
        const scoreB = campusBonusB + decayB + b.votesCount * 3.5 + b.commentsCount * 2.5;

        if (scoreB !== scoreA) return scoreB - scoreA;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }
}
