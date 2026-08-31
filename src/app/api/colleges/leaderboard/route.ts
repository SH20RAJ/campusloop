import { and, desc, eq, ilike, ne, or, type SQL, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { institutions, posts, userProfiles } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state");
    const category = searchParams.get("category");
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);

    const conditions: (SQL | undefined)[] = [ne(institutions.slug, "viewer-hub")];

    if (state && state !== "ALL") {
      conditions.push(eq(institutions.state, state));
    }

    if (category && category !== "ALL") {
      if (category === "IIT_NIT") {
        conditions.push(
          or(
            ilike(institutions.name, "%indian institute of technology%"),
            ilike(institutions.name, "%national institute of technology%"),
            ilike(institutions.name, "%iit %"),
            ilike(institutions.name, "%nit %")
          )
        );
      } else if (category === "NIRF") {
        conditions.push(sql`${institutions.nirfRank} is not null`);
      } else if (category === "CENTRAL") {
        conditions.push(
          or(ilike(institutions.name, "%university%"), ilike(institutions.name, "%institute of technology%"))
        );
      }
    }

    const validConditions = conditions.filter((c): c is SQL => Boolean(c));
    const whereClause = validConditions.length > 0 ? and(...validConditions) : undefined;

    const rankingScore = sql`count(distinct ${userProfiles.id}) * 120 + count(distinct ${posts.id}) * 45 + (case when ${institutions.nirfRank} is not null then (101 - least(${institutions.nirfRank}, 100)) * 10 else 0 end)`;

    const rows = await db
      .select({
        id: institutions.id,
        name: institutions.name,
        slug: institutions.slug,
        state: institutions.state,
        district: institutions.district,
        website: institutions.website,
        logoUrl: institutions.logoUrl,
        bannerUrl: institutions.bannerUrl,
        nirfRank: institutions.nirfRank,
        yearOfEstablishment: institutions.yearOfEstablishment,
        studentCount: sql<number>`count(distinct ${userProfiles.id})::int`,
        postCount: sql<number>`count(distinct ${posts.id})::int`,
        score: sql<number>`${rankingScore}::int`,
      })
      .from(institutions)
      .leftJoin(userProfiles, eq(userProfiles.institutionId, institutions.id))
      .leftJoin(posts, eq(posts.institutionId, institutions.id))
      .where(whereClause)
      .groupBy(institutions.id)
      .orderBy(desc(rankingScore))
      .limit(limit);

    const enriched = rows.map((col, index) => {
      // Base points calculation
      const calculatedPoints = Math.round(
        (col.studentCount || 0) * 120 +
          (col.postCount || 0) * 45 +
          (col.nirfRank ? Math.max(1, 101 - col.nirfRank) * 15 : 0) +
          (index === 0 ? 3200 : index === 1 ? 1800 : index === 2 ? 1100 : 500)
      );

      return {
        rank: index + 1,
        id: col.id,
        slug: col.slug,
        name: col.name,
        state: col.state,
        district: col.district,
        website: col.website,
        logoUrl: col.logoUrl,
        bannerUrl: col.bannerUrl,
        nirfRank: col.nirfRank,
        yearOfEstablishment: col.yearOfEstablishment,
        studentCount: col.studentCount || 0,
        postCount: col.postCount || 0,
        points: calculatedPoints,
      };
    });

    return NextResponse.json({
      leaderboard: enriched,
      count: enriched.length,
    });
  } catch (error) {
    console.error("Failed to fetch college leaderboard:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
