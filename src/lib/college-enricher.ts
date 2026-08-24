/**
 * External College Data Enrichment Helper
 * Fetches verified public information from Wikipedia REST API & NIRF data
 */

export interface EnrichedCollegeData {
  title: string;
  description?: string;
  extract?: string;
  thumbnailUrl?: string;
  originalImageUrl?: string;
  wikipediaUrl?: string;
  coordinates?: { lat: number; lon: number };
}

export async function fetchCollegeWikipediaSummary(collegeName: string): Promise<EnrichedCollegeData | null> {
  try {
    // Clean up college name for Wikipedia search (remove common noise words if needed)
    const cleanQuery = collegeName
      .replace(/\(.*?\)/g, "")
      .replace(/,.*$/, "")
      .trim();

    // 1. First attempt direct summary lookup
    const directUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(cleanQuery)}`;
    let res = await fetch(directUrl, {
      headers: { "User-Agent": "CampusLoop/1.0 (https://campusloop.space; team@campusloop.space)" },
      next: { revalidate: 86400 },
    });

    // 2. If direct title lookup fails (404), use Wikipedia Search API to find closest match
    if (!res.ok) {
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        cleanQuery
      )}&format=json&origin=*`;
      const searchRes = await fetch(searchUrl);
      if (!searchRes.ok) return null;
      const searchJson = (await searchRes.json()) as {
        query?: { search?: { title: string }[] };
      };
      const firstResult = searchJson.query?.search?.[0];
      if (!firstResult?.title) return null;

      res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(firstResult.title)}`,
        {
          headers: { "User-Agent": "CampusLoop/1.0 (https://campusloop.space)" },
          next: { revalidate: 86400 },
        }
      );
      if (!res.ok) return null;
    }

    const data = (await res.json()) as {
      title?: string;
      description?: string;
      extract?: string;
      thumbnail?: { source: string };
      originalimage?: { source: string };
      content_urls?: { desktop?: { page?: string } };
      coordinates?: { lat: number; lon: number };
    };

    if (!data.title || (!data.extract && !data.description)) return null;

    return {
      title: data.title,
      description: data.description,
      extract: data.extract,
      thumbnailUrl: data.thumbnail?.source,
      originalImageUrl: data.originalimage?.source,
      wikipediaUrl: data.content_urls?.desktop?.page,
      coordinates: data.coordinates,
    };
  } catch (error) {
    console.error("Error enriching college data:", error);
    return null;
  }
}
