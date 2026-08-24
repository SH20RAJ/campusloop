import { getDb } from "@/db";
import { institutions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

async function main() {
  console.log("Adding columns to institutions table if not existing...");
  const db = getDb();

  await db.execute(sql`
    ALTER TABLE institutions 
    ADD COLUMN IF NOT EXISTS logo_url text,
    ADD COLUMN IF NOT EXISTS banner_url text,
    ADD COLUMN IF NOT EXISTS nirf_rank integer,
    ADD COLUMN IF NOT EXISTS description text,
    ADD COLUMN IF NOT EXISTS extra_data jsonb;
  `);

  console.log("Updating BIT Mesra institution data...");
  const bitMesraLogo = "https://upload.wikimedia.org/wikipedia/en/d/d2/Birla_Institute_of_Technology_Mesra.png";
  const bitMesraBanner = "https://bitmesra.ac.in/UploadedDocuments/user_pratyush_869/Header/Header4b13a61283f54f04a30eed41dfa3f4dd_1600x520px%20webbanner%20rankings.jpg";

  await db
    .update(institutions)
    .set({
      logoUrl: bitMesraLogo,
      bannerUrl: bitMesraBanner,
      nirfRank: 53,
      description:
        "Birla Institute of Technology, Mesra (BIT Mesra) is a premier Indian deemed research university established in 1955 by philanthropist and industrialist B. M. Birla. Located in Ranchi, Jharkhand across a scenic 780-acre campus with state-of-the-art labs and vibrant fest culture.",
      extraData: {
        wikipediaUrl: "https://en.wikipedia.org/wiki/Birla_Institute_of_Technology,_Mesra",
        summary:
          "BIT Mesra is known for its pioneering engineering, space engineering & rocketry, computer science, and architecture departments. It hosts BITOTSAV, eastern India's largest annual socio-cultural festival.",
        campusAcreage: "780 Acres",
        affiliation: "Deemed University, UGC & AICTE Approved",
        chancellor: "C. K. Birla",
        naacGrade: "A Grade",
      },
    })
    .where(eq(institutions.slug, "bitmesra"));

  console.log("Successfully migrated institutions and updated BIT Mesra!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
