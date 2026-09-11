/**
 * Seed Subreddit UserProfile Accounts & Associate Content
 * Run: bun run scripts/seed-subreddit-accounts.ts
 */
import { and, eq, ilike, inArray, isNull, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  comments,
  externalMedia,
  externalPosts,
  institutions,
  posts,
  userProfiles,
  votes,
} from "../src/db/schema";
import { loadLocalEnv } from "../src/lib/load-env";
import {
  KNOWN_SUBREDDIT_METAS,
  normalizeSubredditHandle,
} from "../src/lib/reddit/subreddit-accounts";

loadLocalEnv();

function requireDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.DB_URL;
  if (!databaseUrl) throw new Error("Missing DATABASE_URL.");
  return databaseUrl;
}

interface SubredditSeedContent {
  subredditHandle: string;
  title: string;
  body: string;
  type: "NORMAL" | "MEME" | "QUESTION";
  hoursAgo: number;
  score: number;
  videoUrl?: string;
  imageUrl?: string;
  comments: { text: string; hoursAgo: number }[];
}

const SUBREDDIT_SEED_POSTS: SubredditSeedContent[] = [
  // ─── r/Btechtards Content ───
  {
    subredditHandle: "btechtards",
    title: "The Ultimate 75% Attendance Copium Thread",
    body: `POV: You calculated your attendance at 2:00 AM before end-sems:\n\n• Classes attended: 36\n• Total classes: 51\n• Current Attendance: 70.58%\n\nIf you attend the next 9 classes back to back, you hit 75.00%. But tomorrow is a lab day, and your alarm is set for 11:30 AM...\n\nHow cooked are you on a scale of 1 to debarred from exam hall?\n\n![Attendance Struggle](/api/files/r2/videos/dhanbad_scientists.mp4)\n/api/files/r2/videos/dhanbad_scientists.mp4\n\n#Btechtards #AttendanceShortage #EngineeringLife #HostelHumor #ExamPanic`,
    type: "MEME",
    hoursAgo: 3,
    score: 1842,
    videoUrl: "/api/files/r2/videos/dhanbad_scientists.mp4",
    comments: [
      { text: "Medical certificate from local homeopathy clinic goes brrrr", hoursAgo: 2.5 },
      { text: "74.89% is the most painful number known to humanity fr", hoursAgo: 1.8 },
      { text: "Our HOD literally laughed at my genuine reason", hoursAgo: 0.8 },
    ],
  },
  {
    subredditHandle: "btechtards",
    title: "Placement PPT vs Actual Offer Letter Reality Check",
    body: `Recruiter in Auditorium PPT:\n"We foster horizontal corporate synergy, modern agile sprints, and offer hyper-growth stipend compensation!"\n\nActual Offer Letter:\n• 12-month bond with ₹2 lakh exit penalty\n• Working alternate Saturdays + Sunday on-call\n• Laptop provided: ThinkPad from 2014 with 4GB RAM\n\nNever celebrate until the bank notification pings.\n\n#Btechtards #PlacementSeason #TechJobs #CampusPlacements #EngineeringLife`,
    type: "NORMAL",
    hoursAgo: 7,
    score: 1451,
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&fit=crop",
    comments: [
      { text: "The 2014 ThinkPad detail is personal violence", hoursAgo: 5 },
      { text: "At least you got an offer bro market is brutal rn", hoursAgo: 3 },
    ],
  },
  {
    subredditHandle: "btechtards",
    title: "Destroyer of Employment (Placement Season Reality)",
    body: `When the recruiter opens the PPT slide and announces: 'Eligibility Criteria: 9.5 CGPA, 0 backlogs, and 5 years of React experience for a fresher role'\n\n![Destroyer of Employment](/api/files/r2/videos/destroyer_of_employment.mp4)\n/api/files/r2/videos/destroyer_of_employment.mp4\n\n#Btechtards #PlacementSeason #EngineeringVibes #CampusReels`,
    type: "MEME",
    hoursAgo: 10,
    score: 2190,
    videoUrl: "/api/files/r2/videos/destroyer_of_employment.mp4",
    comments: [
      { text: "HR: 'We offer competitive stipend (unpaid intern for 6 months)'", hoursAgo: 8 },
      { text: "Our TPO nodded along like it made complete sense", hoursAgo: 4 },
    ],
  },

  // ─── r/JEENEETards Content ───
  {
    subredditHandle: "jeeneetards",
    title: "Dropper Batch Late Night Physics Struggle",
    body: `Solving Irodov problem 1.23 at 3:15 AM while drinking cold Nescafe from a steel glass...\n\nYour parents think you're going to IIT Bombay CSE, but right now you can't even remember if friction opposes motion or the tendency of relative motion.\n\nOne-shot revision playlist on 2x speed is my only therapist.\n\n![Study Grind](/api/files/r2/videos/allen_khatarnak.mp4)\n/api/files/r2/videos/allen_khatarnak.mp4\n\n#JEENEETards #JEE2026 #DropperLife #PhysicsGrind #IITDreams`,
    type: "NORMAL",
    hoursAgo: 4,
    score: 2240,
    videoUrl: "/api/files/r2/videos/allen_khatarnak.mp4",
    comments: [
      { text: "Drop year character arc is humbling beyond belief", hoursAgo: 3 },
      { text: "Friction opposes relative motion, sleep now soldier", hoursAgo: 2 },
      { text: "May HC Verma bless our souls in the exam hall", hoursAgo: 1 },
    ],
  },
  {
    subredditHandle: "jeeneetards",
    title: "Mock Test Score Fluctuations are Giving Me Heart Attacks",
    body: `Test 1: 184/300 (Feeling like future AIR < 500, already searching hostel single room pictures)\nTest 2: 92/300 (Considering opening a tea stall outside Kota coaching institute)\n\nAnyone else experiencing wild ±80 marks swings every Sunday? How do you maintain sanity?\n\n#JEENEETards #TestSeries #AllenMocks #KotaChronicles #Aspirants`,
    type: "QUESTION",
    hoursAgo: 9,
    score: 1390,
    comments: [
      { text: "Analysis matters more than the score, check silly calculation mistakes!", hoursAgo: 7 },
      { text: "Negative marking is the silent killer, stop blind guessing", hoursAgo: 5 },
    ],
  },

  // ─── r/delhiuniversity Content ───
  {
    subredditHandle: "delhiuniversity",
    title: "North Campus vs South Campus Hostels at 1 AM",
    body: `Hudson Lane cafes closing down vs Patel Chest chai tapri opening up.\n\nThe eternal North Campus student routine: 8:45 AM attendance sprint to Vishwavidyalaya Metro, followed by 3 hours of sitting in Patel Chest debating political economy over bun maska.\n\nAttendance shortage notices on college notice board hitting like a truck this semester.\n\n#DelhiUniversity #NorthCampus #DUFests #KamlaNagar #CampusVibes`,
    type: "NORMAL",
    hoursAgo: 6,
    score: 1580,
    imageUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&fit=crop",
    comments: [
      { text: "Tom Uncle Maggi Point was packed even in the rain today", hoursAgo: 5 },
      { text: "South Campus metro connectivity is the real final boss", hoursAgo: 3.5 },
    ],
  },
  {
    subredditHandle: "delhiuniversity",
    title: "Annual College Fest Season Budget Drama",
    body: `Every college union announcing 'Star Performer announcement tomorrow' for 3 weeks straight...\n\nThen the fest day arrives and the budget gets cut, so we get a local DJ playing 2016 EDM remixes on blown-out speakers.\n\nStill going because North Campus passes are liquid gold.\n\n#DelhiUniversity #Crossroads #MeccaFest #CampusLife #DUFests`,
    type: "MEME",
    hoursAgo: 14,
    score: 1120,
    comments: [
      { text: "Security checking bags for water bottles like it's airport customs", hoursAgo: 11 },
      { text: "Nothing beats the vibe when the whole ground jumps together though", hoursAgo: 6 },
    ],
  },

  // ─── r/ProgrammerHumor Content ───
  {
    subredditHandle: "programmerhumor",
    title: "Git Push to Production on a Friday Afternoon",
    body: `Senior Dev: "Don't push anything to master on Friday after 4 PM."\n\nIntern me with 5 minutes left on my shift: "git commit -m 'quick fix typo in auth' && git push origin main --force"\n\n10 minutes later: AWS PagerDuty alerts firing, Slack channel on fire, and the payment gateway returning 502 Bad Gateway.\n\n![Git Moments](/api/files/r2/videos/face_expression.mp4)\n/api/files/r2/videos/face_expression.mp4\n\n#ProgrammerHumor #GitPush #DevLife #ProductionCrash #CSStudents`,
    type: "MEME",
    hoursAgo: 5,
    score: 1920,
    videoUrl: "/api/files/r2/videos/face_expression.mp4",
    comments: [
      { text: "Force push on main is a declaration of corporate terrorism", hoursAgo: 4 },
      { text: "The face expression when you see the 502 Bad Gateway alert", hoursAgo: 2 },
    ],
  },
  {
    subredditHandle: "programmerhumor",
    title: "When the CSS finally centers the div but breaks the navbar",
    body: `margin: 0 auto;\ndisplay: flex;\njustify-content: center;\nalign-items: center;\n\nResult: The card is centered, but the footer is now floating in the middle of the screen and z-index 99999 has taken over the browser window.\n\nWeb development is my passion.\n\n#ProgrammerHumor #CSSBugs #WebDev #FrontendPain #CodingMemes`,
    type: "MEME",
    hoursAgo: 12,
    score: 1650,
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&fit=crop",
    comments: [
      { text: "!important on every line until it stops moving", hoursAgo: 9 },
      { text: "Flexbox killed float, but grid is watching from the shadows", hoursAgo: 4 },
    ],
  },

  // ─── r/IndianTeenagers Content ───
  {
    subredditHandle: "indianteenagers",
    title: "Moving Away for College: The First Month Hostel Nostalgia",
    body: `Nobody prepares you for the first quiet evening in the hostel room after your parents leave.\n\nYou're staring at the peeling ceiling fan, eating lukewarm mess paneer that tastes like rubber, and missing your mom asking if you ate lunch.\n\nIt gets easier after month 2, but those first few weeks test you in ways exams never could.\n\n#IndianTeenagers #HostelLife #CollegeTransition #Nostalgia #GrowingUp`,
    type: "NORMAL",
    hoursAgo: 8,
    score: 2450,
    imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&fit=crop",
    comments: [
      { text: "Call your parents every Sunday, it keeps you grounded", hoursAgo: 6 },
      { text: "First hostel mess meal had me almost tearing up in the dining hall", hoursAgo: 4 },
      { text: "Make good friends on your floor, they become your family", hoursAgo: 2 },
    ],
  },

  // ─── r/IndianAcademia Content ───
  {
    subredditHandle: "indianacademia",
    title: "GATE vs CAT vs Off-Campus Placements: What Should 3rd Years Prioritize?",
    body: `Comprehensive breakdown for pre-final year students caught at the 6th semester crossroads:\n\n1. Off-Campus Placements: Heavy DSA (350+ LeetCode) + 2 high-leverage production projects + System Design basics.\n2. GATE CSE / DA: Core theory (OS, DBMS, CN, Algorithms) with 10-year PYQ mastery. PSU cutoff vs Top IIT M.Tech threshold.\n3. CAT / MBA: Profile building, sectional mocks, QA speed drills.\n\nChoose ONE primary path and execute with consistency.\n\n#IndianAcademia #CareerRoadmap #GATE2027 #CATPrep #EngineeringCareer`,
    type: "NORMAL",
    hoursAgo: 16,
    score: 1780,
    imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&fit=crop",
    comments: [
      { text: "Bookmarking this for semester break planning", hoursAgo: 12 },
      { text: "Don't ride two boats at once, picked GATE and stuck with it", hoursAgo: 8 },
    ],
  },

  // ─── r/college Content ───
  {
    subredditHandle: "college",
    title: "Surviving an 8:00 AM Lecture with a Professor with Zero Energy",
    body: `The lecture room is at 18 degrees Celsius. The professor speaks in a monotone whisper directly into the blackboard.\n\nYou drank two espressos, but by 8:23 AM your eyelids feel like 50kg dumbbells.\n\nWhat is your secret weapon to stay awake during early morning lectures?\n\n#College #LectureSurvival #CampusLife #SleepDeprived #StudentRoutine`,
    type: "QUESTION",
    hoursAgo: 18,
    score: 1340,
    comments: [
      { text: "Sit in the very first row so you are forced by shame to stay awake", hoursAgo: 15 },
      { text: "Chewing mint gum actually works wonders", hoursAgo: 10 },
    ],
  },
  {
    subredditHandle: "college",
    title: "The Quad Lawn at Sunset Hits Different During Midterms",
    body: `Golden hour sitting on the central lawn with a iced coffee after surviving 3 consecutive problem sets.\n\nFor 30 minutes nobody is discussing internships, GPA cutoffs, or deadlines. Just pure campus peacefulness before the library grind restarts at 8 PM.\n\nCherish these small moments, they define college.\n\n#College #CampusVibes #QuadLife #StudentMoments #GoldenHour`,
    type: "NORMAL",
    hoursAgo: 22,
    score: 1980,
    imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&fit=crop",
    comments: [
      { text: "Campus sunsets are the only therapy keeping me sane", hoursAgo: 19 },
      { text: "Best spot on campus without question", hoursAgo: 16 },
    ],
  },

  // ─── r/IndianTeenagers Content ───
  {
    subredditHandle: "indianteenagers",
    title: "Anyone Else Feel Like College Orientation was an Extrovert Olympics?",
    body: `Day 1 of college orientation:\n\nExtroverts: Already formed a 25-person WhatsApp group, planned a weekend road trip, and know the names of everyone in hostel block B.\n\nMe: Stood by the water cooler pretending to read a notice about library hours for 40 minutes straight.\n\nIntrovert survival guide needed urgently.\n\n#IndianTeenagers #FreshersWeek #IntrovertStruggles #CollegeOrientation #CampusLife`,
    type: "QUESTION",
    hoursAgo: 15,
    score: 2120,
    comments: [
      { text: "You only need 2-3 genuine friends, orientation hype dies in a week", hoursAgo: 12 },
      { text: "The fake phone scrolling by the water cooler is universal canon", hoursAgo: 8 },
    ],
  },

  // ─── r/IndianAcademia Content ───
  {
    subredditHandle: "indianacademia",
    title: "How to Cold Email Professors for Research Internships (Template That Works)",
    body: `Stop sending generic copy-pasted 'Respected Sir, I am passionate student' emails that land in spam within 3 seconds.\n\nProven 4-sentence framework:\n1. Hook: Mention a specific paper of theirs you read and 1 insight you found compelling.\n2. Leverage: What exact skill you have that can save their PhD scholar time (Python, PyTorch, lab instrumentation).\n3. Proposal: 1 concrete question or extension you would like to explore under their guidance.\n4. Call to Action: Request a 10-minute Zoom chat with your 1-page CV attached.\n\nKeep it under 150 words.\n\n#IndianAcademia #ResearchInternship #ProfessorEmails #IITResearch #CareerGuide`,
    type: "NORMAL",
    hoursAgo: 20,
    score: 2890,
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&fit=crop",
    comments: [
      { text: "Used this format and got an interview from IISc within 48 hours!", hoursAgo: 16 },
      { text: "Highlighting a specific paper is 100% the cheat code", hoursAgo: 11 },
    ],
  },

  // ─── r/IndiaMeme Content ───
  {
    subredditHandle: "indiameme",
    title: "Viva External Examiner Looking Through My Blank Project Report",
    body: `POV: External examiner slowly flips to page 43 of your Major Project report, points to an equation copied directly from Wikipedia, and asks:\n\n"Beta, explain line 3 derivation without looking at the screen."\n\nMe:\n"Sir actually my partner implemented that module..."\nPartner: Already standing outside the door pretending to make an urgent phone call.\n\n#IndiaMeme #VivaTrauma #EngineeringExam #HostelHumor #DesiCollege`,
    type: "MEME",
    hoursAgo: 11,
    score: 2650,
    comments: [
      { text: "Throwing the project partner under the bus is campus law", hoursAgo: 9 },
      { text: "The fake nodding while the external speaks is an art form", hoursAgo: 6 },
    ],
  },
  {
    subredditHandle: "indiameme",
    title: "Hostel Night Canteen Samosa Inflation Drama",
    body: `When the night canteen uncle raises samosa price from ₹10 to ₹15 without prior senate approval...\n\nHostel emergency floor meeting called at 1:30 AM to discuss diplomatic sanctions against the canteen counter.\n\n![Hostel Chronicles](/api/files/r2/videos/allen_kalesh.mp4)\n/api/files/r2/videos/allen_kalesh.mp4\n\n#IndiaMeme #CanteenDrama #HostelLore #SamosaInflation #StudentProtest`,
    type: "MEME",
    hoursAgo: 17,
    score: 3120,
    videoUrl: "/api/files/r2/videos/allen_kalesh.mp4",
    comments: [
      { text: "Hostel senate takes samosa pricing more seriously than the national budget", hoursAgo: 14 },
      { text: "Chai price increased to ₹12 is where we draw the line", hoursAgo: 9 },
    ],
  },

  // ─── r/EngineeringMemes Content ───
  {
    subredditHandle: "engineeringmemes",
    title: "Engineering Mechanics FBD Problem vs Reality",
    body: `Problem: "Assume a spherical cow of uniform density rolling on a frictionless inclined plane in a vacuum with g = 9.81 m/s²."\n\nReality on Job Site:\n"The contractor used 10mm rebar instead of 16mm because it was on sale, and it's raining concrete."\n\nTheory meets practice.\n\n#EngineeringMemes #CivilEngineering #MechanicalEngineering #ExamMemes #STEMHumor`,
    type: "MEME",
    hoursAgo: 13,
    score: 1890,
    comments: [
      { text: "Air resistance is neglected, safety factor of 5 applied", hoursAgo: 10 },
      { text: "The spherical cow will forever haunt physics students", hoursAgo: 7 },
    ],
  },
  {
    subredditHandle: "engineeringmemes",
    title: "When the Unit Test Passes on Localhost but Fails on CI Pipeline",
    body: `Local machine: All 48 tests passing (green checkmarks, warm feeling of accomplishment).\n\nGitHub Actions CI runner at 4:30 AM:\n[FATAL] Segmentation fault (core dumped)\n[ERROR] Process completed with exit code 139.\n\nIt works on my machine is not an acceptable pull request comment unfortunately.\n\n#EngineeringMemes #UnitTests #DevOps #CICD #SoftwareEngineering`,
    type: "MEME",
    hoursAgo: 19,
    score: 2450,
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&fit=crop",
    comments: [
      { text: "Ship your laptop to the customer then bro", hoursAgo: 15 },
      { text: "Timezone difference in test dates is the culprit 90% of the time", hoursAgo: 8 },
    ],
  },
];

async function main() {
  const databaseUrl = requireDatabaseUrl();
  const client = postgres(databaseUrl);
  const db = drizzle(client);

  console.log("🚀 Initializing Subreddit Accounts & Content Pipeline...");

  // 1. Fetch default institution
  const allInstitutions = await db.select().from(institutions).limit(5);
  if (allInstitutions.length === 0) {
    console.error("❌ No institutions found. Run institutions seed first.");
    await client.end();
    return;
  }
  const defaultInst = allInstitutions[0];

  // 2. Create or verify all known Subreddit UserProfiles
  const accountMap = new Map<string, typeof userProfiles.$inferSelect>();

  for (const [key, meta] of Object.entries(KNOWN_SUBREDDIT_METAS)) {
    const cleanHandle = normalizeSubredditHandle(meta.username);

    const [existing] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.username, cleanHandle))
      .limit(1);

    if (existing) {
      accountMap.set(cleanHandle, existing);
      console.log(`✓ Verified subreddit account: @${cleanHandle} (${meta.displayName})`);
    } else {
      const [newProfile] = await db
        .insert(userProfiles)
        .values({
          id: crypto.randomUUID(),
          userId: `reddit_${cleanHandle}`,
          username: cleanHandle,
          displayName: meta.displayName,
          officialName: meta.officialName,
          headline: meta.headline,
          bio: meta.bio,
          avatarUrl: meta.avatarUrl,
          bannerUrl: meta.bannerUrl || null,
          institutionId: defaultInst.id,
          role: "STUDENT",
          status: "ACTIVE",
          isSeeded: true,
          points: meta.points,
          lastSeenAt: new Date(),
          socialLinks: {
            platforms: {
              reddit: `https://reddit.com/r/${meta.subreddit}`,
            },
          },
        })
        .returning();

      accountMap.set(cleanHandle, newProfile);
      console.log(`✨ Created new subreddit account: @${cleanHandle} (${meta.displayName})`);
    }
  }

  // 3. Backfill any existing posts with subreddit hashtags/names
  console.log("🔄 Checking and backfilling existing posts with subreddit authors...");
  const btechAccount = accountMap.get("btechtards");
  const jeeAccount = accountMap.get("jeeneetards");
  const progAccount = accountMap.get("programmerhumor");
  const duAccount = accountMap.get("delhiuniversity");
  const teenAccount = accountMap.get("indianteenagers");

  let backfilledPosts = 0;

  if (btechAccount) {
    const updated = await db
      .update(posts)
      .set({ authorId: btechAccount.id, isAnonymous: false, pseudonym: null })
      .where(
        and(
          or(
            ilike(posts.title, "%btechtards%"),
            ilike(posts.body, "%#btechtards%"),
            ilike(posts.body, "%btechtards on their way%")
          ),
          or(isNull(posts.authorId), eq(posts.isAnonymous, true))
        )
      );
    backfilledPosts += updated.count ?? 0;
  }

  if (jeeAccount) {
    const updated = await db
      .update(posts)
      .set({ authorId: jeeAccount.id, isAnonymous: false, pseudonym: null })
      .where(
        and(
          or(
            ilike(posts.title, "%jeeneetards%"),
            ilike(posts.body, "%#jeeneetards%"),
            ilike(posts.title, "%ra sir%"),
            ilike(posts.title, "%alakh sir%")
          ),
          or(isNull(posts.authorId), eq(posts.isAnonymous, true))
        )
      );
    backfilledPosts += updated.count ?? 0;
  }

  if (progAccount) {
    const updated = await db
      .update(posts)
      .set({ authorId: progAccount.id, isAnonymous: false, pseudonym: null })
      .where(
        and(
          or(
            ilike(posts.title, "%programmerhumor%"),
            ilike(posts.body, "%#programmerhumor%")
          ),
          or(isNull(posts.authorId), eq(posts.isAnonymous, true))
        )
      );
    backfilledPosts += updated.count ?? 0;
  }

  if (duAccount) {
    const updated = await db
      .update(posts)
      .set({ authorId: duAccount.id, isAnonymous: false, pseudonym: null })
      .where(
        and(
          or(
            ilike(posts.title, "%delhiuniversity%"),
            ilike(posts.body, "%#delhiuniversity%")
          ),
          or(isNull(posts.authorId), eq(posts.isAnonymous, true))
        )
      );
    backfilledPosts += updated.count ?? 0;
  }

  console.log(`✓ Backfilled ${backfilledPosts} existing posts with subreddit attribution!`);

  // 4. Seed high-engagement subreddit posts, external_posts, media, comments, and votes
  let seededCount = 0;
  const verifiedUsers = await db.select().from(userProfiles).limit(30);

  for (const item of SUBREDDIT_SEED_POSTS) {
    const authorProfile = accountMap.get(item.subredditHandle);
    if (!authorProfile) continue;

    // Deduplicate by title to avoid re-seeding same post
    const [existingPost] = await db
      .select({ id: posts.id })
      .from(posts)
      .where(and(eq(posts.authorId, authorProfile.id), eq(posts.title, item.title)))
      .limit(1);

    if (existingPost) {
      console.log(`⏩ Skipping already seeded post: "${item.title}"`);
      continue;
    }

    const postCreatedAt = new Date(Date.now() - item.hoursAgo * 60 * 60 * 1000);
    const postId = crypto.randomUUID();
    const externalPostId = crypto.randomUUID();
    const subredditMeta = KNOWN_SUBREDDIT_METAS[item.subredditHandle];
    const subredditName = subredditMeta?.subreddit || item.subredditHandle;

    // 4a. Insert post
    await db.insert(posts).values({
      id: postId,
      authorId: authorProfile.id,
      institutionId: defaultInst.id,
      type: item.type,
      scope: "GLOBAL",
      title: item.title,
      body: item.body,
      isAnonymous: false,
      status: "PUBLISHED",
      isSeeded: true,
      createdAt: postCreatedAt,
      updatedAt: postCreatedAt,
    });

    // 4b. Insert external_posts record
    const extSlug = item.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .slice(0, 30);
    const redditPermalink = `/r/${subredditName}/comments/${extSlug}/`;
    const redditCanonical = `https://www.reddit.com${redditPermalink}`;

    await db.insert(externalPosts).values({
      id: externalPostId,
      postId,
      source: "reddit",
      externalId: `t3_${postId.slice(0, 8)}`,
      externalFullname: `t3_${postId.slice(0, 8)}`,
      subreddit: subredditName,
      externalAuthor: authorProfile.displayName,
      permalink: redditPermalink,
      canonicalUrl: redditCanonical,
      score: item.score,
      commentCount: item.comments.length,
      externalCreatedAt: postCreatedAt.toISOString(),
      relevanceScore: 90,
      contentType: item.videoUrl ? "VIDEO" : item.imageUrl ? "IMAGE" : "TEXT",
      mediaStatus: "ACTIVE",
      createdAt: postCreatedAt,
      updatedAt: postCreatedAt,
    });

    // 4c. Insert external_media record if applicable
    if (item.videoUrl) {
      await db.insert(externalMedia).values({
        id: crypto.randomUUID(),
        externalPostId,
        mediaType: "VIDEO",
        mediaUrl: item.videoUrl,
        previewUrl: authorProfile.avatarUrl,
        thumbnailUrl: authorProfile.avatarUrl,
        position: 0,
        createdAt: postCreatedAt,
      });
    } else if (item.imageUrl) {
      await db.insert(externalMedia).values({
        id: crypto.randomUUID(),
        externalPostId,
        mediaType: "IMAGE",
        mediaUrl: item.imageUrl,
        previewUrl: item.imageUrl,
        position: 0,
        createdAt: postCreatedAt,
      });
    }

    // 4d. Seed upvotes
    const upvoters = verifiedUsers.filter((u) => u.id !== authorProfile.id).slice(0, 15);
    for (const voter of upvoters) {
      await db
        .insert(votes)
        .values({
          id: crypto.randomUUID(),
          postId,
          userId: voter.id,
          value: 1,
          createdAt: new Date(postCreatedAt.getTime() + (Math.random() * 20 + 5) * 60 * 1000),
        })
        .onConflictDoNothing();
    }

    // 4e. Seed authentic comments
    for (const c of item.comments) {
      const commenter = verifiedUsers[Math.floor(Math.random() * verifiedUsers.length)];
      const commentTime = new Date(Date.now() - c.hoursAgo * 60 * 60 * 1000);

      await db.insert(comments).values({
        id: crypto.randomUUID(),
        postId,
        authorId: commenter?.id || null,
        body: c.text,
        isAnonymous: false,
        status: "PUBLISHED",
        createdAt: commentTime,
        updatedAt: commentTime,
      });
    }

    seededCount++;
    console.log(`  ✓ Seeded [${item.type}] "${item.title}" under @${authorProfile.username}`);
  }

  console.log(`\n🎉 Successfully finished!`);
  console.log(`- Seeded ${seededCount} curated posts with Reddit syndication and media`);
  console.log(`- All 9 official subreddit accounts are fully active on CampusLoop!`);

  await client.end();
}

main().catch((err) => {
  console.error("❌ Error in seed-subreddit-accounts script:", err);
  process.exit(1);
});
