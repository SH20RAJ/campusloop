import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { userProfiles, swipes } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { eq, and, ne, notInArray, type SQL } from "drizzle-orm";

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
      with: {
        institution: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Strict Gate: Must have gender set to access dating
    const validGenders = ["MALE", "FEMALE", "OTHER"];
    if (!profile.gender || !validGenders.includes(profile.gender)) {
      return NextResponse.json(
        {
          error: "GENDER_REQUIRED",
          message: "Gender is required to access Campus Dating and matching.",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const genderFilter = searchParams.get("gender") || "ALL"; // MALE, FEMALE, ALL
    const collegeFilter = searchParams.get("scope") || searchParams.get("college") || "GLOBAL"; // CAMPUS, GLOBAL
    const targetInstitutionId = searchParams.get("collegeId") || searchParams.get("targetInstitutionId"); // specific college id
    const sort = searchParams.get("sort") || "COMPATIBILITY"; // COMPATIBILITY, RECENT, POPULAR

    // Find all target IDs the user has already swiped on
    const swiped = await db
      .select({ id: swipes.targetId })
      .from(swipes)
      .where(eq(swipes.swiperId, profile.id));

    const swipedIds = swiped.map((s) => s.id);

    // Build conditions
    const conditions: (SQL | undefined)[] = [
      ne(userProfiles.id, profile.id), // Exclude self
      eq(userProfiles.status, "ACTIVE"), // Only active students
      swipedIds.length > 0 ? notInArray(userProfiles.id, swipedIds) : undefined,
    ];

    if (collegeFilter === "CAMPUS" && profile.institutionId) {
      conditions.push(eq(userProfiles.institutionId, profile.institutionId));
    } else if (targetInstitutionId && targetInstitutionId !== "ALL") {
      conditions.push(eq(userProfiles.institutionId, targetInstitutionId));
    }

    if (genderFilter === "MALE" || genderFilter === "FEMALE") {
      conditions.push(eq(userProfiles.gender, genderFilter));
    }

    const rawCandidates = await db.query.userProfiles.findMany({
      where: and(...conditions.filter((c): c is SQL => c !== undefined)),
      limit: 50,
      with: {
        institution: true,
      },
    });

    // Score and rank candidates intelligently
    const scoredCandidates = rawCandidates.map((cand) => {
      let score = 70; // baseline compatibility

      // Same college bonus
      if (cand.institutionId && profile.institutionId && cand.institutionId === profile.institutionId) {
        score += 20;
      } else if (cand.institution?.state && profile.institution?.state && cand.institution.state === profile.institution.state) {
        score += 10;
      }

      // Profile completeness bonus (multiple photos give extra vibe points!)
      const candPhotos = cand.photos && cand.photos.length > 0 ? cand.photos : (cand.avatarUrl ? [cand.avatarUrl] : []);
      if (candPhotos.length >= 2) score += 5;
      if (cand.bio && cand.bio.length > 10) score += 5;
      if (cand.avatarUrl) score += 5;

      // Activity / LP points bonus
      if (cand.points > 100) score += 5;

      // Cap at 99%
      score = Math.min(score, 99);

      return {
        ...cand,
        photos: candPhotos,
        compatibilityScore: score,
      };
    });

    // Apply sorting
    if (sort === "RECENT") {
      scoredCandidates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === "POPULAR") {
      scoredCandidates.sort((a, b) => (b.points || 0) - (a.points || 0));
    } else {
      // COMPATIBILITY (default)
      scoredCandidates.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    }

    return NextResponse.json(scoredCandidates.slice(0, 20));
  } catch (error) {
    console.error("Error fetching dating candidates:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
