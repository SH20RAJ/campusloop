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
