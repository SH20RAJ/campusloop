import { and, eq, ne, notInArray, type SQL } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDatingCandidatePhotoSet } from "@/constants/dating-photos";
import { getDb } from "@/db";
import { swipes, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { computeCompatibility, resolveGenderPreference } from "@/lib/dating";
import { getViewerInstitutionId, rejectViewerWrite } from "@/lib/viewer";

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

    const viewerBlocked = await rejectViewerWrite(profile);
    if (viewerBlocked) return viewerBlocked;

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
    // Precedence: explicit query param > saved DB preference > smart default
    // (male sees women, female sees men, other sees everyone).
    const prefs = profile.datingPreferences ?? {};
    const requestedGender = searchParams.get("gender") ?? prefs.gender ?? null;
    const genderFilter = resolveGenderPreference(
      profile.gender,
      requestedGender === "DEFAULT" ? null : requestedGender
    );
    const collegeFilter = searchParams.get("scope") || prefs.scope || "GLOBAL"; // CAMPUS, GLOBAL
    const targetInstitutionId = searchParams.get("collegeId") || searchParams.get("targetInstitutionId");
    const sort = searchParams.get("sort") || prefs.sort || "COMPATIBILITY";

    // Everyone I already swiped on, and everyone who already liked me.
    const [swiped, likedMeRows] = await Promise.all([
      db.select({ id: swipes.targetId }).from(swipes).where(eq(swipes.swiperId, profile.id)),
      db
        .select({ id: swipes.swiperId })
        .from(swipes)
        .where(and(eq(swipes.targetId, profile.id), eq(swipes.direction, "LIKE"))),
    ]);

    const swipedIds = swiped.map((s) => s.id);
    const likedMeIds = new Set(likedMeRows.map((s) => s.id));

    const viewerInstitutionId = await getViewerInstitutionId();
    const conditions: (SQL | undefined)[] = [
      ne(userProfiles.id, profile.id), // Exclude self
      eq(userProfiles.status, "ACTIVE"), // Only active students
      ne(userProfiles.institutionId, viewerInstitutionId), // Never surface viewer accounts
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
      limit: 60,
      with: {
        institution: true,
      },
    });

    const isDicebear = (url?: string | null) => !url || url.includes("dicebear.com");

    const scoredCandidates = rawCandidates.map((cand) => {
      const fallbackSet = getDatingCandidatePhotoSet(cand.gender, cand.id || cand.username);
      const validPhotos = (cand.photos || []).filter((p) => !isDicebear(p));
      const candPhotos = validPhotos.length > 0 ? validPhotos : fallbackSet.photos;
      const candAvatar = !isDicebear(cand.avatarUrl) ? cand.avatarUrl : fallbackSet.avatar;

      const { score, sharedInterests } = computeCompatibility(
        profile,
        { ...cand, photos: candPhotos },
        { likedMe: likedMeIds.has(cand.id) }
      );

      return {
        id: cand.id,
        displayName: cand.displayName,
        username: cand.username,
        avatarUrl: candAvatar,
        photos: candPhotos,
        bio: cand.bio,
        gender: cand.gender,
        course: cand.course,
        branch: cand.branch,
        year: cand.year,
        points: cand.points,
        interests: cand.interests ?? [],
        institution: cand.institution
          ? { name: cand.institution.name, slug: cand.institution.slug, state: cand.institution.state }
          : null,
        createdAt: cand.createdAt,
        compatibilityScore: score,
        sharedInterests,
        likedYou: likedMeIds.has(cand.id),
      };
    });

    if (sort === "RECENT") {
      scoredCandidates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === "POPULAR") {
      scoredCandidates.sort((a, b) => (b.points || 0) - (a.points || 0));
    } else {
      scoredCandidates.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    }

    // Likes still waiting for an answer (they liked me, I haven't swiped back)
    const swipedSet = new Set(swipedIds);
    const pendingLikes = [...likedMeIds].filter((id) => !swipedSet.has(id)).length;

    return NextResponse.json({
      candidates: scoredCandidates.slice(0, 25),
      meta: {
        showingGender: genderFilter,
        likesYouCount: pendingLikes,
      },
    });
  } catch (error) {
    console.error("Error fetching dating candidates:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
