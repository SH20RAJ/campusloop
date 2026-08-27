/**
 * Discover & Trends Deep Seeder
 * Populates high-engagement posts with authentic hashtags for BIT Mesra and Global Campuses.
 * Ensures that every trending hashtag on /app/discover has real, rich, interactive posts.
 *
 * Run: bun run scripts/seed-discover-trends.ts
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import { comments, institutions, pollOptions, posts, userProfiles, votes } from "../src/db/schema";
import { loadLocalEnv } from "../src/lib/load-env";
import { eq, ilike } from "drizzle-orm";


loadLocalEnv();

function requireDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.DB_URL;
  if (!databaseUrl) throw new Error("Missing DATABASE_URL.");
  return databaseUrl;
}

const BIT_MESRA_ID = "inst_35df75700bb23dd30311ef5f";

// ─── Authentic Posts with Targeted Hashtags ───
interface PostSeedData {
  type: "NORMAL" | "POLL" | "QUESTION" | "CONFESSION";
  body: string;
  isAnonymous?: boolean;
  pseudonym?: string;
  options?: string[];
  comments: string[];
  tags: string[];
  upvotesCount: number;
}

const BIT_POSTS_DATA: PostSeedData[] = [
  {
    type: "POLL",
    body: "The eternal BIT Mesra question: Where are you heading after 11 PM for emergency food during exam season? ☕🌙 #BITMesra #LateNightTea #HostelLife",
    options: ["Sharma Ji Tea Stall", "Inner Canteen (IC)", "C-Shop / SAR", "Hostel 11 Night Canteen"],
    comments: [
      "Sharma ji ginger tea in December with 2 aloo patties hits different.",
      "IC cold coffee + cheese maggi is unmatched honestly.",
      "Hostel 11 paneer roll deserves top spot!",
      "SAR with friends at 2 AM is peak college memory."
    ],
    tags: ["#BITMesra", "#LateNightTea", "#HostelLife"],
    upvotesCount: 58,
  },
  {
    type: "CONFESSION",
    body: "Confession: I haven't attended a single 8 AM lecture of Signals & Systems in the Main Building this semester. Relying purely on NPTEL and YouTube playlists to save my grade 💀 #BITMesra #EndsemSurvivors #CampusConfessions",
    isAnonymous: true,
    pseudonym: "Signals Survivor",
    comments: [
      "Bro you are not alone, whole class is on Gajendra Purohit videos 😭",
      "Prof announced surprise attendance test next Tuesday, watch out!",
      "8 AM in Ranchi winter is criminal anyway."
    ],
    tags: ["#BITMesra", "#EndsemSurvivors", "#CampusConfessions"],
    upvotesCount: 64,
  },
  {
    type: "NORMAL",
    body: "CAT Lab Day 1 shortlists are out for SDE roles! Massive congratulations to everyone who made it. For others, keep grinding LeetCode and System Design, the season is just starting! 🚀💼 #BITMesra #PlacementDiaries #CampusPlacements",
    comments: [
      "Big shoutout to T&P team this year, companies are hiring aggressively!",
      "Any tips for Microsoft round 2 interviews?",
      "DSA graphs and DP are being asked heavily this year."
    ],
    tags: ["#BITMesra", "#PlacementDiaries", "#CampusPlacements"],
    upvotesCount: 82,
  },
  {
    type: "NORMAL",
    body: "Bitotsav dates announced! Who all are ready for the battle of bands and EDM night at Gymkhana ground?! Auditions for Dhwani and Dance Club start this Thursday 🎸🔥 #BITMesra #Bitotsav #TechFest",
    comments: [
      "Best weekend of the year incoming! Can't wait.",
      "Dhwani auditions are going to be super competitive this time.",
      "Please tell me we are getting an international DJ on Day 3!"
    ],
    tags: ["#BITMesra", "#Bitotsav", "#TechFest"],
    upvotesCount: 95,
  },
  {
    type: "QUESTION",
    body: "Where is the best quiet spot with high-speed Wi-Fi to sit for 6+ hours of uninterrupted coding? Library 2nd floor vs Department labs? 💻 #BITMesra #LateNightTea #TechFest",
    comments: [
      "R&D Building 3rd floor is dead silent and AC is great.",
      "Central Library cubicles near the corner have the best eduroam signal.",
      "Hostel 10 study room late at night is elite if you have noise-cancelling headphones."
    ],
    tags: ["#BITMesra", "#LateNightTea", "#TechFest"],
    upvotesCount: 41,
  },
  {
    type: "CONFESSION",
    body: "Confession: I dropped my cycle chain near BIT Lake at 9 PM and two random seniors spent 20 minutes helping me fix it with their phone flashlights. This campus has the purest people ❤️ #BITMesra #CampusConfessions #HostelLife",
    isAnonymous: true,
    pseudonym: "Lake Rider",
    comments: [
      "Mesra senior-junior bonding is truly something special.",
      "Lake road after sunset with cool breeze is the best part of campus."
    ],
    tags: ["#BITMesra", "#CampusConfessions", "#HostelLife"],
    upvotesCount: 76,
  },
  {
    type: "POLL",
    body: "Day 3 of Endsems and syllabus coverage check: How much have you actually completed? 📚💀 #BITMesra #EndsemSurvivors",
    options: ["100% syllabus + PYQs done", "50% (unit 1 & 2 only)", "Just starting Module 1 tonight", "Bhagwan bharose 🙏"],
    comments: [
      "Bhagwan bharose squad assemble here 😭",
      "One night before exam is our official syllabus coverage time.",
      "Anyone have last 5 years solved papers for Discrete Maths?"
    ],
    tags: ["#BITMesra", "#EndsemSurvivors"],
    upvotesCount: 89,
  },
  {
    type: "NORMAL",
    body: "Pantheon 2026 Hackathon track registrations are officially live! 36-hour sprint with ₹2.5L prize pool. Looking for a frontend developer to join our AI/Web3 squad! DM me 🏆⚡ #BITMesra #Pantheon #Hackathon",
    comments: [
      "Sent you a DM, proficient with Next.js, Tailwind and WebSockets!",
      "Is the hackathon open for first-year batches as well?",
      "Yes! Separate category for freshers tracks."
    ],
    tags: ["#BITMesra", "#Pantheon", "#Hackathon"],
    upvotesCount: 52,
  },
  {
    type: "NORMAL",
    body: "Canteen debate: Why does Sharma Ji's tea taste 10x better during exam nights than regular college days? It's pure magic at this point ☕ #BITMesra #LateNightTea #CanteenDebate",
    comments: [
      "Because adrenaline + panic makes the sugar hit harder haha",
      "Pair it with his hot bread pakoda and life problems disappear."
    ],
    tags: ["#BITMesra", "#LateNightTea", "#CanteenDebate"],
    upvotesCount: 67,
  },
  {
    type: "CONFESSION",
    body: "To the girl in blue hoodie who smiled at me near IC during the rain yesterday: my friends haven't stopped teasing me since. Hope to bump into you again! 🌧️👀 #BITMesra #CampusConfessions #HostelLife",
    isAnonymous: true,
    pseudonym: "Rainy IC",
    comments: [
      "Shoot your shot via Secret Crush on CampusLoop bro!",
      "Rooting for you king haha"
    ],
    tags: ["#BITMesra", "#CampusConfessions", "#HostelLife"],
    upvotesCount: 71,
  },
  {
    type: "NORMAL",
    body: "Mock placement drive recap: 45 students cleared coding round round 1! Big thank you to IEEE & ACM seniors for conducting the technical mock interviews. Onward to mock HR rounds! 💼🎯 #BITMesra #PlacementDiaries #CampusPlacements",
    comments: [
      "The feedback on resume formatting was so insightful.",
      "Mock coding test platform was smooth. Let's crack actual Day 1!"
    ],
    tags: ["#BITMesra", "#PlacementDiaries", "#CampusPlacements"],
    upvotesCount: 63,
  },
  {
    type: "NORMAL",
    body: "Hostel 10 vs Hostel 11 football derby under floodlights tonight! Bring all the noise, kickoff at 8 PM at Upper Ground. Winner takes bragging rights for the entire semester ⚽🔥 #BITMesra #HostelLife",
    comments: [
      "Hostel 11 taking this comfortably!",
      "Defense is solid this year for H10, see you on the pitch!"
    ],
    tags: ["#BITMesra", "#HostelLife"],
    upvotesCount: 77,
  },
  {
    type: "QUESTION",
    body: "Can someone explain Dynamic Programming tree traversal intuitively before tomorrow's 10 AM lab exam? My brain is officially fried 😵‍💫 #BITMesra #EndsemSurvivors #TechFest",
    comments: [
      "Think of it as memoizing sub-tree values bottom-up starting from the leaf nodes.",
      "Watch Striver's Tree DP playlist, 20 minutes and you're golden.",
      "Come to room 312 Hostel 10, study group is doing problems right now."
    ],
    tags: ["#BITMesra", "#EndsemSurvivors", "#TechFest"],
    upvotesCount: 44,
  },
  {
    type: "CONFESSION",
    body: "Confession: I accidentally answered an entire 15-mark question in the wrong section booklet during midsems. Invigilator noticed and helped me fix it last minute. True lifesaver 🙏 #BITMesra #CampusConfessions",
    isAnonymous: true,
    pseudonym: "Panicking Sophomore",
    comments: [
      "That cold sweat panic is real haha",
      "Glad it got sorted in time!"
    ],
    tags: ["#BITMesra", "#CampusConfessions"],
    upvotesCount: 59,
  },
  {
    type: "NORMAL",
    body: "Robolution team testing autonomous rover prototypes near Mechanical Workshop! Great progress on obstacle avoidance and LiDAR sensors 🤖🚀 #BITMesra #TechFest #Hackathon",
    comments: [
      "Robolution BIT Mesra always flying the flag high!",
      "The chassis design looks super clean."
    ],
    tags: ["#BITMesra", "#TechFest", "#Hackathon"],
    upvotesCount: 88,
  }
];

const GLOBAL_POSTS_DATA: {
  collegePattern: string;
  posts: PostSeedData[];
}[] = [
  {
    collegePattern: "%Delhi%",
    posts: [
      {
        type: "NORMAL",
        body: "IIT Delhi campus mornings in autumn hit different. Strolling past Nalanda building with a warm chai before the 9 AM Data Structures lecture 🍂☕ #LateNightTea #HostelLife #TechFest",
        comments: ["Nalanda ground floor cafeteria chai is supreme.", "Wait till winter fog rolls in!"],
        tags: ["#LateNightTea", "#HostelLife", "#TechFest"],
        upvotesCount: 92,
      },
      {
        type: "POLL",
        body: "Placement crunch time across engineering campuses: What is your primary interview preparation priority right now? 💼🎯 #PlacementDiaries #CampusPlacements #TechFest",
        options: ["DSA LeetCode Hard problems", "System Design & LLD", "CS Core (OS/DBMS/CN)", "Aptitude & HR Mock Interviews"],
        comments: ["System design round is where most candidates get filtered.", "CS Core fundamentals are essential."],
        tags: ["#PlacementDiaries", "#CampusPlacements", "#TechFest"],
        upvotesCount: 110,
      },
      {
        type: "CONFESSION",
        body: "Confession: I spent 4 hours fixing a single semicolon bug in our Operating Systems kernel project yesterday only to realize I was editing the backup file. College is great 😭 #EndsemSurvivors #CampusConfessions",
        isAnonymous: true,
        pseudonym: "Linux Kernel Survivor",
        comments: ["Git diff would have saved your sanity haha", "Classic canonical CS moment."],
        tags: ["#EndsemSurvivors", "#CampusConfessions"],
        upvotesCount: 84,
      },
      {
        type: "NORMAL",
        body: "Inter-college Hackathon registrations are officially live! 48-hour buildathon with participants from across 50+ universities in India. Gear up your teams! 💻🔥 #Hackathon #TechFest #CampusPlacements",
        comments: ["Excited to represent our college team!", "Looking for a backend FastAPI/Go developer."],
        tags: ["#Hackathon", "#TechFest", "#CampusPlacements"],
        upvotesCount: 98,
      }
    ]
  },
  {
    collegePattern: "%University of Delhi%",
    posts: [
      {
        type: "NORMAL",
        body: "North Campus fest season vibes are unmatched! Hudson Lane cafes packed, street rehearsals in full swing, and winter breeze setting in 🎸✨ #LateNightTea #HostelLife #CanteenDebate",
        comments: ["Hudson Lane momos and iced tea after college is ritual.", "Best season in Delhi!"],
        tags: ["#LateNightTea", "#HostelLife", "#CanteenDebate"],
        upvotesCount: 79,
      },
      {
        type: "CONFESSION",
        body: "Confession: Skipping 8:30 AM tutorial to sit under the arts faculty trees with hot samosas is the best decision I make every week ☕ #CampusConfessions #HostelLife",
        isAnonymous: true,
        pseudonym: "North Campus Roamer",
        comments: ["The Arts Faculty lawn is therapeutic.", "Attendance shortage says hello though!"],
        tags: ["#CampusConfessions", "#HostelLife"],
        upvotesCount: 68,
      },
      {
        type: "POLL",
        body: "Exam season survival check: How many cups of coffee/tea are keeping you functional daily? ☕💀 #EndsemSurvivors #LateNightTea",
        options: ["1-2 cups (Normal human)", "3-4 cups (Engineering standard)", "5+ cups (Living on caffeine)", "Coffee is water at this point"],
        comments: ["Living on caffeine and sheer willpower.", "Canteen bhaiya knows my order by heart."],
        tags: ["#EndsemSurvivors", "#LateNightTea"],
        upvotesCount: 105,
      }
    ]
  }
];

async function seedDiscoverTrends() {
  const sqlClient = postgres(requireDatabaseUrl(), { max: 1 });
  const db = drizzle(sqlClient, { schema });


  console.log("🚀 Starting Discover & Trends database seeding...");

  // 1. Fetch BIT Mesra profiles
  const bitProfiles = await db.query.userProfiles.findMany({
    where: eq(userProfiles.institutionId, BIT_MESRA_ID),
  });

  if (bitProfiles.length === 0) {
    console.error("❌ No BIT Mesra profiles found in database. Please run seed-bitmesra.ts first.");
    await sqlClient.end();
    return;
  }

  console.log(`Found ${bitProfiles.length} BIT Mesra student profiles.`);

  // Seed BIT Mesra Posts
  let bitCount = 0;
  for (let i = 0; i < BIT_POSTS_DATA.length; i++) {
    const postData = BIT_POSTS_DATA[i];
    const author = bitProfiles[i % bitProfiles.length];

    // Create post
    const [insertedPost] = await db
      .insert(posts)
      .values({
        authorId: author.id,
        institutionId: BIT_MESRA_ID,
        type: postData.type,
        body: postData.body,
        isAnonymous: postData.isAnonymous ?? false,
        pseudonym: postData.pseudonym ?? null,
        status: "PUBLISHED",
        createdAt: new Date(Date.now() - (i * 3 + Math.floor(Math.random() * 5)) * 3600 * 1000), // Staggered over recent hours
      })
      .returning();

    // Poll options if poll
    if (postData.type === "POLL" && postData.options) {
      for (const optText of postData.options) {
        await db.insert(pollOptions).values({
          postId: insertedPost.id,
          text: optText,
        });
      }
    }

    // Comments
    for (let cIdx = 0; cIdx < postData.comments.length; cIdx++) {
      const commentAuthor = bitProfiles[(i + cIdx + 1) % bitProfiles.length];
      await db.insert(comments).values({
        postId: insertedPost.id,
        authorId: commentAuthor.id,
        body: postData.comments[cIdx],
        isAnonymous: false,
        createdAt: new Date(insertedPost.createdAt.getTime() + (cIdx + 1) * 600 * 1000),
      });
    }

    // Upvotes
    const upvoters = bitProfiles.slice(0, Math.min(postData.upvotesCount, bitProfiles.length));
    for (const v of upvoters) {
      try {
        await db.insert(votes).values({
          postId: insertedPost.id,
          userId: v.id,
          value: 1,
        });
      } catch {
        // Ignore duplicate votes
      }
    }

    bitCount++;
  }

  console.log(`✅ Seeded ${bitCount} high-engagement BIT Mesra posts with hashtags.`);

  // 2. Fetch other colleges for Global Posts
  for (const group of GLOBAL_POSTS_DATA) {
    const inst = await db.query.institutions.findFirst({
      where: ilike(institutions.name, group.collegePattern),
    });

    if (!inst) continue;

    const groupProfiles = await db.query.userProfiles.findMany({
      where: eq(userProfiles.institutionId, inst.id),
    });

    const fallbackAuthor = groupProfiles[0] || bitProfiles[0];

    for (let i = 0; i < group.posts.length; i++) {
      const postData = group.posts[i];
      const author = groupProfiles[i % (groupProfiles.length || 1)] || fallbackAuthor;

      const [insertedPost] = await db
        .insert(posts)
        .values({
          authorId: author.id,
          institutionId: inst.id,
          type: postData.type,
          body: postData.body,
          isAnonymous: postData.isAnonymous ?? false,
          pseudonym: postData.pseudonym ?? null,
          status: "PUBLISHED",
          createdAt: new Date(Date.now() - (i * 4 + 2) * 3600 * 1000),
        })
        .returning();

      if (postData.type === "POLL" && postData.options) {
        for (const optText of postData.options) {
          await db.insert(pollOptions).values({
            postId: insertedPost.id,
            text: optText,
          });
        }
      }

      for (let cIdx = 0; cIdx < postData.comments.length; cIdx++) {
        const commentAuthor = groupProfiles[(cIdx + 1) % (groupProfiles.length || 1)] || fallbackAuthor;
        await db.insert(comments).values({
          postId: insertedPost.id,
          authorId: commentAuthor.id,
          body: postData.comments[cIdx],
          isAnonymous: false,
          createdAt: new Date(insertedPost.createdAt.getTime() + (cIdx + 1) * 600 * 1000),
        });
      }

      const upvoters = bitProfiles.slice(0, Math.min(postData.upvotesCount, bitProfiles.length));
      for (const v of upvoters) {
        try {
          await db.insert(votes).values({
            postId: insertedPost.id,
            userId: v.id,
            value: 1,
          });
        } catch {
          // Ignore duplicates
        }
      }
    }

    console.log(`✅ Seeded ${group.posts.length} posts for ${inst.name}.`);
  }

  await sqlClient.end();
  console.log("🎉 Discover & Trends seeding completed successfully!");
}

seedDiscoverTrends().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
