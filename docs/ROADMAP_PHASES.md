# CampusLoop Feature & Development Roadmap

This document maps out the core feature roadmap, architectural milestones, and development phases for CampusLoop.

---

## Current Status Overview
- **Completed:** Landing Page, Hexclave Auth, Auto-Onboarding, Campus Feed, Global Discover Feed, Confessions Feed, Post Composer, Admin Panel, Interactive Comments, Post Voting & Reposting, Interactive Poll Voting, 24-Hour Stories (Vibe Creator), Direct Chat (DMs), Campus Match Mode (Opt-in Swiping & Filters), Vanity URLs (`/@username`), Community Hubs, One-Tap WhatsApp & Instagram Story Card Sharing, Profile Editing with Gender selection, Modular Architecture Refactoring, Web Audio & Haptics Engine, Time Capsules, 6 Dedicated Utility Hubs, Monochrome Legal & Safety Document Design, and Unsplash Portrait Seeding.

---

## Phase 1: Interactive Engagement (Comments & Upvoting)
- [x] **Post Details View:** Rebuilt `/app/post/[id]` to include comment input form and scrollable comments list.
- [x] **Engagement Hook-up:** Bind upvote/downvote buttons in `FeedCard` with instant state mutations.
- [x] **API Endpoints:**
  - `POST /api/posts/[id]/comments`
  - `GET /api/posts/[id]/comments`
  - `POST /api/posts/[id]/vote`

---

## Phase 2: Interactive Polls & Real Stories
- [x] **Interactive Poll Component:** Render vote option bars with percentages and user vote indicator.
- [x] **Story Composer & Viewer:** `/app/stories/new` with live canvas preview, background gradients, sticker badges, and expiring story stream.
- [x] **API Endpoints:**
  - `POST /api/posts/[id]/poll-vote`
  - `POST /api/stories`

---

## Phase 3: Safety & Automated Moderation
- [x] **Report Dialog:** "Report Post" menu item in `FeedCard` to report harassment, doxxing, self-harm, etc.
- [x] **Admin Reports Panel:** `/admin/reports` to manage reported content.
- [x] **Pre-publish Moderation Filter:** Scanning for emails, phone numbers, and targeted slurs.

---

## Phase 4: Private Chat / DMs
- [x] **Inbox View (`/app/chat`):** List active conversations.
- [x] **Chat Room View (`/app/chat/[id]`):** Messaging interface with auto-expanding textarea, Gboard/iOS sticker paste, and responsive skeletons.

---

## Phase 5: Campus Match Mode (Student Discovery)
- [x] **Match Profile Setup:** Gender filter, college scope (Campus vs. Global), interest tags.
- [x] **Discovery Deck (`/app/dating`):** Swipe/card deck with drag animations and instant chat redirection upon matching.

---

## Phase 6: Sub-Hubs & Dedicated Campus Utility Portals
- [x] **Reddit-Style Sub-Hub Directory (`/app/communities`):** Student interest communities (`c/coding`, `c/music-band`, `c/anime`) with sorting (*Hot, New, Top, Rising, Discussed*).
- [x] **6 Dedicated Template Portals:**
  - `/app/lost-and-found`
  - `/app/marketplace`
  - `/app/gaming`
  - `/app/rideshare`
  - `/app/housing`
  - `/app/academics`

---

## Phase 7: Sensory Experience, Audio & Physical Haptics Engine
- [x] **Synthesized Web Audio API (`src/lib/sounds.ts`):** 100% offline audio chimes (`ting`, `pop`, `tap`, `archive`) with zero network latency.
- [x] **Physical Haptics Engine (`src/lib/haptics.ts`):** Native vibration feedback patterns for taps, votes, and celebrations.

---

## Phase 8: Statutory Legal, Privacy & Safety Architecture
- [x] **Monochrome Document Architecture (`src/components/marketing/legal-doc.tsx`):** Clean, typography-first legal layouts.
- [x] **Twitter-Style Sticky Legal Navigation (`legal-nav.tsx`):** Unified header across `/privacy`, `/terms`, `/safety`, and `/contact`.
- [x] **Statutory Compliance:** IT Rules 2021, UGC Anti-Ragging Regulations 2009, and DPDP Act 2023.

---

## Phase 9: Campus Time Capsule & Batch Legacy Vaults
- [x] **Time Capsule Sealing Engine (`/app/capsule`):** Cryptographic batch letter and prediction locks until convocation day.
- [x] **Countdown Ticker & Museum Showcase:** Dynamic live countdown and responsive alumni celebration wall.

---

## Phase 10: High-Resolution Portrait Seeding & Swipe Mechanics Optimization
- [x] **Unsplash Student Portraits:** Curated, respectable college student portrait photo sets replacing cartoon Dicebear avatars across all database profiles.
- [x] **Circular PFP Indicator:** Sleek circular profile picture rendered directly before candidate names on full-screen cards.
- [x] **Fluid Swipe Mechanics:** Double-increment fix, isolated card keys (`key={top.id}`), velocity-based releases (`velocity.x > 400`), and GPU image preloading.
