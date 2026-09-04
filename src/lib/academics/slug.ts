import { eq, ilike } from "drizzle-orm";
import { getDb } from "@/db";
import { academicResources } from "@/db/schema";

/**
 * Creates a clean, descriptive URL slug from an academic resource.
 * e.g. "Operating Systems (CS304) Complete Handwritten Notes" -> "cs304-operating-systems-complete-handwritten-notes"
 */
export function slugifyAcademicResource(resource: {
  id: string;
  subjectCode?: string | null;
  title: string;
}): string {
  const code = (resource.subjectCode || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 10);

  const cleanTitle = resource.title
    .toLowerCase()
    .replace(/\([^)]*\)/g, "") // remove parenthetical code like (CS304)
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 65)
    .replace(/-+$/, "");

  if (code && !cleanTitle.startsWith(code)) {
    return `${code}-${cleanTitle}`;
  }

  return cleanTitle || resource.id;
}

/**
 * Resolves an academic resource from either its raw ID or an SEO slug.
 */
export async function resolveAcademicResource(identifier: string) {
  const db = getDb();
  const trimmed = identifier.trim();

  // 1. Direct ID match
  const byId = await db.query.academicResources.findFirst({
    where: eq(academicResources.id, trimmed),
    with: {
      uploader: {
        columns: {
          id: true,
          userId: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          points: true,
          branch: true,
          year: true,
          course: true,
        },
      },
      institution: {
        columns: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
        },
      },
      comments: {
        with: {
          author: {
            columns: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: (comments, { desc }) => [desc(comments.createdAt)],
      },
    },
  });

  if (byId) return byId;

  // 2. Slug match: Extract possible subject code or keyword prefix
  const parts = trimmed.split("-");
  const potentialCode = parts[0]?.toUpperCase();

  if (potentialCode && potentialCode.length >= 3 && potentialCode.length <= 8) {
    const candidates = await db.query.academicResources.findMany({
      where: ilike(academicResources.subjectCode, potentialCode),
      with: {
        uploader: {
          columns: {
            id: true,
            userId: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            points: true,
            branch: true,
            year: true,
            course: true,
          },
        },
        institution: {
          columns: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
        comments: {
          with: {
            author: {
              columns: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: (comments, { desc }) => [desc(comments.createdAt)],
        },
      },
    });

    for (const candidate of candidates) {
      if (slugifyAcademicResource(candidate) === trimmed) {
        return candidate;
      }
    }

    if (candidates.length > 0) {
      return candidates[0];
    }
  }

  // 3. Fallback: Search by title prefix match
  const keyword = parts.slice(0, 3).join(" ");
  if (keyword) {
    const fallbackMatch = await db.query.academicResources.findFirst({
      where: ilike(academicResources.title, `%${keyword}%`),
      with: {
        uploader: {
          columns: {
            id: true,
            userId: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            points: true,
            branch: true,
            year: true,
            course: true,
          },
        },
        institution: {
          columns: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
          },
        },
        comments: {
          with: {
            author: {
              columns: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: (comments, { desc }) => [desc(comments.createdAt)],
        },
      },
    });

    if (fallbackMatch) return fallbackMatch;
  }

  return null;
}
