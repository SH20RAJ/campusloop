"use client";

import { Heart, MessageCircle, Repeat2, ShoppingBag, Sparkles, Users } from "lucide-react";
import { useState } from "react";
import { Reveal } from "@/components/landing/reveal";
import { haptics } from "@/lib/haptics";
import { sounds } from "@/lib/sounds";
import { cn } from "@/lib/utils";

const PILLARS = [
  {
    id: "social",
    label: "Campus Social",
    icon: Repeat2,
    heading: "Confessions, Polls, and Campus Pulse",
    summary:
      "Share candid confessions safely, settle late-night mess debates with live polls, and vote on trending student issues.",
    tags: ["#anonymous-confession", "#canteen-debates", "#midsem-memes"],
    preview: {
      type: "feed",
      author: "Hostel 3 Anonymous",
      time: "25m ago",
      badge: "Confession",
      badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      content:
        "Petition to turn the library 3rd floor into a 24/7 silent study lounge with bean bags during endsem week. Who is signing this with me?",
      votes: "142 agree",
      comments: "38 replies",
    },
  },
  {
    id: "people",
    label: "Match & Classmates",
    icon: Heart,
    heading: "Find Study Partners, Co-founders & Friends",
    summary:
      "Not just dating. Connect with verified students on campus looking for hackathon teammates, gym buddies, or fellow indie rock fans.",
    tags: ["Study Partners", "Hackathon Teammates", "18+ Opt-in"],
    preview: {
      type: "match",
      name: "Aman K.",
      meta: "BIT Mesra · CSE '26",
      bio: "Building an agentic compiler for our final year project. Looking for a study partner for Distributed Systems & weekend badminton 🏸",
      interests: ["System Design", "Badminton", "Rust"],
      compatibility: "94% shared campus interests",
    },
  },
  {
    id: "utility",
    label: "Campus Utility",
    icon: ShoppingBag,
    heading: "Buy & Sell, Notes & Lost & Found",
    summary:
      "A trusted marketplace exclusively for students. Buy second-hand coolers and cycles in ₹, find lost student IDs, and share semester PYQ notes.",
    tags: ["Cycles & Drafters", "Semester PYQs", "Lost IDs"],
    preview: {
      type: "market",
      item: "Hero Octane 21-Speed Mountain Bike",
      price: "₹2,800",
      seller: "Verified Senior (Hostel 12)",
      desc: "Fully tuned gears, dual mudguards, bottle holder included. Perfect for cycling to IC ground classes.",
      badge: "Verified Student Seller",
    },
  },
  {
    id: "communities",
    label: "Communities & Clubs",
    icon: Users,
    heading: "Student-Led Clubs & Hostel Circles",
    summary:
      "Join official campus societies, coding clubs, gaming guilds, or create private discussion groups for your hostel floor.",
    tags: ["Robotics Club", "EDC E-Cell", "Hostel 10 Common Room"],
    preview: {
      type: "community",
      title: "Google Developer Student Club (GDSC)",
      members: "310 verified students",
      pinned: "Hackathon orientation meetups this Friday at 6 PM in CAT Hall.",
      recent: "Shared starter repo for AI hackathon track 🚀",
    },
  },
  {
    id: "messaging",
    label: "Direct Chat",
    icon: MessageCircle,
    heading: "Private Conversations With Verified Peers",
    summary:
      "Continue conversations off the public feed. Message classmates securely without sharing phone numbers or personal WhatsApp accounts.",
    tags: ["End-to-End Privacy", "No Phone Required", "Verified Identities"],
    preview: {
      type: "chat",
      contact: "Rohan S. (Verified Classmate)",
      msg1: "Hey! Do you have the Unit 3 Compiler Design lecture slides?",
      msg2: "Yes, just uploaded them to the Campus Notes vault. Check the link!",
    },
  },
];

export function ProductShowcaseSection() {
  const [activeId, setActiveId] = useState("social");
  const activePillar = PILLARS.find((p) => p.id === activeId) || PILLARS[0];

  function handleSelect(id: string) {
    sounds.tap();
    haptics.light();
    setActiveId(id);
  }

  return (
    <section className="border-t border-border/60 bg-background py-24 px-4 sm:px-6">
      <div className="mx-auto w-full max-w-6xl space-y-14">
        {/* Section Heading */}
        <Reveal className="max-w-2xl space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Modular Campus Architecture
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
            Everything your campus already does.
            <br />
            <span className="text-primary">Now in one loop.</span>
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            One verified student identity unlocks every aspect of university life — social expression, meeting
            people, academic sharing, and campus trade.
          </p>
        </Reveal>

        {/* Interactive Tab Switcher */}
        <Reveal delay={0.05}>
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-muted/60 border border-border/60 max-w-3xl">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              const isSelected = p.id === activeId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelect(p.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none",
                    isSelected
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="size-4" />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* Selected Pillar Content & Visual Showcase */}
        <Reveal delay={0.1}>
          <div className="grid items-center gap-10 lg:grid-cols-12 rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-md">
            {/* Left Pillar Description */}
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="size-3.5" />
                <span>{activePillar.label}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-foreground">{activePillar.heading}</h3>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {activePillar.summary}
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {activePillar.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-muted/80 text-foreground/80 border border-border/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Product UI Card Preview */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-border bg-muted/30 p-5 sm:p-6 space-y-4 shadow-inner">
                {activePillar.preview.type === "feed" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground">{activePillar.preview.author}</span>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                          activePillar.preview.badgeColor
                        )}
                      >
                        {activePillar.preview.badge}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                      &quot;{activePillar.preview.content}&quot;
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
                      <span>{activePillar.preview.votes}</span>
                      <span>{activePillar.preview.comments}</span>
                    </div>
                  </div>
                )}

                {activePillar.preview.type === "match" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{activePillar.preview.name}</h4>
                        <span className="text-xs text-muted-foreground">{activePillar.preview.meta}</span>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Classmate Match
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                      {activePillar.preview.bio}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {activePillar.preview.interests?.map((item) => (
                        <span
                          key={item}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-foreground"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                    <div className="text-[11px] font-mono text-emerald-500 font-semibold pt-1">
                      ✓ {activePillar.preview.compatibility}
                    </div>
                  </div>
                )}

                {activePillar.preview.type === "market" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        {activePillar.preview.badge}
                      </span>
                      <span className="font-mono text-base font-black text-foreground">
                        {activePillar.preview.price}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-foreground">{activePillar.preview.item}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {activePillar.preview.desc}
                    </p>
                    <div className="text-[11px] font-mono text-muted-foreground pt-1">
                      Seller: {activePillar.preview.seller}
                    </div>
                  </div>
                )}

                {activePillar.preview.type === "communities" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-foreground">{activePillar.preview.title}</h4>
                      <span className="text-xs text-primary font-mono">{activePillar.preview.members}</span>
                    </div>
                    <div className="rounded-xl bg-background/80 p-3 border border-border/60 text-xs text-foreground/90">
                      📌 <strong className="text-foreground">Pinned:</strong> {activePillar.preview.pinned}
                    </div>
                    <p className="text-xs text-muted-foreground">{activePillar.preview.recent}</p>
                  </div>
                )}

                {activePillar.preview.type === "chat" && (
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-foreground border-b border-border/40 pb-2">
                      {activePillar.preview.contact}
                    </div>
                    <div className="space-y-2">
                      <div className="max-w-[85%] rounded-2xl bg-muted p-2.5 text-xs text-foreground">
                        {activePillar.preview.msg1}
                      </div>
                      <div className="ml-auto max-w-[85%] rounded-2xl bg-primary text-primary-foreground p-2.5 text-xs font-medium">
                        {activePillar.preview.msg2}
                      </div>
                    </div>
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
