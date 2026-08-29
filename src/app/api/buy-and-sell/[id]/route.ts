import { getDb } from "@/db";
import { marketplaceItems,userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { rejectViewerWrite } from "@/lib/viewer";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    const viewerBlocked = await rejectViewerWrite(profile);
    if (viewerBlocked) return viewerBlocked;

    const item = await db.query.marketplaceItems.findFirst({
      where: eq(marketplaceItems.id, id),
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (item.sellerId !== profile.id) {
      return NextResponse.json({ error: "Forbidden: Not item owner" }, { status: 403 });
    }

    const body = (await req.json()) as { isSold?: boolean };
    const [updated] = await db
      .update(marketplaceItems)
      .set({
        isSold: typeof body.isSold === "boolean" ? body.isSold : !item.isSold,
        updatedAt: new Date(),
      })
      .where(eq(marketplaceItems.id, id))
      .returning();

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error("Error updating marketplace item:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    const viewerBlocked = await rejectViewerWrite(profile);
    if (viewerBlocked) return viewerBlocked;

    const item = await db.query.marketplaceItems.findFirst({
      where: eq(marketplaceItems.id, id),
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (item.sellerId !== profile.id) {
      return NextResponse.json({ error: "Forbidden: Not item owner" }, { status: 403 });
    }

    await db.delete(marketplaceItems).where(eq(marketplaceItems.id, id));

    return NextResponse.json({ success: true, message: "Listing deleted" });
  } catch (error) {
    console.error("Error deleting marketplace item:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
