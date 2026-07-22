import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { desc, eq, and, sql, SQL } from "drizzle-orm";
import { posts, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";

export async function GET(req: Request) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope") as "CAMPUS" | "GLOBAL" | null;
    const type = searchParams.get("type") as string | null;
    const sort = searchParams.get("sort") as "latest" | "trending" | "top_voted" | "most_discussed" | null;
    const visibility = searchParams.get("visibility") as "all" | "anonymous" | "public" | null;
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const offset = (page - 1) * limit;
    const hashtag = searchParams.get("hashtag");

    const db = getDb();
    
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    // Build conditions
    const conditions: SQL[] = [eq(posts.status, "PUBLISHED")];
    if (scope === "CAMPUS") {
      conditions.push(eq(posts.institutionId, profile.institutionId));
    }
    if (type && type !== "ALL" && type !== "all") {
      conditions.push(eq(posts.type, type as (typeof posts.type.enumValues)[number]));
    }
    if (visibility === "anonymous") {
      conditions.push(eq(posts.isAnonymous, true));
    } else if (visibility === "public") {
      conditions.push(eq(posts.isAnonymous, false));
    }
    if (hashtag) {
      conditions.push(sql`${posts.body} ILIKE ${`%#${hashtag}%`}`);
    }

    // For You score: campus match + community match + engagement velocity
    const forYouSql = sql<number>`
      coalesce((select sum(value)::int from votes where post_id = posts.id), 0) * 4
      +
      coalesce((select count(*)::int from comments where post_id = posts.id and status = 'PUBLISHED'), 0) * 6
      +
      case when posts.institution_id = ${profile.institutionId} then 40 else 0 end
      +
      case when posts.community_id is not null then 20 else 0 end
    `;

    // Trending score: votes + comments
    const trendingSql = sql<number>`
      coalesce((select sum(value)::int from votes where post_id = posts.id), 0)
      +
      coalesce((select count(*)::int from comments where post_id = posts.id and status = 'PUBLISHED'), 0)
    `;

    // Top Voted score
    const votesCountSql = sql<number>`
      coalesce((select sum(value)::int from votes where post_id = posts.id), 0)
    `;

    // Most Discussed score
    const commentsCountSql = sql<number>`
      coalesce((select count(*)::int from comments where post_id = posts.id and status = 'PUBLISHED'), 0)
    `;

    let orderClauses = [desc(forYouSql), desc(posts.createdAt)];
    if (sort === "latest") {
      orderClauses = [desc(posts.createdAt)];
    } else if (sort === "trending") {
      orderClauses = [desc(trendingSql), desc(posts.createdAt)];
    } else if (sort === "top_voted") {
      orderClauses = [desc(votesCountSql), desc(posts.createdAt)];
    } else if (sort === "most_discussed") {
      orderClauses = [desc(commentsCountSql), desc(posts.createdAt)];
    }

    const rawFeed = await db.query.posts.findMany({
      where: and(...conditions),
      orderBy: orderClauses,
      limit,
      offset,
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

    const feed = rawFeed.map(post => {
      const votesCount = post.votes.reduce((acc, vote) => acc + vote.value, 0);
      const commentsCount = post.comments.length;
      const userVoteObj = post.votes.find(v => v.userId === profile.id);
      const userVote = userVoteObj ? userVoteObj.value : 0;

      const formattedPollOptions = post.pollOptions?.map(opt => {
        const optVotesCount = opt.votes.length;
        const userVoted = opt.votes.some(v => v.userId === profile.id);
        return { id: opt.id, text: opt.text, votesCount: optVotesCount, userVoted };
      });

      const hasVotedPoll = formattedPollOptions?.some(opt => opt.userVoted) || false;
      const totalPollVotes = formattedPollOptions?.reduce((acc, opt) => acc + opt.votesCount, 0) || 0;

      return {
        ...post,
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

    return NextResponse.json(feed);
  } catch (error) {
    console.error("Error fetching feed:", error);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}
