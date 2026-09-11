import { type NextRequest, NextResponse } from "next/server";
import { requireAdminProfile } from "@/app/admin/_lib/guard";
import { getDb } from "@/db";
import { academicResources } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await requireAdminProfile();
    const body = (await req.json()) as any;
    const { action, resourceId, isVerified } = body;

    const db = getDb();

    if (action === "toggle_verify") {
      if (!resourceId) {
        return NextResponse.json({ error: "Missing resourceId" }, { status: 400 });
      }

      const [updated] = await db
        .update(academicResources)
        .set({ isVerified: Boolean(isVerified) })
        .where(eq(academicResources.id, resourceId))
        .returning();

      return NextResponse.json({
        success: true,
        resource: updated,
        message: isVerified ? "Resource marked as verified" : "Resource marked as unverified",
      });
    }

    if (action === "delete") {
      if (!resourceId) {
        return NextResponse.json({ error: "Missing resourceId" }, { status: 400 });
      }

      await db.delete(academicResources).where(eq(academicResources.id, resourceId));

      return NextResponse.json({
        success: true,
        message: "Resource deleted from academic vault",
      });
    }

    return NextResponse.json({ error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (err: any) {
    console.error("[Admin Academics API Error]:", err);
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
