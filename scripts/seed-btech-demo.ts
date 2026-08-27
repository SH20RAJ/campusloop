import { getDb } from "../src/db";
import {
  capsuleEntries,
  communities,
  communityMembers,
  conversationParticipants,
  conversations,
  follows,
  messages,
  notifications,
  posts,
  secretCrushes,
  swipes,
  timeCapsules,
  userProfiles,
} from "../src/db/schema";
import { and, eq, ne } from "drizzle-orm";

async function runSeed() {
  console.log("🌱 Starting rich demo seed for @btech10223_25...");
  const db = getDb();

  const user = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.username, "btech10223_25"),
  });

  if (!user) {
    throw new Error("Could not find user btech10223_25!");
  }

  const userId = user.id;
  const instId = user.institutionId || "inst_35df75700bb23dd30311ef5f";

  // 1. Upgrade User Profile
  console.log("👤 Updating Shreemaya profile details & clout...");
  await db
    .update(userProfiles)
    .set({
      displayName: "Shreemaya Raj",
      bio: "B.Tech CSE '25 @ BIT Mesra ⚡ Distributed systems, Full-Stack & Open Source. Midnight IC chai & hackathon warrior. Building @campusloop.",
      branch: "Computer Science & Engineering",
      course: "B.Tech",
      year: 4,
      points: 285,
      gender: "MALE",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
      bannerUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80",
      lastSeenAt: new Date(),
    })
    .where(eq(userProfiles.id, userId));

  // 2. Find or Create Peer Students at BIT Mesra
  const peers = await db.query.userProfiles.findMany({
    where: and(
      ne(userProfiles.id, userId),
      eq(userProfiles.institutionId, instId)
    ),
    limit: 10,
  });

  const ananya = peers.find((p) => p.username === "ananya_kashyap") || peers[0];
  const devanshu = peers.find((p) => p.username === "devanshu_m") || peers[1];
  const kabir = peers.find((p) => p.username === "kabir_sengupta") || peers[2];
  const sid = peers.find((p) => p.username === "sid_roy_mesra") || peers[3];

  console.log(`🤝 Selected peers: ${ananya?.displayName}, ${devanshu?.displayName}, ${kabir?.displayName}`);

  // 3. Populate Follows
  console.log("👥 Populating followers & followings...");
  for (const peer of peers) {
    // Peer follows Shreemaya
    await db
      .insert(follows)
      .values({ followerId: peer.id, followingId: userId })
      .onConflictDoNothing();

    // Shreemaya follows peer back (for top 5)
    if ([ananya?.id, devanshu?.id, kabir?.id, sid?.id].includes(peer.id)) {
      await db
        .insert(follows)
        .values({ followerId: userId, followingId: peer.id })
        .onConflictDoNothing();
    }
  }

  // 4. Populate Dating Swipes & Match with Ananya
  if (ananya) {
    console.log("💘 Creating mutual dating match with Ananya...");
    await db
      .insert(swipes)
      .values({ swiperId: userId, targetId: ananya.id, direction: "LIKE" })
      .onConflictDoUpdate({ target: [swipes.swiperId, swipes.targetId], set: { direction: "LIKE" } });

    await db
      .insert(swipes)
      .values({ swiperId: ananya.id, targetId: userId, direction: "LIKE" })
      .onConflictDoUpdate({ target: [swipes.swiperId, swipes.targetId], set: { direction: "LIKE" } });

    // Secret Crush mutual
    await db
      .insert(secretCrushes)
      .values({
        senderId: userId,
        targetId: ananya.id,
        isMutual: true,
        matchedAt: new Date(),
      })
      .onConflictDoNothing();

    await db
      .insert(secretCrushes)
      .values({
        senderId: ananya.id,
        targetId: userId,
        isMutual: true,
        matchedAt: new Date(),
      })
      .onConflictDoNothing();
  }

  // Add 2 anonymous secret crushes on Shreemaya
  if (devanshu && sid) {
    await db
      .insert(secretCrushes)
      .values({ senderId: sid.id, targetId: userId, isMutual: false })
      .onConflictDoNothing();
  }

  // 5. Populate Active Conversations & Messages
  console.log("💬 Creating rich student chats...");
  const chatPairs = [
    {
      peer: ananya,
      dialogue: [
        { sender: ananya, text: "Hey Shreemaya! Saw your distributed systems demo in the lab today, super clean architecture 🚀", delayMinutes: 120 },
        { sender: user, text: "Hey Ananya! Thanks so much! Were you in the morning batch?", delayMinutes: 110 },
        { sender: ananya, text: "Yes! Also are you going to the Bitotsav tech prep meet tomorrow near the main audi?", delayMinutes: 45 },
        { sender: user, text: "Definitely, will be there around 5 PM right after the compiler lab.", delayMinutes: 20 },
        { sender: ananya, text: "Awesome, let's grab IC chai after that! Don't forget your notes haha ☕", delayMinutes: 5 },
      ],
    },
    {
      peer: devanshu,
      dialogue: [
        { sender: devanshu, text: "Bhai free ho tonight? Valorant 5v5 scrim with Hostel 10 at 11 PM?", delayMinutes: 180 },
        { sender: user, text: "Haan count me in! Just finishing the OS scheduling assignment.", delayMinutes: 150 },
        { sender: devanshu, text: "Sahi hai, Kabir is playing initiator. Let's sweep this match 🔥", delayMinutes: 30 },
      ],
    },
    {
      peer: kabir,
      dialogue: [
        { sender: kabir, text: "Bro did you see the Smart India Hackathon problem statements on CampusLoop?", delayMinutes: 300 },
        { sender: user, text: "Yeah! The campus microservices & telemetry track looks super promising.", delayMinutes: 250 },
        { sender: kabir, text: "Let's team up. I'll setup the GitHub organization tonight.", delayMinutes: 60 },
        { sender: user, text: "Done deal. Let's meet at IC canteen tomorrow at 4.", delayMinutes: 15 },
      ],
    },
  ];

  for (const item of chatPairs) {
    if (!item.peer) continue;

    // Check if conversation exists
    const [conv] = await db.insert(conversations).values({}).returning();

    await db.insert(conversationParticipants).values([
      { conversationId: conv.id, userId: userId },
      { conversationId: conv.id, userId: item.peer.id },
    ]);

    const now = Date.now();
    for (const msg of item.dialogue) {
      const msgTime = new Date(now - msg.delayMinutes * 60 * 1000);
      await db.insert(messages).values({
        conversationId: conv.id,
        senderId: msg.sender.id,
        body: msg.text,
        readAt: msg.sender.id === userId ? new Date() : null,
        createdAt: msgTime,
        updatedAt: msgTime,
      });
    }
  }

  // 6. Community Memberships
  console.log("🏛️ Joining active communities...");
  const commList = await db.query.communities.findMany({ limit: 6 });
  for (const c of commList) {
    await db
      .insert(communityMembers)
      .values({
        communityId: c.id,
        userId: userId,
        role: c.name.includes("Coders") ? "ADMIN" : "MEMBER",
        status: "ACTIVE",
      })
      .onConflictDoNothing();
  }

  // 7. Time Capsule Entry for 2025 Batch
  console.log("⏳ Adding Time Capsule entry...");
  let capsule = await db.query.timeCapsules.findFirst({
    where: eq(timeCapsules.institutionId, instId),
  });

  if (!capsule) {
    const [newCap] = await db
      .insert(timeCapsules)
      .values({
        institutionId: instId,
        creatorId: userId,
        title: "BIT Mesra Class of 2025 Vault",
        description: "Official convocation time capsule for the 2021-2025 graduating batch. Predictions, memories, and letters.",
        targetUnlockDate: new Date("2025-05-30T10:00:00Z"),
        category: "CONVOCATION",
        entriesCount: 1,
      })
      .returning();
    capsule = newCap;
  }

  if (capsule) {
    await db.insert(capsuleEntries).values({
      capsuleId: capsule.id,
      authorId: userId,
      entryType: "LETTER",
      title: "To our 2025 Batchmates Surviving Engineering",
      content: "To everyone who survived late night compiler lab submissions, 8 AM winter lectures, and endless IC canteen Maggi runs. We came in as confused freshers and leaving as builders. See you all at Convocation Day! 🎓✨",
      isAnonymous: false,
    });
  }

  // 8. Notifications
  console.log("🔔 Adding realistic notifications...");
  if (ananya) {
    await db.insert(notifications).values([
      {
        userId: userId,
        type: "MATCH",
        actorId: ananya.id,
        previewText: "You matched with Ananya Kashyap on Campus Match! 🎉 Say hello in chat.",
        isRead: false,
      },
      {
        userId: userId,
        type: "CRUSH_ALERT",
        actorId: ananya.id,
        previewText: "Double-Blind Lock Match! Your secret crush has also added you to their vault! 🔒❤️",
        isRead: false,
      },
      {
        userId: userId,
        type: "LIKE",
        actorId: ananya.id,
        previewText: "liked your post about distributed systems & IC chai",
        isRead: true,
      },
    ]);
  }

  if (devanshu) {
    await db.insert(notifications).values({
      userId: userId,
      type: "FOLLOW",
      actorId: devanshu.id,
      previewText: "started following your campus profile",
      isRead: true,
    });
  }

  console.log("✅ Seed completed successfully! @btech10223_25 is fully primed for demo videos!");
}

runSeed().catch(console.error);
