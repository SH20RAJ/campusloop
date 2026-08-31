import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  experimental: {
    staleTimes: {
      dynamic: 180,
      static: 600,
    },
    // ── Build memory budget ──
    // This is a ~690-file app and the webpack production build used to be
    // SIGKILLed by the OS on 8 GB machines. These three settings cut peak RSS:
    // the first frees webpack's cached module sources between compilations,
    // the second moves each compilation into its own short-lived worker so its
    // heap is reclaimed on exit, and the third sizes the static-generation
    // worker pool from free memory instead of the CPU count.
    webpackMemoryOptimizations: true,
    webpackBuildWorker: true,
    memoryBasedWorkersCount: true,
    optimizePackageImports: [

      "lucide-react",
      "framer-motion",
      "motion",
      "date-fns",
      "@tiptap/react",
      "@tiptap/starter-kit",
      "sonner",
      "swr",
      "@radix-ui/react-icons",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "media.giphy.com" },
      { protocol: "https", hostname: "i.giphy.com" },
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/c/:id",
        destination: "/app/communities/:id",
        permanent: true,
      },
    ];
  },
};


export default nextConfig;
