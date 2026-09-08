import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { academicPlaylists, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const resourceId = searchParams.get("resourceId");

    const playlists = await db.query.academicPlaylists.findMany({
      where: eq(academicPlaylists.creatorId, profile.id),
      orderBy: [desc(academicPlaylists.updatedAt)],
      columns: {
        id: true,
        slug: true,
        title: true,
        description: true,
        category: true,
        branch: true,
        semester: true,
        coverGradient: true,
        itemsCount: true,
        visibility: true,
        updatedAt: true,
      },
    });

    let containingPlaylistIds: string[] = [];
    if (resourceId && playlists.length > 0) {
      const items = await db.query.academicPlaylistItems.findMany({
        where: (it, { and, eq, inArray }) =>
          and(
            eq(it.resourceId, resourceId),
            inArray(
              it.playlistId,
              playlists.map((p) => p.id)
            )
          ),
        columns: {
          playlistId: true,
        },
      });
      containingPlaylistIds = items.map((it) => it.playlistId);
    }

    return NextResponse.json({
      playlists,
      containingPlaylistIds,
    });
  } catch (error) {
    console.error("Error fetching user playlists:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
