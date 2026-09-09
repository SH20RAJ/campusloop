import { asc, eq, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { academicPlaylistItems, academicPlaylists, academicResources, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: identifier } = await params;
    const db = getDb();

    let user = null;
    try {
      user = await getCachedAuthUser();
    } catch {}
    const profile = user ? await getCachedUserProfile(user.id) : null;

    // Lookup by id or slug
    const playlist = await db.query.academicPlaylists.findFirst({
      where: or(eq(academicPlaylists.id, identifier), eq(academicPlaylists.slug, identifier)),
      with: {
        creator: true,
        institution: true,
      },
    });

    if (!playlist) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
    }

    // Check visibility
    if (playlist.visibility === "PRIVATE" && (!profile || profile.id !== playlist.creatorId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Increment views count asynchronously
    db.update(academicPlaylists)
      .set({ viewsCount: sql`${academicPlaylists.viewsCount} + 1` })
      .where(eq(academicPlaylists.id, playlist.id))
      .catch(console.error);

    // Fetch items with associated resources
    const items = await db
      .select({
        id: academicPlaylistItems.id,
        sectionName: academicPlaylistItems.sectionName,
        sortOrder: academicPlaylistItems.sortOrder,
        curatorNote: academicPlaylistItems.curatorNote,
        createdAt: academicPlaylistItems.createdAt,
        resource: {
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
        },
      })
      .from(academicPlaylistItems)
      .innerJoin(academicResources, eq(academicPlaylistItems.resourceId, academicResources.id))
      .where(eq(academicPlaylistItems.playlistId, playlist.id))
      .orderBy(asc(academicPlaylistItems.sortOrder));

    // Check if current user starred this playlist
    let isStarred = false;
    if (profile) {
      const star = await db.query.academicPlaylistStars.findFirst({
        where: (stars, { and, eq }) => and(eq(stars.playlistId, playlist.id), eq(stars.userId, profile.id)),
      });
      isStarred = Boolean(star);
    }

    return NextResponse.json({
      playlist: {
        ...playlist,
        isStarred,
        isOwner: profile?.id === playlist.creatorId,
      },
      items,
    });
  } catch (error) {
    console.error("Error fetching academic playlist:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: identifier } = await params;
    const playlist = await db.query.academicPlaylists.findFirst({
      where: or(eq(academicPlaylists.id, identifier), eq(academicPlaylists.slug, identifier)),
    });

    if (!playlist) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
    }

    if (playlist.creatorId !== profile.id && profile.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: only playlist creator can edit" }, { status: 403 });
    }

    const body = (await req.json()) as Record<string, any>;
    const { title, description, category, branch, semester, coverGradient, visibility, tags } = body;

    const updates: Partial<typeof academicPlaylists.$inferInsert> = {};
    if (title && typeof title === "string") updates.title = title.trim();
    if (description !== undefined) updates.description = description ? description.trim() : null;
    if (category) updates.category = category;
    if (branch) updates.branch = branch;
    if (semester !== undefined) updates.semester = semester ? parseInt(String(semester), 10) : null;
    if (coverGradient) updates.coverGradient = coverGradient;
    if (visibility) updates.visibility = visibility;
    if (Array.isArray(tags)) updates.tags = tags;

    const [updated] = await db
      .update(academicPlaylists)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(academicPlaylists.id, playlist.id))
      .returning();

    return NextResponse.json({ playlist: updated });
  } catch (error) {
    console.error("Error updating academic playlist:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { id: identifier } = await params;
    const playlist = await db.query.academicPlaylists.findFirst({
      where: or(eq(academicPlaylists.id, identifier), eq(academicPlaylists.slug, identifier)),
    });

    if (!playlist) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
    }

    if (playlist.creatorId !== profile.id && profile.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: only playlist creator can delete" }, { status: 403 });
    }

    await db.delete(academicPlaylists).where(eq(academicPlaylists.id, playlist.id));

    return NextResponse.json({ success: true, deletedId: playlist.id });
  } catch (error) {
    console.error("Error deleting academic playlist:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
