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
  Radio,
  School,
  Send,
  ShieldCheck,
  Sparkles,
  Vote,
  Zap,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

// ── Featured Indian Campuses Data for Interactive Live Simulator ──
const FEATURED_CAMPUSES = [
  {
    id: "bit-mesra",
    name: "BIT Mesra",
    shortName: "BITM",
    location: "Ranchi, Jharkhand",
    gradient: "from-blue-500 to-indigo-600",
    pillColor: "border-blue-500/30 text-blue-400 bg-blue-500/10",
    stats: { activeStudents: "4,280", postsToday: 142 },
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
  },
  {
    id: "iit-delhi",
    name: "IIT Delhi",
    shortName: "IITD",
    location: "Hauz Khas, New Delhi",
    gradient: "from-indigo-500 to-purple-600",
    pillColor: "border-indigo-500/30 text-indigo-400 bg-indigo-500/10",
    stats: { activeStudents: "6,920", postsToday: 284 },
    confession: {
      anonId: "anon_iitd_44",
      text: "Library 2nd floor AC is literally set to North Pole subzero temperatures. I am once again studying microprocessors in a puffer jacket in May 😭",
      likes: 426,
      replies: 62,
      topic: "#midsems",
    },
    poll: {
      question: "Best late-night food rescue in North/South campus?",
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
  },
  {
    id: "bits-pilani",
    name: "BITS Pilani",
    shortName: "BITS",
    location: "Pilani, Rajasthan",
    gradient: "from-amber-500 to-rose-600",
    pillColor: "border-amber-500/30 text-amber-400 bg-amber-500/10",
    stats: { activeStudents: "5,400", postsToday: 198 },
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
        { id: "hostel_mess", text: "Hostel Maggi in room kettle", votes: 110 },
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
  },
  {
    id: "vit-vellore",
    name: "VIT Vellore",
    shortName: "VIT",
    location: "Vellore, Tamil Nadu",
    gradient: "from-emerald-500 to-teal-600",
    pillColor: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
    stats: { activeStudents: "8,150", postsToday: 320 },
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
  },
  {
    id: "iit-bombay",
    name: "IIT Bombay",
    shortName: "IITB",
    location: "Powai, Mumbai",
    gradient: "from-rose-500 to-orange-600",
    pillColor: "border-rose-500/30 text-rose-400 bg-rose-500/10",
    stats: { activeStudents: "7,310", postsToday: 260 },
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
  },
] as const;

type FeatureTab = "confession" | "poll" | "match" | "market";

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

const FEATURE_TABS: { id: FeatureTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "confession", label: "Confessions", icon: Lock },
  { id: "poll", label: "Canteen Polls", icon: Vote },
  { id: "match", label: "Peer Match", icon: Sparkles },
  { id: "market", label: "Dorm Market", icon: Bike },
];

export function CreativeHero({ isAuthenticated }: { isAuthenticated: boolean }) {
  const reduce = useReducedMotion();

  // State
  const [activeCampusIndex, setActiveCampusIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<FeatureTab>("confession");
  const [isPaused, setIsPaused] = useState(false);

  // Active Campus Data
  const campus = FEATURED_CAMPUSES[activeCampusIndex];

  // Poll interactive state
  const [votedId, setVotedId] = useState<string | null>(null);
  const [pollOptions, setPollOptions] = useState<PollOption[]>(() => [...campus.poll.options]);

  // Confession like interactive state
  const [confessionLiked, setConfessionLiked] = useState(false);
  const [confessionLikes, setConfessionLikes] = useState<number>(campus.confession.likes);

  // Match interactive state
  const [matchLiked, setMatchLiked] = useState(false);

  // Sync poll options and confession likes when switching campus
  useEffect(() => {
    setPollOptions([...campus.poll.options]);
    setVotedId(null);
    setConfessionLikes(campus.confession.likes);
    setConfessionLiked(false);
    setMatchLiked(false);
  }, [campus]);

  // Auto-cycle tabs every 6 seconds unless hovered
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setActiveTab((prev) => {
        const order: FeatureTab[] = ["confession", "poll", "match", "market"];
        const nextIdx = (order.indexOf(prev) + 1) % order.length;
        return order[nextIdx];
      });
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  // 3D Parallax Tilt
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [4, -4]), {
    stiffness: 160,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-4, 4]), {
    stiffness: 160,
    damping: 22,
  });

  function handleTilt(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  }

  function resetTilt() {
    mx.set(0.5);
    my.set(0.5);
  }

  // Interactive Poll Vote
  function handleVote(optId: string) {
    if (votedId) return;
    sounds.pop();
    haptics.light();
    setVotedId(optId);
    setPollOptions((prev) =>
      prev.map((opt) => (opt.id === optId ? { ...opt, votes: opt.votes + 1 } : opt))
    );
  }

  // Interactive Like Confession
  function handleLikeConfession() {
    sounds.pop();
    haptics.light();
    setConfessionLiked((prev) => !prev);
    setConfessionLikes((prev) => (confessionLiked ? prev - 1 : prev + 1));
  }

  // Interactive Match Send Vibe
  function handleMatchLike() {
    sounds.ting();
    haptics.match();
    setMatchLiked((prev) => !prev);
  }

  // Handle campus selection chip
  function selectCampus(index: number) {
    sounds.tap();
    haptics.light();
    setActiveCampusIndex(index);
  }

  // Handle Tab Change
  function selectTab(tab: FeatureTab) {
    sounds.tap();
    haptics.light();
    setActiveTab(tab);
  }

  const totalPollVotes = pollOptions.reduce((acc, curr) => acc + curr.votes, 0);

  return (
    <section className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 pt-28 pb-20 sm:pt-32 sm:pb-24 overflow-hidden">
      {/* ── Ambient Background Lighting ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[520px] w-[800px] -translate-x-1/2 rounded-full bg-linear-to-b from-indigo-500/20 via-purple-500/10 to-transparent blur-3xl opacity-75"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -left-40 -z-10 h-[380px] w-[380px] rounded-full bg-rose-500/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -right-40 -z-10 h-[380px] w-[380px] rounded-full bg-cyan-500/10 blur-3xl"
      />

      {/* ── Micro-Grid Texture Overlay ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_15%,#000_65%,transparent_100%)]"
      />

      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8 xl:gap-12">
        {/* ──────── LEFT COLUMN: Value Proposition & Interactive Chips ──────── */}
        <div className="space-y-6 lg:col-span-6 lg:pr-2">
          {/* Live Campus Radar Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 backdrop-blur-md transition-all hover:border-primary/40">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-bold tracking-wide uppercase text-foreground/90">
              Live on 1,350+ Indian Colleges
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-xs font-semibold text-primary">Zero Outsiders</span>
          </div>

          {/* Headline with Rich Typography & Gradient Accent */}
          <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-[58px] leading-[1.06]">
            Your campus.
            <br />
            <span className="bg-linear-to-r from-primary via-violet-400 to-indigo-400 bg-clip-text text-transparent italic drop-shadow-xs">
              Completely unfiltered.
            </span>
          </h1>

          {/* Concise, punchy student-centric description */}
          <p className="max-w-xl text-base sm:text-lg leading-relaxed text-muted-foreground">
            The private collegiate network for Indian students. Settle canteen Maggi debates, spill anonymous
            confessions safely, buy and sell dorm gear, discover campus fests, and vibe match — gated strictly by{" "}
            <span className="font-semibold text-foreground">.ac.in college email</span>.
          </p>

          {/* ── Interactive Live Campus Simulator Pills ── */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
              <Radio className="size-3.5 text-primary animate-pulse" />
              <span>Tap a campus to preview live feed:</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {FEATURED_CAMPUSES.map((c, idx) => {
                const isSelected = activeCampusIndex === idx;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectCampus(idx)}
                    className={cn(
                      "group relative flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all active:scale-95",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/25 font-bold"
                        : "border-border/70 bg-card/60 text-muted-foreground hover:border-border hover:bg-card hover:text-foreground backdrop-blur-xs"
                    )}
                  >
                    <span className="font-mono text-[11px] opacity-80">{c.shortName}</span>
                    <span className="hidden sm:inline font-normal opacity-90">{c.name}</span>
                    {isSelected && (
                      <span className="relative flex size-1.5 ml-0.5">
                        <span className="size-1.5 rounded-full bg-white animate-pulse" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── CTAs & Actions ── */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            {isAuthenticated ? (
              <Link
                href="/app"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "relative group overflow-hidden gap-2 rounded-xl px-6 font-bold shadow-lg shadow-primary/20 text-base"
                )}
              >
                Open CampusLoop
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <Link
                href="/handler/sign-up"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "relative group overflow-hidden gap-2 rounded-xl px-6 font-bold shadow-lg shadow-primary/20 text-base"
                )}
              >
                Get verified with college email
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}

            <Link
              href="/colleges"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "rounded-xl border-border/80 bg-background/50 backdrop-blur-md hover:bg-card text-foreground font-semibold px-5"
              )}
            >
              <School className="size-4 mr-1.5 text-primary" />
              Explore 1,350+ Hubs
            </Link>
          </div>

          {/* Aspirant / Read-Only Notice */}
          {!isAuthenticated && (
            <p className="text-xs text-muted-foreground">
              JEE/NEET aspirant or prospective student?{" "}
              <Link href="/handler/sign-up" className="font-bold text-primary hover:underline">
                Browse in Viewer Mode
              </Link>{" "}
              with any personal email — read-only access.
            </p>
          )}

          {/* ── Trust Pillars & Student Social Proof ── */}
          <div className="pt-2 border-t border-border/50">
            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
                <span>100% .ac.in / .edu Verified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="size-4 text-primary shrink-0" />
                <span>Salted HMAC Identity Vault</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="size-4 text-indigo-400 shrink-0" />
                <span>No Recruiters or Faculty</span>
              </div>
            </div>
          </div>
        </div>

        {/* ──────── RIGHT COLUMN: Bezel-less Interactive CampusDeck Simulator ──────── */}
        <div
          className="relative lg:col-span-6 select-none"
          style={{ perspective: 1100 }}
          onMouseMove={handleTilt}
          onMouseLeave={() => {
            resetTilt();
            setIsPaused(false);
          }}
          onMouseEnter={() => setIsPaused(true)}
        >
          <motion.div
            style={reduce ? {} : { rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative mx-auto w-full max-w-lg"
          >
            {/* Ambient Glow behind Device */}
            <div
              aria-hidden="true"
              className="absolute -inset-2 rounded-3xl bg-linear-to-tr from-primary/20 via-indigo-500/15 to-purple-500/20 opacity-70 blur-2xl -z-10"
            />

            {/* ── Glassmorphic Campus Simulator Shell ── */}
            <div className="relative overflow-hidden rounded-2xl border border-white/15 dark:border-white/10 bg-card/90 dark:bg-card/80 p-4 sm:p-5 shadow-2xl backdrop-blur-xl">
              {/* Simulated Device Top Bar */}
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-linear-to-br from-primary to-indigo-600 font-black text-white text-[11px] shadow-xs">
                    CL
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-extrabold text-foreground">{campus.name}</span>
                      <BadgeCheck className="size-3.5 text-primary fill-primary/20" />
                    </div>
                    <p className="text-[10px] text-muted-foreground">{campus.location}</p>
                  </div>
                </div>

                {/* Real-Time Campus Activity Pill */}
                <div className="flex items-center gap-1.5 rounded-full bg-muted/60 border border-border/50 px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{campus.stats.activeStudents} active</span>
                </div>
              </div>

              {/* ── Feature Tabs Navigator Inside Device ── */}
              <div className="grid grid-cols-4 gap-1.5 py-3 border-b border-border/40">
                {FEATURE_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => selectTab(tab.id)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-xl py-2 px-1 text-[11px] font-bold transition-all cursor-pointer",
                        isActive
                          ? "bg-primary/15 text-primary shadow-xs border border-primary/30"
                          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground border border-transparent"
                      )}
                    >
                      <Icon className={cn("size-4", isActive && "stroke-[2.5px]")} />
                      <span className="truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* ── Interactive Feature Content Window ── */}
              <div className="min-h-[285px] sm:min-h-[295px] pt-3 relative">
                <AnimatePresence mode="wait">
                  {/* ── TAB 1: Anonymous Confession ── */}
                  {activeTab === "confession" && (
                    <motion.div
                      key={`confession-${campus.id}`}
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -12, scale: 0.98 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 text-[10px] font-extrabold text-purple-400">
                            🎭 Anonymous Confession
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {campus.confession.anonId}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-primary">{campus.confession.topic}</span>
                      </div>

                      <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                        <p className="text-xs sm:text-sm leading-relaxed text-foreground italic">
                          &ldquo;{campus.confession.text}&rdquo;
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs text-muted-foreground">
                        <button
                          type="button"
                          onClick={handleLikeConfession}
                          className={cn(
                            "flex items-center gap-1.5 rounded-lg px-2.5 py-1 transition-all cursor-pointer hover:bg-muted/40",
                            confessionLiked ? "text-primary font-bold" : "text-muted-foreground"
                          )}
                        >
                          <Heart className={cn("size-4", confessionLiked && "fill-primary")} />
                          <span>{confessionLikes}</span>
                        </button>

                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <MessageCircle className="size-3.5" />
                            <span>{campus.confession.replies} replies</span>
                          </span>
                          <span className="flex items-center gap-1 text-primary">
                            <Lock className="size-3.5" />
                            <span className="text-[10px] font-bold">HMAC Encrypted</span>
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ── TAB 2: Canteen Poll ── */}
                  {activeTab === "poll" && (
                    <motion.div
                      key={`poll-${campus.id}`}
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -12, scale: 0.98 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-extrabold text-amber-500">
                          📊 Live Campus Debate
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          {totalPollVotes} votes
                        </span>
                      </div>

                      <p className="font-heading text-sm font-bold text-foreground leading-snug">
                        {campus.poll.question}
                      </p>

                      <div className="space-y-2 pt-1">
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
                                  : "border-border/60 bg-muted/25 hover:border-primary/40 hover:bg-muted/40"
                              )}
                            >
                              {votedId && (
                                <motion.div
                                  className="absolute inset-y-0 left-0 bg-primary/20 -z-10"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                />
                              )}
                              <div className="flex items-center justify-between px-3.5 py-2.5">
                                <span className={cn(isVoted && "text-primary font-bold")}>{opt.text}</span>
                                {votedId && (
                                  <span className="font-mono text-[11px] font-bold text-foreground">{pct}%</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <p className="text-[10px] text-muted-foreground text-center pt-1">
                        {!votedId ? "👆 Tap an option to vote instantly" : "✓ Your vote has been recorded securely"}
                      </p>
                    </motion.div>
                  )}

                  {/* ── TAB 3: Peer Match Deck ── */}
                  {activeTab === "match" && (
                    <motion.div
                      key={`match-${campus.id}`}
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -12, scale: 0.98 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-md bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-[10px] font-extrabold text-rose-400">
                          ✨ Campus Match Deck
                        </span>
                        <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          {campus.match.compatibility}% Vibe Match
                        </span>
                      </div>

                      <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-sm font-bold text-foreground">{campus.match.name}</h3>
                              <BadgeCheck className="size-3.5 text-primary fill-primary/20" />
                            </div>
                            <p className="text-[11px] text-muted-foreground">{campus.match.branch}</p>
                          </div>
                        </div>

                        <p className="text-xs leading-relaxed text-foreground italic">
                          &ldquo;{campus.match.bio}&rdquo;
                        </p>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {campus.match.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md bg-card border border-border/50 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-border/40">
                        <span className="text-[10px] text-muted-foreground font-medium">
                          Zero-Catfish · College Verified
                        </span>
                        <button
                          type="button"
                          onClick={handleMatchLike}
                          className={cn(
                            "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer",
                            matchLiked
                              ? "bg-rose-500 text-white shadow-md shadow-rose-500/30"
                              : "bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/30"
                          )}
                        >
                          <Heart className={cn("size-3.5", matchLiked && "fill-current")} />
                          <span>{matchLiked ? "Vibe Sent! 💖" : "Send Vibe"}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ── TAB 4: Dorm Marketplace ── */}
                  {activeTab === "market" && (
                    <motion.div
                      key={`market-${campus.id}`}
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -12, scale: 0.98 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-extrabold text-emerald-400">
                          🛍️ Student Dorm Marketplace
                        </span>
                        <span className="font-extrabold text-xs text-primary">{campus.market.price}</span>
                      </div>

                      <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                            <Bike className="size-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-foreground leading-snug">
                              {campus.market.item}
                            </h4>
                            <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                              {campus.market.desc}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1 font-medium">
                            <CheckCircle2 className="size-3 text-emerald-500" />
                            {campus.market.seller}
                          </span>
                          <span className="font-bold text-foreground">1-Tap Student UPI</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <span className="text-muted-foreground text-[10px]">Direct hostel exchange</span>
                        <button
                          type="button"
                          onClick={() => {
                            sounds.ting();
                            haptics.light();
                          }}
                          className="flex items-center gap-1 rounded-lg bg-primary/10 border border-primary/30 px-2.5 py-1 text-[10px] font-bold text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                        >
                          <Send className="size-3" />
                          <span>Chat with Seller</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Floating Micro Achievement Pill ── */}
              <div className="mt-3 flex items-center justify-between rounded-xl bg-card/90 border border-border/60 p-2.5 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-full bg-amber-500/15 text-amber-500">
                    <Zap className="size-3.5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-foreground leading-none">
                      Loop Points (LP) Active
                    </p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">
                      Earn +20 LP for helpful canteen answers
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] font-extrabold text-amber-500 border-amber-500/30">
                  Tier 3 Star
                </Badge>
              </div>
            </div>

            {/* ── Floating Side Micro-Card (Campus Notification) ── */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="absolute -bottom-5 -right-3 sm:-right-6 z-20 w-56 sm:w-60 rounded-xl border border-border/80 bg-card/95 p-3 shadow-2xl backdrop-blur-md hidden sm:block"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-[10px] font-bold text-primary">
                  <Sparkles className="size-3" />
                  Live Event Ping
                </span>
                <span className="text-[9px] text-muted-foreground">2m ago</span>
              </div>
              <p className="text-[11px] font-medium text-foreground leading-snug mt-1">
                HackBIT 2026 team registrations just crossed 800+ hackers!
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
