import { getDb } from "@/db";
import { marketplaceOrders, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
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

    const order = await db.query.marketplaceOrders.findFirst({
      where: and(eq(marketplaceOrders.id, id), eq(marketplaceOrders.studentId, profile.id)),
      with: {
        merchant: true,
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error fetching order tracking:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
