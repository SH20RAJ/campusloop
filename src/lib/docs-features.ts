/**
 * Central catalogue for the public /docs hub.
 * Each entry powers one SEO page at /docs/[slug].
 * Tone rule: professional, LinkedIn-longform structure
 * (hook → problem → shift → how it works → why it matters),
 * zero raw emojis — icons are resolved in components.
 */

export type DocsCategory = "Connect" | "Express" | "Utilities" | "Trust";

export interface DocsFeature {
  slug: string;
  title: string;
  tagline: string;
  category: DocsCategory;
  description: string;
  keywords: string[];
  hook: string;
  problem: string;
  shift: string;
  howItWorks: string[];
  proofPoints: string[];
  faq: { q: string; a: string }[];
}

export const DOCS_CATEGORIES: DocsCategory[] = ["Express", "Connect", "Utilities", "Trust"];

export const DOCS_FEATURES: DocsFeature[] = [
  {
    slug: "campus-feed",
    title: "Campus Feed",
    tagline: "One verified timeline for everything happening on your campus.",
    category: "Express",
    description:
      "The CampusLoop campus feed is a verified, chronological-plus-ranked timeline of confessions, polls, questions and announcements — visible only to students of your college.",
    keywords: ["campus feed", "college timeline", "student posts", "verified feed", "campus updates"],
    hook: "Every campus already has a feed. It is scattered across forty WhatsApp groups, three Telegram channels, and a notice board nobody reads.",
    problem:
      "When information lives in chat groups, it disappears in hours, reaches the wrong people, and mixes outsiders with students. Important posts — lost IDs, event announcements, genuine questions — drown in forwarded messages.",
    shift:
      "A campus feed works when three conditions hold: everyone reading it is a verified student, posts are ranked by relevance instead of forwarding speed, and anonymity is available where honesty needs it. That is the design the CampusLoop feed is built around.",
    howItWorks: [
      "Verify once with your college email to enter your campus hub.",
      "Browse Latest for chronological order, or For You and Trending for ranked relevance.",
      "Filter by hashtags, post types, or switch scope between Campus and Global.",
      "Post publicly or anonymously, vote, repost, save, and follow threads you care about.",
    ],
    proofPoints: [
      "Campus-scoped by default — no cross-college noise unless you opt into Global.",
      "Nine ranking modes including Latest, Trending, Viral, and Most Discussed.",
      "Anonymous posts carry no author link, enforced at the database level.",
    ],
    faq: [
      {
        q: "Who can see my campus feed posts?",
        a: "Only verified students of your college see Campus-scoped posts. Global-scoped posts are visible across colleges but still only to verified students.",
      },
      {
        q: "Is the feed chronological?",
        a: "Latest sort is strictly chronological. Ranked sorts like For You and Trending reorder by engagement, recency decay, and follow affinity.",
      },
    ],
  },
  {
    slug: "anonymous-confessions",
    title: "Anonymous Confessions",
    tagline: "Honest campus conversation with cryptographic identity protection.",
    category: "Express",
    description:
      "CampusLoop confessions let students post anonymously behind a one-way pseudonym, with automatic PII scrubbing and a sealed identity vault that no query can join back to the author.",
    keywords: [
      "anonymous confessions",
      "college confessions",
      "anonymous posting",
      "campus secrets",
      "PII protection",
    ],
    hook: "The most useful things on a campus are said quietly — in hostel corridors, after midnight, never in public.",
    problem:
      "Public posting has a cost: juniors fear seniors, students fear faculty, and everyone fears screenshots. So real feedback about mess food, teaching quality, and campus life never gets written down where it can be acted on.",
    shift:
      "Anonymity works when it is structural, not promised. CampusLoop anonymous posts store no author id — only a pseudonym — with the real identity AES-sealed in a vault table that has no foreign key back to the author. No SQL join can deanonymize a post. Client-side PII scrubbing strips phone numbers and emails before text is even saved.",
    howItWorks: [
      "Choose Anonymous when composing a post.",
      "Automatic scrubbing removes phone numbers and email addresses from the text.",
      "The post is published under a stable pseudonym for that thread.",
      "Moderation and reporting still apply — anonymity protects identity, not behavior.",
    ],
    proofPoints: [
      "Anonymous posts carry no author relation to the client, ever.",
      "Notifications are never attached to actors derived from anonymous posts.",
      "Profile-level boosts cannot target anonymous content.",
    ],
    faq: [
      {
        q: "Can anyone find out who posted anonymously?",
        a: "No. Anonymous posts store no author id, and the sealed identity vault has no foreign key to user profiles, so no query can join them.",
      },
      {
        q: "Can anonymous posts be reported?",
        a: "Yes. Anonymity protects identity, not behavior. Reported anonymous posts go through the same moderation pipeline.",
      },
    ],
  },
  {
    slug: "polls-and-questions",
    title: "Polls and Questions",
    tagline: "Settle campus debates with votes that only students can cast.",
    category: "Express",
    description:
      "CampusLoop polls and Q&A turn canteen debates and academic doubts into structured, votable threads where every vote comes from a verified student.",
    keywords: ["campus polls", "college voting", "student questions", "canteen polls", "campus Q&A"],
    hook: "Ask any campus which canteen is best and you will get a three-hour argument. Ask it as a poll and you get an answer in twenty minutes.",
    problem:
      "Opinions on campus are loud but unmeasured. Fest committees guess, mess contractors assume, and student councils run on whoever shouts in the group chat. Nobody knows what the silent majority thinks.",
    shift:
      "Polls become decision tools when the electorate is defined. Because every vote on CampusLoop comes from a verified student of a known campus, a poll result is a genuine sample of student opinion — usable by councils, clubs, and canteens.",
    howItWorks: [
      "Create a poll with two to four options, or post an open question.",
      "Share it to your campus feed with relevant hashtags.",
      "Watch live vote counts and percentages update in real time.",
      "Top-voted answers surface automatically on questions.",
    ],
    proofPoints: [
      "One verified student, one vote — no ballot stuffing from outside accounts.",
      "Results update live without page refreshes.",
      "Poll threads support reposts and quotes for wider campus reach.",
    ],
    faq: [
      {
        q: "Can outsiders vote on polls?",
        a: "No. Voting requires a verified student account, and campus-scoped polls are limited to students of that college.",
      },
      {
        q: "Can I change my vote?",
        a: "Yes, you can change your vote while the poll is open. Only your latest vote counts.",
      },
    ],
  },
  {
    slug: "campus-match",
    title: "Campus Match",
    tagline: "Meet verified students from your own college — no catfishing possible.",
    category: "Connect",
    description:
      "Campus Match is a swipe-based connection feature limited to verified students, with gender and scope filters, mutual-match chat unlocks, and zero anonymous profiles.",
    keywords: ["campus dating", "college match", "student dating app", "verified dating", "campus crush"],
    hook: "Dating apps have a trust problem on campuses: half the profiles are fake, graduated, or never attended your college.",
    problem:
      "Students want to meet people nearby, but mainstream dating apps mix campuses with cities, allow unverified photos, and expose students to outsiders. The result is catfishing, harassment, and low trust.",
    shift:
      "Match quality changes completely when the entire dating pool cleared the same college-email verification. Every profile on Campus Match belongs to a currently enrolled, verified student — that single constraint removes the most common abuse vectors at once.",
    howItWorks: [
      "Opt into Campus Match from the dating tab.",
      "Set gender and scope filters (your campus or all verified campuses).",
      "Swipe through verified student profiles.",
      "Chat unlocks only on mutual match — no unsolicited messages.",
    ],
    proofPoints: [
      "Every profile is tied to a verified college email identity.",
      "Chat is mutual-match gated; there is no cold messaging.",
      "Block and report controls are one tap from every conversation.",
    ],
    faq: [
      {
        q: "Is Campus Match a dating app for outsiders?",
        a: "No. Only verified students can create profiles or appear in the deck. There are no public or outsider profiles.",
      },
      {
        q: "Can someone message me without matching?",
        a: "No. Conversations unlock only after both sides opt in with a mutual match.",
      },
    ],
  },
  {
    slug: "secret-crush",
    title: "Secret Crush Vault",
    tagline: "Lock in up to five crushes. Identities reveal only on mutual match.",
    category: "Connect",
    description:
      "The Secret Crush Vault lets students register up to five campus crushes in a zero-doxxing escrow — neither side is notified unless the interest is mutual.",
    keywords: [
      "secret crush",
      "crush matching",
      "mutual crush reveal",
      "campus crush app",
      "anonymous crush",
    ],
    hook: "Most campus crushes die in silence — not from rejection, but from the fear of confessing first.",
    problem:
      "Confessing a crush is asymmetrical: the confessor takes all the social risk while the other person risks nothing. So students stay quiet for semesters, and both sides never know.",
    shift:
      "An escrow fixes the asymmetry. Both sides declare privately; the system reveals only when declarations overlap. Nobody learns about unreciprocated interest — the information simply never leaves the vault.",
    howItWorks: [
      "Add up to five verified students to your private crush vault.",
      "They are never notified that you added them.",
      "If they add you back, both sides get a mutual-reveal alert.",
      "Chat unlocks immediately on mutual reveal.",
    ],
    proofPoints: [
      "Zero-doxxing by design — no notifications for one-sided entries.",
      "Five-slot limit keeps the signal genuine.",
      "Entries are editable and removable at any time.",
    ],
    faq: [
      {
        q: "Will my crush know I added them?",
        a: "No. They are notified only if they independently add you back, creating a mutual reveal.",
      },
      {
        q: "How many crushes can I add?",
        a: "Up to five at a time. You can remove and replace entries whenever you want.",
      },
    ],
  },
  {
    slug: "stories-vibes",
    title: "Stories and Vibes",
    tagline: "Twenty-four-hour visual updates from your verified campus.",
    category: "Express",
    description:
      "CampusLoop Stories are 24-hour photo and video updates with a fullscreen viewer, DM replies, archives, and profile highlights — shared only with verified students.",
    keywords: ["campus stories", "student stories", "24 hour stories", "college vibes", "story viewer"],
    hook: "Campus life happens in moments — fest nights, hostel sunsets, match wins. By morning, the moment is gone and so is the story.",
    problem:
      "Students share campus moments on public platforms where family, recruiters, and strangers all watch. Self-censorship follows: the real campus never gets posted.",
    shift:
      "A stories format works for students when the audience is bounded. Verified-only viewership means stories are seen by peers who understand the context — so posting feels safe and genuine.",
    howItWorks: [
      "Capture or upload a photo or short video.",
      "Post it to your story — visible for 24 hours.",
      "Viewers reply via DM; likes are private to you.",
      "Save confirmed moments to archives and profile highlights.",
    ],
    proofPoints: [
      "Fullscreen progress-bar viewer with tap navigation.",
      "DM replies route into existing verified chat threads.",
      "Expired stories archive privately — nothing is public by default.",
    ],
    faq: [
      {
        q: "Who can view my stories?",
        a: "Verified students within your story audience setting. Stories are never publicly indexed.",
      },
      {
        q: "Do stories disappear after 24 hours?",
        a: "Yes, from public view. Your own copies remain in your private archive unless you delete them.",
      },
    ],
  },
  {
    slug: "marketplace",
    title: "Student Marketplace",
    tagline: "Buy, sell, and order campus essentials without leaving the loop.",
    category: "Utilities",
    description:
      "The CampusLoop marketplace connects verified students with campus food outlets, essentials, and peer-to-peer listings — cycles, books, and hostel gear — plus merchant storefronts.",
    keywords: [
      "student marketplace",
      "campus food delivery",
      "buy sell college",
      "hostel essentials",
      "student merchants",
    ],
    hook: "Every semester, thousands of perfectly good cycles, coolers, and textbooks change hands — through screenshots in groups that expire in a day.",
    problem:
      "Peer-to-peer campus trade runs on trust but executes on chaos: no listing structure, no seller verification, no order tracking. Buyers get ghosted; sellers get lowballed by strangers.",
    shift:
      "Trade inside a verified network and the trust problem mostly disappears. Both sides are enrolled students of known campuses, listings are structured and searchable, and merchants run proper storefronts with reviews.",
    howItWorks: [
      "Browse peer listings or merchant storefronts in your campus hub.",
      "Order food and essentials, or message peer sellers directly.",
      "Track orders from placement to handoff.",
      "Merchants manage menus, stock, and earnings from a dedicated portal.",
    ],
    proofPoints: [
      "Peer sellers and buyers are both verified students.",
      "Merchant portal with orders, earnings, and review management.",
      "Structured listings with price, condition, and pickup location.",
    ],
    faq: [
      {
        q: "Who can sell on the marketplace?",
        a: "Verified students can post peer listings. Businesses operate through approved merchant storefronts.",
      },
      {
        q: "How do peer handoffs work?",
        a: "Buyers and sellers coordinate pickup over verified chat — typically a hostel or campus landmark handoff.",
      },
    ],
  },
  {
    slug: "academics-notes",
    title: "Academics and Notes Vault",
    tagline: "Previous-year papers, verified notes, and study playlists by seniors.",
    category: "Utilities",
    description:
      "The Academics hub aggregates senior-verified notes, solved previous-year question papers, and curated study playlists — searchable by subject, branch, and semester.",
    keywords: [
      "engineering notes",
      "PYQ papers",
      "previous year questions",
      "study material",
      "semester notes",
    ],
    hook: "Every exam season, the same panic repeats: juniors begging for notes in groups while seniors' perfectly good material sits in forgotten Drive links.",
    problem:
      "Study material on campus is abundant but undiscoverable. It lives in personal Drives, forwarded PDFs of unknown origin, and seniors who graduated last year. Quality is unverifiable and access is luck-based.",
    shift:
      "A notes vault works when uploads are attributable to verified seniors, quality is voted on by the students who used them, and everything is indexed by subject and semester. Discovery replaces begging.",
    howItWorks: [
      "Search by subject, branch, semester, or material type.",
      "Open peer-reviewed notes, solved PYQs, and formula sheets.",
      "Save materials to your library and build study playlists.",
      "Upload your own notes to earn Loop Points and help juniors.",
    ],
    proofPoints: [
      "Uploads carry verified uploader identity and campus context.",
      "Upvote-driven ranking surfaces material that actually helped.",
      "Dedicated upload pages with link detection and live previews.",
    ],
    faq: [
      {
        q: "Is the study material free?",
        a: "Yes. All academic uploads are free for verified students to read and download.",
      },
      {
        q: "Who verifies the notes?",
        a: "The community does — upvotes, saves, and uploader reputation rank material. Misleading uploads can be reported.",
      },
    ],
  },
  {
    slug: "time-capsule",
    title: "Batch Time Capsule",
    tagline: "Bury predictions and letters for your batch. Sealed until convocation.",
    category: "Connect",
    description:
      "The Batch Time Capsule lets students seal predictions, letters, and memories that unlock together on a future date — with live countdowns and batch-wide reveals.",
    keywords: ["time capsule", "batch memories", "convocation capsule", "student memories", "future letters"],
    hook: "In 2021, a graduating batch buried forty letters in a forum thread. By 2025, the thread was deleted and the letters were gone.",
    problem:
      "Batch memories have no durable home. Group chats get deleted, drives get lost, and graduation scatters everyone. Four years of shared life evaporate into screenshots.",
    shift:
      "A capsule works when sealing is cryptographic and the reveal is collective. Entries lock until the batch date, countdowns keep anticipation alive, and the whole batch opens them together — no single admin can delete the archive.",
    howItWorks: [
      "Write a prediction, letter, or memory for your batch capsule.",
      " Seal it — entries lock and cannot be edited after sealing.",
      "Follow the live countdown to reveal day.",
      "Open the capsule together with your batch on the unlock date.",
    ],
    proofPoints: [
      "Sealed entries are cryptographically locked until the reveal date.",
      "Batch-scoped capsules — your memories stay with your people.",
      "Countdown tickers keep the capsule visible without spoiling contents.",
    ],
    faq: [
      {
        q: "Can I edit my entry after sealing?",
        a: "No. Sealing is final by design — that permanence is what makes the reveal meaningful.",
      },
      {
        q: "Who can read capsule entries?",
        a: "Nobody until the reveal date. After unlocking, entries are visible to the capsule's batch members.",
      },
    ],
  },
  {
    slug: "loop-points",
    title: "Loop Points and Clout",
    tagline: "Campus reputation you earn — and a verified star at 150 LP.",
    category: "Trust",
    description:
      "Loop Points reward genuine campus contribution — helpful posts, quality notes, referrals — and unlock visible clout tiers including the Verified Star at 150 LP.",
    keywords: [
      "loop points",
      "campus reputation",
      "student gamification",
      "verified star",
      "campus leaderboard",
    ],
    hook: "Campuses already have reputation systems. They are called attendance registers and CGPA — and they measure the wrong things.",
    problem:
      "The students who help most — answering doubts at 2 AM, uploading notes, organizing pools — get no institutional credit. Contribution is invisible, so it stays rare.",
    shift:
      "Visible, earned reputation changes behavior. When helpful answers, quality uploads, and genuine referrals accumulate into tiers the whole campus can see, contributing becomes worth it.",
    howItWorks: [
      "Earn LP from upvotes, helpful answers, uploads, and referrals.",
      "Climb tiers from Rookie through Gold Star.",
      "Unlock the Verified Star marker at 150 LP.",
      "Track your standing on campus leaderboards.",
    ],
    proofPoints: [
      "Referrals earn a flat +20 LP per verified classmate who joins.",
      "Tiers are earned from activity — they cannot be bought.",
      "Leaderboards are campus-scoped so small colleges compete fairly.",
    ],
    faq: [
      {
        q: "What earns Loop Points?",
        a: "Upvoted posts and answers, academic uploads, poll participation, event check-ins, and successful referrals.",
      },
      {
        q: "What does the Verified Star mean?",
        a: "Reaching 150 LP marks you as an established, trusted contributor on your campus — visible across your profile and posts.",
      },
    ],
  },
  {
    slug: "communities",
    title: "Sub-Hubs and Communities",
    tagline: "Student-run clubs, societies, and interest spaces with their own feeds.",
    category: "Connect",
    description:
      "CampusLoop Communities are student-created sub-hubs for clubs, branches, hostels, and interests — each with its own feed, events, and member roles.",
    keywords: ["student communities", "college clubs", "campus societies", "sub hubs", "student groups"],
    hook: "Every campus has fifty clubs and five hundred group chats. Joining a club should not mean joining eleven notification nightmares.",
    problem:
      "Club coordination runs on chat apps built for friends, not organizations. Announcements drown, files vanish, and leaving a club means awkwardly exiting six groups.",
    shift:
      "Give each community its own structured space — feed, events, member roles, join controls — and coordination stops depending on chat archaeology. Members follow the community, not a message thread.",
    howItWorks: [
      "Create or discover communities by interest, branch, hostel, or club.",
      "Request to join — open or approval-based, set by admins.",
      "Post, discuss, and RSVP to community events in one place.",
      "Admins manage roles, pin announcements, and moderate threads.",
    ],
    proofPoints: [
      "Each community has an isolated feed and event calendar.",
      "Role-based admin controls with audit-friendly moderation.",
      "Discoverable directory across your campus and beyond.",
    ],
    faq: [
      {
        q: "Who can create a community?",
        a: "Any verified student can create a community. Dedicated creation pages keep setup structured and indexed.",
      },
      {
        q: "Are communities campus-limited?",
        a: "Communities can be campus-specific or cross-campus, depending on how the creator configures them.",
      },
    ],
  },
  {
    slug: "verification-safety",
    title: "Verification and Safety",
    tagline: "College-email gating, instant moderation, and privacy by architecture.",
    category: "Trust",
    description:
      "CampusLoop safety rests on college-email verification, keyword and PII filtering, one-tap reporting and blocking, and admin moderation — with anonymity enforced at the schema level.",
    keywords: [
      "student verification",
      "college email verification",
      "campus safety",
      "content moderation",
      "student privacy",
    ],
    hook: "Trust on the internet is usually a promise. On CampusLoop, it is a precondition — you cannot enter without proving you belong.",
    problem:
      "Open student platforms attract exactly who students do not want: spammers, graduated seniors running promotions, outsiders, and harassment accounts that respawn endlessly.",
    shift:
      "Verification at the gate changes the economics of abuse. Creating a harassing account requires a real college inbox, reports lead to bans that cannot be trivially evaded, and anonymous content is structurally unlinkable — so safety holds without surveillance.",
    howItWorks: [
      "Sign up with your college email address.",
      "Enter the one-time code sent to your inbox.",
      "Post, vote, chat, and match as a verified student.",
      "Report or block anything out of line — moderation reviews flagged content.",
    ],
    proofPoints: [
      "Read-only preview exists for aspirants, but posting requires verification.",
      "Automated keyword filtering plus human admin review.",
      "Per-person notification mutes and conversation-level mute controls.",
    ],
    faq: [
      {
        q: "What if my college is not supported yet?",
        a: "Email mail@campusloop.space with your college domain — new hubs are typically added within 24 hours.",
      },
      {
        q: "Can I browse without verifying?",
        a: "Aspirants can preview selected campuses in read-only mode. Posting, voting, chatting, and matching require a verified college email.",
      },
    ],
  },
];

export function getDocsFeature(slug: string): DocsFeature | undefined {
  return DOCS_FEATURES.find((f) => f.slug === slug);
}

export function getDocsSlugs(): string[] {
  return DOCS_FEATURES.map((f) => f.slug);
}
