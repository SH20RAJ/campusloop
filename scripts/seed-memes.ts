/**
 * Seed Indian Campus Memes, Multi-Image Carousels & Inside Jokes
 * Run: bun run scripts/seed-memes.ts
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

interface SeedMemeItem {
  body: string;
  isAnonymous: boolean;
  pseudonym?: string;
  scope: "CAMPUS" | "GLOBAL";
  hoursAgo: number;
  upvotesCount: number;
  comments: { text: string; hoursAgo: number; isAnon?: boolean }[];
}

const SEED_MEMES: SeedMemeItem[] = [
  {
    body: `Popular boy in 3rd year tried to do an effortless one-hand wave while walking past the main canteen stairs...\n\nSlipped on a wet chai cup puddle, did a full 360 spin, and kicked his own shoe into the shrubbery in front of 80 freshers 💀💀\n\nAura: -10,000,000\n\n#AuraMinus #CanteenSaga #CampusLore`,
    isAnonymous: false,
    scope: "CAMPUS",
    hoursAgo: 4,
    upvotesCount: 142,
    comments: [
      { text: "Bro I WAS STANDING RIGHT THERE I'm still wheezing 😭😭😭", hoursAgo: 3 },
      { text: "The way he tried to act like he was doing parkour was the funniest part", hoursAgo: 2 },
      { text: "Aura debt will take 4 generations to repay.", hoursAgo: 1 },
    ],
  },
  {
    body: `Biometric attendance machine turned green at literally 8:29:59 PM. 1 second left before the 8:30 PM hostel gate siren blared. \n\nThe security guard looked at me like I just defused a bomb with 0.1s left on the timer 🏃‍♂️💨\n\nAura: +50,000 🏆\n\n#AuraPlus #8AMAttendance #HostelChronicles`,
    isAnonymous: false,
    scope: "CAMPUS",
    hoursAgo: 6,
    upvotesCount: 289,
    comments: [
      { text: "Olympic qualification sprint across the road fr", hoursAgo: 5 },
      { text: "Guard uncle was already holding the padlock key in his hand ready to ruin lives lol", hoursAgo: 4 },
      { text: "Bro has main character plot armor", hoursAgo: 2 },
    ],
  },
  {
    body: `Prof. Verma in today's 8:00 AM lecture:\n\n"Pay close attention to Section 4.2. This is purely for intellectual curiosity, will definitely NOT be coming in end-sems."\n\nTranslation: Question 1 (Mandatory, 25 Marks) is going to be Section 4.2 verbatim with negative marking. Study Section 4.2 like your degree depends on it.\n\n#ProfLore #ExamPanic #EndSemSurvival`,
    isAnonymous: true,
    pseudonym: "Backbencher Prime",
    scope: "CAMPUS",
    hoursAgo: 10,
    upvotesCount: 312,
    comments: [
      { text: "Every senior told me: Whatever Verma sir says won't come, is literally 70% of the paper.", hoursAgo: 8 },
      { text: "Printing Section 4.2 on a 2x3 meter poster right now.", hoursAgo: 6 },
    ],
  },
  {
    body: `Department fest tees design committee on Figma vs The final t-shirt the local screen printer handed us 2 hours before the inauguration 😭😭\n\nExpectation vs Reality photo dump:\n\n![Fest Tee Design](https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&fit=crop)\n![Printer Reality](https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&fit=crop)\n\nWe paid ₹650 each for dry-fit nylon that glows in the dark like a traffic cone 🤡\n\n#ViralTees #CampusDrip #FestCommitteeFail`,
    isAnonymous: false,
    scope: "CAMPUS",
    hoursAgo: 14,
    upvotesCount: 420,
    comments: [
      { text: "The carousel swipe killed me 💀💀 that's not navy blue that's shiny ink blue", hoursAgo: 12 },
      { text: "Every year the merch committee promises Gucci and delivers raincoat material", hoursAgo: 10 },
      { text: "Still wearing it to the 8 AM lecture tomorrow though no shame", hoursAgo: 5 },
    ],
  },
  {
    body: `Hostel 3 AM Maggi Chronicles:\n\nSlide 1: Gathering 4 people to contribute 1 packet each\nSlide 2: The illegal electric kettle humming under a blanket so the warden doesn't hear\nSlide 3: Realizing nobody has a bowl so we are eating it with an ID card ruler\n\n![Midnight Cooking Prep](https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800&fit=crop)\n![Hostel Feast](https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&fit=crop)\n\nPure hostel engineering. Best meal of the entire week.\n\n#HostelChronicles #3AMMaggi #HostelLore`,
    isAnonymous: false,
    scope: "GLOBAL",
    hoursAgo: 20,
    upvotesCount: 560,
    comments: [
      { text: "Eating Maggi with an architect scale ruler is an Indian college rite of passage 😂", hoursAgo: 18 },
      { text: "Swipe through the carousel, the kettle covered with laundry basket is peak nostalgia", hoursAgo: 14 },
      { text: "Warden reading this post right now like 👀", hoursAgo: 8 },
    ],
  },
  {
    body: `When the professor opens YouTube in the smart classroom projector and leaves the autofill search suggestions visible for 3 whole seconds...\n\nSir was searching "how to fail entire batch without re-evaluation committee notice" at 11:43 PM yesterday 💀\n\nRespectful prayers for all of us in tomorrow's quiz 🙏\n\n#ProfLore #ClassroomMoments #RespectfulMeme`,
    isAnonymous: true,
    pseudonym: "Projector Observer",
    scope: "CAMPUS",
    hoursAgo: 28,
    upvotesCount: 395,
    comments: [
      { text: "NO WAY LMAOOO did someone screenshot it??", hoursAgo: 24 },
      { text: "Sir knows we know. Now the quiz will be even harder.", hoursAgo: 20 },
    ],
  },
  {
    body: `Girls hostel gate vs Boys hostel gate security protocols:\n\nGirls Hostel:\n- Biometric scan\n- Iris recognition\n- OTP sent to parents, grandfather, and ancestral village sarpanch\n\nBoys Hostel:\n- Security guard asleep on a plastic chair\n- Stray golden retriever acting as acting hall warden\n\n#HostelLore #CampusHumor #InsideJokes`,
    isAnonymous: true,
    pseudonym: "Campus Satirist",
    scope: "GLOBAL",
    hoursAgo: 36,
    upvotesCount: 880,
    comments: [
      { text: "The dog was actually very strict about non-residents today ngl", hoursAgo: 32 },
      { text: "Accurate down to the millisecond 😂", hoursAgo: 30 },
      { text: "Swipe for the guard chair picture, bro has been asleep since 2019", hoursAgo: 22 },
    ],
  },
  {
    body: `Friend spent 45 minutes iron-pressing his viral custom fest tee, styled his hair with pomade, and sprayed half a bottle of perfume to talk to his crush in front of Nescafe...\n\nShe looked up from her phone, said "Hey, can you watch my laptop for 2 mins while I go grab my boyfriend?" and handed him her bag 😭😭😭\n\nAura: -Infinity\n\n#AuraMinus #UnmatchedAura #CanteenHeartbreak`,
    isAnonymous: false,
    scope: "CAMPUS",
    hoursAgo: 42,
    upvotesCount: 640,
    comments: [
      { text: "Bro got assigned to Laptop Security Guard duty 💀", hoursAgo: 40 },
      { text: "The perfume wasted hurts more than the heartbreak", hoursAgo: 35 },
    ],
  },
];

async function main() {
  const connectionString = requireDatabaseUrl();
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  console.log("⚡ Seeding authentic Campus Memes, Multi-Image Carousels & Inside Jokes...");

  // Fetch all profiles & institutions
  const allProfiles = await db.select().from(userProfiles).limit(30);
  const allInstitutions = await db.select().from(institutions).limit(10);

  if (allProfiles.length === 0 || allInstitutions.length === 0) {
    console.error("❌ No user profiles or institutions found. Run basic seed first.");
    await sql.end();
    return;
  }

  const primaryCollege = allInstitutions[0];
  let seededCount = 0;

  for (const meme of SEED_MEMES) {
    const author = allProfiles[Math.floor(Math.random() * allProfiles.length)];
    const targetInst = meme.scope === "CAMPUS" ? primaryCollege : allInstitutions[Math.floor(Math.random() * allInstitutions.length)];
    const postCreatedAt = new Date(Date.now() - meme.hoursAgo * 60 * 60 * 1000);
    const postId = crypto.randomUUID();

    await db.insert(posts).values({
      id: postId,
      authorId: author.id,
      pseudonym: meme.isAnonymous ? meme.pseudonym || "Campus Satirist" : null,
      institutionId: targetInst.id,
      type: "MEME",
      scope: meme.scope,
      body: meme.body,
      isAnonymous: meme.isAnonymous,
      status: "PUBLISHED",
      createdAt: postCreatedAt,
      updatedAt: postCreatedAt,
    });

    seededCount++;

    // Upvotes
    const upvoters = [...allProfiles].sort(() => 0.5 - Math.random()).slice(0, Math.min(meme.upvotesCount, allProfiles.length));
    for (const voter of upvoters) {
      await db
        .insert(votes)
        .values({
          id: crypto.randomUUID(),
          postId,
          userId: voter.id,
          value: 1,
          createdAt: new Date(postCreatedAt.getTime() + 15 * 60 * 1000),
        })
        .onConflictDoNothing();
    }

    // Comments
    for (const c of meme.comments) {
      const commenter = allProfiles[Math.floor(Math.random() * allProfiles.length)];
      const commentTime = new Date(Date.now() - c.hoursAgo * 60 * 60 * 1000);
      await db.insert(comments).values({
        id: crypto.randomUUID(),
        postId,
        authorId: commenter.id,
        body: c.text,
        isAnonymous: Boolean(c.isAnon),
        pseudonym: c.isAnon ? "Anonymous Peer" : null,
        status: "PUBLISHED",
        createdAt: commentTime,
        updatedAt: commentTime,
      });
    }
  }

  console.log(`✅ Successfully seeded ${seededCount} campus memes with votes, comments, and multi-image carousels!`);
  await sql.end();
}

main().catch((err) => {
  console.error("Error seeding memes:", err);
  process.exit(1);
});
