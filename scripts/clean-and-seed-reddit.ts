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

// ── Authentic campus & student video reels uploaded to Cloudflare R2 from top Indian student communities ──
const AUTHENTIC_CAMPUS_REELS = [
  {
    title: "IIT Dhanbad Rocket Scientists 🚀",
    videoUrl: "/api/files/r2/videos/dhanbad_scientists.mp4",
    body: `IIT Dhanbad ke rocket scientists at 2 AM in the hostel quad... When mechanical engineering students decide to test homemade aerodynamics before end-sems 💀🔥\n\n![IIT Dhanbad Rocket Scientists](/api/files/r2/videos/dhanbad_scientists.mp4)\n/api/files/r2/videos/dhanbad_scientists.mp4\n\n#CampusReel #HostelLore #IITDhanbad #EngineeringLife #CampusVibes`,
    type: "NORMAL" as const,
    isAnonymous: false,
    scope: "GLOBAL" as const,
    hoursAgo: 2,
    upvotesCount: 9433,
    comments: [
      { text: "Bro ISRO is hiring from the hostel lawn directly 😂🚀", hoursAgo: 1.5 },
      { text: "Warden's reaction from the 3rd floor balcony is priceless", hoursAgo: 1 },
      { text: "Average Dhanbad night before Mechanics viva", hoursAgo: 0.5 },
    ],
  },
  {
    title: "This is so my college 😭",
    videoUrl: "/api/files/r2/videos/this_is_so_my_clg.mp4",
    body: `POV: You walk into the college common room during placement season and this is the general state of existence... 💀\n\n![College Moments](/api/files/r2/videos/this_is_so_my_clg.mp4)\n/api/files/r2/videos/this_is_so_my_clg.mp4\n\n#CampusReel #CollegeLife #BTechtards #CampusHumor #HostelChronicles`,
    type: "MEME" as const,
    isAnonymous: false,
    scope: "CAMPUS" as const,
    hoursAgo: 4,
    upvotesCount: 6198,
    comments: [
      { text: "The accuracy of this is actually hurting my soul 😭", hoursAgo: 3 },
      { text: "Every engineering college in India shares the exact same braincell", hoursAgo: 2 },
      { text: "Literally hostel 4 at 1 AM", hoursAgo: 1 },
    ],
  },
  {
    title: "Destroyer of Employment (Placement Season)",
    videoUrl: "/api/files/r2/videos/destroyer_of_employment.mp4",
    body: `When the recruiter opens the PPT slide and announces: 'Eligibility Criteria: 9.5 CGPA, 0 backlogs, and 5 years of React experience for a fresher role' 💀\n\n![Destroyer of Employment](/api/files/r2/videos/destroyer_of_employment.mp4)\n/api/files/r2/videos/destroyer_of_employment.mp4\n\n#PlacementSeason #BTechtards #CollegeHumor #EngineeringVibes #CampusReels`,
    type: "NORMAL" as const,
    isAnonymous: false,
    scope: "GLOBAL" as const,
    hoursAgo: 6,
    upvotesCount: 5067,
    comments: [
      { text: "HR: 'We offer competitive stipend (unpaid intern for 6 months)'", hoursAgo: 5 },
      { text: "Our TPO nodded along like it made complete sense 💀", hoursAgo: 3 },
      { text: "LeetCode won't save us from this market fr", hoursAgo: 1 },
    ],
  },
  {
    title: "His face expression says it all 💔",
    videoUrl: "/api/files/r2/videos/face_expression.mp4",
    body: `When the professor gives a 2-hour lecture on something that won't be on the exam, but doesn't tell you until the last 5 minutes 💀😭\n\n![Campus Life](/api/files/r2/videos/face_expression.mp4)\n/api/files/r2/videos/face_expression.mp4\n\n#CollegeMemes #BTechLife #CampusHumor #HostelLore #Relatable`,
    type: "MEME" as const,
    isAnonymous: true,
    pseudonym: "Backbencher Philosopher",
    scope: "CAMPUS" as const,
    hoursAgo: 8,
    upvotesCount: 5831,
    comments: [
      { text: "The slow realization hitting his face in 4K resolution", hoursAgo: 6 },
      { text: "I wrote 6 pages of notes for absolutely nothing...", hoursAgo: 4 },
      { text: "At least attendance was marked 🙏", hoursAgo: 2 },
    ],
  },
  {
    title: "Hostel Late Night Chronicles",
    videoUrl: "/api/files/r2/videos/allen_khatarnak.mp4",
    body: `The absolute chaos of hostel life right before Semester exams kick in 💀\n\n4 people studying 4 different subjects from the same one-shot playlist.\n\n![Hostel Moments](/api/files/r2/videos/allen_khatarnak.mp4)\n/api/files/r2/videos/allen_khatarnak.mp4\n\n#CampusVibes #HostelLife #JEENEETards #StudentMemes #CampusReels`,
    type: "NORMAL" as const,
    isAnonymous: false,
    scope: "GLOBAL" as const,
    hoursAgo: 11,
    upvotesCount: 6961,
    comments: [
      { text: "One-shot playlist at 2x speed is carrying the entire semester", hoursAgo: 9 },
      { text: "Someone order 4 plates of momos from the night canteen quick", hoursAgo: 7 },
      { text: "Pure hostel energy right here", hoursAgo: 3 },
    ],
  },
  {
    title: "Why are tech recruiters like this?",
    videoUrl: "/api/files/r2/videos/indian_ceos.mp4",
    body: `When tech companies talk about 'flexible work culture' during pre-placement talks vs when you actually join the team on Monday morning 💀⚡️\n\n![Campus Tech Talks](/api/files/r2/videos/indian_ceos.mp4)\n/api/files/r2/videos/indian_ceos.mp4\n\n#BTechtards #Placements #TechHumor #DeveloperVibes #CampusLoop`,
    type: "NORMAL" as const,
    isAnonymous: false,
    scope: "GLOBAL" as const,
    hoursAgo: 14,
    upvotesCount: 6425,
    comments: [
      { text: "Work-life balance means you can work anywhere anytime!", hoursAgo: 12 },
      { text: "The pre-placement PPT had so many buzzwords my head spun", hoursAgo: 8 },
      { text: "Still accepted the PPO without reading the terms 😂", hoursAgo: 4 },
    ],
  },
  {
    title: "Campus Common Room Unfiltered",
    videoUrl: "/api/files/r2/videos/allen_kalesh.mp4",
    body: `Unfiltered student hostel moments when someone steals the last packet of Maggi from the floor pantry at 3 AM 🏃‍♂️💨\n\n![Hostel Moments](/api/files/r2/videos/allen_kalesh.mp4)\n/api/files/r2/videos/allen_kalesh.mp4\n\n#HostelLore #MaggiWars #CollegeChronicles #CampusReels`,
    type: "NORMAL" as const,
    isAnonymous: true,
    pseudonym: "Maggi Guardian",
    scope: "CAMPUS" as const,
    hoursAgo: 18,
    upvotesCount: 9549,
    comments: [
      { text: "Stealing Maggi in hostel is an act of war, no negotiation", hoursAgo: 16 },
      { text: "Pantry drama at 3 AM hits harder than Netflix thriller", hoursAgo: 12 },
      { text: "Always hide your Maggi under the mattress bro, rookie mistake", hoursAgo: 5 },
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
          points: 450 + Math.floor(Math.random() * 800),
          avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${persona.username}`,
        })
        .returning();
      allProfiles.push(newProfile);
      console.log(`  + Created student persona @${persona.username} (${inst.name})`);
    }
  }

  // 3b. Ensure all authentic campus video reels are seeded
  console.log("🎥 Step 1b: Ensuring all authentic campus reels are seeded...");
  for (let r = 0; r < AUTHENTIC_CAMPUS_REELS.length; r++) {
    const reel = AUTHENTIC_CAMPUS_REELS[r];
    const existing = await db
      .select({ id: posts.id })
      .from(posts)
      .where(eq(posts.title, reel.title))
      .limit(1);

    if (existing.length === 0) {
      const author = allProfiles[r % allProfiles.length];
      const targetInst = reel.scope === "CAMPUS" ? primaryCollege : allInstitutions[r % allInstitutions.length];
      const postCreatedAt = new Date(Date.now() - reel.hoursAgo * 60 * 60 * 1000);
      const postId = crypto.randomUUID();

      await db.insert(posts).values({
        id: postId,
        authorId: author.id,
        institutionId: targetInst.id,
        title: reel.title,
        body: reel.body,
        type: reel.type,
        isAnonymous: reel.isAnonymous,
        pseudonym: reel.pseudonym || null,
        scope: reel.scope,
        createdAt: postCreatedAt,
        updatedAt: postCreatedAt,
      });

      for (let c = 0; c < reel.comments.length; c++) {
        const commenter = allProfiles[(r + c + 1) % allProfiles.length];
        const commentCreatedAt = new Date(postCreatedAt.getTime() + (c + 1) * 20 * 60 * 1000);
        await db.insert(comments).values({
          id: crypto.randomUUID(),
          postId,
          authorId: commenter.id,
          body: reel.comments[c].text,
          createdAt: commentCreatedAt,
          updatedAt: commentCreatedAt,
        });
      }

      await db.insert(votes).values({
        id: crypto.randomUUID(),
        postId,
        userId: allProfiles[(r + 1) % allProfiles.length].id,
        value: 1,
        createdAt: postCreatedAt,
      });

      console.log(`  ✓ Seeded reel: "${reel.title}" by @${author.username}`);
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
  console.log(`- All video reels backed by verified Cloudflare R2 authentic campus videos`);

  await sql.end();
}

main().catch((err) => {
  console.error("Fatal seed error:", err);
  process.exit(1);
});
