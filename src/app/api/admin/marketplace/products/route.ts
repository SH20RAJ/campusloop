import { getDb } from "@/db";
import { merchants, products } from "@/db/schema";
import { resolveAdminSession } from "@/app/admin/_lib/guard";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await resolveAdminSession();
    const db = getDb();

    const allProducts = await db.query.products.findMany({
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

export async function PATCH(req: Request) {
  try {
    await resolveAdminSession();
    const db = getDb();

    const body = (await req.json()) as Record<string, any>;
    const { id, isAvailable, price, name, category } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const updatePayload: Record<string, any> = { updatedAt: new Date() };
    if (typeof isAvailable === "boolean") updatePayload.isAvailable = isAvailable;
    if (typeof price === "number") updatePayload.price = Math.max(0, price);
    if (typeof name === "string") updatePayload.name = name.trim();
    if (typeof category === "string") updatePayload.category = category.trim();

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
