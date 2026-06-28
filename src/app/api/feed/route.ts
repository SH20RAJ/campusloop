import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { desc } from "drizzle-orm";
import { posts } from "@/db/schema";

export async function GET(req: Request) {
  const db = getDb();
  
  try {
    const feed = await db.query.posts.findMany({
      orderBy: [desc(posts.createdAt)],
      limit: 20,
      with: {
        author: true,
        institution: true,
      }
    });

    return NextResponse.json(feed);
  } catch (error) {
    console.error("Error fetching feed:", error);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}
