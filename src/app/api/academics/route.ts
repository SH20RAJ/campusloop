import { getDb } from "@/db";
import { academicResources,userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { getCachedAuthUser,getCachedUserProfile } from "@/lib/server-cache";
import { rejectViewerWrite } from "@/lib/viewer";
import { and,desc,eq,ilike,or,sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getCachedAuthUser();
    const profile = user ? await getCachedUserProfile(user.id) : null;
    const institutionId = profile?.institutionId || "inst_35df75700bb23dd30311ef5f";

    const { searchParams } = new URL(req.url);
    const branch = searchParams.get("branch");
    const resourceType = searchParams.get("resourceType");
    const semesterStr = searchParams.get("semester");
    const searchQuery = searchParams.get("q");
    const sort = searchParams.get("sort") || "latest";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);

    const db = getDb();

    const conditions = [];

    if (branch && branch !== "all" && branch !== "All") {
      conditions.push(or(eq(academicResources.branch, branch), eq(academicResources.branch, "All")));
    }

    if (resourceType && resourceType !== "all" && resourceType !== "ALL") {
      conditions.push(eq(academicResources.resourceType, resourceType.toUpperCase()));
    }

    if (semesterStr && semesterStr !== "all") {
      const sem = parseInt(semesterStr, 10);
      if (!isNaN(sem) && sem >= 1 && sem <= 8) {
        conditions.push(eq(academicResources.semester, sem));
      }
    }

    if (searchQuery?.trim()) {
      const q = `%${searchQuery.trim()}%`;
      conditions.push(
        or(
          ilike(academicResources.title, q),
          ilike(academicResources.subjectCode, q),
          ilike(academicResources.subjectName, q),
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

    const items = await db.query.academicResources.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: orderByClause,
      limit,
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
      },
    });

    return NextResponse.json({ items });
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
      driveUrl,
      fileUrl,
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
        driveUrl: driveUrl?.trim() || null,
        fileUrl: fileUrl?.trim() || null,
        upvotesCount: 0,
        downloadsCount: 0,
        viewsCount: 1,
        isVerified: true,
      })
      .returning();

    // Reward uploader with Loop Points (LP) for campus contribution
    try {
      await db
        .update(userProfiles)
        .set({ points: sql`${userProfiles.points} + 15` })
        .where(eq(userProfiles.id, profile.id));
    } catch {}

    return NextResponse.json({ success: true, item: created });
  } catch (error) {
    console.error("Error creating academic resource:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
