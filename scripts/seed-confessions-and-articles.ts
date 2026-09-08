/**
 * CampusLoop Confessions & Anonymous Articles Seeder
 * Seeds authentic, engaging, relatable confessions & long anonymous stories
 * across Indian engineering & university campuses.
 *
 * Run: bun run scripts/seed-confessions-and-articles.ts
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

const CONFESSIONS_DATA = [
  {
    title: "Hostel 3 AM Maggi & The Illegal Kettle Incident",
    body: `Our hostel warden did a surprise raid on Floor 2 at 3:15 AM because the circuit breaker tripped.\n\nTurns out 6 different rooms were running electric kettles, sandwich makers, and an immersion rod simultaneously to make 14 packets of Maggi after a grueling DBMS lab prep.\n\nWe hid our kettle inside a hollowed-out vintage CPU cabinet under the desk. The warden searched the whole wardrobe and bathroom, looked right at the glowing cabinet fan, and left saying 'Tum log padhai karo, switch mat udao'. Pure hostel engineering.\n\n#HostelLore #3AMMaggi #HostelLife`,
    category: "hostel_lore",
    pseudonym: "KettleEngineer",
    hoursAgo: 2,
    upvotes: 84,
    comments: [
      "The CPU cabinet trick is legendary, taking notes for next semester 😂",
      "Floor 2 represents! Warden still doesn't know about the induction plate in 204.",
      "Nothing unites engineers faster than late-night hunger and warden raids.",
    ],
  },
  {
    title: "The Silent Truth About 6.5 CGPA and Landing a 32 LPA Product Offer",
    body: `I need to put this out there for every 2nd and 3rd year student having panic attacks over their semester marksheet.\n\nIn my 3rd semester, I had a 5.8 SGPA. My relatives told my parents I was ruining my life. I spent nights crying in the hostel staircase feeling like an absolute failure while my batchmates flexed 9.5 GPA on LinkedIn.\n\nHere is what nobody tells you: Companies that build great engineering products do not care if you memorized 8085 microprocessor pin diagrams. They care if you can build distributed architectures, solve complex state issues, and write clean, resilient code.\n\nI stopped chasing rote grades, focused 100% on DSA patterns and open-source contributions. Last week, I signed my offer letter for 32 LPA base. Your GPA gets you into the room, but your grit decides how far you walk. Don't give up on yourself.\n\n#PersonalStory #PlacementDiaries #Burnout #EngineeringLife`,
    category: "personal_story",
    pseudonym: "GritOverGrades",
    hoursAgo: 5,
    upvotes: 215,
    comments: [
      "Needed to read this today. End sems got me so stressed out. Thank you.",
      "Massive respect. Skills and consistency always win the long game.",
      "Congratulations brother! What resources did you use for system design?",
    ],
  },
  {
    title: "The Central Library Table 4 Secret Crush",
    body: `To the girl in the olive green oversized hoodie who sits on the 2nd floor of Central Library at Table 4 every evening between 5 PM and 8 PM reading Operating Systems concepts:\n\nYou have the most radiant focus I've ever seen. Whenever you get stuck on a difficult algorithm problem, you bite your pen cap and tilt your head. I've wanted to bring you a cold coffee from the Nescafe kiosk for 3 weeks straight but my heart races every time I think of walking up.\n\nIf you see this and smile, leave a green sticky note on Table 4 tomorrow.\n\n#CampusLove #LibraryVibes #Unfiltered`,
    category: "creative",
    pseudonym: "LibraryPhantom",
    hoursAgo: 8,
    upvotes: 142,
    comments: [
      "Bro just go talk to her! Cold coffee is a 10/10 move.",
      "Watch 15 girls wear olive green hoodies to Table 4 tomorrow lmao",
      "CampusLoop setting up romances, we love to see it ❤️",
    ],
  },
  {
    title: "How Our Whole Batch Submitted the Exact Same Git Commit History",
    body: `For our Cloud Computing semester project, someone uploaded a starter repo that was secretly the final completed assignment from the 2024 batch.\n\nOver 40 students forked it without clearing the commit logs. During external evaluation, the external examiner opened git log and saw 'Fixed docker compose - Rohan Patel, Dec 2024' on 38 different laptops.\n\nThe entire lab froze in utter silence. The professor just sighed, took off his spectacles, and said: 'At least change the commit author name, you are in 7th semester'. Everyone got a B+.\n\n#CampusHumor #LabDisaster #EngineeringFails`,
    category: "jokes",
    pseudonym: "GitRebaseSurvivor",
    hoursAgo: 11,
    upvotes: 310,
    comments: [
      "`git commit --amend --author` exists for a reason boys 😂",
      "The external professor deserves an award for chillest examiner of the year",
      "Same thing happened in our Java OOP lab with identical variable names like `int chomu = 5;`",
    ],
  },
  {
    title: "The Old Mechanical Workshop Underground Rooftop",
    body: `Most students think the old mechanical department workshop is completely locked up after 6 PM.\n\nIf you climb the iron spiral staircase behind the CAD lab and push the loose rusted grill on the fire exit, it opens up to a tranquil rooftop overlooking the entire campus football ground and the city skyline.\n\nDuring end sems when my brain is fried from studying Automata and compiler design, sitting there with cold air and earphone music is the only thing that keeps me sane. Please don't litter if you find it.\n\n#DarkSecret #CampusSpots #Peaceful`,
    category: "dark_secret",
    pseudonym: "MidnightExplorer",
    hoursAgo: 16,
    upvotes: 95,
    comments: [
      "Deleting this before security puts a padlock on the fire exit!",
      "Best spot for watching campus sunsets during monsoon.",
    ],
  },
  {
    title: "Off-Campus Placements: The Brutal Unspoken Reality Nobody Prepares You For",
    body: `Let's have an honest conversation about off-campus tech hiring in 2026.\n\nCollege placement cells sell you the dream that 50 companies will fight over your resume. In reality, on-campus drives are getting saturated, and if you rely solely on your college portal, you will be in for a rude shock.\n\nHere are 3 truths I learned after sending 600+ applications:\n1. Cold LinkedIn DMs to HRs have a 2% reply rate. Cold DMs to Senior SDEs with a Loom video showing a bug fix on their open-source repo have a 45% referral rate.\n2. Having 5 generic clone projects on your resume hurts you. Build one full-stack product with real users, live telemetry, and zero-downtime deployment.\n3. Mock interviews with peers are 10x more valuable than grinding 200 more LeetCode easies.\n\nDo not wait for 7th semester to start reaching out. Start building your digital footprint now.\n\n#PlacementDiaries #CareerAdvice #TechHiring #AnonymousArticle`,
    category: "placements",
    pseudonym: "SeniorArchitect",
    hoursAgo: 22,
    upvotes: 420,
    comments: [
      "The Loom video advice is pure gold. Got my internship that exact way.",
      "Can confirm. SDEs love seeing engineers who actually build real things.",
      "Pinning this for every junior on campus.",
    ],
  },
  {
    title: "Mess Committee Mystery: Tuesday Paneer vs Monday Kofta",
    body: `I have been doing undercover culinary forensic analysis on our hostel mess menu for two semesters.\n\nNotice how whenever we have 'Vegetable Kofta Curry' on Monday night, Tuesday lunch invariably features 'Paneer Butter Masala'?\n\nI dissected the paneer cubes today. They have the exact same coriander and cumin seed distribution as Monday's kofta filling. The mess manager is a mastermind of circular economy and zero-waste logistics. Honestly, I respect the hustle because it tastes fire.\n\n#CampusHumor #MessFoodChronicles #HostelLore`,
    category: "jokes",
    pseudonym: "MessSherlock",
    hoursAgo: 26,
    upvotes: 188,
    comments: [
      "Culinary forensic analysis 💀 bro is majoring in Mess Engineering",
      "Wait till you discover where Sunday biryani rice comes from on Monday fried rice",
      "As long as it's warm and there's extra gravy, we don't ask questions.",
    ],
  },
  {
    title: "Confession: I Stole the Department Chairman's Favorite Board Marker",
    body: `In 2nd year during a 3-hour marathon lecture on Digital Signal Processing, the professor went on a 20-minute rant about how modern students have zero attention span.\n\nWhen he turned to write on the blackboard, he dropped his blue Japanese whiteboard marker with custom refill ink that he bragged about importing. It rolled under my bench.\n\nI picked it up and kept it in my pencil pouch. It has been my lucky pen for every single semester exam since then. I graduated yesterday with top honors. Professor Sir, your marker served me well.\n\n#DarkSecret #HostelLore #CampusConfession`,
    category: "dark_secret",
    pseudonym: "MarkerHeist",
    hoursAgo: 32,
    upvotes: 160,
    comments: [
      "Prof reading this right now checking his desk drawer with suspicion 👀",
      "Stealing academic luck is wild haha",
    ],
  },
  {
    title: "To the Professor Who Passed Me When My Family Was in the Hospital",
    body: `During mid-terms in 4th semester, my father suffered a major heart attack back home. I had to leave campus overnight without submitting the internal assessment or attending the lab viva.\n\nI returned two weeks later, exhausted and convinced I would get a year-back in Analog Circuits.\n\nWhen I walked into Professor Gupta's office with trembling hands holding medical certificates, he didn't even look at the hospital papers. He poured me a cup of tea, asked how my father was recovering, and spent two hours on a Saturday afternoon taking my viva one-on-one.\n\nIn an academic system that often feels cold and bureaucratic, teachers like him are living angels. I never got to thank him properly without getting emotional.\n\n#PersonalStory #Gratitude #CampusLife`,
    category: "personal_story",
    pseudonym: "GratefulEngineer",
    hoursAgo: 38,
    upvotes: 530,
    comments: [
      "There are truly wonderful educators who remember students are human beings first.",
      "Professors like this restore faith in the entire education system.",
      "Such a wholesome confession ❤️",
    ],
  },
  {
    title: "Placement Cell Proxy Interview Drama - The Tea You Weren't Told",
    body: `Everyone knows about the multinational consulting firm that blacklisted our campus for 2 years.\n\nWhat actually happened: A senior was giving the online technical interview for his roommate using a second monitor and an external Bluetooth microphone.\n\nMidway through the coding challenge, the webcam mirror reflection on the hostel window clearly showed the second guy sitting on the bed frantically typing code into ChatGPT. The interviewer asked: 'Could the gentleman on the bed please explain why he chose Quicksort over Mergesort?'.\n\nThe silence was so loud you could hear the ceiling fan squeaking.\n\n#PlacementDiaries #CampusTea #DarkSecret`,
    category: "placements",
    pseudonym: "PlacementInsider",
    hoursAgo: 45,
    upvotes: 385,
    comments: [
      "THE WINDOW REFLECTION 💀💀💀 rookie mistake!",
      "I was on that floor when it happened, the screams through the corridor were unreal",
      "Interviewer hit him with the ultimate boss move.",
    ],
  },
  {
    title: "Why Indian Engineering Campuses Need More Spaces for Unfiltered Creativity",
    body: `We spend four years learning how to optimize compilers, balance chemical equations, and design reinforced concrete beams.\n\nYet, the moment someone picks up a guitar at 1 AM on the hostel lawn, or starts writing poetry in the library gazebos, security guards blow whistles as if a crime has occurred.\n\nEngineering is fundamentally about creative problem-solving. When you kill artistic expression, music, and philosophical discussions, you produce robots instead of visionary creators. We need more open mics, hackathons that celebrate art and tech fusion, and campuses that stay alive under the stars.\n\n#AnonymousArticle #CampusCulture #CreativeMinds #Unfiltered`,
    category: "creative",
    pseudonym: "PoetInHardhat",
    hoursAgo: 50,
    upvotes: 270,
    comments: [
      "Preach! The best software engineers I know are musicians, writers, and painters.",
      "Hostel lawns at night used to be the cradle of great startup ideas.",
    ],
  },
  {
    title: "I Accidentally Became the Campus Printer Monopoly",
    body: `In 1st year, my dad gave me his old heavy-duty laser printer for my hostel room.\n\nWhen end sems arrived and the campus Xerox shop had a 3-hour line under the scorching sun, I put up a QR code on the hostel notice board offering 1 rupee per page with WhatsApp delivery to your door.\n\nWithin 3 semesters, I paid off my entire semester tuition fees, bought a second duplex printer, and hired two 1st-year juniors as delivery runners. The campus stationery uncle still gives me dirty looks whenever I buy stationery.\n\n#HostelLore #CampusHustle #StudentStartup`,
    category: "hostel_lore",
    pseudonym: "XeroxKingpin",
    hoursAgo: 58,
    upvotes: 340,
    comments: [
      "Shark Tank who? This is grassroots entrepreneurship at its finest!",
      "Campus Xerox cartel was not ready for modern distribution mechanics.",
      "Hiring 1st year runners is diabolical genius haha",
    ],
  },
];

async function main() {
  const databaseUrl = requireDatabaseUrl();
  const sqlClient = postgres(databaseUrl, { max: 1 });
  const db = drizzle(sqlClient);

  console.log("🚀 Starting Confessions & Anonymous Articles Seeding...");

  // 1. Fetch active institutions
  const insts = await db.select({ id: institutions.id, name: institutions.name }).from(institutions).limit(10);
  if (insts.length === 0) {
    throw new Error("No institutions found. Please seed colleges first.");
  }

  // 2. Fetch or select existing users to assign authorship (anonymously)
  const users = await db.select({ id: userProfiles.id }).from(userProfiles).limit(15);
  if (users.length === 0) {
    throw new Error("No user profiles found to bind anonymous confessions.");
  }

  const primaryAuthorId = users[0].id;
  const primaryInstId = insts[0].id;

  console.log(`Found ${insts.length} institutions and ${users.length} users.`);

  let createdCount = 0;

  for (let i = 0; i < CONFESSIONS_DATA.length; i++) {
    const item = CONFESSIONS_DATA[i];
    const authorId = users[i % users.length].id;
    const instId = insts[i % insts.length].id;

    const createdAt = new Date(Date.now() - item.hoursAgo * 60 * 60 * 1000);

    // Insert post
    const [insertedPost] = await db
      .insert(posts)
      .values({
        authorId,
        institutionId: instId,
        type: "CONFESSION",
        scope: i % 3 === 0 ? "CAMPUS" : "GLOBAL",
        title: item.title,
        body: item.body,
        isAnonymous: true,
        pseudonym: item.pseudonym,
        status: "PUBLISHED",
        isSeeded: false, // Ensures visibility across all normal feeds
        createdAt,
        updatedAt: createdAt,
      })
      .returning({ id: posts.id });

    // Seed upvotes
    const upvoteCount = Math.min(item.upvotes, 35);
    for (let u = 0; u < Math.min(upvoteCount, users.length); u++) {
      try {
        await db.insert(votes).values({
          postId: insertedPost.id,
          userId: users[u].id,
          value: 1,
          createdAt: new Date(createdAt.getTime() + u * 60000),
        });
      } catch {
        // ignore duplicate
      }
    }

    // Seed comments
    for (let c = 0; c < item.comments.length; c++) {
      const commenterId = users[(i + c + 1) % users.length].id;
      try {
        await db.insert(comments).values({
          postId: insertedPost.id,
          authorId: commenterId,
          pseudonym: `Student_${(c + 1) * 7}`,
          body: item.comments[c],
          isAnonymous: c % 2 === 1,
          status: "PUBLISHED",
          createdAt: new Date(createdAt.getTime() + (c + 1) * 300000),
        });
      } catch (err) {
        console.warn(`Comment error: ${err}`);
      }
    }

    createdCount++;
    console.log(`[${createdCount}/${CONFESSIONS_DATA.length}] Seeded: "${item.title}"`);
  }

  console.log(`\n🎉 Successfully seeded ${createdCount} authentic confessions & anonymous articles!`);
  await sqlClient.end();
}

main().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
