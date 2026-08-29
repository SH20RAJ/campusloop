import { getDb } from "@/db";
import { marketplaceCategories } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    const categories = await db.query.marketplaceCategories.findMany({
      where: eq(marketplaceCategories.isActive, true),
      orderBy: [asc(marketplaceCategories.displayOrder)],
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching marketplace categories:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
