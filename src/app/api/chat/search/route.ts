import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { eq, and, ilike, ne, or } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json([]);
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    // Search users in the same institution matching display name or username
    const matches = await db.query.userProfiles.findMany({
      where: and(
        eq(userProfiles.institutionId, profile.institutionId),
        ne(userProfiles.id, profile.id), // Exclude self
        or(
          ilike(userProfiles.displayName, `%${query}%`),
          ilike(userProfiles.username, `%${query}%`)
        )
      ),
      limit: 10,
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error("Error searching users for chat:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
