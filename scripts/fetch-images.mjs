// Downloads every <img src> used in the WP content into public/ (same /wp-content/uploads/... path).
// Usage: node scripts/fetch-images.mjs      (safe to re-run; skips existing files)
import fs from 'node:fs/promises';
import path from 'node:path';

const ORIGIN = 'https://www.atlasaircons.com';
const items = [
  ...JSON.parse(await fs.readFile('wp-export/pages.json', 'utf8')),
  ...JSON.parse(await fs.readFile('wp-export/posts.json', 'utf8')),
];

const urls = new Set();
for (const it of items) {
  for (const m of it.content.rendered.matchAll(/<img[^>]+?\ssrc=["']([^"']+)["']/gi)) {
    const u = m[1].replace(/&#0*38;|&amp;/g, '&');
    const p = u.replace(/^https?:\/\/(www\.)?atlasaircons\.com/i, '');
    if (p.startsWith('/wp-content/')) urls.add(p.split('?')[0]);
  }
}
const list = [...urls];
console.log(`${list.length} unique images`);

const failed = [];
let done = 0, skipped = 0, bytes = 0;
async function one(p) {
  const file = path.join('public', decodeURIComponent(p));
  try { await fs.access(file); skipped++; return; } catch {}
  for (let a = 0; a < 3; a++) {
    try {
      const res = await fetch(ORIGIN + p);
      if (!res.ok) throw new Error(res.status);
      const buf = Buffer.from(await res.arrayBuffer());
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, buf);
      bytes += buf.length;
      return;
    } catch { await new Promise(r => setTimeout(r, 800)); }
  }
  failed.push(p);
}

const queue = [...list];
await Promise.all(Array.from({ length: 10 }, async () => {
  while (queue.length) {
    await one(queue.shift());
    if (++done % 200 === 0) console.log(`${done}/${list.length} (${(bytes / 1e6).toFixed(0)} MB)`);
  }
}));

await fs.writeFile('wp-export/images-failed.json', JSON.stringify(failed, null, 2));
console.log(`Done. downloaded ${(bytes / 1e6).toFixed(0)} MB, skipped ${skipped}, failed ${failed.length}`);
