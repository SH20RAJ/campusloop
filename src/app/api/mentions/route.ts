import { desc, eq, ilike, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { getTrendingHashtags } from "@/lib/trending-hashtags";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const type = searchParams.get("type") || "all";

    const db = getDb();
    let viewerInstitutionId: string | null = null;

    try {
      const user = await hexclaveServerApp.getUser();
      if (user) {
        const profile = await db.query.userProfiles.findFirst({
          where: eq(userProfiles.userId, user.id),
        });
        if (profile) {
          viewerInstitutionId = profile.institutionId;
        }
      }
    } catch {
      // Unauthenticated / guest viewer
    }

    let matchingUsers: any[] = [];
    let matchingHashtags: any[] = [];

    // 1. Mentions (@users)
    if (type === "users" || type === "all") {
      const userCondition = q
        ? or(ilike(userProfiles.username, `%${q}%`), ilike(userProfiles.displayName, `%${q}%`))
        : undefined;

      const rawUsers = await db.query.userProfiles.findMany({
        where: userCondition,
        limit: 8,
        orderBy: [desc(userProfiles.points), desc(userProfiles.createdAt)],
        with: {
          institution: true,
        },
      });

      // Sort prioritizing viewer's campus
      matchingUsers = rawUsers
        .sort((a, b) => {
          const aSame = a.institutionId === viewerInstitutionId ? 1 : 0;
          const bSame = b.institutionId === viewerInstitutionId ? 1 : 0;
          return bSame - aSame;
        })
        .slice(0, 6)
        .map((u) => ({
          id: u.id,
          username: u.username,
          displayName: u.displayName,
          avatarUrl: u.avatarUrl,
          points: u.points || 0,
          isVerified: (u.points || 0) >= 150,
          institutionName: u.institution?.name?.split(",")[0] || null,
          branch: u.branch || null,
        }));
    }

    // 2. Hashtags (#tags)
    if (type === "hashtags" || type === "all") {
      const trending = await getTrendingHashtags({
        query: q,
        campusId: viewerInstitutionId,
        limit: 8,
      });

      matchingHashtags = trending.map((t) => ({
        tag: t.tag,
        count: t.count,
        formattedCount: t.formattedCount,
        category: t.category,
        isHot: t.isHot,
      }));
    }

    return NextResponse.json({
      users: matchingUsers,
      hashtags: matchingHashtags,
    });
  } catch (error) {
    console.error("Mentions API error:", error);
    return NextResponse.json({ users: [], hashtags: [] });
  }
}
