import { getDb } from "@/db";
import { marketplaceOrders,userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { and,desc,eq,inArray } from "drizzle-orm";
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

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter"); // "active", "completed", "cancelled", "all"

    const conditions: any[] = [eq(marketplaceOrders.studentId, profile.id)];

    if (filter === "active") {
      conditions.push(
        inArray(marketplaceOrders.status, [
          "PLACED",
          "ACCEPTED",
          "PREPARING",
          "READY",
          "OUT_FOR_DELIVERY",
          "READY_FOR_PICKUP",
        ])
      );
    } else if (filter === "completed") {
      conditions.push(inArray(marketplaceOrders.status, ["DELIVERED", "PICKED_UP"]));
    } else if (filter === "cancelled") {
      conditions.push(inArray(marketplaceOrders.status, ["REJECTED", "CANCELLED"]));
    }

    const orders = await db.query.marketplaceOrders.findMany({
      where: and(...conditions),
      orderBy: [desc(marketplaceOrders.createdAt)],
      with: {
        merchant: {
          columns: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            phone: true,
            address: true,
            categorySlug: true,
          },
        },
        items: true,
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching student marketplace orders:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
