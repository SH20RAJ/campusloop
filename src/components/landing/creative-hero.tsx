"use client";

import {
  ArrowRight,
  BadgeCheck,
  Bike,
  Building2,
  CheckCircle2,
  ChevronDown,
  Heart,
  Lock,
  MessageCircle,
  PackageSearch,
  School,
  Send,
  ShieldCheck,
  Sparkles,
  Vote,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

// ── Featured Indian Campuses Data ──
const FEATURED_CAMPUSES = [
  {
    id: "bit-mesra",
    name: "BIT Mesra",
    shortName: "BITM",
    location: "Ranchi, Jharkhand",
    activeCount: "4,280",
    confession: {
      anonId: "anon_bit_98",
      text: "The IC ground winter fog at 2 AM with hot chai from the back gate canteen hits completely different than any 5-star cafe...",
      likes: 318,
      replies: 47,
      topic: "#canteen-vibes",
    },
    poll: {
      question: "Which late-night canteen actually deserves your money?",
      options: [
        { id: "nescafe", text: "Nescafe booth by R&D", votes: 340 },
        { id: "sharma", text: "Sharma Ji juice corner", votes: 210 },
        { id: "main_canteen", text: "Main Mess (night counter)", votes: 95 },
      ],
    },
    match: {
      name: "Sneha R., 20",
      branch: "BIT Mesra · ECE '26",
      bio: "Looking for someone to grab late-night chai and jam at fest pro-nite soundchecks 🎸☕",
      tags: ["🎵 Indie Rock", "☕ Chai Addict", "🚀 Hackathons"],
      compatibility: 96,
    },
    market: {
      item: "Hero Sprint 21-Speed Cycle",
      price: "₹3,100",
      desc: "Mint condition, dual disc brakes, tuned gears. Leaving campus after placement. Includes wire lock.",
      seller: "Hostel 10 · Verified Senior",
    },
    lostFound: {
      item: "Hostel 11 Room Keys & Lanyard",
      location: "IC Ground near Nescafe booth",
      time: "Today, 4:15 PM",
      status: "Safely kept at canteen counter",
    },
  },
  {
    id: "iit-delhi",
    name: "IIT Delhi",
    shortName: "IITD",
    location: "Hauz Khas, New Delhi",
    activeCount: "6,920",
    confession: {
      anonId: "anon_iitd_44",
      text: "Library 2nd floor AC is literally set to North Pole subzero temperatures. I am once again studying microprocessors in a puffer jacket in May 😭",
      likes: 426,
      replies: 62,
      topic: "#midsems",
    },
    poll: {
      question: "Best late-night food rescue around campus?",
      options: [
        { id: "sda", text: "SDA Market Kathi Rolls", votes: 412 },
        { id: "nilgiri", text: "Nilgiri Night Canteen", votes: 328 },
        { id: "redsq", text: "Red Square Maggi Point", votes: 144 },
      ],
    },
    match: {
      name: "Aarav K., 21",
      branch: "IIT Delhi · CSE '25",
      bio: "Indie rock fanatic, building distributed agents. Looking for someone for midnight campus walks 🎧☕",
      tags: ["🤖 AI Agents", "🎧 Tame Impala", "🌙 Night Walks"],
      compatibility: 94,
    },
    market: {
      item: "Casio Scientific fx-991CW Calculator",
      price: "₹750",
      desc: "Practically brand new, used for 2 math midsems. Clean screen with original flip case.",
      seller: "Girnar Hostel · Verified Student",
    },
    lostFound: {
      item: "AirPods Pro (Navy Silicone Case)",
      location: "Central Library 2nd Floor Reading Room",
      time: "Today, 2:30 PM",
      status: "Handed over to Library Reception",
    },
  },
  {
    id: "bits-pilani",
    name: "BITS Pilani",
    shortName: "BITS",
    location: "Pilani, Rajasthan",
    activeCount: "5,400",
    confession: {
      anonId: "anon_bits_12",
      text: "0% attendance policy is supreme bliss until comprehensive exams arrive and you realize you don't even know which classroom the exam is in 💀",
      likes: 512,
      replies: 89,
      topic: "#compro-scare",
    },
    poll: {
      question: "Where are we eating at 3:30 AM tonight?",
      options: [
        { id: "anc", text: "ANC (All Night Canteen)", votes: 489 },
        { id: "cblock", text: "C-Block Egg Rolls", votes: 275 },
        { id: "hostel_mess", text: "Hostel Maggi in kettle", votes: 110 },
      ],
    },
    match: {
      name: "Tanvi M., 21",
      branch: "BITS Pilani · Eco + CS '25",
      bio: "Post-compro roadtrip planning, film photography, and debate over whether Oasis was the best fest 📸🎸",
      tags: ["📸 35mm Film", "☕ Chemex Coffee", "🎸 Oasis Fest"],
      compatibility: 98,
    },
    market: {
      item: "Dorm Mini Refrigerator (45L)",
      price: "₹3,600",
      desc: "Works 100% silent, low power draw, keeps Cold Brew & Red Bull ice cold. Passing on to juniors.",
      seller: "Shankar Bhawan · Verified Student",
    },
    lostFound: {
      item: "Scientific Calculator fx-991CW",
      location: "LTC Room 5102 after Midsem 2",
      time: "Today, 1:10 PM",
      status: "With security guard at LTC Gate",
    },
  },
  {
    id: "vit-vellore",
    name: "VIT Vellore",
    shortName: "VIT",
    location: "Vellore, Tamil Nadu",
    activeCount: "8,150",
    confession: {
      anonId: "anon_vit_77",
      text: "The 8:29 PM hostel biometric in-time sprint across the SJT footbridge is an Olympic-tier cardio endurance test 🏃‍♂️💨",
      likes: 640,
      replies: 104,
      topic: "#vit-in-time",
    },
    poll: {
      question: "Which spot has the best post-class refreshment?",
      options: [
        { id: "gazebo", text: "Gazebo Strawberry Shake", votes: 520 },
        { id: "foodstreet", text: "Food Street Shawarma", votes: 410 },
        { id: "sjt_nescafe", text: "SJT Nescafe Iced Tea", votes: 190 },
      ],
    },
    match: {
      name: "Dev P., 20",
      branch: "VIT Vellore · CSE Core '26",
      bio: "Looking for a Riviera fest partner & someone to code hackathon projects over canteen coffee ☕💻",
      tags: ["💻 Full-Stack", "🎉 Riviera Fest", "🍕 Woodfired Pizza"],
      compatibility: 93,
    },
    market: {
      item: "Logitech Mechanical Keyboard (Brown Switches)",
      price: "₹1,800",
      desc: "RGB backlit, tactile mechanical switches, perfect for hostel dorm coding sessions without noise.",
      seller: "Block D · Verified Student",
    },
    lostFound: {
      item: "Student ID Card & Room Key",
      location: "SJT Footbridge towards Food Street",
      time: "Today, 6:45 PM",
      status: "Submitted at SJT Security Desk",
    },
  },
  {
    id: "iit-bombay",
    name: "IIT Bombay",
    shortName: "IITB",
    location: "Powai, Mumbai",
    activeCount: "7,310",
    confession: {
      anonId: "anon_iitb_59",
      text: "Powai lake breeze at sunrise after an all-nighter for Mood Indigo will heal any soul. Just watch out for campus cattle crossings!",
      likes: 580,
      replies: 76,
      topic: "#moodindigo",
    },
    poll: {
      question: "Best canteen on the Powai campus?",
      options: [
        { id: "h12", text: "Hostel 12 Famous Canteen", votes: 490 },
        { id: "brewberrys", text: "Brewberrys Cafe by SAC", votes: 310 },
        { id: "gulmohar", text: "Gulmohar Veg Thali", votes: 135 },
      ],
    },
    match: {
      name: "Rohan M., 21",
      branch: "IIT Bombay · Mech '25",
      bio: "Mood Indigo backstage crew, cycling around Powai lake, and building electric powertrain karts 🏎️",
      tags: ["🏎️ Formula Student", "🚴 Powai Cycling", "🎧 Techno"],
      compatibility: 95,
    },
    market: {
      item: "Kryptonite U-Lock + Steel Cable",
      price: "₹850",
      desc: "Heavy duty bicycle lock, unbreakable hardened steel. Never worry about cycle theft again.",
      seller: "Hostel 16 · Verified Student",
    },
    lostFound: {
      item: "Bicycle Wire Lock + Key Bundle",
      location: "Gymkhana Ground cycle stand",
      time: "Today, 5:20 PM",
      status: "Left at SAC Main Security",
    },
  },
] as const;

type ArtifactType = "confession" | "poll" | "match" | "market" | "lost_found";

const ARTIFACT_TABS: {
  id: ArtifactType;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "confession", label: "Confession", shortLabel: "Confess", icon: Lock },
  { id: "poll", label: "Canteen Poll", shortLabel: "Poll", icon: Vote },
  { id: "match", label: "Peer Match", shortLabel: "Match", icon: Heart },
  { id: "market", label: "Dorm Market", shortLabel: "Market", icon: Bike },
  { id: "lost_found", label: "Lost & Found", shortLabel: "Lost/Found", icon: PackageSearch },
];

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export function CreativeHero({ isAuthenticated }: { isAuthenticated: boolean }) {
  // State
  const [activeCampusIndex, setActiveCampusIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<ArtifactType>("confession");
  const [isCampusDropdownOpen, setIsCampusDropdownOpen] = useState(false);

  // Active Campus
  const campus = FEATURED_CAMPUSES[activeCampusIndex];

  // Poll interactive state
  const [votedId, setVotedId] = useState<string | null>(null);
  const [pollOptions, setPollOptions] = useState<PollOption[]>(() =>
    campus.poll.options.map((o) => ({ id: o.id, text: o.text, votes: o.votes }))
  );

  // Confession like state
  const [confessionLiked, setConfessionLiked] = useState(false);
  const [confessionLikes, setConfessionLikes] = useState<number>(campus.confession.likes);

  // Match state
  const [matchLiked, setMatchLiked] = useState(false);

  // Sync state on campus change
  useEffect(() => {
    setPollOptions(campus.poll.options.map((o) => ({ id: o.id, text: o.text, votes: o.votes })));
    setVotedId(null);
    setConfessionLikes(campus.confession.likes);
    setConfessionLiked(false);
    setMatchLiked(false);
  }, [campus]);

  // Handle Poll Vote
  function handleVote(optId: string) {
    if (votedId) return;
    sounds.pop();
    haptics.light();
    setVotedId(optId);
    setPollOptions((prev) =>
      prev.map((opt) => (opt.id === optId ? { ...opt, votes: opt.votes + 1 } : opt))
    );
  }

  // Handle Like Confession
  function handleLikeConfession() {
    sounds.pop();
    haptics.light();
    setConfessionLiked((prev) => !prev);
    setConfessionLikes((prev) => (confessionLiked ? prev - 1 : prev + 1));
  }

  // Handle Match Vibe
  function handleMatchLike() {
    sounds.ting();
    haptics.match();
    setMatchLiked((prev) => !prev);
  }

  function handleTabChange(tab: ArtifactType) {
    sounds.tap();
    haptics.light();
    setActiveTab(tab);
  }

  const totalPollVotes = pollOptions.reduce((acc, curr) => acc + curr.votes, 0);

  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 pt-24 pb-16 sm:pt-28 sm:pb-20 overflow-hidden">
      {/* ── Ambient Background Lighting ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[380px] w-[600px] -translate-x-1/2 rounded-full bg-linear-to-b from-primary/15 via-indigo-500/10 to-transparent blur-3xl opacity-70"
      />

      <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
        {/* ──────── LEFT COLUMN: Clean Minimal Value Proposition ──────── */}
        <div className="space-y-5 lg:col-span-6 lg:pr-4 text-center lg:text-left">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 backdrop-blur-md">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              1,350+ Indian Colleges
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-xs font-semibold text-primary">Verified Students Only</span>
          </div>

          {/* Headline */}
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight leading-[1.08]">
            Your campus.
            <br />
            <span className="bg-linear-to-r from-primary via-violet-400 to-indigo-400 bg-clip-text text-transparent italic">
              Completely unfiltered.
            </span>
          </h1>

          {/* Description */}
          <p className="max-w-xl mx-auto lg:mx-0 text-sm sm:text-base leading-relaxed text-muted-foreground">
            The private collegiate network for Indian students. Settle canteen debates, spill anonymous
            confessions safely, buy and sell dorm gear, and vibe match — gated strictly by your{" "}
            <span className="font-semibold text-foreground">.ac.in college email</span>.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
            {isAuthenticated ? (
              <Link
                href="/app"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full sm:w-auto rounded-xl px-6 font-bold shadow-md shadow-primary/20 text-sm gap-2"
                )}
              >
                <span>Open CampusLoop</span>
                <ArrowRight className="size-4" />
              </Link>
            ) : (
              <Link
                href="/handler/sign-up"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full sm:w-auto rounded-xl px-6 font-bold shadow-md shadow-primary/20 text-sm gap-2"
                )}
              >
                <span>Verify with college email</span>
                <ArrowRight className="size-4" />
              </Link>
            )}

            <Link
              href="/colleges"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-full sm:w-auto rounded-xl border-border/80 bg-background/50 hover:bg-card text-foreground font-semibold px-5 text-sm"
              )}
            >
              <School className="size-4 mr-1.5 text-primary" />
              <span>Explore 1,350+ Hubs</span>
            </Link>
          </div>

          {/* Viewer Mode Link for Aspirants */}
          {!isAuthenticated && (
            <p className="text-xs text-muted-foreground">
              Aspirant or prospective student?{" "}
              <Link href="/handler/sign-up" className="font-bold text-primary hover:underline">
                Browse in Viewer Mode
              </Link>{" "}
              with any personal email.
            </p>
          )}

          {/* Minimal Trust Strip */}
          <div className="pt-3 border-t border-border/40 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-[11px] text-muted-foreground font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
              <span>100% Verified Accounts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="size-3.5 text-primary shrink-0" />
              <span>Sealed Identity Escrow</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building2 className="size-3.5 text-indigo-400 shrink-0" />
              <span>Zero Outsiders</span>
            </div>
          </div>
        </div>

        {/* ──────── RIGHT COLUMN: Clean Minimal Interactive Artifacts ──────── */}
        <div className="lg:col-span-6 w-full max-w-lg mx-auto">
          {/* Card Container */}
          <div className="rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-xl p-4 sm:p-5 space-y-3.5">
            {/* Top Bar: Campus Picker & Live Status */}
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              {/* Campus Selector Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCampusDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-xl bg-muted/50 hover:bg-muted/80 border border-border/50 px-3 py-1.5 text-xs font-bold text-foreground transition-all cursor-pointer"
                >
                  <span className="size-2 rounded-full bg-primary" />
                  <span>{campus.name}</span>
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </button>

                {isCampusDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1.5 z-30 w-52 rounded-xl border border-border/70 bg-popover p-1.5 shadow-xl">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">
                      Select Campus Feed
                    </p>
                    {FEATURED_CAMPUSES.map((c, idx) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          sounds.tap();
                          setActiveCampusIndex(idx);
                          setIsCampusDropdownOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors text-left cursor-pointer",
                          activeCampusIndex === idx
                            ? "bg-primary/15 text-primary font-bold"
                            : "text-foreground hover:bg-muted/50"
                        )}
                      >
                        <span>{c.name}</span>
                        <span className="text-[10px] text-muted-foreground">{c.shortName}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Live Count */}
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{campus.activeCount} online</span>
              </div>
            </div>

            {/* Artifact Dock Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {ARTIFACT_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground border border-border/40"
                    )}
                  >
                    <Icon className="size-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                  </button>
                );
              })}
            </div>

            {/* Artifact Canvas */}
            <div className="min-h-[220px] pt-1">
              <AnimatePresence mode="wait">
                {/* 1. CONFESSION ARTIFACT */}
                {activeTab === "confession" && (
                  <motion.div
                    key={`confession-${campus.id}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-md bg-purple-500/15 text-purple-400 font-bold px-2 py-0.5 text-[10px]">
                          Anonymous
                        </span>
                        <span className="text-muted-foreground font-mono text-[10px]">
                          {campus.confession.anonId}
                        </span>
                      </div>
                      <span className="text-primary font-bold text-[11px]">{campus.confession.topic}</span>
                    </div>

                    <div className="rounded-xl border border-border/50 bg-muted/20 p-3.5">
                      <p className="text-xs sm:text-sm leading-relaxed text-foreground italic">
                        &ldquo;{campus.confession.text}&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                      <button
                        type="button"
                        onClick={handleLikeConfession}
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer hover:bg-muted/40",
                          confessionLiked ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        <Heart className={cn("size-4", confessionLiked && "fill-primary")} />
                        <span>{confessionLikes}</span>
                      </button>

                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="size-3.5" />
                          <span>{campus.confession.replies}</span>
                        </span>
                        <span className="flex items-center gap-1 text-primary font-semibold">
                          <Lock className="size-3" />
                          <span>HMAC Sealed</span>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 2. POLL ARTIFACT */}
                {activeTab === "poll" && (
                  <motion.div
                    key={`poll-${campus.id}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="rounded-md bg-amber-500/15 text-amber-500 font-bold px-2 py-0.5 text-[10px]">
                        Live Poll
                      </span>
                      <span className="text-muted-foreground text-[10px]">{totalPollVotes} votes</span>
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-foreground leading-snug">
                      {campus.poll.question}
                    </p>

                    <div className="space-y-1.5 pt-0.5">
                      {pollOptions.map((opt) => {
                        const pct = Math.round((opt.votes / totalPollVotes) * 100);
                        const isVoted = votedId === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleVote(opt.id)}
                            className={cn(
                              "group relative w-full overflow-hidden rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer active:scale-[0.99]",
                              isVoted
                                ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                                : "border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/40"
                            )}
                          >
                            {votedId && (
                              <div
                                className="absolute inset-y-0 left-0 bg-primary/20 -z-10 transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            )}
                            <div className="flex items-center justify-between px-3 py-2">
                              <span className={cn(isVoted && "text-primary font-bold")}>{opt.text}</span>
                              {votedId && (
                                <span className="font-mono text-[10px] font-bold text-foreground">{pct}%</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <p className="text-[10px] text-muted-foreground text-center">
                      {!votedId ? "👆 Tap any option to cast instant live vote" : "✓ Vote recorded securely"}
                    </p>
                  </motion.div>
                )}

                {/* 3. PEER MATCH ARTIFACT */}
                {activeTab === "match" && (
                  <motion.div
                    key={`match-${campus.id}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="rounded-md bg-rose-500/15 text-rose-500 font-bold px-2 py-0.5 text-[10px]">
                        Campus Match
                      </span>
                      <span className="rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold">
                        {campus.match.compatibility}% Vibe Match
                      </span>
                    </div>

                    <div className="rounded-xl border border-border/50 bg-muted/20 p-3.5 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-bold text-foreground">{campus.match.name}</h4>
                        <BadgeCheck className="size-3.5 text-primary fill-primary/20" />
                        <span className="text-[10px] text-muted-foreground">· {campus.match.branch}</span>
                      </div>

                      <p className="text-xs text-foreground italic">&ldquo;{campus.match.bio}&rdquo;</p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {campus.match.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-md bg-card border border-border/40 px-2 py-0.5 text-[9px] font-semibold text-muted-foreground"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-muted-foreground">Zero Catfish · Verified</span>
                      <button
                        type="button"
                        onClick={handleMatchLike}
                        className={cn(
                          "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer",
                          matchLiked
                            ? "bg-rose-500 text-white shadow-xs"
                            : "bg-rose-500/15 text-rose-500 hover:bg-rose-500/25 border border-rose-500/30"
                        )}
                      >
                        <Heart className={cn("size-3.5", matchLiked && "fill-current")} />
                        <span>{matchLiked ? "Vibe Sent! 💖" : "Send Vibe"}</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 4. DORM MARKET ARTIFACT */}
                {activeTab === "market" && (
                  <motion.div
                    key={`market-${campus.id}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="rounded-md bg-emerald-500/15 text-emerald-500 font-bold px-2 py-0.5 text-[10px]">
                        Student Market
                      </span>
                      <span className="font-extrabold text-xs text-primary">{campus.market.price}</span>
                    </div>

                    <div className="rounded-xl border border-border/50 bg-muted/20 p-3.5 space-y-2">
                      <div className="flex items-start gap-2.5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                          <Bike className="size-4.5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-foreground truncate">{campus.market.item}</h4>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                            {campus.market.desc}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/30 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1 font-medium">
                          <CheckCircle2 className="size-3 text-emerald-500" />
                          <span>{campus.market.seller}</span>
                        </span>
                        <span className="font-bold text-foreground">1-Tap Student UPI</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-[10px] text-muted-foreground">Hostel exchange</span>
                      <button
                        type="button"
                        onClick={() => {
                          sounds.ting();
                          haptics.light();
                        }}
                        className="flex items-center gap-1 rounded-lg bg-primary/10 border border-primary/30 px-3 py-1 text-xs font-bold text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                      >
                        <Send className="size-3" />
                        <span>Chat with Seller</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* 5. LOST & FOUND ARTIFACT */}
                {activeTab === "lost_found" && (
                  <motion.div
                    key={`lost-${campus.id}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="rounded-md bg-rose-500/15 text-rose-500 font-bold px-2 py-0.5 text-[10px]">
                        Lost &amp; Found
                      </span>
                      <span className="text-[10px] text-muted-foreground">{campus.lostFound.time}</span>
                    </div>

                    <div className="rounded-xl border border-border/50 bg-muted/20 p-3.5 space-y-2">
                      <div className="flex items-start gap-2.5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/15 text-rose-500 border border-rose-500/30">
                          <PackageSearch className="size-4.5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-foreground truncate">
                            {campus.lostFound.item}
                          </h4>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            📍 {campus.lostFound.location}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/30 text-[10px] text-muted-foreground">
                        <span className="text-emerald-500 font-bold flex items-center gap-1">
                          <CheckCircle2 className="size-3" />
                          <span>{campus.lostFound.status}</span>
                        </span>
                        <span className="font-bold text-foreground">Verified Claim</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-[10px] text-muted-foreground">Peer recovery loop</span>
                      <button
                        type="button"
                        onClick={() => {
                          sounds.ting();
                          haptics.light();
                        }}
                        className="flex items-center gap-1 rounded-lg bg-rose-500/10 border border-rose-500/30 px-3 py-1 text-xs font-bold text-rose-500 hover:bg-rose-500/20 transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="size-3" />
                        <span>Claim Item</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
