import { and, desc, eq, ilike, inArray, ne, or, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { academicResources, academicResourceVotes, savedAcademicResources } from "@/db/schema";
import { qdrant } from "@/lib/qdrant/client";
import { COLLECTIONS } from "@/lib/qdrant/collections";
import { generateEmbedding } from "@/lib/qdrant/embeddings";
import type { AcademicResourceVectorPayload } from "@/lib/qdrant/types";
import { getUserAffinityInterests } from "@/lib/user-behavior";

export interface SimilarAcademicResourceItem {
  resource: {
    id: string;
    title: string;
    description?: string | null;
    subjectCode: string;
    subjectName: string;
    branch: string;
    semester: number;
    resourceType: string;
    moduleOrChapter?: string | null;
    fileUrl?: string | null;
    driveUrl?: string | null;
    upvotesCount: number;
    downloadsCount: number;
    viewsCount: number;
    isVerified: boolean;
    createdAt: string | Date;
    uploader: {
      id: string;
      username: string;
      displayName: string;
      avatarUrl?: string | null;
    };
    institution?: {
      id: string;
      name: string;
      slug: string;
    } | null;
  };
  matchScore: number;
  matchReason: string;
}

// Curriculum Knowledge Graph for automatic cross-semester and corequisite subject discovery
const CURRICULUM_KNOWLEDGE_GRAPH: Record<string, string[]> = {
  // Computer Science & IT
  CS305: ["FLAT", "CS304", "Theory of Computation", "Automata", "DSA", "CS201", "Grammar", "Parsing", "Lex", "AST", "Symbol Table", "Code Optimization"],
  CS304: ["Compiler Design", "CS305", "Automata", "Context Free Grammar", "Pushdown Automata", "Turing Machine", "Discrete Mathematics", "DFA", "NFA"],
  CS201: ["Algorithms", "Data Structures", "Trees", "Graphs", "Sorting", "Compiler Design", "Operating Systems", "CS304", "CS206", "DAA"],
  CS303: ["Operating Systems", "Process Synchronization", "Semaphores", "Virtual Memory", "Computer Architecture", "Linux", "System Programming"],
  CS301: ["DBMS", "Database Management", "SQL", "Normalization", "Relational Algebra", "Transactions", "Indexing", "B Trees"],
  CS302: ["DBMS", "SQL", "Database Systems", "ER Diagrams", "Transactions", "Relational Algebra"],
  CS307: ["Computer Networks", "TCP IP", "Routing", "OSI Model", "Sockets", "HTTP", "Cryptography"],
  CS401: ["Machine Learning", "Artificial Intelligence", "Deep Learning", "Neural Networks", "Gradient Descent", "Supervised Learning"],
  // Electronics & Electrical
  EC201: ["Digital Electronics", "Logic Design", "Boolean Algebra", "K-Maps", "Flip Flops", "Registers", "Combinational Circuits"],
  EC301: ["Analog Circuits", "BJT", "MOSFET", "Op-Amp", "Small Signal Analysis", "Amplifiers", "Multisim", "Differential Amplifier"],
  EE101: ["Basic Electrical Engineering", "Electrical Science", "KCL", "KVL", "Thevenin", "Norton", "Transformers", "AC Circuits", "Phasors"],
  // Basic Sciences & Math
  MA101: ["Engineering Mathematics I", "Calculus", "Linear Algebra", "Eigenvalues", "Eigenvectors", "Multivariable Calculus", "Sequences"],
  MA102: ["Engineering Mathematics II", "Differential Equations", "Laplace Transform", "Fourier Series", "Complex Variables"],
  MA24102: ["Mathematics II", "Vector Calculus", "Complex Integration", "Analytic Functions", "Residue Theorem"],
  PH101: ["Engineering Physics", "Optics", "Lasers", "Quantum Mechanics", "Electromagnetism", "Interference"],
  CH101: ["Engineering Chemistry", "Thermodynamics", "Polymers", "Electrochemistry", "Spectroscopy"],
};

/**
 * Retrieves semantically similar academic materials with zero-downtime PostgreSQL relational fallback.
 */
export async function getSimilarAcademicResources(
  targetResourceId: string,
  options: {
    limit?: number;
    currentUserId?: string;
  } = {}
): Promise<SimilarAcademicResourceItem[]> {
  const limit = options.limit ?? 4;
  const db = getDb();

  // 1. Fetch target resource details
  const baseResource = await db.query.academicResources.findFirst({
    where: eq(academicResources.id, targetResourceId),
    with: {
      uploader: {
        columns: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      institution: {
        columns: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!baseResource) {
    return [];
  }

  // 2. Attempt Semantic Vector Search via Qdrant with curriculum co-requisite awareness
  try {
    const curriculumBoost = CURRICULUM_KNOWLEDGE_GRAPH[baseResource.subjectCode] || [];
    const textToEmbed = `${baseResource.subjectCode} ${baseResource.subjectName} ${baseResource.title} ${baseResource.branch} Sem ${baseResource.semester} ${baseResource.resourceType} ${baseResource.description || ""} ${curriculumBoost.join(" ")}`;
    const vector = await generateEmbedding(textToEmbed);

    const hits = await qdrant.search<AcademicResourceVectorPayload>(COLLECTIONS.ACADEMIC_RESOURCES, vector, {
      limit: limit + 8,
      scoreThreshold: 0.14,
    });

    const matchingHits = hits
      .filter((h) => {
        const resId = (h.payload as any)?.resourceId || (h.payload as any)?.id || String(h.id);
        return resId !== targetResourceId;
      })
      .slice(0, limit);

    if (matchingHits.length > 0) {
      const pointIds = matchingHits.map(
        (h) => (h.payload as any)?.resourceId || (h.payload as any)?.id || String(h.id)
      );
      const scoreMap = new Map(
        matchingHits.map((h) => [
          (h.payload as any)?.resourceId || (h.payload as any)?.id || String(h.id),
          h.score,
        ])
      );

      const hydratedRows = await db.query.academicResources.findMany({
        where: inArray(academicResources.id, pointIds),
        with: {
          uploader: {
            columns: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          institution: {
            columns: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      if (hydratedRows.length > 0) {
        return hydratedRows
          .sort((a, b) => (scoreMap.get(b.id) ?? 0) - (scoreMap.get(a.id) ?? 0))
          .map((res) => {
            const score = scoreMap.get(res.id) ?? 0.85;
            const isSameSubject = res.subjectCode === baseResource.subjectCode;
            const isCoRequisite = curriculumBoost.some(
              (k) =>
                res.title.toLowerCase().includes(k.toLowerCase()) ||
                res.subjectName.toLowerCase().includes(k.toLowerCase()) ||
                res.subjectCode.toLowerCase().includes(k.toLowerCase())
            );

            return {
              resource: res,
              matchScore: Math.round(score * 100) / 100,
              matchReason: isSameSubject
                ? `Exact Subject (${res.subjectCode})`
                : isCoRequisite
                  ? `Curriculum Co-Requisite`
                  : res.semester === baseResource.semester
                    ? `Semester ${res.semester} Core`
                    : "Semantic Vector Match",
            };
          });
      }
    }
  } catch (err) {
    // Graceful fallback on Qdrant timeout / network error
    console.warn("Qdrant academic vector search failed or timed out, executing PostgreSQL fallback:", err);
  }

  // 3. PostgreSQL Multi-Tier Relational Fallback (Guaranteed 100% Availability)
  const results: SimilarAcademicResourceItem[] = [];
  const seenIds = new Set<string>([targetResourceId]);

  // Tier 1: Same Subject Code (e.g. CS304 / CS201 other papers/notes)
  const tier1Rows = await db.query.academicResources.findMany({
    where: and(
      eq(academicResources.subjectCode, baseResource.subjectCode),
      ne(academicResources.id, targetResourceId)
    ),
    orderBy: [desc(academicResources.upvotesCount), desc(academicResources.downloadsCount)],
    limit: limit,
    with: {
      uploader: {
        columns: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      institution: {
        columns: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  for (const row of tier1Rows) {
    if (!seenIds.has(row.id)) {
      seenIds.add(row.id);
      results.push({
        resource: row,
        matchScore: 0.95,
        matchReason: `Same Subject (${row.subjectCode})`,
      });
    }
  }

  // Tier 2: Same Branch + Same Semester (e.g. other Sem 5 Computer Science courses)
  if (results.length < limit) {
    const tier2Rows = await db.query.academicResources.findMany({
      where: and(
        ne(academicResources.id, targetResourceId),
        eq(academicResources.semester, baseResource.semester),
        or(
          eq(academicResources.branch, baseResource.branch),
          eq(academicResources.branch, "All"),
          eq(academicResources.branch, "Computer Science")
        )
      ),
      orderBy: [desc(academicResources.upvotesCount), desc(academicResources.createdAt)],
      limit: limit - results.length + 3,
      with: {
        uploader: {
          columns: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        institution: {
          columns: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    for (const row of tier2Rows) {
      if (!seenIds.has(row.id) && results.length < limit) {
        seenIds.add(row.id);
        results.push({
          resource: row,
          matchScore: 0.8,
          matchReason: `Semester ${row.semester} ${row.branch}`,
        });
      }
    }
  }

  // Tier 3: Same Branch Popular Items
  if (results.length < limit) {
    const tier3Rows = await db.query.academicResources.findMany({
      where: and(
        ne(academicResources.id, targetResourceId),
        or(eq(academicResources.branch, baseResource.branch), eq(academicResources.branch, "All"))
      ),
      orderBy: [desc(academicResources.upvotesCount)],
      limit: limit - results.length,
      with: {
        uploader: {
          columns: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        institution: {
          columns: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    for (const row of tier3Rows) {
      if (!seenIds.has(row.id) && results.length < limit) {
        seenIds.add(row.id);
        results.push({
          resource: row,
          matchScore: 0.65,
          matchReason: `Popular in ${row.branch}`,
        });
      }
    }
  }

  return results;
}

/**
 * Performs semantic vector search on academic resources with metadata filtering.
 */
export async function searchAcademicResourcesVector(
  query: string,
  options: {
    limit?: number;
    branch?: string;
    semester?: number;
    resourceType?: string;
    institutionId?: string;
  } = {}
): Promise<Array<{ resource: any; score: number }>> {
  const limit = options.limit ?? 15;
  const db = getDb();

  try {
    const vector = await generateEmbedding(query);
    const hits = await qdrant.search<AcademicResourceVectorPayload>(
      COLLECTIONS.ACADEMIC_RESOURCES,
      vector,
      {
        limit: limit * 2,
        scoreThreshold: 0.12,
      }
    );

    if (hits.length > 0) {
      const pointIds = hits.map(
        (h) => (h.payload as any)?.resourceId || (h.payload as any)?.id || String(h.id)
      );
      const scoreMap = new Map(
        hits.map((h) => [
          (h.payload as any)?.resourceId || (h.payload as any)?.id || String(h.id),
          h.score,
        ])
      );

      const conditions: any[] = [inArray(academicResources.id, pointIds)];
      if (options.branch && options.branch !== "All" && options.branch !== "all") {
        const branchCond = or(eq(academicResources.branch, options.branch), eq(academicResources.branch, "All"));
        if (branchCond) conditions.push(branchCond);
      }
      if (options.semester) {
        conditions.push(eq(academicResources.semester, options.semester));
      }
      if (options.resourceType && options.resourceType !== "all" && options.resourceType !== "ALL") {
        conditions.push(eq(academicResources.resourceType, options.resourceType.toUpperCase()));
      }
      if (options.institutionId) {
        conditions.push(eq(academicResources.institutionId, options.institutionId));
      }

      const rows = await db.query.academicResources.findMany({
        where: conditions.length > 0 ? and(...conditions) : undefined,
        with: {
          uploader: {
            columns: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
          institution: {
            columns: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      return rows
        .sort((a, b) => (scoreMap.get(b.id) ?? 0) - (scoreMap.get(a.id) ?? 0))
        .slice(0, limit)
        .map((r) => ({
          resource: r,
          score: Math.round((scoreMap.get(r.id) ?? 0.8) * 100) / 100,
        }));
    }
  } catch (err) {
    console.warn("Vector academic search failed or timed out, using fallback:", err);
  }

  return [];
}

export interface PersonalizedAcademicFeedOptions {
  userId?: string;
  profile?: {
    id: string;
    branch?: string | null;
    year?: number | null;
    course?: string | null;
    institutionId?: string | null;
    interests?: string[] | null;
  } | null;
  scope?: "campus" | "global";
  branch?: string;
  resourceType?: string;
  semester?: number;
  searchQuery?: string;
  page: number;
  limit: number;
}

/**
 * Multi-factor personalized recommendation algorithm for CampusLoop Academics.
 * Adapts to student's college, branch, current semester, learning interests,
 * behavioral history, curriculum corequisites, and applies 30-min rotation jitter
 * and diversity interleaving to guarantee fresh and varied notes on every visit.
 */
export async function getPersonalizedAcademicFeed(
  options: PersonalizedAcademicFeedOptions
): Promise<{
  items: any[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  totalPages: number;
}> {
  const {
    userId,
    profile,
    scope = "campus",
    branch,
    resourceType,
    semester,
    searchQuery,
    page = 1,
    limit = 20,
  } = options;

  const db = getDb();
  const conditions: any[] = [];

  // Scope filter (Campus vs Global)
  if (scope === "campus" && profile?.institutionId) {
    conditions.push(eq(academicResources.institutionId, profile.institutionId));
  }

  // Explicit branch filter if user requested
  if (branch && branch !== "all" && branch !== "All") {
    conditions.push(or(eq(academicResources.branch, branch), eq(academicResources.branch, "All")));
  }

  // Explicit resource type filter if user requested
  if (resourceType && resourceType !== "all" && resourceType !== "ALL") {
    conditions.push(eq(academicResources.resourceType, resourceType.toUpperCase()));
  }

  // Explicit semester filter if user requested
  if (semester && !isNaN(semester) && semester >= 1 && semester <= 8) {
    conditions.push(eq(academicResources.semester, semester));
  }

  // Explicit search query
  if (searchQuery?.trim()) {
    const q = `%${searchQuery.trim()}%`;
    conditions.push(
      or(
        ilike(academicResources.title, q),
        ilike(academicResources.subjectCode, q),
        ilike(academicResources.subjectName, q),
        ilike(academicResources.moduleOrChapter, q),
        ilike(academicResources.description, q)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // 1. Get total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(academicResources)
    .where(whereClause);

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;

  // 2. Fetch candidate pool
  const candidateLimit = Math.min(100, Math.max(limit * 3, 45));
  const candidateOffset = Math.max(0, (page - 1) * limit);

  const candidates = await db.query.academicResources.findMany({
    where: whereClause,
    orderBy: [desc(academicResources.upvotesCount), desc(academicResources.createdAt)],
    limit: candidateLimit,
    offset: candidateOffset,
    with: {
      uploader: {
        columns: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          points: true,
        },
      },
      institution: {
        columns: {
          id: true,
          name: true,
          slug: true,
        },
      },
      comments: {
        columns: {
          id: true,
        },
      },
    },
  });

  if (candidates.length === 0) {
    return {
      items: [],
      total,
      page,
      limit,
      hasMore: false,
      totalPages,
    };
  }

  // 3. Extract User Behavioral Signals
  const upvotedResourceIds = new Set<string>();
  const engagedSubjectCodes = new Set<string>();
  const corequisiteCodes = new Set<string>();
  const preferredResourceTypes = new Map<string, number>();
  let affinityTags: string[] = [];

  if (userId) {
    try {
      // Get user's affinity tags from Redis
      affinityTags = await getUserAffinityInterests(userId);
    } catch {}

    if (profile?.id) {
      try {
        // Fetch recent saved materials to extract preferred format and subjects
        const savedList = await db.query.savedAcademicResources.findMany({
          where: eq(savedAcademicResources.profileId, profile.id),
          limit: 30,
          with: {
            resource: {
              columns: {
                resourceType: true,
                subjectCode: true,
              },
            },
          },
        });

        for (const s of savedList) {
          if (s.resource?.resourceType) {
            const t = s.resource.resourceType.toUpperCase();
            preferredResourceTypes.set(t, (preferredResourceTypes.get(t) || 0) + 4);
          }
          if (s.resource?.subjectCode) {
            engagedSubjectCodes.add(s.resource.subjectCode.toUpperCase());
          }
        }
      } catch (err) {
        console.warn("Could not retrieve user saved materials:", err);
      }

      try {
        // Fetch up to 20 recent upvotes from academicResourceVotes
        const recentVotes = await db.query.academicResourceVotes.findMany({
          where: eq(academicResourceVotes.profileId, profile.id),
          orderBy: [desc(academicResourceVotes.createdAt)],
          limit: 20,
          with: {
            resource: {
              columns: {
                id: true,
                subjectCode: true,
                branch: true,
                resourceType: true,
              },
            },
          },
        });

        for (const v of recentVotes) {
          if (v.resourceId) upvotedResourceIds.add(v.resourceId);
          if (v.resource?.resourceType) {
            const t = v.resource.resourceType.toUpperCase();
            preferredResourceTypes.set(t, (preferredResourceTypes.get(t) || 0) + 2);
          }
          if (v.resource?.subjectCode) {
            const code = v.resource.subjectCode.toUpperCase();
            engagedSubjectCodes.add(code);
            // Check curriculum graph for related topics
            const related = CURRICULUM_KNOWLEDGE_GRAPH[code];
            if (related) {
              for (const r of related) corequisiteCodes.add(r.toUpperCase());
            }
          }
        }
      } catch (err) {
        console.warn("Could not retrieve user academic votes:", err);
      }
    }
  }

  const userInterests = new Set<string>(
    [...(profile?.interests || []), ...affinityTags]
      .map((t) => t.toLowerCase().trim())
      .filter(Boolean)
  );

  const targetSems = profile?.year ? [profile.year * 2 - 1, profile.year * 2] : [];
  const pBranch = profile?.branch ? profile.branch.toLowerCase().trim() : null;

  // 4. Calculate Personalized Score for Each Candidate
  // Rotating time-slot seed (every 30 minutes, different items get subtle exploration boosts)
  const timeSlot = Math.floor(Date.now() / (1000 * 60 * 30));

  const scoredCandidates = candidates.map((item) => {
    let score = 50;
    let recommendationReason = "";

    // A. Campus Affinity (Same College syllabus)
    if (profile?.institutionId && item.institutionId === profile.institutionId) {
      score += 35;
      if (!recommendationReason) recommendationReason = "Your Campus Syllabus";
    }

    // B. Branch Relevance
    if (pBranch) {
      const iBranch = item.branch.toLowerCase().trim();
      if (
        iBranch === pBranch ||
        (pBranch.includes("computer") && iBranch.includes("computer")) ||
        (pBranch.includes("ece") && iBranch.includes("ece")) ||
        (pBranch.includes("mech") && iBranch.includes("mech")) ||
        (pBranch.includes("civil") && iBranch.includes("civil"))
      ) {
        score += 40;
        if (!recommendationReason) recommendationReason = `Curated for ${item.branch}`;
      } else if (item.branch === "All") {
        score += 15;
      }
    }

    // C. Current Semester Target
    if (targetSems.length > 0) {
      if (targetSems.includes(item.semester)) {
        score += 35;
        if (!recommendationReason) recommendationReason = `Semester ${item.semester} Core Subject`;
      } else if (Math.abs(item.semester - (profile?.year ? profile.year * 2 : 1)) <= 1) {
        score += 12;
      }
    }

    // D. Material Type Affinity (Student study preference boost)
    const typeWeight = preferredResourceTypes.get(item.resourceType.toUpperCase()) || 0;
    if (typeWeight > 0) {
      score += Math.min(30, typeWeight * 5);
      if (!recommendationReason) {
        const typeNames: Record<string, string> = {
          PYQ: "Exam Prep (PYQs)",
          CHEAT_SHEET: "Quick Revision Sheet",
          NOTES: "Lecture Study Notes",
          LAB_MANUAL: "Lab Practicals & Code",
        };
        recommendationReason = typeNames[item.resourceType.toUpperCase()] || "Your Preferred Format";
      }
    }

    // E. User Interest & Knowledge Graph Relevance
    let interestMatches = 0;
    const itemText = `${item.title} ${item.subjectName} ${item.subjectCode} ${item.moduleOrChapter || ""}`.toLowerCase();
    for (const interest of userInterests) {
      if (interest && itemText.includes(interest)) {
        interestMatches++;
      }
    }
    if (interestMatches > 0) {
      score += Math.min(50, interestMatches * 20);
      if (!recommendationReason) recommendationReason = "Matches Your Learning Interests";
    }

    // Corequisite boost from curriculum graph
    const itemCode = (item.subjectCode || "").toUpperCase();
    if (engagedSubjectCodes.has(itemCode)) {
      score += 30;
      if (!recommendationReason) recommendationReason = `More for ${itemCode}`;
    } else if (corequisiteCodes.has(itemCode)) {
      score += 25;
      if (!recommendationReason) recommendationReason = "Corequisite / Prerequisite Match";
    }

    // E. Engagement Quality Factor (Upvotes, Downloads, Views, Verified)
    const qualityScore = Math.min(
      45,
      (item.upvotesCount || 0) * 3 + (item.downloadsCount || 0) * 2 + (item.viewsCount || 0) * 0.1
    );
    score += qualityScore;
    if (item.isVerified) {
      score += 15;
    }

    // F. Recency Factor
    const daysOld = Math.max(0, (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    score += Math.max(0, 15 - daysOld * 0.2);

    // G. Dynamic Session Rotation Jitter (Solves "everytime I can see same results")
    const seed = `${profile?.id || "guest"}_${item.id}_${timeSlot}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
    }
    const rotationJitter = (Math.abs(hash) % 36) - 18; // -18 to +18 points variance
    score += rotationJitter;

    // H. De-duplication / Down-rank for materials user already upvoted
    if (upvotedResourceIds.has(item.id)) {
      score -= 35; // gently lower already upvoted materials to highlight unread ones
    }

    if (!recommendationReason) {
      if (item.upvotesCount > 5) recommendationReason = "Trending Among Students 🔥";
      else if (item.resourceType === "PYQ") recommendationReason = "Exam Prep PYQ 📑";
      else recommendationReason = "Campus Study Resource 📝";
    }

    return {
      ...item,
      commentsCount: item.comments?.length || 0,
      personalizedScore: Math.round(score),
      recommendationReason,
    };
  });

  // 5. Diversity Interleaving
  // Sort by personalizedScore descending
  scoredCandidates.sort((a, b) => b.personalizedScore - a.personalizedScore);

  const finalItems: any[] = [];
  const remaining = [...scoredCandidates];

  while (remaining.length > 0 && finalItems.length < limit) {
    const last1 = finalItems[finalItems.length - 1];
    const last2 = finalItems[finalItems.length - 2];

    // Find first item that does not repeat the same resourceType twice in a row if possible
    let pickIndex = 0;
    if (last1 && last2 && last1.resourceType === last2.resourceType) {
      const altIndex = remaining.findIndex(
        (r) =>
          r.resourceType !== last1.resourceType &&
          Math.abs(r.personalizedScore - remaining[0].personalizedScore) <= 25
      );
      if (altIndex > 0) pickIndex = altIndex;
    }

    finalItems.push(remaining.splice(pickIndex, 1)[0]);
  }

  return {
    items: finalItems,
    total,
    page,
    limit,
    hasMore,
    totalPages,
  };
}

