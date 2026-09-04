"use client";

import {
  ArrowRight,
  BadgeCheck,
  BarChart2,
  Bike,
  Bookmark,
  Check,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Share2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

// ── Curated Real Indian Campus Datasets ──
const CAMPUSES = [
  {
    id: "bit-mesra",
    name: "BIT Mesra",
    short: "BITM",
    city: "Ranchi",
    activeCount: "4,280",
    confession: {
      author: "Anonymous Student",
      handle: "@anon_bit98",
      time: "2h",
      text: "The IC ground winter fog at 2 AM with hot chai from the back gate canteen hits completely different than any cafe in the city...",
      likes: 318,
      reposts: 54,
      replies: 47,
      views: "2.4K",
      topic: "#canteen-vibes",
    },
    poll: {
      author: "Gymkhana Pollster",
      handle: "@gymkhana_bits",
      time: "4h",
      question: "Which late-night canteen spot actually deserves your money?",
      options: [
        { id: "nescafe", text: "Nescafe booth by R&D", votes: 340 },
        { id: "sharma", text: "Sharma Ji juice corner", votes: 210 },
        { id: "mess", text: "Main Mess (night counter)", votes: 95 },
      ],
      likes: 184,
      reposts: 39,
      replies: 28,
      views: "1.9K",
    },
    match: {
      name: "Sneha R.",
      handle: "@sneha_ece",
      time: "1h",
      branch: "BIT Mesra · ECE '26",
      bio: "Looking for someone to grab late-night chai and jam at fest soundchecks 🎸☕",
      tags: ["Indie Rock", "Chai Addict", "Hackathons"],
      compatibility: 96,
      likes: 92,
      reposts: 12,
      replies: 16,
      views: "890",
    },
    market: {
      author: "Hostel 10 Senior",
      handle: "@hostel10_gear",
      time: "5h",
      item: "Hero Sprint 21-Speed Cycle",
      price: "₹3,100",
      desc: "Mint condition, dual disc brakes, tuned gears. Leaving campus post-placement.",
      seller: "Hostel 10 · Verified Senior",
      likes: 45,
      reposts: 19,
      replies: 8,
      views: "1.1K",
    },
  },
  {
    id: "iit-delhi",
    name: "IIT Delhi",
    short: "IITD",
    city: "New Delhi",
    activeCount: "6,920",
    confession: {
      author: "Anonymous Student",
      handle: "@anon_iitd44",
      time: "1h",
      text: "Library 2nd floor AC is literally set to North Pole temperatures. Studying microprocessors in a puffer jacket in May 😭",
      likes: 426,
      reposts: 88,
      replies: 62,
      views: "4.1K",
      topic: "#midsems",
    },
    poll: {
      author: "Hostel Rep",
      handle: "@iitd_eats",
      time: "3h",
      question: "Best late-night food rescue around campus?",
      options: [
        { id: "sda", text: "SDA Market Kathi Rolls", votes: 412 },
        { id: "nilgiri", text: "Nilgiri Night Canteen", votes: 328 },
        { id: "redsq", text: "Red Square Maggi Point", votes: 144 },
      ],
      likes: 240,
      reposts: 61,
      replies: 42,
      views: "3.2K",
    },
    match: {
      name: "Aarav K.",
      handle: "@aarav_cse",
      time: "30m",
      branch: "IIT Delhi · CSE '25",
      bio: "Indie rock fanatic, building distributed agents. Looking for midnight campus walks 🎧☕",
      tags: ["AI Agents", "Tame Impala", "Night Walks"],
      compatibility: 94,
      likes: 120,
      reposts: 18,
      replies: 23,
      views: "1.4K",
    },
    market: {
      author: "Girnar Resident",
      handle: "@girnar_calc",
      time: "2h",
      item: "Casio fx-991CW Calculator",
      price: "₹750",
      desc: "Brand new condition, used for 2 math midsems. Clean screen with original flip case.",
      seller: "Girnar Hostel · Verified Student",
      likes: 31,
      reposts: 11,
      replies: 5,
      views: "980",
    },
  },
  {
    id: "bits-pilani",
    name: "BITS Pilani",
    short: "BITS",
    city: "Pilani",
    activeCount: "5,400",
    confession: {
      author: "Anonymous Student",
      handle: "@anon_bits12",
      time: "3h",
      text: "0% attendance policy is supreme bliss until comprehensive exams arrive and you realize you don't even know which room the exam is in 💀",
      likes: 512,
      reposts: 114,
      replies: 89,
      views: "5.6K",
      topic: "#compro-scare",
    },
    poll: {
      author: "Pilani Night Owl",
      handle: "@bits_nightowl",
      time: "6h",
      question: "Where are we eating at 3:30 AM tonight?",
      options: [
        { id: "anc", text: "ANC (All Night Canteen)", votes: 489 },
        { id: "cblock", text: "C-Block Egg Rolls", votes: 275 },
        { id: "mess", text: "Hostel Maggi in kettle", votes: 110 },
      ],
      likes: 305,
      reposts: 72,
      replies: 55,
      views: "3.8K",
    },
    match: {
      name: "Tanvi M.",
      handle: "@tanvi_bits",
      time: "4h",
      branch: "BITS Pilani · Eco+CS '25",
      bio: "Post-compro roadtrip planning, 35mm film photography, and debate over Oasis fest 📸🎸",
      tags: ["35mm Film", "Chemex Coffee", "Oasis Fest"],
      compatibility: 98,
      likes: 145,
      reposts: 26,
      replies: 34,
      views: "2.1K",
    },
    market: {
      author: "Shankar Bhawan Junior",
      handle: "@shankar_dorm",
      time: "7h",
      item: "Dorm Mini Refrigerator (45L)",
      price: "₹3,600",
      desc: "Silent compressor, keeps cold brew & energy drinks ice cold. Passing to juniors.",
      seller: "Shankar Bhawan · Verified Student",
      likes: 67,
      reposts: 24,
      replies: 15,
      views: "1.7K",
    },
  },
  {
    id: "vit-vellore",
    name: "VIT Vellore",
    short: "VIT",
    city: "Vellore",
    activeCount: "8,150",
    confession: {
      author: "Anonymous Student",
      handle: "@anon_vit77",
      time: "50m",
      text: "The 8:29 PM hostel biometric in-time sprint across the SJT footbridge is an Olympic-tier cardio endurance test 🏃‍♂️💨",
      likes: 640,
      reposts: 142,
      replies: 104,
      views: "6.8K",
      topic: "#vit-in-time",
    },
    poll: {
      author: "SJT Explorer",
      handle: "@vit_foodie",
      time: "2h",
      question: "Which spot has the best post-class refreshment?",
      options: [
        { id: "darling", text: "Darling Canteen Ice Tea", votes: 520 },
        { id: "enzzo", text: "Enzzo Coffee Corner", votes: 345 },
        { id: "fc", text: "Food Court Milkshakes", votes: 210 },
      ],
      likes: 380,
      reposts: 95,
      replies: 67,
      views: "4.5K",
    },
    match: {
      name: "Ananya S.",
      handle: "@ananya_vit",
      time: "3h",
      branch: "VIT Vellore · Biotech '26",
      bio: "Riviera fest organizer, badminton enthusiast, and obsessed with late-night SJT discussions 🏸✨",
      tags: ["Riviera Fest", "Badminton", "Biotech"],
      compatibility: 97,
      likes: 180,
      reposts: 31,
      replies: 42,
      views: "2.8K",
    },
    market: {
      author: "M-Block Resident",
      handle: "@mblock_notes",
      time: "4h",
      item: "Ergonomic Mesh Study Chair",
      price: "₹1,800",
      desc: "High lumbar support, breathable back mesh. Perfect for marathon CAT prep.",
      seller: "M-Block Hostel · Verified Student",
      likes: 52,
      reposts: 18,
      replies: 9,
      views: "1.3K",
    },
  },
  {
    id: "iit-bombay",
    name: "IIT Bombay",
    short: "IITB",
    city: "Mumbai",
    activeCount: "5,830",
    confession: {
      author: "Anonymous Student",
      handle: "@anon_iitb91",
      time: "1h",
      text: "Sameer Hill sunrise after pulling an all-nighter for semester lab report is the only free therapy available on this campus.",
      likes: 489,
      reposts: 98,
      replies: 76,
      views: "4.9K",
      topic: "#moodindigo",
    },
    poll: {
      author: "SAC Council",
      handle: "@iitb_canteen",
      time: "5h",
      question: "Best canteen on the Powai campus?",
      options: [
        { id: "h12", text: "Hostel 12 Famous Canteen", votes: 490 },
        { id: "brewberrys", text: "Brewberrys Cafe by SAC", votes: 310 },
        { id: "gulmohar", text: "Gulmohar Veg Thali", votes: 135 },
      ],
      likes: 290,
      reposts: 64,
      replies: 38,
      views: "3.4K",
    },
    match: {
      name: "Rohan M.",
      handle: "@rohan_mech",
      time: "2h",
      branch: "IIT Bombay · Mech '25",
      bio: "Mood Indigo backstage crew, cycling around Powai lake, and building electric powertrain karts 🏎️",
      tags: ["Formula Student", "Powai Cycling", "Techno"],
      compatibility: 95,
      likes: 135,
      reposts: 22,
      replies: 29,
      views: "1.8K",
    },
    market: {
      author: "Hostel 16 Tech",
      handle: "@h16_gears",
      time: "6h",
      item: "Heavy Kryptonite U-Lock",
      price: "₹850",
      desc: "Heavy duty bicycle lock, hardened steel. Never worry about cycle theft at SAC again.",
      seller: "Hostel 16 · Verified Student",
      likes: 38,
      reposts: 14,
      replies: 7,
      views: "1.0K",
    },
  },
] as const;

type ArtifactMode = "confession" | "poll" | "match" | "market";

const TABS: { id: ArtifactMode; label: string }[] = [
  { id: "confession", label: "Confessions" },
  { id: "poll", label: "Polls" },
  { id: "match", label: "Matches" },
  { id: "market", label: "Marketplace" },
];

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export function CreativeHero({ isAuthenticated }: { isAuthenticated: boolean }) {
  // Selected Campus
  const [selectedCampusIndex, setSelectedCampusIndex] = useState(0);
  const campus = CAMPUSES[selectedCampusIndex];

  // Active Tab
  const [activeTab, setActiveTab] = useState<ArtifactMode>("confession");

  // Interactive Poll
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null);
  const [pollOptions, setPollOptions] = useState<PollOption[]>(() =>
    campus.poll.options.map((opt) => ({ id: opt.id, text: opt.text, votes: opt.votes }))
  );

  // Interactive Tweet Actions (Like, Repost, Bookmark)
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState<number>(campus.confession.likes);
  const [isReposted, setIsReposted] = useState(false);
  const [repostCount, setRepostCount] = useState<number>(campus.confession.reposts);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Interactive Match / Market
  const [isVibeSent, setIsVibeSent] = useState(false);
  const [isOfferMade, setIsOfferMade] = useState(false);

  // Reset states when switching campus or tab
  useEffect(() => {
    setPollOptions(campus.poll.options.map((opt) => ({ ...opt })));
    setVotedOptionId(null);
    setIsLiked(false);
    setIsReposted(false);
    setIsBookmarked(false);
    setIsVibeSent(false);
    setIsOfferMade(false);

    if (activeTab === "confession") {
      setLikeCount(campus.confession.likes);
      setRepostCount(campus.confession.reposts);
    } else if (activeTab === "poll") {
      setLikeCount(campus.poll.likes);
      setRepostCount(campus.poll.reposts);
    } else if (activeTab === "match") {
      setLikeCount(campus.match.likes);
      setRepostCount(campus.match.reposts);
    } else {
      setLikeCount(campus.market.likes);
      setRepostCount(campus.market.reposts);
    }
  }, [campus, activeTab]);

  // Handle Poll Vote
  function handleVote(optionId: string) {
    if (votedOptionId) return;
    sounds.ting();
    haptics.medium();
    setVotedOptionId(optionId);
    setPollOptions((prev) =>
      prev.map((opt) => (opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt))
    );
  }

  // Handle Like Toggle
  function handleLikeToggle() {
    sounds.pop();
    haptics.light();
    setIsLiked((prev) => {
      const next = !prev;
      setLikeCount((c) => (next ? c + 1 : c - 1));
      return next;
    });
  }

  // Handle Repost Toggle
  function handleRepostToggle() {
    sounds.ting();
    haptics.medium();
    setIsReposted((prev) => {
      const next = !prev;
      setRepostCount((c) => (next ? c + 1 : c - 1));
      return next;
    });
  }

  // Handle Bookmark Toggle
  function handleBookmarkToggle() {
    sounds.pop();
    haptics.light();
    setIsBookmarked((prev) => !prev);
  }

  // Handle Match Vibe
  function handleSendVibe() {
    sounds.ting();
    haptics.match();
    setIsVibeSent((prev) => !prev);
  }

  // Handle Market Offer
  function handleMakeOffer() {
    sounds.pop();
    haptics.light();
    setIsOfferMade((prev) => !prev);
  }

  const totalVotes = pollOptions.reduce((sum, o) => sum + o.votes, 0);

  // Active item details for current tab
  const getTabHeader = () => {
    switch (activeTab) {
      case "confession":
        return {
          author: campus.confession.author,
          handle: campus.confession.handle,
          time: campus.confession.time,
          replies: campus.confession.replies,
          views: campus.confession.views,
        };
      case "poll":
        return {
          author: campus.poll.author,
          handle: campus.poll.handle,
          time: campus.poll.time,
          replies: campus.poll.replies,
          views: campus.poll.views,
        };
      case "match":
        return {
          author: campus.match.name,
          handle: campus.match.handle,
          time: campus.match.time,
          replies: campus.match.replies,
          views: campus.match.views,
        };
      case "market":
        return {
          author: campus.market.author,
          handle: campus.market.handle,
          time: campus.market.time,
          replies: campus.market.replies,
          views: campus.market.views,
        };
    }
  };

  const currentHeader = getTabHeader();

  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-x-clip">
      <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
        {/* ──────── LEFT COLUMN: Twitter-Style Clean Minimal Typography (2 Colors Max) ──────── */}
        <div className="flex flex-col items-start text-left space-y-6 lg:col-span-6">
          {/* Twitter-style pill label: strictly text-foreground and text-muted-foreground */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/30 px-3.5 py-1 text-xs font-semibold text-muted-foreground">
            <span className="size-1.5 rounded-full bg-foreground" />
            <span className="text-foreground font-bold">1,350+ COLLEGES</span>
            <span>·</span>
            <span>VERIFIED STUDENT NETWORK</span>
          </div>

          {/* Twitter-Inspired Headline (2 solid tones: pure white foreground & muted-foreground) */}
          <h1 className="text-4xl sm:text-6xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.05] text-foreground">
            Your campus.
            <br />
            <span className="text-muted-foreground font-bold">Verified &amp; unfiltered.</span>
          </h1>

          {/* Minimal 2-color Subtitle */}
          <p className="max-w-lg text-base sm:text-lg leading-relaxed text-muted-foreground font-normal">
            The private collegiate network for Indian students. Spill anonymous confessions safely, settle
            midnight canteen polls, match with peers, and trade dorm gear — gated strictly by your{" "}
            <span className="font-semibold text-foreground">college email</span>.
          </p>

          {/* Twitter-Style Action Buttons: Full-width on mobile, rounded-full */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full pt-1">
            {isAuthenticated ? (
              <Link
                href="/app"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full bg-foreground px-8 text-[15px] font-bold text-background transition-all hover:opacity-90 active:scale-98"
              >
                <span>Enter Campus Feed</span>
                <ArrowRight className="ml-2 size-4" />
              </Link>
            ) : (
              <Link
                href="/handler/sign-up"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full bg-foreground px-8 text-[15px] font-bold text-background transition-all hover:opacity-90 active:scale-98"
              >
                <span>Get verified with college email</span>
                <ArrowRight className="ml-2 size-4" />
              </Link>
            )}

            <Link
              href="/colleges"
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full border border-border/80 bg-transparent px-6 text-[15px] font-bold text-foreground transition-all hover:bg-muted/50 active:scale-98"
            >
              <span>Explore 1,350+ Hubs</span>
            </Link>
          </div>

          {/* Twitter-style terms / viewer mode note */}
          {!isAuthenticated && (
            <p className="text-xs text-muted-foreground">
              By joining, you verify your student status.{" "}
              <Link
                href="/handler/sign-up"
                className="font-semibold text-foreground underline underline-offset-2 hover:opacity-80"
              >
                Viewer mode
              </Link>{" "}
              available for college aspirants.
            </p>
          )}

          {/* Minimal Trust Checklist (2 colors max: text-foreground for checkmarks, text-muted-foreground for text) */}
          <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-1.5">
              <Check className="size-3.5 text-foreground shrink-0" />
              <span>100% Student Verified</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1.5">
              <Check className="size-3.5 text-foreground shrink-0" />
              <span>Zero-Doxxing Escrow</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1.5">
              <Check className="size-3.5 text-foreground shrink-0" />
              <span>No Outsiders</span>
            </div>
          </div>
        </div>

        {/* ──────── RIGHT COLUMN: Twitter / X UI Tweet Card ──────── */}
        <div className="lg:col-span-6 w-full max-w-lg mx-auto lg:max-w-none">
          <div className="rounded-2xl sm:rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md shadow-2xl overflow-hidden transition-all">
            {/* Campus Selector Bar (Clean Twitter-style pill switcher) */}
            <div className="flex items-center justify-between gap-2 px-4 pt-3.5 pb-2.5 border-b border-border/40">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-[260px] sm:max-w-none">
                {CAMPUSES.map((c, index) => {
                  const isSelected = selectedCampusIndex === index;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        sounds.tap();
                        haptics.light();
                        setSelectedCampusIndex(index);
                      }}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0",
                        isSelected
                          ? "bg-foreground text-background"
                          : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted/70 border border-border/40"
                      )}
                    >
                      {c.short}
                    </button>
                  );
                })}
              </div>

              {/* Online Presence Count in strict 2-color text */}
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground shrink-0">
                <span className="size-2 rounded-full bg-foreground" />
                <span>{campus.activeCount} active</span>
              </div>
            </div>

            {/* Twitter-style Tab Navigation (With active bottom border line) */}
            <div className="flex items-center border-b border-border/40 px-2 sm:px-4">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      sounds.tap();
                      haptics.light();
                      setActiveTab(tab.id);
                    }}
                    className={cn(
                      "flex-1 py-3 text-xs sm:text-sm font-semibold transition-all relative cursor-pointer text-center",
                      isActive ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span>{tab.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="twitter-tab-indicator"
                        className="absolute bottom-0 inset-x-3 h-[3px] rounded-full bg-foreground"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* ─── Tweet Post Body (Authentic Twitter Layout) ─── */}
            <div className="p-4 sm:p-5">
              <div className="flex items-start gap-3">
                {/* Author Avatar (Twitter Circular Style) */}
                <div className="size-10 rounded-full border border-border/80 bg-muted/40 flex items-center justify-center shrink-0 text-xs font-black text-foreground">
                  {activeTab === "confession"
                    ? "🎭"
                    : activeTab === "poll"
                      ? "📊"
                      : activeTab === "match"
                        ? "💘"
                        : "🚲"}
                </div>

                {/* Tweet Main Content */}
                <div className="flex-1 min-w-0">
                  {/* Tweet Header Line */}
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                      <span className="font-bold text-foreground text-sm truncate">
                        {currentHeader.author}
                      </span>
                      <BadgeCheck className="size-4 text-foreground shrink-0 fill-foreground/10" />
                      <span className="text-muted-foreground text-xs truncate">{currentHeader.handle}</span>
                      <span className="text-muted-foreground text-xs">·</span>
                      <span className="text-muted-foreground text-xs">{currentHeader.time}</span>
                    </div>

                    <button
                      type="button"
                      aria-label="More options"
                      className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                  </div>

                  {/* Campus Tag Pill */}
                  <div className="pt-0.5 pb-2">
                    <span className="text-[11px] font-semibold text-muted-foreground">{campus.name} Hub</span>
                  </div>

                  {/* Tweet Body Content (Per Tab) */}
                  <AnimatePresence mode="wait">
                    {/* 1. CONFESSION TWEET */}
                    {activeTab === "confession" && (
                      <motion.div
                        key={`confession-${campus.id}`}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-3"
                      >
                        <p className="text-sm sm:text-[15px] leading-relaxed text-foreground font-normal">
                          {campus.confession.text}
                        </p>
                        <p className="text-xs font-semibold text-foreground hover:underline cursor-pointer">
                          {campus.confession.topic}
                        </p>
                      </motion.div>
                    )}

                    {/* 2. POLL TWEET (Twitter-Style Poll Bars) */}
                    {activeTab === "poll" && (
                      <motion.div
                        key={`poll-${campus.id}`}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-3"
                      >
                        <p className="text-sm sm:text-[15px] leading-relaxed text-foreground font-semibold">
                          {campus.poll.question}
                        </p>

                        <div className="space-y-2 pt-1">
                          {pollOptions.map((opt) => {
                            const pct = Math.round((opt.votes / totalVotes) * 100);
                            const isVoted = votedOptionId === opt.id;
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleVote(opt.id)}
                                className={cn(
                                  "group relative w-full overflow-hidden rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[40px]",
                                  isVoted
                                    ? "border-foreground bg-muted/40"
                                    : "border-border/60 bg-muted/20 hover:border-border/90 hover:bg-muted/40"
                                )}
                              >
                                {votedOptionId && (
                                  <div
                                    className="absolute inset-y-0 left-0 bg-foreground/15 -z-10 transition-all duration-500"
                                    style={{ width: `${pct}%` }}
                                  />
                                )}
                                <div className="flex items-center justify-between px-3.5 py-2">
                                  <span
                                    className={cn(
                                      "truncate",
                                      isVoted ? "text-foreground font-bold" : "text-foreground"
                                    )}
                                  >
                                    {opt.text}
                                  </span>
                                  {votedOptionId && (
                                    <span className="font-mono text-xs font-bold text-foreground ml-2">
                                      {pct}%
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <p className="text-xs text-muted-foreground pt-1">
                          {totalVotes} verified votes · {votedOptionId ? "Final results" : "Live campus poll"}
                        </p>
                      </motion.div>
                    )}

                    {/* 3. MATCH TWEET (Quote-Tweet Card Style) */}
                    {activeTab === "match" && (
                      <motion.div
                        key={`match-${campus.id}`}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-3"
                      >
                        <div className="rounded-2xl border border-border/80 bg-muted/20 p-3.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground text-sm">{campus.match.name}</span>
                            <span className="text-xs font-bold text-foreground border border-border/60 rounded-full px-2 py-0.5">
                              {campus.match.compatibility}% match
                            </span>
                          </div>

                          <p className="text-xs text-muted-foreground">{campus.match.branch}</p>

                          <p className="text-xs sm:text-sm text-foreground italic">
                            &ldquo;{campus.match.bio}&rdquo;
                          </p>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {campus.match.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-border/60 bg-card px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground"
                              >
                                #{tag.replace(/\s+/g, "")}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-muted-foreground">Verified student connection</span>
                          <button
                            type="button"
                            onClick={handleSendVibe}
                            className={cn(
                              "rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer",
                              isVibeSent
                                ? "bg-foreground text-background"
                                : "border border-border/80 bg-muted/40 text-foreground hover:bg-muted/70"
                            )}
                          >
                            {isVibeSent ? "Vibe Sent! 💌" : "Send Vibe"}
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* 4. MARKETPLACE TWEET (Attachment Card Style) */}
                    {activeTab === "market" && (
                      <motion.div
                        key={`market-${campus.id}`}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-3"
                      >
                        <div className="rounded-2xl border border-border/80 bg-muted/20 p-3.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Bike className="size-4 text-foreground" />
                              <span className="font-bold text-foreground text-sm">{campus.market.item}</span>
                            </div>
                            <span className="text-sm font-black text-foreground">{campus.market.price}</span>
                          </div>

                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {campus.market.desc}
                          </p>

                          <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs text-muted-foreground">
                            <span>{campus.market.seller}</span>
                            <span className="font-semibold text-foreground">Campus handoff</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-muted-foreground">1-Tap Student Escrow</span>
                          <button
                            type="button"
                            onClick={handleMakeOffer}
                            className={cn(
                              "rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer",
                              isOfferMade
                                ? "bg-foreground text-background"
                                : "border border-border/80 bg-muted/40 text-foreground hover:bg-muted/70"
                            )}
                          >
                            {isOfferMade ? "Offer Sent! ⚡" : "Make ₹ Offer"}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ─── Twitter Tweet Action Bar (Reply, Repost, Like, View, Bookmark, Share) ─── */}
                  <div className="flex items-center justify-between pt-4 mt-2 border-t border-border/40 text-muted-foreground text-xs">
                    {/* Reply */}
                    <button
                      type="button"
                      className="group flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer"
                    >
                      <div className="p-1.5 rounded-full group-hover:bg-muted/40 transition-colors">
                        <MessageCircle className="size-4" />
                      </div>
                      <span>{currentHeader.replies}</span>
                    </button>

                    {/* Repost (Interactive) */}
                    <button
                      type="button"
                      onClick={handleRepostToggle}
                      className={cn(
                        "group flex items-center gap-1.5 transition-colors cursor-pointer",
                        isReposted ? "text-foreground font-bold" : "hover:text-foreground"
                      )}
                    >
                      <div className="p-1.5 rounded-full group-hover:bg-muted/40 transition-colors">
                        <Repeat2 className="size-4" />
                      </div>
                      <span>{repostCount}</span>
                    </button>

                    {/* Like (Interactive) */}
                    <button
                      type="button"
                      onClick={handleLikeToggle}
                      className={cn(
                        "group flex items-center gap-1.5 transition-colors cursor-pointer",
                        isLiked ? "text-foreground font-bold" : "hover:text-foreground"
                      )}
                    >
                      <div className="p-1.5 rounded-full group-hover:bg-muted/40 transition-colors">
                        <Heart className={cn("size-4", isLiked && "fill-foreground text-foreground")} />
                      </div>
                      <span>{likeCount}</span>
                    </button>

                    {/* Views */}
                    <div className="hidden sm:flex items-center gap-1.5">
                      <div className="p-1.5">
                        <BarChart2 className="size-4" />
                      </div>
                      <span>{currentHeader.views}</span>
                    </div>

                    {/* Bookmark & Share */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleBookmarkToggle}
                        aria-label="Bookmark post"
                        className={cn(
                          "p-1.5 rounded-full hover:bg-muted/40 transition-colors cursor-pointer",
                          isBookmarked ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Bookmark className={cn("size-4", isBookmarked && "fill-foreground")} />
                      </button>
                      <button
                        type="button"
                        aria-label="Share post"
                        className="p-1.5 rounded-full hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        <Share2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
