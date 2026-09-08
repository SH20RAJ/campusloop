import { desc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { academicResources, savedAcademicResources } from "@/db/schema";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCachedAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await getCachedUserProfile(user.id);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const db = getDb();

    // Fetch all saved references for this profile
    const savedEntries = await db.query.savedAcademicResources.findMany({
      where: eq(savedAcademicResources.profileId, profile.id),
      orderBy: [desc(savedAcademicResources.createdAt)],
    });

    if (savedEntries.length === 0) {
      return NextResponse.json({
        items: [],
        total: 0,
        bySemester: {},
        availableSemesters: [],
      });
    }

    const resourceIds = savedEntries.map((s) => s.resourceId);

    // Fetch full academic resource details with uploader and institution
    const resources = await db.query.academicResources.findMany({
      where: inArray(academicResources.id, resourceIds),
      with: {
        uploader: {
          columns: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        institution: {
          columns: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Create a map for rapid lookup
    const resourceMap = new Map(resources.map((r) => [r.id, r]));

    // Format list maintaining saved order
    const enrichedItems = savedEntries
      .map((entry) => {
        const res = resourceMap.get(entry.resourceId);
        if (!res) return null;
        return {
          ...res,
          savedAt: entry.createdAt,
          savedSemester: entry.semester || res.semester,
          isSaved: true,
        };
      })
      .filter(Boolean);

    // Group by semester for auto-organized locker
    const bySemester: Record<number, typeof enrichedItems> = {};
    for (const item of enrichedItems) {
      if (!item) continue;
      const sem = item.savedSemester || item.semester || 1;
      if (!bySemester[sem]) bySemester[sem] = [];
      bySemester[sem].push(item);
    }

    const availableSemesters = Object.keys(bySemester)
      .map((s) => Number(s))
      .sort((a, b) => a - b);

    return NextResponse.json({
      items: enrichedItems,
      total: enrichedItems.length,
      bySemester,
      availableSemesters,
    });
  } catch (error) {
    console.error("Error fetching saved academic resources:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
