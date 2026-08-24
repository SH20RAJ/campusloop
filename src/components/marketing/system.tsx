import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/brand-logo";

export const BRAND_GRADIENT = "bg-gradient-to-r from-indigo-500 via-violet-600 to-purple-600";

export function GradientText({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn(BRAND_GRADIENT, "bg-clip-text text-transparent", className)}>{children}</span>;
}

export function BrandMark({ size = "md" }: { size?: "sm" | "md" }) {
  return <BrandLogo size={size} href="/" />;
}

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/overview", label: "Overview" },
  { href: "/pitch", label: "Pitch" },
  { href: "/safety", label: "Safety" },
];

export function MarketingHeader({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <BrandMark />

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <Link href="/app" className={cn(buttonVariants({ size: "sm" }), "gap-1")}>
              Open app
              <ArrowRight className="size-3.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/join?mode=signin"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}
              >
                Sign in
              </Link>
              <Link href="/join?mode=signup" className={buttonVariants({ size: "sm" })}>
                Get verified
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

const FOOTER_COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Product",
    links: [
      { href: "/overview", label: "Platform Overview" },
      { href: "/colleges", label: "College Directory" },
      { href: "/join", label: "Join CampusLoop" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/pitch", label: "Investor Pitch" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Trust",
    links: [
      { href: "/safety", label: "Safety Guidelines" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-3">
          <BrandMark size="sm" />
          <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
            The verified student-only social network for Indian colleges. Built for students, gated
            by a college email.
          </p>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <nav key={col.title} className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground">{col.title}</p>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-border/60">
        <p className="mx-auto w-full max-w-6xl px-6 py-5 text-xs text-muted-foreground">
          © {new Date().getFullYear()} CampusLoop. Your campus, unfiltered.
        </p>
      </div>
    </footer>
  );
}

export function Section({
  id,
  tone = "default",
  className,
  children,
}: {
  id?: string;
  tone?: "default" | "muted" | "bordered";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-20",
        tone === "muted" && "border-y border-border/60 bg-muted/30",
        tone === "bordered" && "border-t border-border/60"
      )}
    >
      <div className={cn("mx-auto w-full max-w-6xl px-6 py-20 md:py-24", className)}>{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl space-y-3 pb-12", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      )}
      <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
      {lede && <p className="text-base leading-relaxed text-muted-foreground">{lede}</p>}
    </div>
  );
}

export function StatCard({ value, label, sub }: { value: React.ReactNode; label: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs">
      <p className="text-3xl font-black tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-sm font-bold text-foreground">{label}</p>
      {sub && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function CTABand({
  title,
  lede,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  title: React.ReactNode;
  lede?: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <Section tone="bordered" className="py-24 text-center md:py-28">
      <div className="space-y-6">
        <h2 className="text-4xl font-bold tracking-tight md:text-5xl">{title}</h2>
        {lede && <p className="mx-auto max-w-md text-base text-muted-foreground md:text-lg">{lede}</p>}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href={primaryHref} className={cn(buttonVariants({ size: "lg" }), "gap-1.5")}>
            {primaryLabel}
            <ArrowRight className="size-4" />
          </Link>
          {secondaryHref && secondaryLabel && (
            <Link href={secondaryHref} className={buttonVariants({ variant: "ghost", size: "lg" })}>
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </Section>
  );
}
