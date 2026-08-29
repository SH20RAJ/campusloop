import { resolveAdminSession } from "@/app/admin/_lib/guard";
import { getDb } from "@/db";
import { merchants } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await resolveAdminSession();
    const db = getDb();

    const allMerchants = await db.query.merchants.findMany({
      orderBy: [desc(merchants.createdAt)],
      with: {
        institution: {
          columns: { id: true, name: true, slug: true },
        },
        products: {
          columns: { id: true, name: true, price: true },
        },
        orders: {
          columns: { id: true, total: true, status: true },
        },
      },
    });

    return NextResponse.json({ merchants: allMerchants });
  } catch (error) {
    console.error("Error in admin merchants GET:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await resolveAdminSession();
    const db = getDb();

    const body = (await req.json()) as Record<string, any>;
    const {
      name,
      slug,
      institutionId,
      categorySlug,
      description,
      address,
      locationPin,
      phone,
      email,
      logoUrl,
      coverUrl,
      deliveryFee,
      minOrderValue,
      estimatedPrepTime,
    } = body;

    if (!name || !institutionId || !address) {
      return NextResponse.json({ error: "Name, Institution, and Address are required" }, { status: 400 });
    }

    const cleanSlug =
      slug?.trim() ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const [newMerchant] = await db
      .insert(merchants)
      .values({
        name: name.trim(),
        slug: cleanSlug,
        institutionId,
        categorySlug: categorySlug || "food",
        description: description?.trim() || null,
        address: address.trim(),
        locationPin: locationPin?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        logoUrl:
          logoUrl ||
          "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=300&fit=crop",
        coverUrl:
          coverUrl ||
          "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=1200&h=400&fit=crop",
        deliveryFee: typeof deliveryFee === "number" ? deliveryFee : 20,
        minOrderValue: typeof minOrderValue === "number" ? minOrderValue : 80,
        estimatedPrepTime: estimatedPrepTime || "15–20 min",
        status: "ACTIVE",
        isOpen: true,
      })
      .returning();

    return NextResponse.json({ success: true, merchant: newMerchant });
  } catch (error) {
    console.error("Error in admin merchant creation:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
