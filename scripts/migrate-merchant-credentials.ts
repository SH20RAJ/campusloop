import { getDb } from "@/db";
import { sql } from "drizzle-orm";

async function main() {
  const db = getDb();
  console.log("Running DDL for merchants login columns...");
  
  await db.execute(sql`ALTER TABLE merchants ADD COLUMN IF NOT EXISTS login_username TEXT;`);
  await db.execute(sql`ALTER TABLE merchants ADD COLUMN IF NOT EXISTS login_password TEXT;`);

  // Seed Momos House with demo credentials if empty
  await db.execute(sql`
    UPDATE merchants 
    SET login_username = 'momohouse', login_password = 'momo@CampusLoop2026'
    WHERE slug = 'merch_momo_house' AND (login_username IS NULL OR login_username = '');
  `);

  console.log("Successfully migrated merchants login credentials columns!");
}

main().catch(console.error);
