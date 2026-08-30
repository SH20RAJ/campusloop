import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { getTrendingHashtags } from "@/lib/trending-hashtags";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const limit = Math.min(Number(searchParams.get("limit")) || 12, 30);

    let viewerCampusId: string | null = null;

    try {
      const user = await hexclaveServerApp.getUser();
      if (user) {
        const db = getDb();
        const profile = await db.query.userProfiles.findFirst({
          where: eq(userProfiles.userId, user.id),
          columns: { institutionId: true },
        });
        if (profile) {
          viewerCampusId = profile.institutionId;
        }
      }
    } catch {
      // Unauthenticated viewer
    }

    const trending = await getTrendingHashtags({
      query: q,
      campusId: viewerCampusId,
      limit,
    });

    return NextResponse.json({ trending });
  } catch (error) {
    console.error("Trending hashtags API error:", error);
    return NextResponse.json({ trending: [] });
  }
}
