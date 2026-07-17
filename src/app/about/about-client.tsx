"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Search, Calendar, ShieldCheck, Heart, Users, Sparkles, MapPin } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const WHITELISTED_DOMAINS = [
  "iitb.ac.in", "iitd.ac.in", "bitmesra.ac.in", "bitspilani.ac.in", 
  "nitt.edu", "du.ac.in", "srmist.edu.in", "vit.ac.in", "iitkgp.ac.in", "rvce.edu.in"
];

const MILESTONES = [
  {
    title: "Phase 1: Launch & Verify",
    subtitle: "Verification & Safety Layer Setup",
    desc: "Deploy the worker-level regex doxx filters, establish institutional domain whitelists, and launch secure local feeds at primary universities."
  },
  {
    title: "Phase 2: Swipes & Vibe Loop",
    subtitle: "Gamification & Dating Integration",
    desc: "Introduce Loop Points (LP), dynamic Vibe rankings (Campus Legend, Talker, etc.), private matching decks, and full-screen story canvas creators."
  },
  {
    title: "Phase 3: Hyper-Local Circles",
    subtitle: "Communities & Game Rooms",
    desc: "Spin up student-moderated interest groups, local coding circles, hobby clubs, and regional student discount micro-portals."
  }
];

export function AboutClient() {
  const [emailInput, setEmailInput] = useState("");
  const [validationResult, setValidationResult] = useState<{ checked: boolean; valid: boolean; collegeName?: string } | null>(null);
  const [activeMilestone, setActiveMilestone] = useState(0);

  function handleCheckDomain(e: React.FormEvent) {
    e.preventDefault();
    if (!emailInput.trim()) return;

    const parts = emailInput.trim().split("@");
    if (parts.length < 2) {
      setValidationResult({ checked: true, valid: false });
      return;
    }

    const domain = parts[1].toLowerCase();
    if (WHITELISTED_DOMAINS.includes(domain)) {
      // Map domain to mock college names
      const collegeNames: Record<string, string> = {
        "iitb.ac.in": "IIT Bombay",
        "iitd.ac.in": "IIT Delhi",
        "bitmesra.ac.in": "BIT Mesra",
        "bitspilani.ac.in": "BITS Pilani",
        "nitt.edu": "NIT Trichy",
        "du.ac.in": "Delhi University",
        "srmist.edu.in": "SRM Chennai",
        "vit.ac.in": "VIT Vellore",
        "iitkgp.ac.in": "IIT Kharagpur",
        "rvce.edu.in": "RV College"
      };

      setValidationResult({ 
        checked: true, 
        valid: true, 
        collegeName: collegeNames[domain] || "Verified Partner College"
      });
    } else {
      setValidationResult({ checked: true, valid: false });
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground bg-grid-pattern relative overflow-x-hidden pb-16">
      {/* Glow blur backgrounds */}
      <div className="absolute top-[-10%] left-[5%] right-[5%] h-[400px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 right-0 left-0 z-50 flex h-16 items-center justify-between border-b border-border/80 bg-background/70 px-6 backdrop-blur-md">
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
              Join CampusLoop
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-2xl px-6 pt-28 mx-auto space-y-12">
        <div className="space-y-3">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            The Story of <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">CampusLoop</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-semibold">
            CampusLoop is built by verified students, for verified students. We are crafting the unified social layer of college life — bringing together confessions, matches, local groups, and peer support into a safe, gamified network.
          </p>
        </div>

        {/* --- Section 1: Domain Check Sandbox --- */}
        <section className="glass-card rounded-2xl p-6 space-y-4 shadow-md">
          <div className="space-y-1">
            <h2 className="text-sm font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> Domain Eligibility Verification
            </h2>
            <p className="text-[11px] text-muted-foreground font-semibold">
              Enter your college email address to verify if your campus domain is currently whitelisted.
            </p>
          </div>

          <form onSubmit={handleCheckDomain} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="you@iitd.ac.in, student@bitmesra.ac.in..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full rounded-xl border border-border bg-background pl-9 pr-4 py-2 text-xs font-semibold focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-primary text-white text-xs font-bold px-4 hover:opacity-90 transition-opacity cursor-pointer shrink-0"
            >
              Verify
            </button>
          </form>

          {validationResult && (
            <div className="animate-in fade-in slide-in-from-top-1">
              {validationResult.valid ? (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="text-xs font-semibold">
                    <p className="text-emerald-500">Domain Whitelisted!</p>
                    <p className="text-muted-foreground text-[10px] mt-0.5">Students from <span className="text-foreground font-bold">{validationResult.collegeName}</span> are eligible to join immediately.</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                  <div className="text-xs font-semibold">
                    <p className="text-rose-500">Domain Not Whitelisted Yet</p>
                    <p className="text-muted-foreground text-[10px] mt-0.5">This campus domain isn't in our active verification tables. Ask your campus representative to submit domain whitelisting requests!</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* --- Section 2: Core Philosophy --- */}
        <section className="space-y-6">
          <h2 className="text-base font-bold text-foreground">Our Core Principles</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="glass-card-dark rounded-2xl p-5 border border-border/40 space-y-2">
              <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <Heart className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-xs font-extrabold text-foreground">Zero Anonymity Mapping</h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
                Your email is strictly used for one-time verification. Anonymous posts are separated using zero-knowledge mapping hashes, ensuring full safety.
              </p>
            </div>

            <div className="glass-card-dark rounded-2xl p-5 border border-border/40 space-y-2">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Users className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-xs font-extrabold text-foreground">Outsiders Restrained</h3>
              <p className="text-[10px] text-muted-foreground leading-relaxed font-semibold">
                By enforcing a strict domain firewall, we keep out recruiters, spammers, parents, and administrative investigators.
              </p>
            </div>
          </div>
        </section>

        {/* --- Section 3: Interactive Roadmap Tab Panel --- */}
        <section className="glass-card rounded-2xl p-6 space-y-6 shadow-md">
          <div className="space-y-1">
            <h2 className="text-sm font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-violet-500" /> Platform Roadmap
            </h2>
            <p className="text-[11px] text-muted-foreground font-semibold">
              Explore our project phases and milestones directly below.
            </p>
          </div>

          <div className="flex gap-2 border-b border-border/40 pb-2 text-[10px] font-bold">
            {MILESTONES.map((ms, idx) => (
              <button
                key={idx}
                onClick={() => setActiveMilestone(idx)}
                className={`pb-2 px-3 border-b-2 transition-all cursor-pointer ${
                  activeMilestone === idx 
                    ? "border-primary text-foreground font-extrabold" 
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Phase {idx + 1}
              </button>
            ))}
          </div>

          <div className="space-y-2.5 animate-in fade-in duration-300">
            <h3 className="text-xs font-black text-foreground">{MILESTONES[activeMilestone].title}</h3>
            <p className="text-[10px] font-bold text-primary uppercase">{MILESTONES[activeMilestone].subtitle}</p>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              {MILESTONES[activeMilestone].desc}
            </p>
          </div>
        </section>

        {/* Footer info */}
        <div className="text-center pt-4">
          <p className="text-[10px] text-muted-foreground font-semibold flex items-center justify-center gap-1">
            Made with <Heart className="h-3.5 w-3.5 text-primary fill-primary animate-pulse" /> by verified students for the student network.
          </p>
        </div>
      </main>
    </div>
  );
}
