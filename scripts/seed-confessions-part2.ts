/**
 * CampusLoop Confessions & Anonymous Articles Seeder - Part 2
 * Seeds 13 more authentic Indian university confessions and articles.
 *
 * Run: bun run scripts/seed-confessions-part2.ts
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { comments, institutions, posts, userProfiles, votes } from "../src/db/schema";
import { loadLocalEnv } from "../src/lib/load-env";

loadLocalEnv();

function requireDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.DB_URL;
  if (!databaseUrl) throw new Error("Missing DATABASE_URL.");
  return databaseUrl;
}

const CONFESSIONS_PART_2 = [
  {
    title: "The Phantom Spotify Session in the Physics Department Lab",
    body: `Our department computer lab has an ancient audio speaker wired to the central teacher console that nobody has touched since 2018.\n\nYesterday during our 2-hour dull Solid State Physics lecture, someone found the open Bluetooth receiver named 'LAB_AUDIO_SYSTEM_01' and connected to it from the last bench.\n\nInstead of playing a joke, they queued up the lofi instrumental version of 'Kun Faya Kun' at 10% volume. The entire lab went dead quiet, and even the professor paused mid-equation, smiled, and said 'Chalo, mahaul accha hai' and kept writing.\n\n#HostelLore #CampusHumor #Wholesome`,
    category: "jokes",
    pseudonym: "AudioPhantom",
    hoursAgo: 62,
    upvotes: 290,
    comments: [
      "The professor saying 'mahaul accha hai' is elite tier vibe",
      "Our prof would have called security and filed an FIR 😭",
    ],
  },
  {
    title: "How I Survived 8 Backlogs and Still Got Placed: An Open Letter",
    body: `When I entered college, I had no clue what computer science even meant. By the end of 2nd year, I had accumulated 8 backlogs across Engineering Maths, Digital Logic, and Data Structures.\n\nI felt paralyzed with shame. I stopped going home for Diwali because I couldn't face the questions.\n\nIn my 5th semester, a senior sat me down and told me: 'A backlog is just an administrative exam debt. It does not define your intellect. Clear one subject per month and build your GitHub portfolio.'\n\nI cleared all 8 backlogs over the next 3 semesters by doing 6 AM study sessions before classes. Last month, I cleared the technical bar at a leading fintech startup in Bangalore. To anyone staring at an N-grade right now: this is merely a chapter, not your whole story.\n\n#PersonalStory #PlacementDiaries #AcademicRedemption #Unfiltered`,
    category: "personal_story",
    pseudonym: "ReboundCoder",
    hoursAgo: 68,
    upvotes: 490,
    comments: [
      "Needed this reminder so badly. Giving supplementary exam tomorrow.",
      "Godspeed brother. Resilience is the real engineering degree.",
    ],
  },
  {
    title: "The Cricket Ball Window Tragedy of Block B",
    body: `We were playing corridor cricket in Block B with a taped tennis ball at 1:30 AM.\n\nMy roommate hit an accidental lofted straight drive that sailed right through the hostel warden's open kitchen window and landed directly into his pressure cooker whistle.\n\nWe had 10 seconds to decide whether to flee or retrieve the ball. We ran. The next morning at the notice board, the warden put up: 'Whoever hit the sixer into my dal, come collect your ball and pay 200 rs for broken spices'. True story.\n\n#HostelLore #CorridorCricket #BlockBLegends`,
    category: "hostel_lore",
    pseudonym: "CorridorKohli",
    hoursAgo: 74,
    upvotes: 380,
    comments: [
      "Landing in the pressure cooker whistle is pinpoint accuracy 🎯",
      "Hostel cricket stories are undefeated honestly.",
    ],
  },
  {
    title: "To the Girl on the Campus Shuttle Who Shared Her Umbrella During the Cloudburst",
    body: `During last Tuesday's sudden cloudburst near the main gate, my laptop bag was getting drenched with my final year project inside.\n\nYou noticed, ran over with your navy blue umbrella, and walked alongside me all the way to the CS department portico even though you were heading towards Management block.\n\nYou had white Converse shoes that got completely soaked in the muddy puddles because of me. I was so worried about my laptop that I barely mumbled a proper thank you before you turned back. I hope good karma finds you every single day.\n\n#CampusLove #Gratitude #WholesomeCampus`,
    category: "creative",
    pseudonym: "DrenchedEngineer",
    hoursAgo: 80,
    upvotes: 410,
    comments: [
      "Bro found his campus movie moment! Search for the navy blue umbrella!",
      "Wholesome energy. Campus kindness hits different.",
    ],
  },
  {
    title: "Our College Hackathon Team Won by Fixing the Judges' Own Production Site",
    body: `At the national hackathon hosted on our campus last month, the problem statement was vague and boring.\n\nWhile exploring the sponsor company's public API docs, we spotted an unauthenticated SSRF vulnerability in their webhook validation endpoint that exposed their staging AWS metadata.\n\nInstead of building another generic AI resume parser, we submitted a complete patch with automated penetration testing scripts and a secure proxy relay. The CTO who was judging choked on his coffee, called their DevOps team on speaker in the auditorium, and gave us the 1st prize on the spot.\n\n#DarkSecret #HackathonHeist #CyberSecurity`,
    category: "dark_secret",
    pseudonym: "WhiteHatSquad",
    hoursAgo: 86,
    upvotes: 620,
    comments: [
      "Now THAT is how you win a hackathon. Absolute power move.",
      "The sponsor CTO must have had a mini heart attack haha",
    ],
  },
  {
    title: "Why College Friendships Shift After Placement Season: Navigating the Silent Divide",
    body: `Nobody prepares you for the emotional whiplash of 7th semester.\n\nThe same 4 friends who shared 20-rupee chai cups and pooled money for semester exam xerox copies suddenly get stratified into CTC brackets: 4 LPA, 14 LPA, 35 LPA, and unplaced.\n\nJealousy is rarely loud. It creeps in through silenced WhatsApp groups, awkward dinner conversations, and subtle avoidance. If you are placed early, be humble and don't make every conversation about your joining bonus. If you are still grinding, know that Day 1 hiring is just a snapshot, not a permanent destiny. Protect your friendships; they outlive your first corporate job.\n\n#AnonymousArticle #PlacementSeason #MentalHealth #CampusLife`,
    category: "personal_story",
    pseudonym: "HostelPhilosopher",
    hoursAgo: 92,
    upvotes: 560,
    comments: [
      "Most mature post on this entire app. So true.",
      "The CTC divide is real and it ruins so many genuine bonds. Stay grounded everyone.",
    ],
  },
  {
    title: "The Midnight Nescafe Maggie Monopoly Breakdown",
    body: `When the Nescafe shop owner realized he had zero competition after midnight, he started charging 50 rupees for a single Maggi with two microscopic pieces of capsicum.\n\nSo 4 guys in Hostel 7 set up an illegal guerrilla Maggi distribution network called 'MaggiExpress' on Telegram with a secret pickup point behind the water cooler. Within one week, Nescafe sales plummeted by 80% and the uncle had to slash prices back to 30 rs with free oregano sprinkles. Free market economics in action.\n\n#HostelLore #CampusHustle #Economics101`,
    category: "hostel_lore",
    pseudonym: "MaggiCartel",
    hoursAgo: 98,
    upvotes: 310,
    comments: [
      "The invisible hand of the market strikes again!",
      "Hostel 7 innovation is on another level.",
    ],
  },
  {
    title: "Confession: I Pretended My Mic Was Broken for 2 Whole Years of Online Semesters",
    body: `During the 2020-2022 lockdown semesters, whenever a professor called my roll number for random viva questions, I would blow gently into the microphone while crinkling a potato chip bag and saying 'Sir... krshhh... network... krshhh... audio cut ho raha hai'.\n\nI cleared 4 semesters with an 8.9 CGPA and never answered a single viva question live.\n\n#DarkSecret #CampusHumor #LockdownMemories`,
    category: "dark_secret",
    pseudonym: "PotatoChipMic",
    hoursAgo: 104,
    upvotes: 430,
    comments: [
      "The chip bag crinkling technique is an art form 😭",
      "We all lived the same life during online classes honestly.",
    ],
  },
  {
    title: "The Architecture Department Cat That Runs the Entire Campus",
    body: `If you have ever visited the Architecture department courtyards, you have definitely met 'Billi Sir', the ginger tomcat.\n\nHe has a dedicated cushioned chair in the drafting room that no student is allowed to sit on by unwritten decree. Last week, an external jury member tried to move the cat to inspect an architectural model, and three 4th-year students simultaneously shouted 'Sir please don't disturb him, he is grading the elevations'.\n\n#CampusLore #CampusPets #ArchitectureChronicles`,
    category: "jokes",
    pseudonym: "CatWhisperer",
    hoursAgo: 110,
    upvotes: 395,
    comments: [
      "Billi Sir has better spatial design intuition than half our batch",
      "Can confirm, he judged my thesis model and slept on it. Got an A.",
    ],
  },
  {
    title: "The Loneliness of Being the Only Girl in a 70-Person Core Engineering Branch",
    body: `When I entered Mechanical Engineering, I was the sole female student in a classroom of 69 boys.\n\nIn the first year, every move I made felt scrutinized. If I scored high in Thermodynamics, people whispered it was favoritism. If I made a mistake on the lathe machine in workshop, people claimed 'girls can't handle machinery'.\n\nIt took 2 years of proving myself, staying back after hours, and getting my hands covered in grease to earn mutual respect. Now I am graduating as department gold medalist and heading to an electric mobility R&D center. To every girl entering core engineering: take up space unapologetically.\n\n#PersonalStory #WomenInSTEM #CoreEngineering #CampusConfession`,
    category: "personal_story",
    pseudonym: "MechGoldMedalist",
    hoursAgo: 116,
    upvotes: 680,
    comments: [
      "Incredible inspiration! Huge respect to you queen 👑",
      "Core engineering needs more fierce women leading from the front.",
    ],
  },
  {
    title: "How I Accidentally Subscribed Our Entire Lab to an Automated Meme Newsletter",
    body: `During automated email testing in our Web Development lab, I put the department faculty mailing list into a cron job test script.\n\nEvery Monday morning at 8 AM for three consecutive weeks, all 24 professors and the HOD received a high-resolution meme about recursion and off-by-one errors from 'bot@campusloop.internal'.\n\nThe HOD printed out the meme, stuck it outside his office cabin, and wrote 'Very informative, improve formatting next time'.\n\n#DarkSecret #LabPranks #EngineeringHumor`,
    category: "jokes",
    pseudonym: "CronJobCulprit",
    hoursAgo: 122,
    upvotes: 275,
    comments: [
      "The HOD printing it out and grading the meme is peak academia 💀",
      "At least the cron job didn't fail with 500 internal server error!",
    ],
  },
  {
    title: "The Night We Snuck Into the Planetarium Dome Before Farewell",
    body: `On our final night before graduation hostel checkout, five of us managed to open the hatch to the old campus observatory dome that had been decommissioned a decade ago.\n\nWe sat on the wooden floor with our legs dangling out, watching the stars and listening to the distant highway traffic.\n\nWe promised each other that 10 years down the line, no matter what titles or cities we end up in, we will never forget the 19-year-old kids who lived on 10-rupee chai and dreamed of changing the world together. Four years flew by in the blink of an eye.\n\n#PersonalStory #CampusFarewell #Nostalgia #EngineeringMemories`,
    category: "personal_story",
    pseudonym: "Alumni2026",
    hoursAgo: 128,
    upvotes: 510,
    comments: [
      "Farewell season always hits right in the heart.",
      "Cherish every single day on campus guys, it never comes back.",
    ],
  },
  {
    title: "Senior Advice: How to Actually Maximize Your 4 Years of Engineering",
    body: `As a graduating 8th semester student with a great offer and zero regrets, here is the master checklist I wish someone handed me on Day 1:\n\n1. Maintain a CGPA above 8.0. It keeps 95% of company and MS shortlist gates open without needing you to be a bookworm.\n2. Pick ONE deep engineering stack in 2nd year (Cloud, Backend, ML, Mobile, or Systems) and build 2 non-trivial production systems.\n3. Make friends across different departments. Your circle of designers, finance people, and civil engineers will be your future startup cofounders.\n4. Travel with your hostel friends on long weekends. Work will always be there, but your college youth won't.\n5. Don't be afraid to fail early. The best projects emerge from crashed prototypes.\n\n#AnonymousArticle #CampusRoadmap #SeniorAdvice #Unfiltered`,
    category: "placements",
    pseudonym: "FinalYearMentor",
    hoursAgo: 134,
    upvotes: 750,
    comments: [
      "Screenshotting this checklist. Golden advice.",
      "The tip about making friends across other branches is so underrated.",
    ],
  },
];

async function main() {
  const databaseUrl = requireDatabaseUrl();
  const sqlClient = postgres(databaseUrl, { max: 1 });
  const db = drizzle(sqlClient);

  console.log("🚀 Starting Confessions Seeding Part 2...");

  const insts = await db.select({ id: institutions.id }).from(institutions).limit(10);
  const users = await db.select({ id: userProfiles.id }).from(userProfiles).limit(15);

  let count = 0;
  for (let i = 0; i < CONFESSIONS_PART_2.length; i++) {
    const item = CONFESSIONS_PART_2[i];
    const authorId = users[i % users.length].id;
    const instId = insts[i % insts.length].id;
    const createdAt = new Date(Date.now() - item.hoursAgo * 60 * 60 * 1000);

    const [insertedPost] = await db
      .insert(posts)
      .values({
        authorId,
        institutionId: instId,
        type: "CONFESSION",
        scope: i % 2 === 0 ? "GLOBAL" : "CAMPUS",
        title: item.title,
        body: item.body,
        isAnonymous: true,
        pseudonym: item.pseudonym,
        status: "PUBLISHED",
        isSeeded: false,
        createdAt,
        updatedAt: createdAt,
      })
      .returning({ id: posts.id });

    // Upvotes
    const upvotesCount = Math.min(item.upvotes, 30);
    for (let u = 0; u < Math.min(upvotesCount, users.length); u++) {
      try {
        await db.insert(votes).values({
          postId: insertedPost.id,
          userId: users[u].id,
          value: 1,
          createdAt: new Date(createdAt.getTime() + u * 60000),
        });
      } catch {}
    }

    // Comments
    for (let c = 0; c < item.comments.length; c++) {
      try {
        await db.insert(comments).values({
          postId: insertedPost.id,
          authorId: users[(i + c + 1) % users.length].id,
          pseudonym: `Peer_${(c + 1) * 3}`,
          body: item.comments[c],
          isAnonymous: true,
          status: "PUBLISHED",
          createdAt: new Date(createdAt.getTime() + (c + 1) * 200000),
        });
      } catch {}
    }

    count++;
    console.log(`[${count}/${CONFESSIONS_PART_2.length}] Seeded: "${item.title}"`);
  }

  console.log(`\n🎉 Successfully seeded Part 2 (${count} posts)! Total confessions now 25+!`);
  await sqlClient.end();
}

main().catch((err) => {
  console.error("Part 2 Seeding error:", err);
  process.exit(1);
});
