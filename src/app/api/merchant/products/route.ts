import { getDb } from "@/db";
import { merchants,merchantUsers,products,userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { rejectViewerWrite } from "@/lib/viewer";
import { asc,eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
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
    const {
      name,
      description,
      price,
      originalPrice,
      categoryName,
      imageUrl,
      preparationTime,
      options,
      addons,
      fulfillmentModes,
    } = body;

    if (!name || typeof price !== "number") {
      return NextResponse.json({ error: "Name and numeric price are required" }, { status: 400 });
    }

    const [newProduct] = await db
      .insert(products)
      .values({
        merchantId: merchant.id,
        name: name.trim(),
        description: description?.trim() || null,
        price: Math.max(0, price),
        originalPrice: originalPrice ? Math.max(0, originalPrice) : null,
        categoryName: categoryName?.trim() || "Popular Items",
        imageUrl: imageUrl || null,
        preparationTime: preparationTime || "15 min",
        isAvailable: true,
        status: "ACTIVE",
        options: options || [],
        addons: addons || [],
        fulfillmentModes: fulfillmentModes || ["delivery", "pickup"],
      })
      .returning();

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error("Error creating merchant product:", error);
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

    const body = (await req.json()) as Record<string, any>;
    const { id, isAvailable, price, name, description, categoryName, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 });
    }

    const updatePayload: Record<string, any> = { updatedAt: new Date() };
    if (typeof isAvailable === "boolean") updatePayload.isAvailable = isAvailable;
    if (typeof price === "number") updatePayload.price = Math.max(0, price);
    if (typeof name === "string") updatePayload.name = name.trim();
    if (typeof description === "string") updatePayload.description = description.trim();
    if (typeof categoryName === "string") updatePayload.categoryName = categoryName.trim();
    if (typeof status === "string") updatePayload.status = status;

    const [updatedProduct] = await db
      .update(products)
      .set(updatePayload)
      .where(eq(products.id, id))
      .returning();

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error("Error updating merchant product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 });
    }

    await db.delete(products).where(eq(products.id, id));

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
