/**
 * Seed Article Comments & Nested Replies
 * Populates authentic student discussion threads and replies on campus articles.
 *
 * Run: bun run scripts/seed-article-comments.ts
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  articleComments,
  articleCommentVotes,
  articles,
  userProfiles,
} from "../src/db/schema";
import { loadLocalEnv } from "../src/lib/load-env";

loadLocalEnv();

function requireDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.DB_URL;
  if (!databaseUrl) throw new Error("Missing DATABASE_URL.");
  return databaseUrl;
}

const SAMPLE_ARTICLE_COMMENTS = [
  {
    text: "This roadmap is gold. How much time did you dedicate per day between college labs and LeetCode during the 6 months?",
    replies: [
      "Author here: On weekdays about 2.5 hours after 6 PM, and on weekends 6-7 hours. Consistency beats 14-hour burnout sprints!",
      "Same question! What did you do for low attendance in college labs?",
    ],
  },
  {
    text: "The personalized cold outreach email template is incredible. I tried sending it to 3 engineering managers on LinkedIn and already got 1 call scheduled!",
    replies: [
      "Let's go!! Prepare your System Design and project depth well. You got this! 🚀",
    ],
  },
  {
    text: "Can confirm Martin Kleppmann's DDIA book is the holy bible for SDE-2 interviews. Highly recommend Chapter 7 on Transactions.",
    replies: [
      "Agreed. Also Alex Xu Volume 2 for distributed search engines.",
    ],
  },
  {
    text: "Bro the Maggi protocol in the hostel life article is too real 💀 If someone smells tastemaker in the corridor, room privacy is gone.",
    replies: [
      "Literally happened last night at 2:30 AM in Block 3 haha",
      "Always lock the room before opening the 2nd Maggi packet 😂",
    ],
  },
];

async function seedArticleComments() {
  console.log("🌱 Starting Article Comments Seeder...");

  const dbUrl = requireDatabaseUrl();
  const client = postgres(dbUrl, { max: 1 });
  const db = drizzle(client);

  try {
    const allArticles = await db.select().from(articles).limit(10);
    const allProfiles = await db.select().from(userProfiles).limit(50);

    if (allArticles.length === 0 || allProfiles.length === 0) {
      console.error("❌ Need articles and profiles in DB first.");
      return;
    }

    let insertedComments = 0;

    for (const art of allArticles) {
      for (const item of SAMPLE_ARTICLE_COMMENTS) {
        const rootAuthor = allProfiles[Math.floor(Math.random() * allProfiles.length)];
        const rootId = crypto.randomUUID();
        const rootDate = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);

        await db.insert(articleComments).values({
          id: rootId,
          articleId: art.id,
          authorId: rootAuthor.id,
          parentId: null,
          body: item.text,
          upvotesCount: Math.floor(Math.random() * 15) + 3,
          createdAt: rootDate,
          updatedAt: rootDate,
        });

        insertedComments++;

        // Add replies
        for (const replyText of item.replies) {
          const replyAuthor = allProfiles[Math.floor(Math.random() * allProfiles.length)];
          const replyId = crypto.randomUUID();
          const replyDate = new Date(rootDate.getTime() + (Math.random() * 3 + 1) * 60 * 60 * 1000);

          await db.insert(articleComments).values({
            id: replyId,
            articleId: art.id,
            authorId: replyAuthor.id,
            parentId: rootId,
            body: replyText,
            upvotesCount: Math.floor(Math.random() * 8) + 1,
            createdAt: replyDate,
            updatedAt: replyDate,
          });

          insertedComments++;
        }
      }
    }

    console.log("==========================================");
    console.log(`✅ Seeded ${insertedComments} article comments & replies!`);
    console.log("==========================================");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await client.end();
  }
}

seedArticleComments();
