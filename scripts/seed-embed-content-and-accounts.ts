/**
 * Seed Student Accounts with Rich Link & Music Embeds (9GAG, Spotify, SoundCloud, Apple Music, CodePen, YouTube)
 *
 * Run: bun run scripts/seed-embed-content-and-accounts.ts
 */

import { and, eq, ilike } from "drizzle-orm";
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

interface StudentAccountDef {
  username: string;
  displayName: string;
  avatarUrl: string;
  branch: string;
  year: number;
  bio: string;
  gender: "MALE" | "FEMALE";
  collegeKeyword: string;
  interests: string[];
  points: number;
}

const SEED_STUDENT_ACCOUNTS: StudentAccountDef[] = [
  {
    username: "aarav_beats",
    displayName: "Aarav Sharma",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&fit=crop&q=80",
    branch: "Computer Science & Engineering",
    year: 3,
    bio: "Music producer & late-night coder · Making lo-fi & synth beats · SoundCloud creator",
    gender: "MALE",
    collegeKeyword: "bits",
    interests: ["Music Production", "SoundCloud", "Synthesizers", "Lofi"],
    points: 480,
  },
  {
    username: "priya_music",
    displayName: "Priya Menon",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&fit=crop&q=80",
    branch: "Electrical Engineering",
    year: 4,
    bio: "Spotify playlist curator & audiophile · Late night library grind survivor",
    gender: "FEMALE",
    collegeKeyword: "bombay",
    interests: ["Spotify", "Indie Music", "Acoustics", "Podcasts"],
    points: 620,
  },
  {
    username: "rohit_9gag",
    displayName: "Rohit Verma",
    avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&fit=crop&q=80",
    branch: "Mechanical Engineering",
    year: 2,
    bio: "Chief Meme Officer · 9GAG enthusiast since 2018 · Translating engineering pain into humor",
    gender: "MALE",
    collegeKeyword: "delhi",
    interests: ["9GAG", "Memes", "Hostel Lore", "Gaming"],
    points: 390,
  },
  {
    username: "ananya_lofi",
    displayName: "Ananya Sen",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fit=crop&q=80",
    branch: "Psychology & Media",
    year: 2,
    bio: "Bedroom pop singer & acoustic guitarist · Dropping SoundCloud demos · Espresso addict",
    gender: "FEMALE",
    collegeKeyword: "xavier",
    interests: ["SoundCloud", "Guitar", "Indie Pop", "Songwriting"],
    points: 340,
  },
  {
    username: "dev_aryan",
    displayName: "Aryan Rastogi",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fit=crop&q=80",
    branch: "Computer Science",
    year: 3,
    bio: "Frontend craftsman · CodePen experimenter · Building interactive 3D WebGL experiences",
    gender: "MALE",
    collegeKeyword: "hyderabad",
    interests: ["CodePen", "WebDev", "ThreeJS", "Creative Coding"],
    points: 540,
  },
  {
    username: "kabir_audio",
    displayName: "Kabir Kapoor",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&fit=crop&q=80",
    branch: "Media & Literature",
    year: 3,
    bio: "Lossless audio nerd · Apple Music curator · Host of the late-night campus podcast",
    gender: "MALE",
    collegeKeyword: "ashoka",
    interests: ["Apple Music", "Podcasting", "Vinyl", "Hi-Fi Audio"],
    points: 410,
  },
  {
    username: "sneha_memes",
    displayName: "Sneha Iyer",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&fit=crop&q=80",
    branch: "Economics & Finance",
    year: 3,
    bio: "Surviving midsems with iced americanos & viral 9GAG memes · Exam week survivor",
    gender: "FEMALE",
    collegeKeyword: "bits",
    interests: ["9GAG", "Satire", "Memes", "Campus Life"],
    points: 360,
  },
  {
    username: "vikram_vibes",
    displayName: "Vikram Joshi",
    avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&fit=crop&q=80",
    branch: "Biotechnology",
    year: 4,
    bio: "Campus festival DJ & EDM enthusiast · Curating festival mixes on SoundCloud",
    gender: "MALE",
    collegeKeyword: "manipal",
    interests: ["SoundCloud", "EDM", "DJing", "Festivals"],
    points: 470,
  },
  {
    username: "meera_acoustic",
    displayName: "Meera Patel",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&fit=crop&q=80",
    branch: "Design & UX",
    year: 2,
    bio: "Music on Spotify all day · Visual designer & UI tinkerer",
    gender: "FEMALE",
    collegeKeyword: "iit",
    interests: ["Spotify", "UI Design", "Music", "Aesthetics"],
    points: 390,
  },
];

interface SeedPostDef {
  authorUsername: string;
  title: string;
  body: string;
  type: "NORMAL" | "MEME";
  hoursAgo: number;
  comments: { username: string; body: string; minutesAgo: number }[];
}

const SEED_EMBED_POSTS: SeedPostDef[] = [
  // 1. 9GAG Meme Post (Specific Gag)
  {
    authorUsername: "rohit_9gag",
    title: "Professor: 'This exam will be straightforward and intuitive'",
    body: `When the professor assures everyone in lecture that the question paper is straight from the slides, but question 1 already requires solving Navier-Stokes from scratch:\n\nhttps://9gag.com/gag/aeM4p25\n\nEvery single exam season without fail.\n\n#9GAG #EngineeringLife #ExamSeason #AuraMinus #HostelHumor`,
    type: "MEME",
    hoursAgo: 2,
    comments: [
      { username: "sneha_memes", body: "The accuracy of this is actually terrifying", minutesAgo: 90 },
      { username: "aarav_beats", body: "Question 1 part b: 'Prove that the universe exists'", minutesAgo: 60 },
      { username: "priya_music", body: "I am sending this directly to our batch group chat", minutesAgo: 20 },
    ],
  },
  // 2. 9GAG Meme Post (Home / Explore)
  {
    authorUsername: "sneha_memes",
    title: "10-minute study break turning into a 9GAG marathon",
    body: `If anyone needs a mental reset between all-night study sprints, the trending humor feed on 9GAG today is unmatched:\n\nhttps://9gag.com/home\n\nTake 10 minutes off, grab some chai, and decompress.\n\n#9GAG #BreakTime #HostelLife #Memes #StudyBreak`,
    type: "NORMAL",
    hoursAgo: 4,
    comments: [
      { username: "rohit_9gag", body: "The 9GAG home feed has carried my mental health through two degrees", minutesAgo: 180 },
      { username: "dev_aryan", body: "My 10 minute break became 2 hours yesterday", minutesAgo: 110 },
    ],
  },
  // 3. 9GAG Meme Post 2 (Assignment deadline)
  {
    authorUsername: "rohit_9gag",
    title: "Submitting the lab code at 11:59:58 PM",
    body: `POV: You hit upload at 11:59:58 PM and the submit button starts showing an infinite spinner:\n\nhttps://9gag.com/gag/aX81Q1y\n\nCardiac arrest level: 1000%\n\n#9GAG #LabSubmission #CampusLife #Relatable`,
    type: "MEME",
    hoursAgo: 8,
    comments: [
      { username: "dev_aryan", body: "And then it hits you with 504 Gateway Timeout", minutesAgo: 400 },
      { username: "priya_music", body: "Heart rate spiked just reading this", minutesAgo: 250 },
    ],
  },
  // 4. Spotify Study Playlist
  {
    authorUsername: "priya_music",
    title: "Late Night Deep Focus & Coding Playlist (Study Beats)",
    body: `Sharing my curated Spotify study playlist for anyone grinding through assignments, lab reports, or late-night code sprints:\n\nhttps://open.spotify.com/playlist/37i9dQZF1DX8Uebhn9wzrS\n\nMinimal vocals, crisp ambient beats, and maximum concentration.\n\n#Spotify #StudyPlaylist #CodingVibes #DeepFocus #HostelNights`,
    type: "NORMAL",
    hoursAgo: 5,
    comments: [
      { username: "dev_aryan", body: "Been looping this while finishing my react lab, 10/10", minutesAgo: 240 },
      { username: "ananya_lofi", body: "The transitions on track 4 are so smooth", minutesAgo: 150 },
    ],
  },
  // 5. Spotify Single Track
  {
    authorUsername: "meera_acoustic",
    title: "On repeat this entire semester: Midnight City vibe",
    body: `Nothing matches the hostel terrace night breeze with this track playing in your headphones:\n\nhttps://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT\n\nDrop your favorite night walk track in the comments.\n\n#Spotify #TerraceVibes #NightWalks #CampusVibes`,
    type: "NORMAL",
    hoursAgo: 9,
    comments: [
      { username: "aarav_beats", body: "Timeless synth classic, absolute masterpiece", minutesAgo: 480 },
      { username: "kabir_audio", body: "Sounds unreal on good over-ear headphones", minutesAgo: 320 },
    ],
  },
  // 6. SoundCloud Lofi & Beats
  {
    authorUsername: "aarav_beats",
    title: "SoundCloud Essentials: Spring Lofi Beats for Crunch Week",
    body: `Tuned into this SoundCloud set while building my compiler design project. Pure chillhop vibes from start to finish:\n\nhttps://soundcloud.com/chillhopdotcom/chillhop-essentials-spring-2024\n\nSoundCloud always has the deepest crate-dug gems.\n\n#SoundCloud #Chillhop #BeatsToStudyTo #MusicProduction #HostelChronicles`,
    type: "NORMAL",
    hoursAgo: 6,
    comments: [
      { username: "ananya_lofi", body: "SoundCloud community remains undefeated for discovering underground beats", minutesAgo: 300 },
      { username: "vikram_vibes", body: "Added to my evening warmup set!", minutesAgo: 190 },
    ],
  },
  // 7. SoundCloud Bedroom Demo
  {
    authorUsername: "ananya_lofi",
    title: "Acoustic late night hostel jam session",
    body: `Recorded some acoustic chords and ambient room reverb last night in the hostel wing:\n\nhttps://soundcloud.com/chilledcow/beats-to-relax-study-to\n\nHope this brings some peace before tomorrow's 8 AM attendance drill.\n\n#SoundCloud #Acoustic #CampusVibes #LateNightHostel`,
    type: "NORMAL",
    hoursAgo: 11,
    comments: [
      { username: "priya_music", body: "So soothing Ananya! Your tone is beautiful", minutesAgo: 550 },
      { username: "aarav_beats", body: "Let's collab on an electronic rework of this next week", minutesAgo: 400 },
    ],
  },
  // 8. Apple Music Spatial Audio Track
  {
    authorUsername: "kabir_audio",
    title: "Apple Music Lossless & Dolby Atmos Masterpiece",
    body: `If you have AirPods Pro or IEMs, listen to this album in Apple Music with Spatial Audio turned on. The separation in the synths and drum stems is unreal:\n\nhttps://music.apple.com/us/album/starboy/1440871441\n\n#AppleMusic #LosslessAudio #DolbyAtmos #HiFiSound`,
    type: "NORMAL",
    hoursAgo: 7,
    comments: [
      { username: "priya_music", body: "The production on the title track is immaculate", minutesAgo: 350 },
      { username: "aarav_beats", body: "Daft Punk's mixing on this is legendary", minutesAgo: 210 },
    ],
  },
  // 9. CodePen Interactive Experiment
  {
    authorUsername: "dev_aryan",
    title: "Interactive WebGL Particle Sphere built for Tech Fest",
    body: `Built this interactive 3D particle demo in pure WebGL/Three.js for our college tech fest website showcase. Click and drag inside the embed below to distort the particle field:\n\nhttps://codepen.io/shaswatraj/pen/vYNOwRP\n\nLet me know what you think of the spring physics!\n\n#CodePen #CreativeCoding #WebGL #TechFest #Frontend`,
    type: "NORMAL",
    hoursAgo: 10,
    comments: [
      { username: "aarav_beats", body: "Dude the interactive dragging is so smooth! What library did you use?", minutesAgo: 500 },
      { username: "sneha_memes", body: "I just spent 10 minutes spinning this instead of studying macroeconomics", minutesAgo: 380 },
    ],
  },
  // 10. YouTube Tech Talk / Hackathon
  {
    authorUsername: "dev_aryan",
    title: "Essential Watch: High-Scale Distributed Systems Architecture",
    body: `Every CSE and engineering student prepping for system design interviews needs to bookmark this breakdown:\n\nhttps://www.youtube.com/watch?v=dQw4w9WgXcQ\n\nBreaks down consensus, raft protocol, and event-driven backends cleanly.\n\n#YouTube #SystemDesign #TechTalks #ComputerScience #InterviewPrep`,
    type: "NORMAL",
    hoursAgo: 12,
    comments: [
      { username: "rohit_9gag", body: "Did I just get rickrolled in 4K resolution? 😂", minutesAgo: 600 },
      { username: "sneha_memes", body: "Classic Aryan behavior lmao", minutesAgo: 520 },
    ],
  },
];

async function main() {
  const databaseUrl = requireDatabaseUrl();
  const sqlClient = postgres(databaseUrl, { max: 5 });
  const db = drizzle(sqlClient);

  console.log("🚀 Starting Embed & Student Accounts Seeder...");

  // 1. Fetch available institutions
  const allInsts = await db.select().from(institutions).limit(50);
  if (allInsts.length === 0) {
    throw new Error("No institutions found in database. Seed institutions first.");
  }
  const defaultInst = allInsts[0];
  console.log(`✓ Loaded ${allInsts.length} institutions. Default: ${defaultInst.name}`);

  // Helper to pick college by keyword
  function getCollegeForKeyword(kw: string) {
    const match = allInsts.find(
      (inst) =>
        inst.name.toLowerCase().includes(kw.toLowerCase()) ||
        inst.slug?.toLowerCase().includes(kw.toLowerCase())
    );
    return match || defaultInst;
  }

  // 2. Create or verify student accounts
  const createdProfiles = new Map<string, typeof userProfiles.$inferSelect>();

  for (const acc of SEED_STUDENT_ACCOUNTS) {
    const inst = getCollegeForKeyword(acc.collegeKeyword);
    const userId = `seed_student_${acc.username}`;

    const [existing] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.username, acc.username))
      .limit(1);

    if (existing) {
      createdProfiles.set(acc.username, existing);
      console.log(`👤 Profile @${acc.username} already exists.`);
      continue;
    }

    const [inserted] = await db
      .insert(userProfiles)
      .values({
        id: crypto.randomUUID(),
        userId,
        username: acc.username,
        displayName: acc.displayName,
        avatarUrl: acc.avatarUrl,
        institutionId: inst.id,
        branch: acc.branch,
        year: acc.year,
        bio: acc.bio,
        gender: acc.gender,
        interests: acc.interests,
        points: acc.points,
        onboardingCompleted: true,
        isSeeded: true,
        anonymousUsername: `anon_${acc.username.slice(0, 8)}`,
      })
      .returning();

    createdProfiles.set(acc.username, inserted);
    console.log(`✨ Created new student profile: @${acc.username} (${acc.displayName} @ ${inst.name})`);
  }

  // 3. Seed posts with embeds
  let postCount = 0;
  let commentCount = 0;

  for (const postDef of SEED_EMBED_POSTS) {
    const author = createdProfiles.get(postDef.authorUsername);
    if (!author) {
      console.warn(`Author @${postDef.authorUsername} not found, skipping.`);
      continue;
    }

    // Check if post already seeded
    const [existingPost] = await db
      .select()
      .from(posts)
      .where(and(eq(posts.authorId, author.id), eq(posts.title, postDef.title)))
      .limit(1);

    if (existingPost) {
      console.log(`⏩ Post "${postDef.title}" already seeded.`);
      continue;
    }

    const postCreatedAt = new Date(Date.now() - postDef.hoursAgo * 60 * 60 * 1000);
    const postId = crypto.randomUUID();

    await db.insert(posts).values({
      id: postId,
      authorId: author.id,
      institutionId: author.institutionId,
      type: postDef.type,
      scope: "GLOBAL",
      title: postDef.title,
      body: postDef.body,
      isAnonymous: false,
      status: "PUBLISHED",
      isSeeded: true,
      createdAt: postCreatedAt,
      updatedAt: postCreatedAt,
    });
    postCount++;

    // Add upvotes
    const upvoterUsernames = ["aarav_beats", "priya_music", "rohit_9gag", "sneha_memes", "dev_aryan", "ananya_lofi"]
      .filter((u) => u !== postDef.authorUsername)
      .slice(0, 4);

    for (const u of upvoterUsernames) {
      const voter = createdProfiles.get(u);
      if (voter) {
        await db.insert(votes).values({
          id: crypto.randomUUID(),
          userId: voter.id,
          postId,
          value: 1,
          createdAt: postCreatedAt,
        }).catch(() => {});
      }
    }

    // Add threaded comments
    for (const c of postDef.comments) {
      const commenter = createdProfiles.get(c.username);
      if (!commenter) continue;

      const commentCreatedAt = new Date(Date.now() - c.minutesAgo * 60 * 1000);
      await db.insert(comments).values({
        id: crypto.randomUUID(),
        postId,
        authorId: commenter.id,
        body: c.body,
        isAnonymous: false,
        createdAt: commentCreatedAt,
        updatedAt: commentCreatedAt,
      });
      commentCount++;
    }

    console.log(`📝 Seeded post: "${postDef.title}" with ${postDef.comments.length} comments`);
  }

  console.log(`\n🎉 Done! Seeded ${postCount} embed posts and ${commentCount} comments across ${createdProfiles.size} student accounts.`);
  await sqlClient.end();
}

main().catch((err) => {
  console.error("❌ Seeder failed:", err);
  process.exit(1);
});
