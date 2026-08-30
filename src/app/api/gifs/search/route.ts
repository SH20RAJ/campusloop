import { type NextRequest, NextResponse } from "next/server";

// No hardcoded fallback: a real key used to live here, which put it in the
// public git history and in every build.
const GIPHY_API_KEY =
  process.env.GIPHY_API_KEY || process.env.GIFY_API_KEY || process.env.NEXT_PUBLIC_GIPHY_API_KEY || "";

export interface GifItem {
  id: string;
  title: string;
  url: string;
  previewUrl: string;
  width: number;
  height: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "24", 10), 50);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  try {
    const endpoint = q
      ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(
          q
        )}&limit=${limit}&offset=${offset}&rating=pg-13&lang=en`
      : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=${limit}&offset=${offset}&rating=pg-13`;

    const res = await fetch(endpoint, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error(`GIPHY API error: ${res.statusText}`);
    }

    const data = (await res.json()) as {
      data?: Array<{
        id: string;
        title: string;
        images?: {
          fixed_height?: { url: string; width: string; height: string };
          fixed_height_small?: { url: string; width: string; height: string };
          original?: { url: string; width: string; height: string };
        };
      }>;
    };

    const gifs: GifItem[] = (data.data || [])
      .map((item) => ({
        id: item.id,
        title: item.title || "Campus Reaction GIF",
        url: item.images?.fixed_height?.url || item.images?.original?.url || "",
        previewUrl:
          item.images?.fixed_height_small?.url ||
          item.images?.fixed_height?.url ||
          item.images?.original?.url ||
          "",
        width: parseInt(item.images?.fixed_height?.width || "200", 10),
        height: parseInt(item.images?.fixed_height?.height || "200", 10),
      }))
      .filter((g) => Boolean(g.url));

    return NextResponse.json({ gifs });
  } catch (error) {
    console.error("[GIF Search] Error fetching from GIPHY:", error);
    return NextResponse.json({ gifs: [], error: "Failed to fetch GIFs" }, { status: 500 });
  }
}
