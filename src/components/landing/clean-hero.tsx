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
      className={`grid size-9 shrink-0 place-items-center rounded-full border-2 border-white bg-slate-900 text-[10px] font-bold text-white shadow-sm ${className}`}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

export function CleanHero({ isAuthenticated = false }: CleanHeroProps) {
  return (
    <section className="cl-hero relative overflow-hidden">
      <div className="cl-hero-orb cl-hero-orb-a" />
      <div className="cl-hero-orb cl-hero-orb-b" />
      <div className="cl-hero-grid" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-14 lg:pt-24">
        <div className="max-w-2xl">
          <div className="cl-kicker">
            <span className="cl-status-dot" />
            THE CAMPUS SOCIAL LAYER
          </div>

          <h1 className="cl-hero-title">
            Your campus,
            <br />
            <span className="cl-hero-title-accent">finally feels</span>
            <br />
            connected<span className="cl-period">.</span>
          </h1>

          <p className="cl-hero-copy">
            One place for the people, conversations, clubs, events, notes and everyday moments that make your college
            feel like home.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/app" className="cl-button cl-button-primary">
              {isAuthenticated ? "Open your campus" : "Join your campus"}
              <ArrowUpRight className="size-4" />
            </Link>
            <Link href="/colleges" className="cl-button cl-button-secondary">
              Explore campuses
            </Link>
          </div>

          <div className="cl-proof-row">
            <span><span className="cl-mini-check">✓</span> Verified students</span>
            <span>•</span>
            <span>Free to join</span>
            <span>•</span>
            <span>Web + PWA</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[640px] lg:ml-auto">
          <div className="cl-float-card cl-float-event">
            <span className="cl-float-icon">✦</span>
            <div>
              <span className="cl-float-label">TONIGHT</span>
              <strong>Tech club demo night</strong>
            </div>
          </div>

          <div className="cl-product-window">
            <div className="cl-window-topbar">
              <div className="flex items-center gap-3">
                <div className="cl-logo-mark">C</div>
                <div>
                  <p className="cl-window-brand">CampusLoop</p>
                  <p className="cl-window-meta">BIT Mesra · your campus</p>
                </div>
              </div>
              <span className="cl-verified-pill"><span /> Verified</span>
            </div>

            <div className="cl-window-body">
              <div className="space-y-4">
                <article className="cl-post-card">
                  <div className="flex items-center gap-2.5">
                    <Avatar>A</Avatar>
                    <div>
                      <p className="cl-card-name">Anonymous · 3rd year</p>
                      <p className="cl-card-meta">12 min ago</p>
                    </div>
                  </div>
                  <p className="cl-post-copy">
                    Anyone heading to the library after 8? I need a partner for the CN assignment.
                  </p>
                  <div className="cl-card-actions">
                    <span><MessageCircle className="size-3.5" /> 12</span>
                    <span><Heart className="size-3.5" /> 31</span>
                  </div>
                </article>

                <article className="cl-academic-card">
                  <div className="flex items-center gap-2">
                    <span className="cl-academic-icon"><BookOpen className="size-4" /></span>
                    <span className="cl-card-label">ACADEMICS</span>
                  </div>
                  <p className="mt-2 cl-card-title">Computer Networks — Module 2</p>
                  <p className="mt-1 cl-card-meta">14 notes · 6 PYQs · 2 lab manuals</p>
                </article>
              </div>

              <div className="space-y-4">
                <article className="cl-event-card">
                  <div className="flex items-center justify-between">
                    <span className="cl-dark-label">TONIGHT · 7 PM</span>
                    <CalendarDays className="size-4 text-white/60" />
                  </div>
                  <p className="cl-event-title">Build.<br />Ship.<br />Show off.</p>
                  <p className="cl-event-meta">6 projects · Innovation Lab</p>
                  <div className="mt-5 flex -space-x-2">
                    <Avatar className="bg-[#7867f5]">S</Avatar>
                    <Avatar className="bg-[#2fc7cf]">R</Avatar>
                    <Avatar className="bg-[#ff8aa1]">N</Avatar>
                    <span className="grid size-9 place-items-center rounded-full border-2 border-[#16152a] bg-white/10 text-[10px] font-bold text-white/70">+24</span>
                  </div>
                </article>

                <article className="cl-groups-card">
                  <div className="flex items-center gap-2">
                    <Users className="size-4" />
                    <span className="cl-card-name">Campus groups</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="cl-tag cl-tag-purple">ACM</span>
                    <span className="cl-tag cl-tag-cyan">Robotics</span>
                    <span className="cl-tag cl-tag-pink">Photography</span>
                  </div>
                </article>
              </div>
            </div>
          </div>

          <div className="cl-float-card cl-float-online">
            <span className="cl-online-pulse" />
            <div>
              <span className="cl-float-label">YOUR CAMPUS</span>
              <strong>184 people online</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="cl-feature-strip">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-5 py-5 text-center sm:justify-between sm:px-8">
          {["CONVERSATIONS", "NOTES & PYQS", "COMMUNITIES", "EVENTS", "MARKETPLACE", "CAMPUS DIRECTORY"].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
