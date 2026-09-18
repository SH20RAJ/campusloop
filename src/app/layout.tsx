import { HexclaveProvider, HexclaveTheme } from "@hexclave/next";
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { GoogleAnalyticsScripts, GoogleAnalyticsTracker } from "@/components/analytics/google-analytics";
import { ReferralTracker } from "@/components/analytics/referral-tracker";
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
  userScalable: true,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
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
    "campus events",
    "college notes",
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
    creator: "@mycampusloop",
    images: ["https://campusloop.space/og-image.png"],
  },
  category: "social networking",
  classification: "Student Community Platform",
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
    ? {
        verification: {
          ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
            ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
            : {}),
          ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
            ? {
                other: {
                  "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION,
                },
              }
            : {}),
        },
      }
    : {}),
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
        {/* Sitelinks Searchbox Schema for Google SERP */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "CampusLoop",
              alternateName: ["Campus Loop", "CampusLoop App", "CampusLoop Space"],
              url: "https://campusloop.space",
              description: "A campus community platform for verified college students in India.",
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

        {/* Navigation schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: "CampusLoop Navigation Sitelinks",
              itemListElement: [
                {
                  "@type": "SiteNavigationElement",
                  position: 1,
                  name: "Campus Feed",
                  description: "Live campus threads, confessions, polls, and discussions",
                  url: "https://campusloop.space/app",
                },
                {
                  "@type": "SiteNavigationElement",
                  position: 2,
                  name: "Campus Marketplace",
                  description: "Order night canteen snacks, food delivery, and campus essentials",
                  url: "https://campusloop.space/app/marketplace",
                },
                {
                  "@type": "SiteNavigationElement",
                  position: 3,
                  name: "Academic Study Vault & PYQs",
                  description:
                    "Free engineering notes, previous year question papers, formula cheat sheets, and lab manuals",
                  url: "https://campusloop.space/app/academics",
                },
                {
                  "@type": "SiteNavigationElement",
                  position: 4,
                  name: "College Directory",
                  description: "Directory of verified Indian college hubs and campus networks",
                  url: "https://campusloop.space/app/colleges",
                },
                {
                  "@type": "SiteNavigationElement",
                  position: 5,
                  name: "Campus Match",
                  description: "Connect with verified students within your campus radius",
                  url: "https://campusloop.space/app/matching",
                },
                {
                  "@type": "SiteNavigationElement",
                  position: 6,
                  name: "Student Communities",
                  description: "Student-created clubs, technical societies, and hobby spaces",
                  url: "https://campusloop.space/app/communities",
                },
                {
                  "@type": "SiteNavigationElement",
                  position: 7,
                  name: "Campus Confessions",
                  description: "Anonymous confessions and campus thoughts",
                  url: "https://campusloop.space/app/confessions",
                },
                {
                  "@type": "SiteNavigationElement",
                  position: 8,
                  name: "Safety & Safety Rules",
                  description: "Student privacy, data protection, and content moderation rules",
                  url: "https://campusloop.space/safety",
                },
                {
                  "@type": "SiteNavigationElement",
                  position: 9,
                  name: "Feature Docs",
                  description: "Plain-English explainers for every CampusLoop feature",
                  url: "https://campusloop.space/docs",
                },
                {
                  "@type": "SiteNavigationElement",
                  position: 10,
                  name: "About CampusLoop",
                  description: "Learn more about the verified student ecosystem",
                  url: "https://campusloop.space/about",
                },
              ],
            }),
          }}
        />

        {/* WebApplication PWA Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "CampusLoop",
              url: "https://campusloop.space",
              applicationCategory: "SocialNetworkingApplication",
              operatingSystem: "All (Web, Android, iOS)",
              browserRequirements: "Requires JavaScript. Requires HTML5.",
              softwareVersion: "2.0.0",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "INR",
              },
            }),
          }}
        />

        {/* Organization Schema */}
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
                "https://www.linkedin.com/company/mycampusloop/",
                "https://x.com/mycampusloop",
              ],
              description:
                "CampusLoop connects college students across India with verified campus conversations, communities, events, and academic resources.",
            }),
          }}
        />
        <link rel="preconnect" href="https://api.dicebear.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.dicebear.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
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
        <GoogleAnalyticsScripts />
        <HexclaveProvider app={hexclaveServerApp}>
          <HexclaveTheme>
            <SWRProvider>
              <Suspense fallback={null}>
                <ReferralTracker />
                <GoogleAnalyticsTracker />
              </Suspense>
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
