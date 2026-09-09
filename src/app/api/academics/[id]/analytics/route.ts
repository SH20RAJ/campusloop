import { and, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { academicResources, savedAcademicResources } from "@/db/schema";
import { getCachedAuthUser, getCachedUserProfile } from "@/lib/server-cache";
import { trackUserBehavior } from "@/lib/user-behavior";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = (await req.json()) as Record<string, any>;
    const { action } = body;

    const db = getDb();
    let user = null;
    try {
      user = await getCachedAuthUser();
    } catch {}

    if (action === "VIEW") {
      const [updated] = await db
        .update(academicResources)
        .set({
          viewsCount: sql`${academicResources.viewsCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(academicResources.id, id))
        .returning();

      if (user && updated) {
        trackUserBehavior({
          userId: user.id,
          eventType: "POST_VIEW",
          targetType: "POST",
          targetId: id,
          metadata: {
            resourceId: id,
            action: "VIEW",
            subjectCode: updated.subjectCode,
            branch: updated.branch,
            interests: [updated.subjectName, updated.subjectCode, updated.branch].filter(Boolean),
          },
          weight: 1,
        }).catch(() => {});
      }

      return NextResponse.json({ success: true, viewsCount: updated?.viewsCount || 0 });
    }

    if (action === "DOWNLOAD") {
      const [updated] = await db
        .update(academicResources)
        .set({
          downloadsCount: sql`${academicResources.downloadsCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(academicResources.id, id))
        .returning();

      if (user && updated) {
        trackUserBehavior({
          userId: user.id,
          eventType: "POST_VIEW",
          targetType: "POST",
          targetId: id,
          metadata: {
            resourceId: id,
            action: "DOWNLOAD",
            subjectCode: updated.subjectCode,
            branch: updated.branch,
            interests: [updated.subjectName, updated.subjectCode, updated.branch].filter(Boolean),
          },
          weight: 2,
        }).catch(() => {});
      }

      return NextResponse.json({ success: true, downloadsCount: updated?.downloadsCount || 0 });
    }

    if (action === "UPVOTE") {
      const [updated] = await db
        .update(academicResources)
        .set({
          upvotesCount: sql`${academicResources.upvotesCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(academicResources.id, id))
        .returning();

      if (user && updated) {
        trackUserBehavior({
          userId: user.id,
          eventType: "POST_DWELL",
          targetType: "POST",
          targetId: id,
          metadata: {
            resourceId: id,
            action: "UPVOTE",
            subjectCode: updated.subjectCode,
            branch: updated.branch,
            interests: [updated.subjectName, updated.subjectCode, updated.branch].filter(Boolean),
          },
          weight: 3,
        }).catch(() => {});
      }

      return NextResponse.json({
        success: true,
        upvotesCount: updated?.upvotesCount || 0,
        downvotesCount: updated?.downvotesCount || 0,
      });
    }

    if (action === "DOWNVOTE") {
      const [updated] = await db
        .update(academicResources)
        .set({
          downvotesCount: sql`${academicResources.downvotesCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(academicResources.id, id))
        .returning();

      return NextResponse.json({
        success: true,
        upvotesCount: updated?.upvotesCount || 0,
        downvotesCount: updated?.downvotesCount || 0,
      });
    }

    if (action === "UNDO_UPVOTE") {
      const [updated] = await db
        .update(academicResources)
        .set({
          upvotesCount: sql`GREATEST(0, ${academicResources.upvotesCount} - 1)`,
          updatedAt: new Date(),
        })
        .where(eq(academicResources.id, id))
        .returning();

      return NextResponse.json({
        success: true,
        upvotesCount: updated?.upvotesCount || 0,
        downvotesCount: updated?.downvotesCount || 0,
      });
    }

    if (action === "UNDO_DOWNVOTE") {
      const [updated] = await db
        .update(academicResources)
        .set({
          downvotesCount: sql`GREATEST(0, ${academicResources.downvotesCount} - 1)`,
          updatedAt: new Date(),
        })
        .where(eq(academicResources.id, id))
        .returning();

      return NextResponse.json({
        success: true,
        upvotesCount: updated?.upvotesCount || 0,
        downvotesCount: updated?.downvotesCount || 0,
      });
    }

    if (action === "SAVE") {
      const resource = await db.query.academicResources.findFirst({
        where: eq(academicResources.id, id),
      });

      if (!resource) {
        return NextResponse.json({ error: "Resource not found" }, { status: 404 });
      }

      if (user) {
        const profile = await getCachedUserProfile(user.id);
        if (profile) {
          await db
            .insert(savedAcademicResources)
            .values({
              id: crypto.randomUUID(),
              profileId: profile.id,
              resourceId: id,
              semester: resource.semester || 1,
            })
            .onConflictDoNothing();

          trackUserBehavior({
            userId: user.id,
            eventType: "POST_BOOKMARK",
            targetType: "POST",
            targetId: id,
            metadata: {
              resourceId: id,
              action: "SAVE",
              resourceType: resource.resourceType,
              subjectCode: resource.subjectCode,
              branch: resource.branch,
              semester: resource.semester,
              interests: [resource.subjectName, resource.subjectCode, resource.resourceType].filter(Boolean),
            },
            weight: 4,
          }).catch(() => {});
        }
      }

      return NextResponse.json({ success: true, isSaved: true });
    }

    if (action === "UNSAVE") {
      if (user) {
        const profile = await getCachedUserProfile(user.id);
        if (profile) {
          await db
            .delete(savedAcademicResources)
            .where(
              and(eq(savedAcademicResources.profileId, profile.id), eq(savedAcademicResources.resourceId, id))
            );
        }
      }

      return NextResponse.json({ success: true, isSaved: false });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating academic analytics:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
