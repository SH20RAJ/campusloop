import { eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { institutions, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
      columns: {
        id: true,
        targetInstitutionIds: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const targetIds = (profile.targetInstitutionIds as string[]) || [];
    if (targetIds.length === 0) {
      return NextResponse.json({ dreamCampuses: [] });
    }

    const dreamCampuses = await db.query.institutions.findMany({
      where: inArray(institutions.id, targetIds),
      columns: {
        id: true,
        name: true,
        slug: true,
        state: true,
        district: true,
        logoUrl: true,
        bannerUrl: true,
        nirfRank: true,
      },
    });

    return NextResponse.json({ dreamCampuses });
  } catch (error) {
    console.error("GET /api/profile/dream-campuses error:", error);
    return NextResponse.json({ error: "Failed to fetch dream campuses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      institutionIds?: string[];
    };

    const rawIds = body.institutionIds || [];
    const sanitizedIds = rawIds
      .filter((id): id is string => typeof id === "string" && id.trim().length > 0)
      .slice(0, 5); // Max 5 dream colleges

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
      columns: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    await db
      .update(userProfiles)
      .set({
        targetInstitutionIds: sanitizedIds,
      })
      .where(eq(userProfiles.id, profile.id));

    return NextResponse.json({
      success: true,
      dreamCampusesCount: sanitizedIds.length,
      targetInstitutionIds: sanitizedIds,
    });
  } catch (error) {
    console.error("POST /api/profile/dream-campuses error:", error);
    return NextResponse.json({ error: "Failed to save dream campuses" }, { status: 500 });
  }
}
