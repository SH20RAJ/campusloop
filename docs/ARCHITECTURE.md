# 🏗️ CampusLoop Architecture & Developer Guide

> For the comprehensive, full-system architecture deep dive with Mermaid diagrams, database schema topology, and engine specifications, see the root [**`ARCHITECTURE.md`**](../ARCHITECTURE.md).

---

## 📁 Workspace Directory Sitemap

```
campusloop/
├── ARCHITECTURE.md            # Comprehensive System Architecture & Engineering Deep-Dive
├── README.md                  # Main project overview, features & quickstart
├── AGENTS.md                  # Critical guidelines for AI Agents & developers
├── docs/                      # Architectural docs & design guidelines
│   ├── ARCHITECTURE.md        # Technical architecture reference
│   ├── DESIGN_SYSTEM.md       # Color palettes, typography, UI components
│   ├── ROADMAP_PHASES.md      # Strategic milestones & planned phases
│   ├── CHANGELOG.md           # Detailed engineering changelog
│   └── CAMPUSLOOP_MVP_PLAN.md # Initial product blueprint & specs
├── src/
│   ├── app/                   # Next.js 16 App Router (Pages, Layouts & API routes)
│   │   ├── (main)/            # Authenticated student shell & feature views
│   │   ├── api/               # Edge API endpoints (/feed, /chat, /dating, /stories, etc.)
│   │   ├── admin/             # Admin moderation & audit dashboard
│   │   ├── privacy/           # Legal privacy policy (DPDP Act 2023)
│   │   ├── terms/             # Terms of service & IT Rules 2021
│   │   ├── safety/            # Anti-ragging & campus safety guidelines
│   │   └── contact/           # Support & statutory grievance redressal
│   ├── components/            # Feature subcomponents & UI primitives
│   │   ├── chat/              # Messenger pane, thread list, sticker paste
│   │   ├── dating/            # Swipe deck, filters modal, match celebration
│   │   ├── feed/              # Post card, composer, poll widget, repost modal
│   │   ├── stories/           # Fullscreen story viewer, highlights, archiver
│   │   ├── communities/       # Sub-hubs directory, dedicated utility hubs
│   │   ├── marketing/         # Landing hero, legal document primitives
│   │   └── ui/                # Atomic UI components, avatars, badges
│   ├── db/                    # Drizzle ORM client & Neon PostgreSQL schema
│   │   ├── index.ts           # Neon serverless database client
│   │   └── schema.ts          # Relational tables, enums & relations
│   ├── hexclave/              # Hexclave authentication configuration
│   ├── hooks/                 # Custom React hooks (useProfile, useFeed, usePostActions)
│   └── lib/                   # API client, sounds, haptics, moderation, algorithms
└── .agents/
    └── skills/
        └── campusloop-guide/  # AI Agent handbook & domain rules
```

---

## 📌 Critical Architectural Invariants

1. **Strict Metadata Export Rule (Next.js Server Pages)**:
   - Never add `"use client"` to `page.tsx` or `layout.tsx` when exporting Next.js `Metadata` or `generateMetadata`.
   - Keep page entry points server components and delegate interactive UI to client components (e.g. `feed-client.tsx`, `dating-app-client.tsx`).

2. **Centralized API Helper & Hooks Pattern**:
   - Do NOT redefine `const fetcher = ...` inline in components.
   - Use centralized hooks from `@/hooks/` (`useProfile`, `useFeed`, `usePostActions`, `useColleges`, `useCommunities`, `useStories`).

3. **Database & Drizzle ORM Guidelines**:
   - Always query Drizzle ORM via `getDb()` from `@/db`.
   - Avoid deep self-referential nested relational queries (e.g. `with: { repostOf: { with: { ... } } }`) to prevent worker query cache errors. Batch-fetch relational references when needed.

4. **Zero-Latency Audio & Physical Haptics**:
   - Utilize synthesized Web Audio API in [`src/lib/sounds.ts`](campusloop/src/lib/sounds.ts) instead of external MP3 assets.
   - Trigger native vibration feedback via [`src/lib/haptics.ts`](campusloop/src/lib/haptics.ts).

5. **Design System & Typography**:
   - Document and legal pages use clean, minimal monochrome typography in [`src/components/marketing/legal-doc.tsx`](campusloop/src/components/marketing/legal-doc.tsx).
   - Card overlays utilize glassmorphism (`backdrop-blur-xl bg-background/85`) and rounded corners (`rounded-2xl` to `rounded-3xl`).
