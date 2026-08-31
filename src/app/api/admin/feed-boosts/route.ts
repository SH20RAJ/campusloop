import { and, desc, eq, gt, inArray, isNull, or } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { resolveAdminSession } from "@/app/admin/_lib/guard";
import { getDb } from "@/db";
import { feedBoosts, posts, userProfiles } from "@/db/schema";
import { invalidateBoostCache } from "@/lib/feed-boosts";

export const dynamic = "force-dynamic";

/** Bounds that keep one mistake from swallowing the whole feed. */
const MAX_MULTIPLIER = 25;
const MIN_MULTIPLIER = 0.01;

const MODES = ["NUDGE", "PROMOTE", "PIN", "BURY"] as const;
type Mode = (typeof MODES)[number];

function normalizeMode(value: unknown): Mode {
  return MODES.includes(value as Mode) ? (value as Mode) : "PROMOTE";
}

function clampMultiplier(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 2;
  return Math.min(Math.max(numeric, MIN_MULTIPLIER), MAX_MULTIPLIER);
}

/**
 * Live and scheduled boosts, newest first, hydrated with enough of the target
 * to be recognisable in the admin list.
 */
export async function GET(req: NextRequest) {
  try {
    const { profile } = await resolveAdminSession();
    const db = getDb();

    const { searchParams } = new URL(req.url);
    const includeExpired = searchParams.get("includeExpired") === "true";

    const now = new Date();
    const rows = await db
      .select()
      .from(feedBoosts)
      .where(
        includeExpired
          ? undefined
          : and(
              eq(feedBoosts.isActive, true),
              or(isNull(feedBoosts.expiresAt), gt(feedBoosts.expiresAt, now))
            )
      )
      .orderBy(desc(feedBoosts.createdAt))
      .limit(200);

    // Two batched lookups rather than one per row.
    const postIds = rows.filter((r) => r.targetType === "POST").map((r) => r.targetId);
    const profileIds = rows.filter((r) => r.targetType === "PROFILE").map((r) => r.targetId);

    const [postRows, profileRows] = await Promise.all([
      postIds.length
        ? db
            .select({ id: posts.id, title: posts.title, body: posts.body, isAnonymous: posts.isAnonymous })
            .from(posts)
            .where(inArray(posts.id, postIds))
        : Promise.resolve([]),
      profileIds.length
        ? db
            .select({
              id: userProfiles.id,
              username: userProfiles.username,
              displayName: userProfiles.displayName,
              avatarUrl: userProfiles.avatarUrl,
            })
            .from(userProfiles)
            .where(inArray(userProfiles.id, profileIds))
        : Promise.resolve([]),
    ]);

    const postMap = new Map(postRows.map((p) => [p.id, p]));
    const profileMap = new Map(profileRows.map((p) => [p.id, p]));

    return NextResponse.json({
      boosts: rows.map((row) => ({
        ...row,
        target:
          row.targetType === "POST"
            ? (() => {
                const post = postMap.get(row.targetId);
                if (!post) return null;
                return {
                  kind: "POST" as const,
                  id: post.id,
                  label: post.title || post.body.slice(0, 90),
                  isAnonymous: post.isAnonymous,
                };
              })()
            : (() => {
                const person = profileMap.get(row.targetId);
                if (!person) return null;
                return {
                  kind: "PROFILE" as const,
                  id: person.id,
                  label: person.displayName,
                  username: person.username,
                  avatarUrl: person.avatarUrl,
                };
              })(),
      })),
      viewerIsAdminProfile: Boolean(profile),
    });
  } catch (error) {
    console.error("GET /api/admin/feed-boosts error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

/** Create or replace a boost for one target. */
export async function POST(req: NextRequest) {
  try {
    const { profile } = await resolveAdminSession();
    const db = getDb();

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const targetType = body.targetType === "PROFILE" ? "PROFILE" : "POST";
    const targetId = typeof body.targetId === "string" ? body.targetId.trim() : "";

    if (!targetId) {
      return NextResponse.json({ error: "targetId is required" }, { status: 400 });
    }

    // Verify the target exists, so a typo becomes an error rather than a boost
    // that silently matches nothing.
    if (targetType === "POST") {
      const post = await db.query.posts.findFirst({
        where: eq(posts.id, targetId),
        columns: { id: true },
      });
      if (!post) return NextResponse.json({ error: "That post does not exist" }, { status: 404 });
    } else {
      const person = await db.query.userProfiles.findFirst({
        where: eq(userProfiles.id, targetId),
        columns: { id: true },
      });
      if (!person) return NextResponse.json({ error: "That student does not exist" }, { status: 404 });
    }

    const scope = body.scope === "INSTITUTION" ? "INSTITUTION" : "GLOBAL";
    const institutionId =
      scope === "INSTITUTION" && typeof body.institutionId === "string" ? body.institutionId : null;

    if (scope === "INSTITUTION" && !institutionId) {
      return NextResponse.json(
        { error: "An institution is required for a campus-scoped boost" },
        { status: 400 }
      );
    }

    const hours = Number(body.durationHours);
    const expiresAt = Number.isFinite(hours) && hours > 0 ? new Date(Date.now() + hours * 3600_000) : null;

    // One live boost per target: re-boosting replaces rather than stacking, so
    // the effective multiplier is always the number on screen.
    await db
      .delete(feedBoosts)
      .where(and(eq(feedBoosts.targetType, targetType), eq(feedBoosts.targetId, targetId)));

    const [created] = await db
      .insert(feedBoosts)
      .values({
        targetType,
        targetId,
        multiplier: clampMultiplier(body.multiplier),
        mode: normalizeMode(body.mode),
        priority: Number.isFinite(Number(body.priority)) ? Number(body.priority) : 0,
        scope,
        institutionId,
        expiresAt,
        reason: typeof body.reason === "string" ? body.reason.trim().slice(0, 300) || null : null,
        createdByProfileId: profile?.id ?? null,
        isActive: true,
      })
      .returning();

    await invalidateBoostCache();

    return NextResponse.json({ success: true, boost: created });
  } catch (error) {
    console.error("POST /api/admin/feed-boosts error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

/** Lift a boost. */
export async function DELETE(req: NextRequest) {
  try {
    await resolveAdminSession();
    const db = getDb();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

    await db.delete(feedBoosts).where(eq(feedBoosts.id, id));
    await invalidateBoostCache();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/feed-boosts error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
