import { execSync } from "node:child_process";

interface RedditPost {
  subreddit: string;
  title: string;
  author: string;
  content: string;
  imageUrl?: string;
  link: string;
}

export function fetchSubredditPosts(subreddit: string): RedditPost[] {
  try {
    const rawXml = execSync(
      `curl -s -L -A "CampusLoopFeed/1.0 (Student Campus Network)" "https://www.reddit.com/r/${subreddit}/.rss"`,
      { maxBuffer: 10 * 1024 * 1024, encoding: "utf-8" }
    );

    const results: RedditPost[] = [];
    const entries = rawXml.split("<entry>").slice(1);

    for (const entry of entries) {
      const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
      const authorMatch = entry.match(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>/);
      const contentMatch = entry.match(/<content type="html">([\s\S]*?)<\/content>/);
      const linkMatch = entry.match(/<link href="([\s\S]*?)"/);

      if (!titleMatch) continue;

      let title = titleMatch[1]
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .trim();

      const author = authorMatch
        ? authorMatch[1].replace(/^\/u\//, "").trim()
        : "student";

      let rawContent = contentMatch ? contentMatch[1] : "";
      
      // Look for image in content: i.redd.it or preview.redd.it
      let imageUrl: string | undefined;
      const imgMatch = rawContent.match(/https:\/\/(i\.redd\.it|preview\.redd\.it)\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)/i);
      if (imgMatch) {
        imageUrl = imgMatch[0];
      }

      // Clean HTML from content to get plain text
      let textContent = rawContent
        .replace(/<[^>]+>/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\[link\]/g, "")
        .replace(/\[comments\]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      // Remove auto-generated reddit footer
      textContent = textContent.replace(/submitted by.*$/i, "").trim();

      results.push({
        subreddit,
        title,
        author,
        content: textContent,
        imageUrl,
        link: linkMatch ? linkMatch[1] : `https://reddit.com/r/${subreddit}`,
      });
    }

    return results;
  } catch (err) {
    console.error(`Failed to fetch r/${subreddit}:`, err);
    return [];
  }
}

// Quick CLI runner
if (import.meta.main) {
  for (const sub of ["Btechtards", "JEENEETards", "ProgrammerHumor"]) {
    const posts = fetchSubredditPosts(sub);
    console.log(`\n=== r/${sub} (${posts.length} posts) ===`);
    for (const p of posts.slice(0, 4)) {
      console.log(`- [${p.imageUrl ? "IMAGE" : "TEXT"}] ${p.title} (by @${p.author})`);
      if (p.imageUrl) console.log(`  img: ${p.imageUrl}`);
    }
  }
}
