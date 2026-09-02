"use client";

import {
  ArrowRight,
  BadgeCheck,
  Bike,
  Building2,
  CheckCircle2,
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
import { buttonVariants } from "@/components/ui/button";
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
      anonId: "anon#bit98",
      text: "The IC ground winter fog at 2 AM with hot chai from the back gate canteen hits completely different than any cafe in the city...",
      likes: 318,
      replies: 47,
      topic: "#canteen-vibes",
    },
    poll: {
      question: "Which late-night canteen spot actually deserves your money?",
      options: [
        { id: "nescafe", text: "Nescafe booth by R&D", votes: 340 },
        { id: "sharma", text: "Sharma Ji juice corner", votes: 210 },
        { id: "mess", text: "Main Mess (night counter)", votes: 95 },
      ],
    },
    match: {
      name: "Sneha R., 20",
      branch: "BIT Mesra · ECE '26",
      bio: "Looking for someone to grab late-night chai and jam at fest soundchecks 🎸☕",
      tags: ["🎵 Indie Rock", "☕ Chai Addict", "🚀 Hackathons"],
      compatibility: 96,
    },
    market: {
      item: "Hero Sprint 21-Speed Cycle",
      price: "₹3,100",
      desc: "Mint condition, dual disc brakes, tuned gears. Leaving campus post-placement.",
      seller: "Hostel 10 · Verified Senior",
    },
  },
  {
    id: "iit-delhi",
    name: "IIT Delhi",
    short: "IITD",
    city: "New Delhi",
    activeCount: "6,920",
    confession: {
      anonId: "anon#iitd44",
      text: "Library 2nd floor AC is literally set to North Pole temperatures. Studying microprocessors in a puffer jacket in May 😭",
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
      bio: "Indie rock fanatic, building distributed agents. Looking for midnight campus walks 🎧☕",
      tags: ["🤖 AI Agents", "🎧 Tame Impala", "🌙 Night Walks"],
      compatibility: 94,
    },
    market: {
      item: "Casio fx-991CW Calculator",
      price: "₹750",
      desc: "Brand new condition, used for 2 math midsems. Clean screen with original flip case.",
      seller: "Girnar Hostel · Verified Student",
    },
  },
  {
    id: "bits-pilani",
    name: "BITS Pilani",
    short: "BITS",
    city: "Pilani",
    activeCount: "5,400",
    confession: {
      anonId: "anon#bits12",
      text: "0% attendance policy is supreme bliss until comprehensive exams arrive and you realize you don't even know which room the exam is in 💀",
      likes: 512,
      replies: 89,
      topic: "#compro-scare",
    },
    poll: {
      question: "Where are we eating at 3:30 AM tonight?",
      options: [
        { id: "anc", text: "ANC (All Night Canteen)", votes: 489 },
        { id: "cblock", text: "C-Block Egg Rolls", votes: 275 },
        { id: "mess", text: "Hostel Maggi in kettle", votes: 110 },
      ],
    },
    match: {
      name: "Tanvi M., 21",
      branch: "BITS Pilani · Eco+CS '25",
      bio: "Post-compro roadtrip planning, 35mm film photography, and debate over Oasis fest 📸🎸",
      tags: ["📸 35mm Film", "☕ Chemex Coffee", "🎸 Oasis Fest"],
      compatibility: 98,
    },
    market: {
      item: "Dorm Mini Refrigerator (45L)",
      price: "₹3,600",
      desc: "Silent compressor, keeps cold brew & energy drinks ice cold. Passing to juniors.",
      seller: "Shankar Bhawan · Verified Student",
    },
  },
  {
    id: "vit-vellore",
    name: "VIT Vellore",
    short: "VIT",
    city: "Vellore",
    activeCount: "8,150",
    confession: {
      anonId: "anon#vit77",
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
        { id: "sjt", text: "SJT Nescafe Iced Tea", votes: 190 },
      ],
    },
    match: {
      name: "Dev P., 20",
      branch: "VIT Vellore · CSE '26",
      bio: "Looking for a Riviera fest partner & someone to code hackathon projects over canteen coffee ☕💻",
      tags: ["💻 Full-Stack", "🎉 Riviera Fest", "🍕 Woodfired Pizza"],
      compatibility: 93,
    },
    market: {
      item: "Logitech Mechanical Keyboard",
      price: "₹1,800",
      desc: "RGB backlit, tactile brown switches, perfect for hostel dorm coding sessions.",
      seller: "Block D · Verified Student",
    },
  },
  {
    id: "iit-bombay",
    name: "IIT Bombay",
    short: "IITB",
    city: "Mumbai",
    activeCount: "7,310",
    confession: {
      anonId: "anon#iitb59",
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
      item: "Heavy Kryptonite U-Lock",
      price: "₹850",
      desc: "Heavy duty bicycle lock, hardened steel. Never worry about cycle theft at SAC again.",
      seller: "Hostel 16 · Verified Student",
    },
  },
] as const;

type ArtifactMode = "confession" | "poll" | "match" | "market";

const TABS: { id: ArtifactMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "confession", label: "Confessions", icon: Lock },
  { id: "poll", label: "Campus Poll", icon: Vote },
  { id: "match", label: "Peer Match", icon: Heart },
  { id: "market", label: "Dorm Market", icon: Bike },
];

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export function CreativeHero({ isAuthenticated }: { isAuthenticated: boolean }) {
  // Active Campus Selection
  const [selectedCampusIndex, setSelectedCampusIndex] = useState(0);
  const campus = CAMPUSES[selectedCampusIndex];

  // Active Artifact Tab
  const [activeTab, setActiveTab] = useState<ArtifactMode>("confession");

  // Interactive Poll State
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null);
  const [pollOptions, setPollOptions] = useState<PollOption[]>(() =>
    campus.poll.options.map((opt) => ({ id: opt.id, text: opt.text, votes: opt.votes }))
  );

  // Interactive Confession Like State
  const [isConfessionLiked, setIsConfessionLiked] = useState(false);
  const [confessionLikeCount, setConfessionLikeCount] = useState<number>(campus.confession.likes);

  // Interactive Match State
  const [isVibeSent, setIsVibeSent] = useState(false);

  // Interactive Market State
  const [isOfferMade, setIsOfferMade] = useState(false);

  // Reset/sync state when campus changes
  useEffect(() => {
    setPollOptions(campus.poll.options.map((opt) => ({ ...opt })));
    setVotedOptionId(null);
    setIsConfessionLiked(false);
    setConfessionLikeCount(campus.confession.likes);
    setIsVibeSent(false);
    setIsOfferMade(false);
  }, [campus]);

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

  // Handle Confession Like
  function handleConfessionLike() {
    sounds.pop();
    haptics.light();
    setIsConfessionLiked((prev) => {
      const next = !prev;
      setConfessionLikeCount((c) => (next ? c + 1 : c - 1));
      return next;
    });
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

  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden">
      {/* ── Soft Ambient Glow Background ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[360px] w-[580px] -translate-x-1/2 rounded-full bg-linear-to-b from-primary/15 via-violet-500/10 to-transparent blur-3xl opacity-80"
      />

      <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
        {/* ──────── LEFT COLUMN: Clean Minimal Value Proposition ──────── */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 sm:space-y-6 lg:col-span-6">
          {/* Top Live Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 backdrop-blur-md">
            <span className="relative flex size-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-foreground">
              1,350+ Indian Colleges
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-[11px] sm:text-xs font-semibold text-primary">
              Verified Student Network
            </span>
          </div>

          {/* Clean High-Impact Headline */}
          <h1 className="font-heading text-3xl sm:text-5xl lg:text-5xl xl:text-[54px] font-extrabold tracking-tight leading-[1.12] sm:leading-[1.08] text-foreground">
            Your campus.
            <br />
            <span className="bg-linear-to-r from-primary via-violet-500 to-indigo-500 bg-clip-text text-transparent italic">
              Verified &amp; Unfiltered.
            </span>
          </h1>

          {/* Minimal Subtitle */}
          <p className="max-w-xl text-sm sm:text-base leading-relaxed text-muted-foreground font-normal">
            The private collegiate loop for Indian students. Spill anonymous confessions safely, settle
            midnight canteen debates, match with peers, and trade dorm gear — gated strictly by your{" "}
            <span className="font-semibold text-foreground">college email</span>.
          </p>

          {/* Mobile-Priority Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto pt-1">
            {isAuthenticated ? (
              <Link
                href="/app"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 rounded-2xl px-7 font-black shadow-lg shadow-primary/20 text-sm gap-2 flex items-center justify-center transition-all hover:scale-[1.02] active:scale-[0.98]"
                )}
              >
                <span>Enter Campus Feed</span>
                <ArrowRight className="size-4" />
              </Link>
            ) : (
              <Link
                href="/handler/sign-up"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 rounded-2xl px-7 font-black shadow-lg shadow-primary/20 text-sm gap-2 flex items-center justify-center transition-all hover:scale-[1.02] active:scale-[0.98]"
                )}
              >
                <span>Get verified with college email</span>
                <ArrowRight className="size-4" />
              </Link>
            )}

            <Link
              href="/colleges"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-12 rounded-2xl border-border/80 bg-background/60 hover:bg-card text-foreground font-bold px-5 text-sm flex items-center justify-center transition-all"
              )}
            >
              <School className="size-4 mr-2 text-primary" />
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

          {/* Trust Pillars */}
          <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-[11px] text-muted-foreground font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
              <span>100% Student Verified</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="size-3.5 text-primary shrink-0" />
              <span>Zero-Doxxing Escrow</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building2 className="size-3.5 text-indigo-400 shrink-0" />
              <span>Zero Faculty &amp; Outsiders</span>
            </div>
          </div>
        </div>

        {/* ──────── RIGHT COLUMN: Clean Interactive Live Campus Artifact ──────── */}
        <div className="lg:col-span-6 w-full max-w-lg mx-auto">
          <div className="relative rounded-3xl border border-border/70 bg-card/90 backdrop-blur-xl shadow-2xl p-4 sm:p-5 space-y-3.5 transition-all">
            {/* Artifact Topbar: Campus Selector & Live Presence */}
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border/50">
              {/* Campus Selector Chips (Mobile horizontal scroll) */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-[280px] sm:max-w-none">
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
                        "rounded-xl px-2.5 py-1 text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0",
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-muted/40 hover:bg-muted/70 text-muted-foreground hover:text-foreground border border-border/40"
                      )}
                    >
                      {c.short}
                    </button>
                  );
                })}
              </div>

              {/* Online Presence Badge */}
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground shrink-0">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{campus.activeCount} live</span>
              </div>
            </div>

            {/* Feature Tabs Bar */}
            <div className="grid grid-cols-4 gap-1.5 bg-muted/30 p-1 rounded-2xl border border-border/40">
              {TABS.map((tab) => {
                const Icon = tab.icon;
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
                      "flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all cursor-pointer",
                      isActive
                        ? "bg-background text-foreground shadow-xs border border-border/60"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    )}
                  >
                    <Icon className={cn("size-3.5", isActive && "text-primary")} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Interactive Canvas */}
            <div className="min-h-[225px] flex flex-col justify-between pt-1">
              <AnimatePresence mode="wait">
                {/* ── 1. CONFESSION ARTIFACT ── */}
                {activeTab === "confession" && (
                  <motion.div
                    key={`confession-${campus.id}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded-md bg-purple-500/15 text-purple-400 font-bold px-2 py-0.5 text-[10px]">
                          🎭 Anonymous Confession
                        </span>
                        <span className="text-muted-foreground font-mono text-[10px]">
                          {campus.confession.anonId}
                        </span>
                      </div>
                      <span className="text-primary font-bold text-[11px]">{campus.confession.topic}</span>
                    </div>

                    <div className="rounded-2xl border border-border/60 bg-muted/20 p-3.5 sm:p-4">
                      <p className="text-xs sm:text-sm leading-relaxed text-foreground font-medium italic">
                        &ldquo;{campus.confession.text}&rdquo;
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={handleConfessionLike}
                        className={cn(
                          "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer active:scale-95",
                          isConfessionLiked
                            ? "bg-primary/15 text-primary border border-primary/30"
                            : "bg-muted/30 hover:bg-muted/60 text-muted-foreground hover:text-foreground border border-border/40"
                        )}
                      >
                        <Heart className={cn("size-4", isConfessionLiked && "fill-primary text-primary")} />
                        <span>{confessionLikeCount}</span>
                      </button>

                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="size-3.5" />
                          <span>{campus.confession.replies} replies</span>
                        </span>
                        <span className="flex items-center gap-1 text-primary font-semibold">
                          <Lock className="size-3" />
                          <span>HMAC Sealed</span>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── 2. CAMPUS POLL ARTIFACT ── */}
                {activeTab === "poll" && (
                  <motion.div
                    key={`poll-${campus.id}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="rounded-md bg-amber-500/15 text-amber-500 font-bold px-2 py-0.5 text-[10px]">
                        📊 Live Campus Poll
                      </span>
                      <span className="text-muted-foreground text-[10px] font-semibold">
                        {totalVotes} verified votes
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-foreground leading-snug">
                      {campus.poll.question}
                    </p>

                    <div className="space-y-2 pt-0.5">
                      {pollOptions.map((opt) => {
                        const pct = Math.round((opt.votes / totalVotes) * 100);
                        const isVoted = votedOptionId === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleVote(opt.id)}
                            className={cn(
                              "group relative w-full overflow-hidden rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer active:scale-[0.99] min-h-[38px]",
                              isVoted
                                ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                                : "border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/40"
                            )}
                          >
                            {votedOptionId && (
                              <div
                                className="absolute inset-y-0 left-0 bg-primary/20 -z-10 transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            )}
                            <div className="flex items-center justify-between px-3 py-2">
                              <span className={cn(isVoted && "text-primary font-bold")}>{opt.text}</span>
                              {votedOptionId && (
                                <span className="font-mono text-[10px] font-bold text-foreground">
                                  {pct}%
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <p className="text-[10px] text-muted-foreground text-center pt-0.5">
                      {!votedOptionId
                        ? "👆 Tap any option to cast instant live vote"
                        : "✓ Vote recorded on student ledger"}
                    </p>
                  </motion.div>
                )}

                {/* ── 3. PEER MATCH ARTIFACT ── */}
                {activeTab === "match" && (
                  <motion.div
                    key={`match-${campus.id}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="rounded-md bg-rose-500/15 text-rose-500 font-bold px-2 py-0.5 text-[10px]">
                        💘 Campus Match &amp; Crush
                      </span>
                      <span className="rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold">
                        {campus.match.compatibility}% Vibe Match
                      </span>
                    </div>

                    <div className="rounded-2xl border border-border/60 bg-muted/20 p-3.5 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-bold text-foreground">
                          {campus.match.name}
                        </h4>
                        <BadgeCheck className="size-3.5 text-primary fill-primary/20" />
                        <span className="text-[10px] text-muted-foreground">· {campus.match.branch}</span>
                      </div>

                      <p className="text-xs text-foreground font-medium italic">
                        &ldquo;{campus.match.bio}&rdquo;
                      </p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {campus.match.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-md bg-card border border-border/50 px-2 py-0.5 text-[9px] font-semibold text-muted-foreground"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-muted-foreground font-medium">
                        Zero Catfish · College Gatekept
                      </span>
                      <button
                        type="button"
                        onClick={handleSendVibe}
                        className={cn(
                          "flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer active:scale-95",
                          isVibeSent
                            ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                            : "bg-rose-500/15 text-rose-500 hover:bg-rose-500/25 border border-rose-500/30"
                        )}
                      >
                        <Heart className={cn("size-3.5", isVibeSent && "fill-current")} />
                        <span>{isVibeSent ? "Vibe Sent! 💌" : "Send Secret Vibe"}</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── 4. DORM MARKETPLACE ARTIFACT ── */}
                {activeTab === "market" && (
                  <motion.div
                    key={`market-${campus.id}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="rounded-md bg-emerald-500/15 text-emerald-500 font-bold px-2 py-0.5 text-[10px]">
                        🚲 Dorm Marketplace
                      </span>
                      <span className="font-extrabold text-xs text-primary">{campus.market.price}</span>
                    </div>

                    <div className="rounded-2xl border border-border/60 bg-muted/20 p-3.5 space-y-2">
                      <div className="flex items-start gap-2.5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                          <Bike className="size-4.5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">
                            {campus.market.item}
                          </h4>
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
                      <span className="text-[10px] text-muted-foreground font-medium">Hostel handoff</span>
                      <button
                        type="button"
                        onClick={handleMakeOffer}
                        className={cn(
                          "flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer active:scale-95",
                          isOfferMade
                            ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                            : "bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20"
                        )}
                      >
                        <Send className="size-3" />
                        <span>{isOfferMade ? "Offer Pinged! ⚡" : "Make ₹ Offer"}</span>
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
