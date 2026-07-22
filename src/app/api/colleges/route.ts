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

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = (await request.json()) as {
      name?: string;
      state?: string;
      district?: string;
      website?: string;
    };
    const { name, state, district, website } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "College name is required" }, { status: 400 });
    }

    const cleanName = name.trim();
    const slug = cleanName
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);

    const aisheCode = `CUSTOM_${Date.now().toString().slice(-8)}`;

    const [newCollege] = await db
      .insert(institutions)
      .values({
        aisheCode,
        name: cleanName,
        slug,
        state: state?.trim() || "India",
        district: district?.trim() || null,
        website: website?.trim() || null,
        country: "India",
        source: "user_added",
      })
      .returning();

    return NextResponse.json(newCollege);
  } catch (error) {
    console.error("Failed to add college:", error);
    return NextResponse.json({ error: "Failed to add college" }, { status: 500 });
  }
}

