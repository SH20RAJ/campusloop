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
                               │     🎓 CAMPUSLOOP PRODUCT ARCHITECTURE  │
                               └────────────────────┬────────────────────┘
                                                    │
     ┌───────────────────┬──────────────────┬───────┴──────────┬──────────────────┐
     ▼                   ▼                  ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  1. IDENTITY │  │  2. SOCIAL   │  │3. CONNECTION │  │  4. UTILITY  │  │  5. CLOUT    │
│  GATEKEEPING │  │   & FEEDS    │  │  & MATCHING  │  │ & SUB-HUBS   │  │ GAMIFICATION │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
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

### 3. 💖 Connection & Matchmaking Layer (`/app/dating`)
- **Campus Match Swipe Deck**: Draggable Framer Motion cards with velocity-based release detection (`velocity.x > 400 || offset.x > 80`).
- **Curated Unsplash Student Portraits**: Verified college portrait sets replacing cartoon Dicebear avatars.
- **Circular PFP Previews**: Sleek circular avatar rendered directly before candidate names.
- **Zero-Lag Preloader**: Instant image preloading in browser memory for smooth swipe transitions.
- **Secret Crush & Mutual Match**: Cryptographic crush escrow revealing identity only when feelings are mutual.

### 4. 🏫 Campus Utility & Dedicated Sub-Hubs (`/app/communities`)
- **Reddit-Style Sub-Hubs**: Authentic student interest communities (`c/coding`, `c/music-band`, `c/anime`) with custom sorting (*Hot, New, Top, Rising, Discussed*).
- **6 Dedicated Campus Portals**:
  - 🔎 [**/app/lost-and-found**](https://campusloop.space/app/lost-and-found) — Lost calculators, ID cards, keys & cycle locks.
  - 🛒 [**/app/marketplace**](https://campusloop.space/app/marketplace) — Peer-to-peer hostel trading for cycles, coolers, and books.
  - 🎮 [**/app/gaming**](https://campusloop.space/app/gaming) — Squad recruitment & LAN tournament lobbies.
  - 🚗 [**/app/rideshare**](https://campusloop.space/app/rideshare) — Weekend cab and auto pooling.
  - 🏠 [**/app/housing**](https://campusloop.space/app/housing) — Flat hunting and roommate matching.
  - 📚 [**/app/academics**](https://campusloop.space/app/academics) — Exam-night handwritten notes & solved PYQs.

### 5. ⏳ Campus Time Capsule & Batch Legacy Vault (`/app/capsule`)
- **Cryptographically Sealed Vaults**: Contribute batch predictions, hostel confessions, and convocation letters.
- **Graduation Day Countdown**: Real-time ticker counting down days, hours, and minutes until convocation.
- **Unlocked Museum Wall**: Automatically transforms into a public alumni celebration wall upon timer expiry.

### 6. ⚡ Clout, Reputation & Virality (Loop Points - LP)
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

- **Framework**: Next.js 16 (App Router + Turbopack)
- **Runtime & Edge Deployment**: Cloudflare Workers via OpenNext (`@opennextjs/cloudflare`)
- **Database**: Neon Serverless Postgres via Drizzle ORM
- **Authentication**: Hexclave Auth (`hexclaveServerApp.getUser()`)
- **Zero-Latency Audio**: Synthesized Web Audio API (`src/lib/sounds.ts`)
- **Haptics**: Native vibration engine (`src/lib/haptics.ts`)
- **Styling & UI**: Vanilla CSS + TailwindCSS + Framer Motion + Lucide Icons + Sonner Toasts
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
│   │   ├── marketing/         # Minimal document layout & legal navigation
│   │   └── ui/                # Shared UI primitives
│   ├── db/                    # Drizzle ORM schema & Neon database client
│   ├── hexclave/              # Hexclave SDK config
│   ├── hooks/                 # Custom React hooks (useFeed, useProfile, usePostActions)
│   └── lib/                   # API client, sounds, haptics, moderation & LP utilities
└── .agents/
    └── skills/
        └── campusloop-guide/  # Comprehensive AI agent handbook
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
Create a `.env.local` file:
```env
DB_URL="postgresql://neondb_owner:..."
NEXT_PUBLIC_HEXCLAVE_API_URL="https://api.stack-auth.com"
NEXT_PUBLIC_HEXCLAVE_PROJECT_ID="e40e0f..."
HEXCLAVE_SECRET_SERVER_KEY="ssk_..."
```

### 3. Development & Type Check
```bash
# Type Check (Must compile cleanly with 0 errors)
bunx tsc --noEmit

# Run Unit Tests
bun test

# Development Server
bun run dev
```

### 4. Cloudflare Edge Deployment
```bash
bun run deploy
```

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
