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
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope") as "CAMPUS" | "GLOBAL" | null;
    const type = searchParams.get("type");
    const sort = normalizeApiFeedSort(searchParams.get("sort"));
    const visibility = searchParams.get("visibility");
    const page = Number(searchParams.get("page")) || 1;
    const limit = Math.min(Number(searchParams.get("limit")) || 12, 50);
    const offset = (page - 1) * limit;
    const hashtag = searchParams.get("hashtag");

    const db = getDb();

    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    const conditions: SQL[] = [eq(posts.status, "PUBLISHED")];
    if (scope === "CAMPUS" && profile.institutionId) {
      conditions.push(eq(posts.institutionId, profile.institutionId));
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

    const rawFeed = await resolveFeedPage({ conditions, sort, limit, offset });
    const feed = await formatApiFeedPosts(rawFeed, profile.id);

    return NextResponse.json(feed);
  } catch (error) {
    console.error("Error fetching feed:", error);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}
