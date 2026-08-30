import { getDb } from "@/db";
import { products } from "@/db/schema";
import { resolveMerchantSession } from "@/lib/merchant-session";
import { and, asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const merchant = await resolveMerchantSession();
    if (!merchant) {
      return NextResponse.json({ error: "Unauthorized or merchant not found" }, { status: 401 });
    }

    const db = getDb();
    const storeProducts = await db.query.products.findMany({
      where: eq(products.merchantId, merchant.id),
      orderBy: [asc(products.displayOrder), asc(products.createdAt)],
    });

    return NextResponse.json({ products: storeProducts, merchant });
  } catch (error) {
    console.error("Error fetching merchant products:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
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
      price,
      originalPrice,
      categoryName,
      imageUrl,
      preparationTime = "15 min",
      options = [],
      addons = [],
      isVeg = true,
      fulfillmentModes = ["delivery", "pickup"],
    } = body;

    if (!name || typeof price !== "number") {
      return NextResponse.json({ error: "Product name and numeric price are required" }, { status: 400 });
    }

    const mergedOptions = [...options];
    if (typeof isVeg === "boolean") {
      mergedOptions.unshift({
        name: "Diet",
        choices: [isVeg ? "Veg" : "Non-Veg"],
        defaultChoice: isVeg ? "Veg" : "Non-Veg",
      });
    }

    const [createdProduct] = await db
      .insert(products)
      .values({
        merchantId: merchant.id,
        name: name.trim(),
        description: description?.trim() || null,
        price: Math.max(0, price),
        originalPrice: typeof originalPrice === "number" ? originalPrice : null,
        categoryName: categoryName?.trim() || "Popular Items",
        imageUrl: imageUrl?.trim() || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=600&fit=crop",
        preparationTime,
        options: mergedOptions,
        addons,
        fulfillmentModes,
        isAvailable: true,
        status: "ACTIVE",
      })
      .returning();

    return NextResponse.json({ success: true, product: createdProduct });
  } catch (error) {
    console.error("Error creating merchant product:", error);
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
    const { id, isAvailable, price, originalPrice, name, description, categoryName, imageUrl, isVeg } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const updatePayload: Record<string, any> = { updatedAt: new Date() };
    if (typeof isAvailable === "boolean") updatePayload.isAvailable = isAvailable;
    if (typeof price === "number") updatePayload.price = Math.max(0, price);
    if (typeof originalPrice === "number") updatePayload.originalPrice = originalPrice;
    if (typeof name === "string") updatePayload.name = name.trim();
    if (typeof description === "string") updatePayload.description = description.trim();
    if (typeof categoryName === "string") updatePayload.categoryName = categoryName.trim();
    if (typeof imageUrl === "string") updatePayload.imageUrl = imageUrl.trim();
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
      .where(and(eq(products.id, id), eq(products.merchantId, merchant.id)))
      .returning();

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error("Error updating merchant product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const merchant = await resolveMerchantSession();
    if (!merchant) {
      return NextResponse.json({ error: "Unauthorized or merchant not found" }, { status: 401 });
    }

    const db = getDb();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    await db
      .delete(products)
      .where(and(eq(products.id, productId), eq(products.merchantId, merchant.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting merchant product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
