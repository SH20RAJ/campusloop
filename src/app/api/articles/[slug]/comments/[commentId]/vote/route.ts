import { getDb } from "@/db";
import { articleComments, articleCommentVotes, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { and, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

interface RouteProps {
  params: Promise<{ slug: string; commentId: string }>;
}

export async function POST(req: NextRequest, { params }: RouteProps) {
  try {
    const { commentId } = await params;
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const comment = await db.query.articleComments.findFirst({
      where: eq(articleComments.id, commentId),
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const existingVote = await db.query.articleCommentVotes.findFirst({
      where: and(
        eq(articleCommentVotes.commentId, commentId),
        eq(articleCommentVotes.profileId, profile.id)
      ),
    });

    let newVote = 0;
    if (!existingVote) {
      await db.insert(articleCommentVotes).values({
        id: crypto.randomUUID(),
        commentId,
        profileId: profile.id,
        value: 1,
      });
      await db
        .update(articleComments)
        .set({ upvotesCount: sql`${articleComments.upvotesCount} + 1` })
        .where(eq(articleComments.id, commentId));
      newVote = 1;
    } else {
      // Toggle off
      await db
        .delete(articleCommentVotes)
        .where(
          and(
            eq(articleCommentVotes.commentId, commentId),
            eq(articleCommentVotes.profileId, profile.id)
          )
        );
      await db
        .update(articleComments)
        .set({ upvotesCount: sql`GREATEST(0, ${articleComments.upvotesCount} - 1)` })
        .where(eq(articleComments.id, commentId));
      newVote = 0;
    }

    const updated = await db.query.articleComments.findFirst({
      where: eq(articleComments.id, commentId),
    });

    return NextResponse.json({
      userVote: newVote,
      upvotesCount: updated?.upvotesCount || 0,
    });
  } catch (error) {
    console.error("POST article comment vote error:", error);
    return NextResponse.json({ error: "Failed to vote on comment" }, { status: 500 });
  }
}
