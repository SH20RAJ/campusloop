import { getDb } from "@/db";
import { anonIdentityVault,pollOptions,posts,userProfiles } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { deriveAnonHandle,sealIdentity } from "@/lib/anonymity";
import { runSafetyCheck } from "@/lib/moderation/rules";
import { notifyMentions } from "@/lib/notifications";
import { rejectViewerWrite } from "@/lib/viewer";
import { eq,sql } from "drizzle-orm";

import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

export async function POST(req: Request) {
  try {
    const user = await hexclaveServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const profile = await db.query.userProfiles.findFirst({
      where: eq(userProfiles.userId, user.id),
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 403 });
    }

    const viewerBlocked = await rejectViewerWrite(profile);
    if (viewerBlocked) return viewerBlocked;

    const data = await req.json();
    const { body, type, scope, isAnonymous, title, options, communityId } = data as {
      body: string;
      type?: "NORMAL" | "CONFESSION" | "POLL" | "QUESTION";
      scope?: "CAMPUS" | "GLOBAL";
      isAnonymous?: boolean;
      title?: string;
      options?: string[];
      communityId?: string;
    };

    if (!body || body.trim().length === 0) {
      return NextResponse.json({ error: "Post body cannot be empty" }, { status: 400 });
    }

    // Centralized safety engine (PII / doxxing / threats / abuse)
    const safety = runSafetyCheck({ title, body });
    if (safety.blocked) {
      return NextResponse.json(
        { error: safety.messages.join(" "), messages: safety.messages, riskScore: safety.riskScore },
        { status: 400 },
      );
    }

    const anonymous = Boolean(isAnonymous);
    const postId = randomUUID();

    const pollTexts =
      type === "POLL" ? (options ?? []).map((opt) => opt.trim()).filter((opt) => opt.length > 0) : [];
    if (type === "POLL" && pollTexts.length < 2) {
      return NextResponse.json({ error: "A poll needs at least 2 options" }, { status: 400 });
    }

    // Anonymous posts carry NO author foreign key. The real profile id is
    // AES-sealed into the identity vault; the post row holds the student's custom
    // anonymous username or falls back to the deterministic HMAC pseudonym handle.
    const activePseudonym = profile.anonymousUsername
      ? profile.anonymousUsername
      : deriveAnonHandle(profile.id);

    if (anonymous) {
      await db
        .insert(anonIdentityVault)
        .values({
          handle: activePseudonym,
          sealedIdentity: sealIdentity(profile.id),
        })
        .onConflictDoNothing({ target: anonIdentityVault.handle });
    }

    const [newPost] = await db
      .insert(posts)
      .values({
        id: postId,
        authorId: anonymous ? null : profile.id,
        pseudonym: anonymous ? activePseudonym : null,

        institutionId: profile.institutionId,
        body,
        type: type || "NORMAL",
        scope: scope || "GLOBAL",
        isAnonymous: anonymous,
        title: title || null,
        communityId: communityId || null,
        status: safety.status,
        riskScore: safety.riskScore,
      })
      .returning();

    // Award +5 points
    await db.update(userProfiles)
      .set({ points: sql`${userProfiles.points} + 5` })
      .where(eq(userProfiles.id, profile.id));

    if (pollTexts.length > 0) {
      await db.insert(pollOptions).values(pollTexts.map((text) => ({ postId: newPost.id, text })));
    }

    // Trigger @mention notifications asynchronously
    notifyMentions({
      text: body,
      actorId: profile.id,
      referenceId: newPost.id,
    }).catch((err) => console.warn("Mention notification error:", err));

    return NextResponse.json(newPost, { status: 201 });

  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
