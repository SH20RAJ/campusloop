import { Compass, Home, Search } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
        <Compass className="size-8" />
      </div>

      <div className="space-y-2">
        <p className="text-5xl font-black tracking-tight text-foreground">404</p>
        <h1 className="text-lg font-black tracking-tight text-foreground">
          This corner of campus doesn&apos;t exist
        </h1>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground leading-relaxed">
          The page may have been deleted, or the link might be wrong. The rest of CampusLoop is still right
          here.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <Link
          href="/app"
          className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-xs font-black text-primary-foreground shadow-md transition-all hover:bg-primary/95 active:scale-95"
        >
          <Home className="size-4" />
          Back to feed
        </Link>
        <Link
          href="/app/search"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-5 text-xs font-black text-foreground transition-all hover:bg-muted active:scale-95"
        >
          <Search className="size-4" />
          Search campus
        </Link>
      </div>
    </main>
  );
}
