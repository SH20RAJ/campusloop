import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { getViewerInstitutionId } from "@/lib/viewer";
import { and,desc,eq,ne,sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await hexclaveServerApp.getUser();
    const db = getDb();

    let currentProfile = null;
    if (user) {
      currentProfile = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, user.id),
        with: { institution: true },
      });
    }

    const viewerInstitutionId = await getViewerInstitutionId();
    const conditions = [
      eq(userProfiles.status, "ACTIVE"),
      eq(userProfiles.onboardingCompleted, true),
      ne(userProfiles.institutionId, viewerInstitutionId),
    ];

    if (currentProfile) {
      conditions.push(ne(userProfiles.id, currentProfile.id));
    }

    // Fetch candidate pool from home campus and India
    const candidatePool = await db.query.userProfiles.findMany({
      where: and(...conditions),
      orderBy: [desc(userProfiles.points), sql`random()`],
      limit: 35,
      with: {
        institution: true,
      },
    });

    const myInterests = new Set((currentProfile?.interests ?? []).map((i) => i.toLowerCase().trim()));

    // Score candidates using SimCluster & campus affinity model
    const scored = candidatePool.map((cand) => {
      let score = 0;

      // 1. Same Campus Boost (+30 pts)
      if (currentProfile?.institutionId && cand.institutionId === currentProfile.institutionId) {
        score += 30;
      }

      // 2. Same Academic Course / Branch (+15 pts)
      if (currentProfile?.course && cand.course && currentProfile.course.toLowerCase() === cand.course.toLowerCase()) {
        score += 10;
      }
      if (currentProfile?.branch && cand.branch && currentProfile.branch.toLowerCase() === cand.branch.toLowerCase()) {
        score += 8;
      }

      // 3. Shared Interest Affinity (Jaccard-like overlap: +12 pts per shared interest)
      const candInterests = cand.interests ?? [];
      let sharedCount = 0;
      for (const ci of candInterests) {
        if (myInterests.has(ci.toLowerCase().trim())) {
          sharedCount++;
        }
      }
      score += Math.min(sharedCount * 12, 36);

      // 4. Activity & Reputation Factor (up to 15 pts)
      score += Math.min((cand.points || 0) * 0.1, 15);

      // 5. Stochastic Jitter for non-stagnant exploration
      score += Math.random() * 10;

      return {
        profile: cand,
        score,
        sharedInterestsCount: sharedCount,
      };
    });

    // Sort by final affinity score descending
    scored.sort((a, b) => b.score - a.score);

    const result = scored.slice(0, 5).map((s) => s.profile);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching suggested profiles:", error);
    return NextResponse.json({ error: "Failed to fetch suggested profiles" }, { status: 500 });
  }
}
