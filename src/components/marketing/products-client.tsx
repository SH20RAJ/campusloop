"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Code2,
  Cpu,
  ExternalLink,
  GraduationCap,
  Heart,
  Layers,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react";
import { CompanyNav } from "@/components/marketing/company-nav";
import { MarketingFooter, MarketingHeader } from "@/components/marketing/system";
import { BentoGrid, type BentoItem } from "@/components/ui/bento-grid";
import { ElegantShape } from "@/components/ui/shape-landing-hero";
import { NOTEBOOK_URL, PRODUCTS } from "@/constants/products";
import { cn } from "@/lib/utils";

interface ProductsClientProps {
  isAuthenticated: boolean;
}

export function ProductsClient({ isAuthenticated }: ProductsClientProps) {
  const notebookProduct = PRODUCTS.find((p) => p.id === "notebook")!;
  const appProduct = PRODUCTS.find((p) => p.id === "app")!;

  const productBentoItems: BentoItem[] = [
    {
      id: "app-flagship",
      title: "CampusLoop Social Network",
      description:
        "The verified student-only campus network for 1,350+ Indian colleges. Anonymous confessions, polls, radius feeds, chat, stories, campus match, and peer-to-peer marketplace.",
      icon: <GraduationCap className="size-5 text-[#1D9BF0]" />,
      status: "Flagship",
      meta: "1,350+ Colleges",
      tags: ["Social", "Confessions", "Campus Feed", "P2P Market"],
      colSpan: 2,
      hasPersistentHover: true,
      cta: "Launch App",
      ctaHref: "/app",
      contentNode: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          {appProduct.highlights.map((h, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-foreground/90">
              <Check className="size-3.5 text-emerald-500 shrink-0 stroke-[2.5]" />
              <span>{h}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "campus-match",
      title: "Campus Match & Dating",
      description:
        "Verified campus dating deck filtered strictly by college, batch, and interest graph with zero outsiders.",
      icon: <Heart className="size-5 text-rose-500" />,
      status: "Verified",
      meta: "Mutual Radius",
      tags: ["Dating", "Safe Match", "No Catfish"],
      colSpan: 1,
      cta: "Discover",
      ctaHref: "/app/dating",
    },
    {
      id: "notebook-lab",
      title: "CampusLoop Notebook",
      description:
        "Free browser-based JupyterLab sandbox for verified students. Run Python 3, PyTorch, Pandas, and bash terminal without local configuration.",
      icon: <Terminal className="size-5 text-amber-500" />,
      status: "Free Cloud Sandbox",
      meta: "Zero Install",
      tags: ["Python 3", "JupyterLab", "Terminal", "Pip Packages"],
      colSpan: 2,
      hasPersistentHover: true,
      cta: "Open JupyterLab",
      ctaHref: NOTEBOOK_URL,
      contentNode: (
        <div className="space-y-3 pt-2">
          <div className="rounded-xl border border-border/50 bg-background/90 p-3 font-mono text-[11px] space-y-1.5">
            <div className="flex items-center gap-1.5 text-muted-foreground pb-1 border-b border-border/40">
              <span className="size-2 rounded-full bg-rose-500" />
              <span className="size-2 rounded-full bg-amber-500" />
              <span className="size-2 rounded-full bg-emerald-500" />
              <span className="ml-1 text-[10px]">bash — student@campusloop-sandbox</span>
            </div>
            <p className="text-emerald-500">
              $ <span className="text-foreground">python3 -m pip install torch numpy pandas</span>
            </p>
            <p className="text-muted-foreground">Successfully installed PyTorch, NumPy, Pandas (2.1.0)</p>
            <p className="text-primary">$ jupyter lab --ip=0.0.0.0 --port=8888</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-foreground/90">
            {notebookProduct.highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check className="size-3.5 text-amber-500 shrink-0 stroke-[2.5]" />
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "academics-vault-product",
      title: "Academics Vault",
      description:
        "Crowdsourced previous year papers, lecture notes, syllabus syllabi, and study guides sorted by department and semester.",
      icon: <BookOpen className="size-5 text-purple-500" />,
      status: "Academic Graph",
      meta: "Multi-PDF",
      tags: ["PYQs", "Study Vault", "Fast PDF"],
      colSpan: 1,
      cta: "Browse Vault",
      ctaHref: "/app/academics",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-clip">
      <MarketingHeader isAuthenticated={isAuthenticated} />
      <CompanyNav />

      <main className="flex-1">
        {/* Modern Geometric Hero */}
        <section className="relative w-full overflow-hidden pt-28 pb-16 sm:pt-36 sm:pb-24 border-b border-border/40">
          {/* Ambient Lighting */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-full max-w-5xl -translate-x-1/2 bg-gradient-to-br from-[#1D9BF0]/15 via-purple-600/10 to-transparent blur-3xl" />

          {/* 21st Floating Shapes */}
          <ElegantShape
            delay={0.2}
            width={400}
            height={100}
            rotate={10}
            y={15}
            gradient="from-[#1D9BF0]/25"
            className="left-[-5%] top-[15%]"
          />
          <ElegantShape
            delay={0.4}
            width={320}
            height={80}
            rotate={-12}
            y={12}
            gradient="from-amber-500/20"
            className="right-[-3%] top-[60%]"
          />

          <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3.5 py-1 text-xs font-semibold text-foreground backdrop-blur-md">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[#1D9BF0] font-bold uppercase tracking-wider text-[11px]">
                Product Ecosystem
              </span>
              <span className="text-muted-foreground/40">•</span>
              <span className="text-muted-foreground font-mono text-[11px]">Student-First Technology</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.08] text-foreground">
              Tools Built Exclusively for{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#1D9BF0] via-sky-400 to-indigo-500">
                University Life
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
              From our flagship verified social network to free in-browser JupyterLab compute, discover the
              products empowering 1,350+ Indian colleges.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/app"
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#1D9BF0] hover:bg-[#1D9BF0]/90 px-6 text-sm font-bold text-white shadow-lg shadow-[#1D9BF0]/25 transition-all active:scale-98"
              >
                <span>Launch CampusLoop</span>
                <ArrowRight className="ml-2 size-4" />
              </Link>
              <a
                href={NOTEBOOK_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-full border border-border/60 bg-card/80 hover:bg-muted px-6 text-sm font-bold text-foreground transition-all active:scale-98"
              >
                <span>Open Notebook</span>
                <ArrowUpRight className="ml-2 size-4 text-amber-500" />
              </a>
            </div>
          </div>
        </section>

        {/* 21st Bento Grid Products Section */}
        <section className="py-20 px-4 sm:px-6 bg-muted/10">
          <div className="mx-auto max-w-6xl space-y-10">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#1D9BF0]">
                Interactive Catalogue
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                Explore the Platform Layers
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Every component is crafted specifically for student workflows, research, and campus community.
              </p>
            </div>

            <BentoGrid items={productBentoItems} />
          </div>
        </section>

        {/* Feature Comparison Matrix */}
        <section className="py-20 px-4 sm:px-6 border-t border-border/40">
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="text-center space-y-2">
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#1D9BF0]">
                Architecture Comparison
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                CampusLoop App vs. CampusLoop Notebook
              </h2>
            </div>

            <div className="rounded-2xl border border-border/60 overflow-hidden bg-card/60 backdrop-blur-md shadow-lg">
              <div className="grid grid-cols-3 p-4 bg-muted/40 border-b border-border/40 font-mono text-xs font-bold text-foreground">
                <div>Capability</div>
                <div className="text-center text-[#1D9BF0]">CampusLoop App</div>
                <div className="text-center text-amber-500">CampusLoop Notebook</div>
              </div>

              {[
                { cap: "Primary Focus", app: "Campus Social & Academics", nb: "Python & Data Science" },
                { cap: "Cost to Students", app: "100% Free", nb: "100% Free" },
                { cap: "Authentication", app: "College Email Verification", nb: "Browser-based Sandbox" },
                { cap: "Mobile Friendly", app: "Full PWA & Responsive Web", nb: "Desktop / Tablet Recommended" },
                { cap: "Compute & Storage", app: "Cloud Postgres & Qdrant", nb: "Personal Sandbox Storage" },
                { cap: "Availability", app: "1,350+ Indian Colleges", nb: "Public Beta for All Students" },
              ].map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-3 p-4 border-b border-border/20 last:border-0 text-xs sm:text-sm items-center hover:bg-muted/20 transition-colors"
                >
                  <div className="font-medium text-foreground">{row.cap}</div>
                  <div className="text-center text-muted-foreground font-mono text-xs">{row.app}</div>
                  <div className="text-center text-muted-foreground font-mono text-xs">{row.nb}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
