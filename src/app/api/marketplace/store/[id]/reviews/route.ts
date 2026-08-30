import { getDb } from "@/db";
import { marketplaceReviews, merchants, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { rejectViewerWrite } from "@/lib/viewer";
import { and, desc, eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = getDb();

    // Find merchant by id or slug
    const merchant = await db.query.merchants.findFirst({
      where: sql`${merchants.id} = ${id} OR ${merchants.slug} = ${id}`,
    });

    if (!merchant) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const reviews = await db.query.marketplaceReviews.findMany({
      where: eq(marketplaceReviews.merchantId, merchant.id),
      orderBy: [desc(marketplaceReviews.createdAt)],
      with: {
        student: {
          columns: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            campusRole: true,
            isVerified: true,
          },
        },
      },
    });

    // Compute star distribution breakdown
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let ratingSum = 0;

    for (const r of reviews) {
      const star = Math.max(1, Math.min(5, r.rating));
      distribution[star] = (distribution[star] || 0) + 1;
      ratingSum += star;
    }

    const totalCount = reviews.length;
    const averageRating = totalCount > 0 ? (ratingSum / totalCount).toFixed(1) : merchant.rating;

    // Check if current authenticated user has reviewed
    let userReview = null;
    try {
      const user = await hexclaveServerApp.getUser();
      if (user) {
        const profile = await db.query.userProfiles.findFirst({
          where: eq(userProfiles.userId, user.id),
        });
        if (profile) {
          userReview = reviews.find((r) => r.studentId === profile.id) || null;
        }
      }
    } catch {}

    return NextResponse.json({
      reviews,
      totalCount,
      averageRating,
      distribution,
      userReview,
    });
  } catch (error) {
    console.error("Error in store reviews GET:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in to leave a review." }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    const viewerBlocked = await rejectViewerWrite(profile);
    if (viewerBlocked) return viewerBlocked;

    const merchant = await db.query.merchants.findFirst({
      where: sql`${merchants.id} = ${id} OR ${merchants.slug} = ${id}`,
    });

    if (!merchant) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const body = (await req.json()) as Record<string, any>;
    const { rating = 5, comment = "" } = body;

    const ratingNum = Math.max(1, Math.min(5, parseInt(String(rating), 10) || 5));

    // Check if user already reviewed this merchant
    const existingReview = await db.query.marketplaceReviews.findFirst({
      where: and(
        eq(marketplaceReviews.merchantId, merchant.id),
        eq(marketplaceReviews.studentId, profile.id)
      ),
    });

    let savedReview;
    if (existingReview) {
      // Update existing review
      const [updated] = await db
        .update(marketplaceReviews)
        .set({
          rating: ratingNum,
          comment: comment?.trim() || null,
          updatedAt: new Date(),
        })
        .where(eq(marketplaceReviews.id, existingReview.id))
        .returning();
      savedReview = updated;
    } else {
      // Insert new review
      const [created] = await db
        .insert(marketplaceReviews)
        .values({
          merchantId: merchant.id,
          studentId: profile.id,
          rating: ratingNum,
          comment: comment?.trim() || null,
        })
        .returning();
      savedReview = created;
    }

    // Recompute merchant's average rating and reviewCount
    const allReviews = await db.query.marketplaceReviews.findMany({
      where: eq(marketplaceReviews.merchantId, merchant.id),
    });

    const newReviewCount = allReviews.length;
    const newRatingSum = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const newAvgRating = (newRatingSum / newReviewCount).toFixed(1);

    await db
      .update(merchants)
      .set({
        rating: newAvgRating,
        reviewCount: newReviewCount,
        updatedAt: new Date(),
      })
      .where(eq(merchants.id, merchant.id));

    return NextResponse.json({
      success: true,
      review: savedReview,
      merchantRating: newAvgRating,
      merchantReviewCount: newReviewCount,
    });
  } catch (error) {
    console.error("Error in store reviews POST:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
