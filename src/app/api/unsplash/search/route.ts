import { type NextRequest, NextResponse } from "next/server";
import { searchUnsplashPhotos } from "@/lib/unsplash";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "campus";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const perPage = parseInt(searchParams.get("per_page") || "16", 10);
  const orientationParam = searchParams.get("orientation") || "landscape";

  const orientation =
    orientationParam === "portrait" || orientationParam === "squarish" || orientationParam === "all"
      ? orientationParam
      : "landscape";

  try {
    const result = await searchUnsplashPhotos({
      query: q,
      page: isNaN(page) ? 1 : Math.max(1, page),
      perPage: isNaN(perPage) ? 16 : Math.min(Math.max(4, perPage), 30),
      orientation,
    });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
      },
    });
  } catch (error) {
    console.error("[Unsplash API] Search endpoint error:", error);
    return NextResponse.json(
      { error: "Failed to search photos", photos: [], total: 0, totalPages: 0 },
      { status: 500 }
    );
  }
}
