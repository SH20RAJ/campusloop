# 🏗️ CampusLoop Architecture & Developer/AI Agent Guide

CampusLoop is built with Next.js 16 (App Router), React 19, TypeScript, Drizzle ORM (Neon Serverless PostgreSQL), Hexclave Auth, and deployed on Cloudflare Workers using OpenNext.

---

## 📁 Directory Structure & Modular Layout

```
src/
├── app/                        # Next.js App Router pages and API handlers
│   ├── (main)/                 # Main app layout and feature routes
│   │   ├── app/                # Authenticated student feed & views
│   │   ├── colleges/           # College directory & hub views
│   │   ├── communities/        # Sub-hubs & student communities
│   │   ├── dating/             # Campus match & student discovery
│   │   ├── discover/           # Cross-campus global discover feed
│   │   ├── post/               # Post detail ([id]) and composer (new)
│   │   ├── posts/              # Category feeds (/posts/[type])
│   │   ├── profile/            # User profile view and profile edit (/edit)
│   │   └── stories/            # Vibe story creator (/new) and story viewer
│   ├── api/                    # Clean RESTful API endpoints
│   │   ├── chat/               # Private messaging endpoints
│   │   ├── colleges/           # College search and pagination
│   │   ├── communities/        # Sub-hubs API
│   │   ├── dating/             # Swiping and candidate profile endpoints
│   │   ├── feed/               # Feed fetching with scope/type filters
│   │   ├── posts/              # Post CRUD, comments, voting, reposting, reports
│   │   ├── profile/            # User profile endpoints (/me, /[username])
│   │   ├── search/             # Global search endpoint
│   │   └── stories/            # 24h vibe story creation and retrieval
│   ├── layout.tsx              # Root layout (exports metadata)
│   └── page.tsx                # High-converting landing page
├── components/                 # Reusable UI & Feature components
│   ├── ui/                     # Modular atomic UI components (FeedCard, Navigation, etc.)
│   ├── animate-ui/             # Motion/Framer animations and interactive icons
│   ├── landing/                # Landing page sections & interactive artifacts
│   └── about-client.tsx        # About page view
├── hooks/                      # Custom Reusable React Hooks
│   ├── use-feed.ts             # Feed pagination & story fetching
│   ├── use-profile.ts          # Profile state management & user profile fetching
│   ├── use-colleges.ts         # College list fetching & search filtering
│   ├── use-communities.ts      # Community list & community feed hook
│   ├── use-post-actions.ts     # Post interaction hook (voting, reposting, deleting, reporting)
│   ├── use-stories.ts          # Story fetching hook
│   ├── use-mobile.ts           # Mobile viewport detection
│   └── use-is-in-view.tsx      # Intersection observer hook
├── lib/                        # Server utilities, helpers & client API wrappers
│   ├── api.ts                  # Centralized fetcher and client API mutation helpers
│   ├── feed.ts                 # Feed database logic & query helpers
│   ├── gamification.ts         # Loop Points (LP) calculation & Vibe ranks
│   ├── institutions.ts         # Institution database helpers
│   ├── post-detail.ts          # Post detail & comments query helpers
│   ├── profile.ts              # Profile query helpers
│   ├── utils.ts                # Tailwind cn utility & avatar helpers
│   └── moderation/             # Content safety pre-checks & keyword filter
├── db/                         # Database ORM configuration & Drizzle schema
│   ├── index.ts                # Drizzle DB client instance setup
│   └── schema.ts               # Relational database tables, enums, & relations
└── hexclave/                   # Hexclave authentication configuration
    ├── client.ts               # Client-side Hexclave instance
    └── server.ts               # Server-side Hexclave session helper
```

---

## 🧩 Core Principles for Humans & AI Agents

1. **Strict Metadata Export Rule (Next.js Server Pages)**:
   - Never add `"use client"` to `page.tsx` or `layout.tsx` when exporting Next.js `Metadata`.
   - Keep page entry points server components and delegate interactive UI to client components (e.g. `feed-client.tsx`, `edit-profile-client.tsx`).

2. **Centralized API Helper & Hooks Pattern**:
   - Do NOT redefine `const fetcher = ...` inline in components.
   - Import `fetcher` or use modular hooks from `@/hooks` (`useProfile`, `useFeed`, `usePostActions`, `useColleges`, `useCommunities`, `useStories`).

3. **Reusability & Modularity**:
   - Utility functions belong in `@/lib`.
   - Common interaction handlers (vote, repost, delete, report) are encapsulated in `usePostActions`.

4. **Database & ORM Queries**:
   - Server components and API routes query Drizzle ORM via `getDb()` from `@/db`.
   - Wrap DB operations in safe `try / catch` blocks to ensure pages and APIs degrade gracefully.

5. **Design System & Styling**:
   - Glassmorphism overlays (`backdrop-blur-md bg-background/80`).
   - Soft rounded edges (`rounded-2xl`, `rounded-3xl`, `rounded-full`).
   - Sonner toast notifications for user actions.
