import { getDb } from "../src/db";
import { posts, userProfiles } from "../src/db/schema";
import { inArray, eq, sql } from "drizzle-orm";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

export async function unlistSeededPostsAndTagUsers() {
  const db = getDb();
  console.log("🚀 Starting Unlist Seeded Posts & Tag Seed Data...");

  // 1. Fetch all users
  const allUsers = await db.select({
    id: userProfiles.id,
    userId: userProfiles.userId,
    username: userProfiles.username,
    email: userProfiles.email,
  }).from(userProfiles);

  const isBotUser = (u: { id: string; userId: string; username: string; email: string | null }) => {
    if (u.id === "e446595b-d8fe-4376-9a53-d80f863dc3df" || u.username === "sh20raj") {
      return false; // Owner / Admin
    }
    if (
      u.id.startsWith("seed_user_") ||
      u.userId.startsWith("seed_auth_") ||
      u.id.startsWith("bit_user_") ||
      u.userId.startsWith("bit_auth_") ||
      u.id.startsWith("prof_") ||
      u.userId.startsWith("prof_") ||
      u.userId.startsWith("auth_bulk_")
    ) {
      return true;
    }
    // Synthetic accounts without real email or generated with seed pattern
    if (!u.email && u.username.includes("_") && /\d+$/.test(u.username)) {
      return true;
    }
    return false;
  };

  const botUserIds: string[] = [];
  const realUserIds: string[] = [];

  for (const u of allUsers) {
    if (isBotUser(u)) {
      botUserIds.push(u.id);
    } else {
      realUserIds.push(u.id);
    }
  }

  console.log(`📊 Found ${botUserIds.length} seeded bot users and ${realUserIds.length} real registered users.`);

  // Tag bot users with is_seeded = true
  if (botUserIds.length > 0) {
    // Process in batches of 200
    for (let i = 0; i < botUserIds.length; i += 200) {
      const batch = botUserIds.slice(i, i + 200);
      await db.update(userProfiles).set({ isSeeded: true }).where(inArray(userProfiles.id, batch));
    }
  }

  // Tag real users with is_seeded = false
  if (realUserIds.length > 0) {
    for (let i = 0; i < realUserIds.length; i += 200) {
      const batch = realUserIds.slice(i, i + 200);
      await db.update(userProfiles).set({ isSeeded: false }).where(inArray(userProfiles.id, batch));
    }
  }

  // 2. Fetch all posts
  const allPosts = await db.select({
    id: posts.id,
    authorId: posts.authorId,
    body: posts.body,
    status: posts.status,
  }).from(posts);

  const botUserSet = new Set(botUserIds);

  const isSeedPost = (p: { id: string; authorId: string | null; body: string }) => {
    if (p.id.startsWith("seed_post_") || p.id.startsWith("bit_post_") || p.id.startsWith("post_bulk_")) {
      return true;
    }
    if (p.authorId && botUserSet.has(p.authorId)) {
      return true;
    }
    if (p.body.startsWith("Confession #") && p.body.includes("I have a crush on someone from the robotics")) {
      return true;
    }
    if (p.body.includes("I spent 4 hours in the central library pretending to study when I was actually just making Spotify playlists")) {
      return true;
    }
    if (["Which is the best hostel block?", "Chai or Coffee?", "Best fest of the year?"].includes(p.body.trim())) {
      return true;
    }
    if (p.body.includes("That moment when the WiFi speed hits 10 Mbps during submissi")) {
      return true;
    }
    if (p.body.includes("of semester grind. The library is packed again")) {
      return true;
    }
    return false;
  };

  const seededPostIds: string[] = [];
  const realPostIds: string[] = [];

  for (const p of allPosts) {
    if (isSeedPost(p)) {
      seededPostIds.push(p.id);
    } else {
      realPostIds.push(p.id);
    }
  }

  console.log(`📝 Found ${seededPostIds.length} seeded posts to unlist, and ${realPostIds.length} real student posts to keep active.`);

  // 3. Unlist seeded posts (set status = 'HIDDEN' and is_seeded = true)
  if (seededPostIds.length > 0) {
    for (let i = 0; i < seededPostIds.length; i += 200) {
      const batch = seededPostIds.slice(i, i + 200);
      await db.update(posts).set({
        isSeeded: true,
        status: "HIDDEN",
      }).where(inArray(posts.id, batch));
    }
  }

  // 4. Ensure real posts remain PUBLISHED and is_seeded = false
  if (realPostIds.length > 0) {
    for (let i = 0; i < realPostIds.length; i += 200) {
      const batch = realPostIds.slice(i, i + 200);
      await db.update(posts).set({
        isSeeded: false,
        status: "PUBLISHED",
      }).where(inArray(posts.id, batch));
    }
  }

  console.log("✅ All seeded posts unlisted from website! Only authentic student posts are active.");
}

if (import.meta.main) {
  unlistSeededPostsAndTagUsers()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Failed unlisting seeded posts:", err);
      process.exit(1);
    });
}
