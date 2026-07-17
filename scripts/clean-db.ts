import { getDb } from "../src/db";
import { 
  userProfiles, 
  posts, 
  comments, 
  reports, 
  votes, 
  pollVotes, 
  blocks, 
  moderationActions 
} from "../src/db/schema";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function clean() {
  const db = getDb();
  console.log("Cleaning database (except institutions)...");

  try {
    // Delete in order to respect foreign key constraints (or cascade will handle most, but explicit is safer)
    await db.delete(pollVotes);
    await db.delete(votes);
    await db.delete(comments);
    await db.delete(reports);
    await db.delete(blocks);
    await db.delete(moderationActions);
    await db.delete(posts);
    await db.delete(userProfiles);
    
    console.log("Database successfully cleaned. Seeded institutions remain.");
  } catch (err) {
    console.error("Failed to clean database:", err);
  } finally {
    process.exit(0);
  }
}

clean();
