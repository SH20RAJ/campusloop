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
      {/* ─── Ambient Radiant Multi-Color Campus Glow ─── */}
      <div className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 w-[720px] h-[420px] bg-gradient-to-tr from-violet-500/20 via-rose-500/15 to-sky-500/15 blur-[120px] rounded-full -z-10" />
      <div className="pointer-events-none absolute top-1/2 right-10 -translate-y-1/2 w-[350px] h-[350px] bg-gradient-to-bl from-amber-500/10 via-pink-500/10 to-indigo-500/15 blur-[100px] rounded-full -z-10" />

      <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
        {/* ──────── LEFT COLUMN: Rich Brand Typography with Vibrant Primary Color ──────── */}
        <div className="flex flex-col items-start text-left space-y-6 lg:col-span-6">
          {/* Pill label with lively colors & pulsing indicator */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 dark:bg-primary/15 px-3.5 py-1 text-xs font-semibold text-foreground shadow-sm shadow-primary/10">
            <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
            <span className="text-primary font-black">1,350+ COLLEGES</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-foreground/80 font-medium">VERIFIED STUDENT NETWORK</span>
          </div>

          {/* Primary Gradient Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.05] text-foreground">
            Your campus.
            <br />
            <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-sm">
              Verified &amp; unfiltered.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-lg text-base sm:text-lg leading-relaxed text-muted-foreground font-normal">
            The private collegiate network for Indian students. Spill anonymous confessions safely, settle
            midnight canteen polls, match with peers, and trade dorm gear — gated strictly by your{" "}
            <span className="font-semibold text-primary">college email</span>.
          </p>

          {/* Primary Gradient Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full pt-1">
            {isAuthenticated ? (
              <Link
                href="/app"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full bg-gradient-to-r from-violet-600 via-primary to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-8 text-[15px] font-bold text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all active:scale-98 cursor-pointer"
              >
                <span>Enter Campus Feed</span>
                <ArrowRight className="ml-2 size-4" />
              </Link>
            ) : (
              <Link
                href="/handler/sign-up"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full bg-gradient-to-r from-violet-600 via-primary to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-8 text-[15px] font-bold text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 transition-all active:scale-98 cursor-pointer"
              >
                <span>Get verified with college email</span>
                <ArrowRight className="ml-2 size-4" />
              </Link>
            )}

            <Link
              href="/colleges"
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-full border border-border/70 bg-card/70 hover:bg-muted hover:border-border px-6 text-[15px] font-bold text-foreground transition-all active:scale-98 shadow-xs cursor-pointer"
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
                className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
              >
                Viewer mode
              </Link>{" "}
              available for college aspirants.
            </p>
          )}

          {/* Cheerful Colorful Trust Checklist */}
          <div className="pt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Check className="size-3.5 text-emerald-500 shrink-0 stroke-[2.5]" />
              <span>100% Student Verified</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <Check className="size-3.5 text-rose-500 shrink-0 stroke-[2.5]" />
              <span>Zero-Doxxing Escrow</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
              <Check className="size-3.5 text-sky-500 shrink-0 stroke-[2.5]" />
              <span>No Outsiders</span>
            </div>
          </div>
        </div>

        {/* ──────── RIGHT COLUMN: Twitter / X UI Tweet Card ──────── */}
        <div className="lg:col-span-6 w-full max-w-lg mx-auto lg:max-w-none">
          <div className="rounded-2xl sm:rounded-3xl border border-border/70 bg-card/90 backdrop-blur-2xl shadow-xl shadow-primary/5 overflow-hidden transition-all">
            {/* Campus Selector Bar (Clean Twitter-style pill switcher) */}
            <div className="flex items-center justify-between gap-2 px-4 pt-3.5 pb-2.5 border-b border-border/40 bg-muted/20">
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
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                          : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/40"
                      )}
                    >
                      {c.short}
                    </button>
                  );
                })}
              </div>

              {/* Online Presence Count with pulsing dot */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                <span>{campus.activeCount} active</span>
              </div>
            </div>

            {/* Twitter-style Tab Navigation (Color-coded like /app) */}
            <div className="flex items-center border-b border-border/40 px-2 sm:px-4 bg-muted/10">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                const tabColor =
                  tab.id === "confession"
                    ? "text-rose-500"
                    : tab.id === "poll"
                      ? "text-blue-500"
                      : tab.id === "match"
                        ? "text-pink-500"
                        : "text-emerald-500";
                const barColor =
                  tab.id === "confession"
                    ? "bg-rose-500"
                    : tab.id === "poll"
                      ? "bg-blue-500"
                      : tab.id === "match"
                        ? "bg-pink-500"
                        : "bg-emerald-500";

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
                      isActive ? cn("font-bold", tabColor) : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span>{tab.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="twitter-tab-indicator"
                        className={cn("absolute bottom-0 inset-x-3 h-[3px] rounded-full shadow-sm", barColor)}
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
                {/* Author Avatar (Twitter Circular Style with Vibrant Rings) */}
                <div
                  className={cn(
                    "size-10 rounded-full flex items-center justify-center shrink-0 text-sm font-black transition-all shadow-xs",
                    activeTab === "confession"
                      ? "bg-gradient-to-br from-rose-500/20 via-pink-500/15 to-orange-500/10 border border-rose-500/30 text-rose-500 ring-2 ring-rose-500/20"
                      : activeTab === "poll"
                        ? "bg-gradient-to-br from-blue-500/20 via-indigo-500/15 to-cyan-500/10 border border-blue-500/30 text-blue-500 ring-2 ring-blue-500/20"
                        : activeTab === "match"
                          ? "bg-gradient-to-br from-pink-500/20 via-purple-500/15 to-violet-500/10 border border-pink-500/30 text-pink-500 ring-2 ring-pink-500/20"
                          : "bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-cyan-500/10 border border-emerald-500/30 text-emerald-500 ring-2 ring-emerald-500/20"
                  )}
                >
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
                      <BadgeCheck className="size-4 text-sky-500 shrink-0 fill-sky-500/15" />
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
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                      🏛️ {campus.name} Hub
                    </span>
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
                        <p className="inline-block text-xs font-bold text-rose-500 dark:text-rose-400 hover:underline cursor-pointer bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                          🔥 {campus.confession.topic}
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
                                  "group relative w-full overflow-hidden rounded-xl border text-left text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[42px]",
                                  isVoted
                                    ? "border-blue-500/70 bg-blue-500/10 text-foreground shadow-xs"
                                    : "border-border/60 bg-muted/20 hover:border-blue-500/40 hover:bg-blue-500/5"
                                )}
                              >
                                {votedOptionId && (
                                  <div
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500/25 via-indigo-500/20 to-blue-500/15 -z-10 transition-all duration-500"
                                    style={{ width: `${pct}%` }}
                                  />
                                )}
                                <div className="flex items-center justify-between px-3.5 py-2.5">
                                  <span
                                    className={cn(
                                      "truncate",
                                      isVoted
                                        ? "text-blue-600 dark:text-blue-400 font-bold"
                                        : "text-foreground"
                                    )}
                                  >
                                    {opt.text}
                                  </span>
                                  {votedOptionId && (
                                    <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400 ml-2">
                                      {pct}%
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <p className="text-xs text-muted-foreground pt-1 flex items-center gap-1.5 font-medium">
                          <span className="size-1.5 rounded-full bg-blue-500" />
                          <span>
                            {totalVotes} verified votes ·{" "}
                            {votedOptionId ? "Final results" : "Live campus poll"}
                          </span>
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
                        <div className="rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-transparent p-4 space-y-2.5 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground text-sm">{campus.match.name}</span>
                            <span className="text-xs font-black text-pink-500 dark:text-pink-400 bg-pink-500/10 border border-pink-500/25 rounded-full px-2.5 py-0.5">
                              💘 {campus.match.compatibility}% match
                            </span>
                          </div>

                          <p className="text-xs font-medium text-muted-foreground">{campus.match.branch}</p>

                          <p className="text-xs sm:text-sm text-foreground italic leading-relaxed">
                            &ldquo;{campus.match.bio}&rdquo;
                          </p>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {campus.match.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-bold text-purple-600 dark:text-purple-300"
                              >
                                #{tag.replace(/\s+/g, "")}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-pink-500" />
                            <span>Verified student connection</span>
                          </span>
                          <button
                            type="button"
                            onClick={handleSendVibe}
                            className={cn(
                              "rounded-full px-4 py-1.5 text-xs font-black transition-all cursor-pointer shadow-sm active:scale-95",
                              isVibeSent
                                ? "bg-rose-500 text-white shadow-rose-500/30"
                                : "bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:opacity-90 text-white shadow-pink-500/25"
                            )}
                          >
                            {isVibeSent ? "Vibe Sent! 💌" : "Send Vibe 💖"}
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
                        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-transparent p-4 space-y-2.5 shadow-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="p-1 rounded-lg bg-emerald-500/15 text-emerald-500">
                                <Bike className="size-4" />
                              </div>
                              <span className="font-bold text-foreground text-sm">{campus.market.item}</span>
                            </div>
                            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                              {campus.market.price}
                            </span>
                          </div>

                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {campus.market.desc}
                          </p>

                          <div className="flex items-center justify-between pt-1.5 border-t border-border/40 text-xs text-muted-foreground font-medium">
                            <span>{campus.market.seller}</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              Campus handoff
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            <span>1-Tap Student Escrow</span>
                          </span>
                          <button
                            type="button"
                            onClick={handleMakeOffer}
                            className={cn(
                              "rounded-full px-4 py-1.5 text-xs font-black transition-all cursor-pointer shadow-sm active:scale-95",
                              isOfferMade
                                ? "bg-emerald-600 text-white shadow-emerald-500/30"
                                : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white shadow-emerald-500/25"
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
                      className="group flex items-center gap-1.5 hover:text-sky-500 transition-colors cursor-pointer"
                    >
                      <div className="p-1.5 rounded-full group-hover:bg-sky-500/10 transition-colors">
                        <MessageCircle className="size-4 group-hover:text-sky-500" />
                      </div>
                      <span>{currentHeader.replies}</span>
                    </button>

                    {/* Repost (Interactive) */}
                    <button
                      type="button"
                      onClick={handleRepostToggle}
                      className={cn(
                        "group flex items-center gap-1.5 transition-colors cursor-pointer",
                        isReposted ? "text-emerald-500 font-bold" : "hover:text-emerald-500"
                      )}
                    >
                      <div
                        className={cn(
                          "p-1.5 rounded-full transition-colors",
                          isReposted ? "bg-emerald-500/15" : "group-hover:bg-emerald-500/10"
                        )}
                      >
                        <Repeat2 className={cn("size-4", isReposted && "text-emerald-500")} />
                      </div>
                      <span>{repostCount}</span>
                    </button>

                    {/* Like (Interactive) */}
                    <button
                      type="button"
                      onClick={handleLikeToggle}
                      className={cn(
                        "group flex items-center gap-1.5 transition-colors cursor-pointer",
                        isLiked ? "text-rose-500 font-bold" : "hover:text-rose-500"
                      )}
                    >
                      <div
                        className={cn(
                          "p-1.5 rounded-full transition-colors",
                          isLiked ? "bg-rose-500/15" : "group-hover:bg-rose-500/10"
                        )}
                      >
                        <Heart
                          className={cn(
                            "size-4 transition-transform active:scale-125",
                            isLiked && "fill-rose-500 text-rose-500"
                          )}
                        />
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
                          "p-1.5 rounded-full transition-colors cursor-pointer",
                          isBookmarked
                            ? "text-primary bg-primary/15"
                            : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                        )}
                      >
                        <Bookmark className={cn("size-4", isBookmarked && "fill-primary text-primary")} />
                      </button>
                      <button
                        type="button"
                        aria-label="Share post"
                        className="p-1.5 rounded-full hover:bg-sky-500/10 text-muted-foreground hover:text-sky-500 transition-colors cursor-pointer"
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
