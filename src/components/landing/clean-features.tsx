import { BadgeCheck, BookOpen, MessageSquare, Users } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: BadgeCheck,
    eyebrow: "01 · Verified campus",
    title: "Know the conversation is actually from campus.",
    description:
      "Campus access starts with institutional email verification. That keeps the community focused on students from the same university.",
    href: "/about",
    link: "How verification works",
  },
  {
    icon: MessageSquare,
    eyebrow: "02 · Conversations",
    title: "Talk about the things that matter this week.",
    description:
      "Share campus updates, ask questions, run polls, discuss hostel life or post anonymously when you need more privacy.",
    href: "/app",
    link: "Explore campus",
  },
  {
    icon: BookOpen,
    eyebrow: "03 · Academics",
    title: "Keep notes and PYQs close to the conversation.",
    description:
      "Find course material by subject, module and college. Students can upload notes, PYQs, lab manuals and useful study resources.",
    href: "/app/academics",
    link: "Open academic vault",
  },
  {
    icon: Users,
    eyebrow: "04 · Communities",
    title: "Find the people building things with you.",
    description:
      "Discover clubs, societies, hackathon teams, interest groups and campus communities without digging through unrelated feeds.",
    href: "/app/communities",
    link: "Browse communities",
  },
];

export function CleanFeatures() {
  return (
    <section className="border-b border-border/70 bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Why CampusLoop</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Four things your campus should not have to live without.
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
            One product, four clear jobs. No feature soup and no decorative dashboards pretending to be useful.
          </p>
        </div>

        <div className="mt-12 grid overflow-hidden rounded-2xl border border-border md:grid-cols-2">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.eyebrow}
                className={[
                  "bg-background p-6 sm:p-8",
                  index % 2 === 0 ? "md:border-r md:border-border" : "",
                  index < 2 ? "border-b border-border" : "",
                ].join(" ")}
              >
                <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  {feature.eyebrow}
                </p>
                <h3 className="mt-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">{feature.title}</h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{feature.description}</p>
                <Link
                  href={feature.href}
                  className="mt-5 inline-flex items-center text-sm font-semibold text-foreground underline decoration-border underline-offset-4 transition hover:decoration-foreground"
                >
                  {feature.link}
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
