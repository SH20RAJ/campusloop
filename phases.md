# CampusLoop Development Roadmap: Remaining Features

This document maps out the missing features in CampusLoop (based on `campusloop.md`) compared to what has been built so far, organized into logical development phases.

---

## Current Status Overview
- **Built:** Landing Page, Hexclave Auth, Auto-Onboarding, Campus Feed, Global Discover Feed, Confessions Feed, Post Composer (Basic), Admin Panel (Colleges/Domains Management & Stats Dashboard).
- **Missing:** Safety/Moderation engine, interactive Comments, Post Reactions/Voting, Poll Voting, Real Stories (Mocked), Direct Messages (DMs), and Match Mode (Discovery).

---

## Phase 1: Interactive Engagement (Comments & Upvoting)
Currently, post cards show counts, but users cannot interact.

### Frontend Tasks
- [ ] **Post Details Page Updates:** Rebuild `/app/post/[id]/page.tsx` to include a comment input form and scrollable comments list.
- [ ] **Engagement Hook-up:** Bind upvote/downvote buttons in `FeedCard` to trigger state mutations (SWR revalidation).

### Backend Tasks
- [ ] **API Endpoint (POST /api/posts/[id]/comments):** Save user comments in the `comments` table.
- [ ] **API Endpoint (GET /api/posts/[id]/comments):** Retrieve paginated comments for a post.
- [ ] **API Endpoint (POST /api/posts/[id]/vote):** Record upvotes/downvotes, ensuring a unique constraint per user/post in the `votes` table.

---

## Phase 2: Interactive Polls & Real Stories
Currently, polls are composer options but lack interactive UI, and stories are purely mock assets.

### Frontend Tasks
- [ ] **Interactive Poll Component:** Detect if a post type is `POLL`. Render options as clickable vote bars showing percentages (like Twitter Polls).
- [ ] **Story Composer & Viewer:** Allow users to upload a photo/text story with a 24-hour expiration overlay.

### Backend Tasks
- [ ] **API Endpoint (POST /api/posts/[id]/poll-vote):** Record a student's vote on a specific poll option.
- [ ] **API Endpoint (POST /api/stories):** Save active stories to `stories` table. Add auto-expiry query filter (expiring after 24 hours).

---

## Phase 3: Safety & Automated Moderation
Preserving safety is the core product constraint.

### Frontend Tasks
- [ ] **Report Dialog:** Add a "Report Post" menu item in `FeedCard` that opens a dialog to select reasons (harassment, doxxing, self-harm, etc.).
- [ ] **Admin Reports Panel:** Build `/admin/reports` to list open reports and allow moderators to hide content or ban users.

### Backend Tasks
- [ ] **Doxxing & Slur Filter:** Add pre-publish middleware in `POST /api/posts` that scans post body for email patterns, phone numbers, and targeted slurs. Auto-flags/blocks matching posts.
- [ ] **API Endpoint (POST /api/posts/[id]/report):** Insert records into `reports` table.
- [ ] **Auto-Hide Rule:** Hide posts automatically once they cross a threshold of reports (e.g., 5 flags).

---

## Phase 4: Private Chat / DMs
Allowing students to communicate privately with mutual consent.

### Frontend Tasks
- [ ] **Inbox View (`/app/chat`):** List all active conversations.
- [ ] **Chat Room View (`/app/chat/[id]`):** Implement a real-time message box.

### Backend Tasks
- [ ] **API Endpoints:**
  - `GET /api/chat` (Fetch user conversations)
  - `POST /api/chat/messages` (Send a message)
- [ ] **Real-time Synchronization:** Setup WebSocket/polling logic to sync messages dynamically.

---

## Phase 5: Match Mode (Student Discovery)
Opt-in student matching based on academic and social interests.

### Frontend Tasks
- [ ] **Match Profile Setup:** A page where students opt-in, set their preferences (friends, study buddy, cofounder, date), and select interests.
- [ ] **Discovery Deck (`/app/match`):** Swipe/card deck displaying potential matches.

### Backend Tasks
- [ ] **API Endpoint (POST /api/match/swipe):** Record swipe decisions (left/right).
- [ ] **Match Logic:** Detect mutual right-swipes, auto-create a Conversation, and notify both users.
