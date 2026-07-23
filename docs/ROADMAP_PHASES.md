# CampusLoop Feature & Development Roadmap

This document maps out the core feature roadmap and completed development phases for CampusLoop.

---

## Current Status Overview
- **Completed:** Landing Page, Hexclave Auth, Auto-Onboarding, Campus Feed, Global Discover Feed, Confessions Feed, Post Composer, Admin Panel, Interactive Comments, Post Voting & Reposting, Interactive Poll Voting, 24-Hour Stories (Vibe Creator), Direct Chat (DMs), Campus Match Mode (Opt-in Swiping & Filters), Vanity URLs (`/@username`), Community Hubs, One-Tap WhatsApp & Instagram Story Card Sharing, Profile Editing with Gender selection, and Modular Architecture Refactoring.

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
- [x] **Chat Room View (`/app/chat/[id]`):** Messaging interface.

---

## Phase 5: Campus Match Mode (Student Discovery)
- [x] **Match Profile Setup:** Gender filter, college scope (Campus vs. Global), interest tags.
- [x] **Discovery Deck (`/app/dating`):** Swipe/card deck with drag animations and instant chat redirection upon matching.
