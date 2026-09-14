"use client";

import Link from "next/link";
import { GraduationCap, ShieldCheck, Users } from "lucide-react";
import { Marquee } from "@/components/ui/marquee";

const FEATURED_CAMPUSES = [
  { name: "IIT Bombay", location: "Mumbai, MH", count: "3,400+ students", slug: "iit-bombay" },
  { name: "BITS Pilani", location: "Pilani, RJ", count: "4,200+ students", slug: "bits-pilani" },
  { name: "IIT Delhi", location: "New Delhi, DL", count: "3,100+ students", slug: "iit-delhi" },
  { name: "NIT Trichy", location: "Tiruchirappalli, TN", count: "2,800+ students", slug: "nit-trichy" },
  { name: "Delhi University", location: "North Campus, DL", count: "8,900+ students", slug: "delhi-university" },
  { name: "BIT Mesra", location: "Ranchi, JH", count: "4,100+ students", slug: "bit-mesra" },
  { name: "VIT Vellore", location: "Vellore, TN", count: "7,500+ students", slug: "vit-vellore" },
  { name: "IIT Madras", location: "Chennai, TN", count: "2,900+ students", slug: "iit-madras" },
  { name: "SRMC", location: "Porur, Chennai", count: "1,900+ students", slug: "srmc" },
  { name: "IIIT Hyderabad", location: "Gachibowli, TS", count: "1,600+ students", slug: "iiit-hyderabad" },
  { name: "DTU", location: "Rohini, DL", count: "3,700+ students", slug: "dtu" },
  { name: "Jadavpur University", location: "Kolkata, WB", count: "2,400+ students", slug: "jadavpur-university" },
];

export function CampusTicker() {
  return (
    <div className="w-full py-8 border-y border-border/40 bg-muted/20 backdrop-blur-sm overflow-hidden relative">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
            Live Verified Campus Network
          </span>
        </div>
        <Link
          href="/app/colleges"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <span>Browse all 1,350+ indexed college hubs</span>
          <span>→</span>
        </Link>
      </div>

      <Marquee pauseOnHover className="[--duration:35s] py-1">
        {FEATURED_CAMPUSES.map((college) => (
          <Link
            key={college.slug}
            href={`/app/colleges`}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border/50 bg-card/60 hover:bg-card hover:border-primary/40 hover:shadow-xs transition-all shrink-0 group cursor-pointer"
          >
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform">
              <GraduationCap className="size-4" />
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  {college.name}
                </span>
                <ShieldCheck className="size-3 text-primary shrink-0" />
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>{college.location}</span>
                <span>•</span>
                <span className="flex items-center gap-0.5 text-foreground/80 font-mono">
                  <Users className="size-2.5" />
                  {college.count}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </Marquee>
    </div>
  );
}
