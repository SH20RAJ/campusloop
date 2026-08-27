import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/db/schema";
import { comments, pollOptions, posts, userProfiles, votes } from "../src/db/schema";
import { loadLocalEnv } from "../src/lib/load-env";
import { eq } from "drizzle-orm";

loadLocalEnv();

const BIT_MESRA_ID = "inst_35df75700bb23dd30311ef5f";

const MORE_BIT_POSTS = [
  {
    type: "NORMAL" as const,
    body: "Sitting at IC (Inner Canteen) with hot kulhad chai and discussing semester projects with batchmates. These evening chai breaks are going to be missed most after graduation ☕❤️ #BITMesra #LateNightTea #HostelLife",
    comments: ["IC chai at 6 PM is an emotion.", "Same here, 4th year passing out feels surreal."],
    upvotes: 45,
  },
  {
    type: "POLL" as const,
    body: "Best spot for an evening walk on BIT Mesra campus when you need to clear your head? 🌅 #BITMesra #CampusLife #HostelLife",
    options: ["BIT Lake Pathway", "Main Building Roundabout", "Sports Complex / Upper Ground", "R&D Road towards Green Forest"],
    comments: ["Lake path during sunset is unbeatable.", "Lake road with cold breeze clears all stress."],
    upvotes: 52,
  },
  {
    type: "CONFESSION" as const,
    isAnonymous: true,
    pseudonym: "Library 2nd Floor Ghost",
    body: "Confession: I pretend to study in the central library just to catch a glimpse of the architecture girl who sits across table 4 every afternoon. Her sketches are breathtaking ✨ #BITMesra #CampusConfessions #Confessions",
    comments: ["Bro drop her a compliment or use Secret Crush mode on CampusLoop!", "Architecture girls have the best aesthetics."],
    upvotes: 68,
  },
  {
    type: "NORMAL" as const,
    body: "Google & Atlassian online assessments completed today! Graphs, binary search variations, and dynamic programming on trees were common. Prep group session at Hostel 10 study hall at 9 PM tonight! 💻🚀 #BITMesra #PlacementDiaries #PlacementSeason",
    comments: ["Count me in for the evening discussion!", "Tree DP questions were slightly tricky."],
    upvotes: 59,
  },
  {
    type: "NORMAL" as const,
    body: "Endsem schedule officially released by the examination section. 6 theory papers in 9 days. Time to activate zombie sleep cycle 💀📚 #BITMesra #EndsemSurvivors #Academics",
    comments: ["6 papers in 9 days is wild.", "Coffee supplies stocked up."],
    upvotes: 73,
  },
  {
    type: "NORMAL" as const,
    body: "Bitotsav 2026 battle of bands shortlist announced! 12 college rock bands from across Eastern India competing on the main stage. Get ready for heavy riffs! 🎸🔥 #BITMesra #Bitotsav #TechFest",
    comments: ["Main stage lights and sound are top tier this year!", "Supporting Dhwani all the way."],
    upvotes: 61,
  },
  {
    type: "NORMAL" as const,
    body: "Hostel 7 mess vs Hostel 10 mess: Which one actually serves the better Sunday special lunch? Let the battle begin 🍗🥘 #BITMesra #HostelLife #CanteenWars",
    comments: ["Hostel 7 biryani is unmatched.", "H10 gulab jamun wins it."],
    upvotes: 48,
  },
  {
    type: "QUESTION" as const,
    body: "Are there any active open-source contribution groups or GSoC prep circles on campus? Would love to collaborate on Go/Rust projects! 🦀 #BITMesra #TechFest #Hackathon",
    comments: ["Check ACM BIT Mesra discord channel, active GSoC alumni there.", "DM me, building a distributed KV store."],
    upvotes: 37,
  },
  {
    type: "CONFESSION" as const,
    isAnonymous: true,
    pseudonym: "SAR Night Eater",
    body: "Confession: I have spent more money on cheese patties and Sharma Ji tea this semester than on my official semester course textbooks combined ☕💸 #BITMesra #LateNightTea #CanteenDebate",
    comments: ["A true BITian haha", "Sharma ji is getting rich off of our exam panic."],
    upvotes: 84,
  },
  {
    type: "NORMAL" as const,
    body: "Pre-placement talk for Texas Instruments analog & digital design roles tomorrow at 5 PM in the CAT Hall. Final & pre-final years make sure your resumes are verified! 🎯 #BITMesra #PlacementDiaries #PlacementSeason",
    comments: ["Analog roles have great hardware packages.", "Core EEE/ECE students don't miss this!"],
    upvotes: 53,
  },
  {
    type: "NORMAL" as const,
    body: "HackBIT 2026 registrations have officially crossed 300 teams! 36 hours of non-stop hacking, pizza, Red Bull, and mentorship from top engineers. See you at the auditorium! 🍕⚡ #BITMesra #Hackathon #TechFest",
    comments: ["Hyped for this weekend!", "Our team is ready."],
    upvotes: 65,
  },
  {
    type: "CONFESSION" as const,
    isAnonymous: true,
    pseudonym: "Late Night Coder",
    body: "Confession: Nothing beats the silence of campus at 3:30 AM when you walk back from the lab to your hostel with stars visible in the Ranchi sky. Pure peace 🌌 #BITMesra #HostelLife #CampusLife",
    comments: ["One of the biggest perks of having a 780-acre green campus.", "Mesra night sky is genuinely healing."],
    upvotes: 91,
  }
];

async function seedMore() {
  const dbUrl = process.env.DATABASE_URL ?? process.env.DB_URL;
  if (!dbUrl) throw new Error("Missing database URL");
  const sqlClient = postgres(dbUrl, { max: 1 });
  const db = drizzle(sqlClient, { schema });


  const bitProfiles = await db.query.userProfiles.findMany({
    where: eq(userProfiles.institutionId, BIT_MESRA_ID),
  });

  for (let i = 0; i < MORE_BIT_POSTS.length; i++) {
    const item = MORE_BIT_POSTS[i];
    const author = bitProfiles[i % bitProfiles.length];

    const [p] = await db.insert(posts).values({
      authorId: author.id,
      institutionId: BIT_MESRA_ID,
      type: item.type,
      body: item.body,
      isAnonymous: item.isAnonymous ?? false,
      pseudonym: item.pseudonym ?? null,
      status: "PUBLISHED",
      createdAt: new Date(Date.now() - (i * 2 + 1) * 3600 * 1000),
    }).returning();

    if (item.type === "POLL" && item.options) {
      for (const opt of item.options) {
        await db.insert(pollOptions).values({
          postId: p.id,
          text: opt,
        });
      }
    }

    for (let c = 0; c < item.comments.length; c++) {
      const cAuthor = bitProfiles[(i + c + 1) % bitProfiles.length];
      await db.insert(comments).values({
        postId: p.id,
        authorId: cAuthor.id,
        body: item.comments[c],
        isAnonymous: false,
        createdAt: new Date(p.createdAt.getTime() + (c + 1) * 300 * 1000),
      });
    }

    const upvoters = bitProfiles.slice(0, Math.min(item.upvotes, bitProfiles.length));
    for (const u of upvoters) {
      try {
        await db.insert(votes).values({
          postId: p.id,
          userId: u.id,
          value: 1,
        });
      } catch {}
    }
  }

  console.log(`✅ Seeded ${MORE_BIT_POSTS.length} additional rich posts!`);
  await sqlClient.end();
}

seedMore().catch(console.error);
