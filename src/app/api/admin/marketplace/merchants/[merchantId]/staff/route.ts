import { resolveAdminSession } from "@/app/admin/_lib/guard";
import { getDb } from "@/db";
import { merchantUsers, userProfiles } from "@/db/schema";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ merchantId: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    await resolveAdminSession();
    const { merchantId } = await params;
    const db = getDb();

    const staffList = await db.query.merchantUsers.findMany({
      where: eq(merchantUsers.merchantId, merchantId),
      orderBy: [desc(merchantUsers.createdAt)],
      with: {
        user: {
          columns: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            campusRole: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ staff: staffList });
  } catch (error) {
    console.error("Error in admin merchant staff GET:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    await resolveAdminSession();
    const { merchantId } = await params;
    const db = getDb();

    const body = (await req.json()) as Record<string, any>;
    const { usernameOrEmail, role = "OWNER" } = body;

    if (!usernameOrEmail || typeof usernameOrEmail !== "string") {
      return NextResponse.json(
        { error: "Username or email is required" },
        { status: 400 }
      );
    }

    const queryClean = usernameOrEmail.trim().replace(/^@/, "");

    // Find the user by username or email
    const targetUser = await db.query.userProfiles.findFirst({
      where: or(
        ilike(userProfiles.username, queryClean),
        ilike(userProfiles.email, queryClean)
      ),
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: `No user found with username or email: "${usernameOrEmail}"` },
        { status: 404 }
      );
    }

    // Check if already mapped
    const existing = await db.query.merchantUsers.findFirst({
      where: and(
        eq(merchantUsers.merchantId, merchantId),
        eq(merchantUsers.userId, targetUser.id)
      ),
    });

    if (existing) {
      // Update role if already mapped
      const [updated] = await db
        .update(merchantUsers)
        .set({ role, updatedAt: new Date() })
        .where(eq(merchantUsers.id, existing.id))
        .returning();

      return NextResponse.json({ success: true, staff: updated, updated: true });
    }

    // Insert new merchant user association
    const [created] = await db
      .insert(merchantUsers)
      .values({
        merchantId,
        userId: targetUser.id,
        role,
      })
      .returning();

    return NextResponse.json({ success: true, staff: created, user: targetUser });
  } catch (error) {
    console.error("Error in admin merchant staff POST:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    await resolveAdminSession();
    const { merchantId } = await params;
    const db = getDb();

    const { searchParams } = new URL(req.url);
    const merchantUserId = searchParams.get("id");
    const targetUserId = searchParams.get("userId");

    if (merchantUserId) {
      await db.delete(merchantUsers).where(eq(merchantUsers.id, merchantUserId));
    } else if (targetUserId) {
      await db
        .delete(merchantUsers)
        .where(
          and(
            eq(merchantUsers.merchantId, merchantId),
            eq(merchantUsers.userId, targetUserId)
          )
        );
    } else {
      return NextResponse.json(
        { error: "Staff ID or User ID is required" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in admin merchant staff DELETE:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
