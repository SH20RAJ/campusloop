import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { communities } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDb();
    const allCommunities = await db.query.communities.findMany({
      orderBy: [desc(communities.createdAt)],
      with: {
        members: true,
        creator: {
          columns: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });

    return NextResponse.json(allCommunities);
  } catch (error) {
    console.error("Error fetching communities API:", error);
    return NextResponse.json([], { status: 200 });
  }
}
