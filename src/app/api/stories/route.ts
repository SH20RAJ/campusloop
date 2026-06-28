import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { desc } from "drizzle-orm";
import { userProfiles } from "@/db/schema";

export async function GET(req: Request) {
  const db = getDb();
  
  try {
    const users = await db.query.userProfiles.findMany({
      orderBy: [desc(userProfiles.createdAt)],
      limit: 10,
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching stories:", error);
    return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 });
  }
}
