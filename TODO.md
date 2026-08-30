# CampusLoop Tasks & Fixes

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


keep the righbar updated in who to follow I had followed all but it still showing me to follow btn , also I can send Secret Crush to a maximum of 5 people during a rolling 7-day period. 

 Story sharing / visibility
Stories should support Friends-first + Following visibility.
Clarify exact priority/order if needed.
 GIF & sticker sending
Add GIF/sticker support directly from the chat keyboard/composer.
Mobile keyboard experience should be considered.
 Swipe-to-reply
Swipe a message → reply/quote that message.
 Delete message
Add message deletion functionality.
Ideally support the appropriate distinction between deleting for self vs everyone if your backend permits it.
 Chat performance
“Load chats optimally.”
This is consistent with the separate chat bug report: conversation previews currently take ~5 seconds to reflect a newly sent message.
 Delete chats
Allow users to delete/remove conversations from their chat list.
 Chat notifications
Fix chat notification system.
Sidebar Messages indicator should only appear when there is actually an unread/pending message.
 @Mention profiles in chats
Support mentioning another CampusLoop user in a message.
Ideally autocomplete after typing @.
Mention should link/open that user's profile.
 YouTube / external embeds
Support sharing YouTube and other supported embeds inside chats.
Render rich previews/player cards rather than only raw URLs. you dont have to add the reel feature then fix = Yes. I extracted the messages you sent in the CampusLoop chat from all 3 screenshots. I’ve separated actual feature requests/bugs from the accidental/unclear text so you can turn this directly into a development checklist.
1. Exact messages you sent
Screenshot 1
“Story only of friends (priority) and following...”
“GIF and sticker sending from keyboard....”
“d”
“slide to reply and delete message feature....”
“story likes feg... not working” (the screenshot appears to say “story likes fegative not working”; likely a typo while typing)
“list likes”
“load chats optimally....”
“push users to delete chats...”
Screenshot 2
“💕 It's a Secret Crush Match! We both secretly liked each other.”
“It must appear in middle of the chat the secret crut message with a diff ui and better ui ux....”
“[https://campusloop.space/app/discover](https://campusloop.space/app/discover) make the search work”
“add pagination in [https://campusloop.space/app/discover?tab=colleges&scope=GLOBAL”](https://campusloop.space/app/discover?tab=colleges&scope=GLOBAL%E2%80%9D)
“Chat notification not working....”
“[https://campusloop.space/app/colleges”](https://campusloop.space/app/colleges%E2%80%9D)
“links not working....”
“Add secret crush time limit...”
Screenshot 3
“dont show already swiped people in feed on /dating until unless there are very less options , or the things are resolved like swiped then accepted or rejected....”
“mention profile on chats....”
“Reels in future....”
“Youtube/other embeds sharing....”
2. Clean CampusLoop development checklist
I've converted those messages into proper requirements.
💬 Messaging
Story sharing / visibility
Stories should support Friends-first + Following visibility.
Clarify exact priority/order if needed.
GIF & sticker sending
Add GIF/sticker support directly from the chat keyboard/composer.
Mobile keyboard experience should be considered.
Swipe-to-reply
Swipe a message → reply/quote that message.
Delete message
Add message deletion functionality.
Ideally support the appropriate distinction between deleting for self vs everyone if your backend permits it.
Chat performance
“Load chats optimally.”
This is consistent with the separate chat bug report: conversation previews currently take ~5 seconds to reflect a newly sent message.
Delete chats
Allow users to delete/remove conversations from their chat list.
Chat notifications
Fix chat notification system.
Sidebar Messages indicator should only appear when there is actually an unread/pending message.
@Mention profiles in chats
Support mentioning another CampusLoop user in a message.
Ideally autocomplete after typing @.
Mention should link/open that user's profile.
YouTube / external embeds
Support sharing YouTube and other supported embeds inside chats.
Render rich previews/player cards rather than only raw URLs.
Reels
Future feature: support sharing/embedding reels in chat.
3. ❤️ Secret Crush / Match
Secret Crush Match message
You specifically want:
“💕 It's a Secret Crush Match! We both secretly liked each other.”
And:
Display the Secret Crush Match notification/message inside the conversation
Put it in the middle of the chat, rather than making it look like an ordinary outgoing message.
Give it a distinct UI/UX so users immediately understand that something special happened.
Make it visually different from normal chat bubbles.
Include both people / mutual-crush context appropriately.
Secret Crush expiration
Add Secret Crush time limit
Secret Crush should have an expiration window.
Need backend enforcement + UI countdown/status.
Define what happens after expiration.
Previously swiped users
Your requirement was:
“dont show already swiped people in feed on /dating until unless there are very less options, or the things are resolved like swiped then accepted or rejected....”
So the Match algorithm should:
Don't normally show users already swiped.
Persist swipe state: LIKE, PASS, etc.
Don't repeatedly surface passed/liked users.
If the available candidate pool becomes extremely small, optionally allow previously seen candidates to re-enter.
If a previous interaction becomes resolved (accepted/rejected/mutual outcome), handle that state explicitly rather than treating the person as a fresh candidate.
This is especially important because Match Mode is intended to be intent-hidden in CampusLoop's product model.
4. 🔎 Discover
Search
You sent:
“[https://campusloop.space/app/discover](https://campusloop.space/app/discover) make the search work”
Fix Discover search.
Search should actually filter/search the intended entities.
Search state should persist correctly while navigating/filtering.
Handle no-results state.
Pagination
You specifically mentioned:
/app/discover?tab=colleges&scope=GLOBAL
Add pagination to Discover → Colleges.
Make sure pagination works with:
tab=colleges
scope=GLOBAL
Search
Filters
Avoid loading the entire college dataset at once.
This also connects to the existing Colleges/Discover data problems: the current Colleges page has a mismatch between the advertised “1,350+” figure and the actual directory showing 60 campus hubs.
5. 🏫 Colleges
You sent:
https://campusloop.space/app/colleges
and then:
“links not working....”
So the implied task is:
Audit the /app/colleges page.
Fix broken links.
Verify every college/campus card opens the correct destination.
Verify browser back/forward navigation.
Verify direct URLs.
Verify links from Discover → Colleges.
Check pagination + query parameters.
There's also a serious existing deep-link/router bug: directly loading /app/notifications has previously rendered the Birthdays page instead.
6. 📖 Stories
You sent:
“Story only of friends (priority) and following...”
and:
“story likes fegative not working”
and:
“list likes”
So Stories needs:
Story audience/visibility:
Friends
Following
potentially priority ordering
Fix Story Likes.
Story like/unlike should update immediately.
Persist likes correctly.
Add List Likes / View Likes.
Show who liked a story.
Make like count update without refreshing.
7. ⚡ Performance
You wrote:
“load chats optimally....”
This should probably become a broader performance task rather than only a chat task.
The existing audit found that many CampusLoop pages show skeletons for 2–5 seconds on navigation, even for pages already visited, instead of using cached data.
So:
Optimize chat initial loading.
Optimistic message sending.
Immediately update conversation preview after sending.
Cache conversation list.
Avoid unnecessary refetching.
Prefetch likely next conversations/pages.
Reduce skeleton duration.
Preserve already-loaded content while fetching updates.
8. 🚨 Important bugs from your separate bug reports that overlap these requests
There are several things in your uploaded bug reports that aren't visible in the screenshots but should absolutely be added to the same development backlog:
Critical
Uncaught ReferenceError: __name is not defined occurs across essentially every tested route.
Direct URL/deep-link routing can render the wrong page.
Dating/Match can initially show a blank black screen with an infinite spinner.
Posts
Comment counter doesn't synchronize between post card and discussion thread.
Comment/Post button can remain stuck in loading state after success.
Create Post doesn't clear/reset after successful publishing.
Composer temporarily displays fake "Student" / "U" identity instead of the actual user.
Birthdays
Month filter doesn't actually filter results.
Birthday page can render in a mobile layout on desktop.
Data quality
"Aspirant Viewer Hub" appears to be leaked test/system data.
Duplicate templated comments exist.
#CampusLife contains obvious generated filler posts.
Hub label inconsistently displays "bitmesra Hub" vs "Campus".
### 9. Recommended priority
- [x] **🔴 P0 — Fix first**:
  - [x] Global `__name` is not defined (fixed in client builds)
  - [x] Deep-link/router issues resolved with flexible slugs
  - [x] Chat notification sync and unread counter
  - [x] Chat loading & fast local caching
  - [x] Chat selected-user / name preservation
  - [x] Discover search with real-time in-page filtering
  - [x] Colleges broken links resolved with case-insensitive fuzzy slug matching
  - [x] Dating infinite/blank loading & already-swiped match exclusion
- [x] **🟠 P1 — Core UX**:
  - [x] Message preview instant update
  - [x] Delete chat & Clear history
  - [x] Delete individual message with socket broadcast
  - [x] Swipe-to-reply gesture on mobile & desktop
  - [x] GIF & stickers keyboard picker drawer
  - [x] Secret Crush 5 rolling 7-day attempts & cooldown enforcement
  - [x] Story likes & who liked modal
  - [x] Story ring dimming when seen
- [x] **🟡 P2 — Growth & Key Features**:
  - [x] Discover 16-per-page numbered pagination
  - [x] **Campus Preview Architecture**: Non-breaking account state with personal email onboarding
  - [x] **Saved Posts Vault (`/app/saved`)**: Additive database table & permanent survival across upgrade
  - [x] **Dream Campuses Selector**: Pick up to 5 target colleges with personalized feed
  - [x] **Contextual Preview Locked Modals**: Informative conversion CTAs on locked actions
  - [x] **🎓 Campus Unlocked Upgrade Flow**: Domain detection, atomic state transition & journey celebration modal
- [x] **🟢 P3 — Cleanup**:
  - [x] Exclude system viewer-hub from public college directory listings
  - [x] Fix LP calculation and display mismatch
  - [x] Documented in `docs/CAMPUS_PREVIEW_FEATURE.md`