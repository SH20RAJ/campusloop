import { getDb } from "@/db";
import { merchantBusinessHours, merchants } from "@/db/schema";
import { resolveMerchantSession } from "@/lib/merchant-session";
import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const merchant = await resolveMerchantSession();
    if (!merchant) {
      return NextResponse.json({ error: "Unauthorized or merchant not found" }, { status: 401 });
    }

    const db = getDb();
    const hours = await db.query.merchantBusinessHours.findMany({
      where: eq(merchantBusinessHours.merchantId, merchant.id),
      orderBy: [asc(merchantBusinessHours.dayOfWeek)],
    });

    return NextResponse.json({ merchant, hours });
  } catch (error) {
    console.error("Error fetching merchant store details:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const merchant = await resolveMerchantSession();
    if (!merchant) {
      return NextResponse.json({ error: "Unauthorized or merchant not found" }, { status: 401 });
    }

    const db = getDb();
    const body = (await req.json()) as Record<string, any>;
    const {
      name,
      description,
      phone,
      email,
      address,
      locationPin,
      isOpen,
      isDeliveryEnabled,
      isPickupEnabled,
      deliveryFee,
      minOrderValue,
      estimatedPrepTime,
      upiId,
      logoUrl,
      coverUrl,
    } = body;

    const updatePayload: Record<string, any> = { updatedAt: new Date() };

    if (typeof name === "string") updatePayload.name = name.trim();
    if (typeof description === "string") updatePayload.description = description.trim();
    if (typeof phone === "string") updatePayload.phone = phone.trim();
    if (typeof email === "string") updatePayload.email = email.trim();
    if (typeof address === "string") updatePayload.address = address.trim();
    if (typeof locationPin === "string") updatePayload.locationPin = locationPin.trim();
    if (typeof isOpen === "boolean") updatePayload.isOpen = isOpen;
    if (typeof isDeliveryEnabled === "boolean") updatePayload.isDeliveryEnabled = isDeliveryEnabled;
    if (typeof isPickupEnabled === "boolean") updatePayload.isPickupEnabled = isPickupEnabled;
    if (typeof deliveryFee === "number") updatePayload.deliveryFee = deliveryFee;
    if (typeof minOrderValue === "number") updatePayload.minOrderValue = minOrderValue;
    if (typeof estimatedPrepTime === "string") updatePayload.estimatedPrepTime = estimatedPrepTime.trim();
    if (typeof upiId === "string") updatePayload.upiId = upiId.trim();
    if (typeof logoUrl === "string") updatePayload.logoUrl = logoUrl.trim();
    if (typeof coverUrl === "string") updatePayload.coverUrl = coverUrl.trim();

    const [updated] = await db
      .update(merchants)
      .set(updatePayload)
      .where(eq(merchants.id, merchant.id))
      .returning();

    return NextResponse.json({ success: true, merchant: updated });
  } catch (error) {
    console.error("Error updating merchant store:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
