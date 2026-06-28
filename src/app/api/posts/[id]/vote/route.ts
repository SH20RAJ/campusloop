import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { votes, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { eq, and } from "drizzle-orm";

interface RouteParams {
  params: { id: string };
}

export async function POST(req: Request, { params }: RouteParams) {
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

    const { value } = (await req.json()) as { value: number };

    if (value !== 1 && value !== -1 && value !== 0) {
      return NextResponse.json({ error: "Invalid vote value" }, { status: 400 });
    }

    // Check if vote already exists
    const existingVote = await db.query.votes.findFirst({
      where: and(
        eq(votes.postId, params.id),
        eq(votes.userId, profile.id)
      )
    });

    if (existingVote) {
      if (value === 0 || existingVote.value === value) {
        // Delete vote if same value or 0
        await db.delete(votes).where(eq(votes.id, existingVote.id));
        return NextResponse.json({ message: "Vote removed", userVote: 0 });
      } else {
        // Update vote value
        await db.update(votes).set({ value }).where(eq(votes.id, existingVote.id));
        return NextResponse.json({ message: "Vote updated", userVote: value });
      }
    } else {
      if (value !== 0) {
        // Insert new vote
        await db.insert(votes).values({
          postId: params.id,
          userId: profile.id,
          value,
        });
        return NextResponse.json({ message: "Vote cast", userVote: value });
      }
    }

    return NextResponse.json({ userVote: 0 });
  } catch (error) {
    console.error("Error casting vote:", error);
    return NextResponse.json({ error: "Failed to cast vote" }, { status: 500 });
  }
}
