import { getDb } from "../src/db";
import { userProfiles, institutions, posts } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { loadLocalEnv } from "../src/lib/load-env";

loadLocalEnv();

async function seedAcademics() {
  console.log("🌱 Seeding academic branches & student profiles (including @simran_pillai2897)...");
  const db = getDb();

  // Find or pick a default college
  let sampleColleges = await db.query.institutions.findMany({ limit: 5 });
  if (sampleColleges.length === 0) {
    const [createdCollege] = await db
      .insert(institutions)
      .values({
        aisheCode: "C-99999",
        name: "Indian Institute of Technology (IIT), Delhi",
        slug: "iit-delhi",
        state: "Delhi",
        district: "New Delhi",
      })
      .returning();
    sampleColleges = [createdCollege];
  }

  const primaryCollegeId = sampleColleges[0].id;
  const secondaryCollegeId = sampleColleges[1]?.id || primaryCollegeId;

  const academicProfiles = [
    {
      username: "simran_pillai2897",
      displayName: "Simran Pillai",
      gender: "FEMALE",
      course: "B.Arch",
      branch: "Architecture & Urban Planning",
      year: 4,
      bio: "Designing sustainable spaces & sketching campus skylines 🏛️📐 Coffee over sleep!",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
      photos: [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80",
      ],
      points: 480,
      institutionId: primaryCollegeId,
    },
    {
      username: "aarav_mehta_cse",
      displayName: "Aarav Mehta",
      gender: "MALE",
      course: "B.Tech",
      branch: "Computer Science & Engineering",
      year: 3,
      bio: "Building distributed systems & LLMs 💻 ICPC Regionalist. Open for tech chats!",
      avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80",
      photos: [
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80",
      ],
      points: 620,
      institutionId: primaryCollegeId,
    },
    {
      username: "rohan_mca_dev",
      displayName: "Rohan Varma",
      gender: "MALE",
      course: "MCA",
      branch: "Master of Computer Applications (MCA)",
      year: 2,
      bio: "Full-stack developer & open-source contributor 🚀 Cloud computing enthusiast.",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80",
      photos: [
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80",
      ],
      points: 290,
      institutionId: secondaryCollegeId,
    },
    {
      username: "ananya_mba",
      displayName: "Ananya Sharma",
      gender: "FEMALE",
      course: "MBA",
      branch: "Business Administration (MBA)",
      year: 1,
      bio: "Strategy consultant in the making 📈 Case study champion & marketing nerd.",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80",
      photos: [
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80",
      ],
      points: 340,
      institutionId: secondaryCollegeId,
    },
    {
      username: "dr_priya_phd",
      displayName: "Priya Sundaram",
      gender: "FEMALE",
      course: "PhD",
      branch: "Artificial Intelligence & Data Science",
      year: 3,
      bio: "Doctoral researcher in Deep Reinforcement Learning 🤖 Exploring neuroscience + AI.",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80",
      photos: [
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80",
      ],
      points: 750,
      institutionId: primaryCollegeId,
    },
    {
      username: "kabir_mbbs",
      displayName: "Kabir Thapar",
      gender: "MALE",
      course: "MBBS",
      branch: "Medicine & Clinical Surgery (MBBS)",
      year: 4,
      bio: "Future surgeon 🩺 Surviving 24-hour hospital rotations on caffeine & determination.",
      avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&auto=format&fit=crop&q=80",
      photos: [
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&auto=format&fit=crop&q=80",
      ],
      points: 510,
      institutionId: secondaryCollegeId,
    },
  ];

  for (const prof of academicProfiles) {
    const existing = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.username, prof.username),
    });

    let profileId: string;

    if (existing) {
      profileId = existing.id;
      await db
        .update(userProfiles)
        .set({
          displayName: prof.displayName,
          course: prof.course,
          branch: prof.branch,
          year: prof.year,
          bio: prof.bio,
          avatarUrl: prof.avatarUrl,
          photos: prof.photos,
          points: prof.points,
          gender: prof.gender,
        })
        .where(eq(userProfiles.id, existing.id));
      console.log(`Updated profile @${prof.username}`);
    } else {
      const [inserted] = await db
        .insert(userProfiles)
        .values({
          userId: randomUUID(),
          username: prof.username,
          displayName: prof.displayName,
          officialName: prof.displayName,
          gender: prof.gender,
          course: prof.course,
          branch: prof.branch,
          year: prof.year,
          bio: prof.bio,
          avatarUrl: prof.avatarUrl,
          photos: prof.photos,
          points: prof.points,
          institutionId: prof.institutionId,
          onboardingCompleted: true,
          role: "STUDENT",
          status: "ACTIVE",
        })
        .returning();
      profileId = inserted.id;
      console.log(`Created profile @${prof.username}`);
    }

    // Seed a couple of posts for Simran & others
    if (prof.username === "simran_pillai2897") {
      const existingPost = await db.query.posts.findFirst({
        where: eq(posts.authorId, profileId),
      });

      if (!existingPost) {
        await db.insert(posts).values({
          authorId: profileId,
          institutionId: prof.institutionId,
          body: "Late night architectural studio jury tomorrow morning! 📐✨ Final 3D model is rendered. Who else is pulling an all-nighter in the design lab? #BArchLife #ArchitectureVibes",
          type: "NORMAL",
          status: "PUBLISHED",
        });

        await db.insert(posts).values({
          authorId: profileId,
          institutionId: prof.institutionId,
          body: "Confession: I spent 6 hours perfecting a balsa wood facade model and my professor spent 20 seconds reviewing it 🥲 #DesignPain",
          type: "CONFESSION",
          isAnonymous: true,
          status: "PUBLISHED",
        });
      }
    }
  }

  console.log("✅ Academic profiles seeded successfully!");
}

seedAcademics()
  .catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  })
  .then(() => process.exit(0));
