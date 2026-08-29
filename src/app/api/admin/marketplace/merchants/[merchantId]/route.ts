import { resolveAdminSession } from "@/app/admin/_lib/guard";
import { getDb } from "@/db";
import { merchants,products } from "@/db/schema";
import { desc,eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ merchantId: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    await resolveAdminSession();
    const { merchantId } = await params;
    const db = getDb();

    const merchant = await db.query.merchants.findFirst({
      where: eq(merchants.id, merchantId),
      with: {
        institution: {
          columns: { id: true, name: true, slug: true },
        },
        products: {
          orderBy: [desc(products.createdAt)],
        },
        offers: true,
        reviews: true,
        orders: {
          orderBy: (orders, { desc }) => [desc(orders.createdAt)],
          limit: 20,
        },
      },
    });

    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
    }

    return NextResponse.json({ merchant });
  } catch (error) {
    console.error("Error in admin single merchant GET:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    await resolveAdminSession();
    const { merchantId } = await params;
    const db = getDb();

    const body = (await req.json()) as Record<string, any>;
    const {
      name,
      categorySlug,
      description,
      address,
      locationPin,
      phone,
      email,
      upiId,
      logoUrl,
      coverUrl,
      deliveryFee,
      minOrderValue,
      estimatedPrepTime,
      status,
      isOpen,
    } = body;

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name.trim();
    if (categorySlug !== undefined) updateData.categorySlug = categorySlug;
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (address !== undefined) updateData.address = address.trim();
    if (locationPin !== undefined) updateData.locationPin = locationPin?.trim() || null;
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (email !== undefined) updateData.email = email?.trim() || null;
    if (upiId !== undefined) updateData.upiId = upiId?.trim() || null;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl?.trim() || null;
    if (coverUrl !== undefined) updateData.coverUrl = coverUrl?.trim() || null;
    if (deliveryFee !== undefined) updateData.deliveryFee = typeof deliveryFee === "number" ? deliveryFee : parseInt(deliveryFee, 10) || 0;
    if (minOrderValue !== undefined) updateData.minOrderValue = typeof minOrderValue === "number" ? minOrderValue : parseInt(minOrderValue, 10) || 0;
    if (estimatedPrepTime !== undefined) updateData.estimatedPrepTime = estimatedPrepTime?.trim() || null;
    if (status !== undefined) updateData.status = status;
    if (isOpen !== undefined) updateData.isOpen = Boolean(isOpen);

    const [updated] = await db
      .update(merchants)
      .set(updateData)
      .where(eq(merchants.id, merchantId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, merchant: updated });
  } catch (error) {
    console.error("Error updating admin merchant:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    await resolveAdminSession();
    const { merchantId } = await params;
    const db = getDb();

    await db.delete(merchants).where(eq(merchants.id, merchantId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting admin merchant:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
