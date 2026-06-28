import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { userProfiles, swipes } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { eq, and, ne, notInArray } from "drizzle-orm";

export async function GET(req: Request) {
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

    // Find all target IDs the user has swiped on
    const swiped = await db
      .select({ id: swipes.targetId })
      .from(swipes)
      .where(eq(swipes.swiperId, profile.id));

    const swipedIds = swiped.map(s => s.id);

    // Fetch other students at the same college who have not been swiped yet
    const candidates = await db.query.userProfiles.findMany({
      where: and(
        eq(userProfiles.institutionId, profile.institutionId),
        ne(userProfiles.id, profile.id), // Exclude self
        swipedIds.length > 0 ? notInArray(userProfiles.id, swipedIds) : undefined
      ),
      limit: 20,
    });

    return NextResponse.json(candidates);
  } catch (error) {
    console.error("Error fetching dating candidates:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
