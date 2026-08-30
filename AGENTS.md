# 🤖 AGENTS.md — CampusLoop Instructions for AI Agents & Developers

Welcome to **CampusLoop**, a verified student-only campus social network built for Next.js 16 (App Router), Cloudflare Workers, Neon PostgreSQL, Drizzle ORM, and Hexclave Auth.

---

## 🎯 Main Motive & Core Capabilities

CampusLoop is designed to empower college students with a safe, engaging, and feature-rich campus platform:
- **Campus Feed (`/app`)**: Dynamic feed supporting Confessions, Polls, Questions, Hashtags, and Twitter-style Reposts/Quotes.
- **Campus Radius & Discovery (`/app/discover`)**: Switch between local campus feed and global across all colleges in India.
- **Stories / Vibes (`/app/stories/new`)**: 24-hour visual campus vibe sharing with interactive fullscreen viewer.
- **Campus Match / Dating (`/app/dating`)**: Swipe deck for connecting with verified fellow students, filtered by gender & scope.
- **Campus Directory (`/app/colleges`)**: 1,350+ indexed Indian college hubs with instant search & hub request forms.
- **Sub-Hubs & Communities (`/app/communities`)**: Student-created interest groups and discussion spaces.
- **Clout & Gamification**: Loop Points (LP) system rewarding engagement, invites, and unlocking verified status.
- **Admin Moderation (`/admin`)**: Content reporting, automated keyword filtering, user management.

---

## 📌 Critical Architectural Rules

### 1. Hexclave Management
- User auth, sessions, and verification are handled by **Hexclave**.
- Server-side auth: `hexclaveServerApp.getUser()` in API routes.
- Client-side auth & user profile: `useProfile()` custom hook.
- Reference documentation: https://skill.hexclave.com

### 2. Next.js App Router & Metadata Rule
- **NEVER** add `"use client"` on `page.tsx` or `layout.tsx` when exporting `metadata` or `generateMetadata`.
- Delegate interactive UI to dedicated client component files (e.g. `feed-client.tsx`, `dating-client.tsx`, `post-composer.tsx`).

### 3. High Modularity & Component Architecture
- Keep component files concise (~150-200 lines max).
- Store feature-specific subcomponents in dedicated component folders:
  - `src/components/feed/` — `feed-card-header`, `feed-card-actions`, `feed-card-repost-modal`
  - `src/components/stories/` — `story-avatar-item`, `story-viewer-modal`
  - `src/components/dating/` — `dating-card-stack`, `dating-filters-modal`, `dating-match-modal`
  - `src/components/discover/` — `featured-campus-card`
  - `src/components/colleges/` — `college-hub-card`, `add-college-modal`
  - `src/components/post/` — `comment-item`, `post-composer-toolbar`
- Do **NOT** inline API fetchers or re-implement standard hooks. Use centralized helpers in `@/lib/api.ts` and custom hooks in `@/hooks/`.

### 4. Database & Drizzle ORM Best Practices
- Schema is centralized in [`src/db/schema.ts`](campusloop/src/db/schema.ts).
- Database connection uses Neon serverless Postgres driver via [`src/db/index.ts`](campusloop/src/db/index.ts).
- When querying Drizzle Relational Query Builder (`db.query`), avoid deep self-referential nested relational queries (e.g., `with: { repostOf: { with: { ... } } }`) to prevent worker query cache errors. Batch-fetch relational references when needed.

### 5. Verification & Deployment Commands
### 5. Qdrant Cloud Vector Search & Zero-Downtime Fallback Rule
- **Qdrant Vector Database** is integrated for semantic search, related post recommendations, and dating compatibility (`src/lib/qdrant/`).
- **CRITICAL INVARIANT**: Vector DB is strictly an asynchronous enhancement layer. Any query to Qdrant is protected by a strict 600ms timeout and circuit breaker.
- If Qdrant is unavailable, times out, or encounters network errors, the application **MUST gracefully fallback 100% to PostgreSQL relational queries** with zero interruption to users.

### 6. Mobile Bottom Navigation Bar & Anonymity Mode Switcher
- **Mobile Bottom Navigation**: The mobile bottom bar has 5 core tabs: **Home (`/app`)**, **Colleges (`/app/colleges`)**, **Post (`/app/post/new`)**, **Chat (`/chat`)**, and **Dating (`/app/dating`)**.
- **Anonymity Mode Switcher**: Desktop sidebar and mobile drawer feature a quick switcher between **All Posts & Anon 🎭** and **Public Only (No Anon) 🛡️**. Switching dispatches `campusloop_feed_visibility_change` on the window and saves to `localStorage` + `/api/profile/me` for instant zero-reload timeline filtering.

### 7. Full-Page Routes (`page.tsx`) Over Popups for Creation Workflows
- **ALWAYS** prefer creating dedicated Next.js App Router full-page routes (`page.tsx`) with rich SEO metadata, Twitter/X-style full-width minimal UI/UX, and optimal secure backend + frontend, instead of modal popups for creation flows (e.g. Campus Hub posting, community creation, listing creation).
- Popups/modals should only be reserved for micro-interactions (fast comment reply, repost quote, quick reaction). Dedicated pages ensure 100% mobile space utilization, avoid cramped modal scrolling, and enable deep linkability.

### 8. Official Social Media Channels Priority
- Always prioritize official social media links in the order:
  1. **Instagram (🔥 Highlighted)**: `https://www.instagram.com/campusloop.space/` (`@campusloop.space`)
  2. **LinkedIn**: `https://www.linkedin.com/company/mycampusloop/?viewAsMember=true` (`CampusLoop`)
  3. **X (Twitter)**: `https://x.com/company/mycampusloop/` (`@mycampusloop`)

---

## 📁 Workspace Directory Sitemap

```
campusloop/
├── docs/                      # Architectural docs & design guidelines
│   ├── ARCHITECTURE.md
│   ├── DESIGN_SYSTEM.md
│   ├── ROADMAP_PHASES.md
│   ├── RECOMMENDATION_ALGORITHMS_DEEP_DIVE.md
│   └── CHANGELOG.md
├── src/
│   ├── app/                   # Next.js App Router (Pages & API routes)
│   │   ├── (main)/            # Main app shell & client components
│   │   ├── (dating)/          # Standalone focused dating route (/app/dating)
│   │   ├── api/               # REST API endpoints (/feed, /posts, /chat, /dating, /stories, etc.)
│   │   └── admin/             # Admin moderation dashboard
│   ├── components/            # Feature subcomponents & Shadcn primitives
│   │   ├── feed/
│   │   ├── stories/
│   │   ├── dating/
│   │   ├── discover/
│   │   ├── colleges/
│   │   ├── post/              # Post comments & related-posts-widget
│   │   ├── chat/              # Messenger pane, conversation drawers
│   │   └── ui/
│   ├── db/                    # Schema & Drizzle ORM client initialization
│   │   ├── schema/            # Sub-schemas (users, posts, institutions, chat, dating, etc.)
│   │   └── schema.ts          # Centralized export barrel
│   ├── hexclave/              # Hexclave SDK configuration
│   ├── hooks/                 # Centralized React hooks (useProfile, useFeed, usePostActions, etc.)
│   └── lib/                   # API client (api.ts), utils, moderation, gamification
│       ├── qdrant/            # Qdrant client, embeddings, collections, async indexer
│       └── recommendations/   # Semantic related posts & deep compatibility matching
└── .agents/
    └── skills/
        └── campusloop-guide/
            └── SKILL.md       # Comprehensive AI Agent skill handbook
```