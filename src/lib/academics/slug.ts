import { eq, ilike, or } from "drizzle-orm";
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
 * Resolves an academic resource from either its raw ID, an alias, or an SEO slug.
 */
export async function resolveAcademicResource(identifier: string) {
  const db = getDb();
  const trimmed = identifier.trim();

  const withRelations = {
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
      } as const,
    },
    institution: {
      columns: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
      } as const,
    },
    comments: {
      with: {
        author: {
          columns: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          } as const,
        },
      },
      orderBy: (comments: any, { desc }: any) => [desc(comments.createdAt)],
    },
  };

  // 1. Direct exact ID match
  const byId = await db.query.academicResources.findFirst({
    where: eq(academicResources.id, trimmed),
    with: withRelations,
  });
  if (byId) return byId;

  // 1b. Case-insensitive exact ID match
  const byIlikeId = await db.query.academicResources.findFirst({
    where: ilike(academicResources.id, trimmed),
    with: withRelations,
  });
  if (byIlikeId) return byIlikeId;

  // 1c. Stripped / Prefixed ID match (handles acad_ prefix mismatch)
  if (trimmed.startsWith("acad_")) {
    const stripped = trimmed.replace(/^acad_/, "");
    const byStripped = await db.query.academicResources.findFirst({
      where: ilike(academicResources.id, `%${stripped}%`),
      with: withRelations,
    });
    if (byStripped) return byStripped;
  } else {
    const byPrefixed = await db.query.academicResources.findFirst({
      where: ilike(academicResources.id, `acad_%${trimmed}%`),
      with: withRelations,
    });
    if (byPrefixed) return byPrefixed;
  }

  // 2. Tokenized match (split by both hyphens and underscores)
  const tokens = trimmed.toLowerCase().split(/[-_]+/).filter(Boolean);

  // Check known acronyms/subjects
  const knownSubjectMap: Record<string, string> = {
    dsa: "CS301",
    os: "CS303",
    dbms: "CS302",
    flat: "CS304",
    toc: "CS304",
    cd: "CS305",
    cn: "CS401",
    bee: "EE24101",
    bme: "ME24101",
    math1: "MA101",
    math2: "MA102",
    bio: "BE24102",
  };

  let mappedSubjectCode: string | null = null;
  for (const t of tokens) {
    if (knownSubjectMap[t]) {
      mappedSubjectCode = knownSubjectMap[t];
      break;
    }
  }

  // Search by potential subject code (e.g. CS301, BE24102, EE24101, or mapped code)
  const potentialCode =
    mappedSubjectCode ||
    tokens.find((t) => /^[a-z]{2,5}\d{3,6}$/i.test(t) || (t.length >= 3 && t.length <= 8 && /\d/.test(t)))?.toUpperCase();

  if (potentialCode) {
    const candidates = await db.query.academicResources.findMany({
      where: ilike(academicResources.subjectCode, potentialCode),
      with: withRelations,
      limit: 10,
    });

    // Check slug equivalence
    for (const candidate of candidates) {
      if (slugifyAcademicResource(candidate) === trimmed) {
        return candidate;
      }
    }

    // Check if tokens mention resource type (e.g. pyq, notes)
    if (tokens.includes("pyq") || tokens.includes("qp") || tokens.includes("questionpaper")) {
      const pyqCandidate = candidates.find((c) => c.resourceType === "PYQ");
      if (pyqCandidate) return pyqCandidate;
    }
    if (tokens.includes("notes") || tokens.includes("handwritten")) {
      const notesCandidate = candidates.find((c) => c.resourceType === "NOTES");
      if (notesCandidate) return notesCandidate;
    }

    if (candidates.length > 0) {
      return candidates[0];
    }
  }

  // 3. Fallback: Search by keyword in title, ID, or subject name
  const meaningfulTokens = tokens.filter(
    (t) => !["acad", "bitsyll", "bithub", "notes", "note", "01", "1", "2", "3", "collection", "all"].includes(t)
  );

  if (meaningfulTokens.length > 0) {
    // Try combined match first
    const keyword = meaningfulTokens.join("%");
    const fallbackMatch = await db.query.academicResources.findFirst({
      where: or(
        ilike(academicResources.title, `%${keyword}%`),
        ilike(academicResources.id, `%${keyword}%`),
        ilike(academicResources.subjectName, `%${keyword}%`)
      ),
      with: withRelations,
    });

    if (fallbackMatch) return fallbackMatch;

    // Try each token individually (e.g. "dsa", "pyq", "os", "dbms")
    for (const t of meaningfulTokens) {
      if (t.length >= 3) {
        const tokenMatch = await db.query.academicResources.findFirst({
          where: or(
            ilike(academicResources.id, `%${t}%`),
            ilike(academicResources.title, `%${t}%`),
            ilike(academicResources.subjectCode, `%${t}%`),
            ilike(academicResources.subjectName, `%${t}%`)
          ),
          with: withRelations,
        });
        if (tokenMatch) return tokenMatch;
      }
    }
  }

  return null;
}
