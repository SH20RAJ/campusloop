/**
 * GenZ Viral Campus Confessions & Rich Feeds Seeder
 * Populates authentic, high-engagement, flirty, spicy, emotional, and banter confessions,
 * discussions, polls, comments, and upvotes across campus hubs.
 *
 * Run: bun run scripts/seed-genz-viral-confessions.ts
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
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

interface SeedItem {
  type: "CONFESSION" | "NORMAL" | "QUESTION" | "POLL";
  scope: "CAMPUS" | "INDIA" | "GLOBAL";
  body: string;
  isAnonymous: boolean;
  pollChoices?: string[];
  comments: Array<{
    text: string;
    isAnon?: boolean;
    upvotes?: number;
  }>;
  upvotesCount: number;
  downvotesCount?: number;
  hoursAgo: number;
}

const VIRAL_CONFESSIONS_AND_POSTS: SeedItem[] = [
  // ─── 1. Flirty / "Saw You At..." / Campus Crush ───
  {
    type: "CONFESSION",
    scope: "CAMPUS",
    body: "To the girl with the red highlights in IC building 3rd floor at 2 PM with the oversized vintage beige blazer who was speedrunning Linear Algebra while listening to Mac DeMarco... you're an absolute polymath and I was too intimidated to even breathe. Can I please buy you an iced mocha at the cafeteria tomorrow? ☕✨ #CampusCrush #ICBuilding #Polymath",
    isAnonymous: true,
    upvotesCount: 84,
    hoursAgo: 4,
    comments: [
      { text: "Bro describing her like a Pinterest board protagonist 😭", upvotes: 31 },
      { text: "Wait I know EXACTLY who you're talking about, she's in CSE 3rd year and yes she really is a genius", upvotes: 45 },
      { text: "Shoot your shot king! Life is too short to admire from the back bench.", upvotes: 19 },
      { text: "Drop your section or hints maybe she's on CampusLoop!", upvotes: 12 },
    ],
  },
  {
    type: "CONFESSION",
    scope: "CAMPUS",
    body: "Saw the girl with blonde-streaked wavy hair from CSE 3rd year carrying a robotics microcontroller kit and iced Americano across the quad like she runs the entire university. The aura was insane. If you're single, please let me take you out on a proper late-night drive and coffee date. #CampusCrush #CSE #Aura",
    isAnonymous: true,
    upvotesCount: 112,
    hoursAgo: 7,
    comments: [
      { text: "Tech girlies have unmatched presence ngl 🤖💖", upvotes: 38 },
      { text: "Tell me why everyone has a crush on the robotics lab people lmao", upvotes: 24 },
      { text: "If she accepts the coffee date, update the confession thread!", upvotes: 15 },
    ],
  },
  {
    type: "CONFESSION",
    scope: "CAMPUS",
    body: "To the guy in the dark olive hoodie at the library 2nd floor silent section working on PyTorch neural networks with that matcha green mechanical keyboard: you dropped your metallic blue Pilot G2 pen. I picked it up. Come claim your pen and maybe let me treat you to canteen tapri chai? 🖋️ #LibraryVibes #CoderCrush",
    isAnonymous: true,
    upvotesCount: 96,
    hoursAgo: 11,
    comments: [
      { text: "Cinderella story but make it engineering college edition 😂", upvotes: 52 },
      { text: "Matching over neural nets and Pilot pens is peak 2026 romance", upvotes: 28 },
      { text: "Did he claim it yet??", upvotes: 11 },
    ],
  },
  {
    type: "CONFESSION",
    scope: "CAMPUS",
    body: "I saw you at the Main Canteen sitting under the big banyan tree laughing with your friends in that emerald green kurti on Ethnic Day. You genuinely have the warmest, most infectious laugh on this entire campus. If you see this, tell me what your favorite song is and I'll play it on guitar near the quad. 🎸 #EthnicDay #CanteenGossip",
    isAnonymous: true,
    upvotesCount: 142,
    hoursAgo: 16,
    comments: [
      { text: "Ethnic Day crushes hitting different as always 🌸", upvotes: 49 },
      { text: "Play 'Yellow' by Coldplay or 'Kasoor' by Prateek Kuhad and she's yours", upvotes: 34 },
      { text: "This is so wholesome please don't let this stay anonymous", upvotes: 21 },
    ],
  },
  {
    type: "CONFESSION",
    scope: "CAMPUS",
    body: "To the 4th year senior who gave me directions to the thermodynamics lab on my very first week when I was completely lost: I've had a massive crush on you for 2 whole semesters. Now that placement season is over and you're graduating, do I still have a chance or should I just cry in my hostel room? 😭 #SeniorCrush #BatchOf2026",
    isAnonymous: true,
    upvotesCount: 129,
    hoursAgo: 22,
    comments: [
      { text: "SEND THE DM BEFORE FAREWELL YOU WILL REGRET NOT DOING IT!", upvotes: 67 },
      { text: "Juniors having crushes on seniors is a universal campus canon event", upvotes: 39 },
      { text: "Use the CampusLoop Secret Crush feature to see if they like you back without exposing yourself!", upvotes: 44 },
    ],
  },
  {
    type: "CONFESSION",
    scope: "CAMPUS",
    body: "Saw someone at the Nescafe stall at 6 PM reading Crime & Punishment while multitasking a Figma design sprint on their iPad. Managing design systems, literature, and good looks all at once? Absolute powerhouse polymath energy. Coffee is on me this Friday. Don't say no. ☕ #Nescafe #PolymathEnergy",
    isAnonymous: true,
    upvotesCount: 78,
    hoursAgo: 2,
    comments: [
      { text: "Reading Dostoevsky while designing UI is intense multitasker behavior", upvotes: 29 },
      { text: "Nescafe cold coffee is the universal campus matchmaker", upvotes: 18 },
    ],
  },
  {
    type: "CONFESSION",
    scope: "CAMPUS",
    body: "To the guy playing acoustic guitar near the basketball court at 11:30 PM last night: your voice is pure magic. Next time please play Cigarettes After Sex or The Local Train and I might actually gather the courage to walk up and ask for your handle. 🌙 #LateNightJam #CampusMusic",
    isAnonymous: true,
    upvotesCount: 165,
    hoursAgo: 14,
    comments: [
      { text: "AA GAYE HUM 'Choo Lo' sunne at 1 AM 😭❤️", upvotes: 56 },
      { text: "Hostel night jamming hits in the soul every single time", upvotes: 31 },
    ],
  },

  // ─── 2. Spicy Secrets & Campus Banter ───
  {
    type: "CONFESSION",
    scope: "CAMPUS",
    body: "Confession: Our Section CR is secretly dating the CR of Section B, and they pretend to have heated arguments during joint class announcements so nobody suspects anything. Watching them act angry in the WhatsApp groups is peak cinema. 🍿 #CampusDrama #ClassBanter",
    isAnonymous: true,
    upvotesCount: 210,
    hoursAgo: 8,
    comments: [
      { text: "ENEMIES TO LOVERS TROPE IN REAL LIFE OMG 💀", upvotes: 89 },
      { text: "The dedication to the script is legendary lmao", upvotes: 62 },
      { text: "I knew those heated debates over timetable adjustments were fake!!", upvotes: 41 },
    ],
  },
  {
    type: "CONFESSION",
    scope: "CAMPUS",
    body: "Someone in Hostel Block 3 has been quietly swapping stolen Tupperware lids with completely mismatched sizes from other rooms. This isn't theft anymore, this is calculated psychological warfare. 😭 #HostelLife #TupperwareHeist",
    isAnonymous: true,
    upvotesCount: 188,
    hoursAgo: 18,
    comments: [
      { text: "Satan is taking notes from your hostel wing", upvotes: 72 },
      { text: "My yellow dabba currently has a purple star-shaped lid. I'm coming for you.", upvotes: 53 },
      { text: "Hostel politics > National politics", upvotes: 38 },
    ],
  },
  {
    type: "CONFESSION",
    scope: "CAMPUS",
    body: "Someone left a tiny sticky note on study cubicle 14 in the library that said 'You're doing amazing, take a breath, don't drop out today'. I had just failed a mock test and was on the verge of tears. Whoever you are, you literally saved my entire week. 🥺❤️ #LibraryAngels #MentalHealth",
    isAnonymous: true,
    upvotesCount: 245,
    hoursAgo: 26,
    comments: [
      { text: "This campus has some genuinely pure souls. Keep going, end-sems will pass!", upvotes: 94 },
      { text: "Leaving positive notes on library desks should be a mandatory campus ritual", upvotes: 61 },
    ],
  },
  {
    type: "CONFESSION",
    scope: "CAMPUS",
    body: "I told my parents my attendance was low because of 'rigorous advanced research & lab internships'. The advanced research was 14 consecutive hours of BGMI and FIFA tournaments in Room 208 with Maggi breaks. 🎮 #HostelLife #AttendanceCrisis",
    isAnonymous: true,
    upvotesCount: 177,
    hoursAgo: 30,
    comments: [
      { text: "Bro did a PhD in Pochinki mechanics 😭", upvotes: 83 },
      { text: "The dean will invite your parents to defend the research thesis", upvotes: 50 },
    ],
  },

  // ─── 3. Deep & Existential Late-Night Hostels ───
  {
    type: "CONFESSION",
    scope: "GLOBAL",
    body: "2:45 AM hostel terrace thought: We're all simultaneously terrified about placements, stressed about CGPA, pretending we know what we're doing with our lives, and running on 4 hours of sleep. But sitting on this roof looking at the campus lights with chai in hand... these 4 years are truly unforgettable. Hug your friends today. 🌌 #HostelLife #LateNightThoughts",
    isAnonymous: true,
    upvotesCount: 310,
    hoursAgo: 32,
    comments: [
      { text: "This made me tear up. College goes by in a blink of an eye.", upvotes: 110 },
      { text: "2 AM conversations with hostel wingmates hit harder than therapy.", upvotes: 85 },
      { text: "Save this post and read it again on your graduation day.", upvotes: 64 },
    ],
  },

  // ─── 4. High-Engagement Polls ───
  {
    type: "POLL",
    scope: "CAMPUS",
    body: "Late night debate: Which beverage is the TRUE lifeblood of an engineering student during exam week?",
    isAnonymous: false,
    pollChoices: [
      "Tapri Wali Kadak Adrak Chai ☕",
      "Nescafe Extra Thick Cold Coffee 🧋",
      "Red Bull / Sting Energy ⚡",
      "Hostel Filter Water & Prayers 💧",
    ],
    upvotesCount: 156,
    hoursAgo: 10,
    comments: [
      { text: "Tapri chai at 2 AM with a hot bun omelette has no competition.", upvotes: 42 },
      { text: "Nescafe cold coffee carries 50% of my semester grade points.", upvotes: 31 },
    ],
  },
  {
    type: "POLL",
    scope: "CAMPUS",
    body: "What is your biggest fear right now on campus?",
    isAnonymous: false,
    pollChoices: [
      "75% Attendance Shortage List 📋",
      "Backlog in Core Engineering Subject 💀",
      "Seeing My Crush With Someone Else 💔",
      "8:00 AM Monday Lab Viva 😴",
    ],
    upvotesCount: 198,
    hoursAgo: 20,
    comments: [
      { text: "75% attendance list strikes pure terror into the heart of every student", upvotes: 77 },
      { text: "Option 3 hurts on a spiritual level", upvotes: 54 },
    ],
  },

  // ─── 5. Normal Discussion & Campus Vibe Posts ───
  {
    type: "QUESTION",
    scope: "CAMPUS",
    body: "What's the one unwritten rule of our campus that every fresher needs to know before stepping foot here? Drop your best survival tips! 👇 #CampusGuide #Freshers2026",
    isAnonymous: false,
    upvotesCount: 135,
    hoursAgo: 6,
    comments: [
      { text: "Rule #1: Never ever trust anyone who says 'Maine kuch nahi padha' before an exam.", upvotes: 91 },
      { text: "Rule #2: The library WiFi in the corner near the journals is 4x faster than hostel WiFi.", upvotes: 68 },
      { text: "Rule #3: Always be polite to the mess bhaiya, extra paneer chunks are earned through respect.", upvotes: 84 },
    ],
  },
  {
    type: "NORMAL",
    scope: "GLOBAL",
    body: "Organizing an acoustic jam session near the amphitheatre this Saturday at 8:00 PM! 🎸🥁 Bring your guitars, ukuleles, cajons, or just your vocal cords. Playing indie pop, Bollywood retro, and Coldplay. Open to all colleges in the city! Drop a comment if you're coming. #CampusJam #AcousticNights",
    isAnonymous: false,
    upvotesCount: 115,
    hoursAgo: 15,
    comments: [
      { text: "Count me in! Bringing a djembe and acoustic bass 🎶", upvotes: 27 },
      { text: "Will there be late night chai after the jam?", upvotes: 19 },
      { text: "Can't wait, amphitheatre acoustics at night are dreamy ✨", upvotes: 14 },
    ],
  },
];

async function seedViralConfessions() {
  console.log("🌱 Starting GenZ Viral Confessions & Feeds Seeder...");

  const dbUrl = requireDatabaseUrl();
  const client = postgres(dbUrl, { max: 1 });
  const db = drizzle(client);

  try {
    // 1. Fetch Indian institutions
    const allInstitutions = await db.select().from(institutions).limit(50);
    if (allInstitutions.length === 0) {
      console.error("❌ No institutions found in database! Please seed institutions first.");
      return;
    }

    // Prioritize BIT Mesra or premier campus hubs
    const bitMesra = allInstitutions.find((i) =>
      i.slug?.includes("bit") || i.name?.toLowerCase().includes("birla") || i.name?.toLowerCase().includes("technology")
    ) || allInstitutions[0];

    // 2. Fetch existing profiles to act as authors/commenters
    const allProfiles = await db.select().from(userProfiles).limit(100);
    if (allProfiles.length === 0) {
      console.error("❌ No user profiles found! Please ensure profiles exist.");
      return;
    }

    console.log(`🏫 Primary campus hub: ${bitMesra.name} (${bitMesra.slug})`);
    console.log(`👥 Found ${allProfiles.length} active student profiles for seeding.`);

    let insertedPostsCount = 0;
    let insertedCommentsCount = 0;
    let insertedVotesCount = 0;

    for (const item of VIRAL_CONFESSIONS_AND_POSTS) {
      const author = allProfiles[Math.floor(Math.random() * allProfiles.length)];
      const targetInst = item.scope === "CAMPUS" ? bitMesra : allInstitutions[Math.floor(Math.random() * allInstitutions.length)];

      const postCreatedAt = new Date(Date.now() - item.hoursAgo * 60 * 60 * 1000);
      const postId = crypto.randomUUID();

      // Create post with explicit ID
      await db
        .insert(posts)
        .values({
          id: postId,
          authorId: author.id,
          pseudonym: item.isAnonymous ? "Secret Student" : null,
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

      // If Poll: insert poll options and simulated votes
      if (item.type === "POLL" && item.pollChoices && item.pollChoices.length > 0) {
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

        // Simulate poll votes from profiles
        const voterProfiles = allProfiles.slice(0, Math.min(30, allProfiles.length));
        for (const voter of voterProfiles) {
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

      // Insert Upvotes to drive Spicy & Viral algorithmic rank
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

        insertedVotesCount++;
      }

      // Insert Comments
      for (const c of item.comments) {
        const commentAuthor = allProfiles[Math.floor(Math.random() * allProfiles.length)];
        const commentCreatedAt = new Date(postCreatedAt.getTime() + Math.random() * 2 * 60 * 60 * 1000);
        const commentId = crypto.randomUUID();

        await db
          .insert(comments)
          .values({
            id: commentId,
            postId: postId,
            authorId: commentAuthor.id,
            body: c.text,
            isAnonymous: c.isAnon ?? false,
            createdAt: commentCreatedAt,
            updatedAt: commentCreatedAt,
          });

        insertedCommentsCount++;
      }
    }

    console.log("==========================================");
    console.log("🎉 Seeding Complete!");
    console.log(`✅ ${insertedPostsCount} viral confessions & discussions inserted.`);
    console.log(`💬 ${insertedCommentsCount} authentic peer comments inserted.`);
    console.log(`🔥 ${insertedVotesCount} upvotes simulated for ranking algorithms.`);
    console.log("==========================================");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    await client.end();
  }
}

seedViralConfessions();
