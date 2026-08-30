# 🚀 CampusLoop Feature Matrix & Capabilities

A comprehensive breakdown of all implemented and supported features across CampusLoop.

---

## 1. 🎓 Campus Identity & Verification
- **Institutional Email Gate**: Strict OTP verification restricted to `.ac.in` and `.edu` domains.
- **Campus Radius & Global Scope**: Instant toggle between your local college feed and all 1,350+ indexed Indian colleges.
- **Verified Student Profiles**: Major, branch, graduation year, social handles, and clout badges.
- **Vanity URL Routing**: Public and authenticated access via `/@username`.
- **Campus Preview (Viewer Mode)**: Aspirants sign up with a personal email and get full read access — feeds, confessions, polls, campus hubs — plus a saved-posts vault and up to 5 dream campuses feeding their timeline. Posting, voting, chat and matching stay locked behind a verified college email. Viewer is an account *state*, not a separate account type, so verifying later upgrades the same profile in place: the college address becomes the primary sign-in channel, the personal one is kept for recovery, and saved posts, follows and points carry over untouched. See `docs/CAMPUS_PREVIEW_FEATURE.md`.

---

## 2. 💬 Campus Social Feed & Discussions
- **Feed Algorithms**: 5 distinct sorting modes (*For You, Latest, Trending, Top Voted, Discussed*).
- **Post Types**:
  - 💭 **Thoughts & Updates**: Multi-image attachments, hashtags, and mentions.
  - 🕵️ **Anonymous Confessions**: Cryptographically pseudonymized handles (`anon_xxxxx`).
  - 📊 **Interactive Polls**: Real-time percentage visualization, voter count, and expiration timers.
  - ❓ **Questions & Advice**: Academic queries and campus recommendations.
- **Twitter-Style 1-Tap & Quoted Reposts**: Quote embedding with crystalline Web Audio celebration chime.
- **Threaded Discussions**: Nested comments, author badges, and upvoting.

---

## 3. 💖 Campus Match & Dating (`/app/dating`)
- **Framer Motion Draggable Deck**: Physics-based gestures with velocity-based release detection (`velocity.x > 400 || offset.x > 80`).
- **High-Res Unsplash Student Portraits**: Verified college portrait photo sets replacing cartoon Dicebear avatars.
- **Circular PFP Indicator**: Circular avatar rendered directly before candidate names on full-screen cards.
- **Zero-Lag Image Preloading**: Background image preloader warming up the next 5 candidates in browser memory.
- **Filtering**: Gender preference and geographic radius (Campus vs. Global).
- **Compatibility Scoring**: Algorithmic match percentages based on shared interests and campus proximity.
- **Secret Crush & Mutual Match**: End-to-end encrypted crush declarations revealed only upon mutual addition.

---

## 4. 📸 24-Hour Stories (Vibes) (`/app/stories/new`)
- **Fullscreen Story Viewer**: Progressive timer bars, tap-to-skip, and pause-on-reply typing.
- **Story Creator**: Custom background gradients, typography options, and Gen-Z sticker badges.
- **Story Reactions & Hearts**: Interactive animated reactions.
- **Story Archive & Profile Highlights**: Expired story vault and curated profile highlight circles.

---

## 5. 🏫 Dedicated Campus Utility Portals (`/app/communities`)
- **🔎 Lost & Found (`/app/lost-and-found`)**: Dedicated lost-item registry with instant chat claiming.
- **🛒 Student Marketplace (`/app/marketplace`)**: Buy, sell, and trade hostel gear (cycles, coolers, books).
- **🎮 Gaming Arena (`/app/gaming`)**: Squad recruitment and tournament scrims (Valorant, BGMI, FIFA).
- **🚗 Ride Sharing (`/app/rideshare`)**: Cab and auto pooling for weekend train/airport trips.
- **🏠 Housing & Flats (`/app/housing`)**: Roommate finder and off-campus flat listings.
- **📚 Academics & Notes (`/app/academics`)**: Exam-night handwritten notes, formula cheat sheets, and solved PYQs.
- **Reddit-Style Sub-Hubs**: Interest communities (`c/coding`, `c/music-band`, `c/anime`) with full sorting.

---

## 6. ⏳ Campus Time Capsule & Batch Legacy Vault (`/app/capsule`)
- **Batch Letters & Predictions**: Cryptographically locked until convocation day.
- **Live Countdown Ticker**: Real-time ticker counting down days, hours, and minutes to graduation.
- **Unlocked Museum Wall**: Public batch archive rendered after timer expiry.

---

## 7. ⚡ Gamification & Loop Points (LP)
- **Point Rewards**:
  - Referral: **+20 LP**
  - Post: **+5 LP**
  - Comment: **+2 LP**
  - Upvote/Poll Vote: **+1 LP**
- **Clout Tiers**:
  - Bronze Rookie (0–49 LP)
  - Silver Achiever (50–149 LP)
  - Gold Star (150–299 LP) — Automatically unlocks the **Verified Blue Badge ⚡**
  - Platinum Legend (300+ LP)

---

## 8. 🛡️ Trust, Safety & Legal Architecture
- **Monochrome Policy Suite**: Document-first layout in `/safety`, `/privacy`, `/terms`, and `/contact`.
- **Automated Safety Filters**: Keyword screening for doxxing, phone numbers, and harassment.
- **3-Strike Moderation Escrow**: Content receiving 3 reports is automatically quarantined pending admin review.
- **Statutory Compliance**: UGC Anti-Ragging Regulations 2009, IT Rules 2021, and DPDP Act 2023.

---

## 9. 🔊 Sensory Audio & Physical Haptics
- **Web Audio Synthesizer**: Offline synthesized sounds (`ting`, `pop`, `tap`, `archive`) with zero latency.
- **Physical Haptics**: Native vibration engine providing tactile feedback for interactions.