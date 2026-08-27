import { getDb } from "@/db";
import { timeCapsules,userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { desc,eq } from "drizzle-orm";
import { NextRequest,NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
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
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const institutionId = profile.institutionId;
    if (!institutionId) {
      return NextResponse.json({ capsules: [] });
    }

    const capsules = await db.query.timeCapsules.findMany({
      where: eq(timeCapsules.institutionId, institutionId),
      orderBy: [desc(timeCapsules.createdAt)],
      with: {
        creator: {
          columns: { id: true, username: true, displayName: true, avatarUrl: true },
        },
        entries: {
          with: {
            author: {
              columns: { id: true, username: true, displayName: true, avatarUrl: true },
            },
          },
        },
      },
    });

    const now = new Date();

    // Map capsules and sanitize entries: if locked, only show count & current user's buried entries
    const sanitizedCapsules = capsules.map((c) => {
      const isActuallyUnlocked = c.isUnlocked || new Date(c.targetUnlockDate) <= now;

      const visibleEntries = isActuallyUnlocked
        ? c.entries.map((e) => ({
            ...e,
            author: e.isAnonymous ? null : e.author,
          }))
        : c.entries
            .filter((e) => e.authorId === profile.id)
            .map((e) => ({
              ...e,
              isBuriedByYou: true,
            }));

      return {
        ...c,
        isUnlocked: isActuallyUnlocked,
        entries: visibleEntries,
        totalEntriesBuried: c.entries.length,
      };
    });

    return NextResponse.json({ capsules: sanitizedCapsules });
  } catch (error) {
    console.error("GET /api/capsules error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile || !profile.institutionId) {
      return NextResponse.json({ error: "Institution required" }, { status: 400 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      title?: string;
      description?: string;
      targetUnlockDate?: string;
      category?: string;
      coverImage?: string;
    };

    if (!body.title || !body.targetUnlockDate) {
      return NextResponse.json(
        { error: "Title and target unlock date are required" },
        { status: 400 }
      );
    }

    const unlockDate = new Date(body.targetUnlockDate);
    if (isNaN(unlockDate.getTime())) {
      return NextResponse.json({ error: "Invalid target unlock date" }, { status: 400 });
    }

    const [capsule] = await db
      .insert(timeCapsules)
      .values({
        institutionId: profile.institutionId,
        creatorId: profile.id,
        title: body.title.trim(),
        description: body.description?.trim() || null,
        targetUnlockDate: unlockDate,
        category: body.category || "CONVOCATION",
        coverImage:
          body.coverImage ||
          "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80",
      })
      .returning();

    return NextResponse.json({ success: true, capsule });
  } catch (error) {
    console.error("POST /api/capsules error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
