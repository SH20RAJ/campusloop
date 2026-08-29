import { getDb } from "@/db";
import {
merchantBusinessHours,
merchants,
merchantUsers,
userProfiles,
} from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { rejectViewerWrite } from "@/lib/viewer";
import { asc,eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
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

    let merchantUser = await db.query.merchantUsers.findFirst({
      where: eq(merchantUsers.userId, profile.id),
      with: { merchant: true },
    });

    let merchant = merchantUser?.merchant;
    if (!merchant) {
      const firstMerchant = await db.query.merchants.findFirst({
        where: eq(merchants.institutionId, profile.institutionId),
      });
      merchant = firstMerchant || (await db.query.merchants.findFirst());
    }

    if (!merchant) {
      return NextResponse.json({ error: "No merchant found" }, { status: 404 });
    }

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

    let merchantUser = await db.query.merchantUsers.findFirst({
      where: eq(merchantUsers.userId, profile.id),
      with: { merchant: true },
    });

    let merchant = merchantUser?.merchant;
    if (!merchant) {
      merchant = await db.query.merchants.findFirst({
        where: eq(merchants.institutionId, profile.institutionId),
      });
      if (!merchant) merchant = await db.query.merchants.findFirst();
    }

    if (!merchant) {
      return NextResponse.json({ error: "No merchant found" }, { status: 404 });
    }

    const body = (await req.json()) as Record<string, any>;
    const updatePayload: Record<string, any> = { updatedAt: new Date() };

    if (typeof body.isOpen === "boolean") updatePayload.isOpen = body.isOpen;
    if (typeof body.name === "string") updatePayload.name = body.name.trim();
    if (typeof body.description === "string") updatePayload.description = body.description.trim();
    if (typeof body.phone === "string") updatePayload.phone = body.phone.trim();
    if (typeof body.address === "string") updatePayload.address = body.address.trim();
    if (typeof body.locationPin === "string") updatePayload.locationPin = body.locationPin.trim();
    if (typeof body.isDeliveryEnabled === "boolean") updatePayload.isDeliveryEnabled = body.isDeliveryEnabled;
    if (typeof body.isPickupEnabled === "boolean") updatePayload.isPickupEnabled = body.isPickupEnabled;
    if (typeof body.deliveryFee === "number") updatePayload.deliveryFee = Math.max(0, body.deliveryFee);
    if (typeof body.minOrderValue === "number") updatePayload.minOrderValue = Math.max(0, body.minOrderValue);
    if (typeof body.freeDeliveryAbove === "number") updatePayload.freeDeliveryAbove = body.freeDeliveryAbove;
    if (typeof body.estimatedPrepTime === "string") updatePayload.estimatedPrepTime = body.estimatedPrepTime.trim();
    if (typeof body.pickupInstructions === "string") updatePayload.pickupInstructions = body.pickupInstructions.trim();

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
