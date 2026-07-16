import { ShieldCheck, EyeOff, Ban, Flag } from "lucide-react";

const safeguards = [
  {
    icon: Ban,
    label: "Slur & Profanity Filter",
    active: true,
  },
  {
    icon: EyeOff,
    label: "Doxxing Prevention",
    active: true,
  },
  {
    icon: Flag,
    label: "5 Reports = Auto-Hide",
    active: true,
  },
  {
    icon: ShieldCheck,
    label: "Moderator Review",
    active: true,
  },
];

export function SafetySection() {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-20 lg:px-8">
      <div className="grid gap-8 items-center md:grid-cols-2">
        {/* Left: Text */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-primary">
            Built-in safety
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Anonymous to students.
            <br />
            Accountable to safety.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Every post is scanned on creation to block phone numbers, emails,
            slurs, and harassment. Your identity stays hidden from other students
            but is privately stored for moderation. If a post gets 5+ reports, it
            is automatically taken down.
          </p>
        </div>

        {/* Right: Safeguards list */}
        <div className="space-y-2">
          {safeguards.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm"
              >
                <span className="flex items-center gap-2 text-foreground">
                  <Icon className="h-4 w-4 text-primary" />
                  {s.label}
                </span>
                <span className="text-xs font-semibold text-emerald-500">
                  Active
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
