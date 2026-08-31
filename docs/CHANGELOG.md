# 📜 CampusLoop Changelog & Taste Log

A log of significant product updates, UI decisions, and architectural commits.

---

### Recent Updates

- **PeerJS 1-to-1 WebRTC Video & Audio Calling (`/app/chat`)**:
  - Direct P2P audio (Opus) and video (VP8/H.264) calling integrated into messenger header using `peerjs`.
  - Strict separation of Control Plane (Cloudflare Workers, Upstash Redis sub-5ms signaling, PostgreSQL `call_sessions` table) and Media Plane (direct browser P2P without worker relay bandwidth).
  - Built unified [`CallEngine`](campusloop/src/lib/calls/call-engine.ts) abstraction handling ICE lifecycle, track toggles, mobile front/back camera flipping, and resilient audio fallback.
  - Implemented modern floating calling card on desktop and full-screen calling sheet on mobile with crystal-clear audio chimes and haptics.

- **Omegle-Style Random Loop Video Discovery (`/app/random`)**:
  - Added seamless transition from anonymous text chat to live video via mutual consent (`userAVideoRequested && userBVideoRequested`).
  - Accountable Anonymity: real identity remains 100% masked as "Anonymous Student" until both users tap **Reveal Me**.
  - One-tap "Become Friends" action connects both students on CampusLoop's relational follow graph and creates a persistent DM thread in `/app/chat`.
  - Next Person action immediately destroys local camera/mic hardware tracks and re-queues.

- **Upstash Redis User Behavior Analytics & Personalization Engine**:
  - Integrated Upstash Redis REST client (`@upstash/redis` in [`src/lib/redis.ts`](campusloop/src/lib/redis.ts)) for sub-5ms user affinity ingestion.
  - Built [`trackUserBehavior`](campusloop/src/lib/user-behavior.ts) and `/api/behavior/track` recording dwell times, clicks, searches, and calling completions to fuel real-time algorithmic boosts and recommendation scoring.
  - Backed by durable audit event log in PostgreSQL `user_behavior_events` table.

- **Follows & Mutual Friends Feed Algorithm Boost**:
  - Enhanced `for_you` feed ranking in [`src/lib/feed.ts`](campusloop/src/lib/feed.ts) to significantly prioritize posts created by followed classmates (+80.0 score) and mutual friends (+120.0 score).
  - Preserved accountable anonymity invariants (boosts do not expose identity on anonymous confessions).
  - Added unit test suite in [`src/lib/feed.test.ts`](campusloop/src/lib/feed.test.ts) (105 total passing tests).
  - Repositioned the interactive feature navigation dots in [`src/components/landing/hero-preview.tsx`](campusloop/src/components/landing/hero-preview.tsx) to sit cleanly below floating micro-cards with dedicated clearances (`mt-14 sm:mt-16 pt-3 relative z-30`), eliminating visual overlap on all viewport sizes.
  - Redesigned switcher dots with tactile pills (active `w-8 bg-primary`, inactive `w-2.5 bg-muted-foreground/25`) and accessible touch hit-boxes.
  - Converted [`src/components/landing/interactive-bento-card.tsx`](campusloop/src/components/landing/interactive-bento-card.tsx) cursor radial spotlight tracking to pure GPU CSS variables (`--mouse-x`, `--mouse-y`), removing all React component re-renders on mousemove for 120fps scrolling and hover performance.
  - Enhanced [`src/components/landing/reveal.tsx`](campusloop/src/components/landing/reveal.tsx) viewport triggers (`amount: 0.15`) with `will-change-transform` GPU layers.
  - Created standardized AI & LLM ingestion files [`public/llms.txt`](campusloop/public/llms.txt) and [`public/llms-full.txt`](campusloop/public/llms-full.txt) following the official `llmstxt.org` specification.
  - Created [`public/humans.txt`](campusloop/public/humans.txt), [`public/security.txt`](campusloop/public/security.txt), and [`public/.well-known/security.txt`](campusloop/public/.well-known/security.txt) (RFC 9116).
  - Added India GEO search metadata (`geo.region`, `geo.placename`, `geo.position`, `ICBM`) and enhanced Schema.org `GeoCoordinates` / `EducationalAudience` JSON-LD in [`src/app/layout.tsx`](campusloop/src/app/layout.tsx) and [`src/app/page.tsx`](campusloop/src/app/page.tsx).

- **In-Feed Vibe-Matching Student Profile Recommendations**:
  - Implemented semantic user recommendation engine ([`src/lib/recommendations/recommended-users.ts`](campusloop/src/lib/recommendations/recommended-users.ts)) combining Qdrant Cloud vector embeddings, mutual interests, shared college hubs, and academic branch matching.
  - Multi-tier fallback pipeline: 1st Qdrant Vector Semantic Vibe match -> 2nd Shared Interests/Department -> 3rd Same Campus -> 4th Active Verified Loopers.
  - Created `/api/profile/recommended` endpoint with strict user authentication and un-followed candidate filtering.
  - Built sleek in-feed carousel widget ([`src/components/feed/feed-recommended-users.tsx`](campusloop/src/components/feed/feed-recommended-users.tsx)) with vibe match badges (`✨ 94% Vibe Match`, `🏛️ Same Campus`, `⚡ Coding`), monogram fallback DP, and 1-tap tactile follow actions.
  - Embedded seamlessly into `/app` feed timeline at `idx === 3`.
  - Added unit test suite in [`src/lib/recommendations/recommended-users.test.ts`](campusloop/src/lib/recommendations/recommended-users.test.ts) (all 102 tests passing).

- **Two-Sided Multi-Armed Bandit Matching Engine & Dating Mobile Skeleton Overhaul**:
  - Implemented state-of-the-art **Two-Sided Matching & Discovery Engine** (`rankDatingCandidates` in [`src/lib/dating.ts`](campusloop/src/lib/dating.ts)) based on Reciprocal Recommender Systems and Thompson Sampling:
    - **Reciprocal Matching Priority**: Automatically elevates candidates who liked the user to the front of the deck for instant mutual match celebrations (+18 score boost).
    - **Interleaved Exploration vs Exploitation**: Partitions candidates into Top Affinity (65%) and Fresh Exploratory Discovery (35%) tiers to completely eradicate the "same people repeatedly" problem.
    - **Temporal Session Hash Rotation**: Dynamic seed rotating every 20 minutes ensures refreshing the deck surfaces fresh campus faces rather than a static Postgres disk-order slice.
    - **Candidate Pool Expansion**: Enlarged database candidate fetch from 60 to 150 rows with activity ordering (`desc(userProfiles.updatedAt)`, `desc(userProfiles.points)`).
  - Built high-fidelity full-screen mobile card skeleton ([`src/components/dating/dating-card-skeleton.tsx`](campusloop/src/components/dating/dating-card-skeleton.tsx)) eliminating layout shift on `/app/dating`.
  - Refactored sidebar anonymity switcher to clean Twitter/X-style monochrome **"Anon Mode"** toggle in [`src/components/ui/navigation.tsx`](campusloop/src/components/ui/navigation.tsx).
  - Added unit test suite in [`src/lib/dating.test.ts`](campusloop/src/lib/dating.test.ts) (all 100 tests passing).

- **Qdrant Vector Database Integration & Zero-Downtime Semantic Recommendations**:
  - Built resilient Qdrant REST client wrapper ([`src/lib/qdrant/client.ts`](campusloop/src/lib/qdrant/client.ts)) with strict 600ms timeout and circuit breaker protection.
  - Built zero-dependency serverless 384-dimensional dense vector generator ([`src/lib/qdrant/embeddings.ts`](campusloop/src/lib/qdrant/embeddings.ts)) with L2 normalization.
  - Defined collections in [`src/lib/qdrant/collections.ts`](campusloop/src/lib/qdrant/collections.ts) (`campus_posts`, `campus_dating_profiles`, `campus_communities`).
  - Implemented semantic Related Campus Discussions recommendation engine ([`src/lib/recommendations/related-posts.ts`](campusloop/src/lib/recommendations/related-posts.ts)) with 100% resilient fallback to PostgreSQL queries when Qdrant is offline.
  - Created [`src/components/post/related-posts-widget.tsx`](campusloop/src/components/post/related-posts-widget.tsx) and embedded on `/app/post/[id]` displaying related campus threads with similarity match percentage badges.
  - Added non-blocking fire-and-forget vector indexing during post creation (`POST /api/posts`).
  - Added unit test suite in [`src/lib/qdrant.test.ts`](campusloop/src/lib/qdrant.test.ts) (all 98 tests passing).

- **Mobile Bottom Navigation & Sidebar Anonymity Toggler**:
  - Replaced "More" with **"Dating"** (`/app/dating` with `Heart` icon) on the mobile bottom navigation bar ([`src/constants/navigation.ts`](campusloop/src/constants/navigation.ts)).
  - Built Anonymity Mode Quick Switcher (`FeedAnonymityQuickToggle` in [`src/components/ui/navigation.tsx`](campusloop/src/components/ui/navigation.tsx)) in desktop sidebar and mobile drawer.
  - Enabled zero-reload instant timeline filtering via `campusloop_feed_visibility_change` window event and `localStorage` synchronization in [`src/app/app/(main)/feed-client.tsx`](campusloop/src/app/app/(main)/feed-client.tsx).
  - Polished Dating Deck UI/UX with theme-adaptive headers, direct Secret Crush vault link, and enhanced tactile action buttons.
  - Revamped `/app/more` with prominent highlighted Instagram banner (`@campusloop.space`), LinkedIn, and X official channel links.

- **Real Photo Verification Psychological Nudges & Collegiate Monogram Default DP**:
  - Upgraded default avatar fallback in [`src/lib/utils.ts`](campusloop/src/lib/utils.ts) to clean, rich-palette Monogram initial SVG generator.
  - Enhanced Onboarding and Profile Edit flows with "+50 LP Clout Reward" badge and "📸 Real Photo Verified" status, demoting cartoon avatar generation to a subtle secondary picker with social proof deterrents.
  - Removed Voice Call and Video Call buttons, state, and modal from the chat header.
  - Added mobile long-press gesture detection (450ms with optional haptic vibration) and desktop hover 3-dots menu to conversation items on `/chat`.
  - Built [`src/components/chat/conversation-action-modal.tsx`](campusloop/src/components/chat/conversation-action-modal.tsx) supporting Pin to Top, Mute Notifications, Archive/Unarchive, Mark as Read/Unread, View Profile, and Delete Chat with confirmation dialog.
  - Added non-breaking columns (`is_archived`, `is_muted`, `is_pinned`, `last_cleared_at`) to `conversation_participants` schema in [`src/db/schema/chat.ts`](campusloop/src/db/schema/chat.ts) and executed migration on Neon DB.
  - Implemented `PATCH /api/chat/[id]` and `DELETE /api/chat/[id]` endpoints for full conversation lifecycle control.
  - Added `ARCHIVED` tab to inbox filters on `/chat` (`ALL`, `UNREAD`, `CAMPUS`, `ARCHIVED`) and rendered visual Pin and Mute badges on conversation items.
  - Built Instagram / WhatsApp-style User Info & Shared Content Drawer ([`src/components/chat/chat-user-info-drawer.tsx`](campusloop/src/components/chat/chat-user-info-drawer.tsx)) opening on clicking the user avatar/name in chat:
    - Profile header with large avatar, online presence dot, verified shield check, bio, college & branch hyperlinks, and LP clout badge.
    - Quick actions: Profile, Secret Crush toggle, Mute toggle, and Search in chat.
    - Shared Media tab with thumbnail grid and full-screen lightbox modal.
    - Shared Links tab with clickable domain previews and timestamps.
    - Privacy controls: Mute notifications, Clear message history, Delete chat, and Block/Report student.
  - Added unit test suite in [`src/lib/chat-actions.test.ts`](campusloop/src/lib/chat-actions.test.ts) (all 67 tests passing).

- **Twitter-Style Full-Width UI/UX Overhaul & Mobile Feeds College Hyperlinks**:
  - Removed `hidden sm:inline` from [`src/components/feed/feed-card-header.tsx`](campusloop/src/components/feed/feed-card-header.tsx) and added `School` icon alongside clickable college name/slug hyperlinks on mobile feeds.
  - Redesigned Academic Branch Directory ([`src/app/app/(main)/branch/[slug]/branch-client.tsx`](campusloop/src/app/app/(main)/branch/[slug]/branch-client.tsx)) with full-width space utilization, sticky top bar, equal-width Twitter tabs, search bar, and edge-to-edge student directory rows (`divide-y divide-border/30`).
  - Redesigned Profile View ([`src/app/app/(main)/profile/profile-client.tsx`](campusloop/src/app/app/(main)/profile/profile-client.tsx)) with full-width edge-to-edge banner, responsive overlapping avatar and action buttons, Twitter metadata row (College, Branch, Year, Vanity Link), equal-width tabs, and edge-to-edge post feeds.
  - Added `min-w-0 max-w-full overflow-x-clip` to [`src/app/app/(main)/layout.tsx`](campusloop/src/app/app/(main)/layout.tsx) and [`src/app/[username]/page.tsx`](campusloop/src/app/[username]/page.tsx) to prevent horizontal flex child overflow on mobile devices.

- **Secret Crush Vault LP Expansion (5 to 50 Slots)**:
  - Linked Secret Crush vault capacity to the student's Loop Points (LP) clout in [`src/constants/gamification.ts`](campusloop/src/constants/gamification.ts).
  - Unlocked expansion from 5 slots to 50 slots automatically at 150 LP (`VERIFIED_LP_THRESHOLD` / Gold Star status).
  - Updated [`src/app/api/dating/crush/route.ts`](campusloop/src/app/api/dating/crush/route.ts) with dynamic `maxSlots` and `slotProgress` (calculating points needed and progress percent).
  - Enforced dynamic slot validation in `POST /api/dating/crush` with helpful motivational error copy when max limit is reached.
  - Added LP Clout Expansion Card with animated progress bar and remaining LP counter to [`src/components/dating/secret-crush-modal.tsx`](campusloop/src/components/dating/secret-crush-modal.tsx) and [`src/app/app/(main)/crush/crush-client.tsx`](campusloop/src/app/app/(main)/crush/crush-client.tsx).
  - Added unit test suite in [`src/lib/dating.test.ts`](campusloop/src/lib/dating.test.ts) covering slot limit thresholds and progress calculations (all 64 tests passing).

- **Cloudflare Email Sending & Notification Email Dispatch**:
  - Bound native `send_email` binding (`EMAIL`) in `wrangler.jsonc` and generated runtime types in `cloudflare-env.d.ts`.
  - Built universal email utility in [`src/lib/email.ts`](campusloop/src/lib/email.ts) supporting native Cloudflare Worker `env.EMAIL.send()`, REST API fallback, and safe simulated dev delivery.
  - Designed responsive, high-contrast HTML email templates in [`src/lib/email-templates.ts`](campusloop/src/lib/email-templates.ts) for mentions, replies, matches, and student onboarding.
  - Wired `dispatchNotificationEmail` into notification dispatch engine in [`src/lib/notifications.ts`](campusloop/src/lib/notifications.ts).
  - Added `email` column to `user_profiles` schema and stored verified student emails during onboarding.
  - Created test API endpoint `/api/admin/test-email` and automated unit test suite `src/lib/email.test.ts` (all 61 tests passing).

- **Comprehensive System Architecture & Technical Specifications**:
  - Created [**`ARCHITECTURE.md`**](../ARCHITECTURE.md) in the project root detailing full system diagrams, edge worker runtime, Drizzle ORM database topologies, and engine specifications.
  - Linked and documented in `README.md` and `docs/ARCHITECTURE.md`.

- **Monochrome Legal & Safety Portal Redesign (`/safety`, `/privacy`, `/terms`, `/contact`)**:
  - Replaced busy dashboards with clean, minimal monochrome document architecture in `src/components/marketing/legal-doc.tsx`.
  - Added sticky Twitter-style tab strip in `src/components/marketing/legal-nav.tsx` connecting Privacy, Terms, Safety, and Contact.
  - Built active section intersection observer table of contents on desktop.
  - Comprehensive statutory compliance with IT Rules 2021, UGC Anti-Ragging Regulations 2009, and DPDP Act 2023.

- **Campus Match (`/app/dating`) Complete Overhaul**:
  - **Freezing Bug Eliminated**: Fixed double-increment bug in `dating-app-client.tsx` and isolated card state using `key={top.id}`.
  - **Velocity Gesture Detection**: Added swipe velocity threshold (`velocity.x > 400 || offset.x > 80`) for effortless mobile flicking.
  - **Circular PFP Indicator**: Rendered 10-px circular profile picture avatar directly before candidate names on full-screen cards.
  - **Curated Respectable Unsplash Portraits**: Replaced comic Dicebear avatars with verified college student portrait sets in `dating-photos.ts`, migrating all 1,586 database profiles.
  - **Zero-Lag Image Preloader**: Preloaded upcoming candidate photos into browser memory for buttery-smooth card transitions.
  - **Sidebar Integration**: Added "Dating" with heart icon to the permanent left desktop sidebar and mobile navigation drawer.

- **Dedicated Campus Utility Portals & Authentic Student Sub-Hubs (`/app/communities`)**:
  - Restored authentic interest communities (`c/coding`, `c/music-band`, `c/anime`, etc.) with full Reddit-style sorting (*Hot, New, Top, Rising, Discussed*).
  - Built 6 dedicated, high-conversion utility portals:
    - `/app/lost-and-found`
    - `/app/marketplace` (with `/app/buy-and-sell` redirect)
    - `/app/gaming` (with `/app/gaming-arena` redirect)
    - `/app/rideshare` (with `/app/ride-share` redirect)
    - `/app/housing` (with `/app/housing-and-flats` redirect)
    - `/app/academics`

- **Mobile Chat UI/UX & Resilient Skeletons**:
  - Replaced single-line inputs with auto-expanding textarea supporting native clipboard & keyboard sticker paste (Gboard & iOS Memojis).
  - Safe-area bottom padding with `pb-[max(0.75rem,env(safe-area-inset-bottom))]`.
  - Created responsive `ChatSkeleton` and thread loading states eliminating blank screens on mobile devices.

- **Campus Time Capsule & Landing Page Overflow Fix**:
  - Fixed horizontal overflow (`overflow-x`) on the Time Capsule showcase by adding `min-w-0` to form inputs and grid columns.
  - Added `overflow-x-clip` to root landing page wrapper preventing viewport blowout on mobile.

- **Signature Repost Celebration, Audio & Haptic Engine**:
  - Synthesized crystalline Web Audio chimes via Web Audio API (`src/lib/sounds.ts`) with zero network latency.
  - Native physical vibration feedback via `src/lib/haptics.ts`.
  - Confetti and rotation celebrations on 1-tap and quoted reposts.
