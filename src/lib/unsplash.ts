/**
 * Server-side Unsplash API integration.
 * Securely communicates with Unsplash using process.env.UNSPLASH_ACCESS_KEY.
 * Implements in-memory caching to stay well within free API rate limits.
 */

export interface UnsplashPhoto {
  id: string;
  url: string;
  thumbUrl: string;
  fullUrl: string;
  alt: string;
  photographerName: string;
  photographerUsername: string;
  photographerUrl: string;
  downloadLocation: string;
}

interface UnsplashSearchResponse {
  photos: UnsplashPhoto[];
  total: number;
  totalPages: number;
}

// In-memory cache to prevent burning Unsplash hourly rate limits
const cache = new Map<string, { data: UnsplashSearchResponse; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

const CURATED_FALLBACK_PHOTOS: UnsplashPhoto[] = [
  {
    id: "hackathon-1",
    url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=400&q=80",
    fullUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=85",
    alt: "Hackathon coding and collaboration sprint",
    photographerName: "Alex Kotliarskyi",
    photographerUsername: "frantic",
    photographerUrl: "https://unsplash.com/@frantic",
    downloadLocation: "",
  },
  {
    id: "fest-1",
    url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=400&q=80",
    fullUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=85",
    alt: "College cultural fest concert and lights",
    photographerName: "Stem List",
    photographerUsername: "stemlist",
    photographerUrl: "https://unsplash.com/@stemlist",
    downloadLocation: "",
  },
  {
    id: "code-1",
    url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=80",
    fullUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=85",
    alt: "Students working on laptops at tech event",
    photographerName: "Headway",
    photographerUsername: "headwayio",
    photographerUrl: "https://unsplash.com/@headwayio",
    downloadLocation: "",
  },
  {
    id: "workshop-1",
    url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=400&q=80",
    fullUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1600&q=85",
    alt: "Design and tech workshop presentation",
    photographerName: "Campaign Creators",
    photographerUsername: "campaign_creators",
    photographerUrl: "https://unsplash.com/@campaign_creators",
    downloadLocation: "",
  },
  {
    id: "gaming-1",
    url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80",
    fullUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=85",
    alt: "Esports tournament stage and neon screens",
    photographerName: "Florian Olivo",
    photographerUsername: "florianolv",
    photographerUrl: "https://unsplash.com/@florianolv",
    downloadLocation: "",
  },
  {
    id: "campus-1",
    url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    thumbUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=400&q=80",
    fullUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=85",
    alt: "College students studying together outdoors on campus",
    photographerName: "Priscilla Du Preez",
    photographerUsername: "priscilladupreez",
    photographerUrl: "https://unsplash.com/@priscilladupreez",
    downloadLocation: "",
  },
];

export async function searchUnsplashPhotos({
  query,
  page = 1,
  perPage = 12,
  orientation = "landscape",
}: {
  query: string;
  page?: number;
  perPage?: number;
  orientation?: "landscape" | "portrait" | "squarish" | "all";
}): Promise<UnsplashSearchResponse> {
  const cleanQuery = query.trim() || "campus college technology";
  const cacheKey = `${cleanQuery}:${page}:${perPage}:${orientation}`;

  // 1. Check in-memory cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const accessKey =
    process.env.UNSPLASH_ACCESS_KEY ||
    process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY ||
    "";

  if (!accessKey) {
    return {
      photos: CURATED_FALLBACK_PHOTOS,
      total: CURATED_FALLBACK_PHOTOS.length,
      totalPages: 1,
    };
  }

  try {
    const url = new URL("https://api.unsplash.com/search/photos");
    url.searchParams.set("query", cleanQuery);
    url.searchParams.set("page", String(page));
    url.searchParams.set("per_page", String(Math.min(perPage, 30)));
    if (orientation !== "all") {
      url.searchParams.set("orientation", orientation);
    }

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        "Accept-Version": "v1",
      },
      // Cache server-side for 10 minutes
      next: { revalidate: 600 },
    });

    if (!res.ok) {
      console.warn(`[Unsplash] API request returned status ${res.status}: ${res.statusText}`);
      // Return fallback photos
      return {
        photos: CURATED_FALLBACK_PHOTOS,
        total: CURATED_FALLBACK_PHOTOS.length,
        totalPages: 1,
      };
    }

    const data = (await res.json()) as {
      results?: any[];
      total?: number;
      total_pages?: number;
    };
    const results: any[] = data.results || [];

    const photos: UnsplashPhoto[] = results.map((item: any) => {
      // Build optimized high-quality crop url
      const rawUrl = item.urls?.raw || item.urls?.regular || item.urls?.full;
      const optimizedUrl = rawUrl ? `${rawUrl}&auto=format&fit=crop&w=1200&q=80` : item.urls?.regular || "";

      const thumb = item.urls?.small || item.urls?.thumb || optimizedUrl;

      return {
        id: item.id,
        url: optimizedUrl,
        thumbUrl: thumb,
        fullUrl: item.urls?.full || optimizedUrl,
        alt: item.alt_description || item.description || cleanQuery,
        photographerName: item.user?.name || "Unsplash Creator",
        photographerUsername: item.user?.username || "unsplash",
        photographerUrl: item.user?.links?.html
          ? `${item.user.links.html}?utm_source=campusloop&utm_medium=referral`
          : "https://unsplash.com/?utm_source=campusloop&utm_medium=referral",
        downloadLocation: item.links?.download_location || "",
      };
    });

    const response: UnsplashSearchResponse = {
      photos,
      total: data.total || photos.length,
      totalPages: data.total_pages || 1,
    };

    cache.set(cacheKey, { data: response, timestamp: Date.now() });
    return response;
  } catch (error) {
    console.error("[Unsplash] Search error:", error);
    return {
      photos: CURATED_FALLBACK_PHOTOS,
      total: CURATED_FALLBACK_PHOTOS.length,
      totalPages: 1,
    };
  }
}

/**
 * Triggers the download endpoint as required by Unsplash API guidelines
 * when a user selects a photo.
 */
export async function trackUnsplashDownload(downloadLocation: string): Promise<void> {
  if (!downloadLocation) return;
  const accessKey =
    process.env.UNSPLASH_ACCESS_KEY ||
    process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY ||
    "";

  if (!accessKey) return;

  try {
    const url = new URL(downloadLocation);
    url.searchParams.set("client_id", accessKey);
    await fetch(url.toString(), {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    });
  } catch (err) {
    // Non-blocking telemetry error
    console.warn("[Unsplash] Download ping failed:", err);
  }
}
