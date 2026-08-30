 also like https://campusloop.space/app/college/bitmesra isnt working on incognito without login fix that I have to rank certain pages that can be ranked on google and users have to see those pages show that also add proper seo just hide feeds and interations , '/Users/shaswatraj/Desktop/startups/campusloop/docs/CAMPUS_PREVIEW_FEATURE.md' also see if this feature is working just give them access to see things around

❯ https://campusloop.space/app/onboarding make ui ux of this page and every other page twitter like clean and minimal dry

❯ also fix https://campusloop.space/merchant-portal/login this page is continueouly redirecting me fix all and dont run build commands everytime it do time waste just check ts erres and commit

 keep separate onboading and schema for viewer mode users and say you need a college email id access to start interating with community
 

# CampusLoop Tasks & Fixes

Working notes for CampusLoop. **Open work is at the top**; everything below
`## Shipped` is a log of completed features kept for reference.

---

## 🔭 Open

### Verify on production after the next deploy
- [ ] YouTube links render as players in posts *and* DMs. The parser and render
      path are correct and unit-tested; the previous report predates a deploy, so
      confirm on the live site before reopening.
- [ ] Branded QR + short links (`/e/:id`, `/a/:slug`) resolve and the downloaded
      PNG card looks right on both light and dark phones.
- [ ] "Who to follow" no longer resurfaces people you already follow.

### Content quality (from the earlier bug sweep — not yet addressed)
- [ ] Remove duplicate templated seed comments.
- [ ] Clean obvious generated filler posts under `#CampusLife`.
- [ ] Hub label renders inconsistently as "bitmesra Hub" vs "Campus" — normalise
      the display name in one place.

### Posts — needs reproduction
- [ ] Comment counter can disagree between the post card and the thread.
- [ ] Comment/Post button occasionally stays in its loading state after success.
- [ ] Composer briefly shows a placeholder "Student" / "U" identity before the
      real profile hydrates.

### Deliberately not doing
- Reels. Confirmed out of scope.

---

## ✅ Shipped

### QR sharing, blogging, markdown and performance (this pass)
- [x] **Campus Articles (blog) end to end**: `articles` + `article_votes` tables,
      full CRUD API, hub, reader, editor, edit page, paginated author dashboard,
      upvote/downvote, `Article` JSON-LD, OG images and a profile Articles tab.
- [x] **Articles surfaced in the feed** between posts, and in the More hub.
- [x] **Branded QR share cards** with a per-surface accent theme and optional
      avatar, on events, articles, own profile, public `/@username` profiles and
      communities, via a reusable `ShareQrButton`.
- [x] **Memorable short links**: `/e/:id` for events and `/a/:slug` for articles,
      each carrying its own OG metadata so link unfurls work without a redirect.
- [x] **Shared markdown system**: `MarkdownContent` (renders to React elements,
      never raw HTML) and `MarkdownEditor` (toolbar, image upload, paste/drop,
      ⌘B/⌘I, live preview). Replaced two partial inline renderers that silently
      dropped bold, italic, links and inline code.
- [x] **`/app/events/new` overhaul**: markdown description with template, banner
      upload, registration deadline, team sizes, participant cap, paid entry,
      Loop Points reward, perk chips, draft autosave and Save-as-Draft.
- [x] **Event API validation**: end after start, registration closing on or
      before start, and an organiser-selectable DRAFT status.
- [x] **Anonymous posts never appear on public profiles** (page query and the
      author-scoped feed API).
- [x] **Confessions**: "Confess" button on `/app/confessions`, a Confessions link
      after "For You" on the feed, and `?type=CONFESSION` now actually preselects
      the composer type.
- [x] **Cache-first with background refresh**: global SWR policy paints from the
      persisted cache and revalidates on focus (30s throttle) and reconnect;
      removed 14 stale per-call-site opt-outs.
- [x] **SEO**: `sitemaps/articles.xml` and `sitemaps/events.xml` registered in the
      sitemap index; schema.org `Event` data, canonical URL and Twitter card on
      event pages.
- [x] **Payload trimming**: article list endpoints no longer ship full markdown
      bodies; per-user article query is bounded.

### Build and correctness fixes
- [x] Implemented `awardPoints`, which was imported but never existed, and split
      it into `@/lib/gamification-server` so `@/db` stays out of client bundles.
- [x] Restored missing `"use client"` directives (event detail, `rich-text`).
- [x] YouTube parser now handles `/live/`, `m.` and `music.` hosts and any `v`
      param position, and rejects lookalike domains. Chat reuses the shared
      parser instead of its own weaker copy.
- [x] Two test files imported `bun:test` under a vitest runner and never ran.
- [x] Profile Articles tab count was permanently "(0)".
- [x] Added the `haptics.error()` pattern this file documented but which was
      never implemented.

### Earlier work

- [x] **Chat Overhaul: Call Buttons Removed, Mobile Long-Press / Desktop 3-Dots Actions, and Instagram/WhatsApp User Info & Media Drawer**:
  - Removed Voice Call and Video Call buttons, state, and modal from the chat header.
  - Added mobile long-press gesture detection (450ms with optional haptic vibration) and desktop hover 3-dots menu to conversation items on `/chat`.
  - Built `src/components/chat/conversation-action-modal.tsx` supporting Pin to Top, Mute Notifications, Archive/Unarchive, Mark as Read/Unread, View Profile, and Delete Chat with confirmation dialog.
  - Added non-breaking columns (`is_archived`, `is_muted`, `is_pinned`, `last_cleared_at`) to `conversation_participants` schema in `src/db/schema/chat.ts` and executed migration on Neon DB.
  - Implemented `PATCH /api/chat/[id]` and `DELETE /api/chat/[id]` endpoints for full conversation lifecycle control.
  - Added `ARCHIVED` tab to inbox filters on `/chat` (`ALL`, `UNREAD`, `CAMPUS`, `ARCHIVED`) and rendered visual Pin and Mute badges on conversation items.
  - Built Instagram / WhatsApp-style User Info & Shared Content Drawer (`src/components/chat/chat-user-info-drawer.tsx`) opening on clicking the user avatar/name in chat (Profile, Secret Crush, Mute, Search, Media grid, Links list, Clear chat, Delete chat, Block/Report).
  - Added unit test suite in `src/lib/chat-actions.test.ts` (all 67 tests passing).

- [x] **Twitter-Style Full-Width UI/UX Overhaul & Mobile Feeds College Hyperlinks**:
  - Removed `hidden sm:inline` from `src/components/feed/feed-card-header.tsx` and added `School` icon alongside clickable college name/slug hyperlinks on mobile feeds.
  - Redesigned Academic Branch Directory (`src/app/app/(main)/branch/[slug]/branch-client.tsx`) with full-width space utilization, sticky top bar, equal-width Twitter tabs, search bar, and edge-to-edge student directory rows (`divide-y divide-border/30`).
  - Redesigned Profile View (`src/app/app/(main)/profile/profile-client.tsx`) with full-width edge-to-edge banner, responsive overlapping avatar and action buttons, Twitter metadata row (College, Branch, Year, Vanity Link), equal-width tabs, and edge-to-edge post feeds.
  - Added `min-w-0 max-w-full overflow-x-clip` to `src/app/app/(main)/layout.tsx` and `src/app/[username]/page.tsx` to prevent horizontal flex child overflow on mobile devices.

- [x] **Secret Crush Vault LP Expansion (5 to 50 Slots)**:
  - Linked Secret Crush vault capacity to the student's Loop Points (LP) clout in `src/constants/gamification.ts`.
  - Unlocked expansion from 5 slots to 50 slots automatically at 150 LP (`VERIFIED_LP_THRESHOLD` / Gold Star status).
  - Updated `src/app/api/dating/crush/route.ts` with dynamic `maxSlots` and `slotProgress` (calculating points needed and progress percent).
  - Enforced dynamic slot validation in `POST /api/dating/crush` with helpful motivational error copy when max limit is reached.
  - Added LP Clout Expansion Card with animated progress bar and remaining LP counter to `src/components/dating/secret-crush-modal.tsx` and `src/app/app/(main)/crush/crush-client.tsx`.
  - Added unit test suite in `src/lib/dating.test.ts` covering slot limit thresholds and progress calculations (all 64 tests passing).

- [x] **Cloudflare Email Sending & Notification Email Engine**:
  - Configured native `send_email` binding (`EMAIL`) in `wrangler.jsonc` and generated runtime types in `cloudflare-env.d.ts`.
  - Built universal email utility in `src/lib/email.ts` with Cloudflare Worker `env.EMAIL.send()` and REST API fallback.
  - Implemented responsive, high-contrast HTML email templates in `src/lib/email-templates.ts`.
  - Wired `dispatchNotificationEmail` into notification dispatch engine in `src/lib/notifications.ts`.
  - Added `email` column to `user_profiles` schema and stored verified student emails during onboarding.
  - Added test API endpoint `/api/admin/test-email` and automated unit test suite `src/lib/email.test.ts` (all 61 tests passing).

- [x] **Dating Swipe Deck Overhaul & High-Resolution Unsplash Seeding**:
  - Eliminated swipe card freezing (fixed double-increment bug in `dating-app-client.tsx` and isolated card keys with `key={top.id}`).
  - Added velocity-based swipe release (`velocity.x > 400 || offset.x > 80`) for effortless mobile flicking.
  - Added circular PFP avatar directly before candidate names on full-screen cards with drop shadow and outline.
  - Replaced comic Dicebear avatars with curated, respectable Unsplash college student portraits across all 1,586 database profiles.
  - Added instant GPU/browser image preloader for zero-lag mobile transitions.
  - Added Dating link with Heart icon to desktop left sidebar and mobile navigation drawer.

- [x] **Dedicated Campus Utility Portals & Authentic Student Sub-Hubs (`/app/communities`)**:
  - Restored authentic interest communities (`c/coding`, `c/music-band`, `c/anime`, etc.) with full Reddit-style sorting (*Hot, New, Top, Rising, Discussed*).
  - Built 6 dedicated, high-conversion utility portals:
    - `/app/lost-and-found`
    - `/app/marketplace` (with `/app/buy-and-sell` redirect)
    - `/app/gaming` (with `/app/gaming-arena` redirect)
    - `/app/rideshare` (with `/app/ride-share` redirect)
    - `/app/housing` (with `/app/housing-and-flats` redirect)
    - `/app/academics`

- [x] **Monochrome Legal & Safety Portal Redesign (`/safety`, `/privacy`, `/terms`, `/contact`)**:
  - Rebuilt with clean, minimal monochrome document architecture in `src/components/marketing/legal-doc.tsx`.
  - Added sticky Twitter-style tab strip in `src/components/marketing/legal-nav.tsx` connecting Privacy, Terms, Safety, and Contact.
  - Built active section intersection observer table of contents on desktop.
  - Comprehensive statutory compliance with IT Rules 2021, UGC Anti-Ragging Regulations 2009, and DPDP Act 2023.

- [x] **Campus Time Capsule & Landing Page Overflow Fix**:
  - Fixed horizontal overflow (`overflow-x`) on the Time Capsule showcase by adding `min-w-0` to form inputs and grid columns.
  - Added `overflow-x-clip` to root landing page wrapper preventing viewport blowout on mobile.

- [x] **Comprehensive Root `ARCHITECTURE.md` & Full Technical Deep-Dive**:
  - Authored root `ARCHITECTURE.md` detailing system diagrams, database topologies, edge infrastructure, and engine specifications.
  - Attached to `README.md` and updated all `.md` files.

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

- [x] **Signature Repost Celebration, Zero-Latency Audio/Haptic Engine & PWA Suite**:
  - **Repost Ting Sound & Celebratory Animation**:
    - Dual-tone crystalline "Ting!" chime synthesized on-the-fly via pure Web Audio API (`AudioContext`) with bell overtones at 1760 Hz & 2637 Hz.
    - Fullscreen emerald rotating `Repeat2` pop overlay with glowing pulse and celebratory badge.
    - High-energy emerald & mint confetti particle burst via `canvas-confetti`.
  - **Zero-Latency Web Audio Engine (`src/lib/sounds.ts`)**:
    - 100% offline, zero external audio asset files, zero network latency.
    - Synthesized sounds: `ting()` (repost & publish), `pop()` (heart like & double tap), `send()` (message & comment whoosh), `tap()` (tabs & filter pills), `match()` (secret crush & dating chord arpeggio), and `archive()` (metallic latch).
  - **Physical Haptic Feedback Engine (`src/lib/haptics.ts`)**:
    - Native vibration patterns for light taps, impact upvotes, repost celebrations, and error alerts.
