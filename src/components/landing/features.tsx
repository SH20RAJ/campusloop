import { ShieldCheck, Lock, Sparkles, Zap } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Gatekept & Verified",
    description:
      "Only whitelisted college emails get in. No bots, no randoms — strictly verified students. Your campus, your people.",
  },
  {
    icon: Lock,
    title: "Spill Without Regret",
    description:
      "Post confessions and questions anonymously. Your identity stays hidden from other students but accountable to our safety system.",
  },
  {
    icon: Sparkles,
    title: "Campus Crushes",
    description:
      "Opt-in swipe mode lets you discover students in your college. Mutual like? Instant DM unlock. Zero awkwardness.",
  },
  {
    icon: Zap,
    title: "Live Polls & Discussions",
    description:
      "Drop multi-option polls, ask academic questions, or start a campus debate. Everything stays in your college loop.",
  },
];

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-20 pt-4 lg:px-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="group rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-border/80"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-primary/10 bg-primary/5 text-primary">
                <Icon className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                {f.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {f.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
