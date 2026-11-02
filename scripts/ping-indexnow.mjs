// Submits all live sitemap URLs to IndexNow (Bing, Yahoo, Microsoft Copilot, ChatGPT Search, Yandex, Naver, Seznam).
// Usage: node scripts/ping-indexnow.mjs
import fs from 'node:fs';
import path from 'node:path';

const HOST = 'www.atlasaircons.com';
const KEY = '4e8b2c9f1a6d43759b0e3f7a2c8d1e5b';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const DIST = path.resolve('dist');

const indexXml = fs.readFileSync(path.join(DIST, 'sitemap-index.xml'), 'utf8');
const childFiles = [...indexXml.matchAll(/<loc>https:\/\/www\.atlasaircons\.com\/([^<]+)<\/loc>/g)].map((m) => m[1]);

const allUrls = [];
for (const f of childFiles) {
  const xml = fs.readFileSync(path.join(DIST, f), 'utf8');
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    allUrls.push(m[1].trim());
  }
}

console.log(`Submitting ${allUrls.length} URLs to IndexNow...`);

// IndexNow accepts up to 10,000 URLs per POST request
const res = await fetch('https://api.indexnow.org/IndexNow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: allUrls,
  }),
});

console.log(`IndexNow response: HTTP ${res.status} ${res.statusText}`);
if (res.status >= 400) {
  console.error(await res.text());
  process.exit(1);
}

