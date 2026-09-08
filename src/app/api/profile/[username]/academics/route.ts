import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import {
  academicPlaylists,
  academicResources,
  institutions,
  userProfiles,
} from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const db = getDb();

    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.username, username),
    });

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch user's shared notes & materials
    const resources = await db
      .select({
        id: academicResources.id,
        title: academicResources.title,
        description: academicResources.description,
        subjectCode: academicResources.subjectCode,
        subjectName: academicResources.subjectName,
        branch: academicResources.branch,
        semester: academicResources.semester,
        resourceType: academicResources.resourceType,
        fileUrl: academicResources.fileUrl,
        driveUrl: academicResources.driveUrl,
        upvotesCount: academicResources.upvotesCount,
        downloadsCount: academicResources.downloadsCount,
        viewsCount: academicResources.viewsCount,
        isVerified: academicResources.isVerified,
        createdAt: academicResources.createdAt,
        uploader: {
          id: userProfiles.id,
          displayName: userProfiles.displayName,
          username: userProfiles.username,
          avatarUrl: userProfiles.avatarUrl,
        },
        institution: {
          id: institutions.id,
          name: institutions.name,
        },
      })
      .from(academicResources)
      .innerJoin(userProfiles, eq(academicResources.uploaderId, userProfiles.id))
      .leftJoin(institutions, eq(academicResources.institutionId, institutions.id))
      .where(eq(academicResources.uploaderId, profile.id))
      .orderBy(desc(academicResources.createdAt))
      .limit(50);

    // Fetch user's study playlists
    const playlists = await db
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
        createdAt: academicPlaylists.createdAt,
        creator: {
          id: userProfiles.id,
          displayName: userProfiles.displayName,
          username: userProfiles.username,
          avatarUrl: userProfiles.avatarUrl,
        },
        institution: {
          id: institutions.id,
          name: institutions.name,
        },
      })
      .from(academicPlaylists)
      .innerJoin(userProfiles, eq(academicPlaylists.creatorId, userProfiles.id))
      .leftJoin(institutions, eq(academicPlaylists.institutionId, institutions.id))
      .where(eq(academicPlaylists.creatorId, profile.id))
      .orderBy(desc(academicPlaylists.createdAt))
      .limit(50);

    return NextResponse.json({
      resources,
      playlists,
      totalCount: resources.length + playlists.length,
    });
  } catch (error) {
    console.error("Error fetching user shared academics:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
