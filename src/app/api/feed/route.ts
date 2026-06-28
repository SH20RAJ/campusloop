import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { desc, eq, and } from "drizzle-orm";
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
    const type = searchParams.get("type") as "NORMAL" | "CONFESSION" | "POLL" | "QUESTION" | null;

    const db = getDb();
    
    // Get user's profile to know their institution
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    // Build conditions
    const conditions = [];
    if (scope === "CAMPUS") {
      conditions.push(eq(posts.institutionId, profile.institutionId));
    }
    if (type) {
      conditions.push(eq(posts.type, type));
    }

    const rawFeed = await db.query.posts.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(posts.createdAt)],
      limit: 20,
      with: {
        author: true,
        institution: true,
        votes: true,
        comments: {
          where: eq(posts.status, "PUBLISHED") // Assumes comments status check if needed
        },
      }
    });

    // Map to include counts and user's vote state
    const feed = rawFeed.map(post => {
      const votesCount = post.votes.reduce((acc, vote) => acc + vote.value, 0);
      const commentsCount = post.comments.length;
      const userVoteObj = post.votes.find(v => v.userId === profile.id);
      const userVote = userVoteObj ? userVoteObj.value : 0;

      return {
        ...post,
        votesCount,
        commentsCount,
        userVote,
        // Omit raw array elements to keep payload light
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
