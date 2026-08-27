import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { FOLLOW_LIST_PAGE_SIZE,FollowDirection,getFollowListPage } from "@/lib/follows";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

/**
 * Shared handler for GET /api/profile/[username]/followers and .../following.
 * Both routes only differ by which side of the follow edge they walk.
 */
export async function getFollowListResponse(
  request: Request,
  username: string,
  direction: FollowDirection,
) {
  try {
    const db = getDb();
    const target = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.username, username),
      columns: { id: true, status: true },
    });

    if (!target || target.status !== "ACTIVE") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = await hexclaveServerApp.getUser();
    let viewerId: string | null = null;
    if (user) {
      const viewer = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, user.id),
        columns: { id: true },
      });
      viewerId = viewer?.id ?? null;
    }

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor") || null;
    const limit = Number(searchParams.get("limit")) || FOLLOW_LIST_PAGE_SIZE;

    const page = await getFollowListPage({
      profileId: target.id,
      direction,
      viewerId,
      cursor,
      limit,
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error(`GET /api/profile/[username]/${direction} error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
