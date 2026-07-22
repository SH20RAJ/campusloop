/**
 * Seed active DM conversations for @sh20raj admin profile
 */
import { getDb } from "../src/db";
import { userProfiles, conversations, conversationParticipants, messages } from "../src/db/schema";
import { eq, ne } from "drizzle-orm";

async function runChatSeeding() {
  console.log("🌱 Seeding chat conversations for @sh20raj...");
  const db = getDb();

  // Find admin profile
  const adminProfile = await db.query.userProfiles.findFirst({
    where: eq(userProfiles.username, "sh20raj"),
  });

  if (!adminProfile) {
    console.error("❌ Profile @sh20raj not found!");
    return;
  }

  // Find other student profiles to chat with
  const otherStudents = await db.query.userProfiles.findMany({
    where: ne(userProfiles.id, adminProfile.id),
    limit: 5,
  });

  if (otherStudents.length === 0) {
    console.warn("No other student profiles found.");
    return;
  }

  const seedMessages = [
    [
      "Hey Shaswat! Did you review the campus pitch deck for IIT Delhi?",
      "Yeah! Looking super clean. We hit 100+ new signups today 🔥",
      "That's awesome! Let's feature the upcoming Hackathon on the feed.",
    ],
    [
      "Hey! Are you attending the Tech Fest tomorrow?",
      "Definitely! Let's sync up near the main hall at 4 PM.",
      "Sounds great, see you there!",
    ],
    [
      "Loved your recent post on the campus loop! 🚀",
      "Thanks! Excited to bring all Indian campuses onto the loop.",
    ],
  ];

  for (let i = 0; i < Math.min(otherStudents.length, seedMessages.length); i++) {
    const student = otherStudents[i];
    const msgList = seedMessages[i];

    // Check existing conversation
    const myConvs = await db.query.conversationParticipants.findMany({
      where: eq(conversationParticipants.userId, adminProfile.id),
    });
    const targetConvs = await db.query.conversationParticipants.findMany({
      where: eq(conversationParticipants.userId, student.id),
    });

    const common = myConvs.find((mc) => targetConvs.some((tc) => tc.conversationId === mc.conversationId));

    let convId = common?.conversationId;

    if (!convId) {
      const [newConv] = await db.insert(conversations).values({}).returning();
      convId = newConv.id;
      await db.insert(conversationParticipants).values([
        { conversationId: convId, userId: adminProfile.id },
        { conversationId: convId, userId: student.id },
      ]);
    }

    for (let j = 0; j < msgList.length; j++) {
      const senderId = j % 2 === 0 ? student.id : adminProfile.id;
      await db.insert(messages).values({
        conversationId: convId,
        senderId,
        body: msgList[j],
        createdAt: new Date(Date.now() - (msgList.length - j) * 600000),
      });
    }

    console.log(`✅ Seeded chat conversation between @sh20raj and @${student.username}`);
  }

  console.log("✨ Chat seeding completed successfully!");
}

runChatSeeding().catch(console.error);
