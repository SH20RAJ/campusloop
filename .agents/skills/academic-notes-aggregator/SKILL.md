---
name: academic-notes-aggregator
description: Comprehensive handbook for AI agents curating, verifying, indexing, and auto-organizing university notes, PYQs, and semester study materials on CampusLoop.
---

# 📚 CampusLoop — Academic Notes Aggregator & Study Engine Handbook

This skill guides AI agents and developers in maintaining, scraping, curating, and validating verified college study materials (Notes, Previous Year Questions (PYQs), Formula Cheat Sheets, Lab Manuals) and powering the personalized semester study locker and AI Study Agents on **CampusLoop**.

---

## 🎯 1. Core Motive & Student Value

Indian engineering and university students face fragmented, unorganized academic resources:
- Scattered across shady Telegram channels, broken Google Drive links, and messy WhatsApp groups.
- Students end up downloading 50+ PDFs onto their mobile phones every semester, cluttering storage.
- Notes often don't match the specific university's syllabus or course codes.

CampusLoop solves this through:
1. **Curated & Verified University Notes**: Indexed by University, Branch/Department, Semester, and Course Code.
2. **Auto-Organized Semester Locker (`/app/academics/saved`)**: 1-click "Save Full Semester Pack" so students can bookmark all their semester resources to their cloud locker instead of downloading heavy files.
3. **AI Study Agents ("Study with AI Agents")**: Pre-loaded syllabus context, exam solution prompts, and formula cheat sheets directly exportable to ChatGPT & Claude.
4. **Behavioral Personalization**: Automatically tracks whether a student prefers `CHEAT_SHEET`, `PYQ`, or `NOTES`, boosting their feed with relevant materials (+30 ranking score).
5. **Zero 404 Policy**: Continuous automated health verification ensuring all hosted PDFs are 200 OK before appearing on student feeds.

---

## 🏗️ 2. Database Schema & Architecture

### A. `academic_resources` Table (`src/db/schema/academic-resources.ts`)
| Field | Type | Description |
|---|---|---|
| `id` | `text` (CUID) | Unique resource identifier |
| `institutionId` | `text` | References `institutions.id` (e.g. BIT Mesra, IIT Bombay) |
| `department` | `text` | e.g., "Computer Science", "Electrical Engineering" |
| `semester` | `integer` | 1 through 8 |
| `subjectCode` | `text` | e.g., "CS24101", "MA101", "PH110" |
| `subjectName` | `text` | Full readable subject name |
| `title` | `text` | Descriptive document title |
| `description` | `text` | Brief syllabus summary or module coverage |
| `fileUrl` | `text` | Validated PDF / Drive preview URL |
| `fileType` | `text` | `PDF`, `DRIVE_LINK`, etc. |
| `resourceType` | `enum` | `NOTES`, `PYQ`, `CHEAT_SHEET`, `LAB_MANUAL`, `SYLLABUS` |
| `viewsCount` | `integer` | Number of student views |
| `downloadsCount` | `integer` | Number of student study sessions |
| `upvotesCount` | `integer` | Helpful rating count |
| `isVerified` | `boolean` | Verified by student curator / academic lead |
| `isSeeded` | `boolean` | `false` for active feed visibility |

### B. `saved_academic_resources` Table (Semester Cloud Locker)
```ts
export const savedAcademicResources = pgTable(
  "saved_academic_resources",
  {
    id: id(),
    userId: text("user_id").notNull().references(() => userProfiles.id, { onDelete: "cascade" }),
    resourceId: text("resource_id").notNull().references(() => academicResources.id, { onDelete: "cascade" }),
    createdAt,
  },
  (table) => [
    uniqueIndex("saved_academic_resources_user_resource_idx").on(table.userId, table.resourceId),
    index("saved_academic_resources_user_idx").on(table.userId, table.createdAt),
    index("saved_academic_resources_resource_idx").on(table.resourceId),
  ]
);
```

---

## ⚡ 3. Behavioral Personalization & Feed Recommendation

### Tracking Student Affinity
When a student saves, views, or upvotes a study resource, `trackUserBehavior` logs the event in Redis and PostgreSQL:
```ts
await trackUserBehavior({
  userId: profile.id,
  eventType: "POST_BOOKMARK",
  metadata: {
    resourceId: resource.id,
    resourceType: resource.resourceType,
    subjectCode: resource.subjectCode,
    semester: resource.semester,
  },
});
```

### Feed Scoring Algorithm (`src/lib/recommendations/academic-recommendations.ts`)
The feed ranks notes based on student academic context:
- **Same Semester & Subject Match**: +60 points
- **User's Preferred Resource Type** (based on saved items & upvotes): +30 points
- **High Student Upvotes**: +0.5 points per vote
- **Verified Curator Badge**: +15 points
- **Vector Semantic Similarity (Qdrant)**: +25 points (fallback to SQL if Qdrant unavailable)

---

## 🤖 4. "Study with AI Agents" Specification

The academic study bar (`src/components/academics/academic-ai-study-bar.tsx`) provides 1-tap integrations:

1. **ChatGPT One-Tap (`Teach Me on ChatGPT ↗`)**:
   Generates a structured syllabus-grounded prompt including:
   - Subject Code & Name
   - Target Module Concepts
   - Exam-focused pedagogical instructions: *step-by-step mathematical derivations, intuitive real-world analogies, and common exam traps to avoid*.

2. **Claude One-Tap (`Teach Me on Claude ↗`)**:
   Formats an analytical deep-dive prompt optimized for Claude's long-context reasoning.

3. **Master Prompt Copy**:
   Copies the verified master prompt to the student's clipboard with instant haptic and toast confirmation.

4. **Category Feature Cards**:
   - *Syllabus Based*: Filter to curriculum-aligned lecture slides.
   - *Formula Cheat Sheets*: Quick formula recap sheets for last-night exam prep.
   - *PYQs & Solutions*: Solved question papers with marks breakdown.
   - *Concept Explainers*: Modular notes with diagrams and code implementations.

---

## 🛡️ 5. Zero-404 Validation Rule & PDF Verification

### Strict PDF Health Check Pipeline (`src/lib/academics/pdf-validator.ts`)
Before any resource is created via `/api/academics` or seed scripts, it must pass health verification:
```ts
import { validateAcademicResourceUrl } from "@/lib/academics/pdf-validator";

const check = await validateAcademicResourceUrl(fileUrl);
if (!check.isValid) {
  // Reject or mark inactive; never serve broken links to students
}
```

### Maintenance Scripts
- **Scan for Broken Notes**: `bun run scripts/find-broken-academic-notes.ts`
- **Fast Status Check**: `bun run scripts/fast-check-notes.ts`
- **Auto-Fix Broken URLs**: `bun run scripts/fix-broken-notes.ts`
- **Curate New Resources**: `bun run scripts/scrape-and-curate-academics.ts`

---

## 📱 6. UI/UX Guidelines (Strict Adherence)

1. **Dedicated Full Pages (Rule 7)**:
   - Creation/upload must live at dedicated Next.js App Router routes (e.g. `/app/academics/upload`).
   - Saved Locker must live at `/app/academics/saved`.
   - Never use cramped modal dialogs for multi-field academic document submission.

2. **Zero Raw Emojis (Rule 11)**:
   - Never use raw emojis in tabs, headers, or badges.
   - Use `lucide-react` icons (e.g., `BookOpen`, `FileCheck2`, `Bookmark`, `Sparkles`, `Download`, `GraduationCap`).

3. **1-Click Semester Pack**:
   - Provide a prominent banner allowing students to save an entire semester's verified notes in 1 tap.
   - Endpoint: `POST /api/academics/saved/semester-pack` with `{ semester: number }`.

---

## 🚀 7. Verification Checklist for New Academic Features

- [ ] All database DDL executed via single prepared statements in Neon.
- [ ] Server Component `page.tsx` exports metadata without `"use client"`.
- [ ] Interactive logic extracted to `*-client.tsx`.
- [ ] All resource links verified 200 OK.
- [ ] Fallback in place if Qdrant vector search times out (>600ms).
- [ ] Zero raw emojis across all client interfaces.
