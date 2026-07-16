import { Mail, Compass, MessageCircle } from "lucide-react";

const steps = [
  {
    icon: Mail,
    step: "01",
    title: "Verify with your college email",
    description:
      "Sign up using your .ac.in or institution email. We auto-detect your college and place you in your campus community. Takes 30 seconds.",
  },
  {
    icon: Compass,
    step: "02",
    title: "Explore your campus feed",
    description:
      "See posts, confessions, and polls from students at your college. Upvote, comment, or post your own — anonymously or not.",
  },
  {
    icon: MessageCircle,
    step: "03",
    title: "Connect beyond the feed",
    description:
      "Join communities, swipe to match, or slide into DMs after a mutual like. Your campus world, all in one place.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-20 lg:px-8">
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          How it works
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Three steps to join your campus loop.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.step} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/5 text-primary ring-1 ring-primary/10">
                <Icon className="h-5 w-5" />
              </div>
              <span className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-primary">
                Step {s.step}
              </span>
              <h3 className="text-sm font-semibold text-foreground">
                {s.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {s.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
