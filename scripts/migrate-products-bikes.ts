import { getDb } from "@/db";
import { sql } from "drizzle-orm";

async function main() {
  const db = getDb();
  console.log("Running DDL migrations for products and bikes tables...");
  
  await db.execute(sql`
    ALTER TABLE products 
    ADD COLUMN IF NOT EXISTS is_veg BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS is_non_veg BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS spicy_level TEXT,
    ADD COLUMN IF NOT EXISTS stock_quantity INTEGER,
    ADD COLUMN IF NOT EXISTS sku TEXT,
    ADD COLUMN IF NOT EXISTS is_subscription_eligible BOOLEAN DEFAULT FALSE;
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS bikes (
      id TEXT PRIMARY KEY,
      merchant_id TEXT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      model TEXT NOT NULL,
      registration_number TEXT NOT NULL,
      image_url TEXT,
      hourly_price INTEGER DEFAULT 50 NOT NULL,
      daily_price INTEGER DEFAULT 350 NOT NULL,
      security_deposit INTEGER DEFAULT 1500 NOT NULL,
      pickup_location TEXT DEFAULT 'Campus Main Gate' NOT NULL,
      fuel_type TEXT DEFAULT 'PETROL' NOT NULL,
      specs JSONB DEFAULT '{"helmetIncluded": true}',
      status TEXT DEFAULT 'AVAILABLE' NOT NULL,
      rating TEXT DEFAULT '4.8' NOT NULL,
      review_count INTEGER DEFAULT 12 NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );
  `);

  console.log("Successfully migrated products and bikes columns!");
}

main().catch(console.error);
