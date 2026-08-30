import { and, desc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { marketplaceOrders } from "@/db/schema";
import { resolveMerchantSession } from "@/lib/merchant-session";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const merchant = await resolveMerchantSession();
    if (!merchant) {
      return NextResponse.json({ error: "Unauthorized or merchant not found" }, { status: 401 });
    }

    const db = getDb();
    const { searchParams } = new URL(req.url);
    const statusTab = searchParams.get("status"); // "new", "preparing", "ready", "delivery", "completed", "all"

    const conditions: any[] = [eq(marketplaceOrders.merchantId, merchant.id)];

    if (statusTab === "new") {
      conditions.push(eq(marketplaceOrders.status, "PLACED"));
    } else if (statusTab === "preparing") {
      conditions.push(inArray(marketplaceOrders.status, ["ACCEPTED", "PREPARING"]));
    } else if (statusTab === "ready") {
      conditions.push(inArray(marketplaceOrders.status, ["READY", "READY_FOR_PICKUP"]));
    } else if (statusTab === "delivery") {
      conditions.push(eq(marketplaceOrders.status, "OUT_FOR_DELIVERY"));
    } else if (statusTab === "completed") {
      conditions.push(inArray(marketplaceOrders.status, ["DELIVERED", "PICKED_UP"]));
    } else if (statusTab === "cancelled") {
      conditions.push(inArray(marketplaceOrders.status, ["REJECTED", "CANCELLED"]));
    }

    const orders = await db.query.marketplaceOrders.findMany({
      where: and(...conditions),
      orderBy: [desc(marketplaceOrders.createdAt)],
      with: {
        student: {
          columns: { id: true, username: true, displayName: true, avatarUrl: true },
        },
        items: true,
      },
    });

    return NextResponse.json({ orders, merchant });
  } catch (error) {
    console.error("Error fetching merchant orders:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
