import { getDb } from "@/db";
import { follows,userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { getFollowCounts } from "@/lib/follows";
import { createNotification } from "@/lib/notifications";
import { and,eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ username: string }> };

type ResolvedActors =
  | { ok: false; response: NextResponse }
  | {
      ok: true;
      db: ReturnType<typeof getDb>;
      viewer: { id: string; username: string; displayName: string };
      target: { id: string };
    };

function failure(message: string, status: number): ResolvedActors {
  return { ok: false, response: NextResponse.json({ error: message }, { status }) };
}

async function resolveActors(username: string): Promise<ResolvedActors> {
  const user = await hexclaveServerApp.getUser();
  if (!user) {
    return failure("Unauthorized", 401);
  }

  const db = getDb();
  const [viewer, target] = await Promise.all([
    db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
      columns: { id: true, username: true, displayName: true },
    }),
    db.query.userProfiles.findFirst({
      where: eq(userProfiles.username, username),
      columns: { id: true, username: true, status: true },
    }),
  ]);

  if (!viewer) {
    return failure("Profile not found", 404);
  }
  if (!target) {
    return failure("User not found", 404);
  }
  if (viewer.id === target.id) {
    return failure("You cannot follow yourself", 400);
  }
  if (target.status !== "ACTIVE") {
    return failure("This account is unavailable", 403);
  }

  return { ok: true, db, viewer, target };
}

export async function POST(_request: Request, { params }: RouteContext) {
  try {
    const { username } = await params;
    const resolved = await resolveActors(username);
    if (!resolved.ok) return resolved.response;

    const { db, viewer, target } = resolved;

    // Unique index on (follower_id, following_id) makes the double-tap a no-op.
    const inserted = await db
      .insert(follows)
      .values({ followerId: viewer.id, followingId: target.id })
      .onConflictDoNothing()
      .returning({ id: follows.id });

    if (inserted.length > 0) {
      await createNotification({
        userId: target.id,
        actorId: viewer.id,
        type: "FOLLOW",
        referenceId: viewer.username,
        previewText: `${viewer.displayName} started following you`,
      });
    }

    const counts = await getFollowCounts(target.id);
    return NextResponse.json({ isFollowing: true, ...counts });
  } catch (error) {
    console.error("POST /api/profile/[username]/follow error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    const { username } = await params;
    const resolved = await resolveActors(username);
    if (!resolved.ok) return resolved.response;

    const { db, viewer, target } = resolved;

    await db
      .delete(follows)
      .where(and(eq(follows.followerId, viewer.id), eq(follows.followingId, target.id)));

    const counts = await getFollowCounts(target.id);
    return NextResponse.json({ isFollowing: false, ...counts });
  } catch (error) {
    console.error("DELETE /api/profile/[username]/follow error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
