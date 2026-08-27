# CampusLoop Tasks & Fixes

- [x] **Discover & Trending Hashtags DB-Level System Design & Seeding**:
  - `https://campusloop.space/app/discover` — Replaced in-memory JavaScript slicing with high-performance native PostgreSQL query using `regexp_matches(body, '#[a-zA-Z0-9_]+', 'g')` and `count(*)::int`.
  - Seeded authentic BIT Mesra and global posts across `#BITMesra`, `#Bitotsav`, `#LateNightTea`, `#PlacementSeason`, `#ExamStress`, `#HostelLife`, `#Hackathon`, etc.
  - Clicking any trending hashtag now opens `/app/hashtag/[tag]` with 100% accurate, live database-matched discussions.

- [x] **Post Optimistic Update & Instant Top Feed Placement**:
  - Added atomic optimistic updates via `optimisticAddPost` in `src/lib/feed-mutations.ts`.
  - Used in quick composer on `/app` (`feed-client.tsx`), full editor (`post-composer.tsx`), and community feed (`community-detail-client.tsx`).
  - Prepend immediately into SWR and in-memory caches at index 0, showing new posts at the very top of the feed instantly.

- [x] **Minimal Twitter/X-Style Right Sidebar Layout**:
  - Removed card backgrounds (`bg-card`), borders, and outlines from right sidebar widgets.
  - Replaced box wrappers with clean `<hr className="border-border/30 my-3" />` separators and subtle rounded hover styles (`hover:bg-muted/25 rounded-xl`), giving the authentic Twitter/X web feel.

- [x] **Post Page "Who Liked" Modal (Facebook/Twitter Style)**:
  - Created backend API endpoint `GET /api/posts/[id]/likes` returning full user list with avatars, names, handles, verification badges, branch, year, and college.
  - Added clickable like count in `FeedCardActions` and Facebook-style `"❤️ Liked by X people"` row on post detail page (`/app/post/[id]`).
  - Created `PostLikesModal` displaying the list of reacting classmates with 1-click "Connect" button and profile links.

- [x] **Community Feed Reddit-Style Sort Options & Short URL Redirect**:
  - Added all Reddit-style sorting algorithms to community feeds (`community-detail-client.tsx`):
    - 🔥 **Hot**: Decaying time-weighted engagement score (`score / ageHours^0.7`).
    - ⚡ **New**: Strictly chronological (`desc(createdAt)`).
    - 🏆 **Top**: Highest voted with sub-filter ranges (24h, Week, Month, All Time).
    - 🚀 **Rising**: High velocity within recent hours (`(votes*3 + comments*4) / ageHours`).
    - 💬 **Discussed**: Sorted by comment volume.
  - Verified `https://campusloop.space/c/comm_coding` redirects directly to `https://campusloop.space/app/communities/comm_coding` via `src/app/c/[id]/page.tsx`.

- [x] **Rightbar on Public & Authenticated Vanity Profile (`/@username`)**:
  - Integrated `RightSidebar` into both the authenticated user profile view and public guest view in `src/app/[username]/page.tsx`.

- [x] **Story & Post Complete Feature Suite (Story Liking, Pause While Typing, Highlights, Story Archive, Post Delete & Archive)**:
  - **Story Liking**: Added `story_likes` database table, `POST /api/stories/[id]/like` toggle endpoint, optimistic heart animations, and like counter badges.
  - **Pause Story While Typing**: When replying in the story viewer, the auto-advance timer completely pauses on input focus or text entry (`onFocus`, `onChange`), allowing students to type their reply without the story auto-closing or jumping ahead.
  - **Story Highlights**: Created `story_highlights` table, `GET/POST/DELETE /api/highlights`, and Instagram-style Highlights circles row on `/app/profile` and `/@username`. Story viewer has a 1-click "Highlight" button for owners.
  - **Story Archive**: Created `GET /api/stories/archive` endpoint and `StoryArchiveModal` displaying all past expired stories (>24h) with creation dates, like counts, and multi-selection to bundle into highlights.
  - **Post Delete & Archive**: Added `archivePost` & `deletePost` server actions, `DELETE /api/posts/[id]` & `POST /api/posts/[id]/archive` endpoints, 3-dot dropdown menu actions ("Archive Post", "Delete Post") on `FeedCardHeader`, and a private "Archived" tab on student profiles with 1-click restore or permanent delete.

- [x] **Notification Center Crash Fix & Twitter/Linear Design System Overhaul**:
  - **Database Fix**: Resolved server 500 error (`column notifications.preview_text does not exist`) by executing `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS preview_text TEXT;` on Neon PostgreSQL.
  - **Resilient Server Page**: Wrapped queries in `src/app/app/(main)/notifications/page.tsx` with error boundary fallbacks and populated actor institution relation.
  - **Category Pills**: Added 6 interactive filter tabs ("All", "Mentions", "Replies", "Reactions", "Crushes & Matches", "Verified") powered by `api/notifications?tab=`.
  - **Visual Design System**:
    - Dual badge system on student avatars (heart for likes, bubble for replies, lock for crushes, lightning for matches, etc.).
    - Subtle left-edge brand indicator bar and soft tint for unread items.
    - Clickable quoted snippet preview box with quotes and clean border.
    - 1-click "Mark all as read" in sticky glass header.
    - Polished contextual empty states for every category with direct action buttons.
