import { getDb } from "@/db";
import { sql } from "drizzle-orm";

async function main() {
  const db = getDb();
  console.log("Running DDL for merchants vertical_type column...");
  
  await db.execute(sql`ALTER TABLE merchants ADD COLUMN IF NOT EXISTS vertical_type TEXT DEFAULT 'FOOD';`);
  await db.execute(sql`ALTER TABLE merchants ADD COLUMN IF NOT EXISTS login_username TEXT;`);
  await db.execute(sql`ALTER TABLE merchants ADD COLUMN IF NOT EXISTS login_password TEXT;`);

  console.log("Successfully migrated merchants columns!");
}

main().catch(console.error);
