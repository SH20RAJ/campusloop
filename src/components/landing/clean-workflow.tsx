import { ArrowUpRight, CalendarDays, GraduationCap, MessageCircle, Store, Users } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    time: "08:40",
    label: "Campus feed",
    title: "What changed since yesterday?",
    text: "Announcements, questions, polls and the small conversations you would otherwise miss.",
    href: "/app",
    icon: MessageCircle,
  },
  {
    time: "11:15",
    label: "Academics",
    title: "Find the exact module you need.",
    text: "Move from course → module → notes or PYQs without searching old group chats.",
    href: "/app/academics",
    icon: GraduationCap,
  },
  {
    time: "17:30",
    label: "Communities",
    title: "See what people are building.",
    text: "Clubs, teams, societies and student communities organized around the campus.",
    href: "/app/communities",
    icon: Users,
  },
  {
    time: "19:00",
    label: "Events",
    title: "Know where to show up.",
    text: "Competitions, talks, fests and campus activities in one place.",
    href: "/app/events",
    icon: CalendarDays,
  },
];

export function CleanWorkflow() {
  return (
    <section className="border-b border-border bg-zinc-950 py-24 text-white sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-400">A day on CampusLoop</p>
          <h2 className="mt-4 max-w-lg text-4xl font-black tracking-[-0.045em] sm:text-5xl">
            Built around the rhythm of college.
          </h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-zinc-400 sm:text-base">
            The product changes with the day because student life does. Start with a class question, end up at an event, discover a club in between.
          </p>
          <Link
            href="/overview"
            className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-white underline decoration-zinc-700 underline-offset-4 transition hover:decoration-white"
          >
            See the whole product
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="border-y border-zinc-800">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <Link
                key={step.time}
                href={step.href}
                className="group grid gap-4 border-b border-zinc-800 py-7 last:border-b-0 sm:grid-cols-[72px_1fr_auto] sm:items-start sm:py-8"
              >
                <span className="text-xs font-bold tabular-nums text-zinc-600 group-hover:text-blue-400">{step.time}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="grid size-8 place-items-center rounded-lg bg-zinc-900 text-zinc-300 ring-1 ring-inset ring-zinc-800">
                      <Icon className="size-4" />
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">{step.label}</span>
                  </div>
                  <h3 className="mt-3 text-xl font-bold tracking-tight text-white sm:text-2xl">{step.title}</h3>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">{step.text}</p>
                </div>
                <ArrowUpRight className="hidden size-5 text-zinc-600 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white sm:mt-1 sm:block" />
              </Link>
            );
          })}
          <div className="grid grid-cols-2 border-t border-zinc-800">
            <Link href="/app/marketplace" className="group flex items-center gap-3 border-r border-zinc-800 p-5">
              <Store className="size-4 text-zinc-500 group-hover:text-white" />
              <span className="text-xs font-bold text-zinc-300 group-hover:text-white">Marketplace</span>
            </Link>
            <Link href="/colleges" className="group flex items-center gap-3 p-5">
              <span className="grid size-4 place-items-center rounded-full border border-zinc-700 text-[8px] font-black text-zinc-400">C</span>
              <span className="text-xs font-bold text-zinc-300 group-hover:text-white">College directory</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
