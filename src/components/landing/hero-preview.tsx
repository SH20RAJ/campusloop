"use client";

import { BadgeCheck, Bike, CheckCircle2, Flame, Heart, Lock, MessageCircle, Repeat, Send, Zap } from "lucide-react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ──────── Feature Slide 1: Live Poll & Confession ────────
const POLL_OPTIONS = [
  { id: "nescafe", text: "Nescafe booth", votes: 212 },
  { id: "juice", text: "Sharma ji's juice corner", votes: 168 },
  { id: "mess", text: "Main mess, obviously", votes: 74 },
];

const PREVIEW_SLIDES = [
  { id: "poll", label: "Poll & Confession" },
  { id: "feed", label: "Verified Feed & Reply" },
  { id: "dating", label: "Match & Secret Crush" },
  { id: "market", label: "Marketplace & Chat" },
  { id: "stories", label: "24h Vibes & Clout" },
] as const;

export function HeroPreview() {
  const reduce = useReducedMotion();
  const [activeSlide, setActiveSlide] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Slide 1 State: Poll & Confession
  const [votedId, setVotedId] = useState<string | null>(null);
  const [options, setOptions] = useState(POLL_OPTIONS);
  const [confessionLikes, setConfessionLikes] = useState(214);
  const [confessionLiked, setConfessionLiked] = useState(false);

  // Slide 2 State: Post Like
  const [postLikes, setPostLikes] = useState(84);
  const [postLiked, setPostLiked] = useState(false);

  // Slide 3 State: Dating Match Like
  const [datingLiked, setDatingLiked] = useState(false);

  // 3D Parallax Tilt
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [3.5, -3.5]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-3.5, 3.5]), {
    stiffness: 150,
    damping: 20,
  });

  // Auto-cycle timer (5.5s per slide, pauses on hover)
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % PREVIEW_SLIDES.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [isPaused]);

  const totalVotes = options.reduce((sum, o) => sum + o.votes, 0);

  function vote(id: string) {
    if (votedId) return;
    setVotedId(id);
    setOptions((prev) => prev.map((o) => (o.id === id ? { ...o, votes: o.votes + 1 } : o)));
  }

  function toggleConfessionLike() {
    setConfessionLiked((prev) => !prev);
    setConfessionLikes((prev) => (confessionLiked ? prev - 1 : prev + 1));
  }

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

  return (
    <div
      className="relative mx-auto w-full max-w-md pb-6 select-none"
      style={{ perspective: 1000 }}
      onMouseMove={handleTilt}
      onMouseLeave={() => {
        resetTilt();
        setIsPaused(false);
      }}
      onMouseEnter={() => setIsPaused(true)}
    >
      <motion.div style={reduce ? {} : { rotateX, rotateY, transformStyle: "preserve-3d" }}>
        {/* ─── Main Interactive Card Deck with AnimatePresence ─── */}
        <div className="relative min-h-[310px] sm:min-h-[320px]">
          <AnimatePresence mode="wait">
            {/* ────── SLIDE 0: Canteen Poll & Confession ────── */}
            {activeSlide === 0 && (
              <motion.div
                key="slide-poll"
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.98 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card className="relative z-10 shadow-lg border-border/80 bg-card/95 backdrop-blur-md">
                  <CardContent className="space-y-3.5 p-5">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5">
                        Live Canteen Poll
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {totalVotes.toLocaleString("en-IN")} votes
                      </span>
                    </div>
                    <p className="font-heading text-base font-semibold leading-snug text-foreground">
                      Which canteen actually deserves your money?
                    </p>
                    <div className="space-y-2">
                      {options.map((option) => {
                        const pct = Math.round((option.votes / totalVotes) * 100);
                        const isMine = votedId === option.id;
                        return votedId ? (
                          <div
                            key={option.id}
                            className={cn(
                              "relative overflow-hidden rounded-xl border border-border/60 bg-muted/20",
                              isMine && "border-primary/50 ring-1 ring-primary/30"
                            )}
                          >
                            <motion.div
                              className="absolute inset-y-0 left-0 bg-primary/15"
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: pct / 100 }}
                              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                              style={{ width: "100%", transformOrigin: "left" }}
                            />
                            <div className="relative flex items-center justify-between px-3.5 py-2.5 text-xs font-medium">
                              <span className={cn(isMine && "text-primary font-bold")}>{option.text}</span>
                              <span className="font-bold text-muted-foreground">{pct}%</span>
                            </div>
                          </div>
                        ) : (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => vote(option.id)}
                            className="w-full cursor-pointer rounded-xl border border-border/60 bg-card px-3.5 py-2.5 text-left text-xs font-medium text-foreground transition-all hover:bg-muted/50 hover:border-primary/40 active:scale-[0.99]"
                          >
                            {option.text}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ────── SLIDE 1: Verified Campus Feed Post & Peer Reply ────── */}
            {activeSlide === 1 && (
              <motion.div
                key="slide-feed"
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.98 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card className="relative z-10 shadow-lg border-border/80 bg-card/95 backdrop-blur-md">
                  <CardContent className="space-y-3.5 p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-9 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-purple-600 text-xs font-black text-white shadow-xs">
                          PS
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-foreground">Priya Sharma</span>
                            <BadgeCheck className="size-3.5 text-primary fill-primary/20" />
                          </div>
                          <p className="text-[11px] text-muted-foreground">IIT Delhi · CSE &apos;26</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px] font-bold">
                        Academic
                      </Badge>
                    </div>

                    <p className="text-xs leading-relaxed text-foreground">
                      ECE midsem was definitely written by someone who hates joy 😭 anyone got solved PYQs for
                      Digital Logic &amp; Microprocessors?
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs text-muted-foreground">
                      <button
                        type="button"
                        onClick={() => {
                          setPostLiked(!postLiked);
                          setPostLikes((l) => (postLiked ? l - 1 : l + 1));
                        }}
                        className={cn(
                          "flex items-center gap-1.5 hover:text-red-500 transition-colors cursor-pointer",
                          postLiked && "text-red-500"
                        )}
                      >
                        <Heart className={cn("size-3.5", postLiked && "fill-current")} />
                        <span className="font-bold">{postLikes}</span>
                      </button>
                      <span className="flex items-center gap-1.5">
                        <MessageCircle className="size-3.5" />
                        <span className="font-bold">19 replies</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Repeat className="size-3.5" />
                        <span className="font-bold">12</span>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ────── SLIDE 2: Campus Dating Deck & Secret Crush ────── */}
            {activeSlide === 2 && (
              <motion.div
                key="slide-dating"
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.98 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card className="relative z-10 shadow-lg border-border/80 bg-card/95 backdrop-blur-md overflow-hidden">
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 border-pink-500/20 text-[10px] font-bold">
                        ❤️ Campus Match Deck
                      </Badge>
                      <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        94% Compatible
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold text-foreground">Aarav K., 21</h4>
                        <BadgeCheck className="size-3.5 text-primary fill-primary/20" />
                      </div>
                      <p className="text-[11px] text-muted-foreground">BITS Pilani · Electrical &apos;25</p>
                    </div>

                    <p className="text-xs leading-relaxed text-foreground/90 italic">
                      &ldquo;Looking for someone to grab late-night Nescafe chai and discuss indie rock
                      playlists ☕🎸&rdquo;
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        🎵 Indie Music
                      </span>
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        💻 Hackathons
                      </span>
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        ☕ Chai Nights
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/40">
                      <button
                        type="button"
                        onClick={() => setDatingLiked(!datingLiked)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer",
                          datingLiked
                            ? "bg-pink-500 text-white shadow-xs"
                            : "bg-pink-500/10 text-pink-500 hover:bg-pink-500/20"
                        )}
                      >
                        <Heart className={cn("size-3.5", datingLiked && "fill-current")} />
                        {datingLiked ? "Liked!" : "Send Like"}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ────── SLIDE 3: Student Marketplace & Instant Chat ────── */}
            {activeSlide === 3 && (
              <motion.div
                key="slide-market"
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.98 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card className="relative z-10 shadow-lg border-border/80 bg-card/95 backdrop-blur-md">
                  <CardContent className="space-y-3.5 p-5">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 text-[10px] font-bold">
                        🛍️ Campus Marketplace
                      </Badge>
                      <span className="text-xs font-black text-primary">₹3,200</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                        <Bike className="size-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-foreground leading-snug">
                          Hero Sprint Pro 21-Speed Cycle
                        </h4>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">
                          Selling before graduation. Mint condition, tuned gears, includes number lock &amp;
                          LED light.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium">
                        <CheckCircle2 className="size-3 text-emerald-500" />
                        Hostel 7, IIT Bombay
                      </span>
                      <span className="font-bold text-foreground">Verified Student Seller</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ────── SLIDE 4: 24h Campus Story & Loop Points Clout ────── */}
            {activeSlide === 4 && (
              <motion.div
                key="slide-stories"
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.98 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card className="relative z-10 shadow-lg border-border/80 bg-card/95 backdrop-blur-md">
                  <CardContent className="space-y-3.5 p-5">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20 text-[10px] font-bold">
                        🔥 24h Campus Vibe
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">Vanishing in 3h</span>
                    </div>

                    <div className="space-y-2 rounded-xl bg-linear-to-br from-purple-500/15 via-indigo-500/10 to-transparent p-3.5 border border-purple-500/20">
                      <p className="text-xs font-bold text-foreground leading-relaxed">
                        &ldquo;Fest Pro-Nite soundcheck is sounding absolutely crazy tonight! 🎸🎤 Main Ground
                        is packed.&rdquo;
                      </p>
                      <div className="flex items-center justify-between text-[10px] font-bold text-purple-400">
                        <span>🎵 Ritviz - Liggi (Live Mix)</span>
                        <span>840 views</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                      <span className="text-[11px] font-medium">BIT Mesra · Main Fest</span>
                      <span className="flex items-center gap-1 font-bold text-amber-500">
                        <Flame className="size-3.5 fill-amber-500" /> #1 Trending
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Overlapping Floating Micro-Card (Cycles with Active Slide) ─── */}
        <div className="absolute -bottom-3 right-0 z-20 w-60 sm:w-64 rotate-1.5 sm:-right-4 pointer-events-auto filter drop-shadow-xl">
          <AnimatePresence mode="wait">
            {/* Float 0: Confession */}
            {activeSlide === 0 && (
              <motion.div
                key="float-confession"
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <Card size="sm" className="shadow-2xl border-border/80 bg-card/95 backdrop-blur-md">
                  <CardContent className="space-y-2 p-3.5">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="gap-1 text-[10px] font-bold">
                        <Lock className="size-2.5" />
                        Confession
                      </Badge>
                      <span className="text-[10px] font-mono text-muted-foreground">anon_4f2a</span>
                    </div>
                    <p className="text-xs leading-snug text-foreground">
                      the library AC is set to Antarctica and i am once again studying in a hoodie in May
                    </p>
                    <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground">
                      <button
                        type="button"
                        onClick={toggleConfessionLike}
                        aria-label="Like confession"
                        className={cn(
                          "flex cursor-pointer items-center gap-1 transition-colors hover:text-primary active:scale-90",
                          confessionLiked && "text-primary"
                        )}
                      >
                        <Heart className={cn("size-3", confessionLiked && "fill-primary")} />
                        <span className="font-semibold">{confessionLikes}</span>
                      </button>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="size-3" />
                        <span className="font-semibold">38</span>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Float 1: Peer Reply */}
            {activeSlide === 1 && (
              <motion.div
                key="float-reply"
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <Card size="sm" className="shadow-2xl border-border/80 bg-card/95 backdrop-blur-md">
                  <CardContent className="space-y-2 p-3.5">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[10px] font-bold">
                        ⚡ Top Reply
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">Rohan K. · verified</span>
                    </div>
                    <p className="text-xs leading-snug text-foreground">
                      Uploaded 5 years solved PYQs with professor notes in{" "}
                      <span className="font-bold text-primary">#ece-notes</span> 🚀
                    </p>
                    <div className="flex items-center justify-between pt-0.5 text-[11px] text-muted-foreground">
                      <span className="font-semibold text-emerald-500">✓ Verified Solution</span>
                      <span className="flex items-center gap-1 font-bold">❤️ 42</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Float 2: Secret Crush Match Alert */}
            {activeSlide === 2 && (
              <motion.div
                key="float-crush"
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <Card size="sm" className="shadow-2xl border-pink-500/30 bg-card/95 backdrop-blur-md">
                  <CardContent className="space-y-2 p-3.5">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-pink-500/15 text-pink-500 border-pink-500/30 text-[10px] font-bold gap-1">
                        <Zap className="size-2.5" />
                        Crush Alert
                      </Badge>
                      <span className="text-[10px] font-bold text-pink-500">Just Now</span>
                    </div>
                    <p className="text-xs leading-snug text-foreground">
                      Someone from <span className="font-bold text-pink-500">Electrical Dept</span> added you
                      to their Secret Crush list! 💖
                    </p>
                    <div className="flex items-center justify-between pt-0.5 text-[10px] text-muted-foreground">
                      <span className="font-bold text-pink-400">Zero Catfish Escrow</span>
                      <span className="font-semibold">Tap to Match →</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Float 3: In-App DM Exchange */}
            {activeSlide === 3 && (
              <motion.div
                key="float-chat"
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <Card size="sm" className="shadow-2xl border-emerald-500/30 bg-card/95 backdrop-blur-md">
                  <CardContent className="space-y-2 p-3.5">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-[10px] font-bold gap-1">
                        <Send className="size-2.5" />
                        In-App DM
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">Kabir S.</span>
                    </div>
                    <p className="text-xs leading-snug text-foreground">
                      &ldquo;Can I test ride near Canteen today around 5 PM? Ready with UPI cash.&rdquo;
                    </p>
                    <div className="flex items-center justify-between pt-0.5 text-[10px] text-emerald-500 font-bold">
                      <span>⚡ Instant Exchange</span>
                      <span>Reply Sent</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Float 4: Loop Points Clout Level Up */}
            {activeSlide === 4 && (
              <motion.div
                key="float-clout"
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                <Card size="sm" className="shadow-2xl border-amber-500/30 bg-card/95 backdrop-blur-md">
                  <CardContent className="space-y-2 p-3.5">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-amber-500/15 text-amber-500 border-amber-500/30 text-[10px] font-bold gap-1">
                        <Zap className="size-2.5" />
                        Level Up!
                      </Badge>
                      <span className="text-[10px] font-bold text-amber-500">+30 LP</span>
                    </div>
                    <p className="text-xs leading-snug text-foreground">
                      Your answer reached Top 1 in <span className="font-bold text-primary">#placements</span>
                      !
                    </p>
                    <div className="flex items-center justify-between pt-0.5 text-[10px] text-muted-foreground">
                      <span className="font-bold text-amber-400">🏅 Gold Star Unlocked</span>
                      <span className="font-semibold">Clout Tier 3</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Interactive Feature Navigation Pills (Positioned Clearly Below Floating Artifacts) ─── */}
        <div className="mt-14 sm:mt-16 flex items-center justify-center gap-2 pt-3 relative z-30">
          {PREVIEW_SLIDES.map((slide, idx) => {
            const isActive = activeSlide === idx;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveSlide(idx)}
                className="group relative p-1.5 -m-1.5 cursor-pointer focus:outline-hidden"
                aria-label={`Preview ${slide.label}`}
                title={slide.label}
              >
                <div
                  className={cn(
                    "h-2 rounded-full transition-all duration-300 ease-out",
                    isActive
                      ? "w-8 bg-primary shadow-xs shadow-primary/50"
                      : "w-2.5 bg-muted-foreground/25 group-hover:bg-muted-foreground/50"
                  )}
                />
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
