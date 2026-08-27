import { getDb } from "@/db";
import { posts,userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { desc,eq,ilike,or } from "drizzle-orm";
import { NextResponse } from "next/server";

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
        ? or(
            ilike(userProfiles.username, `%${q}%`),
            ilike(userProfiles.displayName, `%${q}%`)
          )
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
      const recentPosts = await db.query.posts.findMany({
        where: eq(posts.status, "PUBLISHED"),
        orderBy: [desc(posts.createdAt)],
        limit: 80,
      });

      const tagMap = new Map<string, number>();

      for (const p of recentPosts) {
        const matches = (p.body || "").match(/#([a-zA-Z0-9_\u0900-\u097F]+)/g);
        if (matches) {
          for (const rawTag of matches) {
            const clean = rawTag.toLowerCase();
            tagMap.set(clean, (tagMap.get(clean) || 0) + 1);
          }
        }
      }

      // Default campus tags if few exist
      const defaultCampusTags = [
        { tag: "#EndSemExams", count: 28 },
        { tag: "#PlacementSeason", count: 24 },
        { tag: "#SecretCrushVault", count: 18 },
        { tag: "#HostelLife", count: 15 },
        { tag: "#CanteenGossip", count: 12 },
        { tag: "#LateNightTea", count: 10 },
        { tag: "#TechFest2026", count: 9 },
      ];

      for (const def of defaultCampusTags) {
        const clean = def.tag.toLowerCase();
        if (!tagMap.has(clean)) {
          tagMap.set(clean, def.count);
        }
      }

      const qLower = q.toLowerCase().replace(/^#/, "");
      matchingHashtags = Array.from(tagMap.entries())
        .filter(([t]) => !qLower || t.includes(qLower))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([rawTag, count]) => {
          // Format tag nicely
          const formatted = rawTag.startsWith("#") ? rawTag : `#${rawTag}`;
          return {
            tag: formatted,
            count,
            formattedCount: count >= 1000 ? `${(count / 1000).toFixed(1)}K posts` : `${count} posts`,
          };
        });
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
