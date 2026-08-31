---
name: campusloop-guide
description: Detailed architectural handbook, coding standards, database patterns, and workflow guidelines for AI agents working on the CampusLoop codebase.
---

# 🎓 CampusLoop — AI Agent Skill & Codebase Guide

This skill provides AI agents with comprehensive context, architectural rules, code conventions, and workflows required to safely and effectively extend the **CampusLoop** platform.

---

## 🚀 1. Platform Motive & Overview

**CampusLoop** is a verified, student-only social platform tailored for university campuses. Key surfaces:

- **Campus Feed (`/app`)**: Public posts, 100% anonymous confessions, polls, questions, memes, hashtag filtering, double-tap hearts, and Twitter-style 1-tap & quote reposts.
- **Scope Switching**: Toggle between **Campus** (my college only) and **Global** (all colleges in India).
- **Stories / Vibes (`/app/stories`)**: 24-hour visual campus stories with progress-bar viewer, DM reply integration, archive and profile highlights.
- **Chat & Calling (`/app/chat`)**: Direct and group messaging, plus 1-to-1 WebRTC audio/video calls over PeerJS.
- **Random Loop (`/app/random`)**: Omegle-style student matching with accountable anonymity and mutual-consent video.
- **Campus Match / Dating (`/app/dating`, `/app/matching`)**: Swipeable deck with gender & scope filters, match overlay, and Secret Crush escrow (`/app/crush`).
- **Notifications (`/app/notifications`)**: Web Push to phones, per-category switches, and per-person mutes. See §6.
- **Campus Directory (`/app/colleges`)**: 1,350+ Indian college hubs with hub request modals.
- **Sub-Hubs & Communities (`/app/communities`, `/app/hub`)**: Interest-based student sub-communities.
- **Utility Portals**: `/app/lost-and-found`, `/app/buy-and-sell`, `/app/gaming`, `/app/rideshare`, `/app/housing`, `/app/academics`, `/app/events`, `/app/capsule`, `/app/birthdays`.
- **Commercial Marketplace (`/app/marketplace`)**: Food, supermarket, laundry, barber, water, rentals — with a separate **merchant portal** (`/merchant-portal`) and admin console (`/admin`).
- **Articles (`/app/articles`)**: Long-form student writing with its own comment and vote tables.
- **Clout & Gamification (LP)**: Loop Points rewarding activity, referrals (+20 LP), "Verified Star" at 150+ LP.
- **Hexclave Authentication**: Auth, phone/email verification, session management.

---

## 🏗️ 2. Core Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.2.6 (App Router). **Production builds use webpack** (`next build --webpack`) — that is what OpenNext consumes |
| **Runtime & Hosting** | Cloudflare Workers via OpenNext (`@opennextjs/cloudflare`) |
| **Database** | Neon Serverless PostgreSQL (`@neondatabase/serverless`) |
| **ORM** | Drizzle ORM (`drizzle-orm`, `drizzle-kit`) |
| **Authentication** | Hexclave Next SDK (`@hexclave/next`) |
| **Cache / Presence** | Upstash Redis (`@upstash/redis`) |
| **Vector Search** | Qdrant Cloud — strictly optional enhancement layer (see Rule 7) |
| **Push** | Web Push over VAPID, signed with Web Crypto (`src/lib/web-push.ts`) so it runs on workerd |
| **Realtime Media** | PeerJS / WebRTC, peer-to-peer — media never traverses the worker |
| **State & Data Fetching** | SWR with centralized helpers (`src/lib/api.ts`) |
| **UI & Styling** | Tailwind CSS v4, Motion (`motion`), Lucide Icons, Sonner toasts, Radix/Base UI |
| **Rich Text Editor** | Tiptap (`@tiptap/react`, `@tiptap/starter-kit`) |
| **Lint / Format** | Biome (`bunx biome check --write ./src`) |
| **Tests** | Vitest — 110 tests across 19 files |

---

## 📁 3. Codebase Directory Layout

~700 files, ~115k lines under `src/`.

```
src/
├── app/
│   ├── app/                        # Authenticated app shell
│   │   ├── (main)/                 # Feed, notifications, profile, settings, utility hubs
│   │   ├── (chat)/chat/            # Messenger
│   │   ├── (dating)/               # dating/ and matching/ decks
│   │   ├── (articles)/articles/    # Long-form writing
│   │   └── (marketplace)/          # Food, supermarket, laundry, rentals, checkout
│   ├── [username]/                 # Public profile + followers / following / friends
│   ├── api/                        # Edge REST endpoints (128 files)
│   │   ├── feed/route.ts           # Dynamic feed with filters, sorts & backfill
│   │   ├── posts/                  # Create, vote, comment, repost, save, archive, report
│   │   ├── chat/                   # Conversations & messages
│   │   ├── notifications/          # List, latest, unread-count, preferences, mute
│   │   ├── push/subscribe/         # Web Push subscription registry
│   │   ├── profile/                # Profile CRUD, follow, suggestions
│   │   ├── dating/ stories/ events/ marketplace/ merchant/ ai/ random/ …
│   ├── admin/                      # Moderation & audit console
│   └── merchant-portal/            # Merchant-facing storefront management
├── components/
│   ├── feed/ stories/ dating/ chat/ post/ profile/ communities/ marketplace/
│   ├── notifications/              # Push opt-in, preference panel, per-person mute
│   └── ui/                         # Base Shadcn/Radix primitives
├── db/
│   ├── schema/                     # 26 domain modules (posts, users, chat, notifications…)
│   ├── schema.ts                   # Barrel re-export — the only import site for tables
│   └── index.ts                    # Neon client (`getDb()`)
├── hooks/                          # useProfile, useFeed, useNotifications, useUserMute, …
├── hexclave/server.ts              # Hexclave server SDK instance
└── lib/
    ├── api.ts                      # Centralized fetcher & mutation helpers
    ├── feed.ts                     # Feed SQL, ranking algorithms & affinity weighting
    ├── notifications.ts            # createNotification / createNotificationsForMany
    ├── notification-preferences.ts # Channels, per-account switches, per-person mutes
    ├── chat-notifications.ts       # Message pings + per-thread collapsing
    ├── post-notifications.ts       # Followed-post fan-out (anonymity-guarded)
    ├── push-dispatch.ts            # Per-device wake-ups, prunes dead endpoints
    ├── web-push.ts                 # VAPID signing on Web Crypto
    ├── follows.ts                  # Follow graph, mutual promotion, keyset pagination
    ├── gamification.ts             # LP & Clout tier calculations
    ├── qdrant/ recommendations/    # Vector search & related-content engines
    └── moderation/                 # PII & content filtering rules
```

---

## 📜 4. Guidelines & Rules for AI Agents

### Rule 1: Next.js App Router & Metadata Rule
- **NEVER** place `"use client"` in `page.tsx` or `layout.tsx` when exporting `generateMetadata` or `metadata`.
- Always split interactive UI into separate client component files (`feed-client.tsx`, `dating-client.tsx`, `edit-profile-client.tsx`).

### Rule 2: High Modularity & Component Sizing
- Keep individual component files under ~150–200 lines.
- Break complex UI into subcomponents inside the designated feature folders (`src/components/feed/`, `src/components/stories/`, `src/components/dating/`, `src/components/notifications/`).

### Rule 3: Centralized API Fetchers & Custom Hooks
- Do **NOT** write ad-hoc `fetch()` calls or re-implement standard hooks inside components.
- Use `fetcher` / `apiRequest` from [`src/lib/api.ts`](../../../src/lib/api.ts) and hooks from [`src/hooks/`](../../../src/hooks/).

### Rule 4: Drizzle ORM on Cloudflare Workers
- Import every table from `@/db/schema` (the barrel), never from a `schema/*` module directly.
- When using the Relational Query Builder (`db.query`), avoid deep self-referential nested queries (e.g. `with: { repostOf: { with: { ... } } }`) — they trigger worker query cache errors. Batch-resolve instead (`inArray(posts.id, ids)` after the primary query).
- **Schema changes are applied with `bun run db:push`, never `drizzle-kit generate`.** The `drizzle/` migration chain is stale — its newest snapshot predates most of the schema, so `generate` emits a destructive full recreate of every table. If you need explicit DDL for production, add an idempotent file to `drizzle/manual/`.

### Rule 5: User Verification & Auth
- All authenticated API routes must verify session via `await hexclaveServerApp.getUser()`.
- If no user is logged in, return `NextResponse.json({ error: "Unauthorized" }, { status: 401 })`.
- Write endpoints must additionally call `rejectViewerWrite(profile)` — Campus Preview (viewer) accounts can read but not post, comment, vote, chat or match.

### Rule 6: Full-Page Routes (`page.tsx`) Over Popups for Creation Workflows
- **ALWAYS** prefer dedicated App Router full-page routes with dynamic SEO metadata and Twitter/X-style full-width minimal UI over modals for creation workflows (Campus Hub posting, community creation, listing creation).
- Modals are for fast ephemeral actions only (likes modal, quick reply, repost confirmation, mute sheet).

### Rule 7: Qdrant Cloud Vector Search & Zero-Downtime Fallback
- **CRITICAL INVARIANT**: Qdrant is strictly an asynchronous enhancement layer, protected by a 600 ms timeout and circuit breaker.
- If Qdrant is unavailable, times out, or errors, the app **MUST fall back 100% to PostgreSQL relational queries** with zero user-visible interruption.

### Rule 8: Anonymity Is Load-Bearing
- Anonymous posts carry **no `author_id`** — only a `pseudonym`. The real profile id is AES-sealed into `anon_identity_vault`, which has **no foreign key** to `user_profiles`, so no SQL join can deanonymize content.
- `stripAuthorForAnonymity` in `src/lib/feed.ts` is the boundary: an anonymous post must never carry its author relation to the client.
- **Never attach an actor to anything derived from an anonymous post.** A "your friend just posted" notification beside an anonymous post deanonymizes it by correlation. `notifyFollowersOfNewPost` enforces this internally rather than trusting call sites.
- Ranking terms keyed on `posts.authorId` (such as the follow-affinity multiplier) are naturally inert for anonymous posts — keep it that way.

### Rule 9: Mobile Bottom Navigation & Anonymity Mode Switcher
- **Mobile Bottom Navigation**: 5 core tabs — **Home (`/app`)**, **Colleges (`/app/colleges`)**, **Post (`/app/post/new`)**, **Chat (`/app/chat`)**, **Dating (`/app/dating`)**.
- **Anonymity Mode Switcher**: Desktop sidebar and mobile drawer switch between **All Posts & Anon 🎭** and **Public Only (No Anon) 🛡️**. Switching dispatches `campusloop_feed_visibility_change` on `window` and saves to `localStorage` + `/api/profile/me` for instant zero-reload filtering.

### Rule 10: Official Social Media Channels Priority
1. **Instagram (🔥 Highlighted)**: `https://www.instagram.com/campusloop.space/` (`@campusloop.space`)
2. **LinkedIn**: `https://www.linkedin.com/company/mycampusloop/?viewAsMember=true` (`CampusLoop`)
3. **X (Twitter)**: `https://x.com/company/mycampusloop/` (`@mycampusloop`)

---

## 🔔 5. Feed Ranking & Social Affinity

`src/lib/feed.ts` exposes nine sorts: `for_you`, `latest`, `trending`, `viral`, `spicy`, `memes`, `top_voted`, `most_discussed`, `random`.

**Social affinity** (`followAffinityMultiplierSql`) multiplies a post's score by who the viewer follows:

| Relationship | Multiplier |
|---|---|
| Mutual friend (`follows.is_mutual`) | **1.75×** |
| One-way follow | **1.4×** |
| Stranger | 1.0× |

- It is a **multiplier, not a flat bonus**, so it composes with any ranking scale — the gravity-decayed `trending` score and the log-scaled `viral` score differ by an order of magnitude, and a constant tuned for one would vanish or dominate in the other.
- Applied to `trending` and `viral`. `for_you` carries its own richer term (+120 friend / +80 follow, alongside campus locality, seen-post demotion and already-voted penalties).
- **`latest` is deliberately excluded** — chronological must stay chronological.
- When adding a new ranked sort, reach for `followAffinityMultiplierSql` rather than inventing another set of weights.

---

## 🔔 6. Notification & Push Subsystem

### Delivery model
Pushes are **payload-free VAPID "tickles"**. The service worker (`public/sw.js`) wakes, fetches `/api/notifications/latest` over the student's own session, and renders from that — so notification content never passes through third-party push infrastructure, and there is no hand-rolled RFC 8291 encryption to get wrong.

### Types
`LIKE`, `COMMENT`, `REPLY`, `MENTION`, `REPOST`, `MATCH`, `CRUSH_ALERT`, `MILESTONE`, `FOLLOW`, `FRIEND`, `STORY_LIKE`, `STORY_REPLY`, `MESSAGE`, `NEW_POST`. `MATCH` and `MESSAGE` push at `high` urgency.

**When you add a type**, update all four: the `NotificationType` union (`src/lib/notifications.ts`), `channelForType` (`src/lib/notification-preferences.ts`), the `buildTitle` / `defaultBody` / `buildUrl` switches (`src/app/api/notifications/latest/route.ts`), and `getNotificationMeta` (`notifications-client.tsx`). An unmapped type in `channelForType` returns `null` and is **always delivered** — deliberately fail-open, so a new type is never silently swallowed.

### Two independent silencers

| | Scope | Table | Set from |
|---|---|---|---|
| **Preference** | A whole category | `notification_preferences` (one row per student, all-on default) | Settings → Platform Preferences |
| **Mute** | One person, one channel | `notification_mutes` `(user_id, muted_user_id, channel)` | Bell on that person's profile |

`channel` ∈ `POST`, `MESSAGE`, `LIKE`, `COMMENT`, `MENTION`, `REPOST`, `FOLLOW`, `STORY`, `MATCH`, or wildcard `ALL`. **Absence of a row means notify** — a mute is an explicit opt-out, which keeps the hot path one indexed lookup and makes the default right for a student who never opens settings.

**Muting is notification-only.** The muted person keeps their feed placement *and* their follow-affinity boost, and is never told. Do not "helpfully" extend a mute into the feed — silencing an alert is not unfollowing.

### Writing notifications
- **One recipient** → `createNotification(...)`. Guards self-notification, checks preference + mute, inserts, pushes, dispatches email.
- **Many recipients** → `createNotificationsForMany(...)`. Never loop `createNotification`: the fan-out batches the mute/preference filter into two `IN` queries, writes one multi-value insert, pushes in waves of 25, and caps the audience at 500 (mutual friends ordered first).
- **Never `await`** a notification helper in a request path. Fire-and-forget with `.catch(() => {})` — a failed push must not fail the message, post or like that triggered it.
- The preference/mute lookups **fail open**: if the check errors, deliver anyway. A dropped alert is worse than an extra one.

### Message notifications
`notifyNewMessage` additionally honours the per-conversation `conversation_participants.is_muted` flag, and **collapses**: any still-unread `MESSAGE` row for the same thread is deleted before the new one is written, so a back-and-forth leaves one entry per conversation. Read rows are untouched — they are history, not backlog.

---

## 🛠️ 7. Standard Verification & Deployment Workflow

1. **Verify Types** — must pass with 0 errors before completing work:
   ```bash
   bunx tsc --noEmit
   ```

2. **Lint and Format**:
   ```bash
   bunx biome check --write ./src
   ```
   ⚠️ Biome reformats pre-existing drift across the repo. **Revert files you did not intend to touch** (`git checkout -- <file>`) so the diff stays scoped to your change.

3. **Run Unit Tests** (110 tests, 19 files):
   ```bash
   bun run test
   ```

4. **Apply schema changes** (if any):
   ```bash
   bun run db:push
   ```

5. **Deploy to Cloudflare Workers**:
   ```bash
   bun run deploy
   ```

### Build memory budget

The webpack production build compiles ~700 files. On an **8 GB machine it used to be SIGKILLed by the OS** mid-build, surfacing as an opaque `signal: 'SIGKILL'` from OpenNext rather than an out-of-memory message. Four settings hold peak RSS down:

| Setting | Where | Effect |
|---|---|---|
| `experimental.webpackMemoryOptimizations` | `next.config.ts` | Frees webpack's cached module sources between compilations |
| `experimental.webpackBuildWorker` | `next.config.ts` | Each compilation gets a short-lived worker whose heap is reclaimed on exit |
| `experimental.memoryBasedWorkersCount` | `next.config.ts` | Sizes the static-generation pool from free memory, not CPU count |
| `NODE_OPTIONS='--max-old-space-size=5120'` | `package.json` `build` script | Raises the V8 ceiling from the 2.2 GB default |

**Do not remove these to "clean up" the config.** And note: a `next dev` server left running in another project holds ~1 GB — on 8 GB, stop other dev servers before building.

`Error resolving merchant session: … couldn't be rendered statically because it used cookies` for `/merchant-portal/*` is expected output, not a failure. The build exits 0.
