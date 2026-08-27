import { getDb } from "@/db";
import { capsuleEntries,timeCapsules,userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { eq,sql } from "drizzle-orm";
import { NextRequest,NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: capsuleId } = await params;
    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const capsule = await db.query.timeCapsules.findFirst({
      where: eq(timeCapsules.id, capsuleId),
    });

    if (!capsule) {
      return NextResponse.json({ error: "Time capsule not found" }, { status: 404 });
    }

    if (capsule.isUnlocked || new Date(capsule.targetUnlockDate) <= new Date()) {
      return NextResponse.json(
        { error: "This capsule has already unlocked and is sealed from new entries" },
        { status: 400 }
      );
    }

    const body = (await req.json().catch(() => ({}))) as {
      title?: string;
      content?: string;
      entryType?: string;
      mediaUrl?: string;
      isAnonymous?: boolean;
      pseudonym?: string;
    };

    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: "Title and content are required to bury a memory" },
        { status: 400 }
      );
    }

    const [entry] = await db
      .insert(capsuleEntries)
      .values({
        capsuleId: capsule.id,
        authorId: profile.id,
        title: body.title.trim(),
        content: body.content.trim(),
        entryType: body.entryType || "LETTER",
        mediaUrl: body.mediaUrl || null,
        isAnonymous: !!body.isAnonymous,
        pseudonym: body.isAnonymous ? body.pseudonym || "anonymous_student" : null,
      })
      .returning();

    // Increment entries count
    await db
      .update(timeCapsules)
      .set({ entriesCount: sql`${timeCapsules.entriesCount} + 1` })
      .where(eq(timeCapsules.id, capsule.id));

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error("POST /api/capsules/[id]/bury error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
