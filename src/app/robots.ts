import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/app/settings", "/handler/"],
    },
    sitemap: "https://campusloop.space/sitemap.xml",
  };
}
