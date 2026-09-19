/**
 * CampusLoop product catalogue.
 * Displayed on the public /products page and linked from the marketing footer.
 */

export const NOTEBOOK_URL = "https://notebook.campusloop.space/";
export const OBSERVATORY_URL = "https://observatory.campusloop.space";

export type ProductInfo = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  href: string;
  external?: boolean;
  badge?: string;
  price: string;
  audience: string;
  highlights: string[];
};

export const PRODUCTS: ProductInfo[] = [
  {
    id: "notebook",
    name: "CampusLoop Notebook",
    tagline: "Free JupyterLab sessions for students",
    description:
      "A free, browser-based JupyterLab environment for CampusLoop students. Write and run Python notebooks, work with files in a personal sandbox, and drop into a full terminal — no installation, no setup, just open the link and start coding.",
    href: NOTEBOOK_URL,
    external: true,
    badge: "New",
    price: "Free for students",
    audience: "Verified CampusLoop students",
    highlights: [
      "JupyterLab workspace with notebooks, files, and terminals",
      "Python notebooks with persistent personal sandbox",
      "Full terminal access for git, pip, and CLI workflows",
      "Runs entirely in the browser — nothing to install",
    ],
  },
  {
    id: "app",
    name: "CampusLoop App",
    tagline: "The verified student-only campus network",
    description:
      "The flagship CampusLoop platform for 1,350+ Indian colleges: anonymous confessions, polls, campus and global feeds, stories, chat, campus match, communities, marketplace, and the academics vault — all gated by college email verification.",
    href: "/overview",
    badge: "Flagship",
    price: "Free for verified students",
    audience: "Students at 1,350+ Indian colleges",
    highlights: [
      "Campus feed with confessions, polls, and reposts",
      "Stories, chat, campus match, and secret crush",
      "Communities, marketplace, events, and academics vault",
      "Loop Points reputation and verified-star tiers",
    ],
  },
  {
    id: "observatory",
    name: "Digital Observatory",
    tagline: "Open-source research on digital systems and the web",
    description:
      "An open-source research publication for tracking, explaining, and contextualizing important developments across technology, the internet, AI, platforms, and digital infrastructure — with a strong focus on sources and provenance.",
    href: OBSERVATORY_URL,
    external: true,
    badge: "Open Source",
    price: "Free & public",
    audience: "Researchers, developers, students, and curious builders",
    highlights: [
      "Research-driven articles with source and provenance context",
      "Open-source, Markdown-first publishing architecture",
      "SEO-friendly static publishing with RSS and machine-readable feeds",
      "Built for transparent, community-friendly technical research",
    ],
  },
];
