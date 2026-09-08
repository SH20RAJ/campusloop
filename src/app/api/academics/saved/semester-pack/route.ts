import { and, eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { academicResources, savedAcademicResources } from "@/db/schema";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { trackUserBehavior } from "@/lib/user-behavior";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await getCachedAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getCachedUserProfile(user.id);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = (await req.json()) as Record<string, any>;
    const semester = Math.max(1, Math.min(8, Number(body.semester) || 1));
    const branch = body.branch || profile.branch || "All";

    const db = getDb();

    // Query all verified resources for this semester & branch/institution
    const conditions: any[] = [eq(academicResources.semester, semester)];

    if (branch && branch !== "All" && branch !== "all") {
      conditions.push(or(eq(academicResources.branch, branch), eq(academicResources.branch, "All")));
    }

    const candidates = await db.query.academicResources.findMany({
      where: and(...conditions),
      limit: 60,
    });

    if (candidates.length === 0) {
      return NextResponse.json({
        success: false,
        message: `No materials found for Semester ${semester} yet.`,
        savedCount: 0,
      });
    }

    let savedCount = 0;
    const now = new Date();

    for (const res of candidates) {
      try {
        await db
          .insert(savedAcademicResources)
          .values({
            id: crypto.randomUUID(),
            profileId: profile.id,
            resourceId: res.id,
            semester,
            createdAt: now,
          })
          .onConflictDoNothing();
        savedCount++;
      } catch {}
    }

    // Track user behavior in Redis
    trackUserBehavior({
      userId: user.id,
      eventType: "POST_BOOKMARK",
      targetType: "POST",
      targetId: `sem_pack_${semester}`,
      metadata: {
        action: "SEMESTER_PACK_SAVE",
        semester,
        branch,
        count: savedCount,
        interests: candidates.slice(0, 5).map((c) => c.subjectName),
      },
      weight: 10,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      savedCount,
      message: `Successfully saved ${savedCount} study materials for Semester ${semester} directly to your locker!`,
    });
  } catch (error) {
    console.error("Error saving semester pack:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
