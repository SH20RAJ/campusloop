import { UserProfile } from "@/db/schema";
import { isViewerProfile } from "@/lib/viewer";
import { NextResponse } from "next/server";

export type UserCapability =
  | "READ_PUBLIC_CONTENT"
  | "SAVE_POST"
  | "LIKE_POST"
  | "COMMENT_POST"
  | "CREATE_POST"
  | "JOIN_COMMUNITY"
  | "SEND_MESSAGE"
  | "CAMPUS_MATCH"
  | "SECRET_CRUSH"
  | "ANONYMOUS_POST"
  | "MARKETPLACE_ORDER";

const VIEWER_ALLOWED_CAPABILITIES: Set<UserCapability> = new Set([
  "READ_PUBLIC_CONTENT",
  "SAVE_POST",
]);

const CAPABILITY_MESSAGES: Record<UserCapability, { title: string; desc: string }> = {
  READ_PUBLIC_CONTENT: {
    title: "Browse Public Content",
    desc: "Explore discussions and buzz across Indian campuses.",
  },
  SAVE_POST: {
    title: "Save Posts to Vault",
    desc: "Bookmark valuable campus discussions to your personal archive.",
  },
  LIKE_POST: {
    title: "Likes Unlock in Student Mode",
    desc: "React and upvote campus threads once you join with your college email.",
  },
  COMMENT_POST: {
    title: "Comments Unlock in Student Mode",
    desc: "Join the live banter with verified students from this campus.",
  },
  CREATE_POST: {
    title: "Posting Unlocks in Student Mode",
    desc: "Share your campus vibes and questions with classmates.",
  },
  JOIN_COMMUNITY: {
    title: "Communities Unlock in Student Mode",
    desc: "Join clubs, batch groups, and interest hubs on campus.",
  },
  SEND_MESSAGE: {
    title: "Messaging Unlocks in Student Mode",
    desc: "Direct message fellow verified students.",
  },
  CAMPUS_MATCH: {
    title: "Campus Match Unlocks in Student Mode",
    desc: "Connect and match with verified students on campus (18+).",
  },
  SECRET_CRUSH: {
    title: "Secret Crush Unlocks in Student Mode",
    desc: "Send anonymous crush signals to classmates safely.",
  },
  ANONYMOUS_POST: {
    title: "Anonymous Mode Unlocks in Student Mode",
    desc: "Post zero-trace campus confessions safely.",
  },
  MARKETPLACE_ORDER: {
    title: "Ordering Unlocks in Student Mode",
    desc: "Rent bikes and buy from campus stores directly.",
  },
};

export interface CapabilitySubject {
  institutionId: string | null;
  role?: string | null;
}

/**
 * Check if a profile possesses a given capability.
 */
export async function hasCapability(
  profile: CapabilitySubject | null | undefined,
  capability: UserCapability
): Promise<boolean> {
  if (!profile) {
    return capability === "READ_PUBLIC_CONTENT";
  }

  const isViewer = await isViewerProfile({
    institutionId: profile.institutionId,
    role: profile.role,
  });
  if (isViewer || profile.role === "VIEWER") {
    return VIEWER_ALLOWED_CAPABILITIES.has(capability);
  }

  return true;
}

/**
 * API Guard: Returns a 403 Response with structured error metadata if capability is lacking.
 */
export async function rejectIfLacksCapability(
  profile: CapabilitySubject | null | undefined,
  capability: UserCapability
): Promise<NextResponse | null> {
  const allowed = await hasCapability(profile, capability);
  if (!allowed) {
    const meta = CAPABILITY_MESSAGES[capability];
    return NextResponse.json(
      {
        error: meta.desc,
        title: meta.title,
        previewMode: true,
        requiredCapability: capability,
      },
      { status: 403 }
    );
  }
  return null;
}
