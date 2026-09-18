import { ArrowUpRight, BookOpen, MessageSquareText, Users2 } from "lucide-react";
import Link from "next/link";

const featureBlocks = [
  {
    number: "01",
    label: "Talk",
    title: "A campus feed that sounds like people.",
    description:
      "Ask the question that is too specific for a college group chat. Share an update. Run a poll. Post anonymously when the subject needs it.",
    href: "/app",
    cta: "Open campus feed",
    icon: MessageSquareText,
    tone: "bg-[#f6f8ff] dark:bg-blue-950/15",
  },
  {
    number: "02",
    label: "Study",
    title: "The material you need, where students actually use it.",
    description:
      "Notes, PYQs, lab manuals and playlists organized around courses, modules and campuses.",
    href: "/app/academics",
    cta: "Open academic vault",
    icon: BookOpen,
    tone: "bg-[#fbf8f1] dark:bg-amber-950/10",
  },
  {
    number: "03",
    label: "Find people",
    title: "Clubs, teams and communities without the hunt.",
    description:
      "See what your campus is building, joining and showing up for.",
    href: "/app/communities",
    cta: "Browse communities",
    icon: Users2,
    tone: "bg-[#f4faf6] dark:bg-emerald-950/10",
  },
];

export function CleanFeatures() {
  return (
    <section className="border-b border-border bg-background py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-500">What lives here</p>
            <h2 className="mt-4 max-w-md text-4xl font-black tracking-[-0.04em] text-foreground sm:text-5xl">
              The useful side of campus life.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
              Not another generic social timeline. CampusLoop is designed around the stuff students repeatedly need from the people around them.
            </p>

            <div className="mt-10 hidden border-l-2 border-border pl-5 lg:block">
              <p className="text-sm font-semibold leading-6 text-foreground">
                One campus identity.
                <br />
                Many ways to use it.
              </p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Conversations, academics, communities and campus activity stay connected.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {featureBlocks.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.number}
                  href={feature.href}
                  className={`group grid gap-6 rounded-[26px] border border-border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(15,23,42,0.08)] sm:grid-cols-[72px_1fr_auto] sm:items-start sm:p-8 ${feature.tone}`}
                >
                  <div className="flex items-center gap-3 sm:block">
                    <span className="text-xs font-black tracking-widest text-muted-foreground">{feature.number}</span>
                    <span className="hidden text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground sm:block">{feature.label}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <div className="grid size-9 place-items-center rounded-xl bg-background text-foreground shadow-sm">
                        <Icon className="size-4" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground sm:hidden">{feature.label}</span>
                    </div>
                    <h3 className="mt-4 max-w-xl text-2xl font-black tracking-[-0.03em] text-foreground sm:text-3xl">{feature.title}</h3>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{feature.description}</p>
                  </div>

                  <ArrowUpRight className="hidden size-5 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground sm:block" />
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-foreground sm:hidden">
                    {feature.cta}
                    <ArrowUpRight className="size-3.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
