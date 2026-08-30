import { eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { marketplaceOrderItems, marketplaceOrders, merchants, products, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { rejectViewerWrite } from "@/lib/viewer";

export const dynamic = "force-dynamic";

interface CartItemPayload {
  productId: string;
  merchantId: string;
  quantity: number;
  selectedOptions?: Record<string, string>;
  selectedAddons?: Array<{ name: string; price: number }>;
}

interface CheckoutPayload {
  merchantOrders: Array<{
    merchantId: string;
    fulfillmentType: "DELIVERY" | "PICKUP" | "BOOKING";
    customerNote?: string;
    paymentMethod?: "COD" | "UPI" | "CAMPUS_PAY";
    items: CartItemPayload[];
  }>;
  deliveryAddress: {
    hostelName?: string;
    roomNumber?: string;
    phone?: string;
    pickupInstructions?: string;
    rentalStartDate?: string;
    rentalEndDate?: string;
    drivingLicenseNumber?: string;
    aadhaarLast4?: string;
  };
}

export async function POST(req: Request) {
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

    const payload = (await req.json()) as CheckoutPayload;
    if (!payload.merchantOrders || payload.merchantOrders.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const createdOrderIds: string[] = [];

    for (const mo of payload.merchantOrders) {
      if (!mo.items || mo.items.length === 0) continue;

      const merchant = await db.query.merchants.findFirst({
        where: eq(merchants.id, mo.merchantId),
      });

      if (!merchant) continue;

      // Fetch all products in this merchant order
      const productIds = mo.items.map((i) => i.productId);
      const dbProducts = await db.query.products.findMany({
        where: inArray(products.id, productIds),
      });

      const productMap = new Map(dbProducts.map((p) => [p.id, p]));

      // Calculate subtotal
      let subtotal = 0;
      const orderItemsToInsert: Array<{
        productId: string;
        productNameSnapshot: string;
        unitPriceSnapshot: number;
        quantity: number;
        selectedOptions: Record<string, string>;
        selectedAddons: Array<{ name: string; price: number }>;
        subtotal: number;
      }> = [];

      for (const item of mo.items) {
        const prod = productMap.get(item.productId);
        if (!prod) continue;

        const basePrice = prod.price;
        const addonsTotal = (item.selectedAddons || []).reduce((sum, a) => sum + (a.price || 0), 0);
        const itemUnitTotal = basePrice + addonsTotal;
        const itemSubtotal = itemUnitTotal * Math.max(1, item.quantity);

        subtotal += itemSubtotal;

        orderItemsToInsert.push({
          productId: prod.id,
          productNameSnapshot: prod.name,
          unitPriceSnapshot: itemUnitTotal,
          quantity: Math.max(1, item.quantity),
          selectedOptions: item.selectedOptions || {},
          selectedAddons: item.selectedAddons || [],
          subtotal: itemSubtotal,
        });
      }

      if (orderItemsToInsert.length === 0) continue;

      // Calculate delivery fee
      let deliveryFee = 0;
      if (mo.fulfillmentType === "DELIVERY") {
        if (!merchant.freeDeliveryAbove || subtotal < merchant.freeDeliveryAbove) {
          deliveryFee = merchant.deliveryFee || 20;
        }
      }

      const total = subtotal + deliveryFee;

      // Generate random unique 4-digit order number (e.g. CL-1042)
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `CL-${randomSuffix}`;

      // Insert Order
      const [newOrder] = await db
        .insert(marketplaceOrders)
        .values({
          orderNumber,
          studentId: profile.id,
          merchantId: merchant.id,
          institutionId: profile.institutionId,
          categorySlug: merchant.categorySlug,
          fulfillmentType: mo.fulfillmentType,
          status: "PLACED",
          subtotal,
          deliveryFee,
          discount: 0,
          total,
          paymentStatus: mo.paymentMethod === "COD" ? "COD" : "PENDING",
          paymentMethod: mo.paymentMethod || "COD",
          customerNote: mo.customerNote || null,
          deliveryAddress: payload.deliveryAddress,
        })
        .returning();

      // Insert Order Items
      for (const oi of orderItemsToInsert) {
        await db.insert(marketplaceOrderItems).values({
          orderId: newOrder.id,
          productId: oi.productId,
          productNameSnapshot: oi.productNameSnapshot,
          unitPriceSnapshot: oi.unitPriceSnapshot,
          quantity: oi.quantity,
          selectedOptions: oi.selectedOptions,
          selectedAddons: oi.selectedAddons,
          subtotal: oi.subtotal,
        });
      }

      createdOrderIds.push(newOrder.id);
    }

    if (createdOrderIds.length === 0) {
      return NextResponse.json({ error: "Could not process orders" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      orderIds: createdOrderIds,
      primaryOrderId: createdOrderIds[0],
    });
  } catch (error) {
    console.error("Error creating marketplace orders:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
