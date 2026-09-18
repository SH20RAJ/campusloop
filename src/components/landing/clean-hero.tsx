"use client";

import { ArrowRight, BookOpen, Building2, MessageCircle, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";

interface CleanHeroProps {
  isAuthenticated?: boolean;
}

const quickLinks = [
  {
    icon: BookOpen,
    title: "Academics",
    text: "Notes, PYQs and study material shared by students.",
    href: "/app/academics",
  },
  {
    icon: Users,
    title: "Communities",
    text: "Clubs, societies, teams and campus groups.",
    href: "/app/communities",
  },
  {
    icon: MessageCircle,
    title: "Conversations",
    text: "Campus discussions, polls and anonymous posts.",
    href: "/app",
  },
];

export function CleanHero({ isAuthenticated = false }: CleanHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border/70 bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(29,155,240,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(29,155,240,0.045)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />

      <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-muted-foreground shadow-xs">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Verified across 1,350+ Indian college hubs
          </div>

          <h1 className="mt-7 max-w-3xl text-4xl font-black tracking-[-0.04em] text-foreground sm:text-6xl sm:leading-[1.02]">
            Your campus,
            <br />
            without the noise.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            CampusLoop brings the useful parts of campus life into one place: real student conversations,
            semester notes and PYQs, communities, events and campus updates.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/app"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              {isAuthenticated ? "Open your campus" : "Join your campus"}
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/colleges"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-background px-5 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              Explore colleges
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              Institutional email verification
            </span>
            <span>Free for verified students</span>
            <span>Web · PWA</span>
          </div>
        </div>

        <div className="mt-14 grid gap-3 sm:grid-cols-3">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-2xl border border-border/80 bg-background/95 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-border hover:shadow-md"
              >
                <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-bold text-foreground">{item.title}</h2>
                    <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.text}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-muted/35 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-background text-muted-foreground">
                <Building2 className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Can’t find your college?</p>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                  Browse the directory or request a campus hub for your university.
                </p>
              </div>
            </div>
            <Link
              href="/colleges"
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background px-4 text-xs font-semibold text-foreground transition hover:bg-muted"
            >
              Browse directory
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
