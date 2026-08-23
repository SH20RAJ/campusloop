import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { userProfiles, institutions } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { eq, ne, and, desc, sql } from "drizzle-orm";
import { getViewerInstitutionId } from "@/lib/viewer";

export const dynamic = "force-dynamic";

type Peer = typeof userProfiles.$inferSelect & { institution?: typeof institutions.$inferSelect | null };

export async function GET() {
  try {
    const user = await hexclaveServerApp.getUser();
    const db = getDb();

    let currentProfile = null;
    if (user) {
      currentProfile = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.userId, user.id),
        with: { institution: true },
      });
    }

    const viewerInstitutionId = await getViewerInstitutionId();
    const conditions = [
      eq(userProfiles.status, "ACTIVE"),
      eq(userProfiles.onboardingCompleted, true),
      ne(userProfiles.institutionId, viewerInstitutionId),
    ];

    if (currentProfile) {
      conditions.push(ne(userProfiles.id, currentProfile.id));
    }

    // Try finding peers from the same campus first
    let peers: Peer[] = [];
    if (currentProfile?.institutionId) {
      peers = await db.query.userProfiles.findMany({
        where: and(...conditions, eq(userProfiles.institutionId, currentProfile.institutionId)),
        orderBy: [desc(userProfiles.points), sql`random()`],
        limit: 5,
        with: {
          institution: true,
        },
      });
    }

    // If fewer than 4 peers from same college, backfill with active campus leaders across India
    if (peers.length < 4) {
      const existingIds = new Set([currentProfile?.id, ...peers.map((p) => p.id)].filter(Boolean));
      const generalPeers = await db.query.userProfiles.findMany({
        where: and(...conditions),
        orderBy: [desc(userProfiles.points), sql`random()`],
        limit: 8,
        with: {
          institution: true,
        },
      });

      for (const gp of generalPeers) {
        if (!existingIds.has(gp.id)) {
          peers.push(gp);
          existingIds.add(gp.id);
          if (peers.length >= 5) break;
        }
      }
    }

    return NextResponse.json(peers.slice(0, 5));
  } catch (error) {
    console.error("Error fetching suggested profiles:", error);
    return NextResponse.json({ error: "Failed to fetch suggested profiles" }, { status: 500 });
  }
}
