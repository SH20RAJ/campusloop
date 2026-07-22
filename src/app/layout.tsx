import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { HexclaveProvider, HexclaveTheme } from "@hexclave/next";
import { hexclaveServerApp } from "@/hexclave/server";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL("https://campusloop.space"),
  title: {
    default: "CampusLoop | Your Verified Campus Social Network",
    template: "%s | CampusLoop",
  },
  description:
    "Join your real campus. Speak freely. Stay safe. CampusLoop is the verified student-only social network gatekept by college email. Share confessions, drop polls, and connect with students across Indian colleges.",
  applicationName: "CampusLoop",
  authors: [{ name: "CampusLoop Team", url: "https://campusloop.space/about" }],
  generator: "Next.js",
  keywords: [
    "campus social network",
    "college confessions",
    "anonymous posting",
    "student community",
    "college polls",
    "campus matches",
    "verified student",
    "Indian college students",
    "campus gossip",
    "college dating",
  ],
  referrer: "origin-when-cross-origin",
  creator: "CampusLoop Inc.",
  publisher: "CampusLoop Inc.",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/logo.png",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://campusloop.space",
    types: {
      "application/rss+xml": "https://campusloop.space/feed.xml",
    },
  },
  openGraph: {
    title: "CampusLoop | Your Verified Campus Social Network",
    description:
      "Join your real campus. Speak freely. Stay safe. Meet students like you. Share confessions, run polls, and connect securely.",
    url: "https://campusloop.space",
    siteName: "CampusLoop",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "CampusLoop Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusLoop | Your Verified Campus Social Network",
    description:
      "Join your real campus. Speak freely. Stay safe. Meet students like you. Share confessions, run polls, and connect securely.",
    creator: "@campusloop",
    images: ["/logo.png"],
  },
  category: "social networking",
  classification: "Student Community Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", outfit.variable)} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f97316" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "CampusLoop",
              url: "https://campusloop.space",
              description: "The verified student-only social network for Indian colleges.",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://campusloop.space/app/search?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "CampusLoop",
              url: "https://campusloop.space",
              logo: "https://campusloop.space/logo.png",
              sameAs: ["https://twitter.com/campusloop", "https://instagram.com/campusloop"],
              description: "CampusLoop connects students across 1,350+ Indian colleges with verified campus feeds, confessions, dating matches, and sub-hubs.",
            }),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('cl_theme') === 'dark' || (!localStorage.getItem('cl_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
              
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration failed:', err));
                });
              }
            `
          }}
        />
      </head>
      <body className="antialiased">
        <HexclaveProvider app={hexclaveServerApp}>
          <HexclaveTheme>
            {children}
            <Toaster position="top-center" richColors />
          </HexclaveTheme>
        </HexclaveProvider>
      </body>
    </html>
  );
}
