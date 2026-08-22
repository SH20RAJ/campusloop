import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { anonIdentityVault, posts, userProfiles, pollOptions } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { runSafetyCheck } from "@/lib/moderation/rules";
import { deriveAnonHandle, sealIdentity } from "@/lib/anonymity";
import { eq } from "drizzle-orm";
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

    // Anonymous posts carry NO author foreign key. The real profile id is
    // AES-sealed into the identity vault; the post row only holds a stable
    // HMAC pseudonym handle that cannot be reversed without the pepper.
    const [newPost] = await db.transaction(async (tx) => {
      const inserted = await tx
        .insert(posts)
        .values({
          id: postId,
          authorId: anonymous ? null : profile.id,
          pseudonym: anonymous ? deriveAnonHandle(profile.id) : null,
          institutionId: profile.institutionId,
          body,
          type: type || "NORMAL",
          scope: scope || "CAMPUS",
          isAnonymous: anonymous,
          title: title || null,
          communityId: communityId || null,
          status: safety.status,
          riskScore: safety.riskScore,
        })
        .returning();

      if (anonymous) {
        await tx
          .insert(anonIdentityVault)
          .values({
            handle: deriveAnonHandle(profile.id),
            sealedIdentity: sealIdentity(profile.id),
          })
          .onConflictDoNothing({ target: anonIdentityVault.handle });
      }

      return inserted;
    });

    // Award +5 points
    await db.update(userProfiles)
      .set({ points: (profile.points || 0) + 5 })
      .where(eq(userProfiles.id, profile.id));

    // If type is POLL, insert options
    if (type === "POLL" && options && options.length > 0) {
      const optionsToInsert = options
        .filter(opt => opt.trim().length > 0)
        .map(opt => ({
          postId: newPost.id,
          text: opt,
        }));
      if (optionsToInsert.length > 0) {
        await db.insert(pollOptions).values(optionsToInsert);
      }
    }

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
