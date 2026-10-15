// Pulls every page/post from the WordPress REST API into wp-export/
// Usage: node scripts/fetch-wp.mjs
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = 'https://atlasaircons.com/wp-json/wp/v2';
const OUT = 'wp-export';
const TYPES = ['pages', 'posts'];

async function fetchAll(type) {
  const items = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`${BASE}/${type}?per_page=100&page=${page}&status=publish`);
    if (res.status === 400) break; // past last page
    if (!res.ok) throw new Error(`${type} p${page}: ${res.status}`);
    const batch = await res.json();
    items.push(...batch);
    const total = Number(res.headers.get('x-wp-totalpages') || 1);
    console.log(`${type}: page ${page}/${total} (${items.length} so far)`);
    if (page >= total) break;
  }
  return items;
}

await fs.mkdir(OUT, { recursive: true });
const urlMap = [];

for (const type of TYPES) {
  const items = await fetchAll(type);
  await fs.writeFile(path.join(OUT, `${type}.json`), JSON.stringify(items, null, 2));
  for (const it of items) {
    const p = new URL(it.link).pathname;
    urlMap.push({ type, id: it.id, path: p, slug: it.slug, title: it.title.rendered });
    const file = path.join(OUT, type, ...(p.split('/').filter(Boolean).length ? p.split('/').filter(Boolean) : ['home']), 'index.json');
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(it, null, 2));
  }
}

await fs.writeFile(path.join(OUT, 'url-map.json'), JSON.stringify(urlMap, null, 2));
await fs.writeFile(path.join(OUT, 'urls.txt'), urlMap.map(u => u.path).join('\n') + '\n');
console.log(`Done. ${urlMap.length} URLs saved to ${OUT}/urls.txt`);
