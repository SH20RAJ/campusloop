"use client";

import {
  ArrowRight,
  Bookmark,
  CalendarDays,
  Check,
  Heart,
  MessageCircle,
  Search,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";

type DemoTab = "feed" | "study" | "communities" | "events";

const tabs: Array<{ id: DemoTab; label: string }> = [
  { id: "feed", label: "Campus Feed" },
  { id: "study", label: "Academics" },
  { id: "communities", label: "Communities" },
  { id: "events", label: "Events" },
];

const studyItems = [
  { title: "Computer Networks · Module 2", meta: "14 notes · 6 PYQs", tag: "CN" },
  { title: "Compiler Design · Syntax Analysis", meta: "9 notes · 4 PYQs", tag: "CD" },
  { title: "Artificial Intelligence · Search", meta: "11 notes · 3 PYQs", tag: "AI" },
];

const communityItems = [
  { name: "ACM Student Chapter", meta: "328 members", tone: "bg-blue-50 text-blue-700" },
  { name: "Robotics Club", meta: "142 members", tone: "bg-emerald-50 text-emerald-700" },
  { name: "Photography Society", meta: "96 members", tone: "bg-amber-50 text-amber-700" },
];

const eventItems = [
  { title: "HackQuest · 24h Hackathon", meta: "Fri · 7 PM · Main Auditorium", status: "1.2k going" },
  { title: "ACM Demo Night", meta: "Sat · 5 PM · Innovation Lab", status: "184 going" },
  { title: "Freshers Open Mic", meta: "Sun · 7:30 PM · Amphitheatre", status: "342 going" },
];

export function InteractiveShowcase() {
  const [activeTab, setActiveTab] = useState<DemoTab>("feed");
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pollChoice, setPollChoice] = useState<"canteen" | "gate" | null>(null);
  const [search, setSearch] = useState("");
  const [joined, setJoined] = useState<string[]>([]);
  const [rsvped, setRsvped] = useState<string[]>([]);

  const filteredStudy = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return studyItems;
    return studyItems.filter((item) => `${item.title} ${item.meta}`.toLowerCase().includes(query));
  }, [search]);

  function toggleInList(value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) {
    setter((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  return (
    <section className="border-b border-border bg-[#f7f8fb] py-20 dark:bg-muted/20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:items-center lg:gap-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300">
              <Sparkles className="size-3.5" />
              Try the product
            </div>
            <h2 className="mt-5 max-w-lg text-4xl font-black tracking-[-0.045em] text-foreground sm:text-5xl">
              Don’t imagine CampusLoop. Play with it.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              Switch between the four things students actually come here to do. Vote, search, join and RSVP — the
              same ideas you get inside the app.
            </p>

            <div className="mt-8 space-y-2">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-pressed={activeTab === tab.id}
                  className={[
                    "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition",
                    activeTab === tab.id
                      ? "border-foreground bg-foreground text-background shadow-sm"
                      : "border-border bg-background text-foreground hover:bg-muted",
                  ].join(" ")}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-[10px] font-black tabular-nums opacity-50">0{index + 1}</span>
                    <span className="text-sm font-bold">{tab.label}</span>
                  </span>
                  <ArrowRight className="size-4 opacity-60" />
                </button>
              ))}
            </div>

            <Link
              href="/overview"
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-foreground underline decoration-border underline-offset-4 transition hover:decoration-foreground"
            >
              See the full product
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="relative">
            <div className="absolute -left-5 -top-5 hidden rounded-2xl border border-border bg-background px-4 py-3 shadow-xl sm:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Live preview</p>
              <p className="mt-1 text-xs font-semibold text-foreground">Everything is campus-first.</p>
            </div>

            <div className="overflow-hidden rounded-[30px] border border-zinc-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.12)] dark:border-border dark:bg-card">
              <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 dark:border-border">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-xl bg-foreground text-xs font-black text-background">C</span>
                  <div>
                    <p className="text-xs font-black text-foreground">CampusLoop</p>
                    <p className="text-[10px] text-muted-foreground">Your campus, in one loop.</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                  Verified
                </span>
              </div>

              <div className="min-h-[520px] bg-[#fbfbfc] p-4 sm:p-6 dark:bg-muted/10">
                {activeTab === "feed" && (
                  <div className="mx-auto max-w-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-500">Campus feed</p>
                        <h3 className="mt-1 text-xl font-black tracking-tight text-foreground">What’s happening today?</h3>
                      </div>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-muted-foreground shadow-sm">BIT Mesra</span>
                    </div>

                    <article className="rounded-3xl border border-border bg-background p-5 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-full bg-blue-100 text-xs font-black text-blue-700">A</span>
                        <div>
                          <p className="text-xs font-bold text-foreground">Anonymous · 3rd year</p>
                          <p className="text-[10px] text-muted-foreground">12 min ago · Hostel 7</p>
                        </div>
                      </div>
                      <p className="mt-4 text-sm font-semibold leading-6 text-foreground">
                        Anyone heading to the library after 8? Need a partner for the CN assignment.
                      </p>
                      <div className="mt-4 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setLiked((value) => !value)}
                          className={[
                            "inline-flex h-9 items-center gap-2 rounded-full px-3 text-xs font-bold transition",
                            liked ? "bg-rose-50 text-rose-600" : "bg-muted text-foreground hover:bg-muted/70",
                          ].join(" ")}
                        >
                          <Heart className={`size-4 ${liked ? "fill-current" : ""}`} />
                          {liked ? "31" : "30"}
                        </button>
                        <button type="button" className="inline-flex h-9 items-center gap-2 rounded-full bg-muted px-3 text-xs font-bold text-foreground">
                          <MessageCircle className="size-4" />
                          12
                        </button>
                        <button
                          type="button"
                          onClick={() => setSaved((value) => !value)}
                          className={[
                            "ml-auto inline-flex h-9 items-center gap-2 rounded-full px-3 text-xs font-bold transition",
                            saved ? "bg-amber-50 text-amber-700" : "bg-muted text-foreground",
                          ].join(" ")}
                        >
                          <Bookmark className={`size-4 ${saved ? "fill-current" : ""}`} />
                          {saved ? "Saved" : "Save"}
                        </button>
                      </div>
                    </article>

                    <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5 dark:border-blue-900/40 dark:bg-blue-950/15">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-300">Campus poll</p>
                          <h4 className="mt-1 text-sm font-black text-foreground">Where are we getting late-night chai?</h4>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground">428 votes</span>
                      </div>
                      <div className="mt-4 space-y-2">
                        {([
                          ["canteen", "Canteen Booth", pollChoice === "canteen" ? 64 : 58],
                          ["gate", "Back Gate Counter", pollChoice === "gate" ? 36 : 42],
                        ] as const).map(([id, label, percent]) => (
                          <button
                            type="button"
                            key={id}
                            onClick={() => setPollChoice(id)}
                            className="relative w-full overflow-hidden rounded-xl border border-blue-100 bg-white px-3 py-2.5 text-left text-xs font-bold text-foreground dark:border-blue-900/40 dark:bg-card"
                          >
                            <span
                              className="absolute inset-y-0 left-0 rounded-xl bg-blue-500/10 transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                            <span className="relative flex items-center justify-between gap-3">
                              <span>{label}</span>
                              <span className="text-blue-600 dark:text-blue-300">{percent}%</span>
                            </span>
                          </button>
                        ))}
                      </div>
                      <p className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                        <Check className="size-3 text-emerald-500" />
                        One verified student · one vote
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "study" && (
                  <div className="mx-auto max-w-xl">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-500">Academic vault</p>
                    <div className="mt-1 flex items-end justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-black tracking-tight text-foreground">Find the exact thing you need.</h3>
                        <p className="mt-1 text-xs text-muted-foreground">Notes · PYQs · lab manuals · playlists</p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 shadow-sm">
                      <Search className="size-4 text-muted-foreground" />
                      <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search a subject or module"
                        className="min-w-0 flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
                        aria-label="Search academic material"
                      />
                    </div>

                    <div className="mt-4 space-y-2">
                      {filteredStudy.map((item) => (
                        <button
                          type="button"
                          key={item.title}
                          onClick={() => setSaved(true)}
                          className="group flex w-full items-center gap-3 rounded-2xl border border-border bg-background p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
                        >
                          <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-[11px] font-black text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                            {item.tag}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-black text-foreground">{item.title}</span>
                            <span className="mt-1 block text-[10px] text-muted-foreground">{item.meta}</span>
                          </span>
                          <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                        </button>
                      ))}
                      {filteredStudy.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                          <p className="text-sm font-bold text-foreground">Nothing in this demo matches.</p>
                          <p className="mt-1 text-xs text-muted-foreground">Try “networks”, “compiler” or “AI”.</p>
                        </div>
                      )}
                    </div>

                    <Link href="/app/academics" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-foreground">
                      Open the full academic vault <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                )}

                {activeTab === "communities" && (
                  <div className="mx-auto max-w-xl">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-500">Communities</p>
                    <h3 className="mt-1 text-xl font-black tracking-tight text-foreground">Find your people.</h3>
                    <p className="mt-1 text-xs text-muted-foreground">Clubs, societies, project teams and hobby circles.</p>

                    <div className="mt-5 space-y-3">
                      {communityItems.map((community) => {
                        const isJoined = joined.includes(community.name);
                        return (
                          <div key={community.name} className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4">
                            <span className={`grid size-10 place-items-center rounded-xl text-xs font-black ${community.tone}`}>
                              <Users className="size-4" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-black text-foreground">{community.name}</p>
                              <p className="mt-1 text-[10px] text-muted-foreground">{community.meta}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleInList(community.name, setJoined)}
                              className={[
                                "rounded-xl px-3 py-2 text-[10px] font-bold transition",
                                isJoined ? "bg-foreground text-background" : "bg-muted text-foreground hover:bg-muted/70",
                              ].join(" ")}
                            >
                              {isJoined ? "Joined" : "Join"}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-5 rounded-2xl bg-foreground p-4 text-background">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-background/50">Campus match</p>
                      <p className="mt-1 text-sm font-black">Build with someone who’s already on your campus.</p>
                      <p className="mt-1 text-xs text-background/60">Project partners · study buddies · societies</p>
                    </div>
                  </div>
                )}

                {activeTab === "events" && (
                  <div className="mx-auto max-w-xl">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-500">Campus events</p>
                    <h3 className="mt-1 text-xl font-black tracking-tight text-foreground">Know where to show up.</h3>
                    <p className="mt-1 text-xs text-muted-foreground">Fests, workshops, competitions and the little things worth leaving your room for.</p>

                    <div className="mt-5 space-y-3">
                      {eventItems.map((event) => {
                        const isGoing = rsvped.includes(event.title);
                        return (
                          <div key={event.title} className="rounded-2xl border border-border bg-background p-4">
                            <div className="flex items-start gap-3">
                              <span className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-300">
                                <CalendarDays className="size-4" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-black text-foreground">{event.title}</p>
                                <p className="mt-1 text-[10px] leading-4 text-muted-foreground">{event.meta}</p>
                                <p className="mt-1 text-[10px] font-semibold text-muted-foreground">{event.status}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleInList(event.title, setRsvped)}
                                className={[
                                  "rounded-xl px-3 py-2 text-[10px] font-bold transition",
                                  isGoing ? "bg-emerald-500 text-white" : "bg-muted text-foreground",
                                ].join(" ")}
                              >
                                {isGoing ? "Going" : "RSVP"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-5 flex items-center justify-between rounded-2xl border border-dashed border-border px-4 py-3">
                      <span className="text-xs font-bold text-foreground">Your campus is the filter.</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                        <Send className="size-3" />
                        Invite friends
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-4 dark:border-border">
                <p className="text-[10px] font-semibold text-muted-foreground">Interactive preview · no signup required</p>
                <span className="text-[10px] font-black text-foreground">CampusLoop</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
