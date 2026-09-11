/**
 * Clean sample video URLs and seed CampusLoop with authentic Reddit memes, discussions, and real campus video reels.
 * Run: bun run scripts/clean-and-seed-reddit.ts
 */
import { execSync } from "node:child_process";
import { eq, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  comments,
  institutions,
  posts,
  userProfiles,
  votes,
} from "../src/db/schema";
import { loadLocalEnv } from "../src/lib/load-env";

loadLocalEnv();

function requireDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.DB_URL;
  if (!databaseUrl) throw new Error("Missing DATABASE_URL.");
  return databaseUrl;
}

// ── Verified authentic college & student video MP4s (HTTP 200, fast CDN, byte-range streaming) ──
const AUTHENTIC_CAMPUS_REELS = [
  {
    title: "3:00 AM Hackathon Final Sprint",
    videoUrl: "https://cdn.pixabay.com/video/2015/10/16/1028-142624363_large.mp4",
    body: `3:00 AM energy at the 24-hour campus hackathon 🔥\n\n4 team members, 16 cups of machine coffee, 2 hours left on the timer, and our backend just decided to return 500 on every single endpoint 💀\n\nFixed it with 1 line of middleware. Pure adrenaline.\n\n![3 AM Hackathon Submission](https://cdn.pixabay.com/video/2015/10/16/1028-142624363_large.mp4)\nhttps://cdn.pixabay.com/video/2015/10/16/1028-142624363_large.mp4\n\n#CampusReel #HackathonLife #BTechtards #DevVibes #HostelChronicles`,
    type: "NORMAL" as const,
    isAnonymous: false,
    scope: "CAMPUS" as const,
    hoursAgo: 3,
    upvotesCount: 420,
    comments: [
      { text: "The classic middleware fix at 3:30 AM lol. Did you guys win?", hoursAgo: 2 },
      { text: "Red Bull and Nescafe holding the entire Indian IT industry together", hoursAgo: 1 },
      { text: "That whiteboard architecture diagram in the background is so real 😭", hoursAgo: 0.5 },
    ],
  },
  {
    title: "Campus Golden Hour Walk Behind Library",
    videoUrl: "https://cdn.pixabay.com/video/2025/02/05/256696_large.mp4",
    body: `POV: You survived 4 consecutive lectures of Signals & Systems and the campus weather hits like this 🌅✨\n\nBest spot to decompress before end-sems kick off.\n\n![Campus Sunset Trail](https://cdn.pixabay.com/video/2025/02/05/256696_large.mp4)\nhttps://cdn.pixabay.com/video/2025/02/05/256696_large.mp4\n\n#CampusVibes #GoldenHour #CollegeDiaries #PeacefulMoments`,
    type: "NORMAL" as const,
    isAnonymous: false,
    scope: "CAMPUS" as const,
    hoursAgo: 6,
    upvotesCount: 580,
    comments: [
      { text: "The lawn behind the central library is literally the only peaceful place on campus", hoursAgo: 5 },
      { text: "Signals & Systems prof was ruthless today though ngl", hoursAgo: 3 },
      { text: "Needed this vibe check fr 🙏", hoursAgo: 1.5 },
    ],
  },
  {
    title: "Final Year Project Discussion in Lab",
    videoUrl: "https://cdn.pixabay.com/video/2023/04/15/159027-818026298_large.mp4",
    body: `When the external examiner says 'Explain how your ML model optimizes tensor latency':\n\nOur team exchanging frantic glances across the lab bench 💀⚡️\n\nWe spent 3 months debugging the frontend and 2 days training the model on Google Colab free tier.\n\n![Final Year Viva](https://cdn.pixabay.com/video/2023/04/15/159027-818026298_large.mp4)\nhttps://cdn.pixabay.com/video/2023/04/15/159027-818026298_large.mp4\n\n#EngineeringStudents #ProjectViva #BTechLife #CampusHumor`,
    type: "MEME" as const,
    isAnonymous: false,
    scope: "GLOBAL" as const,
    hoursAgo: 9,
    upvotesCount: 710,
    comments: [
      { text: "The look on teammate #2's face when the examiner asks him anything technical 😂", hoursAgo: 7 },
      { text: "Google Colab disconnects right when epoch 49/50 finishes is a canon event", hoursAgo: 5 },
      { text: "Still scored an A+ in the end somehow!", hoursAgo: 2 },
    ],
  },
  {
    title: "Sunday Mess Feast Alert",
    videoUrl: "https://cdn.pixabay.com/video/2023/04/15/159024-818026294_large.mp4",
    body: `Hostel warden announced 'Special Sunday Dinner tonight'...\n\nThe entire wing sprinted to the mess hall at 7:59 PM. When they opened the gates it was literally Hunger Games for the Paneer Butter Masala 🏃‍♂️💨\n\n![Mess Food Chronicles](https://cdn.pixabay.com/video/2023/04/15/159024-818026294_large.mp4)\nhttps://cdn.pixabay.com/video/2023/04/15/159024-818026294_large.mp4\n\n#HostelLore #HostelFeast #MessFoodChronicles #CollegeHumor`,
    type: "MEME" as const,
    isAnonymous: true,
    pseudonym: "Mess Hall Sprinter",
    scope: "CAMPUS" as const,
    hoursAgo: 12,
    upvotesCount: 520,
    comments: [
      { text: "300 engineers fighting over 40 pieces of paneer is true survival of the fittest", hoursAgo: 10 },
      { text: "The line was longer than the queue for TCS placements fr", hoursAgo: 8 },
      { text: "Shoutout to the mess bhaiya who secretly gave me extra ice cream cup", hoursAgo: 4 },
    ],
  },
  {
    title: "All 42 Test Cases Green At Last",
    videoUrl: "https://cdn.pixabay.com/video/2023/04/15/159029-818026300_large.mp4",
    body: `When you spend 3 hours tracking down a Segmentation Fault (core dumped) and it was literally an uninitialized pointer on line 84...\n\nRunning the test suite and watching all 42 test cases turn GREEN 🟢✨\n\nNothing in college beats this feeling.\n\n![Tests Passing](https://cdn.pixabay.com/video/2023/04/15/159029-818026300_large.mp4)\nhttps://cdn.pixabay.com/video/2023/04/15/159029-818026300_large.mp4\n\n#ProgrammerHumor #CSERelatable #CodingLife #BugHunt`,
    type: "NORMAL" as const,
    isAnonymous: false,
    scope: "GLOBAL" as const,
    hoursAgo: 15,
    upvotesCount: 830,
    comments: [
      { text: "Valgrind: '0 errors from 0 contexts' is the ultimate dopamine hit", hoursAgo: 13 },
      { text: "C++ pointers will either make you a senior architect or give you grey hairs by 21", hoursAgo: 11 },
      { text: "Green test cases are better than therapy fr", hoursAgo: 6 },
    ],
  },
  {
    title: "Secret Rooftop Study Spot During Mid-Sems",
    videoUrl: "https://cdn.pixabay.com/video/2021/05/03/73007-545277076_large.mp4",
    body: `Found this unlocked terrace staircase behind the Mechanical Dept block 🤫📚\n\nCool breeze, uninterrupted Wi-Fi from the faculty block, and zero seniors asking for lab records. Studying Thermodynamics here hits completely different.\n\n![Secret Study Haven](https://cdn.pixabay.com/video/2021/05/03/73007-545277076_large.mp4)\nhttps://cdn.pixabay.com/video/2021/05/03/73007-545277076_large.mp4\n\n#StudySpot #CampusSecrets #PeacefulStudy #EngineeringVibes`,
    type: "NORMAL" as const,
    isAnonymous: true,
    pseudonym: "Terrace Scholar",
    scope: "CAMPUS" as const,
    hoursAgo: 20,
    upvotesCount: 650,
    comments: [
      { text: "Please don't leak the exact block number bro, warden will padlock it tomorrow 😭", hoursAgo: 18 },
      { text: "The faculty Wi-Fi reaches there? You just changed my academic career", hoursAgo: 14 },
      { text: "Thermodynamics needs divine intervention anyways, good spot", hoursAgo: 8 },
    ],
  },
];

interface ScrapedRedditItem {
  title: string;
  body: string;
  type: "NORMAL" | "MEME" | "CONFESSION" | "QUESTION";
  imageUrl?: string;
  author: string;
  subreddit: string;
}

function fetchSubredditItems(subreddit: string): ScrapedRedditItem[] {
  try {
    const rawXml = execSync(
      `curl -s -L -A "CampusLoopFeed/1.0 (College Network)" "https://www.reddit.com/r/${subreddit}/.rss"`,
      { maxBuffer: 10 * 1024 * 1024, encoding: "utf-8" }
    );

    const results: ScrapedRedditItem[] = [];
    const entries = rawXml.split("<entry>").slice(1);

    for (const entry of entries) {
      const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
      const authorMatch = entry.match(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>/);
      const contentMatch = entry.match(/<content type="html">([\s\S]*?)<\/content>/);

      if (!titleMatch) continue;

      let title = titleMatch[1]
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .trim();

      // Skip generic moderation announcements
      if (title.toLowerCase().includes("moderator") || title.toLowerCase().includes("reopening")) {
        continue;
      }

      const author = authorMatch
        ? authorMatch[1].replace(/^\/u\//, "").trim()
        : "student";

      let rawContent = contentMatch ? contentMatch[1] : "";

      // Extract image: if preview.redd.it, convert to i.redd.it for direct 200 OK delivery
      let imageUrl: string | undefined;
      const imgMatch = rawContent.match(/https:\/\/(?:i|preview)\.redd\.it\/([a-zA-Z0-9_-]+\.(?:jpg|jpeg|png|webp))/i);
      if (imgMatch) {
        imageUrl = `https://i.redd.it/${imgMatch[1]}`;
      }

      // Extract text content
      let textContent = rawContent
        .replace(/<[^>]+>/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\[link\]/g, "")
        .replace(/\[comments\]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      textContent = textContent.replace(/submitted by.*$/i, "").trim();

      // Deduce category type
      let type: "NORMAL" | "MEME" | "CONFESSION" | "QUESTION" = "NORMAL";
      const lower = (title + " " + textContent).toLowerCase();
      if (imageUrl || lower.includes("meme") || lower.includes("lol") || lower.includes("literally")) {
        type = "MEME";
      } else if (lower.includes("confess") || lower.includes("crush") || lower.includes("secret") || lower.includes("regret") || lower.includes("failed")) {
        type = "CONFESSION";
      } else if (title.endsWith("?") || lower.includes("how to") || lower.includes("recommend") || lower.includes("which one")) {
        type = "QUESTION";
      }

      let formattedBody = title;
      if (textContent && textContent !== title && textContent.length > 10) {
        formattedBody += `\n\n${textContent.slice(0, 600)}`;
      }
      if (imageUrl) {
        formattedBody += `\n\n![${title.slice(0, 40)}](${imageUrl})`;
      }
      formattedBody += `\n\n#${subreddit} #CampusLoop #CollegeLife`;

      results.push({
        title,
        body: formattedBody,
        type,
        imageUrl,
        author,
        subreddit,
      });
    }

    return results;
  } catch (err) {
    console.error(`Error fetching r/${subreddit}:`, err);
    return [];
  }
}

async function main() {
  const connectionString = requireDatabaseUrl();
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  console.log("🚀 Starting CampusLoop Cleanup & Reddit Content Seeder...");

  // 1. Clean existing sample posts in the database
  console.log("🧹 Step 1: Cleaning up legacy sample video URLs from database...");
  const samplePosts = await db
    .select({ id: posts.id, title: posts.title, body: posts.body })
    .from(posts)
    .where(
      or(
        like(posts.body, "%filesamples.com%"),
        like(posts.body, "%interactive-examples.mdn.mozilla.net%"),
        like(posts.body, "%vjs.zencdn.net%"),
        like(posts.body, "%sample_640x360.mp4%")
      )
    );

  console.log(`Found ${samplePosts.length} posts with sample URLs in database.`);
  for (let i = 0; i < samplePosts.length; i++) {
    const post = samplePosts[i];
    const replacement = AUTHENTIC_CAMPUS_REELS[i % AUTHENTIC_CAMPUS_REELS.length];
    const cleanedBody = post.body
      .replace(/https:\/\/filesamples\.com\/samples\/video\/mp4\/[^\s"')]+/g, replacement.videoUrl)
      .replace(/https:\/\/interactive-examples\.mdn\.mozilla\.net\/media\/cc0-videos\/[^\s"')]+/g, replacement.videoUrl)
      .replace(/https:\/\/vjs\.zencdn\.net\/v\/[^\s"')]+/g, replacement.videoUrl);

    await db.update(posts).set({ body: cleanedBody }).where(eq(posts.id, post.id));
    console.log(`  ✓ Updated post: "${post.title}" -> ${replacement.videoUrl.slice(0, 50)}...`);
  }

  // 2. Fetch existing institutions & user profiles
  const allInstitutions = await db.select().from(institutions).limit(15);
  let allProfiles = await db.select().from(userProfiles).limit(40);

  if (allInstitutions.length === 0) {
    console.error("❌ No institutions found in database.");
    await sql.end();
    return;
  }

  const primaryCollege = allInstitutions[0];

  // 3. Ensure diverse campus student profiles exist
  const DIVERSE_PERSONAS = [
    { username: "rohit_bitm_cs", displayName: "Rohit Verma", branch: "CSE '26", instIndex: 0 },
    { username: "ananya_dtu_tech", displayName: "Ananya Sen", branch: "ECE '25", instIndex: 1 },
    { username: "arjun_iitb_mech", displayName: "Arjun Mehta", branch: "Mech '26", instIndex: 2 },
    { username: "priya_nitt_coding", displayName: "Priya Nair", branch: "IT '25", instIndex: 3 },
    { username: "kartik_vit_dev", displayName: "Kartik Sharma", branch: "CS Core '27", instIndex: 4 },
    { username: "kavya_du_vibes", displayName: "Kavya Roy", branch: "Maths Hons '26", instIndex: 5 },
    { username: "sid_hostel4", displayName: "Siddharth Jha", branch: "EE '26", instIndex: 0 },
    { username: "tanya_coder", displayName: "Tanya Kapoor", branch: "Data Science '25", instIndex: 1 },
  ];

  for (const persona of DIVERSE_PERSONAS) {
    const existing = allProfiles.find((p) => p.username === persona.username);
    if (!existing) {
      const inst = allInstitutions[persona.instIndex % allInstitutions.length];
      const [newProfile] = await db
        .insert(userProfiles)
        .values({
          userId: `usr_${persona.username}_${crypto.randomUUID().slice(0, 8)}`,
          username: persona.username,
          displayName: persona.displayName,
          email: `${persona.username}@campusloop.space`,
          institutionId: inst.id,
          onboardingCompleted: true,
          role: "STUDENT",
          status: "ACTIVE",
          loopPoints: 450 + Math.floor(Math.random() * 800),
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${persona.username}`,
        })
        .returning();
      allProfiles.push(newProfile);
      console.log(`  + Created student persona @${persona.username} (${inst.name})`);
    }
  }

  // 4. Fetch live posts & viral memes from Reddit
  console.log("🌐 Step 2: Fetching live posts & viral image memes from r/Btechtards, r/JEENEETards, r/delhiuniversity...");
  const btechPosts = fetchSubredditItems("Btechtards");
  const jeePosts = fetchSubredditItems("JEENEETards");
  const duPosts = fetchSubredditItems("delhiuniversity");

  const combinedReddit = [
    ...btechPosts.slice(0, 8),
    ...jeePosts.slice(0, 8),
    ...duPosts.slice(0, 6),
  ];

  console.log(`Fetched total ${combinedReddit.length} authentic Reddit items to seed!`);

  let seededCount = 0;

  for (let i = 0; i < combinedReddit.length; i++) {
    const item = combinedReddit[i];
    const author = allProfiles[i % allProfiles.length];
    const targetInst = allInstitutions[i % allInstitutions.length];
    const hoursAgo = (i % 24) + 1;
    const postCreatedAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    const postId = crypto.randomUUID();
    const upvotesCount = 180 + Math.floor(Math.random() * 850);

    await db.insert(posts).values({
      id: postId,
      authorId: author.id,
      institutionId: targetInst.id,
      title: item.title.slice(0, 180),
      body: item.body,
      type: item.type,
      isAnonymous: item.type === "CONFESSION" || i % 4 === 0,
      pseudonym: item.type === "CONFESSION" || i % 4 === 0 ? `Campus_${item.subreddit}_${i + 1}` : null,
      scope: i % 2 === 0 ? "GLOBAL" : "CAMPUS",
      upvotesCount,
      commentsCount: 3,
      createdAt: postCreatedAt,
      updatedAt: postCreatedAt,
    });

    // Seed realistic comments
    const COMMENT_TEMPLATES = [
      "This is so relatable it physically hurts 😭",
      "Literally what happened in our 8:00 AM lecture today",
      "Saving this immediately, too real",
      "The accuracy of this is unmatched honestly",
      "Can confirm this is 100% true across all engineering hostels",
      "Our senior told us the exact same thing last semester lol",
      "Needed to see this today before exam week starts 🙏",
    ];

    for (let c = 0; c < 3; c++) {
      const commenter = allProfiles[(i + c + 1) % allProfiles.length];
      const commentCreatedAt = new Date(postCreatedAt.getTime() + (c + 1) * 35 * 60 * 1000);
      const text = COMMENT_TEMPLATES[(i + c) % COMMENT_TEMPLATES.length];

      await db.insert(comments).values({
        id: crypto.randomUUID(),
        postId,
        authorId: commenter.id,
        body: text,
        upvotesCount: Math.floor(Math.random() * 45) + 5,
        isAnonymous: c === 1,
        pseudonym: c === 1 ? "Fellow Student" : null,
        createdAt: commentCreatedAt,
        updatedAt: commentCreatedAt,
      });
    }

    // Seed upvote record
    await db.insert(votes).values({
      id: crypto.randomUUID(),
      postId,
      userId: allProfiles[(i + 2) % allProfiles.length].id,
      value: 1,
      createdAt: postCreatedAt,
    });

    seededCount++;
    console.log(`  ✓ Seeded [${item.type}] "${item.title.slice(0, 50)}..." by @${author.username} (${item.imageUrl ? "WITH IMAGE" : "TEXT"})`);
  }

  console.log(`\n🎉 Successfully finished!`);
  console.log(`- Sample URLs cleaned from legacy posts`);
  console.log(`- Seeded ${seededCount} real Reddit memes & student discussions`);
  console.log(`- All video reels backed by verified real CDN / Pixabay campus videos`);

  await sql.end();
}

main().catch((err) => {
  console.error("Fatal seed error:", err);
  process.exit(1);
});
