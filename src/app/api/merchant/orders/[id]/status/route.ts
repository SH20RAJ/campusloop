import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { marketplaceOrders } from "@/db/schema";
import { resolveMerchantSession } from "@/lib/merchant-session";

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
    const merchant = await resolveMerchantSession();
    if (!merchant) {
      return NextResponse.json({ error: "Unauthorized or merchant not found" }, { status: 401 });
    }

    const db = getDb();
    const body = (await req.json()) as {
      status?: string;
      rejectionReason?: string;
    };

    if (!body.status || !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const order = await db.query.marketplaceOrders.findFirst({
      where: and(eq(marketplaceOrders.id, id), eq(marketplaceOrders.merchantId, merchant.id)),
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const [updated] = await db
      .update(marketplaceOrders)
      .set({
        status: body.status,
        rejectionReason: body.rejectionReason || null,
        updatedAt: new Date(),
      })
      .where(eq(marketplaceOrders.id, id))
      .returning();

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
