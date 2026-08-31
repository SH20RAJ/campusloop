import { and, desc, eq, gte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { events, institutions, marketplaceItems, posts } from "@/db/schema";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ institutionId: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { institutionId } = await params;
    if (!institutionId) {
      return NextResponse.json({ error: "Institution ID is required" }, { status: 400 });
    }

    const cacheKey = `campus_pulse_share:${institutionId}`;
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

    const db = getDb();
    const institution = await db.query.institutions.findFirst({
      where: eq(institutions.id, institutionId),
    });

    if (!institution) {
      return NextResponse.json({ error: "Institution not found" }, { status: 404 });
    }

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const publicPosts = await db.query.posts.findMany({
      where: and(
        eq(posts.institutionId, institutionId),
        eq(posts.status, "PUBLISHED"),
        eq(posts.isAnonymous, false),
        gte(posts.createdAt, oneDayAgo)
      ),
      orderBy: [desc(posts.createdAt)],
      limit: 15,
      columns: {
        id: true,
        title: true,
        type: true,
      },
    });

    const upcomingEvents = await db.query.events.findMany({
      where: and(eq(events.institutionId, institutionId), eq(events.status, "UPCOMING")),
      limit: 3,
      columns: {
        id: true,
        title: true,
        location: true,
        startDate: true,
      },
    });

    const activeListings = await db.query.marketplaceItems.findMany({
      where: and(eq(marketplaceItems.institutionId, institutionId), eq(marketplaceItems.status, "ACTIVE")),
      limit: 5,
      columns: {
        id: true,
        title: true,
        price: true,
        category: true,
      },
    });

    const shareData = {
      institution: {
        id: institution.id,
        name: institution.name,
        shortName: institution.shortName || institution.name,
        city: institution.city,
        state: institution.state,
      },
      stats: {
        discussionsToday: publicPosts.length,
        upcomingEvents: upcomingEvents.length,
        activeMarketplace: activeListings.length,
      },
      events: upcomingEvents,
      marketplace: activeListings,
      shareUrl: `https://campusloop.space/college/${institution.id}`,
    };

    if (redis) {
      try {
        await redis.set(cacheKey, JSON.stringify(shareData), { ex: 600 }); // 10 min cache
      } catch {
        // Cache safe
      }
    }

    return NextResponse.json(shareData);
  } catch (error) {
    console.error("Public Campus Pulse Share Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
