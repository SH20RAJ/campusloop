import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { randomUUID } from "node:crypto";
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

function requireDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.DB_URL;
  if (!databaseUrl) {
    throw new Error("Missing DATABASE_URL.");
  }
  return databaseUrl;
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

  console.log("Seeding institutions...");
  const collegesList = [
    { id: "inst_iitb", name: "Indian Institute of Technology, Bombay", slug: "iit-bombay", aisheCode: "IITB", websiteDomain: "iitb.ac.in" },
    { id: "inst_nitt", name: "National Institute of Technology, Trichy", slug: "nit-trichy", aisheCode: "NITT", websiteDomain: "nitt.edu" },
    { id: "inst_iiitd", name: "Indraprastha Institute of Information Technology, Delhi", slug: "iiit-delhi", aisheCode: "IIITD", websiteDomain: "iiitd.ac.in" },
    { id: "inst_bits", name: "Birla Institute of Technology and Science, Pilani", slug: "bits-pilani", aisheCode: "BITS", websiteDomain: "bits-pilani.ac.in" },
    { id: "inst_lpu", name: "Lovely Professional University", slug: "lpu", aisheCode: "LPU", websiteDomain: "lpu.in" }
  ];

  for (const inst of collegesList) {
    await db.insert(institutions).values({
      id: inst.id,
      name: inst.name,
      slug: inst.slug,
      aisheCode: inst.aisheCode,
      websiteDomain: inst.websiteDomain,
      country: "India",
      source: "colleges_seed",
    });

    await db.insert(institutionDomains).values({
      id: `domain_${inst.aisheCode.toLowerCase()}`,
      institutionId: inst.id,
      domain: inst.websiteDomain,
      domainType: "EMAIL",
      verificationStatus: "ADMIN_VERIFIED",
    });
  }

  console.log("Seeding user profiles...");
  // Aarav Sharma is the main test user (seed first, we can map him to a known Hexclave ID or let him auto-onboard.
  // We'll create profiles with random userIds so we can see them.
  const profileList = [
    { id: "prof_aarav", displayName: "Aarav Sharma", username: "aarav_sharma", bio: "Web Developer & Biryani enthusiast. Let's code!", college: "inst_iitb" },
    { id: "prof_sneha", displayName: "Sneha Patel", username: "sneha_patel", bio: "IIT Bombay CSE. Coffee and UI design is my life.", college: "inst_iitb" },
    { id: "prof_rohan", displayName: "Rohan Verma", username: "rohan_verma", bio: "Machine Learning geek. Gym & Anime lover.", college: "inst_iitb" },
    { id: "prof_ananya", displayName: "Ananya Iyer", username: "ananya_iyer", bio: "Electrical Engineering. Looking for someone to study with.", college: "inst_iitb" },
    { id: "prof_vikram", displayName: "Vikram Singh", username: "vikram_singh", bio: "Aerospace major. Space is cool, match with me!", college: "inst_iitb" },
    { id: "prof_kabir", displayName: "Kabir Malhotra", username: "kabir_m", bio: "IITB '27. Musician. Jamming is my therapy.", college: "inst_iitb" },
    { id: "prof_aditi", displayName: "Aditi Rao", username: "aditi_rao", bio: "Design student. Pixel perfect layouts make me happy.", college: "inst_iitb" },
    { id: "prof_priya", displayName: "Priya Sharma", username: "priya_sharma", bio: "Chemistry major. Let's discover some elements.", college: "inst_iitb" },
    { id: "prof_rahul", displayName: "Rahul Nair", username: "rahul_nair", bio: "NIT Trichy ECE. Embedded systems nerd.", college: "inst_nitt" },
    { id: "prof_meera", displayName: "Meera Sen", username: "meera_sen", bio: "IIIT Delhi. Cybersecurity enthusiast.", college: "inst_iiitd" }
  ];

  for (const prof of profileList) {
    await db.insert(userProfiles).values({
      id: prof.id,
      userId: randomUUID(), // Random UUID for seed profiles
      displayName: prof.displayName,
      username: prof.username,
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${prof.username}`,
      institutionId: prof.college,
      bio: prof.bio,
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
    institutionId: "inst_iitb",
    body: "Anyone else preparing for the upcoming ICPC regionals? Let's team up! Looking for a dynamic DP/Graph specialist.",
    type: "NORMAL",
    status: "PUBLISHED",
  }).returning();

  // Post 2: Confession
  const [post2] = await db.insert(posts).values({
    id: "post_2",
    authorId: "prof_sneha",
    institutionId: "inst_iitb",
    body: "Confession: I've had a huge crush on the lead guitarist of the college rock band since the cultural fest. Should I talk to him?",
    type: "CONFESSION",
    isAnonymous: true,
    status: "PUBLISHED",
  }).returning();

  // Post 3: Poll
  const [post3] = await db.insert(posts).values({
    id: "post_3",
    authorId: "prof_rohan",
    institutionId: "inst_iitb",
    body: "What is your go-to framework for Web Development in 2026? Vote below!",
    type: "POLL",
    status: "PUBLISHED",
  }).returning();

  // Post 4: Question
  const [post4] = await db.insert(posts).values({
    id: "post_4",
    authorId: "prof_ananya",
    institutionId: "inst_iitb",
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
  // Comments on Post 1
  await db.insert(comments).values([
    { postId: "post_1", authorId: "prof_rohan", body: "I'm interested! I specialize in segment trees and advanced graph algorithms.", status: "PUBLISHED" },
    { postId: "post_1", authorId: "prof_aarav", body: "Awesome Rohan, let's meet up at the library tomorrow evening.", status: "PUBLISHED" }
  ]);

  // Comments on Post 2
  await db.insert(comments).values([
    { postId: "post_2", authorId: "prof_kabir", body: "Wait, is this about me? Haha just kidding, go shoot your shot!", status: "PUBLISHED" },
    { postId: "post_2", authorId: "prof_ananya", body: "Definitely shoot your shot! Life is too short.", status: "PUBLISHED" }
  ]);

  // Post votes (upvotes)
  await db.insert(votes).values([
    { postId: "post_1", userId: "prof_sneha", value: 1 },
    { postId: "post_1", userId: "prof_rohan", value: 1 },
    { postId: "post_2", userId: "prof_aarav", value: 1 },
    { postId: "post_2", userId: "prof_aditi", value: 1 },
    { postId: "post_3", userId: "prof_ananya", value: 1 },
  ]);

  console.log("Seeding direct messages (DMs)...");
  // DM Conversation between Aarav and Sneha
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
  // Seed a swipe to trigger a match later
  await db.insert(swipes).values([
    { swiperId: "prof_sneha", targetId: "prof_aarav", direction: "LIKE" },
    { swiperId: "prof_rohan", targetId: "prof_aarav", direction: "PASS" },
  ]);

  await client.end();
  console.log("Database seeded successfully!");
}

main().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
