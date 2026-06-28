import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { posts, userProfiles, pollOptions } from "@/db/schema";
import { hexclaveServerApp } from "@/hexclave/server";
import { eq } from "drizzle-orm";

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
    const { body, type, scope, isAnonymous, title, options } = data as {
      body: string;
      type?: "NORMAL" | "CONFESSION" | "POLL" | "QUESTION";
      scope?: "CAMPUS" | "GLOBAL";
      isAnonymous?: boolean;
      title?: string;
      options?: string[];
    };

    if (!body || body.trim().length === 0) {
      return NextResponse.json({ error: "Post body cannot be empty" }, { status: 400 });
    }

    // Safety Checks (Doxxing / Personal info detection)
    const phoneRegex = /(\+?\d{1,4}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/g;
    
    // Slur blocklist (examples)
    const blocklist = ["slur1", "slur2", "offensiveword"]; // Replace with actual words if needed
    const lowerBody = body.toLowerCase();
    
    const containsPhone = phoneRegex.test(body);
    const containsEmail = emailRegex.test(body);
    const containsBlockedWord = blocklist.some(word => lowerBody.includes(word));

    if (containsPhone || containsEmail) {
      return NextResponse.json({ 
        error: "Post blocked: Sharing phone numbers or email addresses is not allowed to prevent doxxing." 
      }, { status: 400 });
    }

    if (containsBlockedWord) {
      return NextResponse.json({ 
        error: "Post blocked: Contains words that violate our community safety guidelines." 
      }, { status: 400 });
    }

    // Insert post
    const [newPost] = await db.insert(posts).values({
      authorId: profile.id,
      institutionId: profile.institutionId,
      body,
      type: type || "NORMAL",
      scope: scope || "CAMPUS",
      isAnonymous: isAnonymous || false,
      title: title || null,
      status: "PUBLISHED", // Assuming no auto-hide logic for now
      riskScore: 0,
    }).returning();

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
