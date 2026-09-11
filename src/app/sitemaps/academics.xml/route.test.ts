import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("Academics Sitemap Route (sitemaps/academics.xml)", () => {
  it("returns a valid XML response with correct headers", async () => {
    const res = await GET();
    expect(res.status).toBe(200);

    const contentType = res.headers.get("content-type");
    expect(contentType).toContain("application/xml");

    const xml = await res.text();
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).toContain("<loc>https://campusloop.space/app/academics</loc>");
    expect(xml).toContain("<priority>1.0</priority>");
    expect(xml).toContain("</urlset>");
  });
});
