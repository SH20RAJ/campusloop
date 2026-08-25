import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { eq, sql, type SQL } from "drizzle-orm";
import { posts, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { formatApiFeedPosts, normalizeApiFeedSort, resolveFeedPage } from "@/lib/feed";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await hexclaveServerApp.getUser();

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope") as "CAMPUS" | "GLOBAL" | null;
    const type = searchParams.get("type");
    const sort = normalizeApiFeedSort(searchParams.get("sort"));
    const visibility = searchParams.get("visibility");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(Math.max(1, Number(searchParams.get("limit")) || 20), 50);
    const offset = (page - 1) * limit;
    const hashtag = searchParams.get("hashtag");

    const db = getDb();

    let profileId: string | null = null;
    let institutionId: string | null = null;

    if (user) {
      const profile = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, user.id),
      });
      if (profile) {
        profileId = profile.id;
        institutionId = profile.institutionId;
      }
    }

    const conditions: SQL[] = [eq(posts.status, "PUBLISHED")];

    if (scope === "CAMPUS" && institutionId) {
      conditions.push(eq(posts.institutionId, institutionId));
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

    const authorId = searchParams.get("authorId");
    const authorUsername = searchParams.get("authorUsername");
    const seenIdsParam = searchParams.get("seenIds");
    const seenIds = seenIdsParam ? seenIdsParam.split(",").map((s) => s.trim()).filter(Boolean) : undefined;

    if (authorId) {
      conditions.push(eq(posts.authorId, authorId));
    } else if (authorUsername) {
      const targetUser = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.username, authorUsername.toLowerCase().trim()),
      });
      if (targetUser) {
        conditions.push(eq(posts.authorId, targetUser.id));
      }
    }

    const rawFeed = await resolveFeedPage({
      conditions,
      sort,
      limit,
      offset,
      userInstitutionId: institutionId,
      seenIds,
      viewerProfileId: profileId,
    });
    const feed = await formatApiFeedPosts(rawFeed, profileId);

    return NextResponse.json(feed);
  } catch (error) {
    console.error("Error fetching feed:", error);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}
