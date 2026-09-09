import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { academicPlaylistItems, academicPlaylists, institutions, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { rejectViewerWrite } from "@/lib/viewer";

export const dynamic = "force-dynamic";

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 45);
  const suffix = Math.random().toString(36).substring(2, 7);
  return `${base || "playlist"}-${suffix}`;
}

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
    const semesterStr = searchParams.get("semester");
    const category = searchParams.get("category");
    const searchQuery = searchParams.get("q");
    const scope = searchParams.get("scope") || "campus"; // 'campus' | 'global'
    const sort = searchParams.get("sort") || "popular"; // 'popular' | 'latest' | 'items'
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "20", 10)), 50);
    const offset = (page - 1) * limit;

    const db = getDb();
    const conditions = [eq(academicPlaylists.visibility, "PUBLIC")];

    if (scope === "campus" && userInstitutionId) {
      conditions.push(
        or(
          eq(academicPlaylists.institutionId, userInstitutionId),
          sql`${academicPlaylists.institutionId} IS NULL`
        )!
      );
    }

    if (branch && branch !== "all" && branch !== "All") {
      conditions.push(or(eq(academicPlaylists.branch, branch), eq(academicPlaylists.branch, "All"))!);
    }

    if (semesterStr && semesterStr !== "all" && semesterStr !== "0") {
      const semNum = parseInt(semesterStr, 10);
      if (!isNaN(semNum)) {
        conditions.push(eq(academicPlaylists.semester, semNum));
      }
    }

    if (category && category !== "all") {
      conditions.push(eq(academicPlaylists.category, category));
    }

    if (searchQuery && searchQuery.trim()) {
      const q = `%${searchQuery.trim()}%`;
      conditions.push(
        or(
          ilike(academicPlaylists.title, q),
          ilike(academicPlaylists.description, q),
          ilike(academicPlaylists.branch, q)
        )!
      );
    }

    let orderBy = desc(academicPlaylists.starsCount);
    if (sort === "latest") {
      orderBy = desc(academicPlaylists.createdAt);
    } else if (sort === "items") {
      orderBy = desc(academicPlaylists.itemsCount);
    }

    const whereClause = and(...conditions);

    const [playlists, totalCountResult] = await Promise.all([
      db
        .select({
          id: academicPlaylists.id,
          slug: academicPlaylists.slug,
          title: academicPlaylists.title,
          description: academicPlaylists.description,
          category: academicPlaylists.category,
          branch: academicPlaylists.branch,
          semester: academicPlaylists.semester,
          coverGradient: academicPlaylists.coverGradient,
          starsCount: academicPlaylists.starsCount,
          viewsCount: academicPlaylists.viewsCount,
          itemsCount: academicPlaylists.itemsCount,
          isVerified: academicPlaylists.isVerified,
          isFeatured: academicPlaylists.isFeatured,
          tags: academicPlaylists.tags,
          createdAt: academicPlaylists.createdAt,
          creator: {
            id: userProfiles.id,
            displayName: userProfiles.displayName,
            username: userProfiles.username,
            avatarUrl: userProfiles.avatarUrl,
            role: userProfiles.role,
          },
          institution: {
            id: institutions.id,
            name: institutions.name,
            slug: institutions.slug,
          },
        })
        .from(academicPlaylists)
        .innerJoin(userProfiles, eq(academicPlaylists.creatorId, userProfiles.id))
        .leftJoin(institutions, eq(academicPlaylists.institutionId, institutions.id))
        .where(whereClause)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(academicPlaylists).where(whereClause),
    ]);

    const total = Number(totalCountResult[0]?.count || 0);

    return NextResponse.json({
      playlists,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching academic playlists:", error);
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
      branch = "All",
      semester,
      category = "SEMESTER_PACK",
      visibility = "PUBLIC",
      coverGradient = "from-indigo-600 via-purple-600 to-pink-600",
      tags = [],
      initialResourceIds = [],
    } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Playlist title is required" }, { status: 400 });
    }

    const slug = generateSlug(title.trim());
    const sem = semester && semester !== "all" ? parseInt(String(semester), 10) : null;

    const [playlist] = await db
      .insert(academicPlaylists)
      .values({
        slug,
        title: title.trim(),
        description: description?.trim() || null,
        creatorId: profile.id,
        institutionId: profile.institutionId || null,
        branch: branch || "All",
        semester: !isNaN(sem as number) ? sem : null,
        category: category || "SEMESTER_PACK",
        visibility: visibility || "PUBLIC",
        coverGradient: coverGradient || "from-indigo-600 via-purple-600 to-pink-600",
        tags: Array.isArray(tags) ? tags : [],
        itemsCount: Array.isArray(initialResourceIds) ? initialResourceIds.length : 0,
      })
      .returning();

    // If initial items were provided, insert them
    if (Array.isArray(initialResourceIds) && initialResourceIds.length > 0) {
      const itemsToInsert = initialResourceIds.map((resourceId: string, index: number) => ({
        playlistId: playlist.id,
        resourceId,
        sectionName: "Core Materials",
        sortOrder: index,
      }));
      await db.insert(academicPlaylistItems).values(itemsToInsert).onConflictDoNothing();
    }

    return NextResponse.json({ playlist }, { status: 201 });
  } catch (error) {
    console.error("Error creating academic playlist:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
