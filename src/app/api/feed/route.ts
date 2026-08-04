import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { desc, eq, and, sql, SQL, inArray } from "drizzle-orm";
import { posts, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";

export const dynamic = "force-dynamic";

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
    const limit = Number(searchParams.get("limit")) || 12;
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
    if (scope === "CAMPUS" && profile.institutionId) {
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

    // Order clause safe for Drizzle Relational Query Builder
    let orderClauses = [desc(posts.createdAt)];

    let rawFeed = await db.query.posts.findMany({
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

    // Infinite Feed Guarantee: If page/offset runs out of strict posts, backfill with active filter condition matching posts
    if (rawFeed.length < limit) {
      const existingIds = new Set(rawFeed.map((p) => p.id));
      const needed = limit - rawFeed.length;
      
      try {
        const extraFeed = await db.query.posts.findMany({
          where: and(...conditions),
          orderBy: [desc(posts.createdAt)],
          limit: needed * 3,
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

        for (const extra of extraFeed) {
          if (!existingIds.has(extra.id) && rawFeed.length < limit) {
            rawFeed.push(extra);
            existingIds.add(extra.id);
          }
        }
      } catch (e) {
        console.error("Backfill query error:", e);
      }
    }

    // Safely batch-resolve repostOf original posts
    const repostOfIds = Array.from(
      new Set(rawFeed.map((p) => p.repostOfId).filter((id): id is string => Boolean(id)))
    );

    const repostedPostsMap = new Map<string, any>();
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
          repostedPostsMap.set(p.id, p);
        }
      } catch (e) {
        console.error("Error fetching reposted posts:", e);
      }
    }

    const feed = rawFeed.map(post => {
      const votesList = post.votes || [];
      const commentsList = post.comments || [];
      const votesCount = votesList.reduce((acc, vote) => acc + (vote?.value || 0), 0);
      const commentsCount = commentsList.length;
      const userVoteObj = votesList.find(v => v?.userId === profile.id);
      const userVote = userVoteObj ? userVoteObj.value : 0;

      const formattedPollOptions = post.pollOptions?.map(opt => {
        const optVotesList = opt.votes || [];
        const optVotesCount = optVotesList.length;
        const userVoted = optVotesList.some(v => v?.userId === profile.id);
        return { id: opt.id, text: opt.text, votesCount: optVotesCount, userVoted };
      });

      const hasVotedPoll = formattedPollOptions?.some(opt => opt.userVoted) || false;
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

    return NextResponse.json(feed);
  } catch (error) {
    console.error("Error fetching feed:", error);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}
