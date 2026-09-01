import { HexclaveProvider, HexclaveTheme } from "@hexclave/next";
import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { SWRProvider } from "@/components/providers/swr-provider";
import { PWAInstallBanner } from "@/components/pwa/pwa-install-banner";
import { OfflineIndicator } from "@/components/ui/offline-indicator";
import { RouteProgress } from "@/components/ui/route-progress";
import { hexclaveServerApp } from "@/hexclave/server";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CampusLoop",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" }],
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
        url: "https://campusloop.space/og-image.png",
        width: 1200,
        height: 630,
        alt: "CampusLoop — Your Verified Campus Social Network",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusLoop | Your Verified Campus Social Network",
    description:
      "Join your real campus. Speak freely. Stay safe. Meet students like you. Share confessions, run polls, and connect securely.",
    creator: "@campusloop",
    images: ["https://campusloop.space/og-image.png"],
  },
  category: "social networking",
  classification: "Student Community Platform",
  other: {
    "geo.region": "IN",
    "geo.placename": "India",
    "geo.position": "20.5937;78.9629",
    ICBM: "20.5937, 78.9629",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className="font-sans antialiased" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://skill.hexclave.com" />
        <link rel="dns-prefetch" href="https://api.dicebear.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="author" href="/humans.txt" />
        <link rel="help" href="/llms.txt" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="CampusLoop" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#09090b" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        <meta name="geo.position" content="20.5937;78.9629" />
        <meta name="ICBM" content="20.5937, 78.9629" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "CampusLoop",
              url: "https://campusloop.space",
              description: "The verified student-only social network for 1,350+ Indian colleges.",
              inLanguage: "en-IN",
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
              areaServed: {
                "@type": "Country",
                name: "India",
              },
              sameAs: [
                "https://www.instagram.com/campusloop.space/",
                "https://www.linkedin.com/company/mycampusloop/?viewAsMember=true",
                "https://x.com/company/mycampusloop/",
              ],
              description:
                "CampusLoop connects students across 1,350+ Indian colleges with verified campus feeds, confessions, dating matches, and sub-hubs.",
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
                  navigator.serviceWorker.register('/sw.js').catch(err => console.error('SW registration failed:', err));
                });
              }
            `,
          }}
        />
      </head>
      <body className="antialiased font-sans">
        <HexclaveProvider app={hexclaveServerApp}>
          <HexclaveTheme>
            <SWRProvider>
              <RouteProgress />
              <OfflineIndicator />
              {children}
              <PWAInstallBanner />
              <Toaster position="top-center" richColors />
            </SWRProvider>
          </HexclaveTheme>
        </HexclaveProvider>
      </body>
    </html>
  );
}
