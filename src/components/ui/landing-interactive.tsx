"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Heart, 
  MessageCircle, 
  Sparkles, 
  UserCheck, 
  Lock, 
  ShieldAlert, 
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkle
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { cn } from "@/lib/utils";

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

  // Privacy Simulator state
  const [simInput, setSimInput] = useState("");
  const [censoredText, setCensoredText] = useState("");
  const [doxxType, setDoxxType] = useState<string | null>(null);
  const [hashValue, setHashValue] = useState("");

  // Spotlight mouse track coordinates
  const [coords1, setCoords1] = useState({ x: 0, y: 0 });
  const [coords2, setCoords2] = useState({ x: 0, y: 0 });
  const [coords3, setCoords3] = useState({ x: 0, y: 0 });

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

  // Real-time privacy screening logic simulator
  useEffect(() => {
    if (!simInput) {
      setCensoredText("");
      setDoxxType(null);
      setHashValue("");
      return;
    }

    let text = simInput;
    let detected: string | null = null;

    // Scan for 10 digit phone numbers
    const phoneRegex = /\b\d{10}\b/g;
    if (phoneRegex.test(text)) {
      text = text.replace(phoneRegex, "[REDACTED PHONE NUMBER]");
      detected = "Phone Number";
    }

    // Scan for student email patterns
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    if (emailRegex.test(text)) {
      text = text.replace(emailRegex, "[REDACTED STUDENT EMAIL]");
      detected = "Student Email";
    }

    // Simple hash generator simulation
    let hash = 0;
    for (let i = 0; i < simInput.length; i++) {
      const char = simInput.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padEnd(8, "f");

    setCensoredText(text);
    setDoxxType(detected);
    setHashValue(`anon_${hex}`);
  }, [simInput]);

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
    <div className="space-y-24 pt-4">
      {/* ─── CTA Buttons for Hero ─── */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
        {isAuthenticated ? (
          <Link href="/app">
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
            <Link href="/join?mode=signup">
              <button className="relative group overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-orange-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:scale-102 active:scale-98 transition-all cursor-pointer">
                <span className="relative z-10 flex items-center gap-2">
                  Verify Student Email
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
              </button>
            </Link>
            <Link href="/join?mode=signin">
              <button className="rounded-2xl border border-border bg-card/45 backdrop-blur px-8 py-3.5 text-sm font-bold text-foreground hover:bg-muted/40 hover:text-foreground transition-all cursor-pointer">
                Sign In
              </button>
            </Link>
          </>
        )}
      </div>

      {/* ─── Interactive Interactive Showcase (Feeds & Dating Swiper) ─── */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto px-4">
        {/* Mock Feed Card with Mouse Spotlight */}
        <div 
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setCoords1({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          }}
          style={{
            "--mouse-x": `${coords1.x}px`,
            "--mouse-y": `${coords1.y}px`
          } as React.CSSProperties}
          className="glass-card-dark rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-xl group border border-border/40 bg-[radial-gradient(400px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(244,63,94,0.06),transparent_80%)]"
        >
          {/* Border beam effect */}
          <div className="absolute inset-0 border border-transparent group-hover:border-primary/10 rounded-3xl transition-colors duration-300 pointer-events-none" />
          
          <div>
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

        {/* Mock Match Card with Mouse Spotlight */}
        <div 
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setCoords2({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          }}
          style={{
            "--mouse-x": `${coords2.x}px`,
            "--mouse-y": `${coords2.y}px`
          } as React.CSSProperties}
          className="glass-card-dark rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-xl group border border-border/40 min-h-[380px] bg-[radial-gradient(400px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(249,115,22,0.06),transparent_80%)]"
        >
          <div className="absolute inset-0 border border-transparent group-hover:border-primary/10 rounded-3xl transition-colors duration-300 pointer-events-none" />
          
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
                  className="h-12 w-12 rounded-full bg-gradient-to-tr from-primary to-orange-500 text-white shadow-md flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
                  title="Swipe Right / Like"
                >
                  ❤
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── NEW COMPONENT: Interactive Privacy & Safety Shield Simulator ─── */}
      <div className="max-w-4xl mx-auto px-4 mt-24">
        <div 
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setCoords3({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          }}
          style={{
            "--mouse-x": `${coords3.x}px`,
            "--mouse-y": `${coords3.y}px`
          } as React.CSSProperties}
          className="glass-card-dark rounded-3xl p-8 relative overflow-hidden shadow-xl border border-border/40 bg-[radial-gradient(600px_circle_at_var(--mouse-x)_var(--mouse-y),rgba(16,185,129,0.05),transparent_80%)] grid md:grid-cols-5 gap-8 items-center"
        >
          {/* Header & Details */}
          <div className="md:col-span-2 space-y-4">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-black tracking-tight text-foreground">
              Verify Our <br />
              <span className="text-emerald-500">Privacy Shield</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We separate student identity from content entirely. Use this interactive console to see how our Edge worker processes, sanitizes, and hashes data instantly before it hits the database.
            </p>
            <div className="space-y-2 pt-2 text-[10px] font-semibold text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Doxx & Slur auto-censoring
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                SHA-256 separation hash
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Zero trace back to verified email
              </div>
            </div>
          </div>

          {/* Live Simulator Console */}
          <div className="md:col-span-3 space-y-4 bg-black/45 border border-border/45 rounded-2xl p-5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border/20 pb-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">CampusLoop Core v1.4</span>
              <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                ONLINE
              </span>
            </div>

            {/* Input area */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-muted-foreground uppercase">1. Write a Test Post</span>
              <textarea
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
                placeholder="Type a phone (9876543210) or email (test@edu.in) to check..."
                className="w-full h-16 rounded-lg bg-muted/20 border border-border/30 px-3 py-2 text-[11px] text-foreground focus:outline-none focus:border-emerald-500/50 resize-none font-mono placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Output area */}
            <div className="space-y-2 border-t border-border/10 pt-3">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">2. Processed Output:</span>
                {doxxType ? (
                  <span className="text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3" />
                    Censored: {doxxType}
                  </span>
                ) : simInput ? (
                  <span className="text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    Safe to post
                  </span>
                ) : null}
              </div>
              
              <div className="min-h-12 bg-muted/10 border border-border/20 rounded-lg p-3 text-[11px] text-foreground/80 break-words">
                {censoredText || <span className="text-muted-foreground/30 italic">No output yet...</span>}
              </div>

              <div className="flex items-center justify-between text-[10px] pt-1">
                <span className="text-muted-foreground">3. Hash Signature:</span>
                <span className="text-primary font-bold">{hashValue || "anon_undefined"}</span>
              </div>
            </div>
          </div>
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
