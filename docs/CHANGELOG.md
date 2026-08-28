# 📜 CampusLoop Changelog & Taste Log

A log of significant product updates, UI decisions, and architectural commits.

---

### Recent Updates

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
