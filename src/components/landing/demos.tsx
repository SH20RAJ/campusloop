"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Heart,
  X,
  ShieldCheck,
  ShieldAlert,
  MessageSquare,
  Vote,
  UserPlus,
  MailCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

export function ConfessionDemo() {
  const [text, setText] = useState("");
  const scrubbed = text
    .replace(PHONE_RE, "[removed]")
    .replace(EMAIL_RE, "[removed]");
  const hadPii = scrubbed !== text;

  const presets = [
    {
      label: "Crush contact",
      text: "Lost my heart to the senior in library. Call me at 9876543210 if you see this!",
    },
    {
      label: "Lost item email",
      text: "Found keychains at canteen. Email me at sneakypeek@iitb.ac.in to get them.",
    },
    {
      label: "Clean confession",
      text: "Samosa prices in the canteen are rising faster than our BTech placements. Unacceptable!",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-5 items-start mt-2">
      {/* Interactive Input Area */}
      <div className="md:col-span-3 space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="confession-demo"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Write a mock confession
          </label>
          <textarea
            id="confession-demo"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type anything... e.g. call me on 9876543210 or email sneakypeek@iitb.ac.in"
            rows={3}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all resize-none shadow-sm"
          />
        </div>

        {/* Presets */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Or click a demo preset:</p>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => setText(preset.text)}
                className="rounded-lg border border-border bg-background hover:bg-muted/50 hover:border-primary/30 px-3 py-1.5 text-xs font-medium transition-all cursor-pointer text-muted-foreground hover:text-foreground"
              >
                {preset.label}
              </button>
            ))}
            {text && (
              <button
                onClick={() => setText("")}
                className="rounded-lg border border-transparent bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1.5 text-xs font-medium transition-all cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Preview Card */}
      <div className="md:col-span-2 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Live Feed Preview
        </p>
        <div className="relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-300 ring-1 ring-primary/5 hover:border-primary/20">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-full bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center text-[10px] font-mono font-bold text-white shadow-sm">
                {text ? anonKey(text).slice(5, 7).toUpperCase() : "??"}
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-foreground">
                  {text ? anonKey(text) : "anon_user"}
                </p>
                <p className="text-[9px] text-muted-foreground">Verified Student</p>
              </div>
            </div>
            <Badge className="bg-primary/10 text-primary border-none text-[9px] px-1.5 py-0">
              Just Now
            </Badge>
          </div>

          {/* Body */}
          <div className="py-4 min-h-[70px]">
            {text ? (
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                {scrubbed}
              </p>
            ) : (
              <p className="text-sm italic text-muted-foreground/80">
                Your words appear here exactly as they would be stored... try typing phone numbers or emails to see the auto-scrubbing.
              </p>
            )}
          </div>

          {/* Security Alert Badge */}
          <div className="flex items-center justify-between pt-3 border-t border-border/40 text-[10px]">
            <div className="flex items-center gap-1.5">
              {!text ? (
                <>
                  <ShieldCheck className="size-3.5 text-muted-foreground/60" />
                  <span className="text-muted-foreground">Idle</span>
                </>
              ) : hadPii ? (
                <>
                  <ShieldAlert className="size-3.5 text-amber-500 animate-pulse" />
                  <span className="font-semibold text-amber-500">PII Redacted</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="size-3.5 text-emerald-500" />
                  <span className="font-semibold text-emerald-500">Clean post</span>
                </>
              )}
            </div>
            <span className="text-[9px] font-mono text-muted-foreground/75">
              {text ? `${text.length} chars` : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const PROFILES = [
  {
    name: "Aditi, 20",
    firstName: "Aditi",
    college: "SRCC, Delhi",
    bio: "Economics major. Will judge your playlist before your degree.",
    initials: "AD",
  },
  {
    name: "Rohan, 21",
    firstName: "Rohan",
    college: "IIT Delhi",
    bio: "Codes at 2am, plays football at 6. Pick your fighter.",
    initials: "RO",
  },
  {
    name: "Meera, 19",
    firstName: "Meera",
    college: "Christ University",
    bio: "Design student. Here mostly for the fest gossip.",
    initials: "ME",
  },
];

export function MatchDemo() {
  const [idx, setIdx] = useState(0);
  const [matched, setMatched] = useState(false);
  const profile = PROFILES[idx % PROFILES.length];

  return (
    <Card className="bg-card text-card-foreground shadow-lg">
      <CardContent className="space-y-4">
        {matched ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center space-y-3 py-4 text-center"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <Heart className="size-6 fill-primary text-primary" />
            </div>
            <p className="font-heading text-lg font-semibold">It&apos;s a match</p>
            <p className="max-w-[24ch] text-sm text-muted-foreground">
              You and {profile.firstName} both swiped right. Chat unlocks when
              you join.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMatched(false);
                setIdx((i) => (i + 1) % PROFILES.length);
              }}
            >
              Keep swiping
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <Avatar className="size-12 border">
                <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                  {profile.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-heading font-semibold leading-tight">
                  {profile.name}
                </p>
                <p className="text-xs font-medium text-primary">
                  {profile.college}
                </p>
              </div>
            </div>
            <p className="rounded-lg bg-muted/60 p-3 text-sm leading-relaxed text-muted-foreground">
              {profile.bio}
            </p>
            <div className="flex items-center justify-center gap-3 pt-1">
              <Button
                variant="outline"
                size="icon-lg"
                aria-label="Pass"
                className="rounded-full"
                onClick={() => setIdx((i) => (i + 1) % PROFILES.length)}
              >
                <X className="size-4" />
              </Button>
              <Button
                size="icon-lg"
                aria-label="Like"
                className="rounded-full"
                onClick={() => setMatched(true)}
              >
                <Heart className="size-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

const RANKS = [
  { name: "Loop Starter", at: 0 },
  { name: "Campus Talker", at: 80 },
  { name: "Campus Legend", at: 200 },
];

const EARNERS = [
  { label: "Post a confession", pts: 5, icon: MessageSquare },
  { label: "Vote in a poll", pts: 2, icon: Vote },
  { label: "Refer a classmate", pts: 20, icon: UserPlus },
];

export function PointsDemo() {
  const [lp, setLp] = useState(25);
  const [bursts, setBursts] = useState<{ id: number; pts: number }[]>([]);
  const burstId = useRef(0);
  const rank = [...RANKS].reverse().find((r) => lp >= r.at) ?? RANKS[0];

  function earn(pts: number) {
    setLp((v) => v + pts);
    const id = ++burstId.current;
    setBursts((b) => [...b, { id, pts }]);
    setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 900);
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 md:items-center">
      <div className="space-y-4">
        <div className="relative w-fit">
          <p className="font-heading text-5xl font-bold tracking-tight tabular-nums">
            {lp}
            <span className="ml-1 text-base font-medium text-muted-foreground">
              LP
            </span>
          </p>
          <div className="pointer-events-none absolute -top-1 right-0">
            <AnimatePresence>
              {bursts.map((b) => (
                <motion.span
                  key={b.id}
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 0, y: -26 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="absolute text-sm font-bold text-primary"
                >
                  +{b.pts}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {RANKS.map((r) => (
            <Badge
              key={r.name}
              variant={r.name === rank.name ? "default" : "outline"}
              className="h-6"
            >
              {r.name}
              <span className="opacity-70">{r.at} LP</span>
            </Badge>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          You are a <span className="font-semibold text-foreground">{rank.name}</span>.
          Every post, vote, and referral moves you up.
        </p>
      </div>

      <div className="space-y-2">
        {EARNERS.map((e) => (
          <button
            key={e.label}
            onClick={() => earn(e.pts)}
            className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium ring-1 ring-foreground/10 transition-colors hover:bg-muted active:translate-y-px"
          >
            <e.icon className="size-4 text-primary" />
            <span className="flex-1">{e.label}</span>
            <span className="font-semibold text-primary">+{e.pts} LP</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const ACADEMIC_DOMAIN = /\.(edu|ac\.in|edu\.in|ac\.uk|edu\.au|edu\.sg|ac\.nz)$/;

export function VerifyDemo() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "ok" | "no">("idle");
  const domain = email.trim().split("@")[1]?.toLowerCase() ?? "";

  function check() {
    if (!domain) return;
    setState(ACADEMIC_DOMAIN.test(domain) ? "ok" : "no");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1 space-y-1.5">
          <label htmlFor="verify-demo" className="sr-only">
            College email
          </label>
          <Input
            id="verify-demo"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setState("idle");
            }}
            onKeyDown={(e) => e.key === "Enter" && check()}
            placeholder="you@iitd.ac.in"
            className="bg-background"
          />
        </div>
        <Button onClick={check} className="gap-1.5">
          <MailCheck className="size-4" />
          Check domain
        </Button>
      </div>

      <div aria-live="polite" className="flex h-5 items-center gap-1.5 text-xs">
        {state === "ok" && (
          <>
            <ShieldCheck className="size-3.5 text-primary" />
            <span className="font-medium text-primary">
              {domain} is a campus domain. An OTP would land in your inbox now go to /join.
            </span>
          </>
        )}
        {state === "no" && (
          <>
            <ShieldAlert className="size-3.5 text-primary" />
            <span className="font-medium text-primary">
              We do not recognize that domain. Use the email your college gave
              you.
            </span>
          </>
        )}
        {state === "idle" && (
          <span className="text-muted-foreground">
            Demo check. Real verification confirms the domain with an OTP.
          </span>
        )}
      </div>
    </div>
  );
}
