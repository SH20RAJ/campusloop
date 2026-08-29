import { getDb } from "@/db";
import {
  marketplaceOrders,
  merchants,
  merchantUsers,
  products,
  userProfiles,
} from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { desc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
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

    // Find merchant linked to this user, or first active merchant for fallback
    let merchantUser = await db.query.merchantUsers.findFirst({
      where: eq(merchantUsers.userId, profile.id),
      with: { merchant: true },
    });

    let merchant = merchantUser?.merchant;

    // If user is not yet explicitly mapped to a merchant, fallback to first active merchant in their campus
    if (!merchant) {
      const firstMerchant = await db.query.merchants.findFirst({
        where: eq(merchants.institutionId, profile.institutionId),
      });
      merchant = firstMerchant || (await db.query.merchants.findFirst());
    }

    if (!merchant) {
      return NextResponse.json({ error: "No merchant found" }, { status: 404 });
    }

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

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const todayOrders = allMerchantOrders.filter(
      (o) => new Date(o.createdAt) >= todayStart
    );

    const todayRevenue = todayOrders
      .filter((o) => o.status !== "REJECTED" && o.status !== "CANCELLED")
      .reduce((sum, o) => sum + o.total, 0);

    const pendingOrders = allMerchantOrders.filter(
      (o) => o.status === "PLACED"
    );

    const activeOrders = allMerchantOrders.filter((o) =>
      [
        "PLACED",
        "ACCEPTED",
        "PREPARING",
        "READY",
        "OUT_FOR_DELIVERY",
        "READY_FOR_PICKUP",
      ].includes(o.status)
    );

    const avgOrderValue =
      todayOrders.length > 0 ? Math.round(todayRevenue / todayOrders.length) : 180;

    const totalProducts = await db.query.products.findMany({
      where: eq(products.merchantId, merchant.id),
    });

    return NextResponse.json({
      merchant,
      stats: {
        todayRevenue,
        todayOrdersCount: todayOrders.length,
        pendingCount: pendingOrders.length,
        activeCount: activeOrders.length,
        avgOrderValue,
        totalProductsCount: totalProducts.length,
      },
      incomingOrders: pendingOrders,
      recentOrders: allMerchantOrders.slice(0, 8),
    });
  } catch (error) {
    console.error("Error fetching merchant dashboard:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
