/**
 * Bulk test-data seeder — ADDS users, posts, votes, comments, swipes,
 * stories without touching existing rows (safe to re-run).
 *
 *   bun run scripts/seed-bulk.ts
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import {
  institutions,
  userProfiles,
  posts,
  comments,
  votes,
  pollOptions,
  pollVotes,
  swipes,
  stories,
} from "../src/db/schema";
import { loadLocalEnv } from "../src/lib/load-env";

loadLocalEnv();

function requireDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.DB_URL;
  if (!databaseUrl) throw new Error("Missing DATABASE_URL.");
  return databaseUrl;
}

// ─── Name pools ───
const FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Krishna", "Ishaan", "Rudra",
  "Ananya", "Diya", "Aadhya", "Myra", "Sara", "Pooja", "Nisha", "Tara", "Meera", "Kavya",
  "Rahul", "Amit", "Karan", "Nikhil", "Rohit", "Sanjay", "Deepak", "Varun", "Aditi", "Priya",
  "Sneha", "Poojita", "Riya", "Anjali", "Kritika", "Simran", "Neha", "Isha", "Tanvi", "Shreya",
];
const LAST_NAMES = [
  "Sharma", "Verma", "Patel", "Reddy", "Nair", "Iyer", "Kapoor", "Malhotra", "Singh", "Gupta",
  "Mehta", "Joshi", "Desai", "Rao", "Das", "Bose", "Chopra", "Khanna", "Pillai", "Menon",
];
const BIOS = [
  "CS undergrad. Coffee > sleep.",
  "ECE sophomore. Circuit whisperer.",
  "Mechanical engineer in the making.",
  "Debate club. Music addict.",
  "Gym at 6 AM, code by 9.",
  "Anime marathons on weekends.",
  "Campus football team ⚽",
  "Poetry & chai lover.",
  "Startup intern. Ramen budget.",
  "Photography walks every evening.",
  "Chess club president.",
  "Aspiring novelist.",
  "Dance like nobody's watching.",
  "Bug hunter by night.",
  "Hostel mess food critic.",
];
const COURSES = ["B.Tech CSE", "B.Tech ECE", "B.Tech ME", "B.Sc Physics", "BBA", "BA English", "B.Arch", "MCA"];
const INTEREST_POOL = [
  "coding", "music", "gym", "anime", "football", "cricket", "photography", "reading",
  "travel", "cooking", "dance", "gaming", "startups", "chess", "art", "movies",
];

const POST_TEMPLATES: Array<{ type: typeof posts.$inferInsert.type; body: (i: number) => string; anon?: boolean }> = [
  { type: "NORMAL", body: (i) => `Day ${i % 28 + 1} of semester grind. The library is packed again. Who else is pulling an all-nighter? #CampusLife` },
  { type: "CONFESSION", body: () => `Confession: I've been attending lectures just for the AC. The professor thinks I'm super dedicated 😅`, anon: true },
  { type: "CONFESSION", body: (i) => `Confession #${i}: I have a crush on someone from the robotics club but I freeze every time they wave at me. #Confessions`, anon: true },
  { type: "QUESTION", body: (i) => `Best elective to take in ${["3rd", "5th", "7th"][i % 3]} sem? Drop your honest reviews below. #Academics` },
  { type: "QUESTION", body: () => `Does anyone have PDFs of last year's DSA endsem papers? Will trade lab records. #Help` },
  { type: "MEME", body: (i) => `That moment when the WiFi speed hits 10 Mbps during submission week 🚀 #${i}thTimeLucky` },
  { type: "EVENT", body: (i) => `🔥 FEST ALERT: TechFest ${2026} — round ${(i % 3) + 1} registrations are LIVE. Coding contest, robowars, and a DJ night! #TechFest` },
  { type: "LOST_FOUND", body: () => `Lost: black water bottle near the mech block canteen. Has a NASA sticker. Reward: one samosa. #LostFound` },
  { type: "NORMAL", body: (i) => `Hot take: the ${["north", "south"][i % 2]} canteen chai is criminally underrated. Fight me in the comments. #CanteenWars` },
  { type: "NORMAL", body: () => `Placed! Off to my dream company 🎉 Thank you seniors for all the mock interview sessions! #PlacementSeason` },
];

const POLL_QUESTIONS = [
  { q: "Which is the best hostel block?", opts: ["A Block", "C Block", "New Hostel", "PG outside"] },
  { q: "Best fest of the year?", opts: ["TechFest", "Cultural Fest", "Sports Meet", "All of them"] },
  { q: "Chai or Coffee?", opts: ["Chai ☕", "Coffee ☕", "Both", "Neither"] },
  { q: "Dream company after graduation?", opts: ["FAANG", "Startup", "Core engineering", "Own venture"] },
  { q: "Early morning or late night study?", opts: ["5 AM club", "2 AM club", "Depends on deadline", "What is studying"] },
];

const COMMENT_BODIES = [
  "This is so relatable 😂",
  "Facts. Absolutely facts.",
  "Count me in!",
  "Same here, thought I was the only one.",
  "Where do I sign up?",
  "Underrated post tbh.",
  "Bro spilled 💯",
  "Can confirm, was there.",
  "Sending this to my roommate.",
  "The accuracy is painful.",
  "Legend behavior 🐐",
  "Okay this made my day.",
];

function pick<T>(arr: T[], rnd: () => number): T {
  return arr[Math.floor(rnd() * arr.length)];
}

async function main() {
  const client = postgres(requireDatabaseUrl(), { max: 1, prepare: false });
  const db = drizzle(client);

  // Deterministic-ish randomness
  let seed = 42;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };

  console.log("Fetching institutions...");
  const instRows = await db.select({ id: institutions.id }).from(institutions).limit(60);
  if (instRows.length < 5) throw new Error("Seed colleges first (bun run db:seed).");
  const primaryInst = instRows.find((i) => i.id.includes("iitb")) ?? instRows[0];
  const bitmInst = instRows.find((i) => i.id.includes("bitm")) ?? instRows[1] ?? primaryInst;

  // ─── Users ───
  console.log("Seeding 40 new student profiles...");
  const newProfiles: (typeof userProfiles.$inferInsert)[] = [];
  for (let i = 0; i < 40; i++) {
    const first = pick(FIRST_NAMES, rnd);
    const last = pick(LAST_NAMES, rnd);
    const username = `${first.toLowerCase()}_${last.toLowerCase()}${i}${Math.floor(rnd() * 90 + 10)}`;
    const inst = i < 14 ? primaryInst : i < 24 ? bitmInst : pick(instRows, rnd);
    const interests = INTEREST_POOL.filter(() => rnd() < 0.35).slice(0, 5);
    newProfiles.push({
      id: `prof_bulk_${i}`,
      userId: randomUUID(),
      displayName: `${first} ${last}`,
      officialName: `${first} ${last}`,
      username,
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
      institutionId: inst.id,
      bio: pick(BIOS, rnd),
      course: pick(COURSES, rnd),
      year: Math.floor(rnd() * 4) + 1,
      gender: rnd() < 0.5 ? "MALE" : "FEMALE",
      interests,
      onboardingCompleted: true,
      role: "STUDENT",
      status: "ACTIVE",
      points: Math.floor(rnd() * 400),
    });
  }
  await db.insert(userProfiles).values(newProfiles).onConflictDoNothing();
  const allProfileIds = [
    ...(await db.select({ id: userProfiles.id }).from(userProfiles)),
  ].map((r) => r.id);

  // ─── Posts ───
  console.log("Seeding 260 posts spread over the past 30 days...");
  const now = Date.now();
  const postsToInsert: (typeof posts.$inferInsert)[] = [];
  const pollSpecs: Array<{ postId: string; opts: string[] }> = [];

  for (let i = 0; i < 260; i++) {
    const authorId = pick(allProfileIds, rnd);
    const template = pick(POST_TEMPLATES, rnd);
    const isPoll = rnd() < 0.18;
    const postId = `post_bulk_${i}`;
    // Spread over past 30 days, newest first
    const createdAt = new Date(now - (i * 2.8 + rnd() * 20) * 60 * 60 * 1000);
    const scopeRoll = rnd();
    const scope = scopeRoll < 0.55 ? "CAMPUS" : scopeRoll < 0.85 ? "INDIA" : "GLOBAL";

    postsToInsert.push({
      id: postId,
      authorId,
      institutionId: pick(instRows, rnd).id,
      type: isPoll ? "POLL" : template.type,
      scope,
      body: isPoll ? pick(POLL_QUESTIONS, rnd).q : template.body(i),
      isAnonymous: template.anon ?? false,
      status: "PUBLISHED",
      createdAt,
      updatedAt: createdAt,
    });

    if (isPoll) {
      pollSpecs.push({ postId, opts: pick(POLL_QUESTIONS, rnd).opts });
    }
  }

  for (let i = 0; i < postsToInsert.length; i += 100) {
    await db.insert(posts).values(postsToInsert.slice(i, i + 100)).onConflictDoNothing();
  }

  // ─── Poll options ───
  console.log("Seeding poll options...");
  const optionsToInsert: (typeof pollOptions.$inferInsert)[] = [];
  for (const spec of pollSpecs) {
    spec.opts.forEach((text, idx) => {
      optionsToInsert.push({ id: `${spec.postId}_opt_${idx}`, postId: spec.postId, text });
    });
  }
  for (let i = 0; i < optionsToInsert.length; i += 200) {
    await db.insert(pollOptions).values(optionsToInsert.slice(i, i + 200)).onConflictDoNothing();
  }

  // ─── Votes ───
  console.log("Seeding votes...");
  const votesToInsert: (typeof votes.$inferInsert)[] = [];
  for (const post of postsToInsert) {
    const voterCount = Math.floor(rnd() * 12);
    const voters = new Set<string>();
    for (let v = 0; v < voterCount; v++) voters.add(pick(allProfileIds, rnd));
    for (const voter of voters) {
      votesToInsert.push({ postId: post.id as string, userId: voter, value: rnd() < 0.92 ? 1 : -1 });
    }
  }
  for (let i = 0; i < votesToInsert.length; i += 300) {
    await db.insert(votes).values(votesToInsert.slice(i, i + 300)).onConflictDoNothing();
  }

  // ─── Poll votes ───
  console.log("Seeding poll votes...");
  const pollVotesToInsert: (typeof pollVotes.$inferInsert)[] = [];
  for (const spec of pollSpecs) {
    const voterSet = new Set<string>();
    const n = Math.floor(rnd() * 10) + 2;
    for (let v = 0; v < n; v++) voterSet.add(pick(allProfileIds, rnd));
    for (const voter of voterSet) {
      pollVotesToInsert.push({
        postId: spec.postId,
        optionId: `${spec.postId}_opt_${Math.floor(rnd() * spec.opts.length)}`,
        userId: voter,
      });
    }
  }
  for (let i = 0; i < pollVotesToInsert.length; i += 300) {
    await db.insert(pollVotes).values(pollVotesToInsert.slice(i, i + 300)).onConflictDoNothing();
  }

  // ─── Comments ───
  console.log("Seeding comments...");
  const commentsToInsert: (typeof comments.$inferInsert)[] = [];
  for (const post of postsToInsert) {
    if (rnd() < 0.45) continue;
    const n = Math.floor(rnd() * 4);
    for (let c = 0; c < n; c++) {
      commentsToInsert.push({
        postId: post.id as string,
        authorId: pick(allProfileIds, rnd),
        body: pick(COMMENT_BODIES, rnd),
        isAnonymous: rnd() < 0.15,
        status: "PUBLISHED",
        createdAt: new Date((post.createdAt as Date).getTime() + (c + 1) * 3600 * 1000),
      });
    }
  }
  for (let i = 0; i < commentsToInsert.length; i += 300) {
    await db.insert(comments).values(commentsToInsert.slice(i, i + 300)).onConflictDoNothing();
  }

  // ─── Swipes (dating) ───
  console.log("Seeding dating swipes...");
  const swipesToInsert: (typeof swipes.$inferInsert)[] = [];
  const swipeSeen = new Set<string>();
  for (let i = 0; i < 120; i++) {
    const swiper = pick(allProfileIds, rnd);
    const target = pick(allProfileIds, rnd);
    if (swiper === target) continue;
    const key = `${swiper}:${target}`;
    if (swipeSeen.has(key)) continue;
    swipeSeen.add(key);
    swipesToInsert.push({ swiperId: swiper, targetId: target, direction: rnd() < 0.65 ? "LIKE" : "PASS" });
  }
  await db.insert(swipes).values(swipesToInsert).onConflictDoNothing();

  // ─── Stories ───
  console.log("Seeding active stories...");
  const STORY_COLORS = [
    "from-violet-600 to-indigo-600",
    "from-orange-500 to-rose-500",
    "from-pink-500 to-purple-600",
    "from-emerald-500 to-teal-700",
    "from-sky-500 to-blue-700",
  ];
  const STORY_TEXTS = [
    "Midnight maggi run 🍜",
    "Fest prep chaos!!",
    "Library seat secured ✅",
    "Sunset from the hostel terrace 🌇",
    "New campus playlist dropping 🎧",
    "Placement season stress is real",
    "Who's coming for the open mic?",
    "Gym gains loading... 💪",
  ];
  const expiresAt = new Date(now + 22 * 60 * 60 * 1000);
  const storiesToInsert: (typeof stories.$inferInsert)[] = [];
  for (let i = 0; i < 10; i++) {
    storiesToInsert.push({
      id: `story_bulk_${i}`,
      userId: pick(allProfileIds, rnd),
      text: pick(STORY_TEXTS, rnd),
      backgroundColor: pick(STORY_COLORS, rnd),
      expiresAt,
    });
  }
  await db.insert(stories).values(storiesToInsert).onConflictDoNothing();

  const [{ count: postCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(posts);

  console.log(`\n✅ Bulk seed complete! Posts now total: ${postCount}`);
  console.log(`   +40 users, +260 posts, +${votesToInsert.length} votes, +${commentsToInsert.length} comments, +${swipesToInsert.length} swipes`);

  await client.end();
}

main().catch((err) => {
  console.error("Bulk seeding failed:", err);
  process.exit(1);
});
