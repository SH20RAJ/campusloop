import { ArrowLeft, ArrowRight, Check, ListChecks } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DocsFeatureIcon } from "@/components/docs/docs-feature-icon";
import { CTABand, MarketingFooter, MarketingHeader } from "@/components/marketing/system";
import { hexclaveServerApp } from "@/hexclave/server";
import { DOCS_FEATURES, getDocsFeature, getDocsSlugs } from "@/lib/docs-features";

export function generateStaticParams() {
  return getDocsSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const feature = getDocsFeature(slug);
  if (!feature) return { title: "Not found" };
  const url = `https://campusloop.space/docs/${feature.slug}`;
  return {
    title: `${feature.title} — How It Works`,
    description: feature.description,
    keywords: feature.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: `${feature.title} | CampusLoop Docs`,
      description: feature.tagline,
      url,
      siteName: "CampusLoop",
      locale: "en_IN",
      type: "article",
      images: [
        {
          url: "https://campusloop.space/og-image.png",
          width: 1200,
          height: 630,
          alt: `${feature.title} — CampusLoop Docs`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${feature.title} | CampusLoop Docs`,
      description: feature.tagline,
      images: ["https://campusloop.space/og-image.png"],
    },
    robots: { index: true, follow: true },
  };
}

export default async function DocsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const feature = getDocsFeature(slug);
  if (!feature) notFound();
  const user = await hexclaveServerApp.getUser();

  const idx = DOCS_FEATURES.findIndex((f) => f.slug === feature.slug);
  const prev = DOCS_FEATURES[(idx - 1 + DOCS_FEATURES.length) % DOCS_FEATURES.length];
  const next = DOCS_FEATURES[(idx + 1) % DOCS_FEATURES.length];
  const related = DOCS_FEATURES.filter(
    (f) => f.category === feature.category && f.slug !== feature.slug
  ).slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${feature.title} — How It Works`,
    description: feature.description,
    url: `https://campusloop.space/docs/${feature.slug}`,
    author: { "@type": "Organization", name: "CampusLoop", url: "https://campusloop.space" },
    publisher: { "@type": "Organization", name: "CampusLoop", url: "https://campusloop.space" },
    mainEntityOfPage: `https://campusloop.space/docs/${feature.slug}`,
    mainEntity: {
      "@type": "FAQPage",
      mainEntity: feature.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <MarketingHeader isAuthenticated={!!user} />
        <main className="mx-auto w-full max-w-3xl flex-1 px-6 pt-28 pb-16">
          <nav className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Link href="/docs" className="inline-flex items-center gap-1 hover:text-foreground">
              <ArrowLeft className="size-3.5" /> All docs
            </Link>
            <span aria-hidden>/</span>
            <span>{feature.category}</span>
            <span aria-hidden>/</span>
            <span className="text-foreground">{feature.title}</span>
          </nav>

          <header className="mt-6 space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <DocsFeatureIcon slug={feature.slug} className="size-3.5" />
              {feature.category}
            </span>
            <h1 className="text-3xl font-bold tracking-tight md:text-[2.75rem] md:leading-[1.1]">
              {feature.title}
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">{feature.tagline}</p>
          </header>

          <blockquote className="mt-8 rounded-2xl border-l-2 border-primary bg-muted/40 px-6 py-5 text-[1.05rem] leading-relaxed font-medium">
            {feature.hook}
          </blockquote>

          <article className="mt-10 space-y-10">
            <section className="space-y-3">
              <h2 className="text-xl font-bold tracking-tight">The problem</h2>
              <p className="leading-relaxed text-muted-foreground">{feature.problem}</p>
            </section>
            <section className="space-y-3">
              <h2 className="text-xl font-bold tracking-tight">What changes here</h2>
              <p className="leading-relaxed text-muted-foreground">{feature.shift}</p>
            </section>
            <section className="space-y-4">
              <h2 className="inline-flex items-center gap-2 text-xl font-bold tracking-tight">
                <ListChecks className="size-5 text-primary" /> How it works
              </h2>
              <ol className="space-y-3">
                {feature.howItWorks.map((step, i) => (
                  <li key={step} className="flex gap-3.5 rounded-xl border border-border bg-card p-4">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <p className="text-sm leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            </section>
            <section className="space-y-4">
              <h2 className="text-xl font-bold tracking-tight">Why it holds up</h2>
              <ul className="space-y-2.5">
                {feature.proofPoints.map((p) => (
                  <li key={p} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" strokeWidth={2.5} />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="space-y-3">
              <h2 className="text-xl font-bold tracking-tight">Questions, answered</h2>
              <div className="space-y-3">
                {feature.faq.map((f) => (
                  <details key={f.q} className="group rounded-xl border border-border bg-card">
                    <summary className="cursor-pointer px-5 py-4 text-sm font-semibold group-open:text-primary">
                      {f.q}
                    </summary>
                    <p className="border-t border-border/50 px-5 pt-3 pb-4 text-sm leading-relaxed text-muted-foreground">
                      {f.a}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          </article>

          {related.length > 0 && (
            <section className="mt-12 space-y-3">
              <h2 className="text-sm font-bold tracking-wide text-muted-foreground uppercase">
                Keep reading in {feature.category}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/docs/${r.slug}`}
                    className="group rounded-xl border border-border bg-card p-4 hover:border-primary/30"
                  >
                    <p className="text-sm font-bold group-hover:text-primary">{r.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {r.tagline}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <nav className="mt-10 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
            <Link
              href={`/docs/${prev.slug}`}
              className="group rounded-xl border border-border p-4 hover:border-primary/30"
            >
              <span className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
                Previous
              </span>
              <span className="mt-1 flex items-center gap-1.5 text-sm font-bold group-hover:text-primary">
                <ArrowLeft className="size-3.5" /> {prev.title}
              </span>
            </Link>
            <Link
              href={`/docs/${next.slug}`}
              className="group rounded-xl border border-border p-4 text-right hover:border-primary/30"
            >
              <span className="text-[11px] font-bold tracking-wide text-muted-foreground uppercase">
                Next
              </span>
              <span className="mt-1 flex items-center justify-end gap-1.5 text-sm font-bold group-hover:text-primary">
                {next.title} <ArrowRight className="size-3.5" />
              </span>
            </Link>
          </nav>
        </main>
        <CTABand
          title="See it on your own campus."
          lede="Docs explain the design. Your college email unlocks the real thing."
          primaryHref={user ? "/app" : "/handler/sign-up"}
          primaryLabel={user ? "Open app" : "Get verified"}
          secondaryHref="/docs"
          secondaryLabel="All explainers"
        />
        <MarketingFooter />
      </div>
    </>
  );
}
