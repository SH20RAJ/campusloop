"use client";

import { ArrowRight, ArrowUpRight, Check, FlaskConical, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { NOTEBOOK_URL, PRODUCTS } from "@/constants/products";
import { cn } from "@/lib/utils";

const PRODUCT_ICONS: Record<string, typeof FlaskConical> = {
  notebook: FlaskConical,
  app: LayoutGrid,
};

export function ProductsClient() {
  return (
    <div className="space-y-10">
      <div className="grid gap-4 md:grid-cols-2">
        {PRODUCTS.map((product) => {
          const Icon = PRODUCT_ICONS[product.id] ?? LayoutGrid;
          return (
            <article
              key={product.id}
              className="group flex flex-col rounded-2xl border border-border/70 bg-card p-6 shadow-xs transition-colors hover:border-primary/40"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <div className="flex items-center gap-1.5">
                  {product.badge && (
                    <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold tracking-wide text-primary-foreground uppercase">
                      {product.badge}
                    </span>
                  )}
                  <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
                    {product.price}
                  </span>
                </div>
              </div>

              <h2 className="mt-4 text-xl font-bold tracking-tight">{product.name}</h2>
              <p className="mt-0.5 text-sm font-semibold text-primary">{product.tagline}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

              <ul className="mt-4 space-y-2">
                {product.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2 text-sm text-foreground/90">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-xs font-medium text-muted-foreground">Built for: {product.audience}</p>

              <div className="mt-5 flex flex-wrap items-center gap-2 pt-1">
                {product.external ? (
                  <a
                    href={product.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
                  >
                    Launch Notebook
                    <ArrowUpRight className="size-3.5" />
                  </a>
                ) : (
                  <Link href={product.href} className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}>
                    Explore the app
                    <ArrowRight className="size-3.5" />
                  </Link>
                )}
                {product.id === "notebook" && (
                  <span className="font-mono text-[11px] text-muted-foreground break-all">
                    {NOTEBOOK_URL}
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border/70 bg-muted/30 p-6 text-center">
        <h2 className="text-lg font-bold">More student tools are on the way.</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Notebook is the first standalone product outside the main app. New drops will appear here first.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Link href="/about" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            About CampusLoop
          </Link>
          <a
            href={NOTEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1")}
          >
            Open Notebook directly
            <ArrowUpRight className="size-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
