import { getDb } from "@/db";
import { pushSubscriptions,userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { and,eq } from "drizzle-orm";
import { NextRequest,NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface SubscribeBody {
  endpoint?: string;
  keys?: { p256dh?: string; auth?: string };
}

async function getProfileId(): Promise<string | null> {
  const user = await hexclaveServerApp.getUser();
  if (!user) return null;
  const db = getDb();
  const profile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.userId, user.id),
    columns: { id: true },
  });
  return profile?.id ?? null;
}

export async function POST(req: NextRequest) {
  try {
    const profileId = await getProfileId();
    if (!profileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as SubscribeBody;
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }

    const db = getDb();
    // Endpoint is unique: re-subscribing the same browser updates the row and
    // re-points it at the current student rather than duplicating it.
    await db
      .insert(pushSubscriptions)
      .values({
        userId: profileId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent: req.headers.get("user-agent")?.slice(0, 300) || null,
      })
      .onConflictDoUpdate({
        target: pushSubscriptions.endpoint,
        set: {
          userId: profileId,
          p256dh: keys.p256dh,
          auth: keys.auth,
          failureCount: 0,
          updatedAt: new Date(),
        },
      });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/push/subscribe error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const profileId = await getProfileId();
    if (!profileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { endpoint } = (await req.json().catch(() => ({}))) as SubscribeBody;
    if (!endpoint) {
      return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
    }

    const db = getDb();
    await db
      .delete(pushSubscriptions)
      .where(and(eq(pushSubscriptions.endpoint, endpoint), eq(pushSubscriptions.userId, profileId)));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/push/subscribe error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
