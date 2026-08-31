import { and, count, desc, eq, ilike, ne, or, type SQL, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { institutions } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const state = searchParams.get("state");
    const category = searchParams.get("category");
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 12;
    const offset = (page - 1) * limit;

    const conditions: (SQL | undefined)[] = [ne(institutions.slug, "viewer-hub")];

    if (q.trim()) {
      const searchPattern = `%${q.trim()}%`;
      const searchCond = or(
        ilike(institutions.name, searchPattern),
        ilike(institutions.state, searchPattern),
        ilike(institutions.district, searchPattern),
        ilike(institutions.slug, searchPattern)
      );
      if (searchCond) conditions.push(searchCond);
    }

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
      } else if (category === "TRENDING") {
        conditions.push(
          or(
            eq(institutions.slug, "bitmesra"),
            ilike(institutions.name, "%indian institute of technology%"),
            ilike(institutions.name, "%national institute of technology%"),
            ilike(institutions.name, "%birla institute of technology%"),
            sql`${institutions.nirfRank} is not null`
          )
        );
      }
    }

    const validConditions = conditions.filter((c): c is SQL => Boolean(c));
    const whereClause = validConditions.length > 0 ? and(...validConditions) : undefined;

    // Get total matching institutions count for accurate pagination
    const [countResult] = await db.select({ total: count() }).from(institutions).where(whereClause);
    const total = Number(countResult?.total ?? 0);

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
      logoUrl: college.logoUrl,
      bannerUrl: college.bannerUrl,
      nirfRank: college.nirfRank,
      description: college.description,
      postCount: 0,
    }));

    const totalPages = Math.ceil(total / limit) || 1;

    return NextResponse.json({
      colleges: enriched,
      page,
      limit,
      total,
      totalPages,
      hasMore: offset + enriched.length < total,
    });
  } catch (error) {
    console.error("Failed to fetch colleges:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Institutions are referenced by every profile, so only signed-in
    // students may add one — this used to accept anonymous writes.
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const body = (await request.json().catch(() => ({}))) as {
      name?: string;
      state?: string;
      district?: string;
      website?: string;
    };
    const { name, state, district, website } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "College name is required" }, { status: 400 });
    }

    const cleanName = name.trim().slice(0, 160);
    if (cleanName.length < 3) {
      return NextResponse.json({ error: "College name is too short" }, { status: 400 });
    }
    const slug = cleanName
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);

    // Return the existing hub instead of creating a near-duplicate
    const existing = await db.query.institutions.findFirst({
      where: eq(institutions.slug, slug),
    });
    if (existing) {
      return NextResponse.json(existing);
    }

    const aisheCode = `CUSTOM_${Date.now().toString().slice(-8)}`;

    const [newCollege] = await db
      .insert(institutions)
      .values({
        aisheCode,
        name: cleanName,
        slug,
        state: state?.trim().slice(0, 80) || "India",
        district: district?.trim().slice(0, 80) || null,
        website: website?.trim().slice(0, 200) || null,
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
