"use client";

import {
  ArrowRight,
  BadgeCheck,
  Check,
  Eye,
  MessageCircle,
  Pin,
  Repeat2,
  Send,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { Reveal } from "@/components/landing/reveal";
import {
  AnimateHeart,
  AnimateMessageCircle,
  AnimateRepeat2,
  AnimateShoppingBag,
  AnimateUsers,
} from "@/components/ui/animated-icon";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

type PillarId = "social" | "people" | "utility" | "communities" | "messaging";

interface Pillar {
  id: PillarId;
  label: string;
  IconComponent: React.ComponentType<{ className?: string }>;
  tagline: string;
  heading: string;
  summary: string;
  specs: { label: string; value: string }[];
  invariants: string[];
}

const PILLARS: Pillar[] = [
  {
    id: "social",
    label: "Campus Social",
    IconComponent: AnimateRepeat2,
    tagline: "TIMELINE // CONFESSIONS & POLLS",
    heading: "Accountable Anonymity. Real Campus Pulse.",
    summary:
      "Share candid confessions safely behind one-way pseudonyms, settle late-night hostel debates with verified student polls, and vote on trending campus issues.",
    specs: [
      { label: "Scope", value: "Campus-Isolated" },
      { label: "Anonymity", value: "AES-Vault Sealed" },
      { label: "Verification", value: "College Email Required" },
    ],
    invariants: [
      "Zero author foreign-key joins in anonymous mode",
      "One verified student = one ungameable poll vote",
      "Campus radius default with zero cross-college noise",
    ],
  },
  {
    id: "people",
    label: "Match & Classmates",
    IconComponent: AnimateHeart,
    tagline: "CONNECTION // VERIFIED STUDENTS",
    heading: "Find Study Partners, Co-founders & Crushes.",
    summary:
      "Connect with fellow students for hackathons, gym sessions, or dating. Every profile is tied to an active institutional email — zero catfishing, zero outsiders.",
    specs: [
      { label: "Pool", value: "100% Verified Students" },
      { label: "Privacy", value: "Mutual-Match Unlock" },
      { label: "Crush Escrow", value: "5 Zero-Doxxing Slots" },
    ],
    invariants: [
      "No cold unsolicited messaging without mutual opt-in",
      "Secret crush vault reveals only on bidirectional declaration",
      "Filter by batch, branch, campus radius, or all India",
    ],
  },
  {
    id: "utility",
    label: "Campus Utility",
    IconComponent: AnimateShoppingBag,
    tagline: "EXCHANGE // NOTES & MARKETPLACE",
    heading: "Peer Marketplace, Solved PYQs & Lost Items.",
    summary:
      "Buy and sell second-hand mountain bikes, drafters, and coolers in ₹. Download senior-verified semester notes and report lost student IDs.",
    specs: [
      { label: "Trading", value: "Hostel Peer-to-Peer" },
      { label: "Currency", value: "Direct Student INR" },
      { label: "Academics", value: "Verified Senior Notes" },
    ],
    invariants: [
      "Every buyer and seller verified via university email",
      "Pickups coordinated at known campus landmarks",
      "Academic notes searchable by subject, branch, and semester",
    ],
  },
  {
    id: "communities",
    label: "Communities & Clubs",
    IconComponent: AnimateUsers,
    tagline: "ORGANIZATION // SUB-HUBS & SOCIETIES",
    heading: "Student Clubs & Hostel Circles with Dedicated Feeds.",
    summary:
      "Stop drowning in 40 unread WhatsApp groups. Student societies, robotics clubs, and hostel wings get structured feeds, event RSVPs, and member roles.",
    specs: [
      { label: "Structure", value: "Isolated Sub-Hubs" },
      { label: "Roles", value: "Leads, Core & Members" },
      { label: "Events", value: "Live RSVP Calendar" },
    ],
    invariants: [
      "Dedicated announcement feeds that never get buried",
      "Join controls configured by student admins",
      "Discoverable directory across your campus and beyond",
    ],
  },
  {
    id: "messaging",
    label: "Direct Chat",
    IconComponent: AnimateMessageCircle,
    tagline: "COMMUNICATION // SECURE MESSAGING",
    heading: "Private P2P Conversations. Zero Phone Numbers.",
    summary:
      "Message batchmates and project partners securely without sharing personal WhatsApp numbers. Fast, private, and gated by institutional enrollment.",
    specs: [
      { label: "Identity", value: "Campus Handle" },
      { label: "Privacy", value: "No Phone Exposure" },
      { label: "Calling", value: "WebRTC Peer-to-Peer" },
    ],
    invariants: [
      "Keep personal numbers safe from strangers and seniors",
      "One-tap block and report controls on every thread",
      "Media plane runs P2P between student browsers",
    ],
  },
];

export function ProductShowcaseSection() {
  const [activeId, setActiveId] = useState<PillarId>("social");
  const activePillar = PILLARS.find((p) => p.id === activeId) || PILLARS[0];

  // Interactive Micro-artifact states
  const [socialLiked, setSocialLiked] = useState(false);
  const [socialLikes, setSocialLikes] = useState(48);
  const [socialReposted, setSocialReposted] = useState(false);
  const [socialReposts, setSocialReposts] = useState(12);
  const [socialVoted, setSocialVoted] = useState(false);
  const [socialAgreeVotes, setSocialAgreeVotes] = useState(142);

  const [connectedState, setConnectedState] = useState(false);
  const [rsvpState, setRsvpState] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { from: "peer", text: "Hey! Do you have the Unit 3 Compiler Design lecture slides?" },
    { from: "me", text: "Yes, just uploaded them to the Campus Notes vault. Check the link!" },
  ]);

  function handleSelect(id: PillarId) {
    sounds.tap();
    haptics.light();
    setActiveId(id);
  }

  function handleLike() {
    sounds.pop();
    haptics.light();
    if (socialLiked) {
      setSocialLiked(false);
      setSocialLikes((n) => n - 1);
    } else {
      setSocialLiked(true);
      setSocialLikes((n) => n + 1);
    }
  }

  function handleRepost() {
    sounds.pop();
    haptics.light();
    if (socialReposted) {
      setSocialReposted(false);
      setSocialReposts((n) => n - 1);
    } else {
      setSocialReposted(true);
      setSocialReposts((n) => n + 1);
    }
  }

  function handleAgreeVote() {
    if (socialVoted) return;
    sounds.pop();
    haptics.light();
    setSocialVoted(true);
    setSocialAgreeVotes((n) => n + 1);
  }

  function handleConnect() {
    sounds.pop();
    haptics.medium();
    setConnectedState((prev) => !prev);
  }

  function handleRsvp() {
    sounds.pop();
    haptics.light();
    setRsvpState((prev) => !prev);
  }

  function handleSendChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sounds.send();
    haptics.light();
    setChatMessages((prev) => [...prev, { from: "me", text: chatInput.trim() }]);
    setChatInput("");
  }

  return (
    <section className="border-t border-border/40 bg-background py-20 sm:py-28 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-6xl space-y-12">
        {/* Section Header (Twitter/Grok Minimalist Hierarchy) */}
        <Reveal className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#1D9BF0]">
              {"SYSTEM_ARCHITECTURE // MODULAR CAMPUS ENGINE"}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.12]">
            Everything your campus already does.
            <br />
            <span className="text-muted-foreground font-semibold">Verified in one timeline.</span>
          </h2>
          <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">
            One verified student identity unlocks every layer of university life — social expression,
            classmate discovery, academic sharing, and student trade.
          </p>
        </Reveal>

        {/* Twitter / Grok Flat Tab Navigation */}
        <Reveal delay={0.05}>
          <div className="relative flex items-center gap-1 sm:gap-2 overflow-x-auto border-b border-border/40 pb-px no-scrollbar">
            {PILLARS.map((p) => {
              const Icon = p.IconComponent;
              const isSelected = p.id === activeId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelect(p.id)}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-3.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer select-none shrink-0",
                    isSelected
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-t-lg"
                  )}
                >
                  <Icon className={cn("size-4", isSelected ? "text-[#1D9BF0]" : "text-muted-foreground")} />
                  <span>{p.label}</span>
                  {isSelected && (
                    <motion.div
                      layoutId="showcase-tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-[#1D9BF0]"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Split-Pane Showcase (Grok Spec Left + Timeline Artifact Right) */}
        <Reveal delay={0.1}>
          <div className="grid items-start gap-8 lg:grid-cols-12 rounded-2xl border border-border/40 bg-card p-6 sm:p-8">
            {/* Left Column: Feature Specifications & Architectural Invariants */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="font-mono text-[11px] font-bold tracking-wider text-[#1D9BF0] uppercase">
                  {activePillar.tagline}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                  {activePillar.heading}
                </h3>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  {activePillar.summary}
                </p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                {activePillar.specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="rounded-xl border border-border/40 bg-muted/20 p-3 space-y-1"
                  >
                    <span className="block font-mono text-[10px] font-semibold text-muted-foreground uppercase">
                      {spec.label}
                    </span>
                    <span className="block font-bold text-xs text-foreground truncate">{spec.value}</span>
                  </div>
                ))}
              </div>

              {/* Architectural Invariants */}
              <div className="space-y-2.5 pt-2 border-t border-border/40">
                <span className="font-mono text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Guaranteed System Invariants
                </span>
                <ul className="space-y-2">
                  {activePillar.invariants.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs leading-relaxed text-foreground/90"
                    >
                      <Check className="size-3.5 text-emerald-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2">
                <Link
                  href={`/docs/${
                    activePillar.id === "social"
                      ? "campus-feed"
                      : activePillar.id === "people"
                        ? "campus-match"
                        : activePillar.id === "utility"
                          ? "marketplace"
                          : activePillar.id === "communities"
                            ? "communities"
                            : "verification-safety"
                  }`}
                  className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-[#1D9BF0] hover:underline"
                >
                  <span>Read technical architecture docs</span>
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>

            {/* Right Column: Live Interactive Micro-Artifact */}
            <div className="lg:col-span-6">
              <div className="rounded-xl border border-border/60 bg-background p-5 sm:p-6 shadow-inner space-y-4">
                {/* 1. CAMPUS SOCIAL ARTIFACT */}
                {activePillar.id === "social" && (
                  <div className="space-y-4">
                    {/* Post Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-9 items-center justify-center rounded-full bg-purple-500/15 text-purple-400 font-black text-xs border border-purple-500/30">
                          <ShieldCheck className="size-4 text-purple-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-foreground">Hostel 3 Resident</span>
                            <span className="font-mono text-xs text-muted-foreground">@anon_h3</span>
                            <span className="text-muted-foreground/50">·</span>
                            <span className="font-mono text-xs text-muted-foreground">25m</span>
                          </div>
                          <span className="text-[11px] font-mono text-muted-foreground">
                            🏫 BIT Mesra · Campus Confession
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400">
                        CONFESSION
                      </span>
                    </div>

                    {/* Post Body */}
                    <p className="text-sm leading-relaxed text-foreground font-normal">
                      Petition to turn the library 3rd floor into a 24/7 silent study lounge with bean bags
                      during endsem week. Who is signing this with me?
                    </p>

                    {/* Interactive Poll / Vote Box */}
                    <div className="rounded-xl border border-border/50 bg-muted/20 p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">Student Consensus</span>
                        <span className="font-mono text-muted-foreground">{socialAgreeVotes} votes</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAgreeVote}
                        className={cn(
                          "w-full text-left p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer",
                          socialVoted
                            ? "bg-[#1D9BF0]/10 border-[#1D9BF0]/40 text-foreground"
                            : "bg-background border-border/60 hover:border-[#1D9BF0]/50 text-foreground"
                        )}
                      >
                        <span>Yes, we urgently need this for endsems</span>
                        <span className="font-mono font-bold text-[#1D9BF0]">
                          {socialVoted ? "92%" : "Vote"}
                        </span>
                      </button>
                    </div>

                    {/* Twitter-Standard Interaction Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs text-muted-foreground">
                      <button
                        type="button"
                        className="flex items-center gap-1.5 hover:text-[#1D9BF0] transition-colors cursor-pointer group"
                      >
                        <MessageCircle className="size-4 group-hover:scale-110 transition-transform" />
                        <span className="font-mono text-xs">38</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRepost}
                        className={cn(
                          "flex items-center gap-1.5 transition-colors cursor-pointer group",
                          socialReposted ? "text-emerald-500" : "hover:text-emerald-500"
                        )}
                      >
                        <Repeat2 className="size-4 group-hover:scale-110 transition-transform" />
                        <span className="font-mono text-xs">{socialReposts}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleLike}
                        className={cn(
                          "flex items-center gap-1.5 transition-colors cursor-pointer group",
                          socialLiked ? "text-rose-500" : "hover:text-rose-500"
                        )}
                      >
                        <AnimateHeart className="size-4 group-hover:scale-110 transition-transform" />
                        <span className="font-mono text-xs">{socialLikes}</span>
                      </button>
                      <div className="flex items-center gap-1.5 hover:text-[#1D9BF0] transition-colors cursor-pointer">
                        <Eye className="size-4" />
                        <span className="font-mono text-xs">1.4K</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. MATCH & CLASSMATES ARTIFACT */}
                {activePillar.id === "people" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-11 rounded-full bg-linear-to-tr from-primary to-accent flex items-center justify-center font-bold text-white text-sm shadow-sm">
                          AK
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-foreground">Aman Kumar</span>
                            <BadgeCheck className="size-4 text-[#1D9BF0]" />
                            <span className="font-mono text-xs text-muted-foreground">@aman_cse</span>
                          </div>
                          <span className="text-[11px] font-mono text-muted-foreground">
                            BIT Mesra · CSE &apos;26
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400">
                        CLASSMATE MATCH
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                      Building a distributed compiler for our final year capstone. Looking for a study partner
                      for Distributed Systems &amp; weekend badminton at IC Ground 🏸
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {["System Design", "Rust", "Badminton", "Hackathons"].map((item) => (
                        <span
                          key={item}
                          className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-md bg-muted/60 text-foreground border border-border/40"
                        >
                          {item}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/40">
                      <div className="font-mono text-xs font-semibold text-emerald-500 flex items-center gap-1">
                        <Check className="size-3.5" />
                        <span>94% shared campus interests</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleConnect}
                        className={cn(
                          "px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
                          connectedState
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                            : "bg-[#1D9BF0] text-white hover:bg-[#1D9BF0]/90 shadow-sm"
                        )}
                      >
                        {connectedState ? "Request Sent ✓" : "Connect"}
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. CAMPUS UTILITY ARTIFACT */}
                {activePillar.id === "utility" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <BadgeCheck className="size-3 text-emerald-500" />
                        <span>Verified Student Seller</span>
                      </span>
                      <span className="font-mono text-lg font-black text-foreground">₹2,800</span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-foreground">
                        Hero Octane 21-Speed Mountain Bike
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Dual disc brakes, Shimano gears, front suspension. Handover at Hostel 12 or IC ground.
                        Moving out after 8th semester.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-muted-foreground bg-muted/20 p-2.5 rounded-xl border border-border/40">
                      <div>
                        Seller: <strong className="text-foreground">Siddharth (H12)</strong>
                      </div>
                      <div>
                        Condition: <strong className="text-foreground">Excellent</strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/40">
                      <span className="text-[11px] font-mono text-muted-foreground">
                        Escrow ID: CL-TRD-8821
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          sounds.tap();
                          haptics.light();
                        }}
                        className="px-3.5 py-1.5 rounded-full bg-foreground text-background text-xs font-bold hover:bg-foreground/90 transition-all cursor-pointer"
                      >
                        Chat with Senior
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. COMMUNITIES & CLUBS ARTIFACT */}
                {activePillar.id === "communities" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                          <span>Google Developer Student Club (GDSC)</span>
                          <BadgeCheck className="size-4 text-[#1D9BF0]" />
                        </h4>
                        <span className="font-mono text-xs text-muted-foreground">
                          Official Campus Technical Chapter · BIT Mesra
                        </span>
                      </div>
                      <span className="font-mono text-xs text-[#1D9BF0] font-bold bg-[#1D9BF0]/10 px-2.5 py-1 rounded-full border border-[#1D9BF0]/20">
                        310 Members
                      </span>
                    </div>

                    <div className="rounded-xl bg-muted/30 border border-border/60 p-3 space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-foreground">
                        <Pin className="size-3.5 text-amber-500 rotate-45" />
                        <span>Pinned by Chapter Lead:</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        AI Hackathon orientation meetups this Friday at 6 PM in CAT Hall. Starter repositories
                        dispatched to all verified members!
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                      <span className="font-mono text-muted-foreground">Next Event: Friday 6:00 PM</span>
                      <button
                        type="button"
                        onClick={handleRsvp}
                        className={cn(
                          "px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
                          rsvpState
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                            : "bg-[#1D9BF0] text-white hover:bg-[#1D9BF0]/90 shadow-sm"
                        )}
                      >
                        {rsvpState ? "RSVP Confirmed ✓" : "RSVP to Event"}
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. DIRECT CHAT ARTIFACT */}
                {activePillar.id === "messaging" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-emerald-500" />
                        <span className="font-bold text-xs text-foreground">Rohan S.</span>
                        <span className="text-[11px] font-mono text-muted-foreground">
                          (Verified Classmate)
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground">
                        <Shield className="size-3 text-emerald-500" />
                        <span>E2E Campus Encrypted</span>
                      </div>
                    </div>

                    <div className="space-y-2 min-h-[120px] max-h-[140px] overflow-y-auto no-scrollbar">
                      {chatMessages.map((msg, i) => (
                        <div
                          key={`${msg.from}-${i}`}
                          className={cn(
                            "max-w-[85%] rounded-xl p-2.5 text-xs",
                            msg.from === "me"
                              ? "ml-auto bg-[#1D9BF0] text-white font-medium rounded-br-none"
                              : "bg-muted/60 text-foreground border border-border/40 rounded-bl-none"
                          )}
                        >
                          {msg.text}
                        </div>
                      ))}
                    </div>

                    <form
                      onSubmit={handleSendChat}
                      className="flex items-center gap-2 pt-2 border-t border-border/40"
                    >
                      <input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Reply via verified messenger..."
                        className="flex-1 bg-muted/30 border border-border/50 rounded-full px-3.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-[#1D9BF0]"
                      />
                      <button
                        type="submit"
                        className="size-8 rounded-full bg-[#1D9BF0] text-white flex items-center justify-center shrink-0 hover:bg-[#1D9BF0]/90 transition-colors cursor-pointer"
                      >
                        <Send className="size-3.5" />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
