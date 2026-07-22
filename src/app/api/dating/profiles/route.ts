import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { userProfiles, swipes } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { eq, and, ne, notInArray, SQL } from "drizzle-orm";

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
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const genderFilter = searchParams.get("gender") || "ALL"; // MALE, FEMALE, ALL
    const collegeFilter = searchParams.get("college") || "CAMPUS"; // CAMPUS, GLOBAL
    const targetInstitutionId = searchParams.get("targetInstitutionId"); // specific institution id

    // Find all target IDs the user has swiped on
    const swiped = await db
      .select({ id: swipes.targetId })
      .from(swipes)
      .where(eq(swipes.swiperId, profile.id));

    const swipedIds = swiped.map(s => s.id);

    const conditions: (SQL | undefined)[] = [
      ne(userProfiles.id, profile.id), // Exclude self
      swipedIds.length > 0 ? notInArray(userProfiles.id, swipedIds) : undefined
    ];

    if (collegeFilter === "CAMPUS") {
      conditions.push(eq(userProfiles.institutionId, profile.institutionId));
    } else if (targetInstitutionId && targetInstitutionId !== "ALL") {
      conditions.push(eq(userProfiles.institutionId, targetInstitutionId));
    }

    if (genderFilter === "MALE" || genderFilter === "FEMALE") {
      conditions.push(eq(userProfiles.gender, genderFilter));
    }

    const { sql } = await import("drizzle-orm");

    let candidates = await db.query.userProfiles.findMany({
      where: and(...conditions.filter(Boolean)),
      orderBy: [sql`random()`],
      limit: 20,
      with: {
        institution: true,
      }
    });

    // If candidate deck has fewer than 5 profiles, backfill with random active profiles excluding self and swiped
    if (candidates.length < 5) {
      const existingIds = new Set([profile.id, ...swipedIds, ...candidates.map(c => c.id)]);
      const extraCandidates = await db.query.userProfiles.findMany({
        orderBy: [sql`random()`],
        limit: 15,
        with: {
          institution: true,
        }
      });

      for (const extra of extraCandidates) {
        if (!existingIds.has(extra.id)) {
          candidates.push(extra);
          existingIds.add(extra.id);
        }
      }
    }

    return NextResponse.json(candidates);
  } catch (error) {
    console.error("Error fetching dating candidates:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
