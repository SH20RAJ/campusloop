"use client";

import { BookOpen, Heart, MessageSquare, Sparkles, Users } from "lucide-react";
import { StructuredHeroSection } from "@/components/ruixen/structured-hero-section";

interface CleanHeroProps {
  isAuthenticated?: boolean;
}

export function CleanHero({ isAuthenticated = false }: CleanHeroProps) {
  const cards = [
    {
      label: "Campus Timeline & Honest Confessions",
      content: (
        <div className="flex flex-col justify-between h-full">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  BM
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    BIT Mesra
                    <span className="text-[10px] font-normal text-muted-foreground">· 14m ago</span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.2 text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    🎭 Verified Anonymous
                  </span>
                </div>
              </div>
            </div>

            <p className="text-sm font-medium leading-relaxed text-foreground/90">
              &quot;Hostel 7 mess committee just agreed to extend the hot paratha counter till 2 AM during End-Sem week! Petition finally worked.&quot;
            </p>
          </div>

          <div className="pt-4 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1 text-rose-500 font-medium">
              <Heart className="size-3.5 fill-rose-500 text-rose-500" /> 142 Agrees
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="size-3.5" /> 28 Replies
            </span>
          </div>
        </div>
      ),
    },
    {
      label: "Academics & Semester PYQs Vault",
      content: (
        <div className="flex flex-col justify-between h-full">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                <BookOpen className="size-3" /> Semester 5 CS
              </span>
              <span className="text-[11px] text-muted-foreground font-medium">Updated 2 days ago</span>
            </div>

            <div>
              <h4 className="text-base font-bold text-foreground">Operating Systems (CS501)</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Complete Mid-Sem &amp; End-Sem Past 5 Years Papers with Answer Keys.
              </p>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs bg-muted/50 rounded-lg p-2 border border-border/30">
                <span className="font-mono text-[11px] font-medium text-foreground">PYQ-2024-Dec.pdf</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Verified</span>
              </div>
              <div className="flex items-center justify-between text-xs bg-muted/50 rounded-lg p-2 border border-border/30">
                <span className="font-mono text-[11px] font-medium text-foreground">Lecture-Summary-Unit4.pdf</span>
                <span className="text-[10px] text-primary font-semibold">9.2 MB</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium text-foreground">428 Student Downloads</span>
            <span className="text-amber-500 font-semibold">4.9 ★ (64 ratings)</span>
          </div>
        </div>
      ),
    },
    {
      label: "Clubs, Teams & Hackathons",
      content: (
        <div className="flex flex-col justify-between h-full">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                <Sparkles className="size-3" /> Smart India Hackathon
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Open Team
              </span>
            </div>

            <div>
              <h4 className="text-base font-bold text-foreground">Robotics &amp; AI Club</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Building an autonomous campus logistics bot for SIH 2026.
              </p>
            </div>

            <div className="rounded-xl border border-border/40 bg-muted/40 p-3 space-y-1.5">
              <div className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                <Users className="size-3.5 text-primary" /> Looking for Teammates
              </div>
              <div className="flex flex-wrap gap-1">
                <span className="rounded bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground border border-border/40">
                  ROS2
                </span>
                <span className="rounded bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground border border-border/40">
                  Computer Vision
                </span>
                <span className="rounded bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground border border-border/40">
                  FastAPI
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">3 Slots Remaining</span>
            <span className="font-bold text-primary hover:underline cursor-pointer">Apply with Profile →</span>
          </div>
        </div>
      ),
    },
  ];

  const universityLogos = [
    <span key="bit" className="font-bold text-sm tracking-tight text-foreground/80 hover:text-foreground transition-colors">
      BIT Mesra
    </span>,
    <span key="iitb" className="font-bold text-sm tracking-tight text-foreground/80 hover:text-foreground transition-colors">
      IIT Bombay
    </span>,
    <span key="bits" className="font-bold text-sm tracking-tight text-foreground/80 hover:text-foreground transition-colors">
      BITS Pilani
    </span>,
    <span key="du" className="font-bold text-sm tracking-tight text-foreground/80 hover:text-foreground transition-colors">
      Delhi University
    </span>,
    <span key="iitd" className="font-bold text-sm tracking-tight text-foreground/80 hover:text-foreground transition-colors">
      IIT Delhi
    </span>,
    <span key="nitt" className="font-bold text-sm tracking-tight text-foreground/80 hover:text-foreground transition-colors">
      NIT Trichy
    </span>,
  ];

  return (
    <StructuredHeroSection
      announcement="Live across 1,350+ Indian Colleges"
      announcementAction={{
        label: "Find your college hub →",
        href: "/colleges",
      }}
      title={
        <>
          The verified social layer <br />
          <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            for Indian college campuses.
          </span>
        </>
      }
      description="Connect with your actual college circle. Real campus discussions, semester notes & PYQs, society updates, and genuine student confessions — verified strictly by your institutional email."
      primaryAction={{
        label: isAuthenticated ? "Go to Feed" : "Join Your Campus",
        href: "/app",
      }}
      secondaryAction={{
        label: "Browse Colleges Directory",
        href: "/colleges",
      }}
      cards={cards}
      trustedBy={{
        heading: "Connecting students across premier Indian institutes",
        action: {
          label: "View all 1,350+ campus hubs",
          href: "/colleges",
        },
        logos: universityLogos,
      }}
    />
  );
}
