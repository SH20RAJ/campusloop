import { and, eq, or, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import {
  academicPlaylists,
  academicPlaylistStars,
  userProfiles,
} from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { awardPoints } from "@/lib/gamification-server";
import { rejectViewerWrite } from "@/lib/viewer";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
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

    // Check if already starred
    const existingStar = await db.query.academicPlaylistStars.findFirst({
      where: and(
        eq(academicPlaylistStars.playlistId, playlist.id),
        eq(academicPlaylistStars.userId, profile.id)
      ),
    });

    if (existingStar) {
      // Unstar
      await db
        .delete(academicPlaylistStars)
        .where(
          and(
            eq(academicPlaylistStars.playlistId, playlist.id),
            eq(academicPlaylistStars.userId, profile.id)
          )
        );

      const [updated] = await db
        .update(academicPlaylists)
        .set({
          starsCount: sql`GREATEST(0, ${academicPlaylists.starsCount} - 1)`,
        })
        .where(eq(academicPlaylists.id, playlist.id))
        .returning();

      return NextResponse.json({
        isStarred: false,
        starsCount: updated.starsCount,
      });
    } else {
      // Star
      await db.insert(academicPlaylistStars).values({
        playlistId: playlist.id,
        userId: profile.id,
      });

      const [updated] = await db
        .update(academicPlaylists)
        .set({
          starsCount: sql`${academicPlaylists.starsCount} + 1`,
        })
        .where(eq(academicPlaylists.id, playlist.id))
        .returning();

      // Award Loop Points to playlist creator if not self-starring
      if (playlist.creatorId !== profile.id) {
        awardPoints(
          playlist.creatorId,
          5,
          `Your study playlist "${playlist.title}" was saved by a peer`
        ).catch(console.error);
      }

      return NextResponse.json({
        isStarred: true,
        starsCount: updated.starsCount,
      });
    }
  } catch (error) {
    console.error("Error toggling star on academic playlist:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
