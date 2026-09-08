import { and, eq, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import {
  academicPlaylists,
  academicPlaylistItems,
  userProfiles,
} from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { rejectViewerWrite } from "@/lib/viewer";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: identifier } = await params;
    const playlist = await db.query.academicPlaylists.findFirst({
      where: or(eq(academicPlaylists.id, identifier), eq(academicPlaylists.slug, identifier)),
    });

    if (!playlist) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
    }

    if (playlist.creatorId !== profile.id && profile.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: only playlist creator can modify items" }, { status: 403 });
    }

    const body = (await req.json()) as Record<string, any>;
    const { resourceId, sectionName = "Core Materials", curatorNote, sortOrder } = body;

    if (!resourceId) {
      return NextResponse.json({ error: "resourceId is required" }, { status: 400 });
    }

    // Check if already in playlist
    const existing = await db.query.academicPlaylistItems.findFirst({
      where: and(
        eq(academicPlaylistItems.playlistId, playlist.id),
        eq(academicPlaylistItems.resourceId, resourceId)
      ),
    });

    if (existing) {
      return NextResponse.json({ error: "Resource is already in this playlist" }, { status: 409 });
    }

    const order = typeof sortOrder === "number" ? sortOrder : playlist.itemsCount;

    const [item] = await db
      .insert(academicPlaylistItems)
      .values({
        playlistId: playlist.id,
        resourceId,
        sectionName: sectionName?.trim() || "Core Materials",
        curatorNote: curatorNote?.trim() || null,
        sortOrder: order,
      })
      .returning();

    // Increment playlist itemsCount
    await db
      .update(academicPlaylists)
      .set({
        itemsCount: sql`${academicPlaylists.itemsCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(academicPlaylists.id, playlist.id));

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Error adding item to academic playlist:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
      return NextResponse.json({ error: "Forbidden: only playlist creator can remove items" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");
    const resourceId = searchParams.get("resourceId");

    if (!itemId && !resourceId) {
      return NextResponse.json({ error: "itemId or resourceId is required" }, { status: 400 });
    }

    const whereClause = itemId
      ? and(eq(academicPlaylistItems.id, itemId), eq(academicPlaylistItems.playlistId, playlist.id))
      : and(eq(academicPlaylistItems.resourceId, resourceId!), eq(academicPlaylistItems.playlistId, playlist.id));

    const deleted = await db.delete(academicPlaylistItems).where(whereClause!).returning();

    if (deleted.length > 0) {
      await db
        .update(academicPlaylists)
        .set({
          itemsCount: sql`GREATEST(0, ${academicPlaylists.itemsCount} - 1)`,
          updatedAt: new Date(),
        })
        .where(eq(academicPlaylists.id, playlist.id));
    }

    return NextResponse.json({ success: true, removedCount: deleted.length });
  } catch (error) {
    console.error("Error removing item from academic playlist:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
