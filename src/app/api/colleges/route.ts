import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { institutions } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 10;

    const list = await db.query.institutions.findMany({
      orderBy: [desc(institutions.createdAt)],
      limit,
      with: {
        posts: true,
      },
    });

    const enriched = list.map((college) => ({
      id: college.id,
      name: college.name,
      state: college.state,
      district: college.district,
      postCount: college.posts?.length || 0,
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Failed to fetch colleges:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
