"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  CheckCircle, 
  XCircle, 
  ShieldCheck, 
  ShieldAlert, 
  ArrowRight, 
  Heart, 
  Sparkles, 
  Coins, 
  Zap, 
  Shield, 
  Check, 
  Info,
  ChevronDown,
  Lock,
  Smartphone
} from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// Whitelisted Indian institutions for the mock verification tool
const whitelistedColleges = [
  { domain: "iitd.ac.in", name: "Indian Institute of Technology, Delhi", city: "New Delhi", state: "Delhi" },
  { domain: "bitmesra.ac.in", name: "Birla Institute of Technology, Mesra", city: "Ranchi", state: "Jharkhand" },
  { domain: "bits-pilani.ac.in", name: "Birla Institute of Technology and Science, Pilani", city: "Pilani", state: "Rajasthan" },
  { domain: "nitrkl.ac.in", name: "National Institute of Technology, Rourkela", city: "Rourkela", state: "Odisha" },
  { domain: "du.ac.in", name: "Delhi University", city: "Delhi", state: "Delhi" },
  { domain: "iitb.ac.in", name: "Indian Institute of Technology, Bombay", city: "Mumbai", state: "Maharashtra" },
  { domain: "vit.ac.in", name: "Vellore Institute of Technology", city: "Vellore", state: "Tamil Nadu" },
  { domain: "rvce.edu.in", name: "RV College of Engineering", city: "Bengaluru", state: "Karnataka" },
];

export function AboutClient() {
  // ─── 1. VERIFICATION SIMULATOR STATE ───
  const [emailInput, setEmailInput] = useState("");
  const [verificationStep, setVerificationStep] = useState<"input" | "otp" | "verified" | "unlisted">("input");
  const [detectedCollege, setDetectedCollege] = useState<typeof whitelistedColleges[0] | null>(null);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [whitelistRequest, setWhitelistRequest] = useState({ name: "", domain: "", submitted: false });

  // ─── 2. SAFETY SCANNER STATE ───
  const [postText, setPostText] = useState("");
  const [riskScore, setRiskScore] = useState(0);
  const [safetyTriggers, setSafetyTriggers] = useState<string[]>([]);
  const [anonymityHash, setAnonymityHash] = useState("anon_undefined");

  const safetyPresets = [
    {
      title: "Safe Post",
      text: "Canteen Maggi is so much better than the mess food today! Anyone up for Nescafe at 5?",
    },
    {
      title: "Doxxing Threat",
      text: "Text me at 9876543210 or email me at preetysharma@gmail.com to get the lecture notes.",
    },
    {
      title: "Targeted Claim",
      text: "Rohan Kumar from Mechanical branch stole my cycle near Hostel 3. Do not trust him!",
    },
    {
      title: "Spam Link",
      text: "Get free CAT exam notes inside this telegram group: https://t.me/freecatprep now!",
    }
  ];

  // Run safety scanner rules when text changes
  useEffect(() => {
    if (!postText.trim()) {
      setRiskScore(0);
      setSafetyTriggers([]);
      setAnonymityHash("anon_undefined");
      return;
    }

    const triggers: string[] = [];
    let score = 0;

    // Rule 1: Doxxing check (Phone number)
    if (/\b\d{10}\b/g.test(postText)) {
      triggers.push("Doxxing Shield: Personal phone number detected.");
      score += 45;
    }

    // Rule 2: Doxxing check (Personal Email)
    if (/[a-zA-Z0-9._%+-]+@(gmail|yahoo|outlook|hotmail|icloud)\.[a-zA-Z]{2,}/gi.test(postText)) {
      triggers.push("Privacy Shield: Personal email address detected.");
      score += 40;
    }

    // Rule 3: Targeted Harassment (Names with branches or roll numbers)
    const targetedPattern = /\b(from|in|branch|department)\b.*\b(Mechanical|CS|EE|ECE|Civil|Chemical|Bio| hostel)\b/i;
    const namePattern = /[A-Z][a-z]+ [A-Z][a-z]+/g;
    if (namePattern.test(postText) && (targetedPattern.test(postText) || /stole|cheat|liar|idiot|worst|hate/i.test(postText))) {
      triggers.push("Anti-Harassment Guard: Named targeted claims are prohibited.");
      score += 50;
    }

    // Rule 4: Spam / External Promotion
    if (/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi.test(postText)) {
      triggers.push("Spam Firewall: External links or promotions are restricted.");
      score += 35;
    }

    // Generate cryptographic-like hash for peer anonymity
    let hashVal = 0;
    for (let i = 0; i < postText.length; i++) {
      hashVal = (hashVal << 5) - hashVal + postText.charCodeAt(i);
      hashVal |= 0;
    }
    const hexHash = Math.abs(hashVal).toString(16).slice(0, 6).padEnd(6, "f");

    setRiskScore(Math.min(score, 100));
    setSafetyTriggers(triggers);
    setAnonymityHash(`anon_${hexHash}`);
  }, [postText]);

  // ─── 3. BENTO INTERACTIVE STATE ───
  // Poll Mode
  const [pollVotes, setPollVotes] = useState({ main: 42, nescafe: 58 });
  const [hasVoted, setHasVoted] = useState(false);
  // Match Mode
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [hasMatch, setHasMatch] = useState(false);
  const matchProfiles = [
    { name: "Sneha, 21", college: "BIT Mesra", branch: "CSE", bio: "Always debugging or drinking chai. Let's study for exams together.", avatar: "👩‍💻" },
    { name: "Rahul, 22", college: "IIT Delhi", branch: "EE", bio: "Musician & tech builder. Let's collaborate on a startup project.", avatar: "🎸" },
    { name: "Diya, 20", college: "BITS Pilani", branch: "Design", bio: "Visual designer. I can fix your presentation slides but not your schedule.", avatar: "🎨" }
  ];
  // Loop Points
  const [loopPoints, setLoopPoints] = useState(30);

  // ─── 4. FAQ ACCORDION STATE ───
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqs = [
    {
      q: "How does the college email verification process work?",
      a: "When you sign up, you must enter your official university email (ending in domains like .edu.in or .ac.in). We check this domain against our whitelisted database of accredited institutions. If verified, we send an OTP to that email to validate ownership. Once verified, you get locked into your respective campus feed."
    },
    {
      q: "Is my identity completely anonymous to everyone?",
      a: "Yes. To other students in the community, you are represented solely by a secure anonymous handle (e.g. anon_9e7a). Your real email, name, and profile details are encrypted and hidden. However, to maintain safety, the system stores your author identity in the background—meaning you are anonymous to peers, but accountable to our safety firewall if you violate content policies."
    },
    {
      q: "What triggers the auto-moderation firewall?",
      a: "Our firewall immediately filters out posts containing personally identifiable information (PII) such as phone numbers, personal email addresses, hostel room numbers, or photos containing identification cards. We also flag targeted accusations against private individuals (e.g., calling out specific names and branches) to prevent cyberbullying."
    },
    {
      q: "How does CampusLoop align with the DPDP Act, 2023?",
      a: "CampusLoop strictly enforces data minimization and purpose limitation under the Digital Personal Data Protection Act (DPDP), 2023. Student profile verification is used strictly for authentication. Furthermore, match discovery mode is strictly restricted to users aged 18+ to safeguard minors."
    },
    {
      q: "My college is not listed. How can I request access?",
      a: "If your college domain is not yet whitelisted, you can submit a Request Domain Whitelist form on the About page or email support. Our campus ambassador team will verify the institution's credentials and add it to our whitelist within 24 hours."
    }
  ];

  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const emailStr = emailInput.trim().toLowerCase();
    const domain = emailStr.split("@")[1];
    
    if (!domain) {
      toast.error("Please enter a valid email address.");
      return;
    }

    const matched = whitelistedColleges.find(c => c.domain === domain);
    
    if (matched) {
      setDetectedCollege(matched);
      setVerificationStep("otp");
      setOtpInput("");
      setOtpError(false);
      toast.success(`OTP code sent to ${emailStr}! (Use mock code 1234)`);
    } else {
      setVerificationStep("unlisted");
      setWhitelistRequest(prev => ({ ...prev, domain: domain, submitted: false }));
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput === "1234") {
      setVerificationStep("verified");
      toast.success("Domain whitelist verified successfully! 🚀");
    } else {
      setOtpError(true);
      toast.error("Invalid verification code. Use mock code: 1234");
    }
  };

  const handleVote = (option: "main" | "nescafe") => {
    if (hasVoted) return;
    setHasVoted(true);
    setPollVotes(prev => {
      const mainVotes = option === "main" ? prev.main + 1 : prev.main;
      const nescafeVotes = option === "nescafe" ? prev.nescafe + 1 : prev.nescafe;
      const total = mainVotes + nescafeVotes;
      return {
        main: Math.round((mainVotes / total) * 100),
        nescafe: Math.round((nescafeVotes / total) * 100)
      };
    });
    toast.success("Mock poll vote registered! 🗳️");
  };

  const handleSwipeCard = (liked: boolean) => {
    if (liked && swipeIndex === 0) {
      setHasMatch(true);
      toast.success("It's a Match! Sneha also swiped right! 💬");
    } else {
      setHasMatch(false);
      setSwipeIndex(prev => (prev + 1) % matchProfiles.length);
    }
  };

  const claimPoints = () => {
    setLoopPoints(prev => prev + 10);
    toast.success("Claimed +10 Loop Points! Keep up the daily vibe! ⚡");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground bg-grid-pattern relative overflow-x-hidden pb-16">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[10%] right-[10%] h-[400px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] h-[400px] w-[400px] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] h-[350px] w-[350px] rounded-full bg-violet-500/5 blur-[100px] pointer-events-none" />

      {/* ─── Header ─── */}
      <header className="fixed top-0 right-0 left-0 z-50 flex h-16 items-center justify-between border-b border-border/80 bg-background/70 px-6 backdrop-blur-md lg:px-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-black shadow-md">
            <img src="/logo.png" alt="CampusLoop Logo" className="h-full w-full object-cover scale-110" />
          </div>
          <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-base font-extrabold tracking-tight text-transparent">
            CampusLoop
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/join">
            <button className="rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-white hover:opacity-95 shadow-md shadow-primary/10 transition-all cursor-pointer">
              Join App 🚀
            </button>
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl px-6 pt-24 mx-auto space-y-16">
        {/* ─── Hero Section ─── */}
        <section className="text-center space-y-6 py-8">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold text-primary">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" /> The Verified Campus Social Layer
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none text-foreground">
            A Safe Digital Space For <br />
            <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent">
              Your College Campus
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground font-medium leading-relaxed">
            CampusLoop is an exclusive, domain-authenticated platform built for college students. We combine Reddit-style discussions, confessions, and swipe matches with robust, automated safety systems.
          </p>
          <div className="flex justify-center items-center gap-3 pt-2">
            <a href="#whitelister" className="rounded-full bg-primary hover:bg-primary/95 text-white font-bold text-xs px-5 py-2.5 shadow-lg shadow-primary/20 flex items-center gap-1.5 transition-all">
              Verify Your Domain <ArrowRight className="h-3.5 w-3.5" />
            </a>
            <a href="#safety-shield" className="rounded-full bg-muted border border-border/80 text-foreground hover:bg-muted/80 font-bold text-xs px-5 py-2.5 transition-all">
              Safety Protocols
            </a>
          </div>
        </section>

        {/* ─── Interactive Bento Feature Grid (Artifact 3) ─── */}
        <section className="space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              One Interface, <span className="text-primary">Multi-Mode</span> Access
            </h2>
            <p className="text-xs text-muted-foreground font-semibold">
              Explore the four core interaction modes built for modern university campuses.
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-6">
            {/* Mode 1: Campus Feed (Mock Poll) */}
            <div className="md:col-span-6 rounded-[32px] border border-border/40 bg-card p-6 flex flex-col justify-between space-y-4 hover:border-primary/25 transition-all duration-300 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Smartphone className="h-24 w-24 text-primary" />
              </div>
              <div className="space-y-2">
                <span className="inline-block text-[10px] font-black uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full">
                  Campus Feed Mode
                </span>
                <h3 className="text-base font-extrabold">Instant Polls & Discussions</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Engage anonymously in real-time discussions, vent on confessions, or cast votes on pressing campus polls.
                </p>
              </div>

              {/* Interactive Mock Poll */}
              <div className="border border-border/60 rounded-2xl p-4 bg-muted/40 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-muted-foreground">Live Campus Poll</span>
                </div>
                <h4 className="text-xs font-black text-foreground">Which canteen has the best Maggi?</h4>
                <div className="space-y-2 pt-1">
                  <button 
                    onClick={() => handleVote("main")}
                    disabled={hasVoted}
                    className="w-full relative flex items-center justify-between text-left p-2.5 text-xs font-bold rounded-xl border border-border/80 bg-background hover:bg-muted transition-all cursor-pointer overflow-hidden"
                  >
                    {hasVoted && (
                      <div className="absolute inset-0 bg-primary/10 transition-all" style={{ width: `${pollVotes.main}%` }} />
                    )}
                    <span className="relative z-10">Main Canteen C3</span>
                    <span className="relative z-10 font-black">{hasVoted ? `${pollVotes.main}%` : "Vote"}</span>
                  </button>
                  <button 
                    onClick={() => handleVote("nescafe")}
                    disabled={hasVoted}
                    className="w-full relative flex items-center justify-between text-left p-2.5 text-xs font-bold rounded-xl border border-border/80 bg-background hover:bg-muted transition-all cursor-pointer overflow-hidden"
                  >
                    {hasVoted && (
                      <div className="absolute inset-0 bg-primary/10 transition-all" style={{ width: `${pollVotes.nescafe}%` }} />
                    )}
                    <span className="relative z-10">Nescafe Booth</span>
                    <span className="relative z-10 font-black">{hasVoted ? `${pollVotes.nescafe}%` : "Vote"}</span>
                  </button>
                </div>
                {hasVoted && (
                  <p className="text-[9px] text-center text-muted-foreground font-semibold">
                    Thank you! Simulated vote registered in IIT Delhi loop.
                  </p>
                )}
              </div>
            </div>

            {/* Mode 2: Global Mode */}
            <div className="md:col-span-6 rounded-[32px] border border-border/40 bg-card p-6 flex flex-col justify-between space-y-4 hover:border-primary/25 transition-all duration-300 shadow-sm relative overflow-hidden">
              <div className="space-y-2">
                <span className="inline-block text-[10px] font-black uppercase tracking-wider text-violet-500 bg-violet-500/10 px-2.5 py-0.5 rounded-full">
                  Global Mode
                </span>
                <h3 className="text-base font-extrabold">Cross-Campus Student Groups</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Connect with students in other universities based on common career goals, competitive exams, or interests like coding, music, and design.
                </p>
              </div>

              {/* Group Simulator */}
              <div className="border border-border/60 rounded-2xl p-4 bg-muted/40 space-y-2.5">
                <div className="flex gap-1.5 border-b border-border/80 pb-1.5 overflow-x-auto">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full cursor-pointer shrink-0">
                    #Hackathons 💻
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 text-muted-foreground hover:bg-muted rounded-full cursor-pointer shrink-0">
                    #CAT-Prep 📚
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 text-muted-foreground hover:bg-muted rounded-full cursor-pointer shrink-0">
                    #PGs-Roommates 🏠
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="bg-background rounded-xl p-2.5 border border-border/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-extrabold text-primary">anon_bitm</span>
                      <span className="text-[8px] text-muted-foreground">BIT Mesra • 2m ago</span>
                    </div>
                    <p className="text-[10px] text-foreground font-semibold">
                      Any teams participating in Smart India Hackathon? Need a frontend developer who knows Tailwind.
                    </p>
                  </div>
                  <div className="bg-background rounded-xl p-2.5 border border-border/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-extrabold text-primary">anon_iitd</span>
                      <span className="text-[8px] text-muted-foreground">IIT Delhi • 1h ago</span>
                    </div>
                    <p className="text-[10px] text-foreground font-semibold">
                      SIH registration is open. Our campus ambassadors are hosting a mentorship session this Friday.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mode 3: Match Mode (Swipe Interface) */}
            <div className="md:col-span-7 rounded-[32px] border border-border/40 bg-card p-6 flex flex-col justify-between space-y-4 hover:border-primary/25 transition-all duration-300 shadow-sm relative overflow-hidden">
              <div className="space-y-2">
                <span className="inline-block text-[10px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                  Match Mode (18+ Gated)
                </span>
                <h3 className="text-base font-extrabold">Peer-to-Peer Student Discovery</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Safe, swipe-based discovery to find study buddies, roommates, co-founders, or dates. Fully restricted to verified students.
                </p>
              </div>

              {/* Swipe Deck Simulator */}
              <div className="border border-border/60 rounded-2xl p-4 bg-muted/40 flex flex-col items-center justify-center space-y-3 relative">
                {hasMatch ? (
                  <div className="text-center p-4 bg-primary/5 rounded-2xl border border-primary/20 animate-fade-in w-full space-y-2">
                    <div className="flex justify-center gap-1">
                      <Sparkles className="h-6 w-6 text-primary animate-bounce" />
                      <Heart className="h-6 w-6 text-rose-500 fill-rose-500 animate-pulse" />
                    </div>
                    <h4 className="text-xs font-black text-foreground">Congratulations!</h4>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      You matched with Sneha from BIT Mesra! Start a conversation.
                    </p>
                    <button 
                      onClick={() => { setHasMatch(false); setSwipeIndex((swipeIndex + 1) % matchProfiles.length); }} 
                      className="mt-2 text-[10px] bg-primary text-white font-bold rounded-full px-4 py-1.5 hover:opacity-90"
                    >
                      Keep Swiping
                    </button>
                  </div>
                ) : (
                  <div className="w-full max-w-[280px] bg-background border border-border/60 rounded-xl overflow-hidden shadow-md flex flex-col justify-between p-3.5 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 bg-muted border border-border/80 rounded-full flex items-center justify-center text-lg shadow-inner">
                        {matchProfiles[swipeIndex].avatar}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-foreground">{matchProfiles[swipeIndex].name}</h4>
                        <p className="text-[9px] text-muted-foreground font-bold">{matchProfiles[swipeIndex].college} • {matchProfiles[swipeIndex].branch}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed italic bg-muted/40 p-2.5 rounded-lg border border-border/30">
                      &ldquo;{matchProfiles[swipeIndex].bio}&rdquo;
                    </p>
                    <div className="flex justify-center gap-4 pt-1">
                      <button 
                        onClick={() => handleSwipeCard(false)}
                        className="h-8 w-8 rounded-full border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleSwipeCard(true)}
                        className="h-8 w-8 rounded-full border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-500 flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mode 4: Loop Points (Gamification) */}
            <div className="md:col-span-5 rounded-[32px] border border-border/40 bg-card p-6 flex flex-col justify-between space-y-4 hover:border-primary/25 transition-all duration-300 shadow-sm relative overflow-hidden">
              <div className="space-y-2">
                <span className="inline-block text-[10px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                  Gamification
                </span>
                <h3 className="text-base font-extrabold">Loop Points & Vibe Ranks</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Earn points by contributing safe and engaging posts. Scale from Loop Starter to Campus Legend!
                </p>
              </div>

              {/* Loop Points Ticker */}
              <div className="border border-border/60 rounded-2xl p-4 bg-muted/40 flex flex-col items-center justify-between text-center space-y-3.5">
                <div className="flex items-center gap-1.5">
                  <Coins className="h-5 w-5 text-amber-500 fill-amber-500 animate-spin-slow" />
                  <span className="text-lg font-black text-foreground">{loopPoints} LP</span>
                </div>
                <div className="w-full space-y-1.5">
                  <div className="flex justify-between text-[9px] font-bold text-muted-foreground">
                    <span>Rank: {loopPoints >= 80 ? "Campus Legend 🔥" : "Loop Starter ⚡"}</span>
                    <span>{loopPoints}/80 LP to Level Up</span>
                  </div>
                  <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-orange-500 transition-all duration-500" 
                      style={{ width: `${Math.min((loopPoints / 80) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <button 
                  onClick={claimPoints}
                  className="w-full text-[10px] bg-primary text-white font-bold rounded-full py-1.5 hover:opacity-90 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Zap className="h-3.5 w-3.5 fill-current" /> Claim Daily Points
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Artifact 1: Verification Whitelist simulator ─── */}
        <section id="whitelister" className="rounded-[32px] border border-border/40 bg-card p-6 sm:p-8 space-y-6 hover:border-primary/25 transition-all shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Campus Domain <span className="text-primary">Whitelist Simulator</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-2xl leading-relaxed">
                CampusLoop utilizes college domain whitelists (e.g., `iitd.ac.in`) to verify active student identities. Test out the validator below to see how our onboarding pipeline handles email verification.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-12 gap-8 pt-2">
            {/* Validator Tool */}
            <div className="md:col-span-7 bg-muted/20 border border-border/40 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground">Step-by-step Onboarding</h3>
              
              {verificationStep === "input" && (
                <form onSubmit={handleVerifyEmail} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-muted-foreground">College Email Address</label>
                    <div className="relative">
                      <input 
                        type="text"
                        placeholder="you@yourcollege.ac.in"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="w-full text-xs font-bold bg-background border border-border/80 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-muted-foreground">Or click a quick-test domain:</span>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {whitelistedColleges.slice(0, 4).map((col) => (
                        <button
                          key={col.domain}
                          type="button"
                          onClick={() => setEmailInput(`student@${col.domain}`)}
                          className="text-[9px] font-bold border border-border/80 bg-background hover:bg-muted hover:border-primary/25 rounded-lg px-2.5 py-1 text-muted-foreground transition-all cursor-pointer"
                        >
                          {col.domain}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="w-full rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:opacity-95 shadow-md shadow-primary/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Check Domain Eligibility <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </form>
              )}

              {verificationStep === "otp" && (
                <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                  <div className="bg-primary/5 rounded-xl border border-primary/20 p-3 flex items-start gap-2.5">
                    <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <h4 className="text-[10px] font-black text-foreground">Domain Detected!</h4>
                      <p className="text-[9px] text-muted-foreground font-semibold">
                        Matched with <strong className="text-foreground">{detectedCollege?.name}</strong>.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-muted-foreground">Enter Verification Code (OTP)</label>
                    <input 
                      type="text"
                      placeholder="Enter 1234"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      className="w-full text-center text-sm font-black tracking-widest bg-background border border-border/80 rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    {otpError && (
                      <p className="text-[9px] text-rose-500 font-bold flex items-center gap-1">
                        <XCircle className="h-3 w-3" /> Please enter the mock code &quot;1234&quot;.
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setVerificationStep("input")}
                      className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:opacity-95 shadow-md shadow-primary/10 transition-all cursor-pointer"
                    >
                      Verify OTP 🔑
                    </button>
                  </div>
                </form>
              )}

              {verificationStep === "verified" && (
                <div className="text-center py-4 space-y-4 animate-fade-in">
                  <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                    <Check className="h-6 w-6 stroke-[3]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-foreground">Campus Whitelist Verified!</h4>
                    <p className="text-xs text-muted-foreground font-semibold max-w-sm mx-auto">
                      Domain <span className="text-primary font-bold">{detectedCollege?.domain}</span> is verified. You have been successfully assigned to the loop:
                    </p>
                  </div>
                  
                  {/* Verified Institution Badge */}
                  <div className="max-w-xs mx-auto border border-border/60 bg-background/50 rounded-2xl p-4 flex items-center gap-3.5 shadow-sm text-left">
                    <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center font-black text-sm">
                      {detectedCollege?.name.substring(0, 3)}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-black text-foreground">{detectedCollege?.name}</span>
                        <ShieldCheck className="h-3.5 w-3.5 text-blue-500 fill-current" />
                      </div>
                      <span className="text-[9px] text-muted-foreground font-bold">{detectedCollege?.city}, {detectedCollege?.state}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => { setVerificationStep("input"); setEmailInput(""); }}
                    className="text-[10px] text-primary hover:underline font-bold"
                  >
                    Test another email address
                  </button>
                </div>
              )}

              {verificationStep === "unlisted" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-rose-500/5 rounded-xl border border-rose-500/20 p-3 flex items-start gap-2.5">
                    <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <h4 className="text-[10px] font-black text-rose-500">Domain Not Whitelisted</h4>
                      <p className="text-[9px] text-muted-foreground font-semibold">
                        The domain <strong className="text-foreground">@{whitelistRequest.domain}</strong> is not listed. CampusLoop only permits verified institutional emails to prevent outside spammers and trolls.
                      </p>
                    </div>
                  </div>

                  {whitelistRequest.submitted ? (
                    <div className="text-center py-2.5 bg-emerald-500/5 rounded-xl border border-emerald-500/20 space-y-1">
                      <Check className="h-5 w-5 text-emerald-500 mx-auto" />
                      <h4 className="text-[10px] font-black text-foreground">Request Submitted!</h4>
                      <p className="text-[9px] text-muted-foreground">We will audit this college domain whitelist within 24 hours.</p>
                      <button 
                        onClick={() => setVerificationStep("input")}
                        className="text-[9px] text-primary font-bold hover:underline mt-1 block w-full"
                      >
                        Try another domain
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <h4 className="text-xs font-black">Request Whitelist Addition</h4>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black uppercase text-muted-foreground">College / University Name</label>
                        <input 
                          type="text"
                          placeholder="e.g. IIT Kharagpur"
                          value={whitelistRequest.name}
                          onChange={(e) => setWhitelistRequest(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full text-xs font-bold bg-background border border-border/80 rounded-xl px-3 py-2 focus:outline-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button 
                          type="button" 
                          onClick={() => setVerificationStep("input")}
                          className="flex-1 rounded-xl border border-border bg-background py-2 text-xs font-bold text-muted-foreground hover:bg-muted cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setWhitelistRequest(prev => ({ ...prev, submitted: true }))}
                          disabled={!whitelistRequest.name.trim()}
                          className="flex-1 rounded-xl bg-primary py-2 text-xs font-bold text-white hover:opacity-95 disabled:opacity-50 cursor-pointer"
                        >
                          Submit Request ✉️
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Whitelist Directory */}
            <div className="md:col-span-5 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-foreground">Active College Whitelists</h3>
              <div className="border border-border/40 rounded-2xl bg-muted/10 divide-y divide-border/40 overflow-hidden">
                {whitelistedColleges.map((col) => (
                  <div key={col.domain} className="p-3.5 flex items-center justify-between text-xs hover:bg-muted/30 transition-colors">
                    <div className="space-y-0.5 pr-2">
                      <span className="font-extrabold text-foreground block truncate max-w-[190px]">{col.name}</span>
                      <span className="text-[9px] text-muted-foreground font-bold">{col.city}, {col.state}</span>
                    </div>
                    <span className="text-[10px] font-mono bg-border/60 text-muted-foreground px-2 py-0.5 rounded-md font-bold">
                      @{col.domain}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Artifact 2: Safety & Moderation Firewall simulator ─── */}
        <section id="safety-shield" className="rounded-[32px] border border-border/40 bg-card p-6 sm:p-8 space-y-6 hover:border-primary/25 transition-all shadow-sm">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Real-Time <span className="text-rose-500">Safety & Moderation Firewall</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-2xl leading-relaxed">
                CampusLoop ensures public anonymity while preserving backend accountability. Test our live firewall. Type a mock post or confession to simulate real-time doxxing, harassment, and spam moderation.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-12 gap-8 pt-2">
            {/* Input & Presets */}
            <div className="md:col-span-7 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Draft Post / Confession</label>
                <textarea 
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="Type a mock post (e.g. try adding a phone number or a full student name with their department)..."
                  className="w-full h-32 text-xs font-semibold bg-background border border-border/80 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-bold text-muted-foreground">Or select a mock preset template:</span>
                <div className="grid grid-cols-2 gap-2">
                  {safetyPresets.map((preset) => (
                    <button
                      key={preset.title}
                      onClick={() => setPostText(preset.text)}
                      className="text-left text-[10px] font-extrabold border border-border/60 bg-muted/20 hover:border-rose-500/20 hover:bg-muted/40 p-2.5 rounded-xl transition-all cursor-pointer space-y-1.5"
                    >
                      <span className="text-[9px] text-primary block">{preset.title}</span>
                      <p className="text-muted-foreground font-medium leading-relaxed truncate">{preset.text}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Firewall Analysis */}
            <div className="md:col-span-5 bg-muted/20 border border-border/40 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-foreground">Firewall Analysis Output</h3>
                
                {/* Risk Gauge */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-black uppercase">
                    <span className="text-muted-foreground">Safety Risk Score</span>
                    <span className={riskScore > 40 ? "text-rose-500" : "text-emerald-500"}>{riskScore}%</span>
                  </div>
                  <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        riskScore > 70 
                          ? "bg-rose-600" 
                          : riskScore > 30 
                          ? "bg-amber-500" 
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${riskScore}%` }}
                    />
                  </div>
                </div>

                {/* Vault Hash (Accountability) */}
                <div className="bg-background rounded-xl p-3 border border-border/40 flex justify-between items-center text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-muted-foreground font-bold block">Anonymity Vault Token</span>
                    <span className="font-mono font-bold text-foreground">{anonymityHash}</span>
                  </div>
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <Lock className="h-4 w-4" />
                  </div>
                </div>

                {/* Firewall Status Logs */}
                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-muted-foreground block">System Logs</span>
                  {safetyTriggers.length > 0 ? (
                    <div className="space-y-1.5">
                      {safetyTriggers.map((trig, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-[10px] text-rose-500 font-extrabold leading-normal">
                          <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          <span>{trig}</span>
                        </div>
                      ))}
                      <div className="p-2.5 bg-rose-500/5 rounded-xl border border-rose-500/20 text-[9px] text-rose-500/90 font-medium">
                        <strong>Firewall Blocked:</strong> This confession cannot be posted anonymously. Please remove targeted details or private contact info.
                      </div>
                    </div>
                  ) : postText.trim() ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-extrabold">
                        <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>All safety shields passed. Clear for publishing!</span>
                      </div>
                      <div className="p-2.5 bg-emerald-500/5 rounded-xl border border-emerald-500/20 text-[9px] text-emerald-500/90 font-medium">
                        <strong>Encrypted Hash Generated:</strong> Ready to publish to IIT Delhi loop. Author ID remains privately hashed in database vault.
                      </div>
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground font-semibold italic">Waiting for text draft...</p>
                  )}
                </div>
              </div>

              <div className="border-t border-border/80 pt-3 text-[10px] text-muted-foreground font-semibold flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-primary" />
                <span>Verified identity at signup, private vault for safety.</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FAQs ─── */}
        <section className="space-y-6">
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Frequently Asked <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">Questions</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Everything you need to know about privacy, security, and moderation on CampusLoop.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="border border-border/40 rounded-2xl bg-card overflow-hidden hover:border-primary/20 transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left p-5 text-sm font-extrabold text-foreground focus:outline-none cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown 
                    className={`h-4 w-4 text-muted-foreground transition-transform duration-300 shrink-0 ml-4 ${
                      openFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/40 bg-muted/10 font-semibold">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ─── Go-To-Market / Roadmap Timeline ─── */}
        <section className="rounded-[32px] border border-border/40 bg-card p-6 sm:p-8 space-y-8 shadow-sm">
          <div className="text-center space-y-1.5">
            <span className="inline-block text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
              Project Roadmap
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Launch & Expansion Schedule
            </h2>
            <p className="text-xs text-muted-foreground font-medium max-w-xl mx-auto">
              Follow our progress as we scale CampusLoop from university clusters in Ranchi to campuses across India.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 pt-2">
            <div className="space-y-2 border-l-2 border-primary/20 pl-4 relative">
              <div className="absolute h-3 w-3 rounded-full bg-primary/20 -left-[7px] top-1 border border-primary" />
              <span className="text-[10px] font-bold text-primary">Phase 0 (Completed)</span>
              <h4 className="text-xs font-black">Demand Validation</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
                Gathered waitlist and whitelist requests from over 10 flagship Indian college domains.
              </p>
            </div>
            <div className="space-y-2 border-l-2 border-primary pl-4 relative">
              <div className="absolute h-3 w-3 rounded-full bg-primary -left-[7px] top-1 animate-pulse" />
              <span className="text-[10px] font-bold text-primary">Phase 1 (In Progress)</span>
              <h4 className="text-xs font-black">MVP & Pilot Launch</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
                Authentication, feeds, polls, confessions, and real-time safety firewalls.
              </p>
            </div>
            <div className="space-y-2 border-l-2 border-border pl-4 relative">
              <div className="absolute h-3 w-3 rounded-full bg-border -left-[7px] top-1" />
              <span className="text-[10px] font-bold text-muted-foreground">Phase 2 (Q3 2026)</span>
              <h4 className="text-xs font-black">Stories & Groups</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
                Ephemeral campus stories, global cross-campus communities, and student ambassador logs.
              </p>
            </div>
            <div className="space-y-2 border-l-2 border-border pl-4 relative">
              <div className="absolute h-3 w-3 rounded-full bg-border -left-[7px] top-1" />
              <span className="text-[10px] font-bold text-muted-foreground">Phase 3 (Q4 2026)</span>
              <h4 className="text-xs font-black">Match Mode</h4>
              <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
                Opt-in, age-verified peer matching for dating, study buddies, and cofounders.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <footer className="w-full max-w-5xl mx-auto px-6 mt-16 pt-8 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-semibold">
        <div className="flex items-center gap-2">
          <span>&copy; 2026 CampusLoop. Speak freely. Stay safe.</span>
        </div>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="/safety" className="hover:text-primary transition-colors">Safety Center</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">Contact Support</Link>
        </div>
      </footer>
    </div>
  );
}
