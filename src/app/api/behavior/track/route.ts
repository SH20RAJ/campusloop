import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { hexclaveServerApp } from "@/hexclave/server";
import { trackUserBehavior, type UserEventPayload } from "@/lib/user-behavior";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as Partial<UserEventPayload>;
    if (!body.eventType) {
      return NextResponse.json({ error: "eventType is required" }, { status: 400 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: (up, { eq }) => eq(up.userId, user.id),
      columns: { id: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    await trackUserBehavior({
      userId: profile.id,
      eventType: body.eventType,
      targetType: body.targetType,
      targetId: body.targetId,
      metadata: body.metadata || {},
      weight: body.weight || 1,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/behavior/track error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
