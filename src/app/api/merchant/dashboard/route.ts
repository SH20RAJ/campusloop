import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { marketplaceOrders, products } from "@/db/schema";
import { resolveMerchantSession } from "@/lib/merchant-session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const merchant = await resolveMerchantSession();
    if (!merchant) {
      return NextResponse.json({ error: "Unauthorized or merchant not found" }, { status: 401 });
    }

    const db = getDb();

    // Fetch all orders for this merchant
    const allMerchantOrders = await db.query.marketplaceOrders.findMany({
      where: eq(marketplaceOrders.merchantId, merchant.id),
      orderBy: [desc(marketplaceOrders.createdAt)],
      with: {
        student: {
          columns: { id: true, username: true, displayName: true, avatarUrl: true },
        },
        items: true,
      },
    });

    // Fetch active products count
    const merchantProducts = await db.query.products.findMany({
      where: eq(products.merchantId, merchant.id),
    });

    // Calculate metrics
    const totalOrders = allMerchantOrders.length;
    const activeOrders = allMerchantOrders.filter(
      (o) => !["DELIVERED", "REJECTED", "CANCELLED", "PICKED_UP", "RETURNED"].includes(o.status)
    );
    const completedOrders = allMerchantOrders.filter((o) =>
      ["DELIVERED", "PICKED_UP", "RETURNED"].includes(o.status)
    );
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    return NextResponse.json({
      merchant,
      metrics: {
        totalOrders,
        activeOrdersCount: activeOrders.length,
        completedOrdersCount: completedOrders.length,
        totalRevenue,
        totalProducts: merchantProducts.length,
        rating: merchant.rating,
        reviewCount: merchant.reviewCount,
      },
      activeOrders,
      recentOrders: allMerchantOrders.slice(0, 15),
    });
  } catch (error) {
    console.error("Error in merchant dashboard GET:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
