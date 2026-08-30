import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { followUser, getFollowCounts, unfollowUser } from "@/lib/follows";
import { createNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ username: string }> };

type ResolvedActors =
  | { ok: false; response: NextResponse }
  | {
      ok: true;
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

  return { ok: true, viewer, target };
}

export async function POST(_request: Request, { params }: RouteContext) {
  try {
    const { username } = await params;
    const resolved = await resolveActors(username);
    if (!resolved.ok) return resolved.response;

    const { viewer, target } = resolved;

    const result = await followUser(viewer.id, target.id);

    // Only notify on a genuinely new edge, so a double-tap stays silent.
    if (result.created) {
      await createNotification({
        userId: target.id,
        actorId: viewer.id,
        type: result.isFriend ? "FRIEND" : "FOLLOW",
        referenceId: viewer.username,
        previewText: result.isFriend
          ? `You and ${viewer.displayName} are now campus friends`
          : `${viewer.displayName} started following you`,
      });
    }

    const counts = await getFollowCounts(target.id);
    return NextResponse.json({ isFollowing: true, isFriend: result.isFriend, ...counts });
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

    const { viewer, target } = resolved;

    await unfollowUser(viewer.id, target.id);

    const counts = await getFollowCounts(target.id);
    return NextResponse.json({ isFollowing: false, isFriend: false, ...counts });
  } catch (error) {
    console.error("DELETE /api/profile/[username]/follow error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
