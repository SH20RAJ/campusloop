import { getDb } from "../src/db";
import { conversations, conversationParticipants, messages, userProfiles } from "../src/db/schema";
import { eq, and } from "drizzle-orm";

async function seedRichChats() {
  const db = getDb();
  const shaswat = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.username, "sh20raj"),
  });

  if (!shaswat) {
    console.error("User sh20raj not found");
    return;
  }

  console.log("Found user sh20raj:", shaswat.id);

  const peerUsernames = [
    "isha_mukherjee",
    "ananya_kashyap",
    "ayush_tiwari_bit",
    "arjun_sen_mesra",
    "riya_agrawal_mesra",
  ];

  const dialogues: Record<string, { sender: "me" | "peer"; text: string; reaction?: string; minutesAgo: number }[]> = {
    isha_mukherjee: [
      { sender: "peer", text: "Hey Shaswat! Did you check the BITotsav 2026 website repo?", minutesAgo: 140 },
      { sender: "me", text: "Hey Isha! Yes, I was just looking at the design system and schedule tabs. Looking super slick!", minutesAgo: 120, reaction: "🔥" },
      { sender: "peer", text: "Awesome! We need to finalize the Hackathon registration portal by Friday. Are you free to review the frontend after classes today?", minutesAgo: 95 },
      { sender: "me", text: "Count me in! Let's meet at R&D building 2nd floor lab around 5:30 PM. I'll bring my laptop.", minutesAgo: 60, reaction: "👍" },
      { sender: "peer", text: "Perfect, see you at 5:30! Bringing some cold coffee from IC canteen too ☕", minutesAgo: 25, reaction: "❤️" },
    ],
    ananya_kashyap: [
      { sender: "peer", text: "Hi Shaswat, do you have the DSA placement question sheet from yesterday's mock test?", minutesAgo: 300 },
      { sender: "me", text: "Hey Ananya! Yeah, it had 3 graph problems and 2 dynamic programming questions.", minutesAgo: 240 },
      { sender: "me", text: "I uploaded the full PDF on the BIT CSE drive. Check out the link on the branch portal!", minutesAgo: 235, reaction: "🙏" },
      { sender: "peer", text: "Got it! Thanks a ton. The Dijkstra variant was really tricky under the 45 min timer.", minutesAgo: 180, reaction: "😮" },
      { sender: "peer", text: "Let's do a mock interview this weekend before the Microsoft campus drive starts.", minutesAgo: 45 },
    ],
    ayush_tiwari_bit: [
      { sender: "peer", text: "Bro! Did you test the ESP32 microcontrollers in the Robotics Club lab?", minutesAgo: 480 },
      { sender: "me", text: "Yeah Ayush, wifi and bluetooth handshake worked with zero latency! We can use it for the autonomous rover.", minutesAgo: 420, reaction: "🔥" },
      { sender: "peer", text: "Sick! The faculty coordinator approved the budget for the LIDAR sensor too.", minutesAgo: 210, reaction: "🎉" },
      { sender: "peer", text: "Let's assemble the chassis after 4 PM lab tomorrow.", minutesAgo: 50 },
    ],
    arjun_sen_mesra: [
      { sender: "peer", text: "Hey junior, heard your team won 1st place in the campus code sprint! Congrats! 🚀", minutesAgo: 720, reaction: "❤️" },
      { sender: "me", text: "Thank you so much Arjun bhaiya! Really appreciate your guidance on distributed caching.", minutesAgo: 680, reaction: "🙏" },
      { sender: "peer", text: "Keep building! Let me know if you need referrals for Summer 2026 internships at Bangalore startups.", minutesAgo: 520, reaction: "👍" },
    ],
    riya_agrawal_mesra: [
      { sender: "peer", text: "Shaswat!! Are we going to Sharma Ji canteen for late night chai tonight?", minutesAgo: 15 },
      { sender: "peer", text: "Everyone from Hostel 10 is coming around 10:30 PM ☕", minutesAgo: 10 },
      { sender: "me", text: "Definitely! Finishing up a pull request and joining right after. Save a samosa for me! 😋", minutesAgo: 2, reaction: "😂" },
    ],
  };

  for (const username of peerUsernames) {
    const peer = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.username, username),
    });

    if (!peer) {
      console.log(`Peer @${username} not found, skipping.`);
      continue;
    }

    // Check if conversation already exists
    const myParts = await db.query.conversationParticipants.findMany({
      where: eq(conversationParticipants.userId, shaswat.id),
    });

    let targetConvId: string | null = null;
    for (const part of myParts) {
      const otherPart = await db.query.conversationParticipants.findFirst({
        where: and(
          eq(conversationParticipants.conversationId, part.conversationId),
          eq(conversationParticipants.userId, peer.id)
        ),
      });
      if (otherPart) {
        targetConvId = part.conversationId;
        break;
      }
    }

    if (!targetConvId) {
      const [newConv] = await db.insert(conversations).values({}).returning();
      targetConvId = newConv.id;
      await db.insert(conversationParticipants).values([
        { conversationId: targetConvId, userId: shaswat.id },
        { conversationId: targetConvId, userId: peer.id },
      ]);
      console.log(`Created conversation ${targetConvId} between @sh20raj and @${username}`);
    } else {
      console.log(`Using existing conversation ${targetConvId} for @${username}`);
    }

    // Insert messages if few or empty
    const existingMessages = await db.query.messages.findMany({
      where: eq(messages.conversationId, targetConvId),
    });

    if (existingMessages.length < 3) {
      const dialogueList = dialogues[username] || [];
      const now = Date.now();

      for (const item of dialogueList) {
        const senderId = item.sender === "me" ? shaswat.id : peer.id;
        const msgTime = new Date(now - item.minutesAgo * 60 * 1000);
        const reactionsPayload = item.reaction
          ? [{ emoji: item.reaction, userId: item.sender === "me" ? peer.id : shaswat.id, userDisplayName: item.sender === "me" ? peer.displayName : shaswat.displayName }]
          : [];

        await db.insert(messages).values({
          conversationId: targetConvId,
          senderId,
          body: item.text,
          readAt: item.minutesAgo > 15 ? new Date(msgTime.getTime() + 60000) : null,
          reactions: reactionsPayload,
          createdAt: msgTime,
          updatedAt: msgTime,
        });
      }
      console.log(`Seeded ${dialogueList.length} messages for conv ${targetConvId}`);
    }
  }

  console.log("Done seeding rich chats!");
}

seedRichChats().catch(console.error);
