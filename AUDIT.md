# CampusLoop Codebase Audit

**Date:** 2026-08-28
**Scope:** `src/`, `scripts/`, `public/sw.js`, config
**Baseline:** `bunx tsc --noEmit` passes clean · 56/56 tests pass · production build compiles

Findings are ordered by severity. Each one names the file, what's wrong, and what it costs.
Items marked ✅ were fixed in the follow-up commit; the rest are left as decisions for you.

---

## 1. Security

### 1.1 `POST /api/colleges` writes to the database with no authentication ✅
`src/app/api/colleges/route.ts:73`

The handler never calls `hexclaveServerApp.getUser()`. Anyone on the internet can `curl` it and
insert rows into `institutions` — the table every profile has a **non-nullable foreign key** to.

```bash
curl -X POST https://campusloop.space/api/colleges -d '{"name":"..."}'   # no session needed
```

There is no rate limit, so this is a one-liner to flood the college directory, poison
`/app/colleges`, and pollute the `colleges.xml` sitemap. `source: "user_added"` marks the rows but
nothing acts on that mark.

**Fixed:** requires a signed-in student, caps name length, and rejects duplicate slugs.

### 1.2 No rate limiting anywhere in the app
`grep -r "rateLimit" src` → nothing.

Every mutating endpoint — posts, comments, follows, swipes, chat, crushes, reports — accepts
unlimited requests per session. A single script can create thousands of posts or follow every user
on the platform in a loop. The follow endpoint is idempotent so it can't duplicate rows, but the
notification fan-out it triggers is not.

**Not fixed** — this needs a real decision (Cloudflare Rate Limiting rules at the edge, a KV/D1
token bucket, or Durable Objects). Edge rules are the cheapest option and need no code.

### 1.3 Raw SQL string building in the feed ranker
`src/lib/feed.ts:181,233`

```ts
sql.raw(seenIds.slice(0, 100).map((id) => `'${id.replace(/'/g, "''")}'`).join(","))
```

The quote-doubling is correct and the ids come from the client's own seen-posts list, so this is
*currently* safe. But it's hand-rolled escaping in a hot path — one future edit that forgets the
`.replace` is an injection. Drizzle's `inArray()` parameterises this properly.

**Not fixed** — behaviour-preserving but touches feed ranking, which deserves its own test pass.

---

## 2. Correctness bugs

### 2.1 The service worker returns errors as HTTP 200 ✅
`public/sw.js`

The offline fallback for API requests returned:

```js
new Response(JSON.stringify({ error: "Offline mode", cached: true }), { status: 200 })
```

Every caller checks `if (!res.ok) throw` — so a **200** sails through and the app tries to read
`data.items` / `data.notifications` off an error object. Depending on the caller that's either a
silently empty list or a crash, and neither tells the user they're offline.

**Fixed:** the fallback now returns `503` with `Retry-After`, so `!res.ok` catches it and existing
error paths render properly.

### 2.2 Unbounded `findMany` on conversation messages
`src/app/api/chat/[id]/messages/route.ts:43`

```ts
const chatMessages = await db.query.messages.findMany({
  where: eq(messages.conversationId, id),
  orderBy: [asc(messages.createdAt)],
  with: { sender: true },     // no limit
});
```

Every message in a conversation, each with its full sender row, on every open. Fine at 50 messages,
a multi-megabyte response and a Worker memory risk at 50,000. The same shape appears in
`posts/[id]/comments`, `posts/archived`, `communities/feed`, `birthdays`, `stories`, `highlights`,
and `dating/crush` (15 routes total).

**Not fixed** — each needs a pagination contract chosen (cursor vs. page) and its client updated.
Chat is the urgent one: it grows without bound and has no natural ceiling.

### 2.3 No error or not-found boundaries at the root
`src/app/` has `loading.tsx` but no `error.tsx`, `global-error.tsx`, or `not-found.tsx`.

Any uncaught render error in a server component shows the raw Next.js error screen, and every
`notFound()` — which `/@username`, `/@username/followers` and others call — renders the unstyled
default 404. `src/app/admin/` has its own `error.tsx`; the main app does not.

**Fixed:** added a branded `not-found.tsx` and an `error.tsx` with a retry action.

### 2.4 `react-hooks/purity` violation
`src/components/communities/community-detail-client.tsx:127`

A non-pure call (`Date.now()`/`Math.random()` class) runs during render inside the sort selector.
Under React's concurrent rendering the value can differ between the render and the commit, which
shows up as list order flickering on re-render.

**Not fixed** — needs the sort logic moved into `useMemo` with an explicit dependency, which
changes when the ordering refreshes; that's a product call.

---

## 3. Data model & performance

### 3.1 Eight tables have no indexes at all
`academic-resources`, `communities`, `gaming`, `housing`, `lost-and-found`, `marketplace`,
`rideshare`, `time-capsule`.

Every one of these is queried by `institutionId` and/or an author/creator id, and every such query
is a sequential scan today. `communities` is the worst: it's read on the communities index, every
hub page, and the composer's hub dropdown.

**Not fixed** — adding them is easy (`CREATE INDEX CONCURRENTLY`), but I'd want to confirm the real
query shapes against production `pg_stat_statements` rather than guess at composite ordering.

### 3.2 Auth + profile lookup is copy-pasted across 41 API routes
```ts
const user = await hexclaveServerApp.getUser();
if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const profile = await db.query.userProfiles.findFirst({ where: eq(userProfiles.userId, user.id) });
if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
```

Two round trips per request, repeated verbatim in 41 files. `src/lib/server-cache.ts` already has
`getCachedAuthUser`/`getCachedUserProfile` and only 11 call sites use it. A single
`requireProfile()` helper would cut the duplication and the second query.

**Not fixed** — mechanical but touches 41 files; better as its own reviewable commit.

### 3.3 `PwaManager` is dead code — and it's the component holding the app-badge logic
`src/components/pwa/pwa-manager.tsx` is imported by nothing. The layout mounts `PWAInstallBanner`
instead. The dead file contains the **Badging API** integration (`navigator.setAppBadge`) for unread
counts, so the PWA icon badge has never worked outside of push events.

**Not fixed** — the two components overlap heavily; merging them properly is a small refactor rather
than a delete.

### 3.4 Genuinely unused modules
Verified by reference search, not just import paths:

| File | Note |
|---|---|
| `src/components/pwa/pwa-manager.tsx` | see 3.3 — contains logic worth salvaging |
| `src/components/landing/ambassador-demo.tsx` | no references |
| `src/components/colleges/college-inter-battle.tsx` | no references |
| `src/components/communities/community-feed-view.tsx` | superseded by `community-detail-client` |
| `src/components/feed/top-comment-preview.tsx` | no references |

`src/hooks/index.ts` re-exports hooks nothing imports through it — every consumer imports the hook
file directly.

---

## 4. Lint debt

`bunx eslint .` → **163 problems (115 errors, 48 warnings)**

| Count | Rule | Notes |
|---:|---|---|
| 61 | `@typescript-eslint/no-unused-vars` | dead state, unused imports, unused destructured setters |
| 52 | `@typescript-eslint/no-explicit-any` | mostly API response casts that should be typed |
| 43 | `@next/next/no-img-element` | raw `<img>` — no lazy loading, no AVIF/WebP, worse LCP |
| 4 | `react-hooks/exhaustive-deps` | possible stale closures |
| 1 | `react-hooks/purity` | see 2.4 |
| 1 | `react-hooks/refs` | ref read during render |

Worst files: `hub-create-modal.tsx` (21), `api/communities/feed/route.ts` (15),
`profile-client.tsx` (7), `profile-highlights.tsx` (7).

The 43 `<img>` elements matter most for real users — `next.config.ts` already whitelists every image
host (`i.ibb.co`, `api.dicebear.com`, giphy, unsplash), so `next/image` would work today and would
cut avatar and post-image bytes substantially on mobile.

**Partly fixed:** unused-variable errors cleaned up in the files touched below. The `any` and `<img>`
counts are left — converting `<img>` to `next/image` changes layout behaviour and needs eyes on each
surface.

---

## 5. Smaller things

- **`.env.example` is missing the new keys.** VAPID and push vars aren't documented there. ✅ added.
- **`sw.js` intercepts `/api/profile/*`,** which now includes the follower/following/friends
  endpoints. It's network-first so it won't serve stale lists online, but the cache will hold
  follow lists offline indefinitely.
- **One stray `console.log`** in `src/`.
- **Drizzle migration snapshots are stale.** `drizzle-kit generate` emits ~250 lines of drift for
  tables that already exist, because the project has been using `db:push` and one-off scripts.
  Anyone running `drizzle-kit migrate` against a fresh database will get a broken schema. The
  migration story needs a reset (squash to a baseline snapshot matching production).
- **`user_profiles.institutionId` is `onDelete: "restrict"`,** so an institution row can never be
  deleted once anyone joins it — including the spam rows from 1.1. Worth a soft-delete flag.

---

## Fixed in the follow-up commit

1. `POST /api/colleges` now requires authentication, caps input length, and rejects duplicates
2. Service worker offline fallback returns `503` instead of a fake `200`
3. Root `error.tsx` and `not-found.tsx`, both branded
4. Unused-variable lint errors removed from the files listed in §4
5. `.env.example` documents the VAPID/push configuration
6. Stray `console.log` removed

## Recommended next, in order

1. **Rate limiting** (§1.2) — cheapest as Cloudflare edge rules, no code
2. **Paginate chat messages** (§2.2) — the only unbounded query with no ceiling
3. **Indexes on the eight bare tables** (§3.1) — pure win, needs query-shape confirmation
4. **`requireProfile()` helper** (§3.2) — removes 41 copies and a query per request
5. **`next/image` migration** (§4) — biggest user-visible performance gain
6. **Reset the Drizzle migration baseline** (§5) — before onboarding another developer
