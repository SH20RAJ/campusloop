/**
 * Rich Communities & Community Posts Seeder
 * Populates authentic student communities with avatars, banners, rules,
 * active members, and high-engagement posts with comments.
 *
 * Run: bun run scripts/seed-communities-rich.ts
 */
import { getDb } from "../src/db";
import { comments, communities, communityMembers, pollOptions, posts, userProfiles, votes } from "../src/db/schema";
import { loadLocalEnv } from "../src/lib/load-env";
import { eq } from "drizzle-orm";

loadLocalEnv();



const SEED_COMMUNITIES = [
  {
    id: "comm_music",
    name: "Music Jams & Dhwani",
    slug: "music-jams",
    description: "The official campus hub for musicians, bedroom producers, acoustic jam sessions, and Bitotsav battle of the bands. Drop chords, indie playlists, and jam invites! 🎸🎹",
    category: "Cultural & Arts",
    privacy: "PUBLIC",
    avatarUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&auto=format&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80",
    points: 420,
    rules: JSON.stringify([
      { title: "Share Original & Indie Music", description: "All genres welcome: rock, indie, classical, lofi, electronic, metal." },
      { title: "Respect Fellow Jam Session Members", description: "Constructive feedback only. Encourage beginners." },
      { title: "No Spam or Self-Promotion Without Context", description: "Keep links relevant to music discussions and campus gigs." },
    ]),
    posts: [
      {
        type: "NORMAL" as const,
        body: "Acoustic jam session tonight near BIT Lake around 9:30 PM! Bringing two acoustic guitars and a cajón. Anyone who wants to sing along or play flute/harmonica is warmly welcome! 🎸🌙 #MusicJams #BITMesra",
        comments: [
          "I will bring my ukulele! See you guys by the lakeside bench.",
          "Can we please play 'Choo Lo' and some Mohit Chauhan tracks?",
          "Count me in, needed this break before endsems so badly.",
        ],
        upvotes: 38,
      },
      {
        type: "POLL" as const,
        body: "Bitotsav 2026 Battle of Bands: What classic rock track should our band cover for the finals? 🥁⚡ #MusicJams #Bitotsav",
        options: ["Sweet Child O' Mine (Guns N' Roses)", "Comfortably Numb (Pink Floyd)", "Sayonee (Junoon)", "Rockstar / Sadda Haq (A.R. Rahman)"],
        comments: [
          "Comfortably Numb second guitar solo under stage lights will give goosebumps!",
          "Sadda Haq if you want the entire Gymkhana ground jumping.",
          "Junoon's Sayonee has the best fusion energy for college crowds.",
        ],
        upvotes: 49,
      },
      {
        type: "NORMAL" as const,
        body: "Any audio producers on campus working with FL Studio or Ableton Live? Looking to collaborate on a lofi ambient track inspired by winter mornings in Ranchi 🎧🎹 #MusicJams #Production",
        comments: [
          "Yes! I have a mini MIDI keyboard and Scarlett 2i2 audio interface at Hostel 10.",
          "Sent you a DM on CampusLoop with my SoundCloud previews.",
        ],
        upvotes: 27,
      },
      {
        type: "QUESTION" as const,
        body: "Beginner question: Best acoustic guitar under ₹8,000 for learning chords in hostel? Yamaha F280 vs Fender FA-115? 🎸 #MusicJams #GuitarHelp",
        comments: [
          "Yamaha F280 without a doubt. Stays in tune and very durable for hostel life.",
          "Get the action lowered by a luthier in main Ranchi market, makes fingerpicking 10x easier.",
        ],
        upvotes: 31,
      },
      {
        type: "NORMAL" as const,
        body: "Late night jamming tape from Hostel 11 common room: We improvised a 12-bar blues progression for 40 minutes straight. Pure therapy after a rough day of lab reports 🎶☕ #MusicJams #HostelLife",
        comments: [
          "Heard you guys from the 2nd floor, sounded incredible honestly!",
          "Please upload the full recording drive link!",
        ],
        upvotes: 44,
      },
    ],
  },
  {
    id: "comm_coding",
    name: "Coders Club & Hackers",
    slug: "coders-club",
    description: "Algorithmic thinking, LeetCode daily grinds, system design tear-downs, HackBIT squads, and building high-scale student software. 💻🚀",
    category: "Tech & Coding",
    privacy: "PUBLIC",
    avatarUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&auto=format&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
    points: 680,
    rules: JSON.stringify([
      { title: "Open Source First", description: "Share GitHub repositories and clean pull requests." },
      { title: "No Cheating on Active Contests", description: "Discuss LeetCode / Codeforces solutions only after contest finishes." },
      { title: "Help Freshers Learn", description: "Be patient with setup issues and bug troubleshooting." },
    ]),
    posts: [
      {
        type: "NORMAL" as const,
        body: "Today's LeetCode Daily was a clean Segment Tree / Fenwick Tree problem! If anyone struggled with point updates, here is an intuitive breakdown with 0-indexed bit manipulation 💡 #CodersClub #Tech",
        comments: [
          "Great explanation, the bitwise AND trick `i & -i` is so neat.",
          "Segment tree implementation is always so boilerplate, but Fenwick is pure beauty.",
        ],
        upvotes: 42,
      },
      {
        type: "POLL" as const,
        body: "Backend stack preference for building 24-hour hackathon MVPs: What is your go-to? ⚡ #CodersClub #Hackathon",
        options: ["Next.js App Router + Neon Postgres", "FastAPI + PostgreSQL", "Go (Gin / Fiber) + SQLite", "Node.js (Express) + MongoDB"],
        comments: [
          "Next.js fullstack lets frontend & backend ship simultaneously in hours.",
          "Go is unmatched if you need WebSocket real-time throughput.",
        ],
        upvotes: 56,
      },
      {
        type: "NORMAL" as const,
        body: "Building a distributed cache simulator in Rust for our Computer Networks term project. Looking for one teammate with basic memory safety / concurrency background! 🦀 #CodersClub #Rust",
        comments: ["Sent you a DM, took Systems Programming last semester."],
        upvotes: 35,
      },
    ],
  },
  {
    id: "comm_placements",
    name: "Placement & Career Prep",
    slug: "placement-prep",
    description: "Mock interviews, coding test patterns, resume reviews, salary trends, and verified alumni referral threads for Indian college students. 💼🎯",
    category: "Academics & Placements",
    privacy: "PUBLIC",
    avatarUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=200&auto=format&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80",
    points: 590,
    rules: JSON.stringify([
      { title: "Verified Information Only", description: "Share honest interview experiences and preparation timelines." },
      { title: "Resume Formatting Standards", description: "Keep shared resumes anonymized (mask phone numbers & personal emails)." },
    ]),
    posts: [
      {
        type: "NORMAL" as const,
        body: "Comprehensive Day 1 Technical Interview Checklist: 1) System Design basics (Load Balancers, Caching, DB sharding), 2) Top 50 LeetCode Mediums (DP, Graphs, Trees), 3) OS concepts (Paging, Deadlocks, Mutex vs Semaphore). All the best everyone! 🚀💼 #PlacementPrep #CampusPlacements",
        comments: [
          "Saving this! DBMS transaction ACID properties and indexing are also asked frequently.",
          "Thank you for sharing, very helpful for 7th semester students.",
        ],
        upvotes: 68,
      },
      {
        type: "POLL" as const,
        body: "Pre-final years: Have you started your Core CS fundamental revisions (OS / DBMS / CN)? 📚 #PlacementPrep",
        options: ["100% revised with notes", "Currently on Operating Systems", "Starting this weekend", "Full panic mode 💀"],
        comments: ["Gate Smashers and Striver playlists are saving lives right now."],
        upvotes: 54,
      },
    ],
  },
  {
    id: "comm_anime",
    name: "Anime & Pop Culture Hub",
    slug: "anime-otakus",
    description: "Weekly episode discussions, manga recommendations, cosplay planning for fest season, and gaming tournaments. ⛩️🎮",
    category: "Gaming & Anime",
    privacy: "PUBLIC",
    avatarUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&auto=format&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80",
    points: 310,
    rules: JSON.stringify([
      { title: "Spoiler Tags Mandatory", description: "Warn before discussing latest manga chapter events." },
      { title: "No Waifu/Husbando Wars", description: "Keep banter friendly." },
    ]),
    posts: [
      {
        type: "NORMAL" as const,
        body: "Anime screening night at the hostel projection room this Saturday at 10 PM! Voting between Attack on Titan final season marathon vs Jujutsu Kaisen Shibuya incident arc 🍿🔥 #AnimeHub #HostelLife",
        comments: ["Shibuya Arc animation on big screen is going to be unreal!", "Bring popcorn from SAR."],
        upvotes: 39,
      },
    ],
  },
  {
    id: "comm_startups",
    name: "Campus Builders & Startups",
    slug: "campus-startups",
    description: "Student founders, indie hackers, product builders, design critiques, and early-stage MVP demos across Indian universities. 💡🚀",
    category: "Tech & Coding",
    privacy: "PUBLIC",
    avatarUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&auto=format&fit=crop&q=80",
    bannerUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
    points: 480,
    rules: JSON.stringify([
      { title: "Build In Public", description: "Share your metrics, lessons, and product prototypes." },
      { title: "Constructive Feedback", description: "Critique user flows and UI cleanly." },
    ]),
    posts: [
      {
        type: "NORMAL" as const,
        body: "Lessons from launching our campus food delivery aggregation bot: 1) Students care 10x more about speed than fancy UI, 2) WhatsApp bots have 90%+ open rates vs native apps, 3) Canteen vendors prefer cash / direct UPI over wallet settlements. Happy to answer questions! 🍜📱 #Startups #Builders",
        comments: [
          "Super insightful takeaways! What was your delivery fleet model?",
          "Students doing peer-delivery between hostel blocks is brilliant.",
        ],
        upvotes: 47,
      },
    ],
  },
];

async function seedRichCommunities() {
  const db = getDb();

  console.log("🚀 Starting Rich Communities database seeding...");

  // Fetch available student profiles
  const profiles = await db.query.userProfiles.findMany({
    limit: 50,
  });

  if (profiles.length === 0) {
    console.error("❌ No student profiles found in database.");
    return;
  }


  const defaultCreator = profiles[0];

  for (const cData of SEED_COMMUNITIES) {
    console.log(`Processing community: ${cData.name} (${cData.id})...`);

    const existing = await db.query.communities.findFirst({
      where: eq(communities.id, cData.id),
    });

    if (existing) {
      await db
        .update(communities)
        .set({
          name: cData.name,
          slug: cData.slug,
          description: cData.description,
          category: cData.category,
          privacy: cData.privacy,
          avatarUrl: cData.avatarUrl,
          bannerUrl: cData.bannerUrl,
          points: cData.points,
          rules: cData.rules,
          updatedAt: new Date(),
        })
        .where(eq(communities.id, cData.id));
    } else {
      await db.insert(communities).values({
        id: cData.id,
        name: cData.name,
        slug: cData.slug,
        description: cData.description,
        category: cData.category,
        privacy: cData.privacy,
        avatarUrl: cData.avatarUrl,
        bannerUrl: cData.bannerUrl,
        points: cData.points,
        rules: cData.rules,
        creatorId: defaultCreator.id,
        updatedAt: new Date(),
      });
    }


    // 2. Add members to community (10-15 profiles per community) in a single batch
    const memberPool = profiles.slice(0, 15);
    const memberRows = memberPool.map((memberProfile, mIdx) => ({
      communityId: cData.id,
      userId: memberProfile.id,
      role: mIdx === 0 ? "ADMIN" : mIdx < 3 ? "MODERATOR" : "MEMBER",
      status: "ACTIVE",
    }));
    await db.insert(communityMembers).values(memberRows).onConflictDoNothing().catch(() => {});

    // 3. Seed Posts for this community
    for (let pIdx = 0; pIdx < cData.posts.length; pIdx++) {
      const p = cData.posts[pIdx];
      const author = memberPool[pIdx % memberPool.length];

      const [newPost] = await db
        .insert(posts)
        .values({
          authorId: author.id,
          institutionId: author.institutionId || "inst_35df75700bb23dd30311ef5f",
          communityId: cData.id,
          type: p.type,
          body: p.body,
          isAnonymous: false,
          status: "PUBLISHED",
          createdAt: new Date(Date.now() - (pIdx * 4 + 1) * 3600 * 1000),
        })
        .returning();

      // Poll options
      if (p.type === "POLL" && "options" in p && p.options) {
        await db
          .insert(pollOptions)
          .values(
            p.options.map((optText) => ({
              postId: newPost.id,
              text: optText,
            }))
          )
          .catch(() => {});
      }

      // Comments in single batch
      if (p.comments.length > 0) {
        const commentRows = p.comments.map((text, cIdx) => ({
          postId: newPost.id,
          authorId: memberPool[(pIdx + cIdx + 1) % memberPool.length].id,
          body: text,
          isAnonymous: false,
          createdAt: new Date(newPost.createdAt.getTime() + (cIdx + 1) * 400 * 1000),
        }));
        await db.insert(comments).values(commentRows).catch(() => {});
      }

      // Upvotes in single batch
      const upvoters = memberPool.slice(0, Math.min(p.upvotes, memberPool.length));
      if (upvoters.length > 0) {
        const voteRows = upvoters.map((u) => ({
          postId: newPost.id,
          userId: u.id,
          value: 1,
        }));
        await db.insert(votes).values(voteRows).onConflictDoNothing().catch(() => {});
      }
    }


    console.log(`✅ Seeded ${cData.posts.length} rich posts for ${cData.name}`);
  }

  console.log("🎉 Rich Communities seeding completed successfully!");
}


seedRichCommunities().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
