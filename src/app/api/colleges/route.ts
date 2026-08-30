import { getDb } from "@/db";
import { institutions } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { and,desc,eq,ilike,ne,or } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const state = searchParams.get("state");
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 12;
    const offset = (page - 1) * limit;

    const conditions = [ne(institutions.slug, "viewer-hub")];

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
      logoUrl: college.logoUrl,
      bannerUrl: college.bannerUrl,
      nirfRank: college.nirfRank,
      description: college.description,
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

    if (!name || !name.trim()) {
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

