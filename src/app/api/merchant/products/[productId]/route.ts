import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import { resolveMerchantSession } from "@/lib/merchant-session";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const merchant = await resolveMerchantSession();
    if (!merchant) {
      return NextResponse.json({ error: "Unauthorized or merchant not found" }, { status: 401 });
    }

    const { productId } = await params;
    const db = getDb();

    const product = await db.query.products.findFirst({
      where: and(eq(products.id, productId), eq(products.merchantId, merchant.id)),
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product, merchant });
  } catch (error) {
    console.error("Error fetching single merchant product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const merchant = await resolveMerchantSession();
    if (!merchant) {
      return NextResponse.json({ error: "Unauthorized or merchant not found" }, { status: 401 });
    }

    const { productId } = await params;
    const db = getDb();
    const body = (await req.json()) as Record<string, any>;

    const {
      isAvailable,
      price,
      originalPrice,
      name,
      description,
      categoryName,
      imageUrl,
      isVeg,
      isNonVeg,
      addons,
      preparationTime,
    } = body;

    const updatePayload: Record<string, any> = { updatedAt: new Date() };
    if (typeof isAvailable === "boolean") updatePayload.isAvailable = isAvailable;
    if (typeof price === "number") updatePayload.price = Math.max(0, price);
    if (typeof originalPrice === "number") updatePayload.originalPrice = originalPrice;
    if (typeof name === "string") updatePayload.name = name.trim();
    if (typeof description === "string") updatePayload.description = description.trim();
    if (typeof categoryName === "string") updatePayload.categoryName = categoryName.trim();
    if (typeof imageUrl === "string") updatePayload.imageUrl = imageUrl.trim();
    if (typeof isVeg === "boolean") updatePayload.isVeg = isVeg;
    if (typeof isNonVeg === "boolean") updatePayload.isNonVeg = isNonVeg;
    if (addons !== undefined) updatePayload.addons = addons;
    if (preparationTime !== undefined) updatePayload.preparationTime = preparationTime;
    if (typeof isVeg === "boolean") {
      updatePayload.options = [
        {
          name: "Diet",
          choices: [isVeg ? "Veg" : "Non-Veg"],
          defaultChoice: isVeg ? "Veg" : "Non-Veg",
        },
      ];
    }

    const [updatedProduct] = await db
      .update(products)
      .set(updatePayload)
      .where(and(eq(products.id, productId), eq(products.merchantId, merchant.id)))
      .returning();

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error("Error updating single merchant product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const merchant = await resolveMerchantSession();
    if (!merchant) {
      return NextResponse.json({ error: "Unauthorized or merchant not found" }, { status: 401 });
    }

    const { productId } = await params;
    const db = getDb();

    await db.delete(products).where(and(eq(products.id, productId), eq(products.merchantId, merchant.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting single merchant product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
