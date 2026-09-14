"use client";

import { BadgeCheck, BookOpen, Lock, ShoppingBag } from "lucide-react";
import { FeatureHighlights } from "@/components/ruixen/feature-highlights";

export function CleanFeatures() {
  const features = [
    {
      title: "Strict Institutional Email Verification",
      description:
        "Access is gated strictly by your college's official .ac.in or .edu.in domain. Spammers, outsiders, and coaching coaching bots are 100% blocked from viewing or participating.",
      image: (
        <div className="flex h-full w-full flex-col justify-center items-center p-8 bg-card border border-border/40 rounded-2xl text-center space-y-4">
          <div className="size-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-xs">
            <BadgeCheck className="size-8" />
          </div>
          <div>
            <h4 className="font-bold text-base text-foreground">Verified Student Circle</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              Every profile belongs to an active, enrolled student from your specific university.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-mono text-foreground border border-border/40">
            <span>student@college.ac.in</span>
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      ),
    },
    {
      title: "Dual Identity: Real Name & Anonymous Escrow",
      description:
        "Post achievements under your real student profile, or switch to Anonymous Mode to discuss hostel issues, exam stress, and honest feedback without fear of administration backlash.",
      image: (
        <div className="flex h-full w-full flex-col justify-center items-center p-8 bg-card border border-border/40 rounded-2xl text-center space-y-4">
          <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-xs">
            <Lock className="size-8" />
          </div>
          <div>
            <h4 className="font-bold text-base text-foreground">Cryptographic Escrow</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              Anonymous posts store zero foreign-key references to your student account in query layers.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-muted p-1 border border-border/40">
            <span className="rounded-lg px-3 py-1 text-xs font-medium text-muted-foreground">
              Real Name
            </span>
            <span className="rounded-lg bg-card px-3 py-1 text-xs font-bold text-foreground shadow-xs">
              🎭 Anonymous Mode
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Academics & Semester PYQ Vault",
      description:
        "No more hunting through chaotic WhatsApp groups at midnight. Access peer-curated lecture notes, solved past year questions, lab manuals, and syllabus roadmaps shared by seniors.",
      image: (
        <div className="flex h-full w-full flex-col justify-center items-center p-8 bg-card border border-border/40 rounded-2xl text-center space-y-4">
          <div className="size-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-xs">
            <BookOpen className="size-8" />
          </div>
          <div>
            <h4 className="font-bold text-base text-foreground">Semester Study Vault</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              Crowd-curated study material indexed by branch, semester, and course code.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full max-w-xs text-left">
            <div className="p-2 rounded-lg bg-muted/60 border border-border/40 text-xs">
              <span className="font-bold text-foreground block">Solved PYQs</span>
              <span className="text-[10px] text-muted-foreground">2019-2024</span>
            </div>
            <div className="p-2 rounded-lg bg-muted/60 border border-border/40 text-xs">
              <span className="font-bold text-foreground block">Lecture Notes</span>
              <span className="text-[10px] text-muted-foreground">Topper Curated</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Hostel Marketplace & Campus Trade",
      description:
        "Buy, sell, or rent dorm gear, bicycles, coolers, textbooks, and engineering drafters directly from fellow hostelers. Avoid campus resale scams with verified student handles.",
      image: (
        <div className="flex h-full w-full flex-col justify-center items-center p-8 bg-card border border-border/40 rounded-2xl text-center space-y-4">
          <div className="size-16 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-xs">
            <ShoppingBag className="size-8" />
          </div>
          <div>
            <h4 className="font-bold text-base text-foreground">Hostel Peer Economy</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              Trade dorm essentials locally inside campus with zero platform cuts.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs bg-muted/60 px-3 py-1.5 rounded-lg border border-border/40 font-medium">
            <span>Hero Gear Cycle</span>
            <span className="text-primary font-bold">₹2,400</span>
            <span className="text-[10px] text-emerald-600 font-semibold">Hostel 3</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="py-20 border-t border-border/40 bg-background">
      <FeatureHighlights
        title="Everything college students need. Without the noise."
        features={features}
        autoPlayInterval={6}
      />
    </section>
  );
}
