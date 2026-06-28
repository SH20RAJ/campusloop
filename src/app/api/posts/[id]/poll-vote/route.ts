import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { pollVotes, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { eq, and } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    const { optionId } = (await req.json()) as { optionId: string };

    if (!optionId) {
      return NextResponse.json({ error: "Missing optionId" }, { status: 400 });
    }

    // Check if user has already voted on this poll/post
    const existingVote = await db.query.pollVotes.findFirst({
      where: and(
        eq(pollVotes.postId, id),
        eq(pollVotes.userId, profile.id)
      )
    });

    if (existingVote) {
      return NextResponse.json({ error: "You have already voted on this poll" }, { status: 400 });
    }

    // Insert vote
    const [newVote] = await db.insert(pollVotes).values({
      postId: id,
      optionId,
      userId: profile.id,
    }).returning();

    return NextResponse.json(newVote, { status: 201 });
  } catch (error) {
    console.error("Error casting poll vote:", error);
    return NextResponse.json({ error: "Failed to cast vote" }, { status: 500 });
  }
}
