import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { randomUUID, createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { 
  institutions, 
  institutionDomains, 
  userProfiles, 
  posts, 
  comments, 
  votes, 
  pollOptions, 
  pollVotes,
  conversations,
  conversationParticipants,
  messages,
  swipes
} from "../src/db/schema";
import { loadLocalEnv } from "../src/lib/load-env";

loadLocalEnv();

type CollegeCsvRow = {
  Aishe_Code?: string;
  Name?: string;
  State?: string;
  District?: string;
  Website?: string;
  Year_Of_Establishment?: string;
  Location?: string;
  Slug?: string;
};

const BATCH_SIZE = 250;

function requireDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.DB_URL;
  if (!databaseUrl) {
    throw new Error("Missing DATABASE_URL.");
  }
  return databaseUrl;
}

function normalizeDomain(website?: string | null) {
  const raw = website?.trim();
  if (!raw) return null;
  return raw
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .split(/[/?#]/)[0]
    .replace(/\/+$/g, "")
    .trim()
    .toLowerCase() || null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function stableId(prefix: string, value: string) {
  const hash = createHash("sha256").update(value).digest("hex").slice(0, 24);
  return `${prefix}_${hash}`;
}

function parseYear(value?: string) {
  const year = Number.parseInt(value ?? "", 10);
  return Number.isFinite(year) ? year : null;
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function main() {
  const client = postgres(requireDatabaseUrl(), { max: 1, prepare: false });
  const db = drizzle(client);

  console.log("Cleaning database...");
  await db.delete(swipes);
  await db.delete(messages);
  await db.delete(conversationParticipants);
  await db.delete(conversations);
  await db.delete(pollVotes);
  await db.delete(pollOptions);
  await db.delete(votes);
  await db.delete(comments);
  await db.delete(posts);
  await db.delete(userProfiles);
  await db.delete(institutionDomains);
  await db.delete(institutions);

  console.log("Reading and parsing colleges.csv...");
  const csvPath = path.join(process.cwd(), "src/lib/colleges.csv");
  const csv = await readFile(csvPath, "utf8");
  const rows = parse(csv, {
    bom: true,
    columns: true,
    relax_column_count: true,
    skip_empty_lines: true,
    trim: true,
  }) as CollegeCsvRow[];

  const usedSlugs = new Set<string>();
  const institutionsToInsert: any[] = [];
  const domainsToInsert: any[] = [];

  for (const row of rows) {
    const aisheCode = row.Aishe_Code?.trim();
    const name = row.Name?.trim();

    if (!aisheCode || !name) {
      continue;
    }

    let slug = slugify(row.Slug?.trim() || name);
    if (!slug) {
      slug = stableId("college", aisheCode);
    }

    if (usedSlugs.has(slug)) {
      slug = `${slug}-${slugify(aisheCode)}`;
    }
    usedSlugs.add(slug);

    const website = row.Website?.trim() || null;
    const websiteDomain = normalizeDomain(website);
    const institutionId = stableId("inst", aisheCode);

    institutionsToInsert.push({
      id: institutionId,
      aisheCode,
      name,
      slug,
      state: row.State?.trim() || null,
      district: row.District?.trim() || null,
      website,
      websiteDomain,
      yearOfEstablishment: parseYear(row.Year_Of_Establishment),
      locationType: row.Location?.trim() || null,
      country: "India",
      source: "colleges_csv",
    });

    if (websiteDomain) {
      domainsToInsert.push({
        id: stableId("domain", websiteDomain),
        institutionId,
        domain: websiteDomain,
        domainType: "EMAIL",
        verificationStatus: "ADMIN_VERIFIED",
      });
    }
  }

  console.log(`Inserting ${institutionsToInsert.length} colleges...`);
  for (const batch of chunk(institutionsToInsert, BATCH_SIZE)) {
    await db.insert(institutions).values(batch).onConflictDoNothing();
  }

  console.log(`Inserting ${domainsToInsert.length} domains...`);
  for (const batch of chunk(domainsToInsert, BATCH_SIZE)) {
    await db.insert(institutionDomains).values(batch).onConflictDoNothing();
  }

  // Find dynamic IDs of seeded IIT Bombay and BIT Mesra
  // Note: Standard domain for IIT Bombay is usually iitb.ac.in.
  // Standard domain for BIT Mesra is bitmesra.ac.in.
  let iitb = institutionsToInsert.find(i => i.websiteDomain === "iitb.ac.in");
  let bitm = institutionsToInsert.find(i => i.websiteDomain === "bitmesra.ac.in");

  // Fallback if not found in CSV
  if (!iitb) {
    console.log("IIT Bombay domain not found in CSV, seeding fallback...");
    const fallbackId = "inst_iitb_fallback";
    await db.insert(institutions).values({
      id: fallbackId,
      aisheCode: "IITB",
      name: "Indian Institute of Technology, Bombay",
      slug: "iit-bombay",
      websiteDomain: "iitb.ac.in",
      country: "India",
      source: "seed_fallback",
    });
    await db.insert(institutionDomains).values({
      id: "domain_iitb_fallback",
      institutionId: fallbackId,
      domain: "iitb.ac.in",
      domainType: "EMAIL",
      verificationStatus: "ADMIN_VERIFIED"
    });
    iitb = { id: fallbackId };
  }

  if (!bitm) {
    console.log("BIT Mesra domain not found in CSV, seeding fallback...");
    const fallbackId = "inst_bitm_fallback";
    await db.insert(institutions).values({
      id: fallbackId,
      aisheCode: "BITM",
      name: "Birla Institute of Technology, Mesra",
      slug: "bit-mesra",
      websiteDomain: "bitmesra.ac.in",
      country: "India",
      source: "seed_fallback",
    });
    await db.insert(institutionDomains).values({
      id: "domain_bitm_fallback",
      institutionId: fallbackId,
      domain: "bitmesra.ac.in",
      domainType: "EMAIL",
      verificationStatus: "ADMIN_VERIFIED"
    });
    bitm = { id: fallbackId };
  }

  console.log("Seeding student profiles...");
  const profileList = [
    { id: "prof_aarav", displayName: "Aarav Sharma", username: "aarav_sharma", bio: "Web Developer & Biryani enthusiast. Let's code!", college: iitb.id, gender: "MALE" },
    { id: "prof_sneha", displayName: "Sneha Patel", username: "sneha_patel", bio: "IIT Bombay CSE. Coffee and UI design is my life.", college: iitb.id, gender: "FEMALE" },
    { id: "prof_rohan", displayName: "Rohan Verma", username: "rohan_verma", bio: "Machine Learning geek. Gym & Anime lover.", college: iitb.id, gender: "MALE" },
    { id: "prof_ananya", displayName: "Ananya Iyer", username: "ananya_iyer", bio: "Electrical Engineering. Looking for someone to study with.", college: iitb.id, gender: "FEMALE" },
    { id: "prof_vikram", displayName: "Vikram Singh", username: "vikram_singh", bio: "Aerospace major. Space is cool, match with me!", college: iitb.id, gender: "MALE" },
    { id: "prof_kabir", displayName: "Kabir Malhotra", username: "kabir_m", bio: "IITB '27. Musician. Jamming is my therapy.", college: iitb.id, gender: "MALE" },
    { id: "prof_aditi", displayName: "Aditi Rao", username: "aditi_rao", bio: "Design student. Pixel perfect layouts make me happy.", college: iitb.id, gender: "FEMALE" },
    { id: "prof_priya", displayName: "Priya Sharma", username: "priya_sharma", bio: "Chemistry major. Let's discover some elements.", college: iitb.id, gender: "FEMALE" },
    { id: "prof_btech_user", displayName: "BIT Student", username: "bit_student", bio: "BIT Mesra student. Tech and life.", college: bitm.id, gender: "MALE" }
  ];

  for (const prof of profileList) {
    await db.insert(userProfiles).values({
      id: prof.id,
      userId: randomUUID(),
      displayName: prof.displayName,
      username: prof.username,
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${prof.username}`,
      institutionId: prof.college,
      bio: prof.bio,
      gender: prof.gender,
      onboardingCompleted: true,
      role: "STUDENT",
      status: "ACTIVE",
    });
  }

  console.log("Seeding posts...");
  // Post 1: Normal
  const [post1] = await db.insert(posts).values({
    id: "post_1",
    authorId: "prof_aarav",
    institutionId: iitb.id,
    body: "Anyone else preparing for the upcoming ICPC regionals? Let's team up! Looking for a dynamic DP/Graph specialist.",
    type: "NORMAL",
    status: "PUBLISHED",
  }).returning();

  // Post 2: Confession
  const [post2] = await db.insert(posts).values({
    id: "post_2",
    authorId: "prof_sneha",
    institutionId: iitb.id,
    body: "Confession: I've had a huge crush on the lead guitarist of the college rock band since the cultural fest. Should I talk to him?",
    type: "CONFESSION",
    isAnonymous: true,
    status: "PUBLISHED",
  }).returning();

  // Post 3: Poll
  const [post3] = await db.insert(posts).values({
    id: "post_3",
    authorId: "prof_rohan",
    institutionId: iitb.id,
    body: "What is your go-to framework for Web Development in 2026? Vote below!",
    type: "POLL",
    status: "PUBLISHED",
  }).returning();

  // Post 4: Question
  const [post4] = await db.insert(posts).values({
    id: "post_4",
    authorId: "prof_ananya",
    institutionId: iitb.id,
    body: "Where is the best place to get late-night hot beverages inside or right outside the campus after 2 AM?",
    type: "QUESTION",
    title: "LateNightTea",
    status: "PUBLISHED",
  }).returning();

  console.log("Seeding poll options & votes...");
  const opt1 = await db.insert(pollOptions).values({ id: "opt_1", postId: "post_3", text: "Next.js (App Router)" }).returning();
  const opt2 = await db.insert(pollOptions).values({ id: "opt_2", postId: "post_3", text: "Vite + React SPA" }).returning();
  const opt3 = await db.insert(pollOptions).values({ id: "opt_3", postId: "post_3", text: "Astro" }).returning();

  // Cast poll votes
  await db.insert(pollVotes).values([
    { postId: "post_3", optionId: "opt_1", userId: "prof_sneha" },
    { postId: "post_3", optionId: "opt_1", userId: "prof_aarav" },
    { postId: "post_3", optionId: "opt_2", userId: "prof_vikram" },
    { postId: "post_3", optionId: "opt_3", userId: "prof_aditi" },
  ]);

  console.log("Seeding comments & upvotes...");
  await db.insert(comments).values([
    { postId: "post_1", authorId: "prof_rohan", body: "I'm interested! I specialize in segment trees and advanced graph algorithms.", status: "PUBLISHED" },
    { postId: "post_1", authorId: "prof_aarav", body: "Awesome Rohan, let's meet up at the library tomorrow evening.", status: "PUBLISHED" }
  ]);

  await db.insert(comments).values([
    { postId: "post_2", authorId: "prof_kabir", body: "Wait, is this about me? Haha just kidding, go shoot your shot!", status: "PUBLISHED" },
    { postId: "post_2", authorId: "prof_ananya", body: "Definitely shoot your shot! Life is too short.", status: "PUBLISHED" }
  ]);

  await db.insert(votes).values([
    { postId: "post_1", userId: "prof_sneha", value: 1 },
    { postId: "post_1", userId: "prof_rohan", value: 1 },
    { postId: "post_2", userId: "prof_aarav", value: 1 },
    { postId: "post_2", userId: "prof_aditi", value: 1 },
    { postId: "post_3", userId: "prof_ananya", value: 1 },
  ]);

  console.log("Seeding direct messages (DMs)...");
  const [conv1] = await db.insert(conversations).values({}).returning();
  await db.insert(conversationParticipants).values([
    { conversationId: conv1.id, userId: "prof_aarav" },
    { conversationId: conv1.id, userId: "prof_sneha" }
  ]);

  await db.insert(messages).values([
    { conversationId: conv1.id, senderId: "prof_aarav", body: "Hey Sneha, loved your post on UI design tips." },
    { conversationId: conv1.id, senderId: "prof_sneha", body: "Hey Aarav! Thanks, I'm glad you liked it!" },
    { conversationId: conv1.id, senderId: "prof_aarav", body: "We should collaborate on a project sometime." },
  ]);

  console.log("Seeding dating swipes...");
  await db.insert(swipes).values([
    { swiperId: "prof_sneha", targetId: "prof_aarav", direction: "LIKE" },
    { swiperId: "prof_rohan", targetId: "prof_aarav", direction: "PASS" },
  ]);

  await client.end();
  console.log("Database seeded successfully with all CSV colleges and sample data!");
}

main().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
