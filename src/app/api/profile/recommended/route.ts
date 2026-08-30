import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { getRecommendedUsers } from "@/lib/recommendations/recommended-users";
import { rejectViewerWrite } from "@/lib/viewer";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const viewerBlocked = await rejectViewerWrite(profile);
    if (viewerBlocked) return viewerBlocked;

    const { searchParams } = new URL(req.url);
    const scope = (searchParams.get("scope") as "CAMPUS" | "GLOBAL") || "GLOBAL";
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "6", 10), 12);

    const users = await getRecommendedUsers(profile.id, {
      limit,
      scope,
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching recommended users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
