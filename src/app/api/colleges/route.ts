import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { institutions } from "@/db/schema";
import { desc, ilike, or, eq, and, sql } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const state = searchParams.get("state");
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 12;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (q.trim()) {
      const searchPattern = `%${q.trim()}%`;
      conditions.push(
        or(
          ilike(institutions.name, searchPattern),
          ilike(institutions.state, searchPattern),
          ilike(institutions.district, searchPattern),
          ilike(institutions.slug, searchPattern)
        )
      );
    }

    if (state && state !== "ALL") {
      conditions.push(eq(institutions.state, state));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const list = await db.query.institutions.findMany({
      where: whereClause,
      orderBy: [desc(institutions.createdAt)],
      limit,
      offset,
    });

    const enriched = list.map((college) => ({
      id: college.id,
      slug: college.slug,
      name: college.name,
      state: college.state,
      district: college.district,
      website: college.website,
      yearOfEstablishment: college.yearOfEstablishment,
      aisheCode: college.aisheCode,
      postCount: 0,
    }));

    return NextResponse.json({
      colleges: enriched,
      page,
      limit,
      hasMore: enriched.length === limit,
    });
  } catch (error) {
    console.error("Failed to fetch colleges:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
