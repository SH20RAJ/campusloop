"use client";

import { useState } from "react";
import { 
  Heart, 
  MessageCircle, 
  Sparkles, 
  UserCheck, 
  Lock, 
  ShieldAlert, 
  ChevronDown,
  ThumbsUp,
  Smile,
  Flame,
  Zap,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

export function LandingInteractive({ isAuthenticated }: { isAuthenticated: boolean }) {
  // Feed teaser state
  const [votes, setVotes] = useState(142);
  const [hasVoted, setHasVoted] = useState(false);
  const [pollVoted, setPollVoted] = useState<number | null>(null);
  const [pollVotes, setPollVotes] = useState([45, 12, 18]);

  // Swipe states
  const [swipeIdx, setSwipeIdx] = useState(0);
  const [matched, setMatched] = useState(false);

  // FAQ Accordion states
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const mockProfiles = [
    { name: "Aria, 21", college: "IIT Delhi", bio: "Economics major. Caffeinated 24/7. Let's debate canteen Maggi.", avatar: "👩‍💻" },
    { name: "Kabir, 22", college: "BIT Mesra", bio: "Guitarist & Dev. Looking for someone to attend fusion night with.", avatar: "🎸" },
    { name: "Priya, 20", college: "BITS Pilani", bio: "Design student. Can help you fix your UI, but not your life.", avatar: "🎨" }
  ];

  const handleVotePoll = (idx: number) => {
    if (pollVoted !== null) return;
    setPollVoted(idx);
    const copy = [...pollVotes];
    copy[idx] += 1;
    setPollVotes(copy);
  };

  const handleSwipe = (like: boolean) => {
    if (like && swipeIdx === 0) {
      setMatched(true);
    } else {
      setSwipeIdx((prev) => (prev + 1) % mockProfiles.length);
    }
  };

  const resetSwipe = () => {
    setMatched(false);
    setSwipeIdx(0);
  };

  const totalPollVotes = pollVotes.reduce((a, b) => a + b, 0);

  const faqs = [
    {
      q: "How does the email verification protect my privacy?",
      a: "We only check your college email to verify you are a real student. Once verified, we securely hash the record. Your confessions, posts, and DMs are entirely separated from your email identity. Even our engineers cannot map them back to you. Period."
    },
    {
      q: "What keeps the confessions safety filter in check?",
      a: "Our automated safety guard scans posts in real-time to block personal doxxing details (phone numbers, personal emails, target roll numbers) and highly offensive terms before they go live. Community reporting also lets students hide any post with 5 flags instantly."
    },
    {
      q: "How does the Campus Matches dating system work?",
      a: "Campus Matches is strictly gatekept to college students. You can choose to discover peers at your own campus or toggle Global scope to meet students from other verified universities. Swipes are 100% private until it's a mutual match!"
    },
    {
      q: "Can I host and join student communities?",
      a: "Yes! Any verified student can launch a community for their hobbies, projects, exam prep, or campus clubs. Other students can discover and join these circles to share thoughts and media inside local feeds."
    }
  ];

  return (
    <div className="space-y-24">
      {/* ─── CTA Buttons for Hero ─── */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
        {isAuthenticated ? (
          <Link href="/app/campus">
            <button className="relative group overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-orange-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:scale-102 active:scale-98 transition-all cursor-pointer">
              <span className="relative z-10 flex items-center gap-2">
                Enter My Feed
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </Link>
        ) : (
          <>
            <Link href="/sign-up">
              <button className="relative group overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-orange-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:scale-102 active:scale-98 transition-all cursor-pointer">
                <span className="relative z-10 flex items-center gap-2">
                  Verify Student Email
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
              </button>
            </Link>
            <Link href="/sign-in">
              <button className="rounded-2xl border border-border bg-card/45 backdrop-blur px-8 py-3.5 text-sm font-bold text-foreground hover:bg-muted/40 hover:text-foreground transition-all cursor-pointer">
                Sign In
              </button>
            </Link>
          </>
        )}
      </div>

      {/* ─── Interactive Interactive Showcase (Feeds & Dating Swiper) ─── */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto px-4">
        {/* Mock Feed Card */}
        <div className="glass-card-dark rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-xl">
          <div className="absolute -left-6 -top-6 h-16 w-16 rounded-full bg-primary/10 blur-xl" />
          <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-primary/20 text-[10px] font-bold text-primary flex items-center justify-center">
                🙊
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-wide uppercase text-muted-foreground">Anonymous Confession</p>
                <p className="text-[8px] text-muted-foreground/60">3 mins ago • Birla Institute of Technology</p>
              </div>
            </div>
            <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[8px] font-bold text-rose-500">
              Spicy
            </span>
          </div>

          <p className="text-sm font-medium leading-relaxed text-foreground/90">
            "To the senior who helped me find the mechanical lab yesterday while I was looking completely lost... you are literally a lifesaver. Pls comment if you see this, I owe you a chai ☕😭"
          </p>

          {/* Interactive Poll inside feed */}
          <div className="mt-4 space-y-2 border border-border/40 rounded-2xl p-4 bg-muted/10">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Campus Pulse Poll</p>
            <p className="text-xs font-semibold text-foreground">Is canteen coffee better than campus Nescafe?</p>
            <div className="space-y-1.5 pt-1">
              {[
                "Yes, canteen coffee hits different",
                "No, Nescafe is elite",
                "Both are battery water tbh"
              ].map((opt, idx) => {
                const count = pollVotes[idx];
                const pct = totalPollVotes > 0 ? Math.round((count / totalPollVotes) * 100) : 0;
                return (
                  <button
                    key={idx}
                    disabled={pollVoted !== null}
                    onClick={() => handleVotePoll(idx)}
                    className="w-full relative overflow-hidden rounded-xl border border-border/40 py-2 px-3 text-left text-xs font-semibold hover:bg-muted/40 transition-colors disabled:hover:bg-transparent cursor-pointer"
                  >
                    {pollVoted !== null && (
                      <div 
                        className="absolute inset-y-0 left-0 bg-primary/10 transition-all duration-500" 
                        style={{ width: `${pct}%` }} 
                      />
                    )}
                    <div className="relative flex justify-between">
                      <span>{opt}</span>
                      {pollVoted !== null && <span className="text-primary">{pct}%</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-5 pt-3 border-t border-border/30 text-xs font-semibold">
            <button 
              onClick={() => {
                setVotes(prev => hasVoted ? prev - 1 : prev + 1);
                setHasVoted(!hasVoted);
              }}
              className={cn(
                "flex items-center gap-1.5 cursor-pointer transition-colors px-2.5 py-1 rounded-full",
                hasVoted ? "bg-rose-500/10 text-rose-500" : "text-muted-foreground hover:text-rose-500"
              )}
            >
              <Heart className={cn("h-4 w-4", hasVoted && "fill-rose-500")} />
              <span>{votes}</span>
            </button>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              <span>18 comments</span>
            </div>
          </div>
        </div>

        {/* Mock Match Card */}
        <div className="glass-card-dark rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-xl min-h-[380px]">
          <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-orange-500/10 blur-xl" />
          
          <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-orange-500 animate-pulse" />
              <p className="text-[10px] font-bold tracking-wide uppercase text-muted-foreground">Campus Matches Deck</p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[8px] font-bold text-emerald-500 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              1.2k Active
            </span>
          </div>

          {matched ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95">
              <div className="flex -space-x-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-primary to-orange-500 flex items-center justify-center text-2xl border-4 border-card shadow-lg">
                  👩‍💻
                </div>
                <div className="h-14 w-14 rounded-full bg-primary flex items-center justify-center text-white text-sm font-extrabold border-4 border-card shadow-lg">
                  YOU
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-foreground">It's a Campus Match! 🎉</h4>
                <p className="text-xs text-muted-foreground max-w-[220px]">
                  Aria liked you back! A secure, encrypted chat room has been created.
                </p>
              </div>
              <button
                onClick={resetSwipe}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md cursor-pointer hover:opacity-95"
              >
                Try Swiping Again
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between">
              {/* Profile details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-muted/60 border border-border/40 flex items-center justify-center text-2xl shadow-sm">
                    {mockProfiles[swipeIdx].avatar}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-foreground">{mockProfiles[swipeIdx].name}</h4>
                    <p className="text-[10px] font-medium text-primary uppercase">{mockProfiles[swipeIdx].college}</p>
                  </div>
                </div>
                <p className="text-xs font-medium italic text-muted-foreground/90 bg-muted/20 border border-border/40 rounded-xl p-3">
                  "{mockProfiles[swipeIdx].bio}"
                </p>
              </div>

              {/* Swipe Action Buttons */}
              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={() => handleSwipe(false)}
                  className="h-12 w-12 rounded-full border border-border/60 hover:bg-muted/40 text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer transition-transform active:scale-90"
                  title="Swipe Left / Skip"
                >
                  ✕
                </button>
                <button
                  onClick={() => handleSwipe(true)}
                  className="h-12 w-12 rounded-full bg-gradient-to-tr from-primary to-orange-500 text-white shadow-md flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-90"
                  title="Swipe Right / Like"
                >
                  ❤
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Frequently Asked Questions Accordions ─── */}
      <div className="max-w-3xl mx-auto px-4 mt-20">
        <h3 className="text-xl font-bold tracking-tight text-center text-foreground mb-8">
          Clear answers. No corporate talk.
        </h3>
        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="glass-card-dark rounded-2xl overflow-hidden transition-all duration-300 border border-border/40"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer hover:bg-muted/20"
                >
                  <span className="text-sm font-bold text-foreground">{faq.q}</span>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180")} />
                </button>
                <div 
                  className={cn(
                    "transition-all duration-300 overflow-hidden",
                    isOpen ? "max-h-48 border-t border-border/30 px-5 py-4" : "max-h-0 py-0"
                  )}
                >
                  <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
