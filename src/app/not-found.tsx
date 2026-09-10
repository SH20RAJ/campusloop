import Link from "next/link";
import { NotFoundSearch } from "@/components/marketing/not-found-search";
import { MarketingFooter, MarketingHeader } from "@/components/marketing/system";
import { buttonVariants } from "@/components/ui/button";
import { hexclaveServerApp } from "@/hexclave/server";
import { cn } from "@/lib/utils";

const ESCAPE_LINKS = [
  { href: "/app", label: "Feed" },
  { href: "/colleges", label: "Colleges" },
  { href: "/products", label: "Products" },
  { href: "/contact", label: "Contact" },
];

export default async function NotFound() {
  const user = await hexclaveServerApp.getUser();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <MarketingHeader isAuthenticated={!!user} />

      <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 py-28 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_38%,var(--color-primary)/8%,transparent_70%)]"
        />
        <div className="relative flex w-full max-w-md flex-col items-center">
          <p className="rounded-full border border-border/70 bg-muted/50 px-3.5 py-1.5 font-mono text-xs font-semibold text-muted-foreground">
            404
          </p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-balance md:text-5xl">
            This page isn&apos;t on the map
          </h1>
          <p className="mt-3 text-base leading-relaxed text-pretty text-muted-foreground">
            The link is wrong or the page was removed. Search for what you meant, or head back to your feed.
          </p>

          <div className="mt-8 w-full">
            <NotFoundSearch />
          </div>

          <Link
            href={user ? "/app" : "/handler/sign-up"}
            className={cn(buttonVariants({ size: "lg" }), "mt-4 w-full sm:w-auto")}
          >
            {user ? "Back to feed" : "Get verified"}
          </Link>

          <nav
            aria-label="Popular destinations"
            className="mt-8 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-sm"
          >
            {ESCAPE_LINKS.map((link, i) => (
              <span key={link.href} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-muted-foreground/40">·</span>}
                <Link
                  href={link.href}
                  className="font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </span>
            ))}
          </nav>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
