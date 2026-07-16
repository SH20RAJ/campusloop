const stats = [
  { value: "500+", label: "Colleges onboarded" },
  { value: "50K+", label: "Verified students" },
  { value: "100K+", label: "Posts & confessions" },
  { value: "10K+", label: "Matches made" },
];

export function Stats() {
  return (
    <section className="mx-auto max-w-4xl px-6 pb-20 lg:px-8">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center justify-center bg-card px-4 py-8 text-center"
          >
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {s.value}
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
