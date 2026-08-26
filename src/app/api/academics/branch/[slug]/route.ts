import { findBranchBySlug } from "@/constants";
import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { and,desc,eq,ilike,or,sql,type SQL } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope") || "GLOBAL"; // CAMPUS vs GLOBAL
    const sort = searchParams.get("sort") || "CLOUT"; // CLOUT, RECENT, NAME
    const query = searchParams.get("q") || "";

    const user = await hexclaveServerApp.getUser();
    const db = getDb();

    let userInstitutionId: string | null = null;
    if (user) {
      const viewer = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, user.id),
      });
      if (viewer) userInstitutionId = viewer.institutionId;
    }

    // Match branch by slug or keyword
    const branchInfo = findBranchBySlug(slug);
    const searchTerm = branchInfo ? branchInfo.name : slug.replace(/-/g, " ");

    const conditions: SQL[] = [
      eq(userProfiles.status, "ACTIVE"),
      or(
        ilike(userProfiles.branch, `%${searchTerm}%`),
        ilike(userProfiles.course, `%${searchTerm}%`),
        sql`${userProfiles.branch} ILIKE ${`%${slug}%`}`,
        sql`${userProfiles.course} ILIKE ${`%${slug}%`}`
      )!,
    ];

    if (scope === "CAMPUS" && userInstitutionId) {
      conditions.push(eq(userProfiles.institutionId, userInstitutionId));
    }

    if (query.trim()) {
      conditions.push(
        or(
          ilike(userProfiles.displayName, `%${query.trim()}%`),
          ilike(userProfiles.username, `%${query.trim()}%`),
          ilike(userProfiles.bio, `%${query.trim()}%`)
        )!
      );
    }

    let orderByClause = [desc(userProfiles.points), desc(userProfiles.createdAt)];
    if (sort === "RECENT") {
      orderByClause = [desc(userProfiles.createdAt)];
    } else if (sort === "NAME") {
      orderByClause = [sql`${userProfiles.displayName} ASC`];
    }

    const students = await db.query.userProfiles.findMany({
      where: and(...conditions),
      orderBy: orderByClause,
      limit: 60,
      with: {
        institution: true,
      },
    });

    return NextResponse.json({
      branch: branchInfo ? branchInfo.name : searchTerm,
      slug,
      icon: branchInfo ? branchInfo.icon : "🎓",
      category: branchInfo ? branchInfo.category : "GENERAL",
      totalCount: students.length,
      students,
    });
  } catch (error) {
    console.error("Error fetching academic branch directory:", error);
    return NextResponse.json({ error: "Failed to fetch academic branch" }, { status: 500 });
  }
}
