import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { aiConversations, aiMessages, aiUsageEvents, userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { campusAiOrchestrator } from "@/lib/ai/provider";
import type { AiMode, AiToolContext } from "@/lib/ai/types";
import { isViewerProfile } from "@/lib/viewer";

export const dynamic = "force-dynamic";

interface ChatRequestBody {
  conversationId?: string;
  mode?: AiMode;
  message: string;
  context?: {
    route?: string;
    entityType?: string;
    entityId?: string;
  };
}

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as ChatRequestBody;
    const userPrompt = body.message?.trim();

    if (!userPrompt) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Input length protection (cost & abuse control)
    if (userPrompt.length > 2000) {
      return NextResponse.json(
        { error: "Message exceeds maximum allowed length of 2,000 characters." },
        { status: 400 }
      );
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    const isViewer = profile.institutionId
      ? await isViewerProfile({ institutionId: profile.institutionId })
      : false;

    // 1. Resolve or Create Conversation
    let conversationId = body.conversationId;
    const mode = body.mode || "campus";

    if (conversationId) {
      const existingConv = await db.query.aiConversations.findFirst({
        where: and(eq(aiConversations.id, conversationId), eq(aiConversations.userId, profile.id)),
      });
      if (!existingConv) {
        conversationId = undefined; // Invalid or unowned conversation ID, generate new
      }
    }

    if (!conversationId) {
      const newConvId = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      await db.insert(aiConversations).values({
        id: newConvId,
        userId: profile.id,
        mode,
        title: userPrompt.slice(0, 50),
        lastMessageAt: new Date(),
      });
      conversationId = newConvId;
    }

    // 2. Load conversation history for contextual multi-turn memory
    const history = await db.query.aiMessages.findMany({
      where: eq(aiMessages.conversationId, conversationId),
      orderBy: [desc(aiMessages.createdAt)],
      limit: 6,
    });
    const chronologicalHistory = history.reverse().map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // 3. Construct Tool Context with strict institution and viewer scoping
    const toolContext: AiToolContext = {
      userId: profile.id,
      institutionId: isViewer ? null : profile.institutionId,
      mode,
      route: body.context?.route,
      entityType: body.context?.entityType,
      entityId: body.context?.entityId,
    };

    // 4. Select & Execute Authorized Tools
    const toolOutput = await campusAiOrchestrator.selectAndExecuteTools(toolContext, userPrompt);

    // 5. Generate Grounded AI Response
    const aiResponse = await campusAiOrchestrator.generateAnswer(
      toolContext,
      userPrompt,
      toolOutput,
      chronologicalHistory
    );

    const latencyMs = Date.now() - startTime;

    // 6. Persist User Message and AI Assistant Message
    const userMsgId = `aimsg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const assistantMsgId = `aimsg_${Date.now() + 1}_${Math.random().toString(36).slice(2, 8)}`;

    await db.insert(aiMessages).values([
      {
        id: userMsgId,
        conversationId,
        role: "user",
        content: userPrompt,
      },
      {
        id: assistantMsgId,
        conversationId,
        role: "assistant",
        content: aiResponse.answer,
        sourceIds: toolOutput.sources.map((s) => s.id),
      },
    ]);

    // Update conversation timestamp
    await db
      .update(aiConversations)
      .set({ updatedAt: new Date(), lastMessageAt: new Date() })
      .where(eq(aiConversations.id, conversationId));

    // Record Usage Event for Analytics & Rate Control
    await db.insert(aiUsageEvents).values({
      id: `aiuse_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId: profile.id,
      conversationId,
      requestType: mode,
      model: process.env.CAMPUS_AI_MODEL || "campus-loop-grounded-v1",
      inputTokens: Math.ceil(userPrompt.length / 4),
      outputTokens: Math.ceil(aiResponse.answer.length / 4),
      toolCount: toolOutput.sources.length,
      latencyMs,
    });

    return NextResponse.json({
      answer: aiResponse.answer,
      sources: aiResponse.sources,
      suggestedActions: aiResponse.suggestedActions,
      conversationId,
      messageId: assistantMsgId,
    });
  } catch (error) {
    console.error("Campus AI Chat Error:", error);
    return NextResponse.json(
      {
        answer: "Campus AI is temporarily unavailable. Try again in a moment.",
        sources: [],
        suggestedActions: [],
      },
      { status: 200 } // Return graceful degraded response with 200 so UI displays friendly message
    );
  }
}
