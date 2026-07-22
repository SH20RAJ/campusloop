"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BarChart3,
  HelpCircle,
  Sparkles,
  Calendar,
  Search,
  Lock,
  Clock,
  Users,
  ArrowUpRight,
  X,
  Heart,
  MessageCircle,
  Share2,
  ThumbsUp,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Check,
  Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

// ──────── Artifact Config ────────

const ARTIFACTS = [
  {
    id: "polls",
    icon: BarChart3,
    title: "Polls",
    description: "Settle canteen debates with live, campus-wide polls.",
    color: "from-amber-500/20 to-orange-500/20",
    borderGlow: "group-hover:border-amber-500/40 group-hover:shadow-amber-500/5",
    accent: "bg-amber-500",
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    iconHover: {
      y: [0, -3, 0],
      scale: [1, 1.08, 1],
      transition: { duration: 0.5, ease: "easeInOut", repeat: Infinity },
    },
    iconRest: {
      y: 0,
      scale: 1,
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
    },
  },
  {
    id: "questions",
    icon: HelpCircle,
    title: "Questions",
    description: "Ask anything — from exam help to where the best chai is.",
    color: "from-blue-500/20 to-cyan-500/20",
    borderGlow: "group-hover:border-blue-500/40 group-hover:shadow-blue-500/5",
    accent: "bg-blue-500",
    iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    iconHover: {
      rotate: [0, -10, 10, -8, 8, -4, 0],
      transition: { duration: 0.7, ease: "easeInOut", repeat: Infinity },
    },
    iconRest: {
      rotate: 0,
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
    },
  },
  {
    id: "memes",
    icon: Sparkles,
    title: "Memes",
    description: "Drop memes only your campus would truly get.",
    color: "from-pink-500/20 to-rose-500/20",
    borderGlow: "group-hover:border-pink-500/40 group-hover:shadow-pink-500/5",
    accent: "bg-pink-500",
    iconBg: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
    iconHover: {
      rotate: [0, 180, 360],
      scale: [1, 1.15, 1],
      transition: { duration: 1.2, ease: "linear", repeat: Infinity },
    },
    iconRest: {
      rotate: 0,
      scale: 1,
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
    },
  },
  {
    id: "events",
    icon: Calendar,
    title: "Events",
    description: "Plan fests, meetups, and surprise birthday parties.",
    color: "from-emerald-500/20 to-teal-500/20",
    borderGlow: "group-hover:border-emerald-500/40 group-hover:shadow-emerald-500/5",
    accent: "bg-emerald-500",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    iconHover: {
      y: [0, -4, 0],
      transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1], repeat: Infinity },
    },
    iconRest: {
      y: 0,
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
    },
  },
  {
    id: "lost-found",
    icon: Search,
    title: "Lost & Found",
    description: "Found a wallet? Lost your ID? Post it and find it.",
    color: "from-purple-500/20 to-violet-500/20",
    borderGlow: "group-hover:border-purple-500/40 group-hover:shadow-purple-500/5",
    accent: "bg-purple-500",
    iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    iconHover: {
      scale: [1, 1.15, 1, 1.15, 1, 1],
      rotate: [0, -3, 3, -3, 3, 0],
      transition: { duration: 0.9, ease: "easeInOut", repeat: Infinity },
    },
    iconRest: {
      scale: 1,
      rotate: 0,
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
    },
  },
  {
    id: "confessions",
    icon: Lock,
    title: "Confessions",
    description: "Speak without a name — what's said in the loop stays.",
    color: "from-red-500/20 to-rose-500/20",
    borderGlow: "group-hover:border-red-500/40 group-hover:shadow-red-500/5",
    accent: "bg-red-500",
    iconBg: "bg-red-500/10 text-red-600 dark:text-red-400",
    iconHover: {
      x: [0, -2, 2, -2, 2, -1, 1, 0],
      transition: { duration: 0.5, ease: "easeInOut", repeat: Infinity },
    },
    iconRest: {
      x: 0,
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
    },
  },
  {
    id: "stories",
    icon: Clock,
    title: "Stories",
    description: "Moments that vanish in 24 hours. No traces, no screenshots.",
    color: "from-orange-500/20 to-yellow-500/20",
    borderGlow: "group-hover:border-orange-500/40 group-hover:shadow-orange-500/5",
    accent: "bg-orange-500",
    iconBg: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    iconHover: {
      rotate: [0, 360],
      transition: { duration: 1.5, ease: "linear", repeat: Infinity },
    },
    iconRest: {
      rotate: 0,
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
    },
  },
  {
    id: "communities",
    icon: Users,
    title: "Communities",
    description: "Find your people — coding club, hostel wing, or book nerds.",
    color: "from-indigo-500/20 to-blue-500/20",
    borderGlow: "group-hover:border-indigo-500/40 group-hover:shadow-indigo-500/5",
    accent: "bg-indigo-500",
    iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    iconHover: {
      scale: [1, 1.12, 0.95, 1.08, 1],
      transition: { duration: 0.8, ease: "easeInOut", repeat: Infinity },
    },
    iconRest: {
      scale: 1,
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
    },
  },
] as const;

type ArtifactId = "polls" | "questions" | "memes" | "events" | "lost-found" | "confessions" | "stories" | "communities";

type ArtifactConfig = {
  readonly id: ArtifactId;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly title: string;
  readonly description: string;
  readonly color: string;
  readonly borderGlow: string;
  readonly accent: string;
  readonly iconBg: string;
  readonly iconHover: Record<string, unknown>;
  readonly iconRest: Record<string, unknown>;
};

// ──────── Poll Demo ────────

function PollDemo() {
  const [voted, setVoted] = useState<string | null>(null);
  const [options, setOptions] = useState([
    { id: "a", text: "Nescafe booth", votes: 212 },
    { id: "b", text: "Sharma ji's juice corner", votes: 168 },
    { id: "c", text: "Main mess, obviously", votes: 74 },
  ]);
  const total = options.reduce((s, o) => s + o.votes, 0);

  function vote(id: string) {
    if (voted) return;
    setVoted(id);
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, votes: o.votes + 1 } : o))
    );
  }

  return (
    <div className="space-y-4">
      <p className="font-heading text-base font-semibold leading-snug">
        Which canteen actually deserves your money?
      </p>
      <div className="space-y-2">
        {options.map((opt) => {
          const pct = Math.round((opt.votes / (total + (voted ? 1 : 0))) * 100);
          const isMine = voted === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => vote(opt.id)}
              disabled={!!voted}
              className={cn(
                "relative w-full overflow-hidden rounded-lg border text-left text-sm transition-all",
                isMine
                  ? "border-primary/40 bg-primary/5"
                  : voted
                    ? "border-border/60 opacity-70"
                    : "border-border hover:border-primary/30 hover:bg-muted/50 cursor-pointer active:scale-[0.98]"
              )}
            >
              {/* Progress bar */}
              {voted && (
                <motion.div
                  className="absolute inset-y-0 left-0 bg-primary/10"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                />
              )}
              <div className="relative flex items-center justify-between px-3 py-2.5">
                <span className={cn("flex items-center gap-2", isMine && "font-semibold text-primary")}>
                  {isMine && <Check className="size-3.5" />}
                  {opt.text}
                </span>
                {voted && (
                  <span className="font-semibold tabular-nums text-muted-foreground">
                    {pct}%
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        {total + (voted ? 1 : 0)} votes so far
        {voted && (
          <span className="text-primary"> &middot; You voted</span>
        )}
      </p>
    </div>
  );
}

// ──────── Questions Demo ────────

function QuestionDemo() {
  const [upvoted, setUpvoted] = useState<string | null>(null);
  const [answers, setAnswers] = useState([
    { id: "a", text: "Check the library lost & found — they keep things for a month before discarding.", upvotes: 24, author: "Ananya", initials: "AN" },
    { id: "b", text: "Try asking on the batch WhatsApp group. Someone usually picks it up.", upvotes: 18, author: "Rahul", initials: "RH" },
  ]);

  function handleUpvote(id: string) {
    if (upvoted === id) {
      setUpvoted(null);
      setAnswers((prev) =>
        prev.map((a) => (a.id === id ? { ...a, upvotes: a.upvotes - 1 } : a))
      );
    } else {
      if (upvoted) {
        setAnswers((prev) =>
          prev.map((a) => (a.id === upvoted ? { ...a, upvotes: a.upvotes - 1 } : a))
        );
      }
      setUpvoted(id);
      setAnswers((prev) =>
        prev.map((a) => (a.id === id ? { ...a, upvotes: a.upvotes + 1 } : a))
      );
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-3">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Question
        </p>
        <p className="text-sm font-medium leading-snug">
          Lost my grey water bottle with a &ldquo;CAT 2026&rdquo; sticker — has anyone seen it around the library?
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Asked by <span className="font-medium text-foreground">Priya S.</span> &middot; 2h ago
        </p>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {answers.length} answers
      </p>
      <div className="space-y-2">
        {answers.map((answer) => (
          <div
            key={answer.id}
            className="rounded-lg border border-border p-3 transition-all hover:border-border/80"
          >
            <div className="mb-2 flex items-center gap-2">
              <Avatar className="size-5">
                <AvatarFallback className="text-[9px] font-semibold bg-primary/10 text-primary">
                  {answer.initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium">{answer.author}</span>
            </div>
            <p className="mb-2 text-xs leading-relaxed text-muted-foreground">
              {answer.text}
            </p>
            <button
              onClick={() => handleUpvote(answer.id)}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-all",
                upvoted === answer.id
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <ThumbsUp className={cn("size-3", upvoted === answer.id && "fill-primary")} />
              {answer.upvotes}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────── Meme Demo ────────

function MemeDemo() {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(342);

  function toggleLike() {
    setLiked((p) => !p);
    setLikes((p) => (liked ? p - 1 : p + 1));
  }

  return (
    <div className="space-y-3">
      {/* Meme Header */}
      <div className="flex items-center gap-2.5">
        <Avatar className="size-8">
          <AvatarFallback className="bg-pink-500/10 text-pink-500 font-bold text-xs">
            ME
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-xs font-semibold">meme_engineer</p>
          <p className="text-[10px] text-muted-foreground">IIT Delhi &middot; 3h ago</p>
        </div>
      </div>

      {/* Meme Body */}
      <div className="overflow-hidden rounded-lg border border-border bg-muted/20">
        <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-pink-500/10 via-rose-500/5 to-purple-500/10">
          <div className="flex flex-col items-center gap-2 text-center">
            <Sparkles className="size-8 text-pink-400/60" />
            <div className="space-y-1">
              <p className="text-sm font-bold leading-tight text-foreground/80">
                When the professor says
              </p>
              <p className="text-lg font-black leading-tight text-foreground">
                &ldquo;This won&apos;t be on the exam&rdquo;
              </p>
              <p className="text-sm font-bold leading-tight text-foreground/80">
                and it&apos;s 60% of the paper
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Meme Actions */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <button
          onClick={toggleLike}
          className={cn(
            "flex cursor-pointer items-center gap-1.5 transition-all hover:text-pink-500",
            liked && "text-pink-500"
          )}
        >
          <Heart className={cn("size-4", liked && "fill-pink-500")} />
          <span className="font-semibold tabular-nums">{likes}</span>
        </button>
        <span className="flex items-center gap-1.5">
          <MessageCircle className="size-4" />
          <span className="font-semibold tabular-nums">89</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Share2 className="size-4" />
          <span className="font-semibold tabular-nums">24</span>
        </span>
      </div>
    </div>
  );
}

// ──────── Event Demo ────────

function EventDemo() {
  const [interested, setInterested] = useState(false);
  const [count, setCount] = useState(47);

  function toggleInterested() {
    setInterested((p) => !p);
    setCount((p) => (interested ? p - 1 : p + 1));
  }

  return (
    <div className="space-y-4">
      {/* Date Badge */}
      <div className="flex items-center gap-3">
        <div className="flex w-14 flex-col items-center rounded-xl border border-border bg-muted/30 py-2">
          <span className="text-[10px] font-semibold uppercase text-muted-foreground">Apr</span>
          <span className="text-xl font-bold leading-none tracking-tight">15</span>
        </div>
        <div>
          <p className="font-heading text-base font-semibold leading-snug">
            Spring Fest &apos;26
          </p>
          <p className="text-xs text-muted-foreground">Main Auditorium &middot; 4:00 PM</p>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Live bands, food stalls, and the annual talent show. Open for all
        verified students. Bring your campus ID.
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {["Music", "Food", "Talent Show"].map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Attendees */}
      <div className="flex items-center gap-2">
        <div className="flex -space-x-1.5">
          {["AK", "RS", "PM", "+"].map((init, i) => (
            <div
              key={i}
              className={cn(
                "flex size-6 items-center justify-center rounded-full border-2 border-background text-[9px] font-semibold",
                init === "+"
                  ? "bg-muted text-muted-foreground"
                  : "bg-primary/10 text-primary"
              )}
            >
              {init}
            </div>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">{count} interested</span>
      </div>

      <Button
        variant={interested ? "default" : "outline"}
        size="sm"
        onClick={toggleInterested}
        className={cn(
          "w-full transition-all",
          interested && "bg-emerald-600 hover:bg-emerald-700"
        )}
      >
        {interested ? (
          <>
            <Check className="size-3.5" /> Going
          </>
        ) : (
          <>
            <Calendar className="size-3.5" /> Interested
          </>
        )}
      </Button>
    </div>
  );
}

// ──────── Lost & Found Demo ────────

function LostFoundDemo() {
  const [claimed, setClaimed] = useState(false);
  const [fading, setFading] = useState(false);

  function handleClaim() {
    setClaimed(true);
    setFading(true);
    setTimeout(() => setFading(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-purple-500/10">
          <Search className="size-5 text-purple-500" />
        </div>
        <div className="min-w-0">
          <p className="font-heading text-base font-semibold leading-snug">
            Found: Black Wallet
          </p>
          <p className="text-xs text-muted-foreground">
            Near the library entrance &middot; 30m ago
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-muted/20 p-3">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Found a black leather wallet near the library turnstile around 2:30 PM.
          Has an ID card and some cash. Tell me what&apos;s inside to claim it.
        </p>
      </div>

      <AnimatePresence>
        {!claimed ? (
          <motion.div
            key="claim-btn"
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="default"
              size="sm"
              onClick={handleClaim}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Eye className="size-3.5" /> This is mine
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="claimed-msg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={cn(
              "rounded-lg p-3 text-center text-xs font-medium transition-opacity",
              fading ? "opacity-100" : "opacity-80",
              "bg-purple-500/10 text-purple-600 dark:text-purple-400"
            )}>
              <Check className="mx-auto mb-1 size-5" />
              Owner notified! You&apos;ll get a match if the details line up.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ──────── Confession Demo ────────

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /\b\d{10}\b/g;

function anonKey(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return "anon_" + Math.abs(h).toString(16).padStart(8, "0").slice(0, 8);
}

function ConfessionDemo() {
  const [text, setText] = useState("");
  const scrubbed = text.replace(PHONE_RE, "[removed]").replace(EMAIL_RE, "[removed]");
  const hadPii = scrubbed !== text;

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a secret confession... try adding a phone or email!"
        rows={2}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs placeholder:text-muted-foreground/60 focus:border-red-500/30 focus:outline-none focus:ring-1 focus:ring-red-500/20 transition-all resize-none"
      />

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border/40 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <div className="flex size-5 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-[7px] font-bold text-white">
              {text ? anonKey(text).slice(5, 7).toUpperCase() : "??"}
            </div>
            <span className="text-[10px] font-mono font-bold">
              {text ? anonKey(text) : "anon_user"}
            </span>
          </div>
          <Badge className="bg-red-500/10 text-red-500 border-none text-[8px] px-1.5 py-0">
            Just Now
          </Badge>
        </div>
        <div className="px-3 py-2.5 min-h-[40px]">
          {text ? (
            <p className="text-xs leading-relaxed whitespace-pre-wrap">{scrubbed}</p>
          ) : (
            <p className="text-xs italic text-muted-foreground/60">
              Your secret appears here, scrubbed of PII...
            </p>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-border/40 px-3 py-1.5">
          <div className="flex items-center gap-1">
            {!text ? (
              <ShieldCheck className="size-3 text-muted-foreground/50" />
            ) : hadPii ? (
              <ShieldAlert className="size-3 text-amber-500 animate-pulse" />
            ) : (
              <ShieldCheck className="size-3 text-emerald-500" />
            )}
            <span className="text-[9px] text-muted-foreground">
              {!text ? "Idle" : hadPii ? "Redacted" : "Clean"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Heart className="size-2.5" /> 12
            </span>
            <span className="flex items-center gap-0.5">
              <MessageCircle className="size-2.5" /> 4
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────── Story Demo ────────

const STORIES = [
  { id: "s1", user: "Aditi", initials: "AD", color: "from-rose-500 to-orange-500", viewed: false },
  { id: "s2", user: "Rohan", initials: "RO", color: "from-blue-500 to-cyan-500", viewed: false },
  { id: "s3", user: "Meera", initials: "ME", color: "from-purple-500 to-pink-500", viewed: false },
  { id: "s4", user: "Karan", initials: "KA", color: "from-emerald-500 to-teal-500", viewed: false },
  { id: "s5", user: "Simran", initials: "SI", color: "from-amber-500 to-red-500", viewed: false },
];

function StoryDemo() {
  const [viewing, setViewing] = useState<string | null>(null);
  const [viewed, setViewed] = useState<Set<string>>(new Set());
  const stories = STORIES.map((s) => ({ ...s, viewed: viewed.has(s.id) }));

  function openStory(id: string) {
    setViewing(id);
    setViewed((prev) => new Set(prev).add(id));
    setTimeout(() => setViewing(null), 2500);
  }

  return (
    <div className="space-y-3">
      {/* Story Rings */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {stories.map((story) => (
          <button
            key={story.id}
            onClick={() => openStory(story.id)}
            className="flex cursor-pointer flex-col items-center gap-1 transition-transform active:scale-90"
          >
            <div className={cn(
              "rounded-full p-[2px] bg-gradient-to-br transition-all duration-300",
              story.viewed ? "from-gray-400 to-gray-300" : story.color,
              viewing === story.id && "scale-110"
            )}>
              <div className="flex size-12 items-center justify-center rounded-full bg-card">
                <span className={cn(
                  "text-xs font-bold",
                  story.viewed ? "text-muted-foreground" : "text-foreground"
                )}>
                  {story.initials}
                </span>
              </div>
            </div>
            <span className={cn(
              "text-[9px] font-medium",
              story.viewed ? "text-muted-foreground/60" : "text-muted-foreground"
            )}>
              {story.user}
            </span>
          </button>
        ))}
      </div>

      {/* Story Viewer Overlay */}
      <AnimatePresence>
        {viewing && (
          <motion.div
            key={viewing}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-xl border border-border"
          >
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 z-10 h-0.5 bg-white/20">
              <motion.div
                className="h-full bg-white"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.5, ease: "linear" }}
              />
            </div>

            {/* Content */}
            <div className="flex aspect-[3/1] items-center justify-center bg-gradient-to-br from-gray-900 via-primary/20 to-gray-900 px-4">
              <div className="text-center">
                <p className="text-sm font-semibold text-white/90">
                  Morning library grind 🫠
                </p>
                <p className="mt-1 text-xs text-white/50">
                  {stories.find((s) => s.id === viewing)?.user} &middot; 2h ago
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-center text-[10px] text-muted-foreground">
        Tap a story ring to watch it disappear
      </p>
    </div>
  );
}

// ──────── Communities Demo ────────

function CommunityDemo() {
  const [joined, setJoined] = useState(false);
  const [memberCount, setMemberCount] = useState(142);

  function toggleJoin() {
    setJoined((p) => !p);
    setMemberCount((p) => (joined ? p - 1 : p + 1));
  }

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-indigo-500/20 via-blue-500/10 to-indigo-500/20 p-4">
        <div className="pointer-events-none absolute -right-4 -top-4 size-20 rounded-full bg-indigo-500/10 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-500/20">
            <Users className="size-5 text-indigo-500" />
          </div>
          <div>
            <p className="font-heading text-sm font-bold leading-tight text-foreground">
              Coding@Campus
            </p>
            <p className="text-[10px] text-muted-foreground">Tech community</p>
          </div>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        LeetCode grinders, hackathon warriors, and people who think tabs are
        better than spaces. Weekly DSA sessions every Saturday.
      </p>

      {/* Members */}
      <div className="flex items-center gap-2">
        <div className="flex -space-x-1.5">
          {["AK", "RS", "PM", "SD", "JT"].map((init, i) => (
            <div
              key={i}
              className="flex size-6 items-center justify-center rounded-full border-2 border-background bg-indigo-500/10 text-[9px] font-semibold text-indigo-500"
            >
              {init}
            </div>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{memberCount}</span> members
        </span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {["DSA", "Web Dev", "Open Source"].map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-600 dark:text-indigo-400"
          >
            {tag}
          </span>
        ))}
      </div>

      <Button
        variant={joined ? "default" : "outline"}
        size="sm"
        onClick={toggleJoin}
        className={cn(
          "w-full transition-all",
          joined && "bg-indigo-600 hover:bg-indigo-700"
        )}
      >
        {joined ? (
          <>
            <Check className="size-3.5" /> Joined
          </>
        ) : (
          <>
            <UserPlus className="size-3.5" /> Join Community
          </>
        )}
      </Button>
    </div>
  );
}

// ──────── Demo Router ────────

function DemoContent({ id }: { id: ArtifactId }) {
  switch (id) {
    case "polls":
      return <PollDemo />;
    case "questions":
      return <QuestionDemo />;
    case "memes":
      return <MemeDemo />;
    case "events":
      return <EventDemo />;
    case "lost-found":
      return <LostFoundDemo />;
    case "confessions":
      return <ConfessionDemo />;
    case "stories":
      return <StoryDemo />;
    case "communities":
      return <CommunityDemo />;
  }
}

// ──────── Artifact Card ────────

function ArtifactCard({
  artifact,
  index,
  onClick,
}: {
  artifact: ArtifactConfig;
  index: number;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className="group relative cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
    >
      {/* Gradient background that appears on hover */}
      <div
        className={cn(
          "pointer-events-none absolute -inset-px rounded-xl opacity-0 blur-sm transition-opacity duration-500",
          "bg-gradient-to-br",
          artifact.color,
          isHovered && "opacity-100"
        )}
      />

      {/* Card */}
      <div
        className={cn(
          "relative rounded-xl border border-border bg-card p-5 transition-all duration-300",
          "shadow-sm hover:shadow-md",
          "hover:-translate-y-0.5",
          artifact.borderGlow
        )}
      >
        {/* Accent bar at top */}
        <div
          className={cn(
            "absolute left-3 right-3 top-0 h-0.5 scale-x-0 rounded-full transition-transform duration-300",
            artifact.accent,
            "group-hover:scale-x-100"
          )}
          style={{ transformOrigin: "left" }}
        />

        {/* Corner indicator */}
        <div className="absolute right-3 top-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <ArrowUpRight className="size-3.5 text-muted-foreground" />
        </div>

        {/* Icon with hover animation */}
        <div
          className={cn(
            "mb-3 flex size-10 items-center justify-center rounded-lg transition-all duration-300",
            artifact.iconBg,
            "group-hover:shadow-lg"
          )}
        >
          <motion.div
            animate={(isHovered ? artifact.iconHover : artifact.iconRest) as any}
            className="flex items-center justify-center"
          >
            <artifact.icon className="size-5" />
          </motion.div>
        </div>

        {/* Content */}
        <h3 className="mb-1.5 font-heading text-sm font-semibold tracking-tight">
          {artifact.title}
        </h3>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {artifact.description}
        </p>
      </div>
    </motion.button>
  );
}

// ──────── Overlay Modal ────────

function OverlayModal({
  artifact,
  onClose,
}: {
  artifact: ArtifactConfig | null;
  onClose: () => void;
}) {
  // Capture escape key and lock body scroll
  useEffect(() => {
    if (!artifact) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [artifact, onClose]);

  return (
    <AnimatePresence>
      {artifact && (
        <motion.div
          key="overlay-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            key={artifact.id}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg"
          >
            <Card className="max-h-[85vh] overflow-y-auto shadow-2xl">
              <CardContent className="space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex size-10 items-center justify-center rounded-lg",
                        artifact.iconBg
                      )}
                    >
                      <artifact.icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-base font-semibold tracking-tight">
                        {artifact.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Click around — this is a live preview
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Close demo"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>

                {/* Divider */}
                <div className="border-t border-border/60" />

                {/* Demo Content */}
                <DemoContent id={artifact.id} />

                {/* Footer */}
                <div className="border-t border-border/60 pt-3">
                  <p className="text-center text-[10px] text-muted-foreground">
                    This is a preview. Real content lives inside the campus loop.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ──────── Main Export ────────

export function ArtifactsShowcase() {
  const [activeArtifact, setActiveArtifact] = useState<ArtifactId | null>(null);

  const selected = activeArtifact
    ? ARTIFACTS.find((a) => a.id === activeArtifact) ?? null
    : null;

  return (
    <section className="border-t border-border/60">
      <div className="mx-auto w-full max-w-6xl px-6 py-24">
        <Reveal className="max-w-xl space-y-3 pb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            What you can create
          </p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Eight ways to shape the loop.
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Click any artifact to see a live preview. From anonymous whispers to
            campus-wide polls — every post builds your campus vibe.
          </p>
        </Reveal>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ARTIFACTS.map((artifact, i) => (
            <ArtifactCard
              key={artifact.id}
              artifact={artifact}
              index={i}
              onClick={() => setActiveArtifact(artifact.id)}
            />
          ))}
        </div>

        {/* Bottom stripe */}
        <Reveal delay={0.15} className="pt-12">
          <div className="relative overflow-hidden rounded-xl border border-border/60 bg-muted/20 px-6 py-5">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
            <div className="relative flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">One account.</span>{" "}
                Every artifact. Zero compromises on privacy.
              </p>
              <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-primary">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
                All verified
              </span>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Interactive Overlay */}
      <OverlayModal
        artifact={selected}
        onClose={() => setActiveArtifact(null)}
      />
    </section>
  );
}
