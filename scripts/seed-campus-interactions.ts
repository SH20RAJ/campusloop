/**
 * Campus Interactions & Student Seeder
 * Fetches all colleges from the database and seeds realistic verified students,
 * posts (Confessions, Questions, Polls, Discussions), comments, votes, and birthdays.
 *
 * Run: bun run scripts/seed-campus-interactions.ts
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  institutions,
  userProfiles,
  posts,
  comments,
  votes,
  pollOptions,
  pollVotes,
} from "../src/db/schema";
import { loadLocalEnv } from "../src/lib/load-env";

loadLocalEnv();

function requireDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL ?? process.env.DB_URL;
  if (!databaseUrl) throw new Error("Missing DATABASE_URL.");
  return databaseUrl;
}

const FIRST_NAMES_M = [
  "Aarav", "Aditya", "Arjun", "Rohan", "Vivaan", "Kabir", "Ishaan", "Reyansh", "Aniket", "Dev",
  "Kunal", "Nikhil", "Pranav", "Sahil", "Varun", "Yash", "Ayush", "Harsh", "Gaurav", "Siddharth"
];

const FIRST_NAMES_F = [
  "Ananya", "Diya", "Isha", "Kavya", "Meera", "Pooja", "Riya", "Sneha", "Tanvi", "Tara",
  "Aditi", "Avani", "Ishita", "Khushi", "Nandini", "Palak", "Radhika", "Saanvi", "Siya", "Zoya"
];

const LAST_NAMES = [
  "Sharma", "Verma", "Patel", "Reddy", "Nair", "Iyer", "Kapoor", "Malhotra", "Singh", "Gupta",
  "Mehta", "Joshi", "Desai", "Rao", "Das", "Bose", "Chopra", "Khanna", "Pillai", "Menon",
  "Agarwal", "Bhatia", "Bhatt", "Choudhury", "Dubey", "Ghosh", "Goyal", "Jain", "Kaur", "Mishra"
];

const COURSES = [
  { course: "B.Tech", branch: "Computer Science & Engineering" },
  { course: "B.Tech", branch: "Electronics & Communication" },
  { course: "B.Tech", branch: "AI & Data Science" },
  { course: "B.Tech", branch: "Mechanical Engineering" },
  { course: "B.Tech", branch: "Electrical Engineering" },
  { course: "MBA", branch: "Finance & Marketing" },
  { course: "MCA", branch: "Computer Applications" },
  { course: "B.Arch", branch: "Architecture" },
  { course: "B.Sc", branch: "Physics" },
  { course: "BBA", branch: "Business Administration" },
];

const INTEREST_POOLS = [
  ["Tech & Coding", "Startups & AI", "Late Night Tea", "Gaming"],
  ["Hostel Life", "Music & Jamming", "Cinema & TV", "Memes & Banter"],
  ["Sports & Fitness", "Exam Prep", "Campus Dating", "Photography"],
  ["Tech & Coding", "Hostel Life", "Exam Prep", "Late Night Tea"],
  ["Campus Dating", "Music & Jamming", "Startups & AI", "Sports & Fitness"],
];

const CAMPUS_POST_TEMPLATES = [
  {
    type: "NORMAL" as const,
    scope: "CAMPUS" as const,
    body: (college: string) => `Does anyone have notes or question banks for the upcoming end-sems? Looking for solid reference material for 3rd semester subjects. #CampusHelp #${college.replace(/[^a-zA-Z]/g, "")}`,
  },
  {
    type: "CONFESSION" as const,
    scope: "CAMPUS" as const,
    body: () => `Confession: I spent 4 hours in the central library pretending to study when I was actually just making Spotify playlists. No regrets. #Confession #HostelLife`,
    isAnonymous: true,
  },
  {
    type: "QUESTION" as const,
    scope: "CAMPUS" as const,
    body: () => `What is the best food spot right outside the campus gate for late night parathas and chai? Drop your favorite recommendations below! #HostelLife`,
  },
  {
    type: "NORMAL" as const,
    scope: "GLOBAL" as const,
    body: (college: string) => `Hackathon season is on! Anyone from ${college} or nearby colleges interested in teaming up for building AI agents and web apps? DM me! #Startups #Tech`,
  },
  {
    type: "CONFESSION" as const,
    scope: "CAMPUS" as const,
    body: () => `Saw someone reading my favorite sci-fi book in the canteen today and wanted to say hi, but social anxiety won. If you're reading this, great taste in books! #Confession`,
    isAnonymous: true,
  },
  {
    type: "POLL" as const,
    scope: "CAMPUS" as const,
    body: () => `Which is the most essential part of surviving campus life?`,
    options: ["Late Night Chai & Maggi", "Proxy Attendance", "Last-Night Exam Study", "Weekend Gaming"],
  },
];

const COMMENT_TEMPLATES = [
  "100% agreed with this! 🔥",
  "Sent you a DM with the drive link and notes.",
  "That chai shop near the back gate is unmatched, try their ginger tea.",
  "Literally me during every exam week 😂",
  "Count me in! What tech stack are you planning?",
  "This is too relatable haha.",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  const databaseUrl = requireDatabaseUrl();
  console.log("Connecting to database for campus interaction seeding...");
  const client = postgres(databaseUrl, { max: 10, idle_timeout: 20 });
  const db = drizzle(client);

  const allInstitutions = await db.select().from(institutions);
  console.log(`Found ${allInstitutions.length} institutions in database.`);

  if (allInstitutions.length === 0) {
    console.error("No colleges found! Run bun run db:seed first.");
    await client.end();
    return;
  }

  let totalUsersCreated = 0;
  let totalPostsCreated = 0;
  let totalCommentsCreated = 0;

  // Process colleges in batches
  for (let cIdx = 0; cIdx < allInstitutions.length; cIdx++) {
    const inst = allInstitutions[cIdx];

    // Generate 3-6 students per college
    const studentCount = randomBetween(3, 6);
    const newStudents: (typeof userProfiles.$inferInsert)[] = [];

    for (let sIdx = 0; sIdx < studentCount; sIdx++) {
      const isFemale = Math.random() < 0.5;
      const firstName = isFemale ? pickRandom(FIRST_NAMES_F) : pickRandom(FIRST_NAMES_M);
      const lastName = pickRandom(LAST_NAMES);
      const displayName = `${firstName} ${lastName}`;
      const uniqueSuffix = randomBetween(10, 999);
      const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${uniqueSuffix}`;
      const academic = pickRandom(COURSES);
      const year = randomBetween(1, 4);
      const birthYear = 2002 + (4 - year);
      const birthMonth = String(randomBetween(1, 12)).padStart(2, "0");
      const birthDay = String(randomBetween(1, 28)).padStart(2, "0");
      const dob = `${birthYear}-${birthMonth}-${birthDay}`;
      const isDobPrivate = Math.random() < 0.15; // 15% private
      const interests = pickRandom(INTEREST_POOLS);
      const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(username)}`;

      newStudents.push({
        id: `seed_user_${inst.id.slice(0, 8)}_${sIdx}_${Date.now() % 100000}`,
        userId: `seed_auth_${inst.id.slice(0, 8)}_${sIdx}_${Date.now() % 100000}`,
        username,
        displayName,
        officialName: displayName,
        avatarUrl,
        gender: isFemale ? "FEMALE" : "MALE",
        dob,
        isDobPrivate,
        course: academic.course,
        branch: academic.branch,
        year,
        bio: `${academic.course} student at ${inst.name}. Building projects, campus vibes & good coffee.`,
        interests,
        institutionId: inst.id,
        onboardingCompleted: true,
        role: "STUDENT",
        status: "ACTIVE",
        points: randomBetween(20, 250),
      });
    }

    const insertedUsers = await db.insert(userProfiles).values(newStudents).onConflictDoNothing().returning();
    totalUsersCreated += insertedUsers.length;

    if (insertedUsers.length === 0) continue;

    // Create 2-4 authentic posts for this college
    const postCount = randomBetween(2, 4);
    for (let pIdx = 0; pIdx < postCount; pIdx++) {
      const author = pickRandom(insertedUsers);
      const template = pickRandom(CAMPUS_POST_TEMPLATES);
      const bodyText = template.body(inst.name);
      const postId = `seed_post_${inst.id.slice(0, 8)}_${pIdx}_${Date.now() % 100000}`;
      const postCreatedAt = new Date(Date.now() - randomBetween(1, 72) * 3600 * 1000);

      const [newPost] = await db
        .insert(posts)
        .values({
          id: postId,
          authorId: author.id,
          institutionId: inst.id,
          type: template.type,
          scope: template.scope,
          body: bodyText,
          isAnonymous: Boolean("isAnonymous" in template && template.isAnonymous),
          pseudonym: "isAnonymous" in template && template.isAnonymous ? "Curious Beaver" : null,
          status: "PUBLISHED",
          createdAt: postCreatedAt,
        })
        .onConflictDoNothing()
        .returning();

      if (!newPost) continue;
      totalPostsCreated++;

      // If poll, insert poll options
      if (template.type === "POLL" && "options" in template && Array.isArray(template.options)) {
        for (let oIdx = 0; oIdx < template.options.length; oIdx++) {
          const optText = template.options[oIdx];
          const [opt] = await db
            .insert(pollOptions)
            .values({
              postId: newPost.id,
              text: optText,
            })
            .returning();

          // Seed random poll votes
          if (opt && Math.random() < 0.8) {
            const voter = pickRandom(insertedUsers);
            await db
              .insert(pollVotes)
              .values({
                postId: newPost.id,
                optionId: opt.id,
                userId: voter.id,
              })
              .onConflictDoNothing();
          }
        }
      }

      // Add 1-3 comments
      const commentCount = randomBetween(1, 3);
      for (let cIdx2 = 0; cIdx2 < commentCount; cIdx2++) {
        const commenter = pickRandom(insertedUsers);
        const commentText = pickRandom(COMMENT_TEMPLATES);

        await db
          .insert(comments)
          .values({
            postId: newPost.id,
            authorId: commenter.id,
            body: commentText,
            isAnonymous: Math.random() < 0.1,
            status: "PUBLISHED",
            createdAt: new Date(postCreatedAt.getTime() + randomBetween(5, 120) * 60 * 1000),
          })
          .onConflictDoNothing();

        totalCommentsCreated++;
      }

      // Seed 2-5 upvotes
      const voteCount = randomBetween(2, 5);
      for (let v = 0; v < voteCount; v++) {
        const voter = pickRandom(insertedUsers);
        await db
          .insert(votes)
          .values({
            postId: newPost.id,
            userId: voter.id,
            value: 1,
          })
          .onConflictDoNothing();
      }
    }

    if ((cIdx + 1) % 50 === 0 || cIdx + 1 === allInstitutions.length) {
      console.log(`Progress: Processed ${cIdx + 1}/${allInstitutions.length} colleges (+${totalUsersCreated} students, +${totalPostsCreated} posts)`);
    }
  }

  console.log(`\n🎉 Seeding complete!`);
  console.log(`   Created ${totalUsersCreated} verified students with DOBs and interests.`);
  console.log(`   Created ${totalPostsCreated} campus & global posts.`);
  console.log(`   Created ${totalCommentsCreated} comments and interactions.`);

  await client.end();
}

main().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
