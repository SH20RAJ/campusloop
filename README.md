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
  <a href="https://campusloop.space/overview"><strong>📊 Strategic Overview</strong></a> •
  <a href="https://campusloop.space/pitch"><strong>⚡ Pitch Deck</strong></a> •
  <a href="https://app.notion.com/p/Campusloop-3c4cd0ed0c2580b88ac4f1c2ae54961b"><strong>📝 Notion Database</strong></a>
</p>

---

## 🎯 What is CampusLoop?

Student life is fragmented across loose WhatsApp groups, Instagram pages, Discord servers, anonymous confession accounts, and event links. 

**CampusLoop brings the entire campus social graph into one unified, verified digital network.**

- **Consumer Thesis**: *"Your campus, unfiltered."* Safe yapping, confessions, canteen polls, lost & found, and peer connections without corporate or faculty eyes.
- **Investor Thesis**: *"The verified social graph for higher education in India."* Building dense campus-by-campus network effects across 1,350+ indexed colleges, monetizing attention and hyper-local transactions.

---

## 🌟 The 5 Core Product Layers

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
- **Institutional OTP Verification**: Access is restricted strictly to verified `.ac.in` and `.edu` college emails.
- **Campus & Global Scope**: Seamlessly toggle between your local college feed and across all 1,350+ colleges in India.
- **Outsider Isolation**: Corporate recruiters, bots, and non-students are strictly blocked.

### 2. 💬 Social & Discussion Layer
- **Multi-Sort Feed Engine**: 5 distinct feed tabs (*🔥 For You, Latest, Trending, Top Voted, Discussed*).
- **Post Types**: Thoughts, Confessions, Interactive Polls with custom options, and Questions.
- **1-Tap & Quoted Reposts**: Twitter-style reposts with embedded quote previews.
- **24-Hour Stories (Vibes)**: Fullscreen visual vibe sharing with custom Gen-Z stickers & color gradients.

### 3. 💖 Connection & Matchmaking Layer
- **Campus Match Deck**: Swipe card deck for connecting with verified fellow students.
- **Filtering**: Scope candidates by gender and college radius (Campus vs. Global).
- **Instant Messaging**: Real-time 1-on-1 DMs with typing indicators and match overlays.

### 4. 🏫 Campus Utility & Sub-Hubs
- **Lost & Found Bulletin**: Post lost keys, IDs, or electronics with instant claim messaging.
- **Sub-Hub Communities**: Student-created interest groups (Coding Club, Anime Otakus, Music Jams, Hostel Hubs).
- **Directory**: 1,350+ indexed Indian college hubs with instant search & hub request forms.

### 5. ⚡ Clout, Reputation & Virality (Loop Points - LP)
- **Micro-Incentives**: Earn **Loop Points (LP)** for participation:
  - **+20 LP**: Per successful student referral onboarding.
  - **+5 LP**: Per post created.
  - **+2 LP**: Per comment / reply.
  - **+1 LP**: Per poll vote / upvote.
- **Dynamic Vibe Badges**: `🔥 Campus Legend` (≥500 LP), `👑 Campus Talker` (≥200 LP), `⚡ Loop Starter`.

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
- **Runtime & Deployment**: Cloudflare Workers via OpenNext (`@opennextjs/cloudflare`)
- **Database**: Neon Serverless Postgres via Drizzle ORM
- **Auth & User Management**: Hexclave Auth (`hexclaveServerApp.getUser()`)
- **Rich Text Editor**: Tiptap Editor
- **Styling & UI**: Vanilla CSS + TailwindCSS + Framer Motion + Lucide Icons + Sonner Toasts
- **Package Manager**: Bun (`bun run dev`, `bun run deploy`)

---

## 📂 Project Sitemap

```
campusloop/
├── docs/                      # Architectural docs & design guidelines
│   ├── ARCHITECTURE.md
│   ├── DESIGN_SYSTEM.md
│   ├── ROADMAP_PHASES.md
│   └── CHANGELOG.md
├── OVERVIEW.md                # Strategic Brief & Deep Research document
├── AGENTS.md                  # Instructions & rules for AI agents
├── src/
│   ├── app/                   # Next.js App Router (Pages & API routes)
│   │   ├── (main)/            # Main app shell (Feed, Dating, Stories, Chat)
│   │   ├── overview/          # Strategic overview page (/overview)
│   │   ├── pitch/             # Pitch deck page (/pitch)
│   │   ├── api/               # REST API endpoints (/api/feed, /api/posts, etc.)
│   │   └── admin/             # Admin moderation dashboard
│   ├── components/            # Feature subcomponents & Shadcn primitives
│   │   ├── feed/              # Feed cards, sorters, repost modals
│   │   ├── post/              # Composer toolbar, poll editor, anonymity notice
│   │   ├── stories/           # Story viewer & creator components
│   │   ├── dating/            # Match deck & filters modal
│   │   └── ui/                # Shared UI primitives
│   ├── db/                    # Drizzle ORM schema & Neon database client
│   ├── hexclave/              # Hexclave SDK config
│   ├── hooks/                 # Custom React hooks (useFeed, useProfile, useStories)
│   └── lib/                   # API client, feed sorting engine, moderation & LP utilities
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
# Type Check (Must pass with 0 errors)
bunx tsc --noEmit

# Development Server
bun run dev
```

### 4. Cloudflare Edge Deployment
```bash
bun run deploy
```

---

## 🔗 Resources & Links

- 🌐 **Official Website**: [https://campusloop.space](https://campusloop.space)
- 📊 **Strategic Overview**: [https://campusloop.space/overview](https://campusloop.space/overview)
- ⚡ **Investor Pitch Deck**: [https://campusloop.space/pitch](https://campusloop.space/pitch)
- 📝 **Notion Live Database**: [CampusLoop Notion Hub](https://app.notion.com/p/Campusloop-3c4cd0ed0c2580b88ac4f1c2ae54961b)

---

<p align="center">
  Made with ❤️ for college students across India.
</p>
