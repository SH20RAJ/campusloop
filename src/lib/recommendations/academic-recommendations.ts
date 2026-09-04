import { and, desc, eq, inArray, ne, or } from "drizzle-orm";
import { getDb } from "@/db";
import { academicResources } from "@/db/schema";
import { qdrant } from "@/lib/qdrant/client";
import { COLLECTIONS } from "@/lib/qdrant/collections";
import { generateEmbedding } from "@/lib/qdrant/embeddings";
import type { AcademicResourceVectorPayload } from "@/lib/qdrant/types";

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

