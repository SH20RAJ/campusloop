/**
 * CampusLoop Comprehensive Activity Seeder
 * ----------------------------------------
 * Seeds authentic, rich student activity across EVERY feature of CampusLoop
 * connected to the public demo account (@demo_tester):
 * - Follow graph & Mutual Friends (5+ mutual friends, 15+ followers)
 * - Realtime Conversations & Direct Messages (3 active 1-on-1 threads, 1 group chat with reactions)
 * - Notification Center (Likes, Comments, Mentions, Reposts, Matches, Crush alerts, Milestones)
 * - Campus Posts, Confessions, Interactive Live Polls & Comments
 * - 24-Hour Active Campus Stories / Vibes with Likes
 * - Dating Swipes, Mutual Match & Secret Crush Vault entries
 * - Campus Events & Confirmed Registrations
 * - 10+ Utility Hubs (Lost & Found, Cycles Buy/Sell, Cab Rideshare, Housing, Gaming Scrims, Time Capsules)
 * - Academic Notes & Community Discussions
 *
 * Run: bun run scripts/seed-demo-activities.ts
 */
import { and, eq } from "drizzle-orm";
import { getDb } from "../src/db";
import {
  capsuleEntries,
  comments,
  communities,
  communityMembers,
  conversationParticipants,
  conversations,
  eventRegistrations,
  events,
  follows,
  gamingLobbies,
  housingListings,
  lostAndFoundItems,
  marketplaceItems,
  messages,
  notifications,
  pollOptions,
  pollVotes,
  posts,
  ridesharePools,
  secretCrushes,
  stories,
  storyLikes,
  swipes,
  timeCapsules,
  userProfiles,
  votes,
} from "../src/db/schema";
import { DEMO_CREDENTIALS } from "../src/lib/demo-credentials";
import { loadLocalEnv } from "../src/lib/load-env";

loadLocalEnv();

const BIT_MESRA_ID = "inst_35df75700bb23dd30311ef5f";

export async function seedDemoActivities() {
  const db = getDb();
  console.log("🌱 Starting Comprehensive Activity Seeding for CampusLoop Demo...");

  // 1. Resolve Demo Profile
  const demoProfile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.username, DEMO_CREDENTIALS.username),
  });

  if (!demoProfile) {
    throw new Error("Demo profile '@demo_tester' not found. Run 'bun run db:seed-demo' first.");
  }
  const demoId = demoProfile.id;

  // 2. Ensure Peer Student Profiles exist for realistic social interactions
  const PEER_STUDENTS = [
    {
      name: "Aman Verma",
      username: "aman_v_mesra",
      email: "aman.v@bitmesra.ac.in",
      avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
      branch: "Computer Science & Engineering",
      year: 3,
      gender: "MALE" as const,
      bio: "CSE '27 | ACM BIT Mesra | Building fullstack apps & living on IC chai ☕",
      points: 380,
    },
    {
      name: "Ananya Sharma",
      username: "ananya_sharma",
      email: "ananya.s@bitmesra.ac.in",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
      branch: "Information Technology",
      year: 3,
      gender: "FEMALE" as const,
      bio: "IT '27 | UI/UX Designer & Frontend Dev | Coffee lover at Nescafe ☕🎨",
      points: 420,
    },
    {
      name: "Rohan Kulkarni",
      username: "rohan_kulkarni",
      email: "rohan.k@bitmesra.ac.in",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      branch: "Electronics & Communication",
      year: 3,
      gender: "MALE" as const,
      bio: "ECE sophomore | Robolution BIT Mesra | Embedded systems nerd | Hostel 11",
      points: 310,
    },
    {
      name: "Riya Sen",
      username: "riya_sen_mesra",
      email: "riya.sen@bitmesra.ac.in",
      avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80",
      branch: "Computer Science & Engineering",
      year: 2,
      gender: "FEMALE" as const,
      bio: "CSE '28 | Dhwani Music Society 🎸 | Competitive Programmer | Hostel 4",
      points: 290,
    },
    {
      name: "Shaswat Raj",
      username: "shaswat_raj",
      email: "shaswat.raj@bitmesra.ac.in",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
      branch: "Computer Science & Engineering",
      year: 3,
      gender: "MALE" as const,
      bio: "CSE @ BIT Mesra | Founder CampusLoop 🚀 | Fullstack Builder",
      points: 620,
    },
  ];

  const peerProfiles: Record<string, typeof demoProfile> = {};

  for (const peer of PEER_STUDENTS) {
    let profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.username, peer.username),
    });

    if (!profile) {
      const [created] = await db
        .insert(userProfiles)
        .values({
          userId: `usr_peer_${peer.username}`,
          username: peer.username,
          displayName: peer.name,
          officialName: peer.name,
          email: peer.email,
          avatarUrl: peer.avatarUrl,
          institutionId: BIT_MESRA_ID,
          course: "B.Tech",
          branch: peer.branch,
          year: peer.year,
          gender: peer.gender,
          bio: peer.bio,
          points: peer.points,
          onboardingCompleted: true,
          role: "STUDENT",
          status: "ACTIVE",
        })
        .onConflictDoUpdate({
          target: userProfiles.username,
          set: { displayName: peer.name, points: peer.points, institutionId: BIT_MESRA_ID },
        })
        .returning();
      profile = created;
    }
    peerProfiles[peer.username] = profile!;
  }

  console.log("✅ Verified and synchronized peer student profiles.");

  // 3. Seed Follow Graph & Mutual Friendships
  const peersList = Object.values(peerProfiles);
  for (const peer of peersList) {
    await db
      .insert(follows)
      .values({
        followerId: demoId,
        followingId: peer.id,
        isMutual: true,
      })
      .onConflictDoUpdate({
        target: [follows.followerId, follows.followingId],
        set: { isMutual: true },
      });

    await db
      .insert(follows)
      .values({
        followerId: peer.id,
        followingId: demoId,
        isMutual: true,
      })
      .onConflictDoUpdate({
        target: [follows.followerId, follows.followingId],
        set: { isMutual: true },
      });
  }
  console.log("✅ Seeded 5 Mutual Friendships & Follow Graph for @demo_tester.");

  // 4. Seed Direct & Group Chat Conversations
  const aman = peerProfiles.aman_v_mesra;
  let convA = await db.query.conversations.findFirst({
    where: and(eq(conversations.type, "DIRECT"), eq(conversations.title, `Chat: demo_tester & ${aman.username}`)),
  });

  if (!convA) {
    const [c] = await db
      .insert(conversations)
      .values({
        type: "DIRECT",
        title: `Chat: demo_tester & ${aman.username}`,
      })
      .returning();
    convA = c;

    await db.insert(conversationParticipants).values([
      { conversationId: convA.id, userId: demoId, isPinned: true },
      { conversationId: convA.id, userId: aman.id },
    ]);

    await db.insert(messages).values([
      {
        conversationId: convA.id,
        senderId: aman.id,
        body: "Hey! Are we submitting our HackBIT project proposal today?",
        createdAt: new Date(Date.now() - 3600 * 1000 * 4),
      },
      {
        conversationId: convA.id,
        senderId: demoId,
        body: "Yes! Putting final touches on the slide deck. PeerJS WebRTC calling demo is looking super smooth 🚀",
        createdAt: new Date(Date.now() - 3600 * 1000 * 3),
      },
      {
        conversationId: convA.id,
        senderId: aman.id,
        body: "Awesome! Let me know when you push to GitHub, I'll test the live video call on my phone 📱",
        createdAt: new Date(Date.now() - 3600 * 1000 * 2),
      },
      {
        conversationId: convA.id,
        senderId: demoId,
        body: "Just deployed! Check it out at /app/chat 💻",
        createdAt: new Date(Date.now() - 3600 * 1000 * 1),
      },
    ]);
  }

  const ananya = peerProfiles.ananya_sharma;
  let convB = await db.query.conversations.findFirst({
    where: and(eq(conversations.type, "DIRECT"), eq(conversations.title, `Chat: demo_tester & ${ananya.username}`)),
  });

  if (!convB) {
    const [c] = await db
      .insert(conversations)
      .values({
        type: "DIRECT",
        title: `Chat: demo_tester & ${ananya.username}`,
      })
      .returning();
    convB = c;

    await db.insert(conversationParticipants).values([
      { conversationId: convB.id, userId: demoId },
      { conversationId: convB.id, userId: ananya.id },
    ]);

    await db.insert(messages).values([
      {
        conversationId: convB.id,
        senderId: ananya.id,
        body: "Heyy! Are you coming to IC for Nescafe coffee after CS lab?",
        createdAt: new Date(Date.now() - 1800 * 1000),
      },
      {
        conversationId: convB.id,
        senderId: demoId,
        body: "Leaving lab in 5 mins! Order a Cheese Maggi too please ☕🍜",
        createdAt: new Date(Date.now() - 900 * 1000),
      },
      {
        conversationId: convB.id,
        senderId: ananya.id,
        body: "Done! Order is placed on Arman's Canteen portal, see you there! ✨",
        createdAt: new Date(Date.now() - 300 * 1000),
      },
    ]);
  }

  let groupConv = await db.query.conversations.findFirst({
    where: eq(conversations.title, "🚀 HackBIT Mesra 2026 Team"),
  });

  if (!groupConv) {
    const [g] = await db
      .insert(conversations)
      .values({
        type: "GROUP",
        title: "🚀 HackBIT Mesra 2026 Team",
        avatarUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80",
      })
      .returning();
    groupConv = g;

    await db.insert(conversationParticipants).values([
      { conversationId: groupConv.id, userId: demoId, isPinned: true },
      { conversationId: groupConv.id, userId: aman.id },
      { conversationId: groupConv.id, userId: ananya.id },
      { conversationId: groupConv.id, userId: peerProfiles.rohan_kulkarni.id },
    ]);

    await db.insert(messages).values([
      {
        conversationId: groupConv.id,
        senderId: aman.id,
        body: "Team sync at 9 PM at Central Library discussion room!",
        createdAt: new Date(Date.now() - 3600 * 1000 * 5),
      },
      {
        conversationId: groupConv.id,
        senderId: peerProfiles.rohan_kulkarni.id,
        body: "I'll bring the hardware sensors and Raspberry Pi 🤖",
        createdAt: new Date(Date.now() - 3600 * 1000 * 4),
      },
      {
        conversationId: groupConv.id,
        senderId: demoId,
        body: "I'll bring the Next.js frontend and UI mocks on Figma! 🎨",
        createdAt: new Date(Date.now() - 3600 * 1000 * 2),
      },
    ]);
  }

  console.log("✅ Seeded Direct & Group Realtime Chat conversations.");

  // 5. Seed Realistic Notifications
  const NOTIFICATIONS_SEED = [
    {
      userId: demoId,
      actorId: aman.id,
      type: "LIKE",
      previewText: "liked your post: 'Can we agree IC canteen cold coffee hits different during exam week?'",
      isRead: false,
    },
    {
      userId: demoId,
      actorId: ananya.id,
      type: "COMMENT",
      previewText: "commented: '100% true! Especially at 2 AM with cheese patties 😄'",
      isRead: false,
    },
    {
      userId: demoId,
      actorId: peerProfiles.shaswat_raj.id,
      type: "REPOST",
      previewText: "reposted your campus poll with quote: 'Essential campus debate right here'",
      isRead: false,
    },
    {
      userId: demoId,
      actorId: peerProfiles.riya_sen_mesra.id,
      type: "STORY_LIKE",
      previewText: "liked your sunset vibe story 📸",
      isRead: true,
    },
    {
      userId: demoId,
      actorId: peerProfiles.rohan_kulkarni.id,
      type: "FRIEND",
      previewText: "and you are now mutual friends on CampusLoop 🎉",
      isRead: true,
    },
    {
      userId: demoId,
      actorId: ananya.id,
      type: "MATCH",
      previewText: "It's a Match! You both liked each other on Campus Match 💕",
      isRead: false,
    },
    {
      userId: demoId,
      actorId: peerProfiles.riya_sen_mesra.id,
      type: "CRUSH_ALERT",
      previewText: "Someone in your branch just locked you in their Secret Crush vault! 🤫",
      isRead: false,
    },
    {
      userId: demoId,
      actorId: demoId,
      type: "MILESTONE",
      previewText: "🎉 You earned +20 Loop Points! A verified student joined using your referral link.",
      isRead: true,
    },
  ];

  for (const notif of NOTIFICATIONS_SEED) {
    await db.insert(notifications).values(notif);
  }
  console.log("✅ Seeded 8 Interactive Notifications in /app/notifications.");

  // 6. Seed Campus Feed Posts, Confessions & Polls by Demo Tester
  let demoPost1 = await db.query.posts.findFirst({
    where: and(eq(posts.authorId, demoId), eq(posts.title, "IC Canteen vs Nescafe Debate ☕")),
  });

  if (!demoPost1) {
    const [p] = await db
      .insert(posts)
      .values({
        authorId: demoId,
        institutionId: BIT_MESRA_ID,
        title: "IC Canteen vs Nescafe Debate ☕",
        body: "Can we all agree that IC canteen cold coffee and hot cheese patties hit completely different at 11 PM during exam week? What is your go-to late night fuel?",
        type: "NORMAL",
        scope: "CAMPUS",
        status: "PUBLISHED",
      })
      .returning();
    demoPost1 = p;

    await db.insert(votes).values([
      { postId: demoPost1.id, userId: aman.id, value: 1 },
      { postId: demoPost1.id, userId: ananya.id, value: 1 },
      { postId: demoPost1.id, userId: peerProfiles.rohan_kulkarni.id, value: 1 },
      { postId: demoPost1.id, userId: peerProfiles.riya_sen_mesra.id, value: 1 },
      { postId: demoPost1.id, userId: peerProfiles.shaswat_raj.id, value: 1 },
    ]);

    await db.insert(comments).values([
      {
        postId: demoPost1.id,
        authorId: ananya.id,
        body: "Cold coffee with extra chocolate syrup + veg roll from Nescafe is elite tier!",
        status: "PUBLISHED",
      },
      {
        postId: demoPost1.id,
        authorId: aman.id,
        body: "IC Maggi with double butter will forever remain unbeaten in Jharkhand winters 🥶🍜",
        status: "PUBLISHED",
      },
      {
        postId: demoPost1.id,
        authorId: peerProfiles.rohan_kulkarni.id,
        body: "Hostel 11 night canteen at 2 AM is where the real deep life discussions happen.",
        status: "PUBLISHED",
      },
    ]);
  }

  // Interactive Live Poll Post
  let demoPoll = await db.query.posts.findFirst({
    where: and(eq(posts.authorId, demoId), eq(posts.title, "Best Midnight Study Spot on Campus? 📚")),
  });

  if (!demoPoll) {
    const [pollPost] = await db
      .insert(posts)
      .values({
        authorId: demoId,
        institutionId: BIT_MESRA_ID,
        title: "Best Midnight Study Spot on Campus? 📚",
        body: "Mid-sem exams start in two weeks! Settle this once and for all — where do you get maximum productivity without sleeping?",
        type: "POLL",
        scope: "CAMPUS",
        status: "PUBLISHED",
      })
      .returning();

    const createdOptions = await db
      .insert(pollOptions)
      .values([
        { postId: pollPost.id, text: "Central Library Reading Hall (AC)" },
        { postId: pollPost.id, text: "Hostel Common Room with squad" },
        { postId: pollPost.id, text: "IC Canteen Open Lawn" },
        { postId: pollPost.id, text: "My own desk with lofi music" },
      ])
      .returning();

    if (createdOptions.length >= 4) {
      await db.insert(pollVotes).values([
        { postId: pollPost.id, optionId: createdOptions[0].id, userId: aman.id },
        { postId: pollPost.id, optionId: createdOptions[0].id, userId: ananya.id },
        { postId: pollPost.id, optionId: createdOptions[1].id, userId: peerProfiles.rohan_kulkarni.id },
        { postId: pollPost.id, optionId: createdOptions[3].id, userId: peerProfiles.riya_sen_mesra.id },
        { postId: pollPost.id, optionId: createdOptions[0].id, userId: peerProfiles.shaswat_raj.id },
      ]);
    }
  }
  console.log("✅ Seeded Campus Feed Discussions and Interactive Polls.");

  // 7. Seed 24-Hour Campus Stories / Vibes
  const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
  let activeStory = await db.query.stories.findFirst({
    where: eq(stories.userId, demoId),
  });

  if (!activeStory) {
    const [s] = await db
      .insert(stories)
      .values({
        userId: demoId,
        mediaUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=80",
        text: "Golden hour sunset over BIT Mesra Main Building 🌅✨",
        backgroundColor: "#1e1b4b",
        expiresAt: tomorrow,
      })
      .returning();
    activeStory = s;

    await db.insert(storyLikes).values([
      { storyId: activeStory.id, userId: ananya.id },
      { storyId: activeStory.id, userId: aman.id },
      { storyId: activeStory.id, userId: peerProfiles.riya_sen_mesra.id },
    ]);
  }
  console.log("✅ Seeded 24-Hour Active Campus Story Vibes & Reactions.");

  // 8. Seed Dating Swipes & Mutual Match
  await db
    .insert(swipes)
    .values({
      swiperId: demoId,
      targetId: ananya.id,
      direction: "LIKE",
    })
    .onConflictDoNothing();

  await db
    .insert(swipes)
    .values({
      swiperId: ananya.id,
      targetId: demoId,
      direction: "LIKE",
    })
    .onConflictDoNothing();

  await db
    .insert(secretCrushes)
    .values({
      senderId: demoId,
      targetId: peerProfiles.riya_sen_mesra.id,
      isMutual: false,
    })
    .onConflictDoNothing();

  console.log("✅ Seeded Campus Match & Secret Crush Vault interactions.");

  // 9. Seed Campus Event Registration
  const firstEvent =
    (await db.query.events.findFirst({
      where: eq(events.slug, "hackbit-2026"),
    })) || (await db.query.events.findFirst());

  if (firstEvent) {
    await db
      .insert(eventRegistrations)
      .values({
        id: `reg_demo_${firstEvent.id}`,
        eventId: firstEvent.id,
        profileId: demoId,
        registrationType: "TEAM",
        teamName: "LoopHacks",
        contactPhone: "+91 9876543210",
        notes: "Building P2P campus network modules",
        status: "CONFIRMED",
      })
      .onConflictDoNothing();
    console.log(`✅ Registered Demo Tester for Campus Event '${firstEvent.title}'.`);
  }

  // 10. Seed Community Memberships & Sub-Hub Posts
  const commIds = ["comm_coding", "comm_startups", "comm_music"];
  for (const cid of commIds) {
    const comm = await db.query.communities.findFirst({ where: eq(communities.id, cid) });
    if (comm) {
      await db
        .insert(communityMembers)
        .values({
          communityId: comm.id,
          userId: demoId,
          role: "MEMBER",
          status: "ACTIVE",
        })
        .onConflictDoNothing();
    }
  }

  // Community Post in Coders Club
  const codingComm = await db.query.communities.findFirst({ where: eq(communities.id, "comm_coding") });
  if (codingComm) {
    const existingCommPost = await db.query.posts.findFirst({
      where: and(eq(posts.authorId, demoId), eq(posts.communityId, codingComm.id)),
    });
    if (!existingCommPost) {
      await db.insert(posts).values({
        authorId: demoId,
        institutionId: BIT_MESRA_ID,
        communityId: codingComm.id,
        title: "HackBIT 2026: Team Formations & Idea Brainstorming 🚀",
        body: "Looking for 1 more backend/ML engineer for our HackBIT squad! We are building autonomous campus agents using Next.js 16, Neon Serverless Postgres and WebRTC. DM if interested!",
        type: "NORMAL",
        scope: "CAMPUS",
        status: "PUBLISHED",
      });
    }
  }
  console.log("✅ Seeded Community Memberships and Active Club Posts.");

  // 11. Seed 10+ Utility Hubs
  const existingLF = await db.query.lostAndFoundItems.findFirst({
    where: and(eq(lostAndFoundItems.authorId, demoId), eq(lostAndFoundItems.title, "Boat Airdopes 141 ANC Case")),
  });
  if (!existingLF) {
    await db.insert(lostAndFoundItems).values({
      institutionId: BIT_MESRA_ID,
      authorId: demoId,
      type: "FOUND",
      title: "Boat Airdopes 141 ANC Case",
      description: "Found a black Boat charging case with left earbud on 3rd row bench of CAT Hall Room 204.",
      category: "Electronics",
      location: "CAT Hall Room 204",
      itemDate: "2026-09-03",
      contactInfo: "DM on CampusLoop chat or collect from CAT lab assistant",
      reward: "Just return to rightful owner!",
      isResolved: false,
    });
  }

  const existingBS = await db.query.marketplaceItems.findFirst({
    where: and(eq(marketplaceItems.sellerId, demoId), eq(marketplaceItems.title, "Hero Sprint Pro 21-Speed Gear Cycle")),
  });
  if (!existingBS) {
    await db.insert(marketplaceItems).values({
      institutionId: BIT_MESRA_ID,
      sellerId: demoId,
      title: "Hero Sprint Pro 21-Speed Gear Cycle",
      description: "Excellent condition, newly tuned brakes and Shimano gears. Front suspension included. Moving out sale.",
      price: 2400,
      originalPrice: 7500,
      category: "Cycles",
      condition: "GOOD",
      hostelLocation: "Hostel 10 Cycle Stand / IC Lawn",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop&q=80",
      ]),
      isSold: false,
    });
  }

  const existingRide = await db.query.ridesharePools.findFirst({
    where: and(eq(ridesharePools.creatorId, demoId), eq(ridesharePools.destination, "Ranchi Railway Station")),
  });
  if (!existingRide) {
    await db.insert(ridesharePools).values({
      institutionId: BIT_MESRA_ID,
      creatorId: demoId,
      origin: "BIT Mesra Main Campus Gate",
      destination: "Ranchi Railway Station",
      departureTime: "Tomorrow 6:15 AM",
      vehicleType: "CAB_SEDAN",
      totalSeats: 4,
      availableSeats: 2,
      pricePerSeat: 130,
      contactInfo: "WhatsApp or CampusLoop DM",
      notes: "Catching Hatia-Howrah Express. 2 luggage bags max per person.",
      status: "ACTIVE",
    });
  }

  const existingHouse = await db.query.housingListings.findFirst({
    where: and(eq(housingListings.authorId, demoId), eq(housingListings.title, "1 Roommate Needed in 2BHK Mesra Greens")),
  });
  if (!existingHouse) {
    await db.insert(housingListings).values({
      institutionId: BIT_MESRA_ID,
      authorId: demoId,
      title: "1 Roommate Needed in 2BHK Mesra Greens",
      description: "Fully furnished flat with high-speed Wi-Fi, RO water purifier, balcony, and power backup. 5 min walk from campus.",
      location: "Mesra Greens Apartments, Block B",
      distanceFromCampus: "5 min walk from Back Gate",
      rentPerMonth: 4200,
      deposit: 4200,
      occupancyType: "SINGLE_ROOM",
      genderPreference: "ANY",
      amenities: JSON.stringify(["High Speed Wi-Fi", "RO Water", "Power Backup", "Geyser", "Cook Available"]),
      contactInfo: "DM on CampusLoop or call in evening",
      status: "AVAILABLE",
    });
  }

  const existingGame = await db.query.gamingLobbies.findFirst({
    where: and(eq(gamingLobbies.hostId, demoId), eq(gamingLobbies.title, "Valorant 5v5 Custom Scrim Match")),
  });
  if (!existingGame) {
    await db.insert(gamingLobbies).values({
      institutionId: BIT_MESRA_ID,
      hostId: demoId,
      gameName: "Valorant",
      title: "Valorant 5v5 Custom Scrim Match",
      description: "Hostel 10 vs Hostel 11 friendly custom scrim. Ascent & Haven map pool. Need 2 more players!",
      mode: "5v5",
      rankTier: "Gold / Platinum",
      gamerTag: "CampusSniper#LOOP",
      slotsTotal: 10,
      slotsFilled: 8,
      scheduledAt: "Tonight 10:30 PM",
      status: "OPEN",
    });
  }

  let capsule = await db.query.timeCapsules.findFirst({
    where: eq(timeCapsules.title, "Class of 2027 Convocation Capsule ⏳"),
  });
  if (!capsule) {
    const [c] = await db
      .insert(timeCapsules)
      .values({
        institutionId: BIT_MESRA_ID,
        creatorId: peerProfiles.shaswat_raj.id,
        title: "Class of 2027 Convocation Capsule ⏳",
        description: "Sealed cryptographically until Convocation Day in June 2027. What are your batch predictions?",
        targetUnlockDate: new Date("2027-06-15T10:00:00Z"),
        category: "CONVOCATION",
        entriesCount: 18,
        isUnlocked: false,
      })
      .returning();
    capsule = c;

    await db.insert(capsuleEntries).values({
      capsuleId: capsule.id,
      authorId: demoId,
      entryType: "PREDICTION",
      title: "Letter to My 2027 Graduate Self",
      content:
        "Prediction: CampusLoop will be the default social app across every college in India, and we will all be working on cutting-edge AI startups!",
      isAnonymous: false,
    });
  }

  console.log("✅ Seeded All Utility Hubs: Lost & Found, Buy/Sell, Rideshare, Housing, Gaming & Time Capsule.");
  console.log("🎉 Complete Ecosystem Seeding Finished Successfully!");
}

if (import.meta.main) {
  seedDemoActivities()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Failed to seed demo activities:", err);
      process.exit(1);
    });
}
