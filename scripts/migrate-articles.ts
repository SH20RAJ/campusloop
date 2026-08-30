import { sql } from "drizzle-orm";
import { getDb } from "../src/db";

async function main() {
  console.log("Running migration for articles and article_votes...");
  const db = getDb();

  // 1. Create articles table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS articles (
      id text PRIMARY KEY,
      slug text UNIQUE NOT NULL,
      title text NOT NULL,
      subtitle text,
      excerpt text,
      content text NOT NULL,
      cover_image_url text,
      author_id text NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
      institution_id text REFERENCES institutions(id) ON DELETE SET NULL,
      category varchar(32) DEFAULT 'GENERAL' NOT NULL,
      tags jsonb DEFAULT '[]'::jsonb NOT NULL,
      reading_time_minutes integer DEFAULT 3 NOT NULL,
      views_count integer DEFAULT 0 NOT NULL,
      upvotes_count integer DEFAULT 0 NOT NULL,
      downvotes_count integer DEFAULT 0 NOT NULL,
      is_featured boolean DEFAULT false NOT NULL,
      status varchar(16) DEFAULT 'PUBLISHED' NOT NULL,
      published_at timestamp DEFAULT now(),
      created_at timestamp DEFAULT now() NOT NULL,
      updated_at timestamp DEFAULT now() NOT NULL
    );
  `);

  // Indexes for articles
  await db.execute(sql`CREATE INDEX IF NOT EXISTS articles_author_idx ON articles(author_id);`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS articles_slug_idx ON articles(slug);`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS articles_status_idx ON articles(status);`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS articles_published_idx ON articles(published_at);`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS articles_category_idx ON articles(category);`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS articles_institution_idx ON articles(institution_id);`);

  // 2. Create article_votes table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS article_votes (
      id text PRIMARY KEY,
      article_id text NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      profile_id text NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
      value integer NOT NULL,
      created_at timestamp DEFAULT now() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS article_votes_profile_article_idx
    ON article_votes(profile_id, article_id);
  `);

  console.log("Articles migration completed successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
