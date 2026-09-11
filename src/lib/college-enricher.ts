/**
 * External College Data Enrichment Helper
 * Fetches verified public information from Wikipedia REST API with strict educational classification.
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

const EDU_KEYWORDS =
  /\b(university|college|institute|faculty|campus|higher education|polytechnic|academy|school of|autonomous|deemed|vidyapeeth|vishwavidyalaya|iit|nit|iiit|iim)\b/i;

const NON_EDU_KEYWORDS =
  /\b(actress|actor|politician|cricketer|minister|mla|mp|film|cinema|album|song|carbine|rifle|chakra|river|dynasty)\b/i;

export async function fetchCollegeWikipediaSummary(collegeName: string): Promise<EnrichedCollegeData | null> {
  try {
    // Clean up college name for Wikipedia search
    const cleanQuery = collegeName
      .replace(/\(.*?\)/g, "")
      .replace(/,.*$/, "")
      .replace(/\b(Pvt|Ltd|Govt|Autonomous|Deemed)\b/gi, "")
      .trim();

    // Search specifically with educational context
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      `${cleanQuery} university OR ${cleanQuery} college OR ${cleanQuery} institute`
    )}&format=json&utf8=1&srlimit=3`;

    const searchRes = await fetch(searchUrl, {
      headers: { "User-Agent": "CampusLoopBot/1.0 (https://campusloop.space; contact@campusloop.space)" },
    });

    if (!searchRes.ok) return null;
    const searchJson = (await searchRes.json()) as {
      query?: { search?: { title: string; snippet?: string }[] };
    };

    const results = searchJson.query?.search || [];
    if (results.length === 0) return null;

    // Pick the first result that is actually about an educational institution
    let bestTitle: string | null = null;
    for (const item of results) {
      const text = `${item.title} ${item.snippet || ""}`.toLowerCase();
      if (EDU_KEYWORDS.test(text) && !NON_EDU_KEYWORDS.test(text)) {
        bestTitle = item.title;
        break;
      }
    }

    if (!bestTitle) return null;

    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bestTitle)}`;
    const res = await fetch(summaryUrl, {
      headers: { "User-Agent": "CampusLoopBot/1.0 (https://campusloop.space; contact@campusloop.space)" },
      next: { revalidate: 86400 },
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      title?: string;
      description?: string;
      extract?: string;
      thumbnail?: { source: string };
      originalimage?: { source: string };
      content_urls?: { desktop?: { page?: string } };
      coordinates?: { lat: number; lon: number };
    };

    const extract = data.extract || "";
    const desc = data.description || "";
    const combined = `${data.title} ${desc} ${extract}`.toLowerCase();

    // Strict validation: must be an educational institution
    if (!EDU_KEYWORDS.test(combined) || NON_EDU_KEYWORDS.test(combined)) {
      return null;
    }

    return {
      title: data.title || bestTitle,
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
