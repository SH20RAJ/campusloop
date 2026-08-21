---
name: campusloop-guide
description: Detailed architectural handbook, coding standards, database patterns, and workflow guidelines for AI agents working on the CampusLoop codebase.
---

# 🎓 CampusLoop — AI Agent Skill & Codebase Guide

This skill provides AI agents with comprehensive context, architectural rules, code conventions, and workflows required to safely and effectively extend the **CampusLoop** platform.

---

## 🚀 1. Platform Motive & Overview

**CampusLoop** is a verified, student-only social platform tailored for university campuses. Key features include:

- **Campus Feed (`/app`)**: Dynamic post feed supporting public posts, 100% anonymous confessions, interactive polls, questions, hashtag filtering, double-tap heart animations, and Twitter-style 1-tap & quote reposts.
- **Scope Switching**: Seamless toggle between **Campus** (my college only) and **Global** (across all colleges in India).
- **Stories / Vibes (`/app/stories/new`)**: 24-hour visual campus story publishing with progress-bar viewer and DM reply integration.
- **Campus Match / Dating (`/app/dating`)**: Swipeable card deck for verified campus matching with gender & scope filters, instant match celebration overlay, and direct chat links.
- **Campus Directory (`/app/colleges`)**: Searchable database of 1,350+ Indian college hubs with instant hub request modals.
- **Sub-Hubs & Communities (`/app/communities`)**: Interest-based student sub-communities.
- **Clout & Gamification (LP System)**: Loop Points system rewarding user activities, referral invites (+20 LP), and unlocking "Verified Star" status at 150+ LP.
- **Hexclave Authentication**: Handles secure user authentication, phone/email verification, and session management.

---

## 🏗️ 2. Core Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.2.6 (App Router, Turbopack) |
| **Runtime & Hosting** | Cloudflare Workers via OpenNext (`@opennextjs/cloudflare`) |
| **Database** | Neon Serverless PostgreSQL (`@neondatabase/serverless`) |
| **ORM** | Drizzle ORM (`drizzle-orm`, `drizzle-kit`) |
| **Authentication** | Hexclave Next SDK (`@hexclave/next`) |
| **State & Data Fetching** | SWR (`swr`) with centralized helpers (`src/lib/api.ts`) |
| **UI & Styling** | Tailwind CSS v4, Framer Motion (`motion`), Lucide Icons (`lucide-react`) |
| **Rich Text Editor** | Tiptap (`@tiptap/react`, `@tiptap/starter-kit`) |

---

## 📁 3. Codebase Directory Layout

```
src/
├── app/
│   ├── (main)/
│   │   ├── feed-client.tsx         # Main feed client shell
│   │   ├── colleges/               # College directory page & client
│   │   ├── communities/            # Communities & sub-hubs
│   │   ├── dating/                 # Campus matches / dating deck
│   │   ├── discover/               # Discover feed & featured campuses
│   │   ├── post/[id]/              # Single post & comments page
│   │   ├── post/new/               # Post composer
│   │   ├── posts/[type]/           # Filtered posts by type (POLL, CONFESSION)
│   │   ├── profile/edit/           # Profile edit client page
│   │   └── stories/new/            # Story / Vibe creator page
│   ├── api/                        # REST API endpoints
│   │   ├── feed/route.ts           # Dynamic feed with filter & backfill
│   │   ├── posts/                  # Post mutations (create, delete, vote, repost)
│   │   ├── dating/                 # Profiles & swipe endpoints
│   │   ├── stories/                # Story publishing & stream fetcher
│   │   └── profile/                # User profile updates
│   └── admin/                      # Moderation dashboard
├── components/
│   ├── feed/                       # Modular feed card subcomponents
│   │   ├── feed-card-header.tsx
│   │   ├── feed-card-actions.tsx
│   │   └── feed-card-repost-modal.tsx
│   ├── stories/                    # Modular story subcomponents
│   │   ├── story-avatar-item.tsx
│   │   └── story-viewer-modal.tsx
│   ├── dating/                     # Modular dating subcomponents
│   │   ├── dating-card-stack.tsx
│   │   ├── dating-filters-modal.tsx
│   │   └── dating-match-modal.tsx
│   ├── discover/                   # Modular discover subcomponents
│   │   └── featured-campus-card.tsx
│   ├── colleges/                   # Modular college subcomponents
│   │   ├── college-hub-card.tsx
│   │   └── add-college-modal.tsx
│   ├── post/                       # Modular post & comment components
│   │   ├── comment-item.tsx
│   │   └── post-composer-toolbar.tsx
│   └── ui/                         # Base Shadcn/Radix UI components
├── db/
│   ├── schema.ts                   # Centralized Drizzle schema definitions
│   └── index.ts                    # Neon database client setup
├── hooks/
│   ├── use-profile.ts              # Current profile SWR hook
│   ├── use-feed.ts                 # Feed stream SWR hook
│   ├── use-post-actions.ts         # Post vote/repost/delete handlers
│   ├── use-colleges.ts             # College directory search hook
│   ├── use-communities.ts          # Communities hook
│   └── use-stories.ts            # Stories hook
├── hexclave/
│   └── server.ts                   # Hexclave server SDK instance
└── lib/
    ├── api.ts                      # Centralized fetcher & API mutation helpers
    ├── utils.ts                    # Utility functions (cn, avatar URLs)
    ├── gamification.ts             # LP & Clout tier calculations
    └── moderation/                 # PII & content filtering rules
```

---

## 📜 4. Guidelines & Rules for AI Agents

### Rule 1: Next.js App Router & Metadata Rule
- **NEVER** place `"use client"` in `page.tsx` or `layout.tsx` when exporting `generateMetadata` or `metadata`.
- Always split interactive UI into separate client component files (`feed-client.tsx`, `dating-client.tsx`, `edit-profile-client.tsx`).

### Rule 2: High Modularity & Component Sizing
- Keep individual component files under ~150–200 lines.
- When creating or modifying complex UI features, break them into subcomponents inside designated component folders (`src/components/feed/`, `src/components/stories/`, `src/components/dating/`).

### Rule 3: Centralized API Fetchers & Custom Hooks
- Do **NOT** write ad-hoc `fetch()` calls or re-implement standard hooks inside components.
- Use `fetcher` and mutation helpers from [`src/lib/api.ts`](file:///Users/shaswatraj/Desktop/startups/campusloop/src/lib/api.ts).
- Access shared client state via hooks exported from [`src/hooks/index.ts`](file:///Users/shaswatraj/Desktop/startups/campusloop/src/hooks/index.ts).

### Rule 4: Drizzle ORM on Cloudflare Workers
- When using Drizzle's Relational Query Builder (`db.query`), avoid deep self-referential nested relational queries (e.g. `with: { repostOf: { with: { ... } } }`) to prevent worker query cache errors.
- Prefer batch-resolving foreign references (e.g., fetching `repostOf` posts via `inArray(posts.id, ids)` after primary query).

### Rule 5: User Verification & Auth
- All authenticated API routes must verify session via `await hexclaveServerApp.getUser()`.
- If no user is logged in, return `NextResponse.json({ error: "Unauthorized" }, { status: 401 })`.

---

## 🛠️ 5. Standard Verification & Deployment Workflow

1. **Verify Types**:
   ```bash
   bunx tsc --noEmit
   ```
   *Must pass with 0 errors before committing or completing work.*

2. **Run Local Dev Server**:
   ```bash
   bun run dev
   ```

3. **Deploy to Cloudflare Workers**:
   ```bash
   bun run deploy
   ```
