import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Heart,
  MessageCircle,
  Users,
} from "lucide-react";
import Link from "next/link";

interface CleanHeroProps {
  isAuthenticated?: boolean;
}

function Avatar({ children, className = "" }: { children: string; className?: string }) {
  return (
    <span
      className={`grid size-8 shrink-0 place-items-center rounded-full border-2 border-background bg-zinc-900 text-[10px] font-bold text-white shadow-sm ${className}`}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

export function CleanHero({ isAuthenticated = false }: CleanHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-[#fbfbfa] dark:bg-background">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-24 top-20 size-72 rounded-full bg-blue-100/60 blur-3xl dark:bg-blue-950/20" />
        <div className="absolute right-0 top-0 size-80 rounded-full bg-amber-100/60 blur-3xl dark:bg-amber-950/10" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-14 px-5 pb-20 pt-12 sm:px-6 sm:pb-24 sm:pt-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-16 lg:pt-20">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <span className="inline-block size-2 rounded-full bg-emerald-500" />
            Built for Indian college life
          </div>

          <h1 className="mt-6 text-[3.45rem] font-black leading-[0.94] tracking-[-0.065em] text-foreground sm:text-7xl lg:text-[5.35rem]">
            Your campus,
            <br />
            <span className="relative inline-block">
              in one loop
              <span className="absolute -bottom-1 left-1/2 h-2 w-[92%] -translate-x-1/2 -rotate-1 rounded-full bg-blue-500/15 sm:h-3" />
            </span>
            <span className="text-blue-500">.</span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            The conversations, notes, clubs, events and small everyday things that make a college feel like a
            college — all connected to the people who are actually there.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/app"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-foreground px-5 text-sm font-bold text-background shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.16)]"
            >
              {isAuthenticated ? "Open your campus" : "Join your campus"}
              <ArrowUpRight className="size-4" />
            </Link>
            <Link
              href="/colleges"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-border bg-background px-5 text-sm font-semibold text-foreground transition hover:-translate-y-0.5 hover:bg-muted"
            >
              Browse 1,350+ campuses
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span>Verified student access</span>
            <span className="size-1 rounded-full bg-border" />
            <span>Free to join</span>
            <span className="size-1 rounded-full bg-border" />
            <span>Web + PWA</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[560px] lg:ml-auto">
          <div className="absolute -left-3 top-12 hidden -rotate-6 rounded-2xl border border-border bg-amber-50 px-4 py-3 shadow-lg sm:block dark:bg-amber-950/20">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-700 dark:text-amber-300">
              Friday
            </p>
            <p className="mt-1 text-sm font-bold text-foreground">Open mic · 7:30 PM</p>
          </div>

          <div className="relative overflow-hidden rounded-[28px] border border-zinc-200 bg-white p-3 shadow-[0_30px_80px_rgba(20,25,35,0.12)] dark:border-border dark:bg-card">
            <div className="flex items-center justify-between border-b border-zinc-100 px-3 pb-3 dark:border-border">
              <div className="flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-xl bg-blue-500 text-xs font-black text-white">C</div>
                <div>
                  <p className="text-xs font-bold text-foreground">CampusLoop</p>
                  <p className="text-[10px] text-muted-foreground">BIT Mesra · campus feed</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                Verified
              </span>
            </div>

            <div className="grid gap-3 p-2.5 sm:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-3">
                <article className="rounded-2xl border border-zinc-100 bg-[#f7f8fa] p-4 dark:border-border dark:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Avatar>A</Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-foreground">Anonymous · 3rd year</p>
                      <p className="text-[10px] text-muted-foreground">12 min ago</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-semibold leading-5 text-foreground">
                    Anyone heading to the library after 8? I need a partner for the CN assignment.
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-[10px] font-semibold text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><MessageCircle className="size-3" /> 12</span>
                    <span className="inline-flex items-center gap-1"><Heart className="size-3" /> 31</span>
                  </div>
                </article>

                <article className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <BookOpen className="size-4" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em]">Academics</span>
                  </div>
                  <p className="mt-2 text-sm font-black text-foreground">Computer Networks — Module 2</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    14 notes · 6 PYQs · 2 lab manuals
                  </p>
                </article>
              </div>

              <div className="space-y-3">
                <article className="overflow-hidden rounded-2xl bg-zinc-950 p-4 text-white dark:bg-black">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">Tonight</span>
                    <CalendarDays className="size-4 text-zinc-400" />
                  </div>
                  <p className="mt-8 text-2xl font-black tracking-tight">Tech club<br />demo night.</p>
                  <p className="mt-2 text-xs leading-5 text-zinc-400">6 projects · 1 auditorium · 7 PM</p>
                  <div className="mt-6 flex -space-x-2">
                    <Avatar className="bg-blue-500">S</Avatar>
                    <Avatar className="bg-emerald-600">R</Avatar>
                    <Avatar className="bg-rose-500">N</Avatar>
                    <span className="grid size-8 place-items-center rounded-full border-2 border-zinc-950 bg-zinc-800 text-[10px] font-bold text-zinc-300">+24</span>
                  </div>
                </article>

                <article className="rounded-2xl border border-zinc-100 bg-white p-4 dark:border-border dark:bg-card">
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-foreground" />
                    <span className="text-xs font-bold text-foreground">Campus groups</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[10px] font-semibold text-violet-700 dark:bg-violet-950/30 dark:text-violet-300">ACM</span>
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">Photography</span>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">Robotics</span>
                  </div>
                </article>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-4 -right-2 rounded-2xl border border-border bg-background px-4 py-3 shadow-xl sm:right-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Your campus</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-foreground">People are here</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center gap-7 overflow-x-auto px-5 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground sm:px-6">
          {["Conversations", "Notes & PYQs", "Clubs", "Events", "Marketplace", "Campus Directory"].map((item) => (
            <span key={item} className="whitespace-nowrap">{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
