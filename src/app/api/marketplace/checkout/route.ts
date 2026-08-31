import { and, eq, inArray, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { marketplaceOrderItems, marketplaceOrders, merchants, products, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { withUniqueOrderNumber } from "@/lib/marketplace/order-number";
import { type CartItemInput, type FulfillmentType, priceMerchantOrder } from "@/lib/marketplace/pricing";
import { rejectViewerWrite } from "@/lib/viewer";

export const dynamic = "force-dynamic";

/** One request may not span more baskets than a person could plausibly have open. */
const MAX_MERCHANT_ORDERS = 5;

interface CheckoutPayload {
  merchantOrders: Array<{
    merchantId: string;
    fulfillmentType: FulfillmentType;
    customerNote?: string;
    paymentMethod?: "COD" | "UPI" | "CAMPUS_PAY";
    items: CartItemInput[];
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

    const payload = (await req.json().catch(() => null)) as CheckoutPayload | null;
    if (!payload?.merchantOrders?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }
    if (payload.merchantOrders.length > MAX_MERCHANT_ORDERS) {
      return NextResponse.json({ error: "Too many merchants in one order" }, { status: 400 });
    }

    // ── Phase 1: price everything before writing anything ──
    //
    // The old flow interleaved validation and inserts and `continue`d past
    // anything it disliked, so a partially-valid cart produced a partial order
    // and still reported success. Pricing every basket up front means the
    // student either gets the order they confirmed or a specific reason they
    // cannot have it.
    const validated: Array<{
      merchantId: string;
      categorySlug: string;
      fulfillmentType: FulfillmentType;
      paymentMethod: "COD" | "UPI" | "CAMPUS_PAY";
      customerNote: string | null;
      lines: Array<{
        productId: string;
        productNameSnapshot: string;
        unitPriceSnapshot: number;
        quantity: number;
        selectedOptions: Record<string, string>;
        selectedAddons: Array<{ name: string; price: number }>;
        subtotal: number;
      }>;
      subtotal: number;
      deliveryFee: number;
      total: number;
    }> = [];

    for (const basket of payload.merchantOrders) {
      const merchant = await db.query.merchants.findFirst({
        where: eq(merchants.id, basket.merchantId),
      });

      if (!merchant) {
        return NextResponse.json({ error: "That store is no longer available." }, { status: 400 });
      }

      // A student may only order from stores on their own campus.
      if (merchant.institutionId !== profile.institutionId) {
        return NextResponse.json({ error: `${merchant.name} does not serve your campus.` }, { status: 403 });
      }

      const productIds = Array.from(new Set((basket.items ?? []).map((item) => item.productId)));
      if (productIds.length === 0) {
        return NextResponse.json({ error: "This order has no items." }, { status: 400 });
      }

      // Scoped to the merchant in SQL as well as in the pricer — defence in
      // depth against a product id borrowed from another store.
      const dbProducts = await db.query.products.findMany({
        where: and(inArray(products.id, productIds), eq(products.merchantId, merchant.id)),
      });

      const result = priceMerchantOrder({
        merchant,
        products: dbProducts,
        items: basket.items,
        fulfillmentType: basket.fulfillmentType,
      });

      if (!result.ok) {
        return NextResponse.json(
          { error: result.message, code: result.code, merchantId: merchant.id },
          { status: 409 }
        );
      }

      validated.push({
        merchantId: merchant.id,
        categorySlug: merchant.categorySlug,
        fulfillmentType: basket.fulfillmentType,
        paymentMethod: basket.paymentMethod ?? "COD",
        customerNote: basket.customerNote?.trim() || null,
        ...result.order,
      });
    }

    // ── Phase 2: write ──
    const createdOrderIds: string[] = [];

    for (const basket of validated) {
      const newOrder = await withUniqueOrderNumber(async (orderNumber) => {
        const [row] = await db
          .insert(marketplaceOrders)
          .values({
            orderNumber,
            studentId: profile.id,
            merchantId: basket.merchantId,
            institutionId: profile.institutionId,
            categorySlug: basket.categorySlug,
            fulfillmentType: basket.fulfillmentType,
            status: "PLACED",
            subtotal: basket.subtotal,
            deliveryFee: basket.deliveryFee,
            discount: 0,
            total: basket.total,
            paymentStatus: basket.paymentMethod === "COD" ? "COD" : "PENDING",
            paymentMethod: basket.paymentMethod,
            customerNote: basket.customerNote,
            deliveryAddress: payload.deliveryAddress,
          })
          .returning();
        return row;
      });

      // One multi-value insert rather than a statement per line.
      await db.insert(marketplaceOrderItems).values(
        basket.lines.map((line) => ({
          orderId: newOrder.id,
          productId: line.productId,
          productNameSnapshot: line.productNameSnapshot,
          unitPriceSnapshot: line.unitPriceSnapshot,
          quantity: line.quantity,
          selectedOptions: line.selectedOptions,
          selectedAddons: line.selectedAddons,
          subtotal: line.subtotal,
        }))
      );

      // Decrement tracked stock. The guard in the UPDATE makes the decrement
      // itself the concurrency check: two students racing for the last unit
      // cannot both drive the column negative, because the second UPDATE
      // matches no row.
      await Promise.all(
        basket.lines.map((line) =>
          db
            .update(products)
            .set({ stockQuantity: sql`${products.stockQuantity} - ${line.quantity}` })
            .where(
              and(
                eq(products.id, line.productId),
                sql`${products.stockQuantity} IS NOT NULL`,
                sql`${products.stockQuantity} >= ${line.quantity}`
              )
            )
        )
      );

      createdOrderIds.push(newOrder.id);
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
