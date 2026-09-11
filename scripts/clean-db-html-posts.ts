/**
 * Clean existing posts in the database that contain raw Reddit HTML/XML artifacts
 * Run: bun run scripts/clean-db-html-posts.ts
 */
import { eq, ilike, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { posts } from "../src/db/schema";
import { cleanPostHtml, removeDuplicateTitleFromBody } from "../src/lib/html-sanitize";
import { loadLocalEnv } from "../src/lib/load-env";

loadLocalEnv();

function requireDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.DB_URL;
  if (!databaseUrl) throw new Error("Missing DATABASE_URL.");
  return databaseUrl;
}

async function main() {
  const dbUrl = requireDatabaseUrl();
  const sql = postgres(dbUrl, { max: 2 });
  const db = drizzle(sql);

  console.log("🔍 Scanning for posts containing raw HTML or Reddit table artifacts...");

  const dirtyPosts = await db
    .select({ id: posts.id, title: posts.title, body: posts.body })
    .from(posts)
    .where(
      or(
        ilike(posts.body, "%<!-- SC_OFF%"),
        ilike(posts.body, "%<table%"),
        ilike(posts.body, "%<div class=%"),
        ilike(posts.body, "%&#32;%")
      )
    );

  console.log(`Found ${dirtyPosts.length} posts with raw HTML artifacts.`);

  let updatedCount = 0;
  for (const p of dirtyPosts) {
    let cleaned = cleanPostHtml(p.body);
    if (p.title) {
      cleaned = removeDuplicateTitleFromBody(cleaned, p.title);
    }

    if (cleaned !== p.body) {
      await db.update(posts).set({ body: cleaned }).where(eq(posts.id, p.id));
      updatedCount++;
      console.log(`✓ Cleaned post: "${p.title || p.id}"`);
    }
  }

  console.log(`🎉 Successfully cleaned ${updatedCount} posts in the database!`);
  await sql.end();
}

main().catch((err) => {
  console.error("Cleanup error:", err);
  process.exit(1);
});
