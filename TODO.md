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

- [x] **Signature Repost Celebration, Zero-Latency Audio/Haptic Engine & PWA Suite**:
  - **Repost Ting Sound & Celebratory Animation**:
    - Dual-tone crystalline "Ting!" chime synthesized on-the-fly via pure Web Audio API (`AudioContext`) with bell overtones at 1760 Hz & 2637 Hz.
    - Fullscreen emerald rotating `Repeat2` pop overlay with glowing pulse and celebratory badge.
    - High-energy emerald & mint confetti particle burst via `canvas-confetti`.
  - **Zero-Latency Web Audio Engine (`src/lib/sounds.ts`)**:
    - 100% offline, zero external audio asset files, zero network latency.
    - Synthesized sounds: `ting()` (repost & publish), `pop()` (heart like & double tap), `send()` (message & comment whoosh), `tap()` (tabs & filter pills), `match()` (secret crush & dating chord arpeggio), and `archive()` (metallic latch).
  - **Physical Haptic Feedback Engine (`src/lib/haptics.ts`)**:
    - Tactile vibration patterns via `navigator.vibrate`: `repost()` celebratory rhythm, `heartbeat()` double-pulse for heart likes, `light()` micro-tap, `success()` alert, and `match()` multi-burst.
- [x] **Campus Hub Suite, Infinite Scroll & Multi-Schema Architecture (`/app/communities`)**:
  - **Separate DB Schemas & Neon Tables**:
    - `src/db/schema/lost-and-found.ts`: `lost_and_found_items` table with institution scoping, category, location, date, reward, claim, and resolution status.
    - `src/db/schema/marketplace.ts`: `marketplace_items` table with price (₹), original price, condition, category, hostel delivery, and sold toggle.
    - `src/db/schema/gaming.ts`: `gaming_lobbies` table for Valorant, Chess, BGMI, FIFA, CS2 with game mode, rank tier, gamer tag, and slots progress meter.
    - `src/db/schema/rideshare.ts`: `rideshare_pools` table for railway/airport cab splits with origin/destination route, departure time, and seat reservation.
    - `src/db/schema/housing.ts`: `housing_listings` table for flats & PGs with rent/mo, distance from campus gate, occupancy, and amenity chips.
    - `src/db/schema/academic-resources.ts`: `academic_resources` table with subject code/name, branch, semester, PYQ/notes, and Google Drive links.
  - **Paginated Infinite Scroll API (`GET /api/communities/feed`)**:
    - Cursor-based pagination returning unified polymorphic feed (`POST`, `LOST_FOUND`, `MARKETPLACE`, `GAMING`, `RIDESHARE`, `HOUSING`, `ACADEMICS`).
  - **Campus Hub Horizontal Bar (`CampusHubStrip`)**:
    - 6 vibrant hub cards with unique gradients, live counters, and fast 1-click filter switching.
  - **Custom Dedicated UI Cards**:
    - `<LostFoundCard />`, `<MarketplaceCard />`, `<GamingLobbyCard />`, `<RideshareCard />`, `<HousingCard />`, `<AcademicCard />`.
  - **Hub Creation Modal (`HubCreateModal`)**:
    - Contextual input form supporting immediate publication to all 6 hubs with optimistic updates.
  - **Database Seeding**:
    - Registered official campus hubs in `communities` and seeded authentic BIT Mesra content across all 6 tables.

- [x] **Campus Time Capsule & Batch Legacy Vault (`/app/capsule`) — Breakthrough Unique Feature**:
  - **Concept**: Digital institutional time machine where students and graduating batches seal predictions, convocation letters, photos, and memories with cryptographic countdown clocks.
  - **Schema & Database**:
    - `src/db/schema/time-capsule.ts`: `time_capsules` and `capsule_entries` tables with college institution scoping and categories (Convocation, Batch Memories, Predictions, Fest, Hostel).
  - **APIs**:
    - `GET /api/capsules`: Fetch institutional time capsules.
    - `POST /api/capsules`: Create a new batch/milestone capsule.
    - `POST /api/capsules/[id]/bury`: Bury an encrypted memory, letter, or prediction with anonymous pseudonym toggle.
  - **UI/UX Suite**:
    - `<CapsuleCountdown />`: Real-time Days, Hours, Minutes, and Seconds ticker.
    - `<CapsuleBuryModal />`: Contextual modal for burying letters, predictions, and photos.
    - `<CapsuleCard />`: Sealed vault countdown state and unlocked museum timeline wall.
    - `/app/capsule`: Server page & client stream with filters (`All`, `Sealed`, `Unlocked`, `Convocation`, `Predictions`).
    - Added to secondary navigation in `MORE_HUB_SECTIONS`.

- [x] **Landing Page Overhaul Without Old/Stale Data (`/`)**:
  - **Scanned Codebase & Removed Outdated Placeholders**:
    - Replaced generic placeholder stats and stale copy with the true, modern, verified collegiate platform.
  - **Overhauled 6-Pillar Bento Grid**:
    - 1. Dynamic Feed & Repost Chimes.
    - 2. 6 Dedicated Campus Hubs.
    - 3. 18+ Campus Match & Secret Crush Vault.
    - 4. Campus Time Capsule & Batch Legacy.
    - 5. 24-Hour Stories & Highlights.
    - 6. Loop Points & Clout Tiers.
  - **New Interactive Showcase Sections**:
    - `<CampusHubShowcase />`: Interactive 6-hub switcher demonstrating Lost & Found, Marketplace, Gaming, Ride Share, Housing, and Notes with live card actions.
    - `<TimeCapsuleShowcase />`: Live countdown ticker, interactive prediction burial, and locked vs unlocked museum wall switcher.
    - Up-to-date college enrollment marquee (1,350+ institutions).



- [x] **Zero-Reload Chat Navigation & Calling Coming Soon Modal**:
  - Replaced Next.js `router.push('/app/chat/' + convId)` with `window.history.pushState(null, '', '/app/chat/' + convId)` and `popstate` listener. Selecting conversations now switches active chats in 0ms with zero layout flashing or page remounts.
  - Added sleek "CampusLoop Encrypted Voice & Video Calling — Coming Soon" dialog on the call buttons informing users that P2P encrypted rooms are in testing for verified college networks.

- [x] **Presence System & "Everyone Is Online" Fix**:
  - Removed unconditional hardcoded green dot (`bg-emerald-500`) in `src/components/chat/messenger-pane.tsx`.
  - Replaced with dynamic `<PresenceDot lastSeenAt={otherParticipant?.lastSeenAt} />` checking true 2-minute activity window.
  - Header status line now shows live pulsing "Online" indicator when active, or exact "Active Xm ago" / "Offline" with neutral dot when away.
  - Added automated presence heartbeat recording on message reads and sends.

- [x] **Follow/Following Button & Fast Follower List on Vanity Profiles**:
  - Added `<PublicFollowButton />` to unauthenticated / guest vanity profile pages (`/@username`) so visitors can instantly follow students with 1 tap or jump straight to registration with return URL.
  - Optimized follower/following dialog and user cards with instant modal states.

- [x] **Comprehensive Browser & PWA Notification Upgrade**:
  - Built direct browser notification engine via `triggerBrowserNotification()` supporting desktop and mobile devices without requiring VAPID configuration.
  - Upgraded `usePushNotifications()` and `PushNotificationToggle` with 1-click permission opt-in and instant "Test Ping" button.
  - Added incoming chat message and new campus notification triggers that dispatch native system notifications when tabs are backgrounded.
  - Integrated App Badging API (`navigator.setAppBadge`) synced with unread count.

- [x] **Twitter/X UI/UX Overhaul for `/privacy`, `/terms`, `/safety`, `/contact`**:
  - Built sticky Twitter/X-style `<LegalNav />` segmented tabs (`Privacy Policy`, `Terms of Service`, `Campus Safety`, `Contact & Grievance`).
  - Redesigned `/privacy`, `/terms`, and `/safety` with quick-jump table of contents pills, minimalist high-contrast cards, and clean typography while preserving all statutory DPDP Act 2023, IT Act 2000, and UGC Anti-Ragging regulations.

- [x] **Addictive Hover Effects on Bento Grid ("Everything on campus, in one loop.")**:
  - Created `<InteractiveBentoCard />` with dynamic cursor-following radial spotlight, elevation lift (`hover:-translate-y-2 hover:shadow-2xl`), radiant border glows, and smooth shimmer light sweep.
  - Applied tailored accent gradients across Feed (coral), Match (rose), Hubs (emerald), Time Capsule (amber), and Loop Points (indigo).

- [x] **Primed Seed Account `@btech10223_25` for Demo Video**:
  - Updated Shreemaya Raj's profile (`@btech10223_25`, BIT Mesra) with 285 Loop Points (Verified Star Student), custom avatar, and banner.
  - Created realistic active chats with BIT Mesra classmates (Ananya Kashyap, Devanshu Mishra, Kabir Sengupta).
  - Seeded mutual dating match, secret crush double-blind lock, community memberships, 26 followers, and a sealed 2025 Convocation Time Capsule entry.


