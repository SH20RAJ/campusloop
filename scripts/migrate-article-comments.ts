import { getDb } from "../src/db";
import { sql } from "drizzle-orm";
import { loadLocalEnv } from "../src/lib/load-env";

loadLocalEnv();

async function run() {
  const db = getDb();
  console.log("🚀 Migrating article_comments and article_comment_votes tables...");

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS article_comments (
      id TEXT PRIMARY KEY,
      article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      author_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
      parent_id TEXT REFERENCES article_comments(id) ON DELETE CASCADE,
      body TEXT NOT NULL,
      upvotes_count INTEGER DEFAULT 0 NOT NULL,
      created_at TIMESTAMP DEFAULT now() NOT NULL,
      updated_at TIMESTAMP DEFAULT now() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS article_comments_article_id_idx ON article_comments (article_id, created_at);
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS article_comments_parent_id_idx ON article_comments (parent_id);
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS article_comment_votes (
      id TEXT PRIMARY KEY,
      comment_id TEXT NOT NULL REFERENCES article_comments(id) ON DELETE CASCADE,
      profile_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
      value INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT now() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS article_comment_votes_profile_comment_idx ON article_comment_votes (profile_id, comment_id);
  `);

  console.log("✅ article_comments and article_comment_votes migration complete!");
  process.exit(0);
}

run().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
