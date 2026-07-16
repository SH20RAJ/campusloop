import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { HexclaveProvider, HexclaveTheme } from "@hexclave/next";
import { hexclaveServerApp } from "@/hexclave/server";
import { cn } from "@/lib/utils";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "CampusLoop — Your Verified Campus Social Network",
    template: "%s — CampusLoop",
  },
  description:
    "Join your real campus. Speak freely. Stay safe. CampusLoop is the verified student-only social network gatekept by college email. Share confessions, drop polls, and connect with students across Indian colleges.",
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
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "CampusLoop — Your Verified Campus Social Network",
    description:
      "Join your real campus. Speak freely. Stay safe. Meet students like you.",
    type: "website",
    locale: "en_IN",
    siteName: "CampusLoop",
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusLoop — Your Verified Campus Social Network",
    description:
      "Join your real campus. Speak freely. Stay safe. Meet students like you.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", outfit.variable)}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
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
            `
          }}
        />
      </head>
      <body className="antialiased">
        <HexclaveProvider app={hexclaveServerApp}>
          <HexclaveTheme>{children}</HexclaveTheme>
        </HexclaveProvider>
      </body>
    </html>
  );
}
