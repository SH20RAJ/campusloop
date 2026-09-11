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
    title: "3:00 AM Hackathon Final Sprint",
    body: `3:00 AM energy at the 24-hour campus hackathon 🔥\n\n4 team members, 16 cups of machine coffee, 2 hours left on the timer, and our backend just decided to return 500 on every single endpoint 💀\n\nFixed it with 1 line of middleware. Pure adrenaline.\n\n![3 AM Hackathon Submission](https://filesamples.com/samples/video/mp4/sample_640x360.mp4)\nhttps://filesamples.com/samples/video/mp4/sample_640x360.mp4\n\n#CampusReel #HackathonLife #BTechtards #DevVibes #HostelChronicles`,
    type: "NORMAL",
    isAnonymous: false,
    scope: "CAMPUS",
    hoursAgo: 2,
    upvotesCount: 380,
    comments: [
      { text: "The classical middleware fix at 3:30 AM lol. Did you guys win?", hoursAgo: 1.5 },
      { text: "That whiteboard architecture diagram in the background is so real 😭", hoursAgo: 1 },
      { text: "Red Bull and Nescafe holding the entire Indian IT industry together", hoursAgo: 0.5 },
    ],
  },
  {
    title: "Campus Golden Hour Walk Behind Library",
    body: `POV: You survived 4 consecutive lectures of Signals & Systems and the campus weather hits like this 🌅✨\n\nBest spot to decompress before end-sems kick off.\n\n![Campus Sunset Trail](https://filesamples.com/samples/video/mp4/sample_960x400_ocean_with_audio.mp4)\nhttps://filesamples.com/samples/video/mp4/sample_960x400_ocean_with_audio.mp4\n\n#CampusVibes #GoldenHour #CollegeDiaries #PeacefulMoments`,
    type: "NORMAL",
    isAnonymous: false,
    scope: "CAMPUS",
    hoursAgo: 5,
    upvotesCount: 520,
    comments: [
      { text: "The lawn behind the central library is literally the only peaceful place on campus", hoursAgo: 4 },
      { text: "Signals & Systems prof was ruthless today though ngl", hoursAgo: 3 },
      { text: "Needed this vibe check fr 🙏", hoursAgo: 1.8 },
    ],
  },
  {
    title: "Workshop Welding: Expectation vs Reality",
    body: `First-year Mechanical Workshop was an absolute cinematic event today ⚡️🔥\n\nExpectation: Tony Stark building the Mark 1 suit in a cave.\nReality: Shaking hands, sparks flying into the lab assistant's boots, and my weld joint snapping when blown with air 💀\n\nStill scored an A on the viva somehow!\n\n![Workshop Sparks](https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4)\nhttps://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4\n\n#EngineeringStudents #MechWorkshop #FirstYearLore #BTechLife`,
    type: "MEME",
    isAnonymous: false,
    scope: "GLOBAL",
    hoursAgo: 8,
    upvotesCount: 640,
    comments: [
      { text: "The lab assistant shouting 'CHASHMA LAGAO' every 5 seconds is engraved in my brain 😂", hoursAgo: 7 },
      { text: "My carpentry piece in 1st year was supposed to be a T-joint and ended up looking like firewood", hoursAgo: 5 },
      { text: "Bro said Tony Stark 💀💀💀", hoursAgo: 3 },
    ],
  },
  {
    title: "Hostel Mess Announced Special Dinner",
    body: `Hostel warden said 'Special Sunday Feast tonight'...\n\nThe entire wing sprinted to the mess hall at 7:59 PM. When they opened the gates it was literally Hunger Games for the Gulab Jamuns 🏃‍♂️💨\n\n![Hostel Mess Rush](https://vjs.zencdn.net/v/oceans.mp4)\nhttps://vjs.zencdn.net/v/oceans.mp4\n\n#HostelLore #HostelFeast #MessFoodChronicles #CollegeHumor`,
    type: "MEME",
    isAnonymous: true,
    pseudonym: "Mess Hall Sprinter",
    scope: "CAMPUS",
    hoursAgo: 12,
    upvotesCount: 490,
    comments: [
      { text: "300 engineers fighting over 40 pieces of paneer is true survival of the fittest", hoursAgo: 10 },
      { text: "The line was longer than the queue for TCS placements fr", hoursAgo: 8 },
      { text: "Shoutout to the mess bhaiya who secretly gave me extra ice cream cup", hoursAgo: 4 },
    ],
  },
  {
    title: "Zero Errors, Zero Warnings At Last",
    body: `When you spend 3 hours tracking down a Segmentation Fault (core dumped) and it was literally an uninitialized pointer on line 84...\n\nRunning the test suite and watching all 42 test cases turn GREEN 🟢✨\n\nNothing in college beats this feeling.\n\n![Tests Passing](https://filesamples.com/samples/video/mp4/sample_640x360.mp4)\nhttps://filesamples.com/samples/video/mp4/sample_640x360.mp4\n\n#ProgrammerHumor #CSERelatable #CodingLife #BugHunt`,
    type: "NORMAL",
    isAnonymous: false,
    scope: "GLOBAL",
    hoursAgo: 16,
    upvotesCount: 710,
    comments: [
      { text: "Valgrind: '0 errors from 0 contexts' is the ultimate dopamine hit", hoursAgo: 14 },
      { text: "C++ pointers will either make you a senior architect or give you grey hairs by 21", hoursAgo: 11 },
      { text: "Green test cases are better than therapy fr", hoursAgo: 6 },
    ],
  },
  {
    title: "Secret Rooftop Study Spot",
    body: `Found the rooftop access door on the 5th floor of the Old Science Block unlocked during evening study break...\n\nCool autumn breeze, zero noise, overlooking the whole campus football field. Perfect for listening to lectures at 2x speed 🎧📚\n\n![Rooftop Study Vibe](https://filesamples.com/samples/video/mp4/sample_960x400_ocean_with_audio.mp4)\nhttps://filesamples.com/samples/video/mp4/sample_960x400_ocean_with_audio.mp4\n\n#SecretSpot #CampusVibes #StudyWithMe #SemesterPrep`,
    type: "NORMAL",
    isAnonymous: false,
    scope: "CAMPUS",
    hoursAgo: 22,
    upvotesCount: 430,
    comments: [
      { text: "Bro don't reveal the location on CampusLoop or the security guards will padlock it by tomorrow 😭", hoursAgo: 19 },
      { text: "Best place on campus to clear your mind after back-to-back viva", hoursAgo: 15 },
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
