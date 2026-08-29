import { getDb } from "@/db";
import { marketplaceOrders, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { rejectViewerWrite } from "@/lib/viewer";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const VALID_STATUSES = [
  "PLACED",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "READY_FOR_PICKUP",
  "PICKED_UP",
  "REJECTED",
  "CANCELLED",
];

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

    const body = (await req.json()) as {
      status?: string;
      rejectionReason?: string;
    };

    if (!body.status || !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const order = await db.query.marketplaceOrders.findFirst({
      where: eq(marketplaceOrders.id, id),
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const [updatedOrder] = await db
      .update(marketplaceOrders)
      .set({
        status: body.status,
        rejectionReason: body.rejectionReason || order.rejectionReason,
        paymentStatus:
          body.status === "DELIVERED" || body.status === "PICKED_UP"
            ? "PAID"
            : order.paymentStatus,
        updatedAt: new Date(),
      })
      .where(eq(marketplaceOrders.id, id))
      .returning();

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
