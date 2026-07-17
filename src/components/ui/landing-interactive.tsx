"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Heart, 
  MessageSquare, 
  Sparkles, 
  Lock, 
  ShieldAlert, 
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Award,
  Send,
  AlertTriangle,
  Smartphone,
  Eye,
  CheckCircle,
  XCircle,
  Coins
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function LandingInteractive({ isAuthenticated }: { isAuthenticated: boolean }) {
  // --- Active Tab State in the Mock App Phone ---
  const [activeTab, setActiveTab] = useState<"feed" | "match" | "confess" | "vibe">("feed");

  // --- 1. Feed Tab State ---
  const [feedHearts, setFeedHearts] = useState(142);
  const [hasHearted, setHasHearted] = useState(false);
  const [feedReplies, setFeedReplies] = useState([
    { author: "anon_8f3d", text: "literally, nescafe coffee is just warm battery acid" },
    { author: "anon_a2c1", text: "nah, canteen coffee hits different during exams" }
  ]);
  const [replyInput, setReplyInput] = useState("");

  const handleAddReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim()) return;
    setFeedReplies(prev => [...prev, { author: "anon_you", text: replyInput.trim() }]);
    setReplyInput("");
    toast.success("Mock reply added to preview feed! 🚀");
  };

  // --- 2. Match Tab State ---
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

  // --- 3. Confession Tab State ---
  const [confessionText, setConfessionText] = useState("");
  const [censorMsg, setCensorMsg] = useState<string | null>(null);
  const [dbHash, setDbHash] = useState("anon_undefined");

  useEffect(() => {
    if (!confessionText) {
      setCensorMsg(null);
      setDbHash("anon_undefined");
      return;
    }

    let detected: string | null = null;
    if (/\b\d{10}\b/g.test(confessionText)) {
      detected = "Harassment Prevention: Phone number detected.";
    } else if (/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g.test(confessionText)) {
      detected = "Privacy Shield: Student email address detected.";
    }

    let hash = 0;
    for (let i = 0; i < confessionText.length; i++) {
      hash = (hash << 5) - hash + confessionText.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padEnd(8, "f");

    setCensorMsg(detected);
    setDbHash(`anon_${hex}`);
  }, [confessionText]);

  // --- 4. Vibe Tab State ---
  const [vibePoints, setVibePoints] = useState(25);
  const [floatingPoints, setFloatingPoints] = useState<{ id: number; text: string }[]>([]);

  const addVibePoints = (amount: number, reason: string) => {
    setVibePoints(prev => prev + amount);
    const id = Date.now();
    setFloatingPoints(prev => [...prev, { id, text: `+${amount} LP` }]);
    setTimeout(() => {
      setFloatingPoints(prev => prev.filter(f => f.id !== id));
    }, 1200);

    toast.success(`Simulated action: ${reason}! Earned ${amount} Loop Points! ⚡`);
  };

  // Rank titles matching our gamification framework
  const rankInfo = vibePoints >= 200 
    ? { title: "Campus Legend 🔥", color: "text-rose-500 bg-rose-500/10 border-rose-500/20" }
    : vibePoints >= 80 
    ? { title: "Campus Talker 👑", color: "text-violet-500 bg-violet-500/10 border-violet-500/20" }
    : { title: "Loop Starter ⚡", color: "text-primary bg-primary/10 border-primary/20" };

  return (
    <div className="grid lg:grid-cols-12 gap-12 items-center max-w-5xl mx-auto px-4 mt-8 pb-12">
      {/* LEFT: Copywriting & Actions */}
      <div className="lg:col-span-6 space-y-6 text-left">
        <div className="space-y-4">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Smartphone className="h-5 w-5" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground leading-snug">
            Step Inside the <br />
            <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">Campus Interface</span>
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed font-semibold max-w-md">
            Interactive, gamified, and verified. Tap the tabs on the right device mockup to simulate how confessions, swipes, and safety firewalls run instantly in our application ecosystem.
          </p>
        </div>

        <div className="space-y-3.5 bg-muted/15 border border-border/40 rounded-2xl p-5 max-w-md">
          <h3 className="text-xs font-black uppercase tracking-wider text-foreground">Interactive Feature Checklist</h3>
          <div className="space-y-2 text-[11px] font-semibold text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Swipe match decks with zero catfishing risks.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Regex safety shields protecting student email profiles.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Earn Loop Points to level up ranks on verified domains.</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link href="/app">
              <button className="rounded-xl bg-primary text-white text-xs font-bold px-6 h-10 hover:opacity-90 shadow-md shadow-primary/15 transition-all cursor-pointer flex items-center gap-2">
                Go to Dashboard <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </Link>
          ) : (
            <Link href="/join?mode=signup">
              <button className="rounded-xl bg-primary text-white text-xs font-bold px-6 h-10 hover:opacity-90 shadow-md shadow-primary/15 transition-all cursor-pointer flex items-center gap-2">
                Join Campus Network <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </Link>
          )}
          <Link href="/pitch">
            <button className="rounded-xl border border-border bg-card/45 px-6 h-10 text-xs font-bold text-foreground hover:bg-muted/40 hover:text-foreground transition-all cursor-pointer">
              Pitch Deck
            </button>
          </Link>
        </div>
      </div>

      {/* RIGHT: High-End Immersive Mobile Device Mockup */}
      <div className="lg:col-span-6 flex justify-center relative">
        {/* Glow overlay behind phone */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-violet-500/10 to-orange-500/10 rounded-full blur-2xl -z-10" />

        {/* Mobile Device Frame */}
        <div className="relative w-[320px] h-[580px] bg-black rounded-[40px] p-3 shadow-2xl border-4 border-muted-foreground/30 flex flex-col justify-between overflow-hidden">
          {/* Dynamic Speaker & Camera Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-4.5 bg-black rounded-full z-30 flex items-center justify-around px-4">
            <div className="w-12 h-1 bg-neutral-800 rounded-full" />
            <div className="w-2.5 h-2.5 bg-neutral-900 rounded-full border border-neutral-800" />
          </div>

          {/* Screen Content Wrapper */}
          <div className="flex-1 w-full bg-background rounded-[30px] overflow-hidden flex flex-col relative z-20 pt-6">
            
            {/* Mock App Header */}
            <div className="h-12 border-b border-border/40 px-4 flex items-center justify-between bg-muted/10 shrink-0">
              <span className="text-[10px] font-black tracking-tight bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">CampusLoop</span>
              <span className="text-[9px] font-bold text-muted-foreground flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> DU Campus
              </span>
            </div>

            {/* Screen Content Body */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 select-none">
              
              {/* TAB 1: FEED VIEW */}
              {activeTab === "feed" && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <div className="border border-border/40 rounded-2xl p-3 bg-muted/10 space-y-2">
                    <div className="flex items-center justify-between text-[9px] text-muted-foreground font-semibold">
                      <span>🙊 Anonymous Confession</span>
                      <span>5 mins ago</span>
                    </div>
                    <p className="text-[11px] font-medium leading-relaxed text-foreground/90">
                      "Should we start a protest against the new cafeteria rules? Canteen Nescafe coffee tastes like warm battery acid recently. Nescafe booth is elite coffee tbh 😭"
                    </p>

                    {/* Upvote & Reply counts */}
                    <div className="flex items-center gap-3.5 pt-2 border-t border-border/20 text-[10px] font-semibold text-muted-foreground">
                      <button 
                        onClick={() => {
                          setFeedHearts(prev => hasHearted ? prev - 1 : prev + 1);
                          setHasHearted(!hasHearted);
                        }}
                        className={cn("flex items-center gap-1 hover:text-rose-500", hasHearted && "text-rose-500")}
                      >
                        <Heart className={cn("h-3.5 w-3.5", hasHearted && "fill-rose-500")} />
                        <span>{feedHearts}</span>
                      </button>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>{feedReplies.length} replies</span>
                      </span>
                    </div>
                  </div>

                  {/* Replies sub-deck */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Replies</p>
                    <div className="space-y-1">
                      {feedReplies.map((r, i) => (
                        <div key={i} className="text-[9px] bg-muted/15 border border-border/30 rounded-lg p-2 font-semibold">
                          <span className="text-primary font-bold mr-1">@{r.author}</span>
                          <span className="text-foreground/80">{r.text}</span>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleAddReply} className="flex gap-1.5 pt-2">
                      <input
                        type="text"
                        placeholder="Add mock reply..."
                        value={replyInput}
                        onChange={(e) => setReplyInput(e.target.value)}
                        className="flex-1 bg-muted/20 border border-border/30 rounded-lg px-2 py-1 text-[9px] focus:outline-none"
                      />
                      <button type="submit" className="rounded-lg bg-primary px-2.5 py-1 text-[9px] font-bold text-white shrink-0">
                        Send
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 2: MATCH VIEW */}
              {activeTab === "match" && (
                <div className="space-y-3 animate-in fade-in duration-300 h-full flex flex-col justify-between">
                  {matched ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-8 animate-in zoom-in-95">
                      <div className="flex -space-x-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-primary to-orange-500 flex items-center justify-center text-2xl border-4 border-card shadow-lg">
                          👩‍💻
                        </div>
                        <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white text-xs font-extrabold border-4 border-card shadow-lg">
                          YOU
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black text-foreground">It's a Campus Match! 🎉</h4>
                        <p className="text-[9px] text-muted-foreground leading-normal max-w-[180px] mx-auto">
                          Aria liked you back! An encrypted private chat channel has been unlocked.
                        </p>
                      </div>
                      <button
                        onClick={() => setMatched(false)}
                        className="rounded-xl bg-primary px-3 py-1.5 text-[9px] font-bold text-white shadow-md cursor-pointer hover:opacity-95"
                      >
                        Keep Swiping
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col justify-between min-h-[300px]">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-border/20 pb-2">
                          <span className="text-[8px] font-bold text-muted-foreground uppercase">Matches Deck</span>
                          <span className="text-[8px] font-bold text-emerald-500 flex items-center gap-1">
                            <span className="h-1 w-1 rounded-full bg-emerald-500 animate-ping" /> 1.2k Online
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-muted/65 border border-border/40 flex items-center justify-center text-xl shadow-sm">
                              {mockProfiles[swipeIdx].avatar}
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-foreground">{mockProfiles[swipeIdx].name}</h4>
                              <p className="text-[9px] font-medium text-primary uppercase">{mockProfiles[swipeIdx].college}</p>
                            </div>
                          </div>
                          <p className="text-[10px] font-semibold italic text-muted-foreground bg-muted/20 border border-border/40 rounded-xl p-2.5">
                            "{mockProfiles[swipeIdx].bio}"
                          </p>
                        </div>
                      </div>

                      {/* Swipe Controls */}
                      <div className="flex justify-center gap-3.5 pt-4">
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
                </div>
              )}

              {/* TAB 3: CONFESS VIEW */}
              {activeTab === "confess" && (
                <div className="space-y-3.5 animate-in fade-in duration-300">
                  <div className="space-y-1">
                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Create Anonymously</p>
                    <textarea
                      value={confessionText}
                      onChange={(e) => setConfessionText(e.target.value)}
                      placeholder="Write anonymous gossip... (try typing email or phone numbers to test doxx filter)"
                      className="w-full h-20 rounded-xl bg-muted/20 border border-border/30 px-2.5 py-2 text-[10px] text-foreground focus:outline-none focus:border-primary/50 resize-none font-semibold"
                    />
                  </div>

                  {censorMsg ? (
                    <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 flex items-start gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-[8px] font-bold text-amber-500 leading-normal">{censorMsg}</span>
                    </div>
                  ) : confessionText ? (
                    <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 flex items-start gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-[8px] font-bold text-emerald-500 leading-normal">Censor Pass: Clean post ready.</span>
                    </div>
                  ) : null}

                  <div className="bg-muted/15 rounded-xl p-2.5 border border-border/20 font-mono text-[9px] space-y-1">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Processed Payload:</span>
                      <span className="text-foreground font-semibold truncate max-w-[120px]">
                        {confessionText ? confessionText.replace(/\b\d{10}\b/g, "[REDACTED]").replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[REDACTED]") : "None"}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>SHA-256 Anon Key:</span>
                      <span className="text-primary font-bold">{dbHash}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: VIBE / GAMIFICATION VIEW */}
              {activeTab === "vibe" && (
                <div className="space-y-3.5 animate-in fade-in duration-300">
                  <div className="border border-border/40 rounded-2xl p-3 bg-muted/10 relative">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-lg shrink-0">
                        🎓
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <h4 className="text-[10px] font-black text-foreground">You (Verified Student)</h4>
                        <div className="flex items-center gap-1.5">
                          <span className={cn("text-[7px] font-extrabold px-1.5 py-0.5 rounded-full border", rankInfo.color)}>
                            {rankInfo.title}
                          </span>
                          <span className="text-[8px] font-bold text-muted-foreground">{vibePoints} LP</span>
                        </div>
                      </div>
                    </div>

                    {/* Floating points indicator container */}
                    <div className="absolute right-3 top-2 pointer-events-none">
                      {floatingPoints.map(f => (
                        <div key={f.id} className="text-[9px] font-black text-primary animate-bounce">
                          {f.text}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="space-y-1.5">
                    <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Earn Loop Points (LP)</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button 
                        onClick={() => addVibePoints(5, "Posted confession")}
                        className="rounded-lg border border-border/50 p-2 text-left text-[9px] font-bold hover:bg-muted/30 cursor-pointer"
                      >
                        🤫 Spill Tea <span className="text-primary float-right">+5</span>
                      </button>
                      <button 
                        onClick={() => addVibePoints(20, "Referral registration")}
                        className="rounded-lg border border-border/50 p-2 text-left text-[9px] font-bold hover:bg-muted/30 cursor-pointer"
                      >
                        👥 Referral <span className="text-primary float-right">+20</span>
                      </button>
                      <button 
                        onClick={() => addVibePoints(2, "Voted in poll")}
                        className="rounded-lg border border-border/50 p-2 text-left text-[9px] font-bold hover:bg-muted/30 cursor-pointer"
                      >
                        📊 Cast Vote <span className="text-primary float-right">+2</span>
                      </button>
                      <button 
                        onClick={() => addVibePoints(10, "Reacted to story")}
                        className="rounded-lg border border-border/50 p-2 text-left text-[9px] font-bold hover:bg-muted/30 cursor-pointer"
                      >
                        🔥 React Vibe <span className="text-primary float-right">+10</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Mock Bottom App Nav Tabs */}
            <div className="h-14 border-t border-border/40 bg-muted/15 flex items-center justify-around shrink-0 px-2">
              <button 
                onClick={() => setActiveTab("feed")} 
                className={cn("flex flex-col items-center gap-0.5 text-[8px] font-bold cursor-pointer transition-colors", activeTab === "feed" ? "text-primary" : "text-muted-foreground")}
              >
                <MessageSquare className="h-4.5 w-4.5" /> Feed
              </button>
              <button 
                onClick={() => setActiveTab("match")} 
                className={cn("flex flex-col items-center gap-0.5 text-[8px] font-bold cursor-pointer transition-colors", activeTab === "match" ? "text-primary" : "text-muted-foreground")}
              >
                <Heart className="h-4.5 w-4.5" /> Match
              </button>
              <button 
                onClick={() => setActiveTab("confess")} 
                className={cn("flex flex-col items-center gap-0.5 text-[8px] font-bold cursor-pointer transition-colors", activeTab === "confess" ? "text-primary" : "text-muted-foreground")}
              >
                <Send className="h-4.5 w-4.5" /> Confess
              </button>
              <button 
                onClick={() => setActiveTab("vibe")} 
                className={cn("flex flex-col items-center gap-0.5 text-[8px] font-bold cursor-pointer transition-colors", activeTab === "vibe" ? "text-primary" : "text-muted-foreground")}
              >
                <Coins className="h-4.5 w-4.5" /> Points
              </button>
            </div>

          </div>

          {/* Home Button Bar */}
          <div className="h-5 flex items-center justify-center shrink-0">
            <div className="w-24 h-1 bg-muted-foreground/35 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
