# 🎓 CampusLoop — The Verified Campus Social Network

<p align="center">
  <img src="public/logo.png" alt="CampusLoop Logo" width="96" height="96" />
</p>

<p align="center">
  <strong>Your Campus, Unfiltered.</strong><br />
  The private digital social layer for college campuses — gatekept by verified student email.
</p>

<p align="center">
  <a href="https://campusloop.space"><strong>🌐 Live App (campusloop.space)</strong></a> •
  <a href="ARCHITECTURE.md"><strong>🏛️ System Architecture</strong></a> •
  <a href="https://campusloop.space/overview"><strong>📊 Strategic Overview</strong></a> •
  <a href="https://campusloop.space/pitch"><strong>⚡ Pitch Deck</strong></a> •
  <a href="https://campusloop.space/safety"><strong>🛡️ Safety & Standards</strong></a>
</p>

---

## 🏛️ Comprehensive Architecture Documentation

> 📖 **Deep Dive Available**: Read the full system design, Mermaid sequence diagrams, Drizzle ORM schema topology, edge runtime specifications, and recommendation algorithms in [**`ARCHITECTURE.md`**](ARCHITECTURE.md).

---

## 🎯 What is CampusLoop?

Student life is fragmented across loose WhatsApp groups, Instagram pages, Discord servers, anonymous confession accounts, and event links. 

**CampusLoop brings the entire campus social graph into one unified, verified digital network.**

- **Consumer Thesis**: *"Your campus, unfiltered."* Safe yapping, confessions, canteen polls, lost & found, and peer connections without corporate or faculty eyes.
- **Investor Thesis**: *"The verified social graph for higher education in India."* Building dense campus-by-campus network effects across 1,350+ indexed colleges, monetizing attention and hyper-local transactions.

---

## 🌟 The Core Product Layers

```
                    ┌─────────────────────────────────────────┐
                    │   🎓 CAMPUSLOOP PRODUCT ARCHITECTURE     │
                    └────────────────────┬────────────────────┘
                                         │
      ┌─────────────┬─────────────┬──────┴──────┬─────────────┬─────────────┐
      ▼             ▼             ▼             ▼             ▼             ▼
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│1. IDENTITY │ │ 2. SOCIAL  │ │3. ATTENTION│ │4. CONNECT  │ │ 5. UTILITY │ │  6. CLOUT  │
│GATEKEEPING │ │  & FEEDS   │ │& NOTIFYING │ │ & MATCHING │ │ & SUB-HUBS │ │GAMIFICATION│
└────────────┘ └────────────┘ └────────────┘ └────────────┘ └────────────┘ └────────────┘
```

### 1. 🛡️ Identity & Gatekeeping Layer
- **Institutional Email Verification**: Posting access is restricted to verified `.ac.in` / `.edu` college emails. A domain counts only if it is explicitly whitelisted in `institution_domains`; the account is upgraded only after the mail provider confirms the address, never on a typed string.
- **Campus Radius & Global Scope**: Seamlessly toggle between your local college feed and across all 1,350+ colleges in India.
- **Outsider Isolation**: Corporate recruiters, bots, and non-students are strictly blocked from participating.

#### 👀 Campus Preview (Viewer Mode)

A JEE/NEET/CUET aspirant has no college email yet, but is exactly the person who
most wants to read a campus. **Viewer is an account state, not a separate account
type** — which is what makes the upgrade painless years later.

| | Campus Preview | Campus Unlocked 🎓 |
|---|---|---|
| Sign-up | Any personal email | Verified college email |
| Read feeds, confessions, polls, campus hubs | ✅ | ✅ |
| Save posts to a private vault | ✅ | ✅ |
| Pick up to 5 dream campuses that feed your timeline | ✅ | — |
| Post, comment, vote | ❌ | ✅ |
| Chat, Campus Match, Secret Crush | ❌ | ✅ |

- **Implementation**: A preview profile is a normal `user_profiles` row parked in
  a reserved "Viewer Hub" institution. Permissions are decided by
  `src/lib/capabilities.ts` rather than scattered role checks, so every write API
  refuses a viewer through one gate.
- **Upgrade is in place, not a migration**: verifying a college email promotes it
  to the primary sign-in channel and demotes the personal address to a secondary
  recovery channel. The same profile row survives, so saved posts, follows, points
  and history stay attached — nothing is copied and nothing is deleted.
- Full design rationale: [`docs/CAMPUS_PREVIEW_FEATURE.md`](docs/CAMPUS_PREVIEW_FEATURE.md).

### 2. 💬 Social & Discussion Layer
- **Multi-Sort Feed Engine**: 5 distinct feed algorithms (*🔥 For You, Latest, Trending, Top Voted, Discussed*).
- **Post Types**: Thoughts, Confessions, Interactive Polls with custom options, and Questions.
- **1-Tap & Quoted Reposts**: Twitter-style reposts with embedded quote previews and crystalline Web Audio chimes.
- **24-Hour Stories (Vibes)**: Fullscreen visual vibe sharing with pause-on-reply typing and permanent profile highlights.

### 3. 💬 Realtime Communication & Video Calling (`/app/chat` & `/app/random`)
- **1-to-1 WebRTC Video & Audio Calling**: Direct peer-to-peer audio and video calling inside `/app/chat` powered by PeerJS. Encrypted media flows directly between browsers with zero worker bandwidth costs.
- **Incoming Call Ringing & Sheet UI**: Desktop floating cards and mobile full-screen incoming call sheets with instant accept/decline.
- **Random Loop Discovery (`/app/random`)**: Omegle-style serendipitous student matching with accountable anonymity.
- **Mutual Video Opt-In**: Transition from anonymous text to live video only when both students consent.
- **Mutual Identity Reveal & Social Follow**: Reveal real college identities or tap "Become Friends" to instantly connect on CampusLoop's social graph.

### 4. 🔔 Notifications & Attention Layer (`/app/notifications`)
- **Instant Phone Pings**: Web Push wakes your phone the moment a classmate DMs you, likes your post, replies, mentions you, or follows you — including from an installed PWA on Android and iOS.
- **Posts From People You Follow**: When a friend or someone you follow publishes, you hear about it — and their post is ranked higher in your feed rather than buried under strangers.
- **Per-Person Mute, Not Unfollow**: Tap the bell on anyone's profile to silence *their posts*, *their messages*, or *everything* — without unfollowing them, without them ever being told, and without them leaving your feed.
- **Per-Category Switches**: Turn off a whole class of alert (likes, reposts, mentions, matches) from Settings, or narrow post alerts to mutual friends only.
- **Inbox, Not a Log**: A rapid chat back-and-forth collapses to one entry per conversation instead of a wall of rows.
- **Confessions Stay Confessions**: Anonymous posts never trigger a follower notification — a "your friend just posted" ping beside an anonymous post would deanonymize it by correlation.
- **Privacy by Construction**: Pushes carry *no payload*. Your phone receives an empty authenticated wake-up, then fetches the content over your own session — notification text never passes through Google's or Apple's push servers.

### 5. 💖 Connection & Matchmaking Layer (`/app/dating`)
- **Campus Match Swipe Deck**: Draggable Framer Motion cards with velocity-based release detection (`velocity.x > 400 || offset.x > 80`).
- **Curated Unsplash Student Portraits**: Verified college portrait sets replacing cartoon Dicebear avatars.
- **Circular PFP Previews**: Sleek circular avatar rendered directly before candidate names.
- **Zero-Lag Preloader**: Instant image preloading in browser memory for smooth swipe transitions.
- **Secret Crush & Mutual Match**: Cryptographic crush escrow revealing identity only when feelings are mutual.

### 6. 🏫 Campus Utility & Dedicated Sub-Hubs (`/app/communities`)
- **Reddit-Style Sub-Hubs**: Authentic student interest communities (`c/coding`, `c/music-band`, `c/anime`) with custom sorting (*Hot, New, Top, Rising, Discussed*).
- **6 Dedicated Campus Portals**:
  - 🔎 [**/app/lost-and-found**](https://campusloop.space/app/lost-and-found) — Lost calculators, ID cards, keys & cycle locks.
  - 🛒 [**/app/marketplace**](https://campusloop.space/app/marketplace) — Peer-to-peer hostel trading for cycles, coolers, and books.
  - 🎮 [**/app/gaming**](https://campusloop.space/app/gaming) — Squad recruitment & LAN tournament lobbies.
  - 🚗 [**/app/rideshare**](https://campusloop.space/app/rideshare) — Weekend cab and auto pooling.
  - 🏠 [**/app/housing**](https://campusloop.space/app/housing) — Flat hunting and roommate matching.
  - 📚 [**/app/academics**](https://campusloop.space/app/academics) — Exam-night handwritten notes & solved PYQs.

### 7. ⏳ Campus Time Capsule & Batch Legacy Vault (`/app/capsule`)
- **Cryptographically Sealed Vaults**: Contribute batch predictions, hostel confessions, and convocation letters.
- **Graduation Day Countdown**: Real-time ticker counting down days, hours, and minutes until convocation.
- **Unlocked Museum Wall**: Automatically transforms into a public alumni celebration wall upon timer expiry.

### 8. ⚡ Clout, Reputation & Virality (Loop Points - LP)
- **Micro-Incentives**: Earn **Loop Points (LP)** for participation:
  - **+20 LP**: Per successful verified student referral.
  - **+5 LP**: Per post created.
  - **+2 LP**: Per comment / reply.
  - **+1 LP**: Per poll vote / upvote.
- **Verified Blue Badge Unlock**: Hitting 150 LP (Gold Star tier) automatically unlocks the verified blue badge on campus.

---

## 🏰 Network Moat: Campus Density > User Count

The value of CampusLoop is **not** in total user headcount across India — it is in **local campus network density**.

| Metric Type | Weak Social Network | CampusLoop Strategy |
| :--- | :--- | :--- |
| **User Distribution** | 5,000 users scattered across 500 colleges | 5,000 verified classmates in **1 college** |
| **Network Effect** | Zero daily retention pull | **25%+ local campus penetration (Unbreakable Moat)** |
| **Virality** | Generic referral ads | High-velocity organic WhatsApp class group sharing |

---

## 📊 India Higher Education Market Sizing

- **Total Addressable Market (TAM)**: **43.3 Million+** enrolled students in Indian higher education.
- **Serviceable Addressable Market (SAM)**: **12.5 Million+** students across engineering, tech, medical & management campuses.
- **Indexed College Hubs**: **1,350+** verified Indian universities pre-indexed.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 16.2.6 (App Router; production builds use the **webpack** compiler — `next build --webpack` — which is what OpenNext consumes)
- **Runtime & Edge Deployment**: Cloudflare Workers via OpenNext (`@opennextjs/cloudflare`)
- **Database**: Neon Serverless Postgres via Drizzle ORM
- **Authentication**: Hexclave Auth (`hexclaveServerApp.getUser()`)
- **Zero-Latency Audio**: Synthesized Web Audio API (`src/lib/sounds.ts`)
- **Haptics**: Native vibration engine (`src/lib/haptics.ts`)
- **Styling & UI**: Vanilla CSS + TailwindCSS + Framer Motion + Lucide Icons + Sonner Toasts
- **Push Notifications**: Web Push over VAPID, signed with Web Crypto so it runs on workerd (`src/lib/web-push.ts`) + a payload-free service worker (`public/sw.js`)
- **Semantic Search**: Qdrant Cloud vectors as a strictly optional layer behind a 600 ms timeout and circuit breaker, falling back to Postgres
- **Caching & Presence**: Upstash Redis
- **Package Manager**: Bun (`bun run dev`, `bun run deploy`)

---

## 📂 Project Sitemap

```
campusloop/
├── ARCHITECTURE.md            # Comprehensive System Architecture & Engineering Specs
├── README.md                  # Main project overview & quickstart
├── AGENTS.md                  # Critical guidelines for AI agents & developers
├── docs/                      # Architectural docs & design guidelines
│   ├── ARCHITECTURE.md
│   ├── DESIGN_SYSTEM.md
│   ├── ROADMAP_PHASES.md
│   └── CHANGELOG.md
├── src/
│   ├── app/                   # Next.js App Router (Pages, Layouts & API routes)
│   │   ├── (main)/            # Main app shell (Feed, Dating, Stories, Chat, Communities)
│   │   ├── privacy/           # Legal privacy policy (DPDP Act 2023)
│   │   ├── terms/             # Terms of service & IT Rules 2021
│   │   ├── safety/            # Anti-ragging & campus safety guidelines
│   │   ├── contact/           # Support & statutory grievance redressal
│   │   ├── api/               # Edge REST API endpoints (/feed, /posts, /chat, etc.)
│   │   └── admin/             # Admin moderation & audit dashboard
│   ├── components/            # Feature subcomponents & Shadcn primitives
│   │   ├── feed/              # Feed cards, sorters, repost modals
│   │   ├── dating/            # Match deck, circular PFP, Unsplash photo sets
│   │   ├── communities/       # Sub-hubs & dedicated utility portal clients
│   │   ├── stories/           # Fullscreen story viewer & creator components
│   │   ├── chat/              # Responsive messenger pane & sticker paste
│   │   ├── notifications/     # Push opt-in, per-category switches, per-person mute
│   │   ├── marketing/         # Minimal document layout & legal navigation
│   │   └── ui/                # Shared UI primitives
│   ├── db/
│   │   ├── schema/            # 26 domain schema modules (posts, users, chat, …)
│   │   ├── schema.ts          # Single re-export barrel for all tables & relations
│   │   └── index.ts           # Neon serverless client
│   ├── hexclave/              # Hexclave SDK config
│   ├── hooks/                 # Custom React hooks (useFeed, useProfile, usePostActions)
│   └── lib/                   # API client, feed ranking, notifications, push, sounds,
│                              # haptics, Qdrant vectors, moderation & LP utilities
└── .agents/
    └── skills/
        └── campusloop-guide/  # Comprehensive AI agent handbook
```

---

## 📈 Codebase Size & Architecture Metrics

> 🕒 **Last Updated**: August 31, 2026

### High-Level Summary

| Metric | Measurement |
| :--- | :--- |
| **Total Source Files** *(excl. `node_modules`, `.next`, `.git`)* | **~815 files** |
| **Total Lines of Code (TS/TSX/JS/CSS/SQL/Config)** | **~131,000+ lines** |
| **Core Source Code (`src/`)** | **~6.9 MB** (700 files, **114,640 lines**) |
| **Unit Tests** | **110 tests** across **19 files** (`bun run test`) |
| **Scripts & Migrations (`scripts/`, `drizzle/`)** | **~418 KB** (48 files, **13,161 lines**) |
| **Documentation (`docs/`, Markdown files)** | **~286 KB** (25 files, **8,473 lines**) |
| **Public Assets (`public/`)** | **~17.0 MB** *(images, icons, manifest, llms.txt)* |
| **Dependencies & Build Cache** | `node_modules`: ~1.5 GB \| `.next`: ~2.1 GB \| `.git`: ~27 MB |

### Source Breakdown by Subsystem (`src/`)

```
src/
├── app/                  # 407 files  │  60,013 lines  │  Next.js App Router (Pages, Layouts & APIs)
│   ├── app/              # 150 files  │  27,771 lines  │  Main App Shell (Feed, Dating, Stories, Chat, etc.)
│   ├── api/              # 128 files  │  14,237 lines  │  Edge REST APIs & Qdrant semantic indexing
│   ├── admin/            #  43 files  │   7,716 lines  │  Moderation, user verification, & audit console
│   └── merchant-portal/  #  39 files  │   5,316 lines  │  Merchant listings, student deals & marketplace
├── components/           # 157 files  │  39,328 lines  │  Feature subcomponents & Radix/Shadcn primitives
├── lib/                  #  78 files  │   9,386 lines  │  Feed ranking, notifications & push, Qdrant, utils
├── db/                   #  28 files  │   3,111 lines  │  Drizzle ORM schema modules & Neon client
├── hooks/                #  15 files  │   1,392 lines  │  Custom React hooks (useFeed, useProfile, etc.)
├── constants/            #  12 files  │   1,323 lines  │  Static configs, navigational layouts, and metadata
└── hexclave/             #   2 files  │      24 lines  │  Hexclave Auth server and client integrations
```

---

## 🚀 Getting Started

### 1. Installation
```bash
git clone https://github.com/SH20RAJ/campusloop.git
cd campusloop
bun install
```

### 2. Environment Variables
Create a `.env.local` file (see [`.env.example`](.env.example) for the full list):
```env
DB_URL="postgresql://neondb_owner:..."
NEXT_PUBLIC_HEXCLAVE_API_URL="https://api.stack-auth.com"
NEXT_PUBLIC_HEXCLAVE_PROJECT_ID="e40e0f..."
HEXCLAVE_SECRET_SERVER_KEY="ssk_..."

# Web Push (optional — without these, in-app and browser notifications still
# work; only background push to a closed tab or installed PWA is disabled)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="B..."   # uncompressed P-256 point, 65 bytes
VAPID_PRIVATE_KEY="..."
VAPID_SUBJECT="mailto:hello@campusloop.space"
```

### 3. Database Schema
Schema changes are applied with **`db:push`**, not `drizzle-kit generate` — the
generated `drizzle/` migration chain is stale and would emit a full recreate of
every table. Explicit idempotent DDL for hand-applying to production lives in
[`drizzle/manual/`](drizzle/manual/).
```bash
bun run db:push
```

### 4. Development, Type Check & Tests
```bash
# Type Check (Must compile cleanly with 0 errors)
bunx tsc --noEmit

# Lint & format
bunx biome check --write ./src

# Run Unit Tests (110 tests, 19 files)
bun run test

# Development Server
bun run dev
```

### 5. Cloudflare Edge Deployment
```bash
bun run deploy
```

> 💾 **Building on 8 GB of RAM?** The production build compiles ~700 files and
> the OS used to kill it mid-build (an opaque `signal: 'SIGKILL'`). `next.config.ts`
> now enables `webpackMemoryOptimizations`, `webpackBuildWorker` and
> `memoryBasedWorkersCount`, and the build script raises the V8 heap to 5 GB.
> Still stop any other `next dev` servers first — each one holds ~1 GB.
> See [ARCHITECTURE.md §10](ARCHITECTURE.md#10-build-test--deployment-workflow).

---

## 🔗 Resources & Statutory Links

- 🌐 **Official Website**: [https://campusloop.space](https://campusloop.space)
- 🏛️ **System Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)
- 📊 **Strategic Overview**: [https://campusloop.space/overview](https://campusloop.space/overview)
- ⚡ **Investor Pitch Deck**: [https://campusloop.space/pitch](https://campusloop.space/pitch)
- 🛡️ **Safety & Anti-Ragging**: [https://campusloop.space/safety](https://campusloop.space/safety)
- 🔒 **Privacy Policy (DPDP Act 2023)**: [https://campusloop.space/privacy](https://campusloop.space/privacy)
- 📜 **Terms of Service (IT Rules 2021)**: [https://campusloop.space/terms](https://campusloop.space/terms)
- 📬 **Contact & Grievance Officer**: [https://campusloop.space/contact](https://campusloop.space/contact)

---

<p align="center">
  Made with ❤️ for college students across India.
</p>
