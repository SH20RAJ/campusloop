import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const dbUrl = process.env.DB_URL;
if (!dbUrl) {
  console.error("DB_URL is required");
  process.exit(1);
}

const sql = neon(dbUrl);

// Curated high-res aesthetic campus banners for fallback
const AESTHETIC_CAMPUS_BANNERS = [
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1562774053-701939374585?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=1600&auto=format&fit=crop&q=80",
];

// Curated college logos for major Indian universities
const FAMOUS_COLLEGES_MANUAL_MEDIA: Record<string, { logo: string; banner: string }> = {
  iitb: {
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1d/IIT_Bombay_Logo.svg/500px-IIT_Bombay_Logo.svg.png",
    banner: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/IIT_Bombay_Main_Building.jpg/1280px-IIT_Bombay_Main_Building.jpg",
  },
  iitd: {
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/fd/Indian_Institute_of_Technology_Delhi_Logo.svg/500px-Indian_Institute_of_Technology_Delhi_Logo.svg.png",
    banner: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/IIT_Delhi_Main_Building.jpg/1280px-IIT_Delhi_Main_Building.jpg",
  },
  iitm: {
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/6/69/IIT_Madras_Logo.svg/500px-IIT_Madras_Logo.svg.png",
    banner: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/IIT_Madras_Building.jpg/1280px-IIT_Madras_Building.jpg",
  },
  iitkgp: {
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1c/IIT_Kharagpur_Logo.svg/500px-IIT_Kharagpur_Logo.svg.png",
    banner: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Old_building_of_IIT_Kharagpur.jpg/1280px-Old_building_of_IIT_Kharagpur.jpg",
  },
  iitr: {
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/06/IIT_Roorkee_logo.svg/500px-IIT_Roorkee_logo.svg.png",
    banner: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Main_Building%2C_IIT_Roorkee.jpg/1280px-Main_Building%2C_IIT_Roorkee.jpg",
  },
  iitk: {
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a3/IIT_Kanpur_Logo.svg/500px-IIT_Kanpur_Logo.svg.png",
    banner: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/IIT_Kanpur_Airstrip.jpg/1280px-IIT_Kanpur_Airstrip.jpg",
  },
  bitspilani: {
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/BITS_Pilani-Logo.svg/500px-BITS_Pilani-Logo.svg.png",
    banner: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Clock_Tower%2C_BITS_Pilani.jpg/1280px-Clock_Tower%2C_BITS_Pilani.jpg",
  },
  bitmesra: {
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Birla_Institute_of_Technology%2C_Mesra_logo.png/500px-Birla_Institute_of_Technology%2C_Mesra_logo.png",
    banner: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/BIT_Mesra_Main_Building.jpg/1280px-BIT_Mesra_Main_Building.jpg",
  },
  vit: {
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c5/Vellore_Institute_of_Technology_seal_2017.svg/500px-Vellore_Institute_of_Technology_seal_2017.svg.png",
    banner: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/VIT_University_Vellore.jpg/1280px-VIT_University_Vellore.jpg",
  },
  vitap: {
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c5/Vellore_Institute_of_Technology_seal_2017.svg/500px-Vellore_Institute_of_Technology_seal_2017.svg.png",
    banner: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&auto=format&fit=crop&q=80",
  },
  iisertirupati: {
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/b/b8/IISER_Tirupati_Logo.png/500px-IISER_Tirupati_Logo.png",
    banner: "https://images.unsplash.com/photo-1562774053-701939374585?w=1600&auto=format&fit=crop&q=80",
  },
  iimv: {
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/Indian_Institute_of_Management_Visakhapatnam_Logo.svg/500px-Indian_Institute_of_Management_Visakhapatnam_Logo.svg.png",
    banner: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&auto=format&fit=crop&q=80",
  },
  spav: {
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/SPA_Vijayawada_Logo.png/500px-SPA_Vijayawada_Logo.png",
    banner: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=1600&auto=format&fit=crop&q=80",
  },
  iiits: {
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/52/IIIT_Sri_City_logo.png/500px-IIIT_Sri_City_logo.png",
    banner: "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=1600&auto=format&fit=crop&q=80",
  },
  iiitk: {
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/3/30/IIITDM_Kurnool_logo.png/500px-IIITDM_Kurnool_logo.png",
    banner: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1600&auto=format&fit=crop&q=80",
  },
  aiimsmangalagiri: {
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/9/96/AIIMS_Mangalagiri_Logo.png/500px-AIIMS_Mangalagiri_Logo.png",
    banner: "https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=1600&auto=format&fit=crop&q=80",
  },
};

interface WikipediaSummary {
  title?: string;
  extract?: string;
  description?: string;
  thumbnail?: { source: string; width: number; height: number };
  originalimage?: { source: string; width: number; height: number };
  content_urls?: { desktop?: { page?: string } };
}

async function fetchWikipediaForCollege(name: string): Promise<WikipediaSummary | null> {
  try {
    // Clean name for Wikipedia search
    const cleanSearch = name
      .replace(/\(.*?\)/g, "")
      .replace(/,.*$/, "")
      .replace(/\b(Pvt|Ltd|Govt|Autonomous|Deemed)\b/gi, "")
      .trim();

    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      cleanSearch
    )}&format=json&utf8=1&srlimit=1`;

    const searchRes = await fetch(searchUrl, {
      headers: { "User-Agent": "CampusLoopBot/1.0 (https://campusloop.space; contact@campusloop.space)" },
    });

    if (!searchRes.ok) return null;
    const searchData = (await searchRes.json()) as { query?: { search?: Array<{ title: string }> } };
    const bestTitle = searchData.query?.search?.[0]?.title;

    if (!bestTitle) return null;

    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(bestTitle)}`;
    const summaryRes = await fetch(summaryUrl, {
      headers: { "User-Agent": "CampusLoopBot/1.0 (https://campusloop.space; contact@campusloop.space)" },
    });

    if (!summaryRes.ok) return null;
    return (await summaryRes.json()) as WikipediaSummary;
  } catch {
    return null;
  }
}

async function main() {
  console.log("Fetching all institutions from Neon DB...");
  const colleges = (await sql`
    SELECT id, slug, name, state, logo_url, banner_url, description, extra_data 
    FROM institutions 
    ORDER BY created_at ASC;
  `) as Array<{
    id: string;
    slug: string;
    name: string;
    state: string | null;
    logo_url: string | null;
    banner_url: string | null;
    description: string | null;
    extra_data: any;
  }>;

  console.log(`Found ${colleges.length} institutions. Beginning enrichment...`);

  let updatedCount = 0;
  const concurrency = 6;

  for (let i = 0; i < colleges.length; i += concurrency) {
    const chunk = colleges.slice(i, i + concurrency);

    await Promise.all(
      chunk.map(async (college, chunkIdx) => {
        const index = i + chunkIdx;
        const manual = FAMOUS_COLLEGES_MANUAL_MEDIA[college.slug];

        let logoUrl = manual?.logo || college.logo_url;
        let bannerUrl = manual?.banner || college.banner_url;
        let description = college.description;
        let wikiUrl: string | undefined = college.extra_data?.wikipediaUrl;

        // If not manual and missing logo or banner, query Wikipedia
        if (!logoUrl || !bannerUrl || !description) {
          const wiki = await fetchWikipediaForCollege(college.name);
          if (wiki) {
            if (!logoUrl && wiki.thumbnail?.source) {
              logoUrl = wiki.thumbnail.source;
            }
            if (!bannerUrl && wiki.originalimage?.source) {
              bannerUrl = wiki.originalimage.source;
            }
            if (!description && wiki.extract) {
              description = wiki.extract.slice(0, 500);
            }
            if (!wikiUrl && wiki.content_urls?.desktop?.page) {
              wikiUrl = wiki.content_urls.desktop.page;
            }
          }
        }

        // Fallback banner if still empty
        if (!bannerUrl) {
          const bannerIndex = (index + (college.name.length || 0)) % AESTHETIC_CAMPUS_BANNERS.length;
          bannerUrl = AESTHETIC_CAMPUS_BANNERS[bannerIndex];
        }

        // Prepare extra_data
        const updatedExtra = {
          ...(college.extra_data || {}),
          ...(wikiUrl ? { wikipediaUrl: wikiUrl } : {}),
        };

        await sql`
          UPDATE institutions 
          SET 
            logo_url = ${logoUrl || null},
            banner_url = ${bannerUrl},
            description = ${description || null},
            extra_data = ${JSON.stringify(updatedExtra)}::jsonb,
            updated_at = NOW()
          WHERE id = ${college.id};
        `;

        updatedCount++;
        if (updatedCount % 50 === 0 || updatedCount === colleges.length) {
          console.log(`[${updatedCount}/${colleges.length}] Processed: ${college.name} (${college.slug})`);
        }
      })
    );
  }

  console.log(`✨ Successfully enriched ${updatedCount} colleges with official Wikipedia logos and banners!`);
}

main().catch((err) => {
  console.error("Enrichment failed:", err);
  process.exit(1);
});
