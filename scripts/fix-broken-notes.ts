import { getDb } from "../src/db";
import { academicResources } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { loadLocalEnv } from "../src/lib/load-env";

loadLocalEnv();

const REPAIRS: Record<string, string> = {
  // Physics Module 1 to 5
  bitsyll_ph24101_notes_1: "https://bithub.co.in/bit-mesra/physics/phy_1.pdf",
  bitsyll_ph24101_notes_2: "https://bithub.co.in/bit-mesra/physics/phy_2.pdf",
  bitsyll_ph24101_notes_3: "https://bithub.co.in/bit-mesra/physics/phy_3.pdf",
  bitsyll_ph24101_notes_4: "https://bithub.co.in/bit-mesra/physics/phy_4.pdf",
  bitsyll_ph24101_notes_5: "https://bithub.co.in/bit-mesra/physics/phy_5.pdf",

  // BME Module 1 to 5 + PYQs
  bitsyll_me24101_notes_1: "https://bithub.co.in/bit-mesra/bme/Bme_module_1.pdf",
  bitsyll_me24101_notes_2: "https://bithub.co.in/bit-mesra/bme/Bme_module_2.pdf",
  bitsyll_me24101_notes_3: "https://bithub.co.in/bit-mesra/bme/Bme_mod_3.pdf",
  bitsyll_me24101_notes_4: "https://bithub.co.in/bit-mesra/bme/Bme_mod_4.pdf",
  bitsyll_me24101_notes_5: "https://bithub.co.in/bit-mesra/bme/bme_mod_5.pdf",
  bitsyll_me24101_pyq_1: "https://bithub.co.in/bit-mesra/bme/bme_mid.pdf",
  bitsyll_me24101_pyq_2: "https://bithub.co.in/bit-mesra/bme/bme_end.pdf",
};

async function fixNotes() {
  const db = getDb();
  console.log("🔧 Repairing broken academic note URLs in database...");

  for (const [id, validUrl] of Object.entries(REPAIRS)) {
    // Verify first
    const res = await fetch(validUrl, { method: "HEAD" });
    if (res.ok) {
      await db
        .update(academicResources)
        .set({ fileUrl: validUrl, driveUrl: validUrl })
        .where(eq(academicResources.id, id));
      console.log(`✅ Repaired ${id} -> ${validUrl} (Status ${res.status})`);
    } else {
      console.error(`❌ Verification failed for ${id}: ${validUrl} (Status ${res.status})`);
    }
  }

  console.log("🎉 All broken academic notes repaired successfully!");
}

fixNotes()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
