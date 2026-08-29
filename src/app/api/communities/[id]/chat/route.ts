import { getDb } from "@/db";
import { communities,conversationParticipants,conversations,userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { and,eq,or } from "drizzle-orm";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();

    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    // Find the community by id or slug
    const cleanId = id.trim();
    const comm = await db.query.communities.findFirst({
      where: or(
        eq(communities.id, cleanId),
        eq(communities.slug, cleanId.toLowerCase())
      ),
    });

    if (!comm) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    // Find existing community conversation
    let conv = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.communityId, comm.id),
        eq(conversations.type, "COMMUNITY")
      ),
    });

    if (!conv) {
      // Create new community group conversation
      const [newConv] = await db
        .insert(conversations)
        .values({
          communityId: comm.id,
          type: "COMMUNITY",
          title: `c/${comm.name}`,
          avatarUrl: comm.avatarUrl || null,
        })
        .returning();
      conv = newConv;
    }

    // Ensure the current student is in conversation_participants
    const existingParticipant = await db.query.conversationParticipants.findFirst({
      where: and(
        eq(conversationParticipants.conversationId, conv.id),
        eq(conversationParticipants.userId, profile.id)
      ),
    });

    if (!existingParticipant) {
      await db.insert(conversationParticipants).values({
        conversationId: conv.id,
        userId: profile.id,
      });
    }

    return NextResponse.json({
      conversationId: conv.id,
      title: conv.title,
      communityId: comm.id,
      type: "COMMUNITY",
    });
  } catch (error) {
    console.error("Error opening community group chat:", error);
    return NextResponse.json(
      { error: "Failed to open community group chat" },
      { status: 500 }
    );
  }
}
