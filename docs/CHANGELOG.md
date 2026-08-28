# 📜 CampusLoop Changelog & Taste Log

A log of significant product updates, UI decisions, and architectural commits.

---

### Recent Updates

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
