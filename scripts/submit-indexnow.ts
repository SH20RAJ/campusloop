/**
 * IndexNow Batch Submission Script for CampusLoop
 * Submits all pages, colleges, posts, communities, and student profiles directly to IndexNow (Bing/Yandex/Seznam).
 */

const INDEXNOW_KEY = "ff35ddf54af340798feb9034fcd9d317";
const HOST = "campusloop.space";
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;
const SITEMAP_INDEX_URL = `https://${HOST}/sitemap.xml`;

async function fetchUrlsFromXml(xmlUrl: string): Promise<string[]> {
  try {
    const res = await fetch(xmlUrl);
    if (!res.ok) return [];
    const text = await res.text();

    const urls: string[] = [];
    const locMatches = text.match(/<loc>(.*?)<\/loc>/g);
    if (locMatches) {
      for (const m of locMatches) {
        const url = m.replace("<loc>", "").replace("</loc>", "").trim();
        urls.push(url);
      }
    }
    return urls;
  } catch (err) {
    console.error(`Failed to fetch sitemap ${xmlUrl}:`, err);
    return [];
  }
}

async function runIndexNowSubmission() {
  console.log("🔍 Fetching sitemap index from CampusLoop...");

  const subSitemaps = await fetchUrlsFromXml(SITEMAP_INDEX_URL);
  console.log(`Found ${subSitemaps.length} sitemaps:`, subSitemaps);

  let allUrls: string[] = [
    `https://${HOST}/`,
    `https://${HOST}/about`,
    `https://${HOST}/contact`,
    `https://${HOST}/join`,
    `https://${HOST}/privacy`,
    `https://${HOST}/safety`,
    `https://${HOST}/colleges`,
    `https://${HOST}/pitch`,
  ];

  for (const sitemapUrl of subSitemaps) {
    if (sitemapUrl.endsWith(".xml")) {
      console.log(`Extracting URLs from ${sitemapUrl}...`);
      const pageUrls = await fetchUrlsFromXml(sitemapUrl);
      allUrls.push(...pageUrls);
    }
  }

  // Remove duplicates
  allUrls = Array.from(new Set(allUrls));
  console.log(`✨ Total unique URLs ready for IndexNow submission: ${allUrls.length}`);

  if (allUrls.length === 0) {
    console.warn("No URLs found to submit.");
    return;
  }

  // IndexNow batch submission limits: max 10,000 URLs per HTTP POST
  const batchSize = 10000;
  for (let i = 0; i < allUrls.length; i += batchSize) {
    const batch = allUrls.slice(i, i + batchSize);
    console.log(`Submitting batch ${Math.floor(i / batchSize) + 1} (${batch.length} URLs)...`);

    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: batch,
    };

    try {
      const res = await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      console.log(`IndexNow Response Status: ${res.status} ${res.statusText}`);
      if (res.status === 200 || res.status === 202) {
        console.log(`✅ Successfully submitted ${batch.length} URLs to IndexNow!`);
      } else {
        const errText = await res.text();
        console.error(`IndexNow submission response:`, errText);
      }
    } catch (err) {
      console.error("IndexNow request error:", err);
    }
  }
}

runIndexNowSubmission().catch(console.error);
