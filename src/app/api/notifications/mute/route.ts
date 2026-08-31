import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import {
  getMutedChannelsFor,
  isMuteChannel,
  type MuteChannel,
  muteActor,
  unmuteActor,
} from "@/lib/notification-preferences";

export const dynamic = "force-dynamic";

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

/**
 * Resolve the person being muted from either a profile id or a @username, so
 * callers holding only a handle (a profile page, a feed card menu) do not need
 * a second lookup first.
 */
async function resolveTargetId(req: NextRequest, body?: Record<string, unknown>): Promise<string | null> {
  const { searchParams } = new URL(req.url);
  const targetId = (body?.userId as string) || searchParams.get("userId");
  if (targetId) return targetId;

  const username = (body?.username as string) || searchParams.get("username");
  if (!username) return null;

  const db = getDb();
  const target = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.username, username.toLowerCase().trim()),
    columns: { id: true },
  });
  return target?.id ?? null;
}

/** Which channels the caller has muted for one other student. */
export async function GET(req: NextRequest) {
  try {
    const profileId = await getProfileId();
    if (!profileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetId = await resolveTargetId(req);
    if (!targetId) {
      return NextResponse.json({ error: "Provide a `userId` or `username`" }, { status: 400 });
    }

    const channels = await getMutedChannelsFor(profileId, targetId);
    return NextResponse.json({
      userId: targetId,
      channels,
      isMutedEntirely: channels.includes("ALL"),
    });
  } catch (error) {
    console.error("GET /api/notifications/mute error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * Mute one student on one channel. `channel` defaults to "ALL".
 *
 * A mute is notification-only by design: the muted person's posts still appear
 * in the feed and still carry the follow ranking boost. Silencing an alert is
 * not the same as unfollowing, and conflating the two is how students end up
 * quietly cut off from their own campus.
 */
export async function POST(req: NextRequest) {
  try {
    const profileId = await getProfileId();
    if (!profileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const targetId = await resolveTargetId(req, body);
    if (!targetId) {
      return NextResponse.json({ error: "Provide a `userId` or `username`" }, { status: 400 });
    }
    if (targetId === profileId) {
      return NextResponse.json({ error: "You cannot mute yourself" }, { status: 400 });
    }

    const requested = (body.channel as string) || "ALL";
    if (!isMuteChannel(requested)) {
      return NextResponse.json({ error: `Unknown channel "${requested}"` }, { status: 400 });
    }

    await muteActor({ userId: profileId, mutedUserId: targetId, channel: requested as MuteChannel });
    const channels = await getMutedChannelsFor(profileId, targetId);

    return NextResponse.json({ muted: true, userId: targetId, channels });
  } catch (error) {
    console.error("POST /api/notifications/mute error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/** Lift a mute. `channel=ALL` (the default) clears every channel for that actor. */
export async function DELETE(req: NextRequest) {
  try {
    const profileId = await getProfileId();
    if (!profileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const targetId = await resolveTargetId(req, body);
    if (!targetId) {
      return NextResponse.json({ error: "Provide a `userId` or `username`" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const requested = (body.channel as string) || searchParams.get("channel") || "ALL";
    if (!isMuteChannel(requested)) {
      return NextResponse.json({ error: `Unknown channel "${requested}"` }, { status: 400 });
    }

    await unmuteActor({ userId: profileId, mutedUserId: targetId, channel: requested as MuteChannel });
    const channels = await getMutedChannelsFor(profileId, targetId);

    return NextResponse.json({ muted: channels.length > 0, userId: targetId, channels });
  } catch (error) {
    console.error("DELETE /api/notifications/mute error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
