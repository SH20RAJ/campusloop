/**
 * Seed CampusLoop with authentic Video Reels, Viral Reddit-style Memes & Student Discussions
 * Run: bun run scripts/seed-reels-and-reddit-memes.ts
 */
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

interface SeedItem {
  title?: string;
  body: string;
  type: "NORMAL" | "MEME" | "CONFESSION" | "QUESTION";
  isAnonymous: boolean;
  pseudonym?: string;
  scope: "CAMPUS" | "GLOBAL";
  hoursAgo: number;
  upvotesCount: number;
  comments: { text: string; hoursAgo: number; isAnon?: boolean }[];
}

const SEED_ITEMS: SeedItem[] = [
  // ─── 1. VIDEO REELS (Auto-detected as 9:16 interactive Reels in PostReelCard & Feed) ───
  {
    title: "IIT Dhanbad Rocket Scientists 🚀",
    body: `IIT Dhanbad ke rocket scientists at 2 AM in the hostel quad... When mechanical engineering students decide to test homemade aerodynamics before end-sems 💀🔥\n\n![IIT Dhanbad Rocket Scientists](/api/files/r2/videos/dhanbad_scientists.mp4)\n/api/files/r2/videos/dhanbad_scientists.mp4\n\n#CampusReel #HostelLore #IITDhanbad #EngineeringLife #CampusVibes`,
    type: "NORMAL",
    isAnonymous: false,
    scope: "GLOBAL",
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
    body: `POV: You walk into the college common room during placement season and this is the general state of existence... 💀\n\n![College Moments](/api/files/r2/videos/this_is_so_my_clg.mp4)\n/api/files/r2/videos/this_is_so_my_clg.mp4\n\n#CampusReel #CollegeLife #BTechtards #CampusHumor #HostelChronicles`,
    type: "MEME",
    isAnonymous: false,
    scope: "CAMPUS",
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
    body: `When the recruiter opens the PPT slide and announces: 'Eligibility Criteria: 9.5 CGPA, 0 backlogs, and 5 years of React experience for a fresher role' 💀\n\n![Destroyer of Employment](/api/files/r2/videos/destroyer_of_employment.mp4)\n/api/files/r2/videos/destroyer_of_employment.mp4\n\n#PlacementSeason #BTechtards #CollegeHumor #EngineeringVibes #CampusReels`,
    type: "NORMAL",
    isAnonymous: false,
    scope: "GLOBAL",
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
    body: `When the professor gives a 2-hour lecture on something that won't be on the exam, but doesn't tell you until the last 5 minutes 💀😭\n\n![Campus Life](/api/files/r2/videos/face_expression.mp4)\n/api/files/r2/videos/face_expression.mp4\n\n#CollegeMemes #BTechLife #CampusHumor #HostelLore #Relatable`,
    type: "MEME",
    isAnonymous: true,
    pseudonym: "Backbencher Philosopher",
    scope: "CAMPUS",
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
    body: `The absolute chaos of hostel life right before Semester exams kick in 💀\n\n4 people studying 4 different subjects from the same one-shot playlist.\n\n![Hostel Moments](/api/files/r2/videos/allen_khatarnak.mp4)\n/api/files/r2/videos/allen_khatarnak.mp4\n\n#CampusVibes #HostelLife #JEENEETards #StudentMemes #CampusReels`,
    type: "NORMAL",
    isAnonymous: false,
    scope: "GLOBAL",
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
    body: `When tech companies talk about 'flexible work culture' during pre-placement talks vs when you actually join the team on Monday morning 💀⚡️\n\n![Campus Tech Talks](/api/files/r2/videos/indian_ceos.mp4)\n/api/files/r2/videos/indian_ceos.mp4\n\n#BTechtards #Placements #TechHumor #DeveloperVibes #CampusLoop`,
    type: "NORMAL",
    isAnonymous: false,
    scope: "GLOBAL",
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
    body: `Unfiltered student hostel moments when someone steals the last packet of Maggi from the floor pantry at 3 AM 🏃‍♂️💨\n\n![Hostel Moments](/api/files/r2/videos/allen_kalesh.mp4)\n/api/files/r2/videos/allen_kalesh.mp4\n\n#HostelLore #MaggiWars #CollegeChronicles #CampusReels`,
    type: "NORMAL",
    isAnonymous: true,
    pseudonym: "Maggi Guardian",
    scope: "CAMPUS",
    hoursAgo: 18,
    upvotesCount: 9549,
    comments: [
      { text: "Stealing Maggi in hostel is an act of war, no negotiation", hoursAgo: 16 },
      { text: "Pantry drama at 3 AM hits harder than Netflix thriller", hoursAgo: 12 },
      { text: "Always hide your Maggi under the mattress bro, rookie mistake", hoursAgo: 5 },
    ],
  },

  // ─── 2. VIRAL REDDIT-STYLE MEMES & CAMPUS DISCUSSIONS (r/Btechtards, r/JEENEETards) ───
  {
    body: `The 75% Attendance Equation:\n\nIf I attend the next 17 classes straight, do not catch a fever, arrive before the biometric siren blares at 8:00 AM, and bribe the CR with canteen samosas, my attendance will rise from 64.2% to exactly 74.89%.\n\nThen the Dean rounds down to 74% and sends a debar notice anyway 📉💀\n\n![Attendance Math](https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&fit=crop)\n\n#Btechtards #AttendanceDebar #75PercentRule #CampusLore`,
    type: "MEME",
    isAnonymous: false,
    scope: "GLOBAL",
    hoursAgo: 6,
    upvotesCount: 890,
    comments: [
      { text: "Engineering students doing multi-variable calculus just to calculate how many classes they can bunk 😂", hoursAgo: 5 },
      { text: "Medical certificate from uncle who is a homeopathic doctor incoming", hoursAgo: 4 },
      { text: "74.89% is the most painful number known to humanity fr", hoursAgo: 2 },
    ],
  },
  {
    body: `Senior at the campus tapri giving life advice at 11:30 PM:\n\n"Chill out bro, CGPA is just a number. Focus on skills, build projects, attend hackathons, nobody in the industry looks at marks."\n\nFact-checked senior's LinkedIn: 9.84 CGPA, Department Gold Medalist, Intern at Microsoft, and currently holding a 45 LPA PPO 💀💀\n\nNever trust a 9-pointer who tells you CGPA doesn't matter.\n\n![Senior Advice](https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&fit=crop)\n\n#SeniorLore #TapriTalks #Btechtards #CGPAProblems #CampusReality`,
    type: "MEME",
    isAnonymous: false,
    scope: "CAMPUS",
    hoursAgo: 10,
    upvotesCount: 1120,
    comments: [
      { text: "ALWAYS THE 9.8 POINTERS SAYING THIS LMAOOO 😭😭😭", hoursAgo: 9 },
      { text: "They want less competition in the placement cutoff rounds 4D chess move", hoursAgo: 7 },
      { text: "Meanwhile me with a 6.9 trying to convince myself I'm Steve Jobs", hoursAgo: 4 },
    ],
  },
  {
    body: `The 4 Horsemen of Passing End-Sem Exams without Attending Lectures:\n\n1. Nescafe Classic Cold Coffee (triple shot)\n2. That 1 topper girl's scanned CamScanner notes forwarded on WhatsApp at 2:00 AM\n3. An Indian YouTube bhaiya who explains 4 months of Discrete Mathematics in a 42-minute video\n4. Pure, unadulterated divine prayer 🙏\n\n![End Sem Survival Pack](https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&fit=crop)\n\nGod bless YouTube educators holding the entire Indian higher education system on their backs.\n\n#JEENEETards #Btechtards #EndSemSpeedrun #EngineeringLife`,
    type: "MEME",
    isAnonymous: false,
    scope: "GLOBAL",
    hoursAgo: 14,
    upvotesCount: 940,
    comments: [
      { text: "Genuinely that YouTube bhaiya deserves a Padma Shri award", hoursAgo: 12 },
      { text: "CamScanner watermark on every page is a mark of supreme scholarship", hoursAgo: 9 },
      { text: "Currently watching Unit 4 at 2.25x speed while reading this comment section", hoursAgo: 3 },
    ],
  },
  {
    body: `Placement Season Resume Reality Check:\n\nResume Claims:\n• "Deep expertise in Distributed Systems, Microservices, and Cloud Native Kubernetes Orchestration"\n\nReality:\n• Followed a 12-minute freeCodeCamp video on YouTube where I ran 'docker run hello-world' and pasted the code from GitHub Copilot 🚀\n\nInterview question: "Can you explain Raft consensus algorithm?"\nMe: "Sir, I believe in team consensus and positive workplace synergy."\n\n#PlacementSaga #TechResume #ProgrammerHumor #CampusPlacement #BTechLife`,
    type: "MEME",
    isAnonymous: false,
    scope: "GLOBAL",
    hoursAgo: 18,
    upvotesCount: 820,
    comments: [
      { text: "Positive workplace synergy 💀💀 bro deflecting like prime Neo in The Matrix", hoursAgo: 16 },
      { text: "Adding 'Prompt Engineering' to my resume as we speak", hoursAgo: 13 },
      { text: "Interviewer was probably doing the same thing in his college days honestly", hoursAgo: 8 },
    ],
  },
  {
    body: `Boys Hostel Night Life vs Girls Hostel Night Life:\n\nGirls Hostel at 9:01 PM:\n• Gate locked with 3 padlocks\n• Biometric scanner beeping\n• Guard checking roll numbers with a torchlight\n• Automated SMS sent to parents\n\nBoys Hostel at 2:45 AM:\n• Main gate wide open swinging in the wind\n• Security guard fast asleep on a folding chair\n• 4 guys riding a single Honda Activa inside the corridor delivering Maggi\n• Stray golden retriever attending wing meeting\n\n#HostelChronicles #CampusInsideJokes #HostelLore #IndianColleges`,
    type: "CONFESSION",
    isAnonymous: true,
    pseudonym: "Hostel Night Owl",
    scope: "CAMPUS",
    hoursAgo: 24,
    upvotesCount: 1340,
    comments: [
      { text: "The stray dog is literally the acting warden at this point he knows all of us", hoursAgo: 22 },
      { text: "The Activa in the corridor is TOO ACCURATE I can hear the exhaust echo right now 😂", hoursAgo: 20 },
      { text: "Injustice with girls hostel timing is real though, protest needed", hoursAgo: 15 },
    ],
  },
  {
    body: `When the professor opens YouTube on the classroom smart projector and the search bar autofills:\n\n"How to make mid-sem paper so hard that not even toppers score above 15/50"\n\nEntire class looked at each other in collective spiritual defeat 💀\n\nStart studying Unit 3 right now guys. It's so over.\n\n#ProfLore #ExamPanic #ClassroomMoments #Btechtards`,
    type: "MEME",
    isAnonymous: false,
    scope: "CAMPUS",
    hoursAgo: 28,
    upvotesCount: 670,
    comments: [
      { text: "Sir was smiling during today's attendance call. Now I know why.", hoursAgo: 26 },
      { text: "Curving the grade down to ground level fr", hoursAgo: 21 },
    ],
  },
  {
    body: `Group Project Dilemma:\n\nThere are always 4 people in an engineering group project:\n\n1. The Overworked One: Writes 100% of the code, creates the 45-slide PPT, and sets up AWS credentials.\n2. The Emotional Support One: Buys samosas and chai for person #1.\n3. The Phantom: Attended 1 meeting in January, never seen again until 5 minutes before evaluation.\n4. The Presentation Guy: Didn't write a single line of code, but speaks fluent corporate buzzwords and gets an A+ from the external examiner.\n\nWhich one are you?\n\n#GroupProject #EngineeringSurvival #CollegeHumor #BTechLife`,
    type: "QUESTION",
    isAnonymous: false,
    scope: "GLOBAL",
    hoursAgo: 32,
    upvotesCount: 980,
    comments: [
      { text: "I am proudly #2. Emotional support and hot samosas are vital for project velocity.", hoursAgo: 30 },
      { text: "Person #4 getting the highest marks in viva while person #1 stumbles over a nervous question is so painful", hoursAgo: 27 },
      { text: "Shoutout to all the #1s carrying the GPA of this nation on their shoulders 🙏", hoursAgo: 18 },
    ],
  },
];

async function main() {
  const connectionString = requireDatabaseUrl();
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  console.log("⚡ Seeding authentic Video Reels, Reddit-style Memes & Student Discussions...");

  // Fetch verified user profiles & institutions
  const allProfiles = await db.select().from(userProfiles).limit(30);
  const allInstitutions = await db.select().from(institutions).limit(10);

  if (allProfiles.length === 0 || allInstitutions.length === 0) {
    console.error("❌ No user profiles or institutions found. Run basic seed first.");
    await sql.end();
    return;
  }

  const primaryCollege = allInstitutions[0];
  let seededReelsCount = 0;
  let seededMemesCount = 0;

  for (let i = 0; i < SEED_ITEMS.length; i++) {
    const item = SEED_ITEMS[i];
    // Rotate across users so every post has a unique authentic author
    const author = allProfiles[i % allProfiles.length];
    const targetInst =
      item.scope === "CAMPUS"
        ? primaryCollege
        : allInstitutions[i % allInstitutions.length];

    const postCreatedAt = new Date(Date.now() - item.hoursAgo * 60 * 60 * 1000);
    const postId = crypto.randomUUID();

    await db.insert(posts).values({
      id: postId,
      authorId: author.id,
      pseudonym: item.isAnonymous ? item.pseudonym || "Campus Insider" : null,
      institutionId: targetInst.id,
      type: item.type,
      scope: item.scope,
      title: item.title || null,
      body: item.body,
      isAnonymous: item.isAnonymous,
      status: "PUBLISHED",
      isSeeded: true,
      createdAt: postCreatedAt,
      updatedAt: postCreatedAt,
    });

    if (item.body.includes(".mp4")) {
      seededReelsCount++;
    } else {
      seededMemesCount++;
    }

    // Upvotes from distinct fellow campus peers
    const upvoters = [...allProfiles]
      .filter((p) => p.id !== author.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(item.upvotesCount, allProfiles.length));

    for (const voter of upvoters) {
      await db
        .insert(votes)
        .values({
          id: crypto.randomUUID(),
          postId,
          userId: voter.id,
          value: 1,
          createdAt: new Date(postCreatedAt.getTime() + (Math.random() * 30 + 5) * 60 * 1000),
        })
        .onConflictDoNothing();
    }

    // Authentic student comments
    for (const c of item.comments) {
      const commenter = allProfiles[Math.floor(Math.random() * allProfiles.length)];
      const commentTime = new Date(Date.now() - c.hoursAgo * 60 * 60 * 1000);

      await db.insert(comments).values({
        id: crypto.randomUUID(),
        postId,
        authorId: commenter.id,
        body: c.text,
        isAnonymous: Boolean(c.isAnon),
        pseudonym: c.isAnon ? "Anonymous Batchmate" : null,
        status: "PUBLISHED",
        createdAt: commentTime,
        updatedAt: commentTime,
      });
    }
  }

  console.log(
    `✅ Successfully seeded ${seededReelsCount} Interactive Video Reels and ${seededMemesCount} Viral Campus Memes across verified student accounts!`
  );
  await sql.end();
}

main().catch((err) => {
  console.error("Error seeding reels and memes:", err);
  process.exit(1);
});
