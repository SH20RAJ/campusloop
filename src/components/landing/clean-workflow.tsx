"use client";

import { ArrowRight, CalendarDays, GraduationCap, MessageCircleMore, Store, UsersRound } from "lucide-react";
import Link from "next/link";

const items = [
  {
    icon: MessageCircleMore,
    title: "Campus conversations",
    text: "Questions, announcements, polls, confessions and everyday student life.",
    href: "/app",
  },
  {
    icon: GraduationCap,
    title: "Academics",
    text: "Notes, PYQs, lab manuals and study resources organized by course.",
    href: "/app/academics",
  },
  {
    icon: UsersRound,
    title: "Clubs & communities",
    text: "Find societies, teams, project partners and people with similar interests.",
    href: "/app/communities",
  },
  {
    icon: CalendarDays,
    title: "Events",
    text: "Keep fest announcements, competitions and campus activities in one place.",
    href: "/app/events",
  },
  {
    icon: Store,
    title: "Campus marketplace",
    text: "Trade useful student and hostel items inside a verified campus network.",
    href: "/app/marketplace",
  },
];

export function CleanWorkflow() {
  return (
    <section className="border-b border-border/70 bg-muted/20 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">A campus workspace</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              Everything lives close to the people it matters to.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
              Move from a class discussion to a study note, from a club announcement to an event — without switching between unrelated groups and apps.
            </p>
            <Link
              href="/overview"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground underline decoration-border underline-offset-4 transition hover:decoration-foreground"
            >
              See how CampusLoop works
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-background">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex items-center gap-4 p-5 transition hover:bg-muted/50 sm:p-6"
                >
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground transition group-hover:bg-primary/10 group-hover:text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.text}</p>
                  </div>
                  <ArrowRight className="ml-auto size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
