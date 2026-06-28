import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { institutions } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const db = getDb();
    const list = await db.query.institutions.findMany({
      orderBy: [desc(institutions.createdAt)],
      limit: 10,
    });
    return NextResponse.json(list);
  } catch (error) {
    console.error("Failed to fetch colleges:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
