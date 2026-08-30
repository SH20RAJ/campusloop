/**
 * Campus Articles & Rich Multimedia Feeds Seeder
 * Populates authentic student articles, tutorials, placement roadmaps,
 * multimedia image posts, interactive polls, and discussions.
 *
 * Run: bun run scripts/seed-articles-and-rich-feeds.ts
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  articles,
  articleVotes,
  comments,
  institutions,
  pollOptions,
  pollVotes,
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

interface SeedArticle {
  title: string;
  slug: string;
  subtitle: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  category: string;
  tags: string[];
  readingTimeMinutes: number;
  viewsCount: number;
  upvotesCount: number;
  isFeatured?: boolean;
  hoursAgo: number;
}

const SEED_ARTICLES: SeedArticle[] = [
  {
    title: "How I Cracked Google L4 as a Tier-3 Engineering College Student",
    slug: "cracked-google-l4-tier-3-engineering-roadmap-2026",
    subtitle: "A no-fluff 6-month roadmap covering DSA, System Design, and getting interview referrals without on-campus placement drives.",
    excerpt: "Breaking into Big Tech without an IIT/NIT tag is daunting, but completely achievable. Here is the exact preparation matrix, LeetCode patterns, and cold emailing template that got me 3 FAANG offers.",
    coverImageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=630&fit=crop",
    category: "PLACEMENTS",
    tags: ["Google", "Placements", "DSA", "SystemDesign", "InterviewPrep"],
    readingTimeMinutes: 7,
    viewsCount: 2420,
    upvotesCount: 384,
    isFeatured: true,
    hoursAgo: 12,
    content: `# How I Cracked Google L4 as a Tier-3 Engineering College Student

Breaking into Big Tech without an IIT/NIT tag feels like an uphill battle. When companies don't visit your campus for Day-1 placements, you have to build your own door. 

Over 6 months of disciplined execution, I went from getting ghosted on LinkedIn to landing **Google L4 (Software Engineer)**, **Amazon SDE-2**, and **Atlassian**.

---

## 1. The DSA Matrix: Quality Over 1,000 Questions

Do not blindly solve 800 random LeetCode problems. Focus on **pattern recognition**:

- **Sliding Window & Two Pointers** (20 problems)
- **Monotonic Stacks & Queues** (15 problems)
- **Graph Traversals (BFS, DFS, Dijkstra, Topo Sort)** (35 problems)
- **Dynamic Programming (Knapsack, LCS, LIS, Tree DP)** (40 problems)
- **Trie & Union-Find** (15 problems)

> **Key Rule**: If you cannot write working code for a problem in 25 minutes on a whiteboard or Google Docs without syntax highlighting, you don't truly own the pattern yet.

---

## 2. Low-Level & High-Level System Design

For L4 / SDE-2 roles, System Design determines your salary band.

### Resources that actually helped:
1. **Designing Data-Intensive Applications** by Martin Kleppmann (Chapters 5, 6, 7, 9).
2. **Alex Xu's System Design Interview Volume 1 & 2**.
3. Designing real-world systems: *Rate Limiter*, *Distributed Task Scheduler*, *Live Campus Notification Engine*.

---

## 3. Cold Outreach That Converts at 35%

Never send: *"Hi sir, please refer me for job id 12345."*

Instead, send a **hyper-personalized 3-bullet pitch**:

\`\`\`markdown
Hi [Name], 
I noticed your work on the Cloud Run autoscaling team. 
I recently built an open-source distributed cache in Go that handles 45k req/sec with raft consensus: [GitHub Link].

I saw open role #12345 on your org and would love your guidance or consideration for a referral. 
Attached is my 1-page ATS resume.
\`\`\`

---

## 4. Final Words for Juniors

Your college tier does not define your technical ceiling. Focus on building real software, mastering fundamentals, and showing up every single day. 

Feel free to DM me on CampusLoop if you want your resume reviewed! 🚀
`,
  },
  {
    title: "Building Production Full-Stack AI Agents in 2026: Next.js, Cloudflare Workers & pgvector",
    slug: "building-production-full-stack-ai-agents-2026",
    subtitle: "A practical guide to building low-latency, autonomous LLM agents with real-time memory and tool calling.",
    excerpt: "Everything you need to know about building stateful AI agents: embedding pipelines, semantic caching with pgvector, and deploying serverless on Cloudflare edge workers.",
    coverImageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=630&fit=crop",
    category: "TECH_AND_CODE",
    tags: ["AI", "NextJS", "Cloudflare", "PostgreSQL", "FullStack"],
    readingTimeMinutes: 9,
    viewsCount: 1840,
    upvotesCount: 295,
    hoursAgo: 24,
    content: `# Building Production Full-Stack AI Agents in 2026

The hype cycle around wrapper chatbots is over. In 2026, engineering teams look for **autonomous agentic workflows** that can execute tool calls, inspect environments, and self-heal on errors.

---

## Architecture Overview

A modern edge AI agent stack looks like this:

1. **Client Interface**: Next.js 16 App Router with React Server Components.
2. **Edge Execution**: Cloudflare Workers for sub-15ms edge inference routing.
3. **Database & Memory**: Neon Serverless PostgreSQL with \`pgvector\` embeddings.
4. **Tool Calling Pipeline**: Deterministic schema validation with Zod.

---

## Semantic Caching with pgvector

To save LLM costs and reduce latency from 1.2s to 18ms, we check for cached semantic duplicates before pinging the foundation model:

\`\`\`sql
SELECT response_payload, 1 - (embedding <=> $1) AS cosine_similarity
FROM agent_query_cache
WHERE 1 - (embedding <=> $1) > 0.94
ORDER BY cosine_similarity DESC
LIMIT 1;
\`\`\`

If cosine similarity exceeds \`0.94\`, serve the cached payload instantly.

---

## Conclusion

The future belongs to engineers who understand both deep systems and generative models. Start building side projects that solve actual student or enterprise bottlenecks!
`,
  },
  {
    title: "The Ultimate Guide to Surviving Engineering Hostel Life (Without Losing Your Sanity)",
    slug: "ultimate-guide-engineering-hostel-life-survival",
    subtitle: "From room cooler hacks to navigating wing politics and 3 AM canteen debates.",
    excerpt: "Hostel life is an unforgettable rollercoaster. Here is our senior handbook on managing laundry, surviving mess food, mastering the 1-night-before exam sprint, and choosing your inner circle.",
    coverImageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&h=630&fit=crop",
    category: "CAMPUS_LIFE",
    tags: ["HostelLife", "CampusGuide", "Freshers", "Banter", "SurvivalGuide"],
    readingTimeMinutes: 5,
    viewsCount: 3100,
    upvotesCount: 460,
    hoursAgo: 36,
    content: `# The Ultimate Guide to Surviving Engineering Hostel Life

When you first pack two suitcases and arrive in your 10x12 hostel room, you think you're just here for a degree. 

You don't know that these concrete walls, squeaky ceiling fans, and 2 AM corridor arguments will become the most cherished chapter of your youth.

---

## The 5 Golden Rules of the Wing

1. **Protect Your Extension Cords**: An unlabelled 6-socket spike buster will vanish into the fourth dimension within 48 hours. Label it with bright neon tape.
2. **The Mess Bhaiya Is Your Best Ally**: A polite smile, calling them *Bhaiya* with genuine respect, and returning trays properly earns you extra paneer during Sunday feasts.
3. **The 3 AM Maggi Protocol**: Never cook Maggi with the door open unless you have enough noodles to feed an entire battalion of hungry wingmates.
4. **Attendance Shortage Math**: Calculate your exact buffer classes on Day 1. Keep an emergency cushion of 3 classes for genuine fever days.
5. **Find Your 2 AM Tribe**: Surrounding yourself with people who challenge you to build projects, play sports, and laugh at failures is the highest ROI of college.

---

Enjoy every single sunset from the hostel terrace. Four years vanish faster than you think! 🌇
`,
  },
  {
    title: "How to Win National Hackathons: From Ideation to Killer 3-Minute Pitches",
    slug: "how-to-win-national-hackathons-pitching-guide",
    subtitle: "Insights from a team that won Smart India Hackathon and 5 major university hackathons.",
    excerpt: "Judges don't judge code; they judge impact, storytelling, and working prototypes. Here is how to structure your 36 hours, pick high-scoring problem statements, and craft winning demo slides.",
    coverImageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&h=630&fit=crop",
    category: "PROJECTS",
    tags: ["Hackathon", "SIH", "Pitching", "Startups", "WebDev"],
    readingTimeMinutes: 6,
    viewsCount: 1590,
    upvotesCount: 270,
    hoursAgo: 48,
    content: `# How to Win National Hackathons

Most teams lose hackathons before writing their first line of code. They pick complex backend architectures nobody can demo in 3 minutes, or build generic todo apps with an AI wrapper.

Having won **Smart India Hackathon (SIH)** and ₹8,00,000+ in prize bounties across 6 hackathons, here is our battle-tested playbook.

---

## 1. The Winning Hackathon Team Composition (The Rule of 4)

- **The Hustler / Presenter**: Owns the pitch deck, market data, and judges Q&A.
- **The UI/UX Sorcerer**: Builds stunning, tactile frontends that wow judges in the first 5 seconds.
- **The Core Backend / AI Engineer**: Handles data pipelines, APIs, and real-time inference.
- **The Demo Finisher**: Prepares seed data, fallback recordings, and guarantees the live demo never crashes.

---

## 2. The 3-Minute Pitch Framework

Judges evaluate 40 teams in a row. They are exhausted. Do not show architecture diagrams for 2 minutes.

- **0:00 - 0:30**: Relatable problem story + shocking campus/industry metric.
- **0:30 - 2:00**: Live, working product demonstration (Show, don't tell).
- **2:00 - 2:40**: Unit economics, feasibility, and technical novelty.
- **2:40 - 3:00**: Call to action and thank you.

Good luck at your next 36-hour hackathon sprint! 🏆
`,
  },
  {
    title: "Off-Campus Internship Playbook: Securing ₹1 Lakh+/Month Stipends as a 2nd & 3rd Year",
    slug: "off-campus-internship-playbook-2026",
    subtitle: "A step-by-step framework for landing high-paying tech internships at high-growth startups and unicorns.",
    excerpt: "Why standard job portal applications fail and how open-source contributions, proof of work, and targeted founder outreach unlock premium engineering internships.",
    coverImageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=630&fit=crop",
    category: "INTERNSHIPS",
    tags: ["Internships", "Startups", "RemoteWork", "Careers", "ProofOfWork"],
    readingTimeMinutes: 8,
    viewsCount: 2890,
    upvotesCount: 412,
    hoursAgo: 60,
    content: `# Off-Campus Internship Playbook

Getting a high-paying internship in your 2nd or 3rd year is the single best career accelerator. It gives you real-world production experience, financial independence, and PPO (Pre-Placement Offer) leverage.

---

## Why Portals Are Black Holes

When a startup posts a job on LinkedIn, they receive 2,500 applications in 12 hours. 90% are never opened.

Instead, win via **Proof of Work (PoW)**:
1. Find a funded Series-A/B startup whose product you admire.
2. Identify a UX friction or missing feature in their web app.
3. Build a working prototype or PR fix in 48 hours.
4. Send a 45-second Loom video demo directly to the VP of Engineering.

This strategy has a **40%+ interview conversion rate** because it demonstrates initiative and immediate execution capability.
`,
  },
];

interface SeedFeedPost {
  type: "NORMAL" | "QUESTION" | "POLL" | "CONFESSION" | "MEME";
  scope: "CAMPUS" | "INDIA" | "GLOBAL";
  body: string;
  isAnonymous: boolean;
  pollChoices?: string[];
  comments: string[];
  upvotesCount: number;
  hoursAgo: number;
}

const SEED_RICH_POSTS: SeedFeedPost[] = [
  {
    type: "NORMAL",
    scope: "CAMPUS",
    body: "Sunset from the Central Library terrace today was pure visual poetry. 🌅 Took a 10-minute break from Operating Systems revision and caught this golden hour glow. Don't forget to take a breather today guys! #CampusVibes #GoldenHour #LibraryMoments",
    isAnonymous: false,
    upvotesCount: 94,
    hoursAgo: 3,
    comments: [
      "The library terrace during sunset hits different ✨",
      "Which camera did you shoot this with? The dynamic range is gorgeous!",
      "Best spot on campus to destress before end-sems.",
    ],
  },
  {
    type: "QUESTION",
    scope: "CAMPUS",
    body: "Quick question for 3rd and 4th years: Which elective between 'Cloud Computing & Distributed Systems' and 'Computer Vision' has better grading and project exposure? Trying to finalize timetable before the portal locks. #ElectiveAdvice #AskSeniors",
    isAnonymous: false,
    upvotesCount: 68,
    hoursAgo: 5,
    comments: [
      "Distributed Systems with Prof. Sharma is 10/10 practical and helps massively in backend interviews!",
      "CV is heavier on math & research papers. Pick Distributed Systems if you want industry SDE roles.",
      "Both have decent grading, but Distributed Systems labs are much more fun.",
    ],
  },
  {
    type: "POLL",
    scope: "GLOBAL",
    body: "What is your primary programming language for competitive programming & technical interviews in 2026?",
    isAnonymous: false,
    pollChoices: [
      "C++ (STL Speed & CP King) ⚡",
      "Java (Collections & Clean OOP) ☕",
      "Python (Fast Prototyping & AI) 🐍",
      "Rust / TypeScript (Modern Systems) 🦀",
    ],
    upvotesCount: 182,
    hoursAgo: 9,
    comments: [
      "C++ template speed in LeetCode contests is unmatched.",
      "Python for DSA graph algorithms saves so much boilerplate typing time!",
      "Java for placements, Python for machine learning side projects.",
    ],
  },
  {
    type: "NORMAL",
    scope: "CAMPUS",
    body: "Organizing a campus UI/UX and Frontend Figma sprint this Sunday 3:00 PM at the Innovation Hub! 🎨💻 Bringing stickers, coffee, and live critiques of student portfolio sites. All skill levels welcome! Drop a comment if you want a seat. #DesignSprint #WebDev #Figma",
    isAnonymous: false,
    upvotesCount: 88,
    hoursAgo: 14,
    comments: [
      "Count me in! Need feedback on my developer portfolio redesign.",
      "Will there be Figma component library templates shared?",
      "See you there! Bringing my MacBook and coffee mug ☕",
    ],
  },
  {
    type: "MEME",
    scope: "CAMPUS",
    body: "Me: 'I will wake up at 6:30 AM, hit the campus gym, revise 2 chapters of Microprocessors, and have a healthy breakfast.'\n\nAlso me at 8:28 AM running in slippers to the lecture hall with 1 unbrushed tooth and 4% phone battery. 💀 #EngineeringLife #AttendanceSprint",
    isAnonymous: false,
    upvotesCount: 230,
    hoursAgo: 18,
    comments: [
      "The slippers sprint across the quad is a mandatory rite of passage 😭",
      "Why is this literally every Monday morning of my existence lmao",
      "Running faster than Usain Bolt to beat the professor before door locks!",
    ],
  },
];

async function seedArticlesAndFeeds() {
  console.log("🌱 Starting Campus Articles & Multimedia Feeds Seeder...");

  const dbUrl = requireDatabaseUrl();
  const client = postgres(dbUrl, { max: 1 });
  const db = drizzle(client);

  try {
    // 1. Fetch Indian institutions
    const allInstitutions = await db.select().from(institutions).limit(50);
    if (allInstitutions.length === 0) {
      console.error("❌ No institutions found!");
      return;
    }

    const primaryCollege = allInstitutions.find((i) =>
      i.slug?.includes("bit") || i.name?.toLowerCase().includes("technology")
    ) || allInstitutions[0];

    // 2. Fetch profiles
    const allProfiles = await db.select().from(userProfiles).limit(100);
    if (allProfiles.length === 0) {
      console.error("❌ No profiles found!");
      return;
    }

    console.log(`🏫 Primary Campus Hub: ${primaryCollege.name}`);
    console.log(`👥 Using ${allProfiles.length} verified student profiles.`);

    // ─── 3. Seed Articles ───
    let insertedArticlesCount = 0;
    for (const art of SEED_ARTICLES) {
      const author = allProfiles[Math.floor(Math.random() * allProfiles.length)];
      const targetCollege = allInstitutions[Math.floor(Math.random() * allInstitutions.length)];
      const publishedAt = new Date(Date.now() - art.hoursAgo * 60 * 60 * 1000);
      const articleId = crypto.randomUUID();

      await db
        .insert(articles)
        .values({
          id: articleId,
          slug: art.slug,
          title: art.title,
          subtitle: art.subtitle,
          excerpt: art.excerpt,
          content: art.content,
          coverImageUrl: art.coverImageUrl,
          authorId: author.id,
          institutionId: targetCollege.id,
          category: art.category,
          tags: art.tags,
          readingTimeMinutes: art.readingTimeMinutes,
          viewsCount: art.viewsCount,
          upvotesCount: art.upvotesCount,
          isFeatured: art.isFeatured ?? false,
          status: "PUBLISHED",
          publishedAt,
          createdAt: publishedAt,
          updatedAt: publishedAt,
        })
        .onConflictDoNothing();

      insertedArticlesCount++;

      // Simulate article upvotes
      const articleUpvoters = allProfiles
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(30, allProfiles.length));

      for (const voter of articleUpvoters) {
        await db
          .insert(articleVotes)
          .values({
            id: crypto.randomUUID(),
            articleId: articleId,
            profileId: voter.id,
            value: 1,
            createdAt: publishedAt,
          })
          .onConflictDoNothing();
      }
    }

    // ─── 4. Seed Rich Multimedia & Normal Feeds ───
    let insertedPostsCount = 0;
    let insertedCommentsCount = 0;

    for (const item of SEED_RICH_POSTS) {
      const author = allProfiles[Math.floor(Math.random() * allProfiles.length)];
      const targetInst = item.scope === "CAMPUS" ? primaryCollege : allInstitutions[Math.floor(Math.random() * allInstitutions.length)];
      const postCreatedAt = new Date(Date.now() - item.hoursAgo * 60 * 60 * 1000);
      const postId = crypto.randomUUID();

      await db
        .insert(posts)
        .values({
          id: postId,
          authorId: author.id,
          pseudonym: item.isAnonymous ? "Campus Explorer" : null,
          institutionId: targetInst.id,
          type: item.type,
          scope: item.scope,
          body: item.body,
          isAnonymous: item.isAnonymous,
          status: "PUBLISHED",
          createdAt: postCreatedAt,
          updatedAt: postCreatedAt,
        });

      insertedPostsCount++;

      // Poll options
      if (item.type === "POLL" && item.pollChoices) {
        const optionRows = [];
        for (let idx = 0; idx < item.pollChoices.length; idx++) {
          const text = item.pollChoices[idx];
          const optionId = crypto.randomUUID();
          await db
            .insert(pollOptions)
            .values({
              id: optionId,
              postId: postId,
              text,
            });

          optionRows.push({ id: optionId, text });
        }

        const voters = allProfiles.slice(0, Math.min(40, allProfiles.length));
        for (const voter of voters) {
          const randomOpt = optionRows[Math.floor(Math.random() * optionRows.length)];
          await db
            .insert(pollVotes)
            .values({
              id: crypto.randomUUID(),
              postId: postId,
              optionId: randomOpt.id,
              userId: voter.id,
            })
            .onConflictDoNothing();
        }
      }

      // Votes
      const upvoters = allProfiles
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.min(item.upvotesCount, allProfiles.length));

      for (const upvoter of upvoters) {
        await db
          .insert(votes)
          .values({
            id: crypto.randomUUID(),
            postId: postId,
            userId: upvoter.id,
            value: 1,
            createdAt: postCreatedAt,
          })
          .onConflictDoNothing();
      }

      // Comments
      for (const text of item.comments) {
        const commentAuthor = allProfiles[Math.floor(Math.random() * allProfiles.length)];
        const commentCreatedAt = new Date(postCreatedAt.getTime() + Math.random() * 2 * 60 * 60 * 1000);

        await db
          .insert(comments)
          .values({
            id: crypto.randomUUID(),
            postId: postId,
            authorId: commentAuthor.id,
            body: text,
            isAnonymous: false,
            createdAt: commentCreatedAt,
            updatedAt: commentCreatedAt,
          });

        insertedCommentsCount++;
      }
    }

    console.log("==========================================");
    console.log("🎉 Seed Completed Successfully!");
    console.log(`📰 ${insertedArticlesCount} rich long-form articles published.`);
    console.log(`📝 ${insertedPostsCount} rich feed posts, polls & memes created.`);
    console.log(`💬 ${insertedCommentsCount} authentic peer discussions added.`);
    console.log("==========================================");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    await client.end();
  }
}

seedArticlesAndFeeds();
