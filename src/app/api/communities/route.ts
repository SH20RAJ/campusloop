import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { communities, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get("limit");
    const limit = limitParam ? Math.min(Math.max(1, Number(limitParam) || 20), 50) : undefined;
    const sort = url.searchParams.get("sort") || "popular";

    const db = getDb();

    // Check logged in user profile ID for membership status
    let currentProfileId: string | null = null;
    try {
      const user = await hexclaveServerApp.getUser();
      if (user) {
        const profile = await db.query.userProfiles.findFirst({
          where: eq(userProfiles.userId, user.id),
          columns: { id: true },
        });
        currentProfileId = profile?.id ?? null;
      }
    } catch {
      // Guest visitor
    }

    const allCommunities = await db.query.communities.findMany({
      orderBy:
        sort === "popular"
          ? [desc(communities.points), desc(communities.createdAt)]
          : [desc(communities.createdAt)],
      limit,
      with: {
        members: true,
        creator: {
          columns: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });

    const response = allCommunities.map((comm) => {
      const membersCount = comm.members ? comm.members.length : 0;
      const isMember = currentProfileId
        ? (comm.members || []).some((m) => m.userId === currentProfileId && m.status === "ACTIVE")
        : false;

      return {
        ...comm,
        slug: comm.slug || comm.name.toLowerCase().replace(/\s+/g, "-"),
        membersCount,
        memberCount: membersCount,
        isPrivate: comm.privacy === "PRIVATE",
        isMember,
      };
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching communities API:", error);
    return NextResponse.json([], { status: 200 });
  }
}
