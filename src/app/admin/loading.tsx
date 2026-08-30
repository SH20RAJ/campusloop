export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-56 rounded-lg bg-muted" />
        <div className="h-4 w-72 rounded bg-muted" />
      </div>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl border border-border bg-card" />
        ))}
      </div>
      <div className="h-64 rounded-xl border border-border bg-card" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-48 rounded-xl border border-border bg-card" />
        <div className="h-48 rounded-xl border border-border bg-card" />
      </div>
    </div>
  );
}
