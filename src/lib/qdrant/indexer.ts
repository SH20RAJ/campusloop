import { qdrant } from "./client";
import { COLLECTIONS } from "./collections";
import { generateEmbedding } from "./embeddings";
import type { PostVectorPayload, ProfileVectorPayload } from "./types";

/**
 * Asynchronously indexes a post into Qdrant in the background (fire-and-forget).
 */
export async function indexPostVector(post: {
  id: string;
  title?: string | null;
  body: string;
  type: string;
  scope?: string | null;
  isAnonymous?: boolean | null;
  institutionId?: string | null;
  authorId?: string | null;
  hashtags?: string[];
  createdAt?: Date | number;
}): Promise<boolean> {
  try {
    const textToEmbed = [post.title || "", post.body, post.type, ...(post.hashtags || [])]
      .filter(Boolean)
      .join(" ");

    const vector = await generateEmbedding(textToEmbed);

    const payload: PostVectorPayload = {
      postId: post.id,
      institutionId: post.institutionId ?? null,
      authorId: post.authorId ?? undefined,
      type: post.type,
      scope: (post.scope as "CAMPUS" | "GLOBAL") ?? "GLOBAL",
      isAnonymous: Boolean(post.isAnonymous),
      hashtags: post.hashtags || [],
      createdAt:
        typeof post.createdAt === "number"
          ? post.createdAt
          : post.createdAt
            ? new Date(post.createdAt).getTime()
            : Date.now(),
    };

    return await qdrant.upsert(COLLECTIONS.POSTS, [
      {
        id: post.id,
        vector,
        payload,
      },
    ]);
  } catch (err) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("[Qdrant Indexer Error] Failed to index post:", err);
    }
    return false;
  }
}

/**
 * Asynchronously indexes a user profile for Campus Dating & Discovery.
 */
export async function indexProfileVector(profile: {
  id: string;
  displayName?: string | null;
  bio?: string | null;
  course?: string | null;
  branch?: string | null;
  year?: number | null;
  gender?: string | null;
  interests?: string[];
  institutionId?: string | null;
  points?: number;
}): Promise<boolean> {
  try {
    const textToEmbed = [
      profile.bio || "",
      profile.course || "",
      profile.branch || "",
      ...(profile.interests || []),
    ]
      .filter(Boolean)
      .join(" ");

    const vector = await generateEmbedding(textToEmbed);

    const payload: ProfileVectorPayload = {
      profileId: profile.id,
      institutionId: profile.institutionId ?? null,
      gender: profile.gender ?? null,
      course: profile.course ?? null,
      branch: profile.branch ?? null,
      year: profile.year ?? null,
      interests: profile.interests || [],
      points: profile.points ?? 0,
    };

    return await qdrant.upsert(COLLECTIONS.DATING_PROFILES, [
      {
        id: profile.id,
        vector,
        payload,
      },
    ]);
  } catch (err) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("[Qdrant Indexer Error] Failed to index profile:", err);
    }
    return false;
  }
}

/**
 * Asynchronously indexes an academic resource for semantic search and recommendation matching.
 */
export async function indexAcademicResourceVector(resource: {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  branch: string;
  semester: number;
  resourceType: string;
  description?: string | null;
  moduleOrChapter?: string | null;
  institutionId?: string | null;
  uploaderId?: string | null;
  tags?: string[];
}): Promise<boolean> {
  try {
    const textToEmbed = [
      resource.subjectCode,
      resource.subjectName,
      resource.title,
      resource.branch,
      `Semester ${resource.semester}`,
      resource.resourceType,
      resource.moduleOrChapter || "",
      resource.description || "",
      ...(resource.tags || []),
    ]
      .filter(Boolean)
      .join(" ");

    const vector = await generateEmbedding(textToEmbed);

    return await qdrant.upsert(COLLECTIONS.ACADEMIC_RESOURCES, [
      {
        id: resource.id,
        vector,
        payload: {
          resourceId: resource.id,
          institutionId: resource.institutionId ?? null,
          uploaderId: resource.uploaderId ?? "",
          title: resource.title,
          subjectCode: resource.subjectCode,
          subjectName: resource.subjectName,
          branch: resource.branch,
          semester: resource.semester,
          resourceType: resource.resourceType,
        },
      },
    ]);
  } catch (err) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("[Qdrant Indexer Error] Failed to index academic resource:", err);
    }
    return false;
  }
}

/**
 * Removes a post from Qdrant vector index upon deletion.
 */
export async function removePostVector(postId: string): Promise<boolean> {
  try {
    return await qdrant.delete(COLLECTIONS.POSTS, [postId]);
  } catch {
    return false;
  }
}
