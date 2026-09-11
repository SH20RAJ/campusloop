/**
 * Central catalogue for the public /docs hub.
 * Each entry powers one SEO page at /docs/[slug].
 * Written like viral LinkedIn / Twitter technical essays:
 * (Irresistible Hook → Visceral Problem → Architectural Shift → Deep Engineering Mechanics → Invariants → No-BS FAQ).
 * Zero raw emojis — icons are resolved in components.
 */

export type DocsCategory = "Connect" | "Express" | "Utilities" | "Trust";

export interface DocsFeature {
  slug: string;
  title: string;
  tagline: string;
  category: DocsCategory;
  readTime: string;
  description: string;
  keywords: string[];
  hook: string;
  problem: string;
  shift: string;
  howItWorks: string[];
  proofPoints: string[];
  takeaways: string[];
  viralQuote: string;
  faq: { q: string; a: string }[];
}

export const DOCS_CATEGORIES: DocsCategory[] = ["Express", "Connect", "Utilities", "Trust"];

export const DOCS_FEATURES: DocsFeature[] = [
  {
    slug: "campus-feed",
    title: "Campus Feed",
    tagline: "Why 42 WhatsApp groups failed, and what one verified timeline fixes.",
    category: "Express",
    readTime: "4 min read",
    description:
      "The CampusLoop campus feed is a verified, chronological-plus-ranked timeline of confessions, polls, questions and announcements — isolated to verified students of your university.",
    keywords: [
      "campus feed",
      "college timeline",
      "student posts",
      "verified feed",
      "campus updates",
      "BIT Mesra social network",
    ],
    hook: "College WhatsApp groups don't fail by accident. They fail by mathematics.\n\nPut 500 college students in a single group chat, and within two weeks it degrades into forwarded memes, exam panic, unmuted coaching promotions, and thirty people shouting over each other.\n\nImportant notices die in hours. Real questions get buried. Outsiders watch from the shadows. Here is how we engineered the alternative.",
    problem:
      "Every Indian college campus is currently running on an accidental stack: 40 WhatsApp groups, 3 Telegram channels with expired invite links, and a physical notice board outside the dean's office that nobody has looked at since 2018.\n\nWhen information is unindexed and unranked, three critical failures happen:\n1. Asymmetric noise: One vocal person can spam 500 students with zero friction.\n2. Vanishing institutional memory: Solutions to hostel Wi-Fi issues, placement prep tips, and fest announcements disappear into the chat abyss within 48 hours.\n3. The outsider hazard: Unverified phone numbers join via leaked links, scraping student contacts and spamming girls' inboxes with zero accountability.",
    shift:
      "A campus timeline works only when three architectural invariants are enforced at the database level:\n\nFirst, zero open signups: You cannot read or post without verifying an active institutional email domain (.ac.in / .edu.in).\n\nSecond, strict radius isolation: By default, your timeline is strictly bound to your own college perimeter. What happens at BIT Mesra stays at BIT Mesra unless the author explicitly flags the post for Global Indian Campus discovery.\n\nThird, decoupled dual ranking: Chronological 'Latest' for zero-algorithm immediacy, and a logarithmic decay 'Trending' model that measures authentic campus consensus rather than viral engagement bait.",
    howItWorks: [
      "Cryptographic entry gate: You verify once with your college email. Our server issues a single-use OTP, verifies active enrollment, and binds your session to your college's isolated tenant.",
      "Dual timeline radius: Browse your local Campus Hub (100% private to your college peers) or switch to Global Discovery to see cross-campus fests and inter-college hackathons.",
      "Nine ranking modes: Switch between Latest (strict chronological), For You (affinity-ranked), Trending (recency decay), and Most Discussed without algorithmic shadowbanning.",
      "Contextual authoring: Publish under your verified student identity for club announcements, or switch to one-way pseudonymous mode for candid campus feedback.",
    ],
    proofPoints: [
      "Campus-scoped by default: Zero cross-college noise or external coaching advertisements.",
      "Database-enforced isolation: Tenant queries are hard-filtered by institution ID at the ORM layer.",
      "Zero phone number exposure: Students interact without sharing personal WhatsApp contacts.",
    ],
    takeaways: [
      "Group chats are built for small friend circles, not 10,000-student university ecosystems.",
      "Institutional email gating eliminates 99.8% of spammers and external trolls before they even see the feed.",
      "Decoupled timeline algorithms give students control over chronological truth vs trending campus consensus.",
    ],
    viralQuote:
      "A campus network isn't an algorithm. It's a verified room where everyone has skin in the game.",
    faq: [
      {
        q: "Who can see posts in my campus feed?",
        a: "Only verified students who have authenticated with an active email address from your specific university domain. Outsiders and unverified accounts cannot view, post, or interact with campus-scoped feeds.",
      },
      {
        q: "Is the feed purely chronological or algorithmic?",
        a: "You have complete control. The 'Latest' tab is strictly chronological with zero algorithmic reordering. 'Trending' and 'For You' apply transparent recency-decay scoring based on student upvotes and discussion depth.",
      },
    ],
  },
  {
    slug: "anonymous-confessions",
    title: "Anonymous Confessions",
    tagline: "How cryptographic identity escrow solved the YikYak toxicity problem.",
    category: "Express",
    readTime: "5 min read",
    description:
      "CampusLoop confessions allow students to speak candidly behind a one-way pseudonym, backed by automatic client-side PII scrubbing and an AES-sealed identity vault with zero foreign-key deanonymization.",
    keywords: [
      "anonymous confessions",
      "college confessions",
      "YikYak alternative",
      "accountable anonymity",
      "PII scrubbing",
      "student mental health",
    ],
    hook: "The most important truths on a college campus are whispered after midnight in hostel corridors — never spoken in public.\n\nWhy? Because the social cost of honesty is brutal.\nA junior cannot critique a toxic senior without fearing retaliation.\nA student cannot report terrible mess food without risking a disciplinary committee strike.\nA depressed classmate cannot admit they are drowning without everyone screenshotting their profile.\n\nSo everyone stays silent. But open anonymous apps like YikYak, AskFM, and Sarahah failed for the opposite reason: unverified anonymity becomes a toxic cesspool in under two weeks.",
    problem:
      "Unverified anonymous apps always self-destruct through the same tragedy of the commons:\n\n1. Zero entry barrier allows external trolls, expelled students, and local coaching centers to target individuals.\n2. Malicious actors publish phone numbers, hostel room numbers, and defamatory rumors.\n3. The platform has no recourse except shutting down or introducing draconian surveillance that destroys user trust.\n\nOn the flip side, real-name platforms like LinkedIn or college portals produce total self-censorship. You get fake corporate polish where students pretend everything is perfect while their mental health collapses in silence.",
    shift:
      "The breakthrough is Accountable Anonymity: Anonymous to the campus, but cryptographically accountable to the safety system.\n\nOn CampusLoop:\n1. You MUST verify with a valid college email address before entering the room. That eliminates 100% of external trolls.\n2. When you post an anonymous confession, your author ID is never saved in the feed row. The post payload stores a one-way pseudonym generated per thread.\n3. Automatic client-side PII scrubbing detects and redacts phone numbers, email addresses, and room numbers before the packet ever leaves your browser.\n4. If someone engages in illegal harassment or death threats, our two-key safety escrow triggers an account ban — without ever exposing their identity to peers.",
    howItWorks: [
      "Toggle Anonymous Mode: Flip the persona switch on the composer. Your real name, avatar, and handle are instantly decoupled from the draft.",
      "Client-side PII interception: As you type, regex and NER engines automatically scrub phone numbers, emails, and targeted room markers.",
      "Pseudonymous thread anchor: The server assigns a randomized pseudonym (e.g. 'Hostel 3 Resident') unique to that thread, preserving conversational continuity without identity leakage.",
      "Zero foreign-key architecture: The database schema explicitly omits foreign keys between anonymous post rows and the users table. Even a direct SQL injection or leaked database snapshot cannot deanonymize an author.",
    ],
    proofPoints: [
      "Zero foreign-key joins: Schema-enforced mathematical privacy.",
      "Automatic PII sanitization: Phone numbers and emails are scrubbed before reaching the database.",
      "Accountable safety: Severe harassment triggers an automated ban from the verified campus network.",
    ],
    takeaways: [
      "True honesty requires anonymity, but safe anonymity requires institutional entry verification.",
      "Structural privacy (omitting database relations) is infinitely more reliable than policy promises.",
      "Client-side sanitization prevents accidental doxxing before data hits the wire.",
    ],
    viralQuote:
      "Anonymity without verification is toxic. Verification without anonymity is a PR campaign. CampusLoop is where both meet.",
    faq: [
      {
        q: "Can campus administrators or professors find out who wrote a confession?",
        a: "No. The database row for an anonymous post contains zero foreign keys or user references linking it to the author's profile. Neither faculty, campus admins, nor peer students can deanonymize an author through queries.",
      },
      {
        q: "What happens if someone posts targeted harassment or threats?",
        a: "Anonymity protects identity, not abuse. Flagged posts undergo automated safety scoring and admin escalation. Violations result in an immediate strike or permanent ban of the verified student account from the network.",
      },
    ],
  },
  {
    slug: "polls-and-questions",
    title: "Polls and Questions",
    tagline: "Settle 3-hour hostel debates in 20 minutes with ungameable student votes.",
    category: "Express",
    readTime: "3 min read",
    description:
      "CampusLoop polls and Q&A turn canteen arguments and academic doubts into structured, votable threads where every single vote is cast by a verified university peer.",
    keywords: [
      "campus polls",
      "college voting",
      "student consensus",
      "canteen polls",
      "campus Q&A",
      "student council feedback",
    ],
    hook: "Ask ten engineering students which campus canteen makes the best Maggi, and you will spark a three-hour screaming match across four hostel wings.\n\nAsk it as a verified CampusLoop poll, and you get an ungameable consensus in twenty minutes.\n\nCampus opinions are loud, but they are almost always unmeasured. Here is how we turned noise into actionable data.",
    problem:
      "Student councils, fest committees, and mess contractors make million-rupee decisions based on whoever screams the loudest in the WhatsApp group.\n\nThe problems with informal campus polling are systemic:\n1. Ballot stuffing: Anyone with 5 burner Google accounts can manipulate a Google Form.\n2. Outsider skew: WhatsApp polls get forwarded to friend circles in other colleges who have never eaten at your mess.\n3. The Silent Majority problem: 80% of students never attend open mic sessions or town halls, so policies reflect the most aggressive 5% rather than actual student need.",
    shift:
      "When every vote requires a verified institutional student token, the mathematical integrity of a poll is absolute.\n\nOne verified student = exactly one vote.\nNo burner accounts. No bot farms. No external forwards. When a poll on CampusLoop reaches 400 votes, student councils and administration have an irrefutable audit trail of real student sentiment.",
    howItWorks: [
      "Instant poll creation: Add two to four options with optional expiration windows and category tags (#canteen-poll, #exam-schedule, #fest-headliners).",
      "Single-token voting: When you tap an option, our API validates your student session and records your vote atomically via a database transaction.",
      "Live percentage visualization: Results update in real time with smooth CSS transition bars and verified vote counts.",
      "Vote mutability: Students can change their vote until the poll closes — only the final selection is tabulated.",
    ],
    proofPoints: [
      "One student, one vote: Cryptographically bound to your university account.",
      "Zero outside interference: Non-students cannot vote or skew campus data.",
      "Exportable consensus: Student committees can present transparent charts directly to university administrations.",
    ],
    takeaways: [
      "Consensus data is powerful only when the electorate is 100% verified.",
      "Replaces subjective group chat yelling with clear, quantified student opinion.",
      "Closes the feedback loop between student dissatisfaction and administrative action.",
    ],
    viralQuote:
      "When opinions are unmeasured, the loudest person wins. When votes are verified, the campus wins.",
    faq: [
      {
        q: "Can someone vote multiple times using incognito mode?",
        a: "No. Voting is tied to your verified student session token at the server level. Incognito windows, clearing cookies, or VPNs cannot bypass the single-vote constraint.",
      },
      {
        q: "Can I see who voted for which option?",
        a: "Individual voting choices are kept completely private to encourage honest participation. Only aggregate vote totals and percentages are displayed publicly.",
      },
    ],
  },
  {
    slug: "campus-match",
    title: "Campus Match",
    tagline:
      "Why mainstream dating apps fail on campuses, and how college email verification kills catfishing.",
    category: "Connect",
    readTime: "4 min read",
    description:
      "Campus Match is an opt-in discovery deck limited strictly to verified students — facilitating study buddies, co-founders, and romance with zero anonymous profiles and mutual-match messaging.",
    keywords: [
      "campus dating",
      "college match",
      "student dating app",
      "verified dating",
      "study buddy matching",
      "catfishing prevention",
    ],
    hook: "Mainstream dating apps have a massive trust problem on college campuses: more than half the profiles are fake, graduated five years ago, or predatory outsiders.\n\nStudents download Tinder or Bumble hoping to meet someone in their lecture hall or sports ground. Instead, they get matched with 35-year-old salesmen from the next city, bot accounts selling crypto, and classmates hiding behind stolen Instagram photos.\n\nWe fixed this by establishing one non-negotiable rule: if you aren't an enrolled student with an active university email, you do not exist in this deck.",
    problem:
      "Dating and friend-finding apps are optimized for city-scale anonymity, which completely destroys campus trust:\n1. The catfishing nightmare: Anyone can take photos from a student's public Instagram and create a fake profile to harass people.\n2. The safety risk: Female students face unsolicited contact from outsiders who have zero campus accountability.\n3. The context vacuum: Generic apps don't understand that being a CSE '26 student looking for a hackathon teammate or badminton partner is entirely different from casual city dating.",
    shift:
      "When the entire discovery pool is gatekept by college email verification, the game theory changes completely.\n\nEvery single human you swipe on has proven their student enrollment. If someone behaves inappropriately, their verified account can be reported and banned with zero ability to simply create another account with a throwaway phone number.\n\nFurthermore, Campus Match is multi-purpose: students filter not just for dating, but for hackathon co-founders, study partners for tough semesters, and gym buddies.",
    howItWorks: [
      "Opt-in activation: Campus Match is completely isolated from the main feed. You only appear in the deck if you explicitly activate your profile.",
      "Flexible intentionality: Declare your focus — Study Partners, Hackathons & Startups, Friends, or Dating.",
      "Campus radius filtering: Search strictly within your university perimeter, or expand to nearby verified colleges for inter-campus connections.",
      "Mutual-match messaging gate: Neither party can send unsolicited messages until both individuals have swiped right, ensuring zero spam or unsolicited DMs.",
    ],
    proofPoints: [
      "100% verified student pool: Zero outsiders, bots, or fake alumni.",
      "Mutual-match chat unlock: Cold unsolicited messages are physically impossible.",
      "Strict campus reporting: Abusive behavior results in direct loss of verified campus platform privileges.",
    ],
    takeaways: [
      "Verification is the ultimate filter against harassment and catfishing.",
      "College students need connection beyond romance — study buddies, project co-founders, and sport partners.",
      "Mutual opt-in restores respect and balance to student communication.",
    ],
    viralQuote:
      "When everyone in the room has verified their student ID, trust stops being a risk and becomes the baseline.",
    faq: [
      {
        q: "Do I have to use Campus Match if I only want to read campus news?",
        a: "No. Campus Match is a strictly isolated, opt-in feature. If you do not create a dating profile, you will never appear in any student's deck.",
      },
      {
        q: "Can someone outside my university message me?",
        a: "No. Messaging only unlocks if you match with someone, and the entire platform is restricted to verified university students.",
      },
    ],
  },
  {
    slug: "secret-crush",
    title: "Secret Crush Vault",
    tagline: "Solving the game-theory asymmetry of campus crushes with zero-doxxing escrow.",
    category: "Connect",
    readTime: "4 min read",
    description:
      "The Secret Crush Vault lets students register up to five campus crushes in a cryptographic escrow — identities are revealed if and only if interest is mutual, with zero risk of unilateral rejection.",
    keywords: [
      "secret crush",
      "crush matching",
      "mutual crush reveal",
      "game theory social network",
      "zero doxxing escrow",
      "hostel confessions",
    ],
    hook: "Most college crushes die in silence for four years.\n\nNot because people aren't interested, but because confessing feelings in a tight-knit college environment is a terrible game-theoretic bet.\n\nIf you confess and they don't feel the same way, the social cost is catastrophic: awkwardness in lectures, teasing across hostel floors, and permanent embarrassment. So both people stay silent, graduate, and never find out.",
    problem:
      "The traditional campus crush confession is broken by radical risk asymmetry:\n- The confessor takes 100% of the vulnerability and social risk.\n- The recipient takes 0% of the risk.\n- If the interest isn't mutual, the confessor's vulnerability becomes hostel gossip by breakfast.\n\nBecause the penalty for a false positive is so high, students choose to do nothing. Thousands of mutual connections are lost every semester purely to social game theory.",
    shift:
      "An identity escrow eliminates the asymmetry by acting as a zero-knowledge matchmaker.\n\nYou declare your crush privately by adding their verified campus handle to your vault.\nThey receive ZERO notifications.\nNo one knows you added them. Not your friends, not the recipient, not even our frontend.\n\nIf and only if that person independently adds YOUR verified handle to their vault, the system detects the bidirectional match and triggers a simultaneous mutual reveal alert to both inboxes.",
    howItWorks: [
      "Add up to 5 verified crushes: Search by name or verified handle and lock them into your private vault slots.",
      "Zero notification promise: The recipient receives absolutely no ping, email, or indicator that someone added them.",
      "Bidirectional escrow resolution: When both student records contain each other's IDs, the server unlocks a mutual-match event.",
      "Instant private conversation: Both students receive a celebration banner and a direct chat thread unlocks automatically.",
    ],
    proofPoints: [
      "Mathematically zero doxxing: Unilateral selections never leak under any circumstances.",
      "Five-slot limit: Prevents spamming and ensures declarations represent genuine student sentiment.",
      "Real-time revocation: Remove or replace entries at any moment before a mutual match occurs.",
    ],
    takeaways: [
      "Social friction isn't solved by encouragement — it's solved by eliminating the asymmetry of vulnerability.",
      "Zero-knowledge escrow lets students declare intent without risking hostel humiliation.",
      "Mutual matching unlocks relationships that would otherwise have remained buried forever.",
    ],
    viralQuote:
      "You don't lose by confessing. You lose because the game theory was broken. We fixed the math.",
    faq: [
      {
        q: "Will my crush ever know I added them if they don't add me back?",
        a: "Never. The declaration is locked in the escrow table. No notification, email, or badge is ever dispatched for a unilateral declaration.",
      },
      {
        q: "Can I change my 5 crush choices later?",
        a: "Yes. You can edit, remove, or swap any unfilled slot at any time from your private profile settings.",
      },
    ],
  },
  {
    slug: "stories-vibes",
    title: "Stories and Vibes",
    tagline:
      "Eliminating self-censorship by restricting the audience to people who actually live in your hostel.",
    category: "Express",
    readTime: "3 min read",
    description:
      "CampusLoop Stories are 24-hour visual updates with fullscreen interactive viewing, DM replies, and private archiving — shared exclusively with your verified campus peers.",
    keywords: [
      "campus stories",
      "student vibes",
      "24 hour stories",
      "college fest updates",
      "hostel life",
      "student privacy",
    ],
    hook: "Have you ever wanted to post a 2 AM hostel fest video, but stopped yourself because your school teachers, parents, and future LinkedIn recruiters are watching your Instagram stories?\n\nThat is called the Context Collapse.\n\nWhen your social circle spans family, corporate recruiters, school friends, and college batchmates, you are forced to curate a sanitized, artificial version of your life. The real college experience gets erased.",
    problem:
      "Mainstream social networks suffer from severe context collapse:\n1. Self-censorship: Students only post high-gloss, approved moments to avoid judgment from family and employers.\n2. Ephemeral moments disappear into thin air: Mess food disasters, impromptu hostel cricket matches, and fest rehearsals are never documented.\n3. Algorithmic surveillance: Photos posted to public networks are scraped, tracked, and stored indefinitely by third-party data brokers.",
    shift:
      "A stories format thrives when the perimeter is culturally homogeneous.\n\nOn CampusLoop, your stories are seen strictly by verified students of your university. Everyone watching lives in the same hostel wings, eats at the same mess, and battles the same semester exams.\n\nBecause the audience understands the exact cultural context, self-censorship evaporates. Students share raw, authentic, hilarious campus moments without worrying about what a corporate recruiter will think in four years.",
    howItWorks: [
      "Fast camera capture: Upload campus photos or short video clips directly from your phone.",
      "24-hour lifecycle: Media remains visible on the campus top bar for 24 hours, then automatically expires.",
      "Direct message integration: Viewers can reply directly with one tap, initiating a private, verified DM thread.",
      "Private vault archive: Expired stories automatically archive to your personal vault, visible only to you.",
    ],
    proofPoints: [
      "Campus-only perimeter: Stories are completely invisible to search engines and unverified outsiders.",
      "Zero public indexing: Media is distributed through signed short-lived URLs with strict cache expiry.",
      "Private engagement: Like counters and replies are kept strictly between the author and the viewer.",
    ],
    takeaways: [
      "Context collapse kills authenticity. Shared context restores it.",
      "College students need spaces where they can be young and unpolished without lifelong reputational penalties.",
      "Strict 24-hour expiration keeps feeds fresh, spontaneous, and low-pressure.",
    ],
    viralQuote:
      "When you stop posting for corporate recruiters and start posting for your hostel mates, social media becomes fun again.",
    faq: [
      {
        q: "Can outsiders or alumni see my stories?",
        a: "No. Story streams are accessible only to verified students with active enrollment at your university.",
      },
      {
        q: "Can I download my stories after they expire?",
        a: "Yes. All your past stories are permanently accessible in your private story archive, where you can download or republish them at any time.",
      },
    ],
  },
  {
    slug: "marketplace",
    title: "Student Marketplace",
    tagline: "Why buying a ₹2,500 mountain bike on OLX sucks, and how verified peer-to-peer solves it.",
    category: "Utilities",
    readTime: "4 min read",
    description:
      "The CampusLoop marketplace connects verified students for buying and selling cycles, textbooks, drafters, coolers, and electronics — plus official campus canteen and essentials storefronts.",
    keywords: [
      "student marketplace",
      "buy sell college",
      "hostel essentials",
      "second hand cycle",
      "engineering drafter",
      "campus food delivery",
    ],
    hook: "Every May, graduating engineering seniors throw away or sell thousands of perfectly good mountain bikes, room coolers, and drafters for ₹500.\n\nEvery August, incoming freshmen buy the exact same items brand-new from city dealers for ₹6,000.\n\nBetween these two groups is a complete market failure: WhatsApp groups where listings disappear in three minutes, and OLX where random city strangers lowball you, demand your phone number, and ghost you at the gate.",
    problem:
      "Campus commerce fails because existing platforms lack physical proximity and verified identity:\n1. WhatsApp listings vanish: A student posts 'Selling Hero Octane Cycle ₹2,500' in a hostel group, and within twenty minutes it is buried under 300 messages.\n2. The stranger safety hazard: Public classified sites bring random outsiders to campus gates, creating security risks and endless UPI payment scams.\n3. Lack of structured data: No condition tags, no transparent hostel pickup landmarks, no order confirmation.",
    shift:
      "When both the buyer and seller are verified students living within a 500-meter radius, peer commerce becomes nearly frictionless.\n\nOn CampusLoop Marketplace:\n1. Every listing has structured fields: Price in ₹, item condition, batch year, and preferred hostel pickup point (e.g. Hostel 12 Mess / IC Ground).\n2. Both participants have verified institutional reputations: You know you are trading with a real senior, not a scammer from three towns over.\n3. Handoffs happen right on campus: Inspect the cycle, pay directly via UPI, and ride back to your hostel.",
    howItWorks: [
      "Post a listing in 30 seconds: Upload photos, set your price in ₹, choose condition (Brand New / Good / Working), and select your hostel.",
      "Search & filter by category: Filter by Cycles, Coolers & Electronics, Engineering Books & Drafters, and Hostel Gear.",
      "Direct verified chat: Tap 'Chat with Seller' to coordinate a pickup time without exchanging personal phone numbers.",
      "Campus merchant storefronts: Campus canteens and print shops can operate dedicated menus with order tracking.",
    ],
    proofPoints: [
      "100% verified campus traders: Scammers cannot create disposable accounts to defraud students.",
      "Zero transaction fees on peer items: CampusLoop takes zero commission on student-to-student sales.",
      "Hyperlocal landmark pickup: Coordinates handoffs at known campus spots like library lawns or hostel gates.",
    ],
    takeaways: [
      "Proximity + verified identity equals the most efficient circular economy on earth.",
      "Saves students thousands of rupees every semester by preventing unnecessary retail markups.",
      "Keeps personal contact information safe from commercial spam brokers.",
    ],
    viralQuote:
      "Your senior's used cycle isn't trash. It's the cheapest, greenest ride to your 8 AM lecture.",
    faq: [
      {
        q: "Does CampusLoop charge a fee on student sales?",
        a: "No. Peer-to-peer student listings for second-hand gear, textbooks, and hostel supplies are 100% free with zero platform commission.",
      },
      {
        q: "Where do product handoffs take place?",
        a: "Handoffs typically occur at recognizable campus landmarks such as hostel common rooms, library steps, or the student canteen.",
      },
    ],
  },
  {
    slug: "academics-notes",
    title: "Academics and Notes Vault",
    tagline: "Ending the exam-eve panic of begging seniors for Drive links.",
    category: "Utilities",
    readTime: "4 min read",
    description:
      "The Academics Vault aggregates senior-verified notes, solved previous-year question papers (PYQs), formula cheat sheets, and curated study playlists — indexed by subject, branch, and semester.",
    keywords: [
      "engineering notes",
      "PYQ papers",
      "previous year questions",
      "solved question papers",
      "semester notes",
      "BIT Mesra academics",
    ],
    hook: "It is 1:30 AM the night before your Midsem exam.\n\nThe syllabus covers five units of Data Structures. The professor's slides are 300 pages of copied textbook definitions. And the only senior who understood the subject graduated eight months ago.\n\nYou frantically search six WhatsApp groups, click five Google Drive links that return 'Access Denied (404)', and end up studying from a blurry smartphone photo of handwritten notes from 2019.\n\nEvery student has lived this nightmare. Here is how we automated it out of existence.",
    problem:
      "University academic materials suffer from catastrophic distribution friction:\n1. Link rot: Notes live in personal Google Drives that break when seniors delete files or leave college.\n2. Zero discoverability: Finding PYQs for 'Discrete Mathematics Semester 3' requires asking five seniors and hoping someone replies.\n3. Unverified quality: You spend four hours studying a formula sheet only to discover halfway through the exam that it had two fatal mathematical errors.",
    shift:
      "An academic repository works when uploads are indexed by curriculum metadata and upvoted by the peers who passed the exam with them.\n\nOn CampusLoop Academics Vault:\n- Every resource is strictly tagged by University, Branch (CSE/ECE/EE/ME), Semester (1 to 8), and Subject Code.\n- Quality is crowdsourced: Solved PYQs and notes accumulate verified upvotes and comments from students who used them in real exam halls.\n- Top contributors earn Loop Points and public verified badges, creating an incentive for the brightest students to share their work with juniors.",
    howItWorks: [
      "Targeted search: Enter your branch and semester to see all available notes, solved PYQs, and lab manuals organized by unit.",
      "One-click browser preview: Read PDF notes and formula sheets instantly without needing third-party viewer apps.",
      "Study playlists: Curate collections of videos, notes, and solved questions into shared semester playlists.",
      "Upload and earn clout: Upload clean notes or solved papers to earn +20 Loop Points and unlock your campus Verified Star.",
    ],
    proofPoints: [
      "Curriculum-indexed: Organized by exact branch, semester, and course syllabus.",
      "Peer-verified ranking: Upvotes from students who took the exam ensure only high-quality material rises to the top.",
      "Permanent CDN storage: Files are stored on reliable edge infrastructure — no broken Google Drive links.",
    ],
    takeaways: [
      "Decentralized Drive links fail. Centralized, curriculum-indexed academic vaults endure.",
      "Gamifying senior contributions with visible campus clout turns hoarding into sharing.",
      "Cuts exam-prep stress in half by delivering verified PYQs in seconds.",
    ],
    viralQuote: "No student should fail an exam because a senior's Google Drive link returned a 404 at 2 AM.",
    faq: [
      {
        q: "Is there any cost to download notes and PYQ solutions?",
        a: "No. All academic materials uploaded by students and alumni are completely free to read, save, and download for verified students.",
      },
      {
        q: "How do you prevent incorrect or misleading notes?",
        a: "Students upvote, downvote, and comment on every resource. Misleading or incorrect material is swiftly downvoted or flagged for moderation review.",
      },
    ],
  },
  {
    slug: "time-capsule",
    title: "Batch Time Capsule",
    tagline:
      "Why 4 years of college evaporate into lost screenshots (and how cryptographic sealing preserves it).",
    category: "Connect",
    readTime: "3 min read",
    description:
      "The Batch Time Capsule allows student batches to bury predictions, letters, photos, and memories cryptographically sealed until graduation day — with live countdowns and a batch-wide reveal.",
    keywords: [
      "time capsule",
      "batch memories",
      "convocation capsule",
      "student memories",
      "graduation letters",
      "college nostalgia",
    ],
    hook: "In 2021, a freshman engineering batch wrote down their four-year predictions in a Reddit thread: who would get placed at Google, who would drop out to build a startup, and who would marry their first-year crush.\n\nBy 2025, the moderator had deleted the subreddit, the user accounts were deactivated, and every single prediction was lost forever.\n\nFour years of intense, transformative shared history disappeared into digital dust.",
    problem:
      "College memories have no permanent digital archive:\n1. Ephemeral chats: WhatsApp backups fail, phone numbers change, and group chats are abandoned after convocation.\n2. Premature spoilers: If you write a letter to your future self in a shared document, someone inevitably reads it within two weeks.\n3. The convocation void: Graduation is one of the most emotional moments of your life, but students have no shared artifact that captured who they were when they first walked through the campus gates.",
    shift:
      "A digital time capsule requires mathematical permanence and cryptographic sealing.\n\nOn CampusLoop, your batch capsule is sealed until your official Convocation Date:\n- You write predictions, letters to your future batchmates, and upload photos.\n- Once submitted, the entry is locked. No one can read it — not even administrators.\n- A live countdown ticker runs on the campus hub.\n- On Convocation Day, the lock dissolves, and the entire batch opens the capsule together.",
    howItWorks: [
      "Write your prediction or letter: Express your hopes, career dreams, or campus memories for your batch.",
      "Cryptographic lock: Once sealed, entries cannot be edited, previewed, or deleted by anyone.",
      "Live countdown clock: Tracks the days, hours, and minutes remaining until your batch's graduation ceremony.",
      "Collective convocation reveal: The capsule unlocks simultaneously for all batch members on convocation day.",
    ],
    proofPoints: [
      "Cryptographic immutability: Locked entries cannot be decrypted before the unlock timestamp.",
      "Batch-scoped security: Only verified members of your graduating class can access the unlocked archive.",
      "Permanent digital memory: Stored durably so you can revisit your freshman memories years into your career.",
    ],
    takeaways: [
      "The value of a memory increases exponentially with time — if you protect it from premature exposure.",
      "Creates an unforgettable bonding ritual for graduating seniors.",
      "Transforms ephemeral college years into a permanent institutional milestone.",
    ],
    viralQuote:
      "The person you are on day one of college is someone you will miss on day 1,460. The Time Capsule lets you meet them again.",
    faq: [
      {
        q: "Can I edit my submission after sealing the capsule?",
        a: "No. The sealing process is cryptographically final to preserve the authenticity of your original prediction.",
      },
      {
        q: "Who can read my submission when the capsule opens?",
        a: "Only verified members of your graduating batch will be able to browse the opened capsule entries on convocation day.",
      },
    ],
  },
  {
    slug: "loop-points",
    title: "Loop Points and Clout",
    tagline: "Measuring the real heroes of campus: the seniors answering doubts at 2 AM.",
    category: "Trust",
    readTime: "4 min read",
    description:
      "Loop Points (LP) reward genuine campus contribution — helpful answers, verified note uploads, and peer referrals — unlocking visible clout tiers including the coveted Verified Star at 150 LP.",
    keywords: [
      "loop points",
      "campus reputation",
      "student clout",
      "verified star",
      "campus leaderboard",
      "student gamification",
    ],
    hook: "Every college campus has an official hierarchy: CGPA, attendance records, and faculty committees.\n\nAnd every college campus has a real hierarchy: the senior who answers compiler design doubts at 2 AM, the student who shares clean PYQ solutions, and the batchmate who organizes fest logistics.\n\nOfficial systems give these students zero credit. Their contribution is completely invisible. Here is how we turned genuine helpfulness into visible campus clout.",
    problem:
      "Campuses suffer from a severe contribution deficit because helping others has no tangible reward:\n1. The free-rider dilemma: 5% of students do the hard work of summarizing lecture slides, while 95% download them and never say thank you.\n2. Invisible reputation: A freshman has no way of knowing if the senior giving advice is a respected leader or someone who failed three subjects.\n3. Gamification abuse: Traditional karma systems get gamed by meme reposters rather than students creating actual value.",
    shift:
      "Loop Points (LP) tie reputation directly to authentic utility.\n\nYou cannot buy Loop Points.\nYou cannot farm them with spam.\n\nYou earn LP when peers upvote your helpful answers, download your academic notes, or join through your verified referral invite. At 150 LP, you unlock the Verified Star badge — visible across your posts, profile, and chat headers — marking you as an established pillar of your university.",
    howItWorks: [
      "Earn through utility: +20 LP for verified classmate referrals, +10 LP for approved note uploads, +2 LP for upvoted helpful answers.",
      "Progressive tier badges: Climb through Rookie, Campus Insider, Veteran, and Gold Star tiers.",
      "Unlock the 150 LP Verified Star: Earn permanent blue-star clout across your campus timeline.",
      "Campus leaderboards: Track the top contributors of your university each semester.",
    ],
    proofPoints: [
      "Cannot be bought: Clout on CampusLoop represents earned student contribution.",
      "Anti-abuse algorithms: Automated rate limiting prevents sybil upvoting and referral spam.",
      "Localized leaderboards: Small colleges compete fairly within their own campus radius.",
    ],
    takeaways: [
      "Reputation systems work when they measure genuine value delivered to peers.",
      "Public recognition incentivizes top seniors to actively mentor and support incoming batches.",
      "Distinguishes authentic campus leaders from noisy social media influencers.",
    ],
    viralQuote:
      "Your GPA measures how well you remember the textbook. Loop Points measure how much your campus relies on you.",
    faq: [
      {
        q: "Can I transfer or buy Loop Points with real money?",
        a: "No. Loop Points cannot be purchased, traded, or transferred. They are strictly earned through verified positive contributions to your campus.",
      },
      {
        q: "What benefits do I get at 150 Loop Points?",
        a: "Reaching 150 LP permanently unlocks the Verified Star badge on your profile and posts, granting priority ranking and high trust across your university hub.",
      },
    ],
  },
  {
    slug: "communities",
    title: "Sub-Hubs and Communities",
    tagline: "Why joining a robotics club shouldn't mean joining 11 notification nightmares.",
    category: "Connect",
    readTime: "4 min read",
    description:
      "CampusLoop Communities are student-created sub-hubs for clubs, technical societies, hostels, and interests — featuring isolated announcement feeds, event calendars, and role-based permissions.",
    keywords: [
      "student communities",
      "college clubs",
      "campus societies",
      "robotics club",
      "sub hubs",
      "student event planning",
    ],
    hook: "Joining a student club in college should be exciting.\n\nInstead, you get added to four WhatsApp groups ('Announcements', 'Discussions', 'Core Team', 'Random Chat'), two Discord servers with fifty dead channels, and an email list that sends you Google Drive permissions errors.\n\nWithin three weeks, your phone has 1,200 unread messages, your battery is dead by noon, and you end up missing the actual hackathon kickoff meeting.",
    problem:
      "Student organizations run on tools that were never built for campus clubs:\n1. Announcement drowning: The club president posts an urgent room change, and within ten minutes it is buried under twenty people asking 'Is attendance mandatory?'\n2. The exit awkwardness: Leaving a club or changing roles means awkwardly exiting six groups in front of everyone.\n3. Zero public discovery: Freshmen have no centralized directory to discover robotics clubs, debating societies, or music bands.",
    shift:
      "Each community needs a dedicated, structured space with clean role separation.\n\nOn CampusLoop Communities:\n- Every club gets its own sub-hub with a dedicated announcement feed that cannot be spammed.\n- Discussion threads keep conversations organized without blowing up anyone's notifications.\n- Built-in event calendars with one-tap RSVPs ensure students never miss an orientation or workshop.\n- Role-based permissions let chapter leads post official updates while members ask questions in threaded comments.",
    howItWorks: [
      "Discover campus clubs: Browse a centralized directory of verified technical societies, sports teams, and cultural clubs.",
      "One-tap join or apply: Join open circles instantly or submit membership applications configured by club leads.",
      "Pinned official announcements: Urgent updates remain permanently pinned at the top of the sub-hub feed.",
      "Integrated event RSVPs: Track attendance for hackathons, workshops, and auditions with live seat counts.",
    ],
    proofPoints: [
      "Isolated notifications: Community updates stay inside the club hub without spamming personal phones.",
      "Role-based moderation: Chapter heads and coordinators manage announcements and moderate threads.",
      "Discoverable campus directory: Freshmen discover and join active clubs within minutes of arriving on campus.",
    ],
    takeaways: [
      "Clubs need structured feeds and calendar integrations, not chaotic chat groups.",
      "Role-based hierarchies prevent announcement drowning and member burnout.",
      "A centralized directory democratizes club discovery for incoming first-year students.",
    ],
    viralQuote:
      "Running a college club shouldn't feel like managing an air traffic control tower. Communities make coordination seamless.",
    faq: [
      {
        q: "Who can create a community on CampusLoop?",
        a: "Any verified student can create a community for their club, hostel wing, or interest group. Dedicated creation pages provide full role and privacy controls.",
      },
      {
        q: "Can communities be restricted to specific hostels or batches?",
        a: "Yes. Community admins can set privacy settings to Open, Request-to-Join, or restrict membership to specific branches or hostel wings.",
      },
    ],
  },
  {
    slug: "verification-safety",
    title: "Verification and Campus Safety",
    tagline: "Why safety on the internet must be architectural, not a marketing promise.",
    category: "Trust",
    readTime: "5 min read",
    description:
      "CampusLoop safety combines university-email gating, automated keyword & PII scrubbing, one-tap reporting, and schema-enforced anonymity — keeping discussions honest without surveillance.",
    keywords: [
      "student verification",
      "college email verification",
      "campus safety",
      "content moderation",
      "anti harassment",
      "student data privacy",
    ],
    hook: "Trust on the internet is usually a marketing promise in fine print.\n\nOn CampusLoop, trust is an architectural precondition: you cannot enter without proving you belong.\n\nOpen social networks fail on campuses because their business model depends on unverified pageviews. The more trolls, spam accounts, and outside creeps on their platform, the more ads they show. We inverted the model.",
    problem:
      "Open student apps create an economic asymmetry that guarantees harassment:\n1. Cost of account creation is zero: If a bad actor is banned on an open platform, they make a new email in 30 seconds and return immediately.\n2. Outsider surveillance: Commercial coaching institutes, predatory recruiters, and random strangers monitor student discussions.\n3. The surveillance trap: The alternative — college-run forums — monitor students so heavily that anyone who complains about poor facilities risks getting expelled.",
    shift:
      "Verification at the gate radically shifts the economics of campus safety:\n\n1. High cost of bad behavior: Creating a new account requires a legitimate, active student inbox at that specific university. If you get banned for harassment, you cannot simply create another account. You are permanently banned.\n2. Defense-in-depth moderation: Automated real-time keyword analysis flags toxic speech and doxxing patterns before publication.\n3. Privacy-preserving architecture: You are safe from institutional retaliation because anonymous confessions have zero database linkages to your profile.",
    howItWorks: [
      "Gatekeeping at the perimeter: Single-use OTP sent to institutional (.ac.in / .edu.in) domain.",
      "Real-time safety engine: Automated regex and NLP scanners detect hate speech, doxxing, and self-harm keywords.",
      "One-tap community moderation: Posts flagged by multiple verified classmates are automatically queued for rapid admin review.",
      "Per-user privacy controls: Block, mute, and report controls are accessible in one click across all timelines and chats.",
    ],
    proofPoints: [
      "Institutional gating: Eliminates 100% of external bots and predatory outsiders.",
      "Zero SQL foreign keys on anonymous content: Protects students from institutional retaliation.",
      "Irrevocable bans: Banned accounts cannot be recreated using throwaway phone numbers or Gmails.",
    ],
    takeaways: [
      "Safety is an architectural problem, not a policy checkbox.",
      "High barriers to account recreation permanently eliminate repeat bad actors.",
      "Students can speak the truth safely when identity is protected by database architecture rather than human promises.",
    ],
    viralQuote:
      "When the cost of creating an account is high, the cost of being a bad actor becomes unaffordable. That is real safety.",
    faq: [
      {
        q: "What if my university doesn't provide student email addresses?",
        a: "Students from colleges without institutional domains can request a manual verification pilot by uploading an official student ID card through our secure verification queue.",
      },
      {
        q: "Does CampusLoop sell student data to advertisers?",
        a: "Never. CampusLoop does not sell student data, personal information, or reading habits to third-party advertisers or data brokers.",
      },
    ],
  },
  {
    slug: "design-system",
    title: "Twitter / X Design System",
    tagline: "Why we killed the clown UI and rebuilt CampusLoop on pure high-contrast OLED architecture.",
    category: "Express",
    readTime: "4 min read",
    description:
      "A deep dive into the CampusLoop design system: pure OLED black canvases, Twitter blue (#1D9BF0) tokens, hairline borders, clean profile architecture, and zero-compromise scanability.",
    keywords: [
      "CampusLoop design system",
      "Twitter design system",
      "X visual architecture",
      "OLED dark mode",
      "student profile UX",
      "clean campus UI",
    ],
    hook: "Most campus apps look like a 2012 theme park: clashing rainbow tags, neon purple glow rings, raw emoji spam, and cramped cards where content suffocates.\n\nStudents don't share apps that look like kindergarten projects. They share platforms that look like Bloomberg terminals or Twitter: crisp, authoritative, fast, and relentlessly premium.\n\nHere is why we deleted every clown gradient and unified CampusLoop on the Twitter / X design architecture.",
    problem:
      "When digital products lack design discipline, four catastrophic failures happen:\n1. The Joker UI trap: Clustering five uncoordinated badge colors (amber + teal + purple + rose + emerald) on a single profile turns serious student credentials into clip-art noise.\n2. Squished hierarchy: Cramming avatars, bios, and action buttons into cramped flexboxes destroys readability on mobile screens.\n3. The fake-sheen illusion: Adding neon dropshadows and rainbow progress bars gives the illusion of design but screams low credibility to recruiters and founders.\n4. Vanity share paralysis: Students refuse to put an amateur-looking profile URL in their Twitter bio, LinkedIn headline, or resume.",
    shift:
      "We rebuilt our entire frontend from first principles around the Twitter / X specification:\n\nFirst, True OLED Black (#000000): Deep black canvases with hairline borders (#2F3336) replace heavy nested cards. Content is the sole hero.\n\nSecond, Signature Twitter Blue (#1D9BF0): We eliminated garish neon purple in favor of verified Twitter blue for badges, links, active tab bars, and progress indicators.\n\nThird, The Full-Width Profile Architecture: Cover banner (3:1), overlapping 96px circular avatar with online status, full-width bio with natural line height, standard metadata row (college, degree, location, joined date), and high-contrast follow buttons.\n\nFourth, Monochromatic Topic Discipline: Interest tags are rendered in subtle neutral tokens that illuminate on hover rather than shouting in rainbow neon.",
    howItWorks: [
      "Strict CSS token pipeline: All colors map through CSS custom variables (--primary, --background, --foreground, --border, --muted) in globals.css.",
      "Twitter action toolbar: High-contrast pill follow button (bg-foreground text-background), circular direct message icon, and subtle secret crush trigger.",
      "Clean Clout progress: Single-tone #1D9BF0 progress bars replace multi-colored rainbow gradients.",
      "Zero raw emojis: All iconography is strictly powered by Lucide SVG primitives and custom smooth micro-animations.",
    ],
    proofPoints: [
      "Sub-16ms render times: Eliminating heavy CSS blur filters and gradients cut layout shifts to zero.",
      "Share-ready profiles: Student profiles at /@username look as authoritative as an executive Twitter profile.",
      "Zero UI clutter: Maximum screen real estate dedicated to verified student thoughts, notes, and discussions.",
    ],
    takeaways: [
      "Content is the hero. If a border or gradient calls attention to itself, it has failed.",
      "High-contrast OLED minimalism gives student networks institutional credibility.",
      "Great design is not adding more colors; it is removing every color until only what matters remains.",
    ],
    viralQuote:
      "Great software looks quiet so the humans using it can be heard. Build with high contrast, hairline dividers, and zero clown colors.",
    faq: [
      {
        q: "Why did you switch from neon purple to Twitter blue (#1D9BF0)?",
        a: "Twitter blue (#1D9BF0) is the global benchmark for verified digital identity and speed. It provides superior contrast against OLED black canvases without inducing eye strain.",
      },
      {
        q: "Can students still customize their profile appearance?",
        a: "Yes. Students can upload custom high-resolution cover banners, customize their avatar, write Markdown-rich bios, and link their GitHub, LinkedIn, and personal portfolios.",
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
