"use client";

import {
  Users,
  Code,
  Sparkles,
  Zap,
  Music,
  Car,
  Rocket,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

interface CollegeClubsViewProps {
  collegeName: string;
}

const BIT_MESRA_CLUBS = [
  {
    name: "ACM Student Chapter",
    category: "Technical & Competitive Programming",
    icon: Code,
    color: "from-blue-500/20 to-indigo-500/20 text-blue-500 border-blue-500/30",
    members: 140,
    description: "Hosts internal coding contests, ICPC bootcamps, and annual Hack-A-BIT hackathon.",
    tag: "ACM",
  },
  {
    name: "IEEE Student Branch",
    category: "Hardware & Robotics",
    icon: Zap,
    color: "from-cyan-500/20 to-blue-500/20 text-cyan-500 border-cyan-500/30",
    members: 115,
    description: "Organizes workshops on IoT, Embedded Systems, and AI hardware architecture.",
    tag: "IEEE",
  },
  {
    name: "Firebolt Racing (BAJA SAE)",
    category: "Motorsport & Engineering",
    icon: Car,
    color: "from-rose-500/20 to-orange-500/20 text-rose-500 border-rose-500/30",
    members: 85,
    description: "Designing, building, and racing custom ATV all-terrain vehicles across national circuits.",
    tag: "Firebolt",
  },
  {
    name: "Robolution",
    category: "Autonomous Robotics & Drones",
    icon: Rocket,
    color: "from-purple-500/20 to-indigo-500/20 text-purple-500 border-purple-500/30",
    members: 95,
    description: "Competes in Robowars, Line Followers, and autonomous drone racing at IIT Techfests.",
    tag: "Robolution",
  },
  {
    name: "EDC (Entrepreneurship Cell)",
    category: "Startups & Venture Incubation",
    icon: Sparkles,
    color: "from-amber-500/20 to-yellow-500/20 text-amber-500 border-amber-500/30",
    members: 130,
    description: "Empowers student founders with seed grants, founder AMAs, and E-Summit Ranchi.",
    tag: "EDC",
  },
  {
    name: "Ehsaas & Dhwani (Dramatics & Music)",
    category: "Cultural Arts & Band",
    icon: Music,
    color: "from-pink-500/20 to-rose-500/20 text-pink-500 border-pink-500/30",
    members: 160,
    description: "The creative heartbeat of BIT Mesra leading stage plays and BITOTSAV headline performances.",
    tag: "BITOTSAV",
  },
];

export function CollegeClubsView({ collegeName }: CollegeClubsViewProps) {
  const shortName = collegeName.split(",")[0];

  return (
    <div className="space-y-4 select-none animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
            <Users className="size-4 text-primary" /> Clubs &amp; Societies in {shortName}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Student-led technical societies, cultural clubs, and student chapters.
          </p>
        </div>

        <Link
          href="/app/communities"
          className="px-3.5 py-1.5 rounded-full border border-border/80 bg-card text-xs font-bold text-foreground hover:bg-muted transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
        >
          <Plus className="size-3.5 text-primary" />
          <span>All Communities</span>
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {BIT_MESRA_CLUBS.map((club, idx) => {
          const Icon = club.icon;
          return (
            <Link key={idx} href={`/app/hashtag/${club.tag}`}>
              <div className="rounded-3xl bg-card p-4 hover:bg-muted/40 transition-all cursor-pointer space-y-2.5 shadow-2xs group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-muted/40 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                        <span>{club.name}</span>
                        <ArrowUpRight className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h4>
                      <p className="text-[10px] text-muted-foreground">{club.category}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-muted/60 text-muted-foreground shrink-0">
                    {club.members}+ members
                  </span>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {club.description}
                </p>

                <div className="pt-0.5 flex items-center justify-between text-[10px] font-bold text-primary">
                  <span>#{club.tag}</span>
                  <span>Explore →</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
