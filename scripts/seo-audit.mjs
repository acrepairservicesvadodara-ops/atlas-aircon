// SEO evidence collector for dist/ (read-only). Usage: node scripts/seo-audit.mjs
import fs from 'node:fs';
import path from 'node:path';

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const files = walk('dist').filter(f => f.endsWith('index.html'));
const urlOf = f => '/' + path.relative('dist', path.dirname(f)).replace(/\\/g, '/') + (path.relative('dist', path.dirname(f)) ? '/' : '');
const set = new Set(files.map(urlOf));
const wp = new Set(fs.readFileSync('wp-export/urls.txt', 'utf8').split('\n').filter(Boolean).map(decodeURIComponent));

const pages = files.map(f => {
  const h = fs.readFileSync(f, 'utf8');
  const g = (re) => (h.match(re) || [])[1];
  const body = h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');
  const main = (h.match(/<main[\s\S]*?<\/main>/) || [''])[0].replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');
  const links = [...h.matchAll(/<a [^>]*href="([^"#?]+)/g)].map(m => m[1]);
  return {
    url: urlOf(f), wp: wp.has(urlOf(f)),
    title: g(/<title>([^<]*)/), desc: g(/<meta name="description" content="([^"]*)/),
    canonical: g(/<link rel="canonical" href="([^"]*)/),
    h1: (h.match(/<h1[\s>]/g) || []).length,
    ldCount: (h.match(/application\/ld\+json/g) || []).length,
    hasRating: /aggregateRating/.test(h),
    robots: g(/<meta name="robots" content="([^"]*)/),
    words: main.split(/\s+/).filter(Boolean).length,
    mainText: main.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean),
    links, oldImgs: (h.match(/src="https:\/\/(www\.)?atlasaircons\.com\/wp-content/g) || []).length,
    imgNoAlt: (h.match(/<img(?![^>]*\balt=)[^>]*>/g) || []).length,
  };
});

const wpPages = pages.filter(p => p.wp);
const dupe = (k) => { const m = {}; pages.forEach(p => p[k] && (m[p[k]] = (m[p[k]] || 0) + 1)); return Object.entries(m).filter(([, n]) => n > 1); };
const buckets = (arr) => ({ '<150': arr.filter(x => x < 150).length, '150-300': arr.filter(x => x >= 150 && x < 300).length, '300-600': arr.filter(x => x >= 300 && x < 600).length, '600+': arr.filter(x => x >= 600).length });

console.log('PAGES total', pages.length, '| wp-migrated', wpPages.length);
console.log('missing title', pages.filter(p => !p.title).length, '| missing desc', pages.filter(p => !p.desc).length);
console.log('dup titles (groups)', dupe('title').length, 'e.g.', dupe('title').slice(0, 3));
console.log('dup desc (groups)', dupe('desc').length);
console.log('h1 != 1', pages.filter(p => p.h1 !== 1).length, pages.filter(p => p.h1 !== 1).slice(0, 5).map(p => p.url + ':' + p.h1));
console.log('canonical missing', pages.filter(p => !p.canonical).length, '| canonical != self', pages.filter(p => p.canonical && p.canonical !== 'https://www.atlasaircons.com' + p.url).length);
console.log('JSON-LD blocks per page (wp pages)', [...new Set(wpPages.map(p => p.ldCount))]);
console.log('pages with aggregateRating', pages.filter(p => p.hasRating).length);
console.log('noindex', pages.filter(p => /noindex/.test(p.robots || '')).length);
console.log('WORD COUNT (wp pages)', buckets(wpPages.map(p => p.words)), 'median', wpPages.map(p => p.words).sort((a, b) => a - b)[Math.floor(wpPages.length / 2)]);

// internal links
const broken = {}; let total = 0, htmlLinks = 0;
for (const p of pages) for (const l of p.links) {
  if (!l.startsWith('/') && !/^https?:\/\/(www\.)?atlasaircons\.com/.test(l)) continue;
  total++; let u = l.replace(/^https?:\/\/(www\.)?atlasaircons\.com/, '') || '/';
  if (/\.html?$/.test(u)) htmlLinks++;
  const n = decodeURIComponent(u.endsWith('/') ? u : u + '/');
  if (!set.has(n) && !fs.existsSync('dist' + decodeURIComponent(u)) ) (broken[u] = broken[u] || []).push(p.url);
}
const bk = Object.entries(broken).sort((a, b) => b[1].length - a[1].length);
console.log('INTERNAL links', total, '| .html links', htmlLinks, '| unique broken targets', bk.length, '| broken link instances', bk.reduce((s, [, v]) => s + v.length, 0));
console.log('top broken', bk.slice(0, 12).map(([u, v]) => `${u} (${v.length})`));

// orphan check
const linked = new Set(); pages.forEach(p => p.links.forEach(l => linked.add(decodeURIComponent((l.replace(/^https?:\/\/(www\.)?atlasaircons\.com/, '') || '/')))));
const orphans = wpPages.filter(p => !linked.has(p.url) && !linked.has(p.url.slice(0, -1)) && p.url !== '/');
console.log('ORPHAN wp pages (no internal link in)', orphans.length);

console.log('IMAGES on old WP domain', pages.reduce((s, p) => s + p.oldImgs, 0), '| img without alt', pages.reduce((s, p) => s + p.imgNoAlt, 0));

// near-duplicate detection among city/service pages
const sh = (t) => { const s = new Set(); for (let i = 0; i < t.length - 7; i++) s.add(t.slice(i, i + 8).join(' ')); return s; };
const cand = wpPages.filter(p => p.words > 100);
const pat = {}; cand.forEach(p => { const k = p.url.replace(/-(in|at)-.*$/, '-$1-X').replace(/-(vadodara|anand|valsad|bharuch|surat|ahmedabad)\/$/, '-CITY/'); (pat[k] = pat[k] || []).push(p); });
const groups = Object.entries(pat).filter(([, v]) => v.length >= 8).sort((a, b) => b[1].length - a[1].length).slice(0, 6);
console.log('TEMPLATE GROUPS (>=8 pages)');
for (const [k, v] of groups) {
  const a = sh(v[0].mainText); let sims = [];
  for (let i = 1; i < Math.min(v.length, 8); i++) { const b = sh(v[i].mainText); let inter = 0; a.forEach(x => b.has(x) && inter++); sims.push(Math.round(100 * inter / (a.size + b.size - inter))); }
  console.log(' ', k, 'pages', v.length, 'avgWords', Math.round(v.reduce((s, p) => s + p.words, 0) / v.length), 'shingle-similarity vs first (%)', sims.join(','));
}
