"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, X, Sparkles, ShieldCheck, Check, MessageSquare, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Reveal } from "./reveal";

const MOCK_PROFILES = [
  {
    id: 1,
    name: "Aditi Sharma",
    age: 20,
    college: "BITS Pilani",
    branch: "Computer Science '27",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    bio: "Current attendance: 42%. Surviving on 2 AM canteen coffee and crying over DSA assignments ☕💻",
    interests: ["Coding", "Chai at 2 AM", "Indie Rock", "Valorant"],
    verified: true,
  },
  {
    id: 2,
    name: "Rohan Mehta",
    age: 21,
    college: "IIT Bombay",
    branch: "Electrical Eng '26",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80",
    bio: "Fest coordinator & professional procrastinator. Looking for someone to skip 8 AM lectures with 🎸🍕",
    interests: ["Music", "Fest Drama", "Basketball", "Meme Culture"],
    verified: true,
  },
  {
    id: 3,
    name: "Sneha Roy",
    age: 19,
    college: "Delhi University (SRCC)",
    branch: "Economics Hons '27",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
    bio: "Will debate you on market crashes, then ask to copy your lab record 5 minutes before submission 📈🥤",
    interests: ["Finance Memes", "Cold Coffee", "Anime", "Debating"],
    verified: true,
  },
];

export function MatchmakingShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matched, setMatched] = useState(false);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);

  const currentProfile = MOCK_PROFILES[currentIndex % MOCK_PROFILES.length];

  function handleSwipe(dir: "left" | "right") {
    setDirection(dir);
    if (dir === "right") {
      setTimeout(() => setMatched(true), 200);
    } else {
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setDirection(null);
      }, 250);
    }
  }

  function resetMatch() {
    setMatched(false);
    setCurrentIndex((prev) => prev + 1);
    setDirection(null);
  }

  return (
    <section className="border-t border-border/60 bg-muted/10 py-20">
      <div className="mx-auto w-full max-w-6xl px-6">
        <Reveal className="mx-auto mb-12 max-w-xl text-center">
          <p className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <Flame className="size-3.5 text-primary" />
            Campus Dating & Matchmaking
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Swipe on real classmates. Zero catfish.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Unlike your group project members who do 0% work, everyone here cleared the same college email check.
          </p>
        </Reveal>

        <div className="mx-auto grid max-w-4xl items-center gap-10 lg:grid-cols-2">
          {/* Interactive Swipe Widget */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="relative aspect-[3/4] w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentProfile.id}
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    x: direction === "left" ? -180 : direction === "right" ? 180 : 0,
                    rotate: direction === "left" ? -12 : direction === "right" ? 12 : 0,
                  }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <Card className="h-full overflow-hidden border border-border shadow-md flex flex-col justify-between bg-card">
                    {/* Top Photo Header */}
                    <div className="relative h-1/2 w-full overflow-hidden border-b border-border/60 p-4 flex flex-col justify-between">
                      <img
                        src={currentProfile.avatar}
                        alt={currentProfile.name}
                        className="absolute inset-0 size-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" />

                      <div className="flex items-center justify-between z-10">
                        <Badge variant="outline" className="bg-black/60 text-white border-white/20 backdrop-blur-md text-[10px] gap-1 px-2 py-0.5 font-semibold">
                          <ShieldCheck className="size-3 text-emerald-400" />
                          Verified Student
                        </Badge>
                        <Badge variant="secondary" className="bg-black/60 text-white border-white/20 backdrop-blur-md text-[10px] font-semibold">
                          {currentProfile.college}
                        </Badge>
                      </div>

                      <div className="z-10 text-white">
                        <div className="flex items-baseline gap-2">
                          <h3 className="text-xl font-black drop-shadow-sm">{currentProfile.name}</h3>
                          <span className="text-base font-bold opacity-80">{currentProfile.age}</span>
                        </div>
                        <p className="text-xs text-white/80 font-semibold drop-shadow-xs">{currentProfile.branch}</p>
                      </div>
                    </div>

                    {/* Profile Details */}
                    <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <p className="text-xs leading-relaxed text-foreground/90 font-medium">
                        &ldquo;{currentProfile.bio}&rdquo;
                      </p>

                      {/* Interest tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {currentProfile.interests.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground border border-border/40"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Clean Action buttons */}
                      <div className="flex items-center justify-center gap-5 pt-2">
                        <button
                          onClick={() => handleSwipe("left")}
                          className="flex size-12 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-all hover:bg-muted hover:text-foreground active:scale-95 cursor-pointer"
                          aria-label="Pass profile"
                        >
                          <X className="size-5" />
                        </button>
                        <button
                          onClick={() => handleSwipe("right")}
                          className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                          aria-label="Match profile"
                        >
                          <Heart className="size-5 fill-primary-foreground" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>

              {/* Match Popup Modal */}
              <AnimatePresence>
                {matched && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-xl bg-background/98 p-6 text-center shadow-xl border border-border"
                  >
                    <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Sparkles className="size-6" />
                    </div>

                    <h3 className="text-xl font-bold tracking-tight text-foreground">
                      IT&apos;S A MATCH! 🎉
                    </h3>
                    <p className="mt-1.5 text-xs text-muted-foreground max-w-xs leading-relaxed">
                      You and <strong className="text-foreground">{currentProfile.name}</strong> ({currentProfile.college}) liked each other! Now don&apos;t ghost them like your 8 AM lecture.
                    </p>

                    <div className="mt-5 flex w-full flex-col gap-2">
                      <Link href="/join?mode=signup" className="w-full">
                        <Button className="w-full font-semibold text-xs size-sm">
                          <MessageSquare className="size-3.5 mr-1" /> Verify Email to DM
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetMatch}
                        className="text-xs text-muted-foreground"
                      >
                        Keep Swiping Demo
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Clean Feature Highlights */}
          <div className="space-y-5">
            <div className="space-y-2">
              <Badge variant="outline" className="text-xs text-primary border-primary/20 bg-primary/5">
                Strict Email Gatekeep
              </Badge>
              <h3 className="text-2xl font-bold tracking-tight md:text-3xl">
                No random creeps. Just students in your loop.
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Tired of fake accounts and creepy alumni? CampusLoop verifies every single account with an official institutional OTP.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  title: "Campus & Inter-College Filters",
                  desc: "Match exclusively within your campus or expand to nearby colleges in your city.",
                },
                {
                  title: "Direct In-App DMs",
                  desc: "Start chatting instantly inside CampusLoop without handing out your WhatsApp or Instagram handle.",
                },
                {
                  title: "Shared Campus Vibe",
                  desc: "Find someone who also thinks the main library AC is set to the North Pole.",
                },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-lg border border-border bg-card p-3.5 shadow-sm">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary mt-0.5">
                    <Check className="size-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{item.title}</h4>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-1">
              <Link href="/join?mode=signup">
                <Button className="font-semibold text-xs gap-1.5">
                  <Flame className="size-3.5" /> Join Campus Matchmaking
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
