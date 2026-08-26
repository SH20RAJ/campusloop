import { getDb } from "@/db";
import { messages,userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { rejectViewerWrite } from "@/lib/viewer";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string; msgId: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { msgId } = await params;
    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    const viewerBlocked = await rejectViewerWrite(profile);
    if (viewerBlocked) return viewerBlocked;

    const { emoji } = (await req.json()) as { emoji: string };
    if (!emoji) {
      return NextResponse.json({ error: "Emoji required" }, { status: 400 });
    }

    const targetMsg = await db.query.messages.findFirst({
      where: eq(messages.id, msgId),
    });

    if (!targetMsg) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    type ReactionItem = { emoji: string; userId: string; userDisplayName?: string };
    const currentReactions: ReactionItem[] = (targetMsg.reactions as ReactionItem[]) || [];

    // Toggle reaction: If user already reacted with this emoji, remove it. Otherwise add/replace.
    const existingIdx = currentReactions.findIndex(
      (r) => r.userId === profile.id && r.emoji === emoji
    );

    let updatedReactions: ReactionItem[];
    if (existingIdx >= 0) {
      updatedReactions = currentReactions.filter((_, i) => i !== existingIdx);
    } else {
      // Remove any prior reaction by this user or allow multiple
      const filtered = currentReactions.filter((r) => r.userId !== profile.id);
      updatedReactions = [
        ...filtered,
        {
          emoji,
          userId: profile.id,
          userDisplayName: profile.displayName,
        },
      ];
    }

    const [updated] = await db
      .update(messages)
      .set({ reactions: updatedReactions })
      .where(eq(messages.id, msgId))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error reacting to message:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
