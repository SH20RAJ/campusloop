import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { resolveAdminSession } from "@/app/admin/_lib/guard";
import { getDb } from "@/db";
import { merchants, products } from "@/db/schema";
import {
  generateMerchantPassword,
  hashMerchantPassword,
  stripMerchantSecrets,
} from "@/lib/marketplace/merchant-password";

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

    return NextResponse.json({ merchant: stripMerchantSecrets(merchant) });
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
      loginUsername,
      loginPassword,
    } = body;

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name.trim();
    if (categorySlug !== undefined) {
      updateData.categorySlug = categorySlug;
      const verticalTypeMap: Record<string, string> = {
        food: "FOOD",
        rentals: "RENTALS",
        barber: "BARBER",
        laundry: "LAUNDRY",
        water: "WATER",
        essentials: "MART",
      };
      updateData.verticalType = verticalTypeMap[categorySlug?.toLowerCase()] || "FOOD";
    }
    if (body.verticalType !== undefined) {
      updateData.verticalType = body.verticalType;
    }
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (address !== undefined) updateData.address = address.trim();
    if (locationPin !== undefined) updateData.locationPin = locationPin?.trim() || null;
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (email !== undefined) updateData.email = email?.trim() || null;
    if (upiId !== undefined) updateData.upiId = upiId?.trim() || null;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl?.trim() || null;
    if (coverUrl !== undefined) updateData.coverUrl = coverUrl?.trim() || null;
    if (deliveryFee !== undefined)
      updateData.deliveryFee = typeof deliveryFee === "number" ? deliveryFee : parseInt(deliveryFee, 10) || 0;
    if (minOrderValue !== undefined)
      updateData.minOrderValue =
        typeof minOrderValue === "number" ? minOrderValue : parseInt(minOrderValue, 10) || 0;
    if (estimatedPrepTime !== undefined) updateData.estimatedPrepTime = estimatedPrepTime?.trim() || null;
    if (status !== undefined) updateData.status = status;
    if (isOpen !== undefined) updateData.isOpen = Boolean(isOpen);
    if (loginUsername !== undefined) updateData.loginUsername = loginUsername?.trim().toLowerCase() || null;
    // Hashed on the way in. An empty value clears the credential, which
    // leaves the account unable to sign in until a new password is issued —
    // that is the intended meaning of clearing it.
    let issuedPassword: string | null = null;

    // `rotatePassword: true` lets the admin UI ask for a new credential without
    // inventing one itself — password generation belongs on the server, next to
    // the hashing, not in a browser bundle.
    if (body.rotatePassword === true) {
      issuedPassword = generateMerchantPassword();
      updateData.loginPassword = await hashMerchantPassword(issuedPassword);
    } else if (typeof loginPassword === "string" && loginPassword.trim()) {
      // An empty field means "leave the password alone", the same as every
      // other change-password form. Treating blank as "clear the credential"
      // would let an admin lock a store out just by saving the edit page.
      const trimmed = loginPassword.trim();
      issuedPassword = trimmed;
      updateData.loginPassword = await hashMerchantPassword(trimmed);
    }

    const [updated] = await db
      .update(merchants)
      .set(updateData)
      .where(eq(merchants.id, merchantId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      merchant: stripMerchantSecrets(updated),
      // Echoed once so the admin can hand it over; never retrievable later.
      temporaryPassword: issuedPassword,
    });
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
