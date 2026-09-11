import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const dbUrl = process.env.DB_URL;
if (!dbUrl) {
  console.error("DB_URL is required");
  process.exit(1);
}

const sql = neon(dbUrl);

const NON_EDU_KEYWORDS = [
  "actress", "actor", "politician", "cricketer", "minister", "mla from", "lok sabha",
  "film directed", "film produced", "indian cinema", "playback singer", "box office",
  "served as the minister", "chief minister", "member of parliament", "is a 20", "is a 19",
  "hockey player", "freedom fighter", "major river", "ancient dynasty", "nagavardhu",
  "semi-automatic carbine", "soviet small arms", "primary chakra", "sports thriller television"
];

const CURATED_CAMPUS_BANNERS = [
  "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1562774053-701939374585?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=1600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=1600&auto=format&fit=crop&q=80",
];

async function main() {
  console.log("Checking for corrupted institution records...");
  const colleges = (await sql`
    SELECT id, slug, name, state, district, logo_url, banner_url, description, extra_data 
    FROM institutions;
  `) as Array<{
    id: string;
    slug: string;
    name: string;
    state: string | null;
    district: string | null;
    logo_url: string | null;
    banner_url: string | null;
    description: string | null;
    extra_data: any;
  }>;

  let cleaned = 0;

  for (let i = 0; i < colleges.length; i++) {
    const c = colleges[i];
    const desc = (c.description || "").toLowerCase();
    const wiki = (c.extra_data?.wikipediaUrl || "").toLowerCase();

    // Check if corrupted
    const isBadDesc = NON_EDU_KEYWORDS.some((k) => desc.includes(k));
    const isBadWiki = NON_EDU_KEYWORDS.some((k) => wiki.includes(k));
    const isVidya = c.slug === "vidya" || desc.includes("vidya balan") || wiki.includes("vidya_balan");
    const isGenericList = desc.startsWith("state private universities in india are regulated under");

    if (isBadDesc || isBadWiki || isVidya || isGenericList) {
      console.log(`Cleaning corrupted college: ${c.name} (${c.slug})`);
      
      const cleanDesc = `${c.name} is an educational campus in ${c.district ? c.district + ", " : ""}${c.state || "India"}. Official verified student hub on CampusLoop.`;
      const bannerFallback = CURATED_CAMPUS_BANNERS[i % CURATED_CAMPUS_BANNERS.length];

      // Erase corrupted person/weapon/actor images and replace with clean fallback
      await sql`
        UPDATE institutions
        SET 
          logo_url = NULL,
          banner_url = ${bannerFallback},
          description = ${cleanDesc},
          extra_data = ${JSON.stringify({ ...c.extra_data, wikipediaUrl: undefined, cleanedReason: "Scraper falsely matched non-educational entity" })}::jsonb,
          updated_at = NOW()
        WHERE id = ${c.id};
      `;

      cleaned++;
    }
  }

  console.log(`Successfully cleaned ${cleaned} corrupted institution entries!`);
}

main().catch(console.error);
