"use client";

import { useState, useEffect } from "react";
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
  Zap,
  Globe,
  Award,
  Send,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function LandingInteractive({ isAuthenticated }: { isAuthenticated: boolean }) {
  // --- 1. LP Points Accumulator State ---
  const [points, setPoints] = useState(10);
  const [floaters, setFloaters] = useState<{ id: number; text: string }[]>([]);
  const rankTitle = points >= 100 ? "Campus Legend 🔥" : points >= 40 ? "Campus Talker 👑" : "Loop Starter ⚡";
  const badgeColor = points >= 100 
    ? "border-rose-500 bg-rose-500/10 text-rose-500" 
    : points >= 40 
    ? "border-violet-500 bg-violet-500/10 text-violet-500" 
    : "border-primary/20 bg-primary/5 text-primary";

  const addPoints = (amount: number, label: string) => {
    setPoints(prev => prev + amount);
    const id = Date.now();
    setFloaters(prev => [...prev, { id, text: `+${amount} LP (${label})` }]);
    setTimeout(() => {
      setFloaters(prev => prev.filter(f => f.id !== id));
    }, 1500);

    // Dynamic thresholds notifications
    if (points < 40 && points + amount >= 40) {
      toast.success("Rank Upgraded to: Campus Talker 👑!");
    } else if (points < 100 && points + amount >= 100) {
      toast.success("Rank Upgraded to: Campus Legend 🔥!");
    }
  };

  // --- 2. Live Confession Moderator State ---
  const [confessionInput, setConfessionInput] = useState("");
  const [censorType, setCensorType] = useState<string | null>(null);
  const [cryptHash, setCryptHash] = useState("anon_undefined");

  useEffect(() => {
    if (!confessionInput) {
      setCensorType(null);
      setCryptHash("anon_undefined");
      return;
    }

    let detected: string | null = null;
    if (/\b\d{10}\b/g.test(confessionInput)) {
      detected = "Phone Number";
    } else if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g.test(confessionInput)) {
      detected = "Student Email";
    }

    // Generate simulated database hash
    let hash = 0;
    for (let i = 0; i < confessionInput.length; i++) {
      hash = (hash << 5) - hash + confessionInput.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padEnd(8, "f");

    setCensorType(detected);
    setCryptHash(`anon_${hex}`);
  }, [confessionInput]);

  // --- 3. Vanity Link State ---
  const [claimInput, setClaimInput] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const cleanClaimHandle = claimInput.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();

  const handleClaim = () => {
    if (!cleanClaimHandle) return;
    const shareLink = `https://campusloop.space/@${cleanClaimHandle}`;
    navigator.clipboard.writeText(shareLink);
    toast.success(`Vanity Link Copied: ${shareLink} 🚀`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // --- 4. Micro-Swipe Dating State ---
  const [swipeIdx, setSwipeIdx] = useState(0);
  const [matched, setMatched] = useState(false);
  const mockProfiles = [
    { name: "Aria, 21", college: "IIT Delhi", bio: "Economics major. Caffeinated 24/7. Let's debate canteen Maggi.", avatar: "👩‍💻" },
    { name: "Kabir, 22", college: "BIT Mesra", bio: "Guitarist & Dev. Looking for someone to attend fusion night with.", avatar: "🎸" },
    { name: "Priya, 20", college: "BITS Pilani", bio: "Design student. Can help you fix your UI, but not your life.", avatar: "🎨" }
  ];

  const handleSwipe = (liked: boolean) => {
    if (liked && swipeIdx === 0) {
      setMatched(true);
    } else {
      setSwipeIdx(prev => (prev + 1) % mockProfiles.length);
    }
  };

  // --- 5. FAQ Accordion States ---
  const [openFaq, setOpenFaq] = useState<number | null>(null);
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
    <div className="space-y-20 pt-4">
      {/* ─── Hero CTA Buttons ─── */}
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

      {/* ─── Hero Showcase Grid: 4+ new components ─── */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto px-4 mt-8">
        
        {/* Component 1: Interactive Loop Points & Rank Accumulator */}
        <div className="glass-card-dark rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-xl group border border-border/40 min-h-[350px]">
          <div className="absolute inset-0 border border-transparent group-hover:border-primary/10 rounded-3xl transition-colors duration-300 pointer-events-none" />
          
          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between border-b border-border/30 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">1. Gamified Vibe Dashboard</span>
              <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Award className="h-3 w-3" /> Live Vibe Check
              </span>
            </div>

            {/* Simulated Profile Vibe Indicator */}
            <div className="flex items-center gap-4 bg-muted/20 border border-border/45 rounded-2xl p-4 relative">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-xl shrink-0">
                🎓
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-xs font-black text-foreground">You (Mock Classmate)</p>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                    {rankTitle}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground">{points} LP</span>
                </div>
              </div>
              
              {/* Floating indicators overflow container */}
              <div className="absolute right-4 top-2 pointer-events-none">
                {floaters.map(f => (
                  <div key={f.id} className="text-[10px] font-black text-primary animate-bounce pr-2">
                    {f.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions grid to earn points */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button 
                onClick={() => addPoints(5, "Spill Confession")}
                className="rounded-xl border border-border/60 py-2.5 px-3 text-left text-xs font-semibold hover:bg-muted/40 transition-colors cursor-pointer"
              >
                🤫 Spill Tea <span className="text-primary font-bold float-right">+5</span>
              </button>
              <button 
                onClick={() => addPoints(20, "Invite Group Chat")}
                className="rounded-xl border border-border/60 py-2.5 px-3 text-left text-xs font-semibold hover:bg-muted/40 transition-colors cursor-pointer"
              >
                👥 Invite Friends <span className="text-primary font-bold float-right">+20</span>
              </button>
              <button 
                onClick={() => addPoints(2, "Vote in Poll")}
                className="rounded-xl border border-border/60 py-2.5 px-3 text-left text-xs font-semibold hover:bg-muted/40 transition-colors cursor-pointer"
              >
                📊 Cast Vote <span className="text-primary font-bold float-right">+2</span>
              </button>
              <button 
                onClick={() => addPoints(10, "Story React")}
                className="rounded-xl border border-border/60 py-2.5 px-3 text-left text-xs font-semibold hover:bg-muted/40 transition-colors cursor-pointer"
              >
                🔥 React Story <span className="text-primary font-bold float-right">+10</span>
              </button>
            </div>
          </div>
          <p className="text-[9px] text-muted-foreground/60 font-semibold pt-4">Points trigger dynamic Vibe rank upgrades inside the local campus system.</p>
        </div>

        {/* Component 2: Confession Live Moderator / Cryptographical Sandbox */}
        <div className="glass-card-dark rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-xl group border border-border/40 min-h-[350px]">
          <div className="absolute inset-0 border border-transparent group-hover:border-primary/10 rounded-3xl transition-colors duration-300 pointer-events-none" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/30 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">2. Safe Confessions Sandbox</span>
              {censorType ? (
                <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Auto Censored
                </span>
              ) : confessionInput ? (
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  🟢 Approved
                </span>
              ) : (
                <span className="text-[9px] font-bold text-muted-foreground">Awaiting Input</span>
              )}
            </div>

            <div className="space-y-2">
              <textarea
                value={confessionInput}
                onChange={(e) => setConfessionInput(e.target.value)}
                placeholder="Type phone (9876543210) or email (test@college.edu) to test the security filter..."
                className="w-full h-20 rounded-xl bg-muted/20 border border-border/30 px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/50 resize-none font-mono placeholder:text-muted-foreground/40 font-semibold"
              />

              <div className="bg-muted/15 rounded-xl p-3 border border-border/20 font-mono text-[10px] space-y-1">
                <div className="flex justify-between text-muted-foreground">
                  <span>Processed String:</span>
                  <span className="text-foreground font-semibold truncate max-w-[200px]">
                    {confessionInput ? confessionInput.replace(/\b\d{10}\b/g, "[REDACTED]").replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[REDACTED]") : "No input"}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Database Anon Key:</span>
                  <span className="text-primary font-bold">{cryptHash}</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-[9px] text-muted-foreground/60 font-semibold pt-4">Confessions pass through automatic regex screening at the Cloudflare worker boundary.</p>
        </div>

        {/* Component 3: Dynamic Vanity Username Claim Preview */}
        <div className="glass-card-dark rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-xl group border border-border/40 min-h-[350px]">
          <div className="absolute inset-0 border border-transparent group-hover:border-primary/10 rounded-3xl transition-colors duration-300 pointer-events-none" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/30 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">3. Vanity Link Claimer</span>
              <span className="text-[9px] font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Globe className="h-3 w-3" /> Unique Link
              </span>
            </div>

            <div className="space-y-3.5 bg-muted/20 border border-border/45 rounded-2xl p-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Choose Handle</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">@</span>
                  <input
                    type="text"
                    placeholder="aarav_sharma"
                    value={claimInput}
                    onChange={(e) => setClaimInput(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background pl-7 pr-4 py-2 text-xs font-semibold focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              {/* URL preview */}
              <div className="rounded-xl bg-card p-3 border border-border/30 font-mono text-[10px] text-center break-words select-all">
                campusloop.space/@{cleanClaimHandle || "your_handle"}
              </div>

              <button
                onClick={handleClaim}
                disabled={!cleanClaimHandle}
                className="w-full rounded-xl bg-primary text-white h-9 text-xs font-bold hover:opacity-90 shadow-md shadow-primary/15 transition-all cursor-pointer disabled:opacity-50"
              >
                {isCopied ? "Claimed Link!" : "Claim My Vanity URL"}
              </button>
            </div>
          </div>
          <p className="text-[9px] text-muted-foreground/60 font-semibold pt-4">Direct vanity URLs serve high-virality invitation cards to campus guests.</p>
        </div>

        {/* Component 4: Micro-Swipe Matches Tinder Deck */}
        <div className="glass-card-dark rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-xl group border border-border/40 min-h-[350px]">
          <div className="absolute inset-0 border border-transparent group-hover:border-primary/10 rounded-3xl transition-colors duration-300 pointer-events-none" />
          
          <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">4. Campus Match swiper</span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[8px] font-bold text-emerald-500 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" /> Match Vibe
            </span>
          </div>

          {matched ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in-95">
              <div className="flex -space-x-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-primary to-orange-500 flex items-center justify-center text-2xl border-4 border-card shadow-lg">
                  👩‍💻
                </div>
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white text-xs font-extrabold border-4 border-card shadow-lg">
                  YOU
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-extrabold text-foreground">It's a Campus Match! 🎉</h4>
                <p className="text-[10px] text-muted-foreground max-w-[200px]">
                  Aria liked you back! Mutual chat unlocked.
                </p>
              </div>
              <button
                onClick={() => setMatched(false)}
                className="rounded-xl bg-primary px-3 py-1.5 text-[10px] font-bold text-white shadow-md cursor-pointer hover:opacity-95"
              >
                Keep Swiping
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between">
              {/* Profile details */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-muted/65 border border-border/40 flex items-center justify-center text-xl shadow-sm">
                    {mockProfiles[swipeIdx].avatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-foreground">{mockProfiles[swipeIdx].name}</h4>
                    <p className="text-[9px] font-medium text-primary uppercase">{mockProfiles[swipeIdx].college}</p>
                  </div>
                </div>
                <p className="text-[11px] font-medium italic text-muted-foreground bg-muted/20 border border-border/40 rounded-xl p-3">
                  "{mockProfiles[swipeIdx].bio}"
                </p>
              </div>

              {/* Swipe Action Buttons */}
              <div className="flex justify-center gap-4 pt-4">
                <button
                  onClick={() => handleSwipe(false)}
                  className="h-10 w-10 rounded-full border border-border/60 hover:bg-muted/40 text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer transition-transform active:scale-90"
                >
                  ✕
                </button>
                <button
                  onClick={() => handleSwipe(true)}
                  className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-orange-500 text-white shadow-md flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
                >
                  ❤
                </button>
              </div>
            </div>
          )}
          <p className="text-[9px] text-muted-foreground/60 font-semibold pt-4">Matches are strictly verified college students from your local region.</p>
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
