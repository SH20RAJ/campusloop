# 🪐 Reddit Campus Content Ingestion Pipeline

CampusLoop integrates a periodic, low-storage Reddit ingestion pipeline that discovers and curates high-quality college memes, campus discussions, student videos, GIFs, and galleries from student-centric Indian and international subreddits, surfacing them natively in the timeline and Reels feed.

---

## 🏛️ Ingestion Architecture

```
Reddit (Official OAuth API)
           │
           ▼
[RedditClient] (token caching, User-Agent, backoff)
           │
           ▼
[Classifier] (TEXT | IMAGE | VIDEO | GIF | GALLERY | LINK)
           │
           ▼
[Relevance Scorer] (Indian student keywords, recency, upvote velocity)
           │
           ▼
[CampusLoop Moderation] (runSafetyCheck, PII, NSFW/spoiler reject)
           │
           ▼
[Deduplication Layer] (UNIQUE(source, external_id) in PostgreSQL)
           │
           ▼
[PostgreSQL Database] (posts + external_posts + external_media)
           │
           ▼
[/api/feed & Reels] (Batch-hydrated O(1) query)
           │
           ▼
[CampusLoop Native UI]
(RedditAttribution badge · HTML5 RedditVideo with fallback · RedditGallery)
```

---

## 🔑 Environment Variables

To authenticate with the official Reddit OAuth API, register an application at [Reddit Prefs: Apps](https://www.reddit.com/prefs/apps) (select "script" type).

Add the following keys to `.env`:

```env
# Official Reddit OAuth API Credentials
REDDIT_CLIENT_ID="your_client_id_here"
REDDIT_CLIENT_SECRET="your_client_secret_here"
REDDIT_REFRESH_TOKEN="" # Optional: for user-scoped tokens
REDDIT_USER_AGENT="CampusLoop:v1.0.0 (by /u/campusloop_official)"
```

> [!NOTE]
> In local development or staging without Reddit credentials configured, `RedditClient` automatically uses Reddit's public endpoint with an explicit User-Agent as a developer fallback. In production, configure `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET` for high rate-limit allowances.

---

## 🏷️ Configured Subreddits

Subreddits are configured in `src/lib/reddit/sources.ts` with explicit priorities and category tags:

### High Priority (Targeted Indian College & Tech Communities)
1. **r/Btechtards** (Priority: 100) — B.Tech college life, engineering memes, placements.
2. **r/JEENEETards** (Priority: 95) — Aspirants, exam stress, college entrance humor.
3. **r/CollegeRant** (Priority: 85) — Authentic student vents, professors, hostel life.
4. **r/college** (Priority: 80) — General university discussions and student queries.
5. **r/IndianTeenagers** (Priority: 80) — Indian youth culture, hostel stories, relationships.
6. **r/IndiaMeme** (Priority: 75) — Desi pop culture and campus memes.
7. **r/DesiMemes** (Priority: 75) — Relatable Indian humor and student reels.
8. **r/ProgrammerHumor** (Priority: 70) — CS students, coding assignments, tech bugs.

### Secondary
9. **r/EngineeringMemes** (Priority: 65)
10. **r/University** (Priority: 60)
11. **r/IndianAcademia** (Priority: 60)
12. **r/CollegeSocialLife** (Priority: 55)
13. **r/teenagers** (Priority: 50)
14. **r/memes** (Priority: 50)
15. **r/dankmemes** (Priority: 50)
16. **r/IndiaSocial** (Priority: 50)

---

## 🗄️ Database Design & Low-Storage Invariant

### Critical Storage Invariant
**NO REDDIT MEDIA IS DOWNLOADED OR RE-HOSTED.**
CampusLoop never stores binary video/image blobs on Cloudflare R2 or disk. Only metadata, canonical permalinks, and direct Reddit media URLs are stored in Neon PostgreSQL.

### Schema Tables (`src/db/schema/external-content.ts`):
1. **`external_posts`**:
   - `id`: UUID primary key.
   - `postId`: Foreign key to `posts.id` (cascade delete).
   - `source`: `"reddit"`.
   - `externalId`: Reddit post ID (e.g. `1abcde`).
   - `subreddit`: Subreddit name (e.g. `Btechtards`).
   - `externalAuthor`: Reddit author username.
   - `permalink`: Original relative permalink.
   - `canonicalUrl`: Complete Reddit URL (`https://www.reddit.com/r/...`).
   - `score`: Upvote count.
   - `commentCount`: Comment count.
   - `relevanceScore`: Campus relevance score (0 - 200).
   - `contentType`: `TEXT` | `IMAGE` | `VIDEO` | `GIF` | `GALLERY` | `LINK` | `OTHER`.
   - `UNIQUE(source, externalId)`: Database-level invariant preventing duplicate imports.

2. **`external_media`**:
   - `id`: UUID primary key.
   - `externalPostId`: Foreign key to `external_posts.id` (cascade delete).
   - `mediaType`: `IMAGE` | `VIDEO` | `GIF` | `LINK`.
   - `mediaUrl`: Direct external URL (`v.redd.it` / `i.redd.it`).
   - `previewUrl`, `thumbnailUrl`, `hlsUrl`, `dashUrl`.
   - `width`, `height`, `duration`, `isGif`, `position`.

---

## 🛡️ Moderation & Safety

Imported content **never bypasses CampusLoop moderation**:
1. **NSFW Rejection**: Any post marked `over_18: true` on Reddit is immediately rejected.
2. **Central Safety Filter**: Posts are scanned with `runSafetyCheck({ title, body })` for PII (phone numbers, emails, room addresses), doxxing, harassment, and hate speech.
3. **Status Routing**: Posts flagged with risk score ≥ 45 are placed into `PENDING_REVIEW` escrow, hidden from the public feed until reviewed by an administrator.

---

## 🎬 Video & Reel Player UX

For Reddit-hosted video posts (`v.redd.it`):
- Rendered via a native HTML5 `<video>` element (`controls`, `playsInline`, `preload="metadata"`).
- **Zero Sound Autoplay**: Does not autoplay audio unexpectedly.
- **Viewport Observer**: Pauses automatically when scrolled out of view.
- **Aspect Ratio Preservation**: Vertical videos adapt naturally without artificial black bars.
- **Graceful Error Fallback**: If the external video URL encounters CORS, expiration, or format failure, the player seamlessly falls back to the poster thumbnail with a "Watch on Reddit ↗" direct button, preventing any feed crashes.

---

## 🚀 Admin Ingestion API

### 1. View Ingestion Status & Configured Sources
```http
GET /api/admin/reddit/ingest
```
**Response**:
```json
{
  "configured": true,
  "sources": [ ... ],
  "totalSources": 16,
  "activeSources": 16
}
```

### 2. Trigger Ingestion Job
```http
POST /api/admin/reddit/ingest
Content-Type: application/json

{
  "subreddit": "Btechtards",
  "limit": 25,
  "sort": "hot",
  "dryRun": false
}
```
**Parameters**:
- `subreddit` *(optional)*: Single subreddit name. Omit to ingest all configured active subreddits.
- `limit` *(optional)*: Number of posts to fetch (1 - 50, default 25).
- `sort` *(optional)*: `"hot"` | `"new"` | `"top_day"` | `"top_week"`.
- `dryRun` *(optional)*: When `true`, parses, classifies, and tests without writing to PostgreSQL.

---

## ➕ How to Add a New Subreddit

To add a new subreddit to the pipeline, simply add an entry to `REDDIT_SOURCES` in `src/lib/reddit/sources.ts`:

```typescript
{
  subreddit: "BITMesra",
  priority: 90,
  enabled: true,
  categories: ["college", "bit_mesra", "campus", "meme"],
  defaultSort: "hot",
}
```
No other code changes or migrations are needed!
