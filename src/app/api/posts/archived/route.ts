import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { posts, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    const archivedPosts = await db.query.posts.findMany({
      where: and(eq(posts.authorId, profile.id), eq(posts.status, "ARCHIVED")),
      orderBy: [desc(posts.createdAt)],
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

    const formatted = archivedPosts.map((post) => ({
      ...post,
      votesCount: post.votes?.reduce((acc, v) => acc + v.value, 0) || 0,
      commentsCount: post.comments?.length || 0,
      userVote: 0,
      pollOptions: post.pollOptions?.map((o) => ({
        id: o.id,
        text: o.text,
        votesCount: o.votes?.length || 0,
        userVoted: false,
      })),
      totalPollVotes: post.pollOptions?.reduce((acc, o) => acc + (o.votes?.length || 0), 0) || 0,
      hasVotedPoll: false,
      votes: undefined,
      comments: undefined,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error fetching archived posts:", error);
    return NextResponse.json({ error: "Failed to fetch archived posts" }, { status: 500 });
  }
}
