/**
 * IndexNow Batch Submission Script for CampusLoop
 * Submits all pages, colleges, posts, communities, and student profiles directly to IndexNow (Bing/Yandex/Seznam).
 */

const INDEXNOW_KEY = "ff35ddf54af340798feb9034fcd9d317";
const HOST = "campusloop.space";
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

async function runIndexNowSubmission() {
  console.log("🚀 Triggering IndexNow submission via production API...");

  try {
    const apiRes = await fetch(`https://${HOST}/api/indexnow`, {
      headers: { "User-Agent": "CampusLoop-IndexNow-Client/1.0" },
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      console.log("✅ Production API IndexNow Response:", data);
      return;
    }
  } catch {
    console.log("Fallback: Submitting core URLs directly to IndexNow...");
  }

  const coreUrls = [
    `https://${HOST}/`,
    `https://${HOST}/about`,
    `https://${HOST}/contact`,
    `https://${HOST}/join`,
    `https://${HOST}/privacy`,
    `https://${HOST}/safety`,
    `https://${HOST}/colleges`,
    `https://${HOST}/pitch`,
    `https://${HOST}/sitemap.xml`,
    `https://${HOST}/sitemaps/colleges.xml`,
    `https://${HOST}/sitemaps/posts.xml`,
    `https://${HOST}/sitemaps/communities.xml`,
    `https://${HOST}/sitemaps/profiles.xml`,
  ];

  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: coreUrls,
  };

  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });

  console.log(`IndexNow Engine Direct Submission: Status ${res.status} ${res.statusText}`);
  if (res.status === 200 || res.status === 202) {
    console.log(`✅ Successfully submitted core URLs to IndexNow engine!`);
  }
}

runIndexNowSubmission().catch(console.error);
