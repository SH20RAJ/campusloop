import { and, desc, eq, gte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { events, institutions, marketplaceItems, posts, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    let user = null;
    try {
      user = await hexclaveServerApp.getUser();
    } catch {
      // Unauthenticated
    }

    const { searchParams } = new URL(req.url);
    const requestedInstId = searchParams.get("institutionId");

    const db = getDb();
    let institutionId = requestedInstId;

    if (!institutionId && user) {
      const profile = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, user.id),
      });
      institutionId = profile?.institutionId || null;
    }

    if (!institutionId) {
      return NextResponse.json({ error: "Institution required" }, { status: 400 });
    }

    const cacheKey = `campus_pulse:${institutionId}`;
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return NextResponse.json(typeof cached === "string" ? JSON.parse(cached) : cached);
        }
      } catch {
        // Fallback
      }
    }

    // Load institution details
    const institution = await db.query.institutions.findFirst({
      where: eq(institutions.id, institutionId),
    });

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Fetch public posts from the last 24h
    const recentPosts = await db.query.posts.findMany({
      where: and(
        eq(posts.institutionId, institutionId),
        eq(posts.status, "PUBLISHED"),
        gte(posts.createdAt, oneDayAgo)
      ),
      orderBy: [desc(posts.createdAt)],
      limit: 30,
      columns: {
        id: true,
        title: true,
        body: true,
        type: true,
      },
    });

    // Trending hashtags
    const tagCounts: Record<string, number> = {};
    for (const p of recentPosts) {
      const tags = p.body.match(/#[a-zA-Z0-9_]+/g);
      if (tags) {
        for (const t of tags) {
          const lower = t.toLowerCase();
          tagCounts[lower] = (tagCounts[lower] || 0) + 1;
        }
      }
    }
    const trendingTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));

    // Upcoming events count
    const upcomingEventsCount = await db.query.events.findMany({
      where: and(eq(events.institutionId, institutionId), eq(events.status, "UPCOMING")),
      limit: 5,
    });

    // Recent marketplace count
    const activeMarketplace = await db.query.marketplaceItems.findMany({
      where: and(eq(marketplaceItems.institutionId, institutionId), eq(marketplaceItems.isSold, false)),
      limit: 5,
    });

    const pulseData = {
      institution: {
        id: institution?.id,
        name: institution?.name || "Campus",
        shortName: institution?.slug || institution?.name || "Campus",
      },
      updatedAt: new Date().toISOString(),
      trendingTopics: trendingTags,
      recentDiscussionsCount: recentPosts.length,
      upcomingEventsCount: upcomingEventsCount.length,
      newMarketplaceListingsCount: activeMarketplace.length,
      highlights: recentPosts.slice(0, 3).map((p) => ({
        id: p.id,
        excerpt: p.title || p.body.slice(0, 80),
        type: p.type,
      })),
    };

    if (redis) {
      try {
        await redis.set(cacheKey, JSON.stringify(pulseData), { ex: 300 }); // Cache for 5 mins
      } catch {
        // Cache failure safe
      }
    }

    return NextResponse.json(pulseData);
  } catch (error) {
    console.error("Campus Pulse Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
