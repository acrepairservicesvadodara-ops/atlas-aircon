// Scrapes <title>, meta description, robots and canonical from every live page
// so SEO matches exactly. Output: wp-export/seo.json (keyed by URL path)
// Usage: node scripts/fetch-seo.mjs
import fs from 'node:fs/promises';

const ORIGIN = 'https://www.atlasaircons.com';
const paths = (await fs.readFile('wp-export/urls.txt', 'utf8')).split('\n').filter(Boolean);
const dec = (s = '') =>
  s.replace(/&#0*38;|&amp;/g, '&').replace(/&#0*39;|&#8217;/g, "'").replace(/&quot;|&#8220;|&#8221;/g, '"').replace(/&#8211;/g, '-').trim();

const meta = (html, re) => dec((html.match(re) || [])[1]);
const seo = {};
let done = 0, failed = [];

async function one(p) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(ORIGIN + p, { headers: { 'user-agent': 'Mozilla/5.0 migration-seo' } });
      if (!res.ok) throw new Error(res.status);
      const head = (await res.text()).split('</head>')[0];
      const robots = meta(head, /<meta name=["']robots["'] content=["']([^"']*)/i);
      seo[p] = {
        title: meta(head, /<title[^>]*>([^<]*)<\/title>/i),
        description: meta(head, /<meta name=["']description["'] content=["']([^"']*)/i) || undefined,
        canonical: meta(head, /<link rel=["']canonical["'] href=["']([^"']*)/i) || undefined,
        noindex: /noindex/i.test(robots) || undefined,
      };
      return;
    } catch (e) { await new Promise(r => setTimeout(r, 1000)); }
  }
  failed.push(p);
}

const queue = [...paths];
await Promise.all(Array.from({ length: 8 }, async () => {
  while (queue.length) {
    await one(queue.shift());
    if (++done % 50 === 0) console.log(`${done}/${paths.length}`);
  }
}));

await fs.writeFile('wp-export/seo.json', JSON.stringify(seo, null, 2));
console.log(`Done. ${Object.keys(seo).length} ok, ${failed.length} failed`, failed);
