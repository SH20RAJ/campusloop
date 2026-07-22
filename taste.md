# Taste Log

A running log of significant changes and design decisions.

---

### 2026-07-22

**80467c0** — Add How It Works section before Verification on landing page  
- 4-step guide: Sign up → Verify → Join → Post  
- Cards with step numbers and icons  

**c15ce8d** — Add FAQ section after Testimonials on landing page  
- 6 accordion questions using native `details/summary`  
- Chevron rotation animation on open  

**dcce792** — Add Testimonials section before Final CTA on landing page  
- 6 student quotes with gradient avatar initials and college names  

**f4b7be3** — Add Safety & Privacy section after Integrations on landing page  
- 4 trust items: PII Scrubbing, Anonymity, Report/Block, Gated Access  
- Live status badges with ping dot  

**acdda5e** — Add Integrations & Features section after Stats on landing page  
- 6 feature cards: Rich Text, Chat, Stories, Live Polls, Communities, Anonymous Posting  

**3fe883b** — Add Stats & Numbers section after Artifacts on landing page  
- Animated counters using `NumberTicker`  
- 1,350+ colleges, 10K+ posts, 5K+ matches, 2.5K+ DAU  

**975ac45** — Add interactive artifacts showcase with animated icons and demo overlays  
- 8 artifact cards with click-to-open modal demos  
- Unique hover animations per icon (bounce, spin, shake, pulse, wobble)  
- AnimatePresence overlay transitions with Escape key and scroll lock  

---

**<next_commit>** — Redesign discover page with animated tabs, college search, premium campus cards  
- Animated tab indicator with spring layout animation  
- College search input with AnimatePresence expand/collapse  
- Featured campus cards with gradient backgrounds and per-campus colors  
- Differentiated empty states per tab (confessions vs questions vs trending)  
- Feed cards with stagger scroll-in animation  
- Updated loading skeleton to match new layout  

---

### Format

Each entry: `commit_hash` — Brief description of what was done
