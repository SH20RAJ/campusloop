/**
 * Centralized Landing Page Copy & Content System
 * All copy is written for students/Gen-Z: relatable, punchy, zero corporate/investor jargon, no "//" signs.
 */

export const HERO_CONTENT = {
  badge: "Verified Student Network",
  campusCount: "1,350+ Colleges Across India",
  headlineMain: "Your campus,",
  headlineHighlight: "finally on its own network.",
  subheadline:
    "Drop confessions anonymously, vote on campus polls, share notes, find study buddies, and trade dorm stuff — strictly for verified college students.",
  ctaPrimary: "Get verified with college email",
  ctaPrimaryAuthenticated: "Enter Campus Feed",
  ctaSecondary: "Explore a campus",
  trustPoints: [
    "College email verified",
    "Real or anonymous mode",
    "100% free for students",
  ],
  preview: {
    hubTitle: "Campus Hub",
    hubSubtitle: "100% Student Verified",
    statusBadge: "Live",
    postAuthor: "Anonymous Student",
    postHandle: "@anon_student",
    postTime: "2h ago",
    postTag: "#campus-life",
    postContent:
      "The campus winter fog at 1 AM with cutting chai hits completely different than any cafe in town. Midsem prep is stressful, but the hostel vibes make it worth it.",
    pollTitle: "Late-Night Food Poll",
    pollStatus: "Active",
    pollQuestion: "Where are we getting late-night chai & Maggi tonight?",
    pollOptions: {
      option1: { name: "Canteen Booth near Library", defaultPercent: 42 },
      option2: { name: "Back Gate Night Counter", defaultPercent: 58 },
    },
    footerReassurance: "One verified student account · Zero outsiders",
  },
};

export const CAMPUS_PROBLEM_CONTENT = {
  eyebrow: "Why college apps are broken",
  headlineMain: "Campus life is already online.",
  headlineSub: "It's just scattered everywhere.",
  description:
    "We all juggle 40 chaotic WhatsApp groups, sketchy Instagram confession pages, and strangers on Telegram. CampusLoop brings your whole campus together in one safe place.",
  cards: [
    {
      badge: "Too much chaos",
      title: "Chaotic WhatsApp & Telegram Groups",
      problem: "Important fest notices drown in 500+ unread spam texts.",
      detail:
        "Exam tips, lost ID cards, and club announcements get buried instantly under random memes, forwards, and unmuted notifications.",
      tag: "500 unread messages",
    },
    {
      badge: "Zero trust",
      title: "Shady Instagram Confession Pages",
      problem: "Run by random people, watched by strangers and coaching centers.",
      detail:
        "Unverified admins post screenshots for clout and coaching ads. People get targeted with zero accountability while actual campus issues get ignored.",
      tag: "No student safety",
    },
    {
      badge: "Sketchy deals",
      title: "Trading With Total Strangers",
      problem: "Trying to buy second-hand cycles, drafters, or coolers online.",
      detail:
        "Random online marketplaces are full of scams and ghosting. Campus gear should be bought and handed over right in your hostel from verified batchmates.",
      tag: "Stranger danger",
    },
  ],
  resolution: {
    eyebrow: "The CampusLoop fix",
    headline: "One private loop for your entire university.",
    description:
      "Log in once with your student email to unlock your campus feed, club updates, classmate connections, and peer market — only students with a valid college domain can enter.",
    cta: "Join with college email",
  },
};

export const VERIFIED_IDENTITY_CONTENT = {
  eyebrow: "Privacy & Identity",
  headlineMain: "Verified at the door.",
  headlineHighlight: "Anonymous whenever you want.",
  description:
    "Other apps make you choose between complete public surveillance or toxic trolling. CampusLoop lets you speak candidly while keeping the community safe and verified.",
  steps: [
    {
      number: "01",
      title: "College Email",
      desc: "Instant one-time 6-digit OTP to your university inbox (.ac.in / .edu.in).",
      tag: "Zero fake accounts",
    },
    {
      number: "02",
      title: "Your Campus Hub",
      desc: "Automatically placed into your college's private loop. Zero outsiders.",
      tag: "Students only",
    },
    {
      number: "03",
      title: "Dual Mode Switcher",
      desc: "Post with your real name for clubs and projects, or switch to anon for confessions.",
      tag: "Your choice",
    },
    {
      number: "04",
      title: "Real Accountability",
      desc: "Peers never see your real identity in anon mode, but abusers get banned automatically.",
      tag: "Community safe",
    },
  ],
  privacyDemo: {
    title: "Privacy Shield: Real-Time Doxxing Protection",
    flaggedBadge: "Contact info detected",
    cleanBadge: "Safe to post",
    inputLabel: "Draft your post (Try typing a phone number or email)",
    inputDefault: "Lost my lab manual near the main canteen. Call 9876543210 or email me at senior@college.ac.in!",
    statusTitle: "Campus Privacy Engine",
    phoneDetector: "Phone Number Check:",
    emailDetector: "Email Address Check:",
    anonymityStorage: "Database Anonymity:",
    anonymityValue: "author_id = NULL (Untrackable by peers)",
  },
  pillars: [
    {
      number: "01",
      title: "One-Time Verification",
      desc: "Verify once with your student email for smooth access. No daily popups or annoying re-verifications.",
    },
    {
      number: "02",
      title: "Zero Foreign-Key Leaks",
      desc: "Anonymous posts don't store your user ID in the timeline row. Nobody can reverse-query a post back to you.",
    },
    {
      number: "03",
      title: "Safe Student Community",
      desc: "You stay anonymous to classmates, but automated keyword and safety shields keep harassment out.",
    },
  ],
};

export const HOW_IT_WORKS_CONTENT = {
  eyebrow: "Super simple onboarding",
  headlineMain: "Three quick steps.",
  headlineSub: "Zero random outsiders.",
  description:
    "No open signups. No phone book scrapers. Just your college email to prove you belong to your campus.",
  steps: [
    {
      step: "01",
      title: "Enter your college email",
      subtitle: "roll_number@college.ac.in",
      desc: "Type in your official student email. We dispatch a 6-digit OTP to prove active student status in seconds.",
    },
    {
      step: "02",
      title: "Enter your campus hub",
      subtitle: "Private college loop",
      desc: "Your university is your default home feed. Every classmate you meet has passed the same student verification.",
    },
    {
      step: "03",
      title: "Start looping",
      subtitle: "Feed, friends, notes & gear",
      desc: "Post confessions, find study partners, vote on canteen food, and grab verified senior notes.",
    },
  ],
  domainChecker: {
    eyebrow: "Domain search",
    title: "Is your college email supported?",
    description: "Type your college email domain below to check compatibility instantly:",
    placeholder: "you@iitd.ac.in",
    buttonText: "Check domain",
    recognizedMessage: "is a recognized campus domain. You can sign up with your student email right now!",
    unrecognizedMessage: "We haven't indexed this domain yet. Request your college and we'll add it within 24 hours.",
    idleMessage: "Test any .ac.in or .edu.in domain to see instant support.",
    footnote: "Indexed across 1,350+ verified Indian university and college domains.",
  },
};

export const PRODUCT_SHOWCASE_CONTENT = {
  eyebrow: "Everything your campus needs",
  headlineMain: "All of campus life.",
  headlineSub: "In one clean app.",
  description:
    "One student account unlocks everything — candid confessions, classmate matchmaking, peer marketplace, club feeds, and safe chat.",
  pillars: [
    {
      id: "social",
      label: "Feed & Confessions",
      tagline: "Anonymous & Real Timeline",
      heading: "Speak freely. Hear the real campus pulse.",
      summary:
        "Post unfiltered thoughts behind safe pseudonyms, debate hostel food in live polls, and see what students are actually talking about right now.",
      specs: [
        { label: "Scope", value: "Campus Only" },
        { label: "Anonymity", value: "One-Way Pseudonym" },
        { label: "Access", value: "Students Only" },
      ],
      benefits: [
        "Zero user ID traces in anonymous mode",
        "1 verified student = 1 uncheatable poll vote",
        "Campus-first feed with no outsider noise",
      ],
    },
    {
      id: "people",
      label: "Meet Classmates",
      tagline: "Connections & Study Buddies",
      heading: "Find study partners, gym buddies & crushes.",
      summary:
        "Connect with batchmates for hackathons, midsem study sessions, or campus dating. Zero creepers, zero catfishing — every profile belongs to an enrolled student.",
      specs: [
        { label: "Community", value: "100% Verified Students" },
        { label: "Privacy", value: "Mutual Match Required" },
        { label: "Secret Crush", value: "Matches only if mutual" },
      ],
      benefits: [
        "No unsolicited DMs without mutual match",
        "Secret crush list reveals only when both opt in",
        "Filter by branch, year, campus, or all India",
      ],
    },
    {
      id: "utility",
      label: "Notes & Gear",
      tagline: "PYQs, Notes & Dorm Market",
      heading: "Buy cycles, grab notes & find lost items.",
      summary:
        "Buy second-hand cycles, coolers, and drafters in ₹ directly from seniors moving out. Download exam-saving lecture notes and solved PYQs.",
      specs: [
        { label: "Market", value: "Hostel Peer-to-Peer" },
        { label: "Pricing", value: "Fair Student INR" },
        { label: "Academics", value: "Senior-Verified Notes" },
      ],
      benefits: [
        "Trade only with verified students from your campus",
        "Fast pickups at known hostel landmarks",
        "Notes organized by branch, subject, and semester",
      ],
    },
    {
      id: "communities",
      label: "Clubs & Societies",
      tagline: "Student Chapters & Sub-Hubs",
      heading: "Club updates and fests that never get lost.",
      summary:
        "Never miss a robotics workshop or fest tryout again. Campus societies and hobby circles get clean feeds, member rosters, and event RSVPs.",
      specs: [
        { label: "Layout", value: "Dedicated Feeds" },
        { label: "Roles", value: "Leads & Members" },
        { label: "Events", value: "Instant RSVPs" },
      ],
      benefits: [
        "Announcements that stay pinned and organized",
        "Join clubs with one tap",
        "Discover exciting societies across your campus",
      ],
    },
    {
      id: "messaging",
      label: "Direct Chat",
      tagline: "Safe Messaging",
      heading: "Chat with peers without sharing your phone number.",
      summary:
        "Coordinate project work and talk to new friends safely inside CampusLoop. No need to hand out personal WhatsApp numbers to seniors or strangers.",
      specs: [
        { label: "Handle", value: "Campus Profile" },
        { label: "Safety", value: "No Phone Number Needed" },
        { label: "Calling", value: "Direct WebRTC" },
      ],
      benefits: [
        "Keep your personal phone number completely private",
        "One-tap block and report on any thread",
        "Encrypted, high-speed student messaging",
      ],
    },
  ],
};

export const VIEWER_MODE_CONTENT = {
  eyebrow: "For future college students",
  headlineMain: "Not in college yet?",
  headlineSub: "Check out campus life before you join.",
  description:
    "JEE, NEET, and CUET aspirants can read real, honest discussions from students at IITs, NITs, BITS, and top universities — without marketing spin or coaching ads.",
  steps: [
    {
      step: "01",
      title: "Read Honest Student Posts",
      desc: "Explore what hostel life, professors, and placements are actually like directly from current students.",
    },
    {
      step: "02",
      title: "Save Helpful Threads",
      desc: "Bookmark hostel packing checklists, branch reviews, and exam tips as you compare colleges.",
    },
    {
      step: "03",
      title: "Unlock Full Access on Admission",
      desc: "The day you get your college email address, verify in one tap to unlock posting, chatting, and matchmaking.",
    },
  ],
  callout: {
    title: "How it works:",
    desc: "Anyone can read in Viewer Mode. Posting, chatting, and confessions are strictly reserved for verified college students.",
    cta: "Explore in Viewer Mode",
  },
};

export const WHY_VERIFIED_CONTENT = {
  eyebrow: "Why student verification matters",
  headlineMain: "Random internet apps vs.",
  headlineHighlight: "Verified campus network.",
  description:
    "When everyone in the room is an actual verified student, the conversations are real, the jokes hit home, and nobody is trying to scam you.",
  tableHeaders: {
    dimension: "Feature",
    openWeb: "Random Social Apps",
    campusloop: "CampusLoop Verified",
  },
  rows: [
    {
      category: "Who is inside",
      openWeb: "Anyone with a burner email, bots, and random trolls",
      campusloop: "100% verified students with active college emails",
    },
    {
      category: "Campus relevancy",
      openWeb: "Random viral memes, coaching ads, and outsider noise",
      campusloop: "Your actual canteen, fests, hostels, and professors",
    },
    {
      category: "Anonymity",
      openWeb: "Toxic harassment or zero privacy protection",
      campusloop: "Anonymous to peers with automated safety guardrails",
    },
    {
      category: "Buying & Selling",
      openWeb: "Scams, payment fraud, and awkward stranger pickups",
      campusloop: "Hostel-to-hostel handovers with batchmates and seniors",
    },
    {
      category: "Overall vibe",
      openWeb: "Endless scrolling, doomposting, and toxic algorithms",
      campusloop: "Tight-knit community, real campus laughs, and genuine friends",
    },
  ],
};

export const FAQ_CONTENT = {
  eyebrow: "Common Questions",
  headline: "Everything you need to know.",
  subheadline: "Clear answers about verification, privacy, and how CampusLoop works.",
  faqs: [
    {
      q: "How does college email verification work?",
      a: "Enter your official student email (like roll_number@college.ac.in). We send a quick 6-digit OTP to your college inbox. Once you enter it, your account is verified instantly. We never ask for college passwords or personal phone numbers.",
    },
    {
      q: "Can my professors, HODs, or classmates see my anonymous posts?",
      a: "No. When you post in anonymous mode, your real name and avatar are completely hidden. Your post is published with a randomized pseudonym. The database does not link the post row to your user profile, so no peer or teacher can see who wrote it.",
    },
    {
      q: "What is Viewer Mode and who can use it?",
      a: "Viewer Mode is made for school students and JEE/NEET/CUET aspirants who want to see what college life is really like before picking a campus. You can read public campus feeds and save threads. Posting and messaging unlock as soon as you get your official college email.",
    },
    {
      q: "What if my college isn't listed yet?",
      a: "We have already indexed 1,350+ Indian universities and colleges (IITs, NITs, BITS, DU, state colleges, and deemed universities). If your college domain isn't activated yet, submit it through our quick request form and our team verifies the registrar domain within 24 hours.",
    },
    {
      q: "Is CampusLoop completely free for students?",
      a: "Yes, CampusLoop is 100% free for college students. There are no subscriptions, ads, or paywalls for reading feeds, voting on canteen polls, or downloading study materials.",
    },
  ],
};

export const FINAL_CTA_CONTENT = {
  badge: "100% Verified Student Network",
  headline: "Your campus is already talking.",
  subheadline:
    "Join thousands of students across 1,350+ colleges. Connect with classmates, share honest thoughts, and never miss what happens in your university.",
  ctaPrimary: "Get verified with college email",
  ctaPrimaryAuthenticated: "Open Campus Feed",
  ctaSecondary: "Explore in Viewer Mode",
  footerAttribution: "Built for students across 1,350+ campuses in India",
};
