import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { academicResources, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { indexAcademicResourceVector } from "@/lib/qdrant/indexer";
import { searchAcademicResourcesVector } from "@/lib/recommendations/academic-recommendations";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { rejectViewerWrite } from "@/lib/viewer";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    let user = null;
    try {
      user = await getCachedAuthUser();
    } catch {}
    const profile = user ? await getCachedUserProfile(user.id) : null;
    const userInstitutionId = profile?.institutionId || "inst_35df75700bb23dd30311ef5f";

    const { searchParams } = new URL(req.url);
    const branch = searchParams.get("branch");
    const resourceType = searchParams.get("resourceType");
    const semesterStr = searchParams.get("semester");
    const searchQuery = searchParams.get("q");
    const scope = searchParams.get("scope") || "campus"; // 'campus' or 'global'
    const sort = searchParams.get("sort") || "latest";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "20", 10)), 50);
    const offset = (page - 1) * limit;

    const db = getDb();
    const conditions = [];

    // Scope filter (Campus vs Global)
    if (scope === "campus" && userInstitutionId) {
      conditions.push(eq(academicResources.institutionId, userInstitutionId));
    }

    // Branch filter
    if (branch && branch !== "all" && branch !== "All") {
      conditions.push(or(eq(academicResources.branch, branch), eq(academicResources.branch, "All")));
    }

    // Resource type filter
    if (resourceType && resourceType !== "all" && resourceType !== "ALL") {
      conditions.push(eq(academicResources.resourceType, resourceType.toUpperCase()));
    }

    // Semester filter
    if (semesterStr && semesterStr !== "all") {
      const sem = parseInt(semesterStr, 10);
      if (!isNaN(sem) && sem >= 1 && sem <= 8) {
        conditions.push(eq(academicResources.semester, sem));
      }
    }

    // Search query
    if (searchQuery?.trim()) {
      const q = `%${searchQuery.trim()}%`;
      conditions.push(
        or(
          ilike(academicResources.title, q),
          ilike(academicResources.subjectCode, q),
          ilike(academicResources.subjectName, q),
          ilike(academicResources.moduleOrChapter, q),
          ilike(academicResources.description, q)
        )
      );
    }

    let orderByClause = [desc(academicResources.createdAt)];
    if (sort === "popular") {
      orderByClause = [desc(academicResources.upvotesCount), desc(academicResources.createdAt)];
    } else if (sort === "downloads") {
      orderByClause = [desc(academicResources.downloadsCount), desc(academicResources.createdAt)];
    } else if (sort === "views") {
      orderByClause = [desc(academicResources.viewsCount), desc(academicResources.createdAt)];
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Count query for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(academicResources)
      .where(whereClause);

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    const items = await db.query.academicResources.findMany({
      where: whereClause,
      orderBy: orderByClause,
      limit,
      offset,
      with: {
        uploader: {
          columns: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            points: true,
          },
        },
        institution: {
          columns: {
            id: true,
            name: true,
            slug: true,
          },
        },
        comments: {
          columns: {
            id: true,
          },
        },
      },
    });

    const enriched = items.map((item) => ({
      ...item,
      commentsCount: item.comments?.length || 0,
    }));

    // If search query is provided on page 1, check Qdrant for semantic matches
    let vectorItems: any[] = [];
    if (searchQuery?.trim() && page === 1) {
      try {
        const sem = semesterStr && semesterStr !== "all" ? parseInt(semesterStr, 10) : undefined;
        const vMatches = await searchAcademicResourcesVector(searchQuery.trim(), {
          limit,
          branch: branch && branch !== "all" && branch !== "All" ? branch : undefined,
          semester: !isNaN(sem as number) ? sem : undefined,
          resourceType: resourceType && resourceType !== "all" && resourceType !== "ALL" ? resourceType : undefined,
          institutionId: scope === "campus" && userInstitutionId ? userInstitutionId : undefined,
        });
        if (vMatches.length > 0) {
          vectorItems = vMatches.map((vm) => ({
            ...vm.resource,
            isSemanticMatch: true,
            semanticScore: vm.score,
            commentsCount: 0,
          }));
        }
      } catch (err) {
        console.warn("Error running vector search in GET academics:", err);
      }
    }

    // Merge vector items with SQL results, deduplicating by ID
    const seenIds = new Set<string>();
    const finalItems: any[] = [];

    for (const v of vectorItems) {
      if (!seenIds.has(v.id)) {
        seenIds.add(v.id);
        finalItems.push(v);
      }
    }

    for (const item of enriched) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        finalItems.push(item);
      }
    }

    return NextResponse.json({
      items: finalItems.slice(0, limit),
      total: Math.max(total, finalItems.length),
      page,
      limit,
      hasMore,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching academic resources:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
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

    const viewerBlocked = await rejectViewerWrite(profile);
    if (viewerBlocked) return viewerBlocked;

    const body = (await req.json()) as Record<string, any>;
    const {
      title,
      description,
      subjectCode,
      subjectName,
      branch = "All",
      semester = 1,
      resourceType = "NOTES",
      moduleOrChapter,
      driveUrl,
      fileUrl,
      tags = [],
    } = body;

    if (!title?.trim() || !subjectCode?.trim() || !subjectName?.trim()) {
      return NextResponse.json(
        { error: "Title, Subject Code, and Subject Name are required" },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(academicResources)
      .values({
        institutionId: profile.institutionId || "inst_35df75700bb23dd30311ef5f",
        uploaderId: profile.id,
        title: title.trim(),
        description: description?.trim() || null,
        subjectCode: subjectCode.trim().toUpperCase(),
        subjectName: subjectName.trim(),
        branch: branch || "All",
        semester: typeof semester === "number" ? semester : 1,
        resourceType: resourceType || "NOTES",
        moduleOrChapter: moduleOrChapter?.trim() || null,
        driveUrl: driveUrl?.trim() || null,
        fileUrl: fileUrl?.trim() || null,
        tags: Array.isArray(tags) ? tags : [],
        upvotesCount: 0,
        downvotesCount: 0,
        downloadsCount: 0,
        viewsCount: 1,
        isVerified: true,
      })
      .returning();

    // Reward uploader with Loop Points (LP) for verified academic contribution
    try {
      await db
        .update(userProfiles)
        .set({ points: sql`${userProfiles.points} + 20` })
        .where(eq(userProfiles.id, profile.id));
    } catch {}

    // Index into Qdrant in background for vector search & recommendations
    indexAcademicResourceVector({
      id: created.id,
      title: created.title,
      subjectCode: created.subjectCode,
      subjectName: created.subjectName,
      branch: created.branch,
      semester: created.semester,
      resourceType: created.resourceType,
      description: created.description,
      tags: (created.tags as string[]) || undefined,
    }).catch((err) => {
      console.warn("Background Qdrant indexing failed for resource", created.id, err);
    });

    return NextResponse.json({
      success: true,
      item: {
        ...created,
        uploader: {
          id: profile.id,
          username: profile.username,
          displayName: profile.displayName,
          avatarUrl: profile.avatarUrl,
          points: profile.points,
        },
      },
    });
  } catch (error) {
    console.error("Error creating academic resource:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
