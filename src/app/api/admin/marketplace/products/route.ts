import { resolveAdminSession } from "@/app/admin/_lib/guard";
import { getDb } from "@/db";
import { products } from "@/db/schema";
import { desc,eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    await resolveAdminSession();
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const merchantId = searchParams.get("merchantId");

    const whereClause = merchantId ? eq(products.merchantId, merchantId) : undefined;

    const allProducts = await db.query.products.findMany({
      where: whereClause,
      orderBy: [desc(products.createdAt)],
      with: {
        merchant: {
          columns: {
            id: true,
            name: true,
            slug: true,
            categorySlug: true,
            address: true,
          },
        },
      },
    });

    return NextResponse.json({ products: allProducts });
  } catch (error) {
    console.error("Error in admin products GET:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await resolveAdminSession();
    const db = getDb();

    const body = (await req.json()) as Record<string, any>;
    const {
      merchantId,
      name,
      description,
      price,
      originalPrice,
      categoryName,
      imageUrl,
      isVeg = true,
      isAvailable = true,
    } = body;

    if (!merchantId || !name || typeof price !== "number") {
      return NextResponse.json(
        { error: "Merchant ID, Name, and Price are required" },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(products)
      .values({
        merchantId,
        name: name.trim(),
        description: description?.trim() || null,
        price: Math.max(0, price),
        originalPrice: typeof originalPrice === "number" ? originalPrice : null,
        categoryName: categoryName?.trim() || "General",
        imageUrl: imageUrl?.trim() || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=600&fit=crop",
        options: [{ name: "Diet", choices: [isVeg ? "Veg" : "Non-Veg"], defaultChoice: isVeg ? "Veg" : "Non-Veg" }],
        isAvailable: Boolean(isAvailable),
        status: "ACTIVE",
      })
      .returning();

    return NextResponse.json({ success: true, product: created });
  } catch (error) {
    console.error("Error in admin products POST:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await resolveAdminSession();
    const db = getDb();

    const body = (await req.json()) as Record<string, any>;
    const { id, isAvailable, price, originalPrice, name, categoryName, description, imageUrl, isVeg } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const updatePayload: Record<string, any> = { updatedAt: new Date() };
    if (typeof isAvailable === "boolean") updatePayload.isAvailable = isAvailable;
    if (typeof price === "number") updatePayload.price = Math.max(0, price);
    if (typeof originalPrice === "number") updatePayload.originalPrice = originalPrice;
    if (typeof name === "string") updatePayload.name = name.trim();
    if (typeof categoryName === "string") updatePayload.categoryName = categoryName.trim();
    if (typeof description === "string") updatePayload.description = description.trim();
    if (typeof imageUrl === "string") updatePayload.imageUrl = imageUrl.trim();
    if (typeof isVeg === "boolean") {
      updatePayload.options = [{ name: "Diet", choices: [isVeg ? "Veg" : "Non-Veg"], defaultChoice: isVeg ? "Veg" : "Non-Veg" }];
    }

    const [updated] = await db
      .update(products)
      .set(updatePayload)
      .where(eq(products.id, id))
      .returning();

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error("Error in admin products PATCH:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await resolveAdminSession();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const db = getDb();
    await db.delete(products).where(eq(products.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product in admin:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
