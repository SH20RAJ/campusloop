# CampusLoop

Verified Student-Only Campus Social Network

Startup Strategy, Product Plan, MVP Scope, Safety Architecture, and Build Prompt

Prepared for: Shaswat Raj  
Date: 4 June 2026  
Version: 1.0

## Positioning line

Join your real campus. Speak freely. Stay safe. Meet students like you.

## Core principle

Anonymous to other students; accountable to the platform safety system.

---

## 0. Document map

This document is written as a founder-ready blueprint for CampusLoop. It combines product strategy, MVP planning, safety design, monetization, launch strategy, and technical execution.

| Section | Topic |
|---|---|
| 1 | Executive summary |
| 2 | Problem and opportunity |
| 3 | Vision, mission, and positioning |
| 4 | Target users and beachhead market |
| 5 | Market and competitor snapshot |
| 6 | Product architecture and feature map |
| 7 | Core user flows |
| 8 | Trust, safety, privacy, and compliance |
| 9 | Moderation system design |
| 10 | Monetization strategy |
| 11 | Go-to-market strategy |
| 12 | MVP specification |
| 13 | Technical architecture |
| 14 | Database schema |
| 15 | Metrics and analytics |
| 16 | Roadmap |
| 17 | Risks and mitigations |
| 18 | AI build prompt |
| 19 | References |

---

## 1. Executive summary

CampusLoop is a verified student-only social network where university and college students join using their institution email, get placed into their campus community, and interact through posts, stories, polls, confessions, anonymous discussions, chat, and opt-in student discovery.

The strongest version of this startup is not a reckless anonymous gossip app. It is a trusted campus social layer: verified identity at signup, controlled anonymity in public, strong moderation in the background, and high-context student discovery across campuses.

### One-line pitch

CampusLoop is the verified social layer for college life: campus feed, confessions, polls, stories, chat, and student discovery — built for safety from day one.

### The product in one view

| Layer | Purpose | Example features |
|---|---|---|
| Campus mode | Private community for one verified college or university. | Campus feed, anonymous posts, confessions, polls, stories, events, clubs, lost and found. |
| Global mode | Cross-campus discovery for students with shared interests. | India feed, global feed, course communities, exam communities, city groups, startup/coding/design/music groups. |
| Match mode | Opt-in student discovery with swipe interactions. | Friends, study buddy, date, event buddy, roommate, project teammate, cofounder search. |
| Safety layer | Protect students while preserving authentic expression. | Report, block, mute, AI pre-check, human moderation, rate limits, hidden author accountability. |

### Why now

- Student communities are fragmented: Instagram, WhatsApp, Telegram, Discord, Snapchat, and college groups do not create a single trusted campus identity layer.
- Anonymous expression has demand: Students want a lower-pressure way to ask questions, confess, vent, joke, and discuss campus life.
- Safety is the unlock: The app that wins will not be the most anonymous; it will be the most trusted place for real students to speak freely.
- India is under-served: Most campus social products have focused on US campuses. India has a massive college population and fragmented college communication habits.

---

## 2. Problem and opportunity

### Student pain points

| Pain point | What students do today | CampusLoop opportunity |
|---|---|---|
| No single campus feed | Students depend on WhatsApp groups, Instagram pages, random Telegram groups, and word of mouth. | Give every verified college a living campus feed with structured post types. |
| Hard to ask sensitive questions | Students hesitate to ask about relationships, mental health, classes, professors, hostel issues, placements, or campus politics under their real name. | Offer anonymous posting with strong safety rules and hidden accountability. |
| College discovery is weak | New students struggle to find seniors, clubs, events, PGs, mess services, internships, and study partners. | Use verified campus identity and interest tags to improve discovery. |
| Global student interaction is noisy | Existing social networks are not student-contextual; unknown people and spam reduce trust. | Create verified-student-only global communities by course, city, exam, skill, and interest. |
| Dating and friendship are disconnected from campus context | Dating apps are broad, often unsafe, and not optimized for student intent. | Add opt-in match mode with filters, safety controls, and student-only verification. |

### Founder opportunity

The initial wedge can be anonymous confessions and polls because they create fast engagement and shareability. The long-term business is broader: student identity, campus media, events, marketplace, local commerce, hiring, and student discovery.

### Product thesis

Start with campus confessions and polls. Expand into the operating system for student life.

---

## 3. Vision, mission, and positioning

| Item | Description |
|---|---|
| Vision | Every student should have a safe, verified, fun, and useful digital campus where they can speak, discover, and belong. |
| Mission | Build the trusted student-only social layer for universities and colleges, starting in India and expanding globally. |
| Positioning | Verified campus social network with controlled anonymity and student discovery. |
| Tagline | Join your real campus. Speak freely. Stay safe. Meet students like you. |
| Not this | A reckless gossip app, a clone of Instagram, or a generic dating app. |
| This instead | A student-only campus network combining Reddit-style discussions, Instagram-like stories, Discord-like communities, and opt-in swipe-based discovery. |

### Brand personality

- Youthful but not childish.
- Fun but not unsafe.
- Anonymous but not lawless.
- Campus-first but expandable to national and global student networks.
- Clean, premium, mobile-first, fast, and addictive.

---

## 4. Target users and beachhead market

### Primary user segments

| Segment | Needs | Hooks |
|---|---|---|
| Freshers / first-year students | Find seniors, friends, college tips, hostel help, events, notes, clubs. | Freshers feed, ask seniors, anonymous questions, campus map, club directory. |
| Hostel and PG students | Food, mess, room issues, roommates, local services, campus updates. | Hostel threads, lost and found, PG marketplace, roommate matching. |
| Final-year students | Placements, internships, projects, referrals, alumni advice. | Placement board, verified alumni AMAs, internship posts. |
| Creators and campus meme pages | Distribution and recognition inside campus. | Campus creator profiles, story reposts, meme contests. |
| Campus ambassadors | Influence, community ownership, resume value, earnings. | Ambassador dashboard, growth rewards, moderation privileges. |

### Recommended beachhead

Launch in one city or one university cluster instead of launching all India at once. Ranchi/Jharkhand is a realistic starting point because it has many colleges, student migration, and existing student pain around hostels, PGs, mess services, events, and peer discovery.

| Pilot market option | Why it works | Launch motion |
|---|---|---|
| Ranchi college cluster | Multiple colleges, concentrated student density, strong local word of mouth. | Campus ambassadors, WhatsApp seeding, confession campaigns, college meme pages. |
| Single flagship college | Easier moderation, easier liquidity, stronger campus identity. | Reach 500 verified users before expanding. |
| Exam/community wedge | Students across colleges share common anxieties and goals. | JEE/NEET/CAT/GATE/UPSC student groups connected to campus profiles. |

---

## 5. Market and competitor snapshot

The category is validated by campus-first anonymous and semi-anonymous social apps in the US. CampusLoop should learn from these products but compete with a stronger India-first verification, moderation, and utility layer.

| Competitor / reference | Observed model | Lesson for CampusLoop |
|---|---|---|
| Fizz | Campus communities, student conversations, anonymity, and marketplace expansion. Fizz publicly markets joining 700+ schools. | Demand exists for student-only campus feeds. Marketplace and local commerce can become a revenue layer. |
| Sidechat | University-email-based school communities where users can post anonymously. | University email verification is a proven entry mechanic, but moderation must be stronger. |
| Instagram / Snapchat | High usage, social graph, stories, DMs. | CampusLoop should not copy the whole network; it should own college-specific context and anonymous expression. |
| WhatsApp / Telegram groups | Default communication layer for Indian colleges. | These are useful but fragmented, unstructured, hard to search, and hard to moderate. |
| Dating apps | Broad dating discovery outside campus context. | CampusLoop can win with opt-in student-only intent filters and safer discovery. |

### Strategic insight

The opportunity is not to be the Indian copy of Fizz or Sidechat. The opportunity is to build the India-first verified student graph and then layer feeds, confessions, polls, events, marketplace, hiring, and matching on top.

### Competitive wedge

Trust + utility + campus liquidity. Confessions bring students in; verified campus tools keep them.

---

## 6. Product architecture and feature map

### Navigation structure

| Tab | Purpose | MVP scope |
|---|---|---|
| Home | Main campus feed. | Posts, anonymous posts, polls, confessions, comments, votes, report/block. |
| Confess | Viral anonymous expression surface. | Confession composer, trending confessions, campus-only visibility, strict moderation. |
| Global | Cross-campus student discovery. | India/global feed, interest filters, course communities. |
| Chat | Private conversations. | Start with mutual/accepted DMs only. |
| Match | Swipe-based student discovery. | Post-MVP or controlled beta after safety systems are strong. |
| Profile | User identity and controls. | Profile, interests, privacy settings, blocked users, account controls. |

### Post types

| Type | Description | Notes |
|---|---|---|
| Normal post | Real-profile campus post. | Good for events, questions, recommendations, announcements. |
| Anonymous post | Hidden public author identity. | Author ID still stored privately for safety. |
| Confession | Anonymous emotional/social/campus confession. | Strong moderation required. |
| Poll | Fast, low-friction engagement. | Best early engagement tool. |
| Meme | Campus humor and shareability. | Needs anti-harassment rules. |
| Question | Academic, hostel, placement, social, or local help. | Useful for retention. |
| Event | Club event, fest, workshop, meetup. | Future monetization via ticketing. |
| Lost and found | Campus utility. | Strong trust builder. |
| Marketplace | Books, notes, cycles, hostel items. | Post-MVP revenue and utility layer. |

### Differentiating features

- Campus switcher: My campus, my city, my university network, India, global.
- Trust score: Internal safety score based on reports, rate limits, verified status, and moderation outcomes.
- Anonymous identity vault: Public anonymity with private accountability for abuse prevention.
- Campus ambassadors: Growth and moderation layer for each college.
- Consent-based DMs: No random spam; users control who can message them.
- Safety-first match mode: Opt-in, 18+, reportable, blockable, with intent filters.

---

## 7. Core user flows

### Signup and verification flow

1. Student enters university or college email.
2. System sends OTP or magic link.
3. System extracts email domain and matches it to the institution database.
4. If domain matches, student is assigned to that campus and asked to complete profile.
5. If domain is unknown, the student can request a new institution or use fallback verification.
6. After onboarding, the user lands inside the campus feed with default safety settings enabled.

### Anonymous posting flow

1. Student chooses post type: anonymous post or confession.
2. Composer shows clear content rules before publishing.
3. Rule engine checks for phone numbers, emails, addresses, slurs, threats, explicit targeting, and named allegations.
4. Low-risk posts publish immediately; medium-risk posts require edit; high-risk posts go to review or are blocked.
5. Other students see only anonymous avatar and campus context.
6. Safety/admin system privately retains author ID for abuse response.

### Match mode flow

1. User explicitly opts into Match Mode and confirms age eligibility.
2. User selects intent: friends, study buddy, date, event buddy, roommate, project teammate, cofounder.
3. User sets filters: campus, city, gender preference where appropriate, course, year, interests, distance, intent.
4. Users swipe left/right.
5. Chat unlocks only after mutual match or explicit acceptance.
6. Every profile, chat, and match has report/block controls.

---

## 8. Trust, safety, privacy, and compliance

Trust is the product. A campus anonymous app can become harmful quickly if anonymity is treated as total invisibility. CampusLoop should separate public anonymity from private accountability.

### Privacy principles

- Data minimization: Collect only what is needed for verification, safety, campus matching, and core product features.
- Purpose limitation: Do not use student verification data for unrelated advertising or profiling.
- User control: Let users delete posts, deactivate accounts, export core data, and control DM/match visibility.
- No public identity leaks: Never reveal anonymous authors publicly, even after moderation action.
- Auditability: Keep internal logs for moderation actions, admin access, and safety escalations.

### India compliance note

India treats a child under the Digital Personal Data Protection Act, 2023 as someone who has not completed eighteen years of age. Processing a child’s personal data can require additional safeguards. CampusLoop should treat match mode as 18+ only and should get qualified legal review before onboarding minors into sensitive features.

---

## 9. Moderation system design

The moderation system should combine product rules, technical prevention, AI-assisted review, community reporting, and human escalation. Do not rely only on AI moderation.

### Moderation layers

| Layer | What it does |
|---|---|
| Pre-publish checks | Detect slurs, threats, phone numbers, addresses, emails, ID numbers, explicit doxxing, spam, and harmful named allegations. |
| Risk scoring | Assign risk score to each post/comment/message based on content, account age, report history, and campus risk. |
| Community reporting | Let students report posts, comments, profiles, messages, and match behavior. |
| Auto-hide rules | Hide content temporarily after severe reports or multiple independent reports. |
| Human review | Review high-risk content, appeals, repeated abuse, emergencies, and sensitive cases. |
| Account enforcement | Warnings, posting cooldowns, content removal, temporary bans, permanent bans. |
| Admin audit logs | Log every moderation action and every access to anonymous author identity. |

### Content rules for anonymous posts

- No phone numbers, addresses, personal emails, ID photos, or private screenshots without consent.
- No targeted harassment, caste/religion hate, sexual harassment, threats, or bullying.
- No harmful anonymous allegations naming private students or staff.
- No explicit sexual content involving identifiable real people.
- No encouragement of self-harm, violence, or dangerous challenges.
- No impersonation of college authorities, emergency services, professors, or student bodies.

### Emergency mode

Because students may use campus social apps during emergencies, CampusLoop should have an emergency mode that prioritizes official information, slows viral spread, and reduces misinformation risk.

Emergency mode features:

- Pin verified resources.
- Add friction to reposting unverified claims.
- Temporarily limit anonymous posts in affected campus feeds.
- Increase moderation sensitivity.
- Show crisis/support resources where appropriate.

---

## 10. Monetization strategy

The product should be free until it has real campus liquidity. Monetization should not damage trust, safety, or student affordability.

| Revenue stream | Description | When to launch |
|---|---|---|
| Premium student plan | Profile boosts, advanced filters, who-liked-you in match mode, custom anonymous avatars, extra story visibility. | After strong retention. |
| Campus ads | Local cafes, PGs, hostels, mess/tiffin services, coaching centers, events, student brands. | After verified campus density. |
| Event ticketing | Fests, workshops, parties, hackathons, meetups. | After clubs/events usage. |
| Marketplace | Books, notes, cycles, calculators, laptops, hostel items. | After trust and moderation systems mature. |
| Recruitment | Internships, campus ambassador jobs, fresher hiring, student creator campaigns. | After verified profiles and enough scale. |

### Monetization guardrails

- Never expose anonymous identities for payment.
- Never sell student personal data.
- Do not target sensitive categories to minors.
- Keep ads clearly labeled.
- Make premium useful but not socially exploitative.

---

## 11. Go-to-market strategy

### Launch philosophy

CampusLoop needs density more than downloads. A campus with 1,000 active students is better than 50,000 scattered installs. The launch goal is to make one campus feel alive.

### Campus ambassador program

| Area | Details |
|---|---|
| Role | Recruit users, seed quality posts, report harmful content, organize prompts, bring clubs/events. |
| Incentives | Certificates, leaderboard, merch, internships, revenue share for events/ads, premium access. |
| Controls | Ambassadors should not see anonymous author identities unless formally part of trained moderation with strict audit logs. |

### Viral growth loops

| Loop | How it works |
|---|---|
| Confession loop | Funny/safe confessions get screenshotted and shared, bringing students back to verify and join. |
| Poll loop | Campus polls create instant FOMO and group participation. |
| Story loop | Event and fest stories make the app feel alive during campus moments. |
| Ambassador loop | Student leaders bring their own networks and clubs. |
| Match loop | Opt-in discovery creates recurring curiosity after the core feed is trusted. |

---

## 12. MVP specification

The MVP should prove three things: verified campus onboarding works, anonymous posts can drive engagement, and moderation can keep the feed safe enough.

### MVP must-have features

| Feature | Description |
|---|---|
| Landing page | Clear value proposition, waitlist, campus ambassador CTA. |
| Email verification | OTP/magic-link signup with institution domain detection. |
| Institution database | College/university records with domains, city, state, country. |
| Onboarding | Username, course, branch, year, interests, campus confirmation. |
| Campus feed | Posts, anonymous posts, polls, confessions. |
| Post composer | Type selector, anonymous toggle, scope selector, media support optional. |
| Comments | Comment threads with anonymous option. |
| Voting/reactions | Upvote, downvote, emoji reactions, poll votes. |
| Reporting | Report posts/comments/profiles with reason categories. |
| Blocking/muting | User safety controls. |
| Moderation dashboard | Review reports, hide/delete content, warn/ban users, view audit logs. |
| Basic notifications | New comments, poll results, report outcomes, campus trends. |

### MVP should not include initially

- Full dating product before safety foundations are proven.
- Complex marketplace payments.
- Institution admin accounts unless there is a legal and trust strategy.
- Sensitive profile fields such as caste, religion, exact location, or government IDs.
- Public exposure of anonymous author identity under any normal user path.

### MVP user stories

| User story |
|---|
| As a student, I can verify using my college email and join my campus feed. |
| As a student, I can post anonymously while knowing harmful content is not allowed. |
| As a student, I can create a poll and see votes from my campus. |
| As a student, I can report unsafe or abusive content. |
| As a moderator, I can review reported posts and take action. |
| As a campus ambassador, I can invite students and help seed safe engagement. |

---

## 13. Technical architecture

### Recommended stack

| Layer | Recommendation |
|---|---|
| Frontend | Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion. |
| Backend | Next.js API routes/server actions or Hono. |
| Database | PostgreSQL with Prisma or Drizzle. |
| Cache/realtime | Redis for feed cache, rate limits, sessions; WebSockets/PartyKit/Liveblocks later. |
| Auth | Magic link/OTP email auth; optional Google/Microsoft login for institution accounts. |
| Media | Cloudflare R2, S3, UploadThing, or equivalent. |
| Push notifications | Firebase Cloud Messaging and Web Push. |
| Moderation | Rule engine + AI moderation + human review dashboard. |
| Deployment | Vercel, Railway, Fly.io, Cloudflare, or a hybrid setup. |

### High-level architecture

| Component | Responsibility |
|---|---|
| Auth service | Email OTP, verification, session handling. |
| Institution service | Domain matching, institution requests, verification fallback. |
| Feed service | Campus feed, global feed, ranking, pagination. |
| Content service | Posts, comments, polls, media, stories. |
| Safety service | Rules, risk scores, reports, moderation actions, audit logs. |
| Notification service | Push/email/in-app notifications. |
| Match service | Opt-in profiles, swipes, matches, chat unlocks. |
| Admin service | Moderation dashboard, institution management, analytics. |

### API route examples

| Route | Purpose |
|---|---|
| POST /api/auth/request-otp | Send login OTP/magic link. |
| POST /api/auth/verify | Verify OTP and create session. |
| GET /api/institutions/by-domain | Match email domain to institution. |
| POST /api/onboarding | Save student profile. |
| GET /api/feed/campus | Fetch campus feed. |
| GET /api/feed/global | Fetch global feed. |
| POST /api/posts | Create post with moderation pre-check. |
| POST /api/posts/:id/report | Report post. |
| POST /api/moderation/action | Admin moderation action. |
| POST /api/match/swipe | Swipe in match mode. |

---

## 14. Database schema

The database should preserve a clear separation between public identity, student profile, anonymous display, and private safety accountability.

| Model | Key fields | Notes |
|---|---|---|
| User | id, email, emailVerifiedAt, role, status, createdAt | Authentication identity. Keep separate from public profile. |
| Institution | id, name, type, city, state, country, website, status | College/university master table. |
| InstitutionDomain | id, institutionId, domain, verified | Used for auto-detection from email. |
| StudentProfile | userId, institutionId, username, displayName, course, branch, year, interests, ageBand | Public/non-sensitive profile. Avoid exact birthdate where possible. |
| Post | id, authorId, institutionId, type, scope, isAnonymous, title, body, media, status, riskScore | Author ID is always stored privately, even for anonymous posts. |
| Comment | id, postId, authorId, body, isAnonymous, status | Same hidden-accountability model. |
| Vote | id, userId, postId, value | Upvote/downvote or reactions. |
| Poll/PollOption/PollVote | pollId, options, votes | Avoid duplicate votes with unique user-poll constraint. |
| Story | id, authorId, institutionId, mediaUrl, text, expiresAt, visibility | Short-lived campus stories. |
| Report | id, reporterId, targetType, targetId, reason, details, status | Core moderation input. |
| ModerationAction | id, moderatorId, targetType, targetId, action, reason, createdAt | Audit trail for trust and safety. |
| Block | blockerId, blockedUserId | Privacy and safety control. |
| Conversation/Message | participants, message body/media, status | DM and match chat infrastructure. |
| MatchProfile/Swipe/Match | intent, filters, swipe decision, match status | Post-MVP or gated beta. |

### Important database constraints

- Unique index on User.email.
- Unique index on InstitutionDomain.domain.
- Unique username per institution or globally, depending on branding.
- Foreign key from every content object to authorId for safety accountability.
- Soft-delete content with status fields rather than hard-delete immediately, unless legally required.
- Audit log every moderation action and every admin access to sensitive information.

---

## 15. Metrics and analytics

Measure campus density, retention, post quality, safety, and monetization readiness. Do not optimize only for raw posts, because a toxic feed can look active while destroying trust.

| Metric | Why it matters | Target direction |
|---|---|---|
| Verified signups per campus | Indicates campus launch health. | Reach 500+ verified users in a pilot campus. |
| D1/D7/D30 retention | Measures habit formation. | Improve weekly before expansion. |
| Posts per daily active user | Shows content liquidity. | Healthy but not spammy. |
| Comment rate per post | Measures discussion depth. | Higher with quality moderation. |
| Poll vote rate | Fast engagement indicator. | High in early launches. |
| Report rate per 1,000 posts | Safety signal; too high means feed is harmful. | Track by campus and post type. |
| Moderation response time | Trust and safety performance. | Fast for severe reports. |
| Block/mute rate | User discomfort signal. | Investigate spikes. |
| Campus activation score | Expansion readiness. | A campus is active when users, posts, comments, and retention cross thresholds. |

### Campus activation formula

Campus Activation Score = 0.30 × weekly active verified users + 0.25 × posts per week + 0.20 × comment depth + 0.15 × D7 retention - 0.10 × unresolved severe reports.

---

## 16. Roadmap

| Phase | Timeline | Goal | Deliverables |
|---|---|---|---|
| Phase 0 | Week 0-2 | Validate demand before heavy build. | Landing page, waitlist, ambassador form, 50 student interviews, college domain list. |
| Phase 1 | Week 3-8 | Build MVP and launch first campus. | Auth, onboarding, campus feed, anonymous posts, polls, reports, admin moderation. |
| Phase 2 | Month 3-4 | Increase engagement and retention. | Stories, global mode, clubs/events, better notifications, campus analytics. |
| Phase 3 | Month 5-6 | Expand to multiple campuses. | Ambassador dashboard, institution requests, moderation workflows, city feeds. |
| Phase 4 | Month 7-9 | Start monetization tests. | Campus ads, event ticketing, marketplace beta, premium experiments. |
| Phase 5 | Month 10-12 | Launch controlled match mode. | 18+ opt-in match profiles, swipes, mutual chat, advanced safety controls. |

### Expansion rule

Do not expand to a new campus until the previous campus has stable retention, healthy moderation, and enough ambassadors to prevent the feed from becoming empty or unsafe.

---

## 17. Risks and mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| Cyberbullying and harassment | High | Pre-publish filters, report controls, rapid takedowns, repeat offender bans, no harmful named accusations. |
| Doxxing or private information leaks | High | Detect phone numbers, emails, addresses, IDs, screenshots; block or review before publishing. |
| Misinformation during emergencies | High | Emergency mode, official resource pinning, rumor throttling, temporary limits on unverified claims. |
| Minor safety and dating risk | High | Match mode 18+ only; under-18 restrictions; parental consent/legal review where needed. |
| Low campus liquidity | Medium | Launch campus-by-campus; ambassadors; seeding prompts; minimum activation threshold. |
| Fake students or outsiders | Medium | Institution email verification, fallback review, device/risk checks, referral limits. |
| Legal complaints from colleges | Medium | Clear policies, takedown process, safety contact, no impersonation, no official affiliation claims. |
| Over-moderation reduces fun | Medium | Allow humor, memes, and honest student life while banning targeted harm. |
| Data breach | High | Encrypt sensitive data, least-privilege admin access, audit logs, security reviews, short retention for verification artifacts. |

### Main founder risk

The biggest risk is not competition. The biggest risk is trust collapse caused by harmful anonymous content. Build safety as a feature, not as a patch.

---

## 18. AI build prompt

Use the following prompt with Claude Code, Cursor, or another coding agent to generate the MVP frontend and backend foundation.

```txt
Build a production-ready MVP for a startup called CampusLoop.

CampusLoop is a verified student-only social network. Students sign up using their university or college email. The app auto-detects their institution from the email domain and places them into their campus community. Students can post normal posts, anonymous posts, confessions, polls, memes, questions, events, and lost-and-found posts. The app also has global mode where students from different colleges can interact.

Tech stack:
- Next.js latest App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- PostgreSQL
- Prisma or Drizzle
- Redis for rate limits and feed caching
- NextAuth/Auth.js or custom magic-link auth
- UploadThing or Cloudflare R2 for media
- Mobile-first PWA UI

Core pages:
1. Landing page
2. Auth page with college email verification
3. Onboarding page: name, username, college auto-detected, course, year, branch, interests
4. Campus feed
5. Global feed
6. Confessions page
7. Polls page
8. Stories UI
9. Post composer with post type selector
10. Comments page
11. Profile page
12. Settings page
13. Safety/reporting page
14. Admin moderation dashboard

Important product rules:
- Anonymous means anonymous to other users, not to the safety/admin system.
- Store author ID privately for moderation.
- Never show real identity on anonymous posts.
- Add report, block, mute, and delete controls.
- Add keyword/rule-based moderation before publishing posts.
- Auto-hide posts after repeated reports.
- Prevent doxxing: detect phone numbers, emails, addresses, and IDs.
- Prevent harmful anonymous named accusations.
- Add rate limits for new users.

Database models:
- User
- Institution
- InstitutionDomain
- StudentProfile
- Post
- Comment
- Vote
- Poll
- PollOption
- PollVote
- Story
- Report
- Block
- Conversation
- Message
- ModerationAction
- CampusAmbassador

UI direction:
- Clean, Gen Z, mobile-first.
- Mix of Reddit, Instagram Stories, Discord communities, and future swipe-based discovery.
- Use beautiful cards, soft gradients, rounded corners, bottom navigation, quick composer, and campus switcher.
- Make the app feel premium, safe, and addictive.

Build the app step by step. Create seed data for 10 Indian colleges. Create a clean README with setup instructions. Add environment variable examples. Add sensible empty states and loading states. Make the codebase clean, scalable, and open-source friendly. Commit after each major step.
````

---

## 19. References

These references were used for market and compliance context. Legal compliance should still be reviewed by a qualified professional before launch.

| Ref | Source                                                                                                              |
| --- | ------------------------------------------------------------------------------------------------------------------- |
| 1   | Fizz official website — campus communities and 700+ schools claim.                                                  |
| 2   | Case Western Reserve University explainer on Sidechat — university email and school-specific anonymous communities. |
| 3   | CBS News explainer on Sidechat and moderation concerns during campus protests.                                      |
| 4   | Ministry of Electronics and Information Technology — Digital Personal Data Protection Act, 2023 PDF.                |
| 5   | TechCrunch — Fizz marketplace expansion for college students.                                                       |
| 6   | Apple App Store listing for Fizz — college/city/national positioning and local discovery features.                  |

---

## Final recommendation

Build CampusLoop as a safety-first, verified student network. Let confessions drive growth, but let trust, utility, and campus density create the company.
