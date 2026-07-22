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
    name: "Aditi S.",
    age: 20,
    college: "BITS Pilani",
    branch: "Computer Science '27",
    bio: "Late night coffee addict ☕, building side projects & looking for someone to study with in the library 📚",
    interests: ["Coding", "Chai", "Indie Music", "Valorant"],
    gradient: "from-purple-600 via-indigo-600 to-pink-600",
    avatarBg: "bg-purple-500/20 text-purple-400",
    verified: true,
  },
  {
    id: 2,
    name: "Rohan M.",
    age: 21,
    college: "IIT Bombay",
    branch: "Electrical Eng '26",
    bio: "Guitar player 🎸, fest organizer, and expert at finding the best street food near campus 🍕",
    interests: ["Music", "Fests", "Basketball", "Photography"],
    gradient: "from-blue-600 via-cyan-600 to-teal-600",
    avatarBg: "bg-blue-500/20 text-blue-400",
    verified: true,
  },
  {
    id: 3,
    name: "Sneha R.",
    age: 19,
    college: "Delhi University (SRCC)",
    branch: "Economics Hons '27",
    bio: "Finance enthusiast 📈, loves campus debates & searching for the best cold coffee in North Campus 🥤",
    interests: ["Finance", "Debating", "Coffee", "Anime"],
    gradient: "from-rose-600 via-pink-600 to-amber-600",
    avatarBg: "bg-rose-500/20 text-rose-400",
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
      setTimeout(() => setMatched(true), 250);
    } else {
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setDirection(null);
      }, 300);
    }
  }

  function resetMatch() {
    setMatched(false);
    setCurrentIndex((prev) => prev + 1);
    setDirection(null);
  }

  return (
    <section className="border-t border-border/60 bg-muted/10 overflow-hidden py-24">
      <div className="mx-auto w-full max-w-6xl px-6">
        <Reveal className="mx-auto mb-14 max-w-xl text-center">
          <p className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-pink-500">
            <Flame className="size-3.5 fill-pink-500" />
            Campus Dating & Matchmaking
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
            Swipe on real classmates. Zero catfish.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Every profile on CampusLoop is verified via official college email. Meet students from your own campus or nearby universities with total trust.
          </p>
        </Reveal>

        <div className="mx-auto grid max-w-4xl items-center gap-12 lg:grid-cols-2">
          {/* Interactive Tinder/Swipe Widget */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 blur-xl opacity-70" />

            <div className="relative aspect-[3/4] w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentProfile.id}
                  initial={{ scale: 0.95, opacity: 0, y: 10 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    x: direction === "left" ? -200 : direction === "right" ? 200 : 0,
                    rotate: direction === "left" ? -15 : direction === "right" ? 15 : 0,
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                >
                  <Card className="h-full overflow-hidden border border-border/80 shadow-2xl relative flex flex-col justify-between bg-card">
                    {/* Top Header / Photo Simulated Area */}
                    <div className={`relative h-1/2 w-full bg-gradient-to-br ${currentProfile.gradient} p-6 flex flex-col justify-between`}>
                      <div className="flex items-center justify-between z-10">
                        <Badge className="bg-background/80 text-foreground backdrop-blur-md border-none text-[10px] gap-1 px-2.5 py-1">
                          <ShieldCheck className="size-3 text-emerald-500" />
                          Verified Student
                        </Badge>
                        <Badge variant="secondary" className="bg-black/30 text-white backdrop-blur-md border-none text-[10px]">
                          {currentProfile.college}
                        </Badge>
                      </div>

                      <div className="z-10">
                        <div className="flex items-baseline gap-2">
                          <h3 className="text-2xl font-black text-white">{currentProfile.name}</h3>
                          <span className="text-lg font-bold text-white/80">{currentProfile.age}</span>
                        </div>
                        <p className="text-xs font-medium text-white/80">{currentProfile.branch}</p>
                      </div>

                      {/* Subtle Overlay glow */}
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-black/20" />
                    </div>

                    {/* Profile Details */}
                    <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <p className="text-xs leading-relaxed text-muted-foreground font-medium">
                        &ldquo;{currentProfile.bio}&rdquo;
                      </p>

                      {/* Interest tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {currentProfile.interests.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-center gap-6 pt-2">
                        <button
                          onClick={() => handleSwipe("left")}
                          className="flex size-14 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-md transition-transform hover:scale-110 hover:border-destructive hover:text-destructive active:scale-95 cursor-pointer"
                          aria-label="Pass profile"
                        >
                          <X className="size-6" />
                        </button>
                        <button
                          onClick={() => handleSwipe("right")}
                          className="flex size-14 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/25 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                          aria-label="Match profile"
                        >
                          <Heart className="size-6 fill-white" />
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
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    className="absolute inset-0 z-30 flex flex-col items-center justify-center rounded-xl bg-background/95 backdrop-blur-xl p-6 text-center shadow-2xl border border-pink-500/30"
                  >
                    <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/40 animate-bounce">
                      <Sparkles className="size-8" />
                    </div>

                    <h3 className="text-2xl font-black tracking-tight text-foreground">
                      IT&apos;S A MATCH! 🎉
                    </h3>
                    <p className="mt-2 text-xs text-muted-foreground max-w-xs leading-relaxed">
                      You and <strong className="text-foreground">{currentProfile.name}</strong> from {currentProfile.college} liked each other!
                    </p>

                    <div className="mt-6 flex w-full flex-col gap-2">
                      <Link href="/join?mode=signup" className="w-full">
                        <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:opacity-95 font-semibold text-xs shadow-md">
                          <MessageSquare className="size-3.5 mr-1" /> Verify Email to Chat
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetMatch}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Keep Swiping Demo
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Feature Highlights on the right */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Badge variant="outline" className="text-pink-500 border-pink-500/20 bg-pink-500/10">
                100% Student Verified
              </Badge>
              <h3 className="text-2xl font-bold tracking-tight md:text-3xl">
                No random strangers. Just students in your circle.
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Tired of fake profiles and catfish on regular dating apps? CampusLoop verifies every single member using official institutional email OTPs.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: "Campus & Inter-College Filters",
                  desc: "Match exclusively within your university or expand to nearby colleges in your city.",
                },
                {
                  title: "Safe & In-App Direct Messaging",
                  desc: "Start chatting immediately inside CampusLoop without sharing phone numbers or personal handles.",
                },
                {
                  title: "Vibe Badges & Shared Interests",
                  desc: "See who shares your late-night study habits, favorite food spots, and campus clubs.",
                },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-pink-500/10 text-pink-500 mt-0.5">
                    <Check className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{item.title}</h4>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link href="/join?mode=signup">
                <Button className="bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:opacity-95 shadow-lg shadow-pink-500/20 font-semibold gap-2">
                  <Flame className="size-4" /> Join Campus Matchmaking
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
