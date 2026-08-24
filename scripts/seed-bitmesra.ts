/**
 * BIT Mesra Flagship Campus Seeder
 * Populates authentic BIT Mesra student profiles, high-engagement discussions,
 * confessions, polls, comments, upvotes, and dating profiles.
 *
 * Run: bun run scripts/seed-bitmesra.ts
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  userProfiles,
  posts,
  comments,
  votes,
  pollOptions,
  pollVotes,
  swipes,
} from "../src/db/schema";
import { loadLocalEnv } from "../src/lib/load-env";

loadLocalEnv();

function requireDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.DB_URL;
  if (!databaseUrl) throw new Error("Missing DATABASE_URL.");
  return databaseUrl;
}

const BIT_MESRA_ID = "inst_35df75700bb23dd30311ef5f";

const BIT_STUDENTS = [
  // ─── Guys ───
  {
    name: "Aman Verma",
    username: "aman_v_mesra",
    gender: "MALE" as const,
    course: "B.Tech",
    branch: "Computer Science & Engineering",
    year: 3,
    bio: "CSE '27 | ACM BIT Mesra | Building full-stack stuff & living on IC chai ☕",
    interests: ["Tech & Coding", "Startups & AI", "Late Night Tea", "Gaming"],
    dob: "2004-09-14",
    points: 340,
  },
  {
    name: "Rohan Kulkarni",
    username: "rohan_kulkarni",
    gender: "MALE" as const,
    course: "B.Tech",
    branch: "Electronics & Communication",
    year: 3,
    bio: "ECE sophomore | Robolution BIT Mesra | Embedded systems nerd | Hostel 11",
    interests: ["Tech & Coding", "Gaming", "Hostel Life", "Sports"],
    dob: "2004-11-22",
    points: 210,
  },
  {
    name: "Shaswat Raj",
    username: "shaswat_raj",
    gender: "MALE" as const,
    course: "B.Tech",
    branch: "Computer Science & Engineering",
    year: 2,
    bio: "CSE @ BIT Mesra | Fullstack Builder | Founder CampusLoop 🚀",
    interests: ["Startups & AI", "Tech & Coding", "Hostel Life", "Photography"],
    dob: "2005-04-18",
    points: 580,
  },
  {
    name: "Arjun Sen",
    username: "arjun_sen_mesra",
    gender: "MALE" as const,
    course: "B.Tech",
    branch: "Mechanical Engineering",
    year: 4,
    bio: "Firebolt Racing BIT Mesra 🏎️ | ME Final Year | Post-placement chilling at SAR",
    interests: ["Sports", "Late Night Tea", "Photography", "Hostel Life"],
    dob: "2003-07-09",
    points: 420,
  },
  {
    name: "Devanshu Mishra",
    username: "devanshu_m",
    gender: "MALE" as const,
    course: "B.Tech",
    branch: "Information Technology",
    year: 2,
    bio: "IT '28 | Competitive programming & FIFA tournaments at Hostel 10",
    interests: ["Tech & Coding", "Gaming", "Memes & Banter", "Late Night Tea"],
    dob: "2005-08-30",
    points: 190,
  },
  {
    name: "Kabir Sengupta",
    username: "kabir_sengupta",
    gender: "MALE" as const,
    course: "B.Arch",
    branch: "Architecture & Planning",
    year: 4,
    bio: "B.Arch '26 | Sketching models at 3 AM | Dhwani Music Society 🎸",
    interests: ["Music & Jamming", "Photography", "Cinema & TV", "Hostel Life"],
    dob: "2003-12-05",
    points: 310,
  },
  {
    name: "Ayush Tiwari",
    username: "ayush_tiwari_bit",
    gender: "MALE" as const,
    course: "B.Tech",
    branch: "Electrical & Electronics",
    year: 3,
    bio: "EEE '27 | EDC Core | Bitotsav Organizing Committee | Chai at Sharma ji",
    interests: ["Startups & AI", "Late Night Tea", "Memes & Banter", "Campus Dating"],
    dob: "2004-03-17",
    points: 275,
  },
  {
    name: "Pranav Jha",
    username: "pranav_jha",
    gender: "MALE" as const,
    course: "B.Tech",
    branch: "Chemical Engineering",
    year: 2,
    bio: "ChemEngg | Football team wing-back ⚽ | Always at Gymkhana lawns",
    interests: ["Sports", "Hostel Life", "Exam Prep", "Music & Jamming"],
    dob: "2005-06-25",
    points: 150,
  },
  {
    name: "Siddharth Roy",
    username: "sid_roy_mesra",
    gender: "MALE" as const,
    course: "B.Tech",
    branch: "Biotechnology",
    year: 3,
    bio: "Biotech '27 | Lab report survivor | Anime & late night gaming",
    interests: ["Cinema & TV", "Gaming", "Late Night Tea", "Tech & Coding"],
    dob: "2004-10-12",
    points: 180,
  },
  {
    name: "Nikhil Pandey",
    username: "nikhil_pandey_bit",
    gender: "MALE" as const,
    course: "MCA",
    branch: "Computer Applications",
    year: 2,
    bio: "MCA '26 | LeetCode grind | Looking for hackathon squads",
    interests: ["Tech & Coding", "Startups & AI", "Exam Prep", "Late Night Tea"],
    dob: "2002-05-19",
    points: 230,
  },

  // ─── Girls ───
  {
    name: "Ananya Kashyap",
    username: "ananya_kashyap",
    gender: "FEMALE" as const,
    course: "B.Tech",
    branch: "Computer Science & Engineering",
    year: 3,
    bio: "CSE '27 | IEEE Student Branch | Reading at BIT Lake & coffee fanatic ☕",
    interests: ["Tech & Coding", "Photography", "Cinema & TV", "Campus Dating"],
    dob: "2004-08-19",
    points: 380,
  },
  {
    name: "Diya Chatterjee",
    username: "diya_chatterjee",
    gender: "FEMALE" as const,
    course: "B.Tech",
    branch: "Electronics & Communication",
    year: 2,
    bio: "ECE '28 | NAPS BIT Mesra (News & Media) | Theatre & debate enthusiast ✨",
    interests: ["Music & Jamming", "Memes & Banter", "Late Night Tea", "Photography"],
    dob: "2005-02-14",
    points: 290,
  },
  {
    name: "Sneha Sinha",
    username: "sneha_sinha_bit",
    gender: "FEMALE" as const,
    course: "B.Arch",
    branch: "Architecture & Planning",
    year: 3,
    bio: "B.Arch '27 | 3D rendering in CAT lab | Street photography in Ranchi 📸",
    interests: ["Photography", "Cinema & TV", "Music & Jamming", "Hostel Life"],
    dob: "2004-05-28",
    points: 340,
  },
  {
    name: "Riya Agrawal",
    username: "riya_agrawal_mesra",
    gender: "FEMALE" as const,
    course: "B.Tech",
    branch: "Information Technology",
    year: 3,
    bio: "IT '27 | Web dev & UI/UX | Ehsaas Dramatics Society | IC parathas are life",
    interests: ["Startups & AI", "Tech & Coding", "Late Night Tea", "Memes & Banter"],
    dob: "2004-12-03",
    points: 410,
  },
  {
    name: "Tanvi Saxena",
    username: "tanvi_saxena",
    gender: "FEMALE" as const,
    course: "MBA",
    branch: "Finance & Marketing",
    year: 2,
    bio: "MBA '26 | Case study competitions & coffee talks | Bitotsav sponsor lead",
    interests: ["Startups & AI", "Campus Dating", "Late Night Tea", "Sports"],
    dob: "2002-09-08",
    points: 320,
  },
  {
    name: "Isha Mukherjee",
    username: "isha_mukherjee",
    gender: "FEMALE" as const,
    course: "B.Tech",
    branch: "Computer Science & Engineering",
    year: 2,
    bio: "CSE '28 | Competitive programming & badminton | Saraswati hostel vibes",
    interests: ["Tech & Coding", "Sports", "Music & Jamming", "Exam Prep"],
    dob: "2005-07-21",
    points: 260,
  },
  {
    name: "Kavya Patel",
    username: "kavya_patel_bit",
    gender: "FEMALE" as const,
    course: "B.Tech",
    branch: "Artificial Intelligence & ML",
    year: 2,
    bio: "AIML '28 | LLM finetuning & Kaggle | Always hunting for good cold coffee",
    interests: ["Tech & Coding", "Startups & AI", "Late Night Tea", "Cinema & TV"],
    dob: "2005-10-15",
    points: 295,
  },
  {
    name: "Pooja Kumari",
    username: "pooja_kumari_mesra",
    gender: "FEMALE" as const,
    course: "B.Tech",
    branch: "Biotechnology",
    year: 4,
    bio: "Biotech '26 | Graduating soon | Rotaract Club | Will miss Sharma Ji's tea",
    interests: ["Photography", "Hostel Life", "Late Night Tea", "Music & Jamming"],
    dob: "2003-04-11",
    points: 350,
  },
];

const BIT_POSTS = [
  {
    type: "POLL" as const,
    scope: "CAMPUS" as const,
    authorUser: "shaswat_raj",
    body: "Be honest: Where do you actually get the best late-night food on BIT Mesra campus? 🍜 #BITMesra #HostelLife",
    options: ["IC (Inner Canteen)", "Sharma Ji Tea Stall", "C-Shop / SAR", "Hostel Night Canteen"],
    upvotes: 42,
  },
  {
    type: "CONFESSION" as const,
    scope: "CAMPUS" as const,
    authorUser: "aman_v_mesra",
    isAnonymous: true,
    pseudonym: "IC Chai Addict",
    body: "Confession: I've attended 0 lectures of Signals & Systems this month because 8 AM winter morning attendance in Main Building is humanly impossible. Relying entirely on YouTube playlists now 💀 #Confession #BITMesra",
    upvotes: 38,
  },
  {
    type: "QUESTION" as const,
    scope: "CAMPUS" as const,
    authorUser: "ananya_kashyap",
    body: "Are end-sem subject notes and previous year question papers for 4th sem CSE / IT available on any shared Drive? Please drop the link below! 🙏 #CampusHelp #BITMesra",
    upvotes: 29,
  },
  {
    type: "NORMAL" as const,
    scope: "CAMPUS" as const,
    authorUser: "arjun_sen_mesra",
    body: "Firebolt Racing workshop session tonight at ME Workshop! If you're interested in IC engines, vehicle dynamics, or telemetry systems, drop by at 6:30 PM. Open for 1st & 2nd years! 🏎️⚡ #BITMesra #Firebolt",
    upvotes: 35,
  },
  {
    type: "POLL" as const,
    scope: "CAMPUS" as const,
    authorUser: "diya_chatterjee",
    body: "Which BIT Mesra fest energy hits the absolute hardest? 🔥 #BITMesra #Bitotsav",
    options: ["Bitotsav (Cultural Fest)", "Pantheon (Tech Fest)", "Vajra (Sports Fest)", "Department Freshers"],
    upvotes: 54,
  },
  {
    type: "CONFESSION" as const,
    scope: "CAMPUS" as const,
    authorUser: "rohan_kulkarni",
    isAnonymous: true,
    pseudonym: "Mesra Night Owl",
    body: "To the person who returned my lost cycle key near BIT Lake yesterday: you are an absolute angel. May your mess always serve chicken biryani on Sundays ❤️ #Confession #BITMesra",
    upvotes: 46,
  },
  {
    type: "NORMAL" as const,
    scope: "CAMPUS" as const,
    authorUser: "riya_agrawal_mesra",
    body: "Anyone heading to Ranchi Railway Station or Birsa Munda Airport this Friday evening for the long weekend? Looking to split an Uber / auto from Main Gate! DM me. 🚗🧳 #RideShare #BITMesra",
    upvotes: 21,
  },
  {
    type: "NORMAL" as const,
    scope: "CAMPUS" as const,
    authorUser: "shaswat_raj",
    body: "CampusLoop is officially live for BIT Mesra students! Real campus feed, anonymous confessions, peer notes, dating matches, and 1,350+ college radius. Let's make this our hub! Drop your feedback 🔥 #BITMesra #CampusLoop",
    upvotes: 68,
  },
  {
    type: "QUESTION" as const,
    scope: "CAMPUS" as const,
    authorUser: "ayush_tiwari_bit",
    body: "Best quiet spot to sit with a laptop and good Wi-Fi during placement season? CAT lab vs Central Library 2nd floor? #BITMesra #PlacementDiaries",
    upvotes: 24,
  },
  {
    type: "CONFESSION" as const,
    scope: "CAMPUS" as const,
    authorUser: "devanshu_m",
    isAnonymous: true,
    pseudonym: "CAT Lab Ghost",
    body: "I walked all the way to OC for cheese maggi in heavy rain only to find out they were out of gas. Top 10 villain origin stories 🌧️ #HostelLife #BITMesra",
    upvotes: 39,
  },
];

const BIT_COMMENTS_MAP: Record<number, string[]> = {
  0: [
    "IC cold coffee and aloo paratha after 10 PM is unmatched 🔥",
    "Sharma Ji's ginger tea during winter end-sems saved my life honestly.",
    "Hostel 11 night canteen paneer roll deserves more respect haha",
    "Nothing beats sitting at SAR with friends at 2 AM",
  ],
  1: [
    "Literally me right now, YouTube + NPTEL speedrun 😭",
    "Send the playlist link in DMs please!",
    "Prof is taking surprise quizzes every Monday though, be careful!",
  ],
  2: [
    "Check the ACM BIT Mesra GitHub drive, all PYQs from 2019-2024 are uploaded!",
    "Sent you the Google Drive link with handwritten notes for Operating Systems.",
    "Thank you so much, was struggling with DBMS notes!",
  ],
  3: [
    "Will definitely come! Do we need any prior CAD experience for first years?",
    "Firebolt team is legendary, see you guys at the workshop.",
  ],
  4: [
    "Bitotsav pronite concerts are unmatched in all of Eastern India 🔥",
    "Pantheon hackathon night has the best vibes though!",
    "Vajra football finals under floodlights at Gymkhana is pure goosebumps.",
  ],
  5: [
    "Haha glad you got it back! Mesra junta is always helpful 🙌",
    "May your CGPA stay above 9.0 forever for this blessing 😂",
  ],
  6: [
    "I'm leaving around 6:00 PM for Hatia Station, let's pool!",
    "Sent you a DM, have space for 2 more people in the cab.",
  ],
  7: [
    "UI feels super sleek and fast! Great initiative for BIT Mesra 🚀",
    "Loving the confessions and dating match deck. Finally our own app!",
    "Shared in our hostel WhatsApp group, let's go!",
  ],
  8: [
    "Central Library 2nd floor corner cubicles have the best AC and lowest noise.",
    "R&D building 1st floor reading room is also super underrated.",
  ],
  9: [
    "The pain is immeasurable 😂 Next time check their WhatsApp status first!",
    "Happened to me last semester during mid-sems, ended up having 2-minute uncooked noodles haha",
  ],
};

async function main() {
  const databaseUrl = requireDatabaseUrl();
  console.log("Connecting to database for BIT Mesra campus seeding...");
  const client = postgres(databaseUrl, { max: 5, idle_timeout: 30 });
  const db = drizzle(client);

  console.log(`Targeting institution: ${BIT_MESRA_ID} (Birla Institute of Technology, Mesra / Ranchi)`);

  // 1. Seed Student Profiles
  console.log(`Seeding ${BIT_STUDENTS.length} authentic BIT Mesra student profiles...`);
  const insertedUserMap = new Map<string, string>(); // username -> id

  for (const s of BIT_STUDENTS) {
    const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(s.username)}`;
    const [user] = await db
      .insert(userProfiles)
      .values({
        id: `bit_user_${s.username}`,
        userId: `bit_auth_${s.username}`,
        username: s.username,
        displayName: s.name,
        officialName: s.name,
        avatarUrl,
        gender: s.gender,
        dob: s.dob,
        isDobPrivate: false,
        course: s.course,
        branch: s.branch,
        year: s.year,
        bio: s.bio,
        interests: s.interests,
        institutionId: BIT_MESRA_ID,
        onboardingCompleted: true,
        role: s.username === "shaswat_raj" ? "ADMIN" : "STUDENT",
        status: "ACTIVE",
        points: s.points,
      })
      .onConflictDoUpdate({
        target: userProfiles.username,
        set: {
          institutionId: BIT_MESRA_ID,
          bio: s.bio,
          interests: s.interests,
          points: s.points,
          dob: s.dob,
        },
      })
      .returning();

    if (user) {
      insertedUserMap.set(s.username, user.id);
    }
  }

  const allBitUserIds = Array.from(insertedUserMap.values());
  console.log(`Active BIT Mesra user profiles ready: ${allBitUserIds.length}`);

  // 2. Seed Posts, Polls, Comments, Upvotes
  console.log(`Seeding ${BIT_POSTS.length} high-engagement BIT Mesra posts...`);
  for (let i = 0; i < BIT_POSTS.length; i++) {
    const p = BIT_POSTS[i];
    const authorId = insertedUserMap.get(p.authorUser) || allBitUserIds[0];
    const postId = `bit_post_${i + 1}`;
    const createdAt = new Date(Date.now() - (i * 3 + 1) * 3600 * 1000);

    const [post] = await db
      .insert(posts)
      .values({
        id: postId,
        authorId,
        institutionId: BIT_MESRA_ID,
        type: p.type,
        scope: p.scope,
        body: p.body,
        isAnonymous: Boolean("isAnonymous" in p && p.isAnonymous),
        pseudonym: "pseudonym" in p ? p.pseudonym : null,
        status: "PUBLISHED",
        createdAt,
      })
      .onConflictDoNothing()
      .returning();

    if (!post) continue;

    // Seed Poll Options & Votes
    if (p.type === "POLL" && "options" in p && Array.isArray(p.options)) {
      for (const optText of p.options) {
        const [opt] = await db
          .insert(pollOptions)
          .values({
            postId: post.id,
            text: optText,
          })
          .returning();

        if (opt) {
          // Add 3-8 random votes per option
          const voterCount = Math.floor(Math.random() * 6) + 3;
          for (let v = 0; v < Math.min(voterCount, allBitUserIds.length); v++) {
            const voterId = allBitUserIds[(v * 3 + i) % allBitUserIds.length];
            await db
              .insert(pollVotes)
              .values({
                postId: post.id,
                optionId: opt.id,
                userId: voterId,
              })
              .onConflictDoNothing();
          }
        }
      }
    }

    // Seed Comments
    const commentTexts = BIT_COMMENTS_MAP[i] || [];
    for (let c = 0; c < commentTexts.length; c++) {
      const commenterId = allBitUserIds[(c * 2 + i + 1) % allBitUserIds.length];
      await db
        .insert(comments)
        .values({
          postId: post.id,
          authorId: commenterId,
          body: commentTexts[c],
          isAnonymous: c === 0 && p.type === "CONFESSION",
          status: "PUBLISHED",
          createdAt: new Date(createdAt.getTime() + (c + 1) * 15 * 60 * 1000),
        })
        .onConflictDoNothing();
    }

    // Seed Upvotes
    const upvoteCount = p.upvotes || 15;
    for (let v = 0; v < Math.min(upvoteCount, allBitUserIds.length); v++) {
      const voterId = allBitUserIds[v % allBitUserIds.length];
      await db
        .insert(votes)
        .values({
          postId: post.id,
          userId: voterId,
          value: 1,
        })
        .onConflictDoNothing();
    }
  }

  // 3. Seed Dating Swipes for BIT Mesra
  console.log("Seeding BIT Mesra campus dating likes and matches...");
  const guys = BIT_STUDENTS.filter((s) => s.gender === "MALE").map((s) => insertedUserMap.get(s.username)!);
  const girls = BIT_STUDENTS.filter((s) => s.gender === "FEMALE").map((s) => insertedUserMap.get(s.username)!);

  for (const g of guys) {
    for (const f of girls) {
      if (Math.random() < 0.6) {
        await db
          .insert(swipes)
          .values({
            swiperId: g,
            targetId: f,
            direction: "LIKE",
          })
          .onConflictDoNothing();
      }
      if (Math.random() < 0.5) {
        await db
          .insert(swipes)
          .values({
            swiperId: f,
            targetId: g,
            direction: "LIKE",
          })
          .onConflictDoNothing();
      }
    }
  }

  console.log(`\n🎉 BIT Mesra Flagship Seeding Complete!`);
  console.log(`   Populated ${BIT_STUDENTS.length} students, ${BIT_POSTS.length} authentic campus posts, comments, poll votes, and dating matches.`);
  console.log(`   Visit http://localhost:3000/app?scope=CAMPUS to explore!`);

  await client.end();
}

main().catch((err) => {
  console.error("BIT Mesra seeding failed:", err);
  process.exit(1);
});
