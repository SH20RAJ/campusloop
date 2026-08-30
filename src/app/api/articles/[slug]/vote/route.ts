import { getDb } from "@/db";
import { articles, articleVotes, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { awardPoints } from "@/lib/gamification-server";
import { and, eq, or, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const currentProfile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!currentProfile) {
      return NextResponse.json({ error: "Profile required" }, { status: 404 });
    }

    const article = await db.query.articles.findFirst({
      where: or(eq(articles.slug, slug), eq(articles.id, slug)),
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const body = (await req.json()) as Record<string, any>;
    const voteValue: number = body.value === -1 ? -1 : 1; // 1 = upvote, -1 = downvote

    const existingVote = await db.query.articleVotes.findFirst({
      where: and(
        eq(articleVotes.articleId, article.id),
        eq(articleVotes.profileId, currentProfile.id)
      ),
    });

    let nextVote = 0;

    if (existingVote) {
      if (existingVote.value === voteValue) {
        // Toggle off
        await db.delete(articleVotes).where(eq(articleVotes.id, existingVote.id));
        nextVote = 0;
      } else {
        // Switch vote
        await db
          .update(articleVotes)
          .set({ value: voteValue })
          .where(eq(articleVotes.id, existingVote.id));
        nextVote = voteValue;
      }
    } else {
      // New vote
      await db.insert(articleVotes).values({
        id: `av_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        articleId: article.id,
        profileId: currentProfile.id,
        value: voteValue,
        createdAt: new Date(),
      });
      nextVote = voteValue;

      // Award +2 LP for receiving upvotes
      if (voteValue === 1 && article.authorId !== currentProfile.id) {
        try {
          await awardPoints(article.authorId, 2, "ARTICLE_UPVOTE");
        } catch (e) {
          console.warn("Failed to award points:", e);
        }
      }
    }

    // Recalculate upvotes and downvotes count
    const allVotes = await db.query.articleVotes.findMany({
      where: eq(articleVotes.articleId, article.id),
    });

    const upvotesCount = allVotes.filter((v) => v.value === 1).length;
    const downvotesCount = allVotes.filter((v) => v.value === -1).length;

    await db
      .update(articles)
      .set({ upvotesCount, downvotesCount })
      .where(eq(articles.id, article.id));

    return NextResponse.json({
      userVote: nextVote,
      upvotesCount,
      downvotesCount,
    });
  } catch (error) {
    console.error("POST /api/articles/[slug]/vote error:", error);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}
