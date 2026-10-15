// Automated SEO regression tests over the built site (dist/).
// Usage: npm run build && npm run test:seo
// FAIL = confirmed defect (exit code 1). WARN = heuristic / needs human review.
import fs from 'node:fs';
import path from 'node:path';

const ORIGIN = 'https://www.atlasaircons.com';
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const results = [];
const check = (level, name, bad, detail = []) => results.push({ level: bad.length ? level : 'PASS', name, count: bad.length, sample: [...bad, ...detail].slice(0, 6) });

// ---------- load pages ----------
const pages = [];
for (const f of walk('dist').filter(f => f.endsWith('index.html'))) {
  const rel = path.relative('dist', path.dirname(f)).replace(/\\/g, '/');
  const url = rel ? `/${rel}/` : '/';
  const h = fs.readFileSync(f, 'utf8');
  const g = (re) => (h.match(re) || [])[1];
  const redirect = /http-equiv="refresh"/.test(h);
  const main = (h.match(/<main[\s\S]*?<\/main>/) || [h])[0].replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '');
  const text = main.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/g, ' ').toLowerCase();
  const words = text.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  pages.push({
    url, redirect, h, words,
    title: g(/<title>([^<]*)/), desc: g(/<meta name="description" content="([^"]*)/),
    canonical: g(/<link rel="canonical" href="([^"]*)/), robots: g(/<meta name="robots" content="([^"]*)/) || '',
    h1: (h.match(/<h1[\s>]/g) || []).length,
    ld: [...h.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]),
    links: [...h.matchAll(/<a [^>]*href="([^"#?]+)/g)].map(m => m[1]),
  });
}
const real = pages.filter(p => !p.redirect);
const indexable = real.filter(p => !/noindex/.test(p.robots) && p.url !== '/404/');
const urlSet = new Set(pages.map(p => p.url));

// ---------- confirmed checks ----------
check('FAIL', 'Missing <title>', real.filter(p => !p.title).map(p => p.url));
check('FAIL', 'Canonical missing', indexable.filter(p => !p.canonical).map(p => p.url));
check('FAIL', 'Canonical not on production domain', indexable.filter(p => p.canonical && !p.canonical.startsWith(ORIGIN + '/')).map(p => `${p.url} -> ${p.canonical}`));
check('FAIL', 'Canonical points to non-existent URL', indexable.filter(p => p.canonical && p.canonical.startsWith(ORIGIN) && !urlSet.has(decodeURIComponent(p.canonical.slice(ORIGIN.length)))).map(p => `${p.url} -> ${p.canonical}`));
check('FAIL', 'Canonical differs from own URL (non-redirect)', indexable.filter(p => p.canonical && decodeURIComponent(p.canonical) !== ORIGIN + p.url).map(p => `${p.url} -> ${p.canonical}`));
check('FAIL', 'Page does not have exactly one <h1> (non-redirect)', indexable.filter(p => p.h1 !== 1).map(p => `${p.url} (${p.h1})`));
check('FAIL', 'Internal link points to a missing page', (() => { const bad = new Set(); for (const p of real) for (const l of p.links) { if (!l.startsWith('/') && !l.startsWith(ORIGIN)) continue; const u = decodeURIComponent((l.replace(ORIGIN, '') || '/')); if (/\.[a-z0-9]{2,5}$/i.test(u)) { if (!fs.existsSync('dist' + u)) bad.add(`${u} (from ${p.url})`); } else if (!urlSet.has(u.endsWith('/') ? u : u + '/')) bad.add(`${u} (from ${p.url})`); } return [...bad]; })());
check('FAIL', 'Invalid JSON-LD syntax', real.flatMap(p => p.ld.filter(j => { try { JSON.parse(j); return false; } catch { return true; } }).map(() => p.url)));
check('FAIL', 'aggregateRating present (must match visible reviews)', real.filter(p => p.ld.some(j => /aggregateRating/.test(j))).map(p => p.url));

// sitemap
const sm = fs.existsSync('dist/sitemap-index.xml');
check('FAIL', 'sitemap-index.xml missing', sm ? [] : ['dist/sitemap-index.xml']);
if (sm) {
  const files = [...fs.readFileSync('dist/sitemap-index.xml', 'utf8').matchAll(/<loc>([^<]+)</g)].map(m => m[1].replace(ORIGIN, ''));
  const locs = files.flatMap(f => fs.existsSync('dist' + f) ? [...fs.readFileSync('dist' + f, 'utf8').matchAll(/<loc>([^<]+)</g)].map(m => m[1]) : []);
  check('FAIL', 'Sitemap lists URL that does not exist in build', locs.filter(l => !urlSet.has(decodeURIComponent(l.replace(ORIGIN, '')))));
  check('FAIL', 'Sitemap lists a redirect-only URL', locs.filter(l => pages.find(p => p.url === decodeURIComponent(l.replace(ORIGIN, '')))?.redirect));
  check('FAIL', 'Sitemap lists a noindex URL', locs.filter(l => /noindex/.test(pages.find(p => p.url === decodeURIComponent(l.replace(ORIGIN, '')))?.robots || '')));
  const inMap = new Set(locs.map(l => decodeURIComponent(l.replace(ORIGIN, ''))));
  check('WARN', 'Indexable page missing from sitemap', indexable.filter(p => !inMap.has(p.url)).map(p => p.url));
}

// ---------- heuristic checks ----------
const dup = (key) => { const m = {}; indexable.forEach(p => p[key] && (m[p[key]] = [...(m[p[key]] || []), p.url])); return Object.entries(m).filter(([, v]) => v.length > 1).map(([k, v]) => `${k} x${v.length}: ${v.slice(0, 2).join(', ')}`); };
check('WARN', 'Duplicate <title> across indexable pages', dup('title'));
check('WARN', 'Duplicate meta description across indexable pages', dup('desc'));
check('WARN', 'Missing meta description', indexable.filter(p => !p.desc).map(p => p.url));
check('WARN', 'Unexpected noindex on a content page', real.filter(p => /noindex/.test(p.robots) && p.url !== '/404/').map(p => p.url));
check('WARN', 'Orphan page (no inbound internal link)', (() => { const inb = new Set(); real.forEach(p => p.links.forEach(l => inb.add(decodeURIComponent(l.replace(ORIGIN, '') || '/')))); return indexable.filter(p => p.url !== '/' && !inb.has(p.url) && !inb.has(p.url.slice(0, -1))).map(p => p.url); })());

// keyword stuffing: any 2-word phrase making up > 2.5% of words, or any non-stopword > 4%
const STOP = new Set('the a an and or of in on at to for with is are was be by it this that from as your you we our us can will if not have has more all any'.split(' '));
const stuffed = [];
for (const p of indexable) {
  if (p.words.length < 150) continue;
  const bi = {}, uni = {};
  for (let i = 0; i < p.words.length - 1; i++) {
    const a = p.words[i], b = p.words[i + 1];
    if (!STOP.has(a) && !STOP.has(b) && a.length > 2 && b.length > 2) bi[a + ' ' + b] = (bi[a + ' ' + b] || 0) + 1;
    if (!STOP.has(a) && a.length > 3) uni[a] = (uni[a] || 0) + 1;
  }
  const [k, n] = Object.entries(bi).sort((x, y) => y[1] - x[1])[0] || ['', 0];
  const [uk, un] = Object.entries(uni).sort((x, y) => y[1] - x[1])[0] || ['', 0];
  const bd = (n * 2 * 100) / p.words.length, ud = (un * 100) / p.words.length;
  if (bd > 2.5 || ud > 4) stuffed.push(`${p.url}: "${bd > 2.5 ? k : uk}" ${bd > 2.5 ? bd.toFixed(1) : ud.toFixed(1)}%`);
}
check('WARN', 'Possible keyword stuffing (phrase >2.5% / word >4% of words)', stuffed);

// near-duplicate templates (8-word shingles)
const shingles = (w) => { const s = new Set(); for (let i = 0; i < w.length - 7; i += 2) s.add(w.slice(i, i + 8).join(' ')); return s; };
const groups = {};
indexable.filter(p => p.words.length > 300).forEach(p => { const k = p.url.replace(/-(in|at|for)-[^/]*\/$/, '-$1-X/').replace(/-(vadodara|anand|valsad|bharuch|surat|ahmedabad|ankleshwar|gandhinagar|nadiad)\/$/, '-CITY/'); (groups[k] = groups[k] || []).push(p); });
const nearDup = [];
for (const [k, v] of Object.entries(groups)) {
  if (v.length < 6) continue;
  const a = shingles(v[0].words); let hi = 0;
  for (let i = 1; i < Math.min(v.length, 6); i++) { const b = shingles(v[i].words); let inter = 0; a.forEach(x => b.has(x) && inter++); if (inter / (a.size + b.size - inter) > 0.8) hi++; }
  if (hi >= 3) nearDup.push(`${k} (${v.length} pages, >80% similar)`);
}
check('WARN', 'Near-identical page templates (doorway-page risk)', nearDup);

// code-level cloaking / manipulation heuristics
const src = walk('src').filter(f => /\.(astro|ts|js|mjs)$/.test(f));
const grepSrc = (re, label) => src.flatMap(f => (fs.readFileSync(f, 'utf8').split('\n').map((l, i) => re.test(l) ? `${f}:${i + 1} ${l.trim().slice(0, 90)}` : null).filter(Boolean)));
check('WARN', 'User-agent / referrer based logic in source (possible cloaking)', grepSrc(/navigator\.userAgent|headers\.get\(['"]user-agent|document\.referrer|googlebot/i));
check('WARN', 'Hidden text patterns in source (display:none / visibility:hidden / off-screen text)', grepSrc(/display:\s*none.*(seo|keyword)|text-indent:\s*-9999|font-size:\s*0[;\s]/i));
check('WARN', 'Conditional redirects in source', grepSrc(/Astro\.redirect\(/).filter(l => /if\s*\(/.test(l)));

// ---------- report ----------
let fail = 0;
console.log(`\nSEO TESTS  (${real.length} real pages, ${pages.length - real.length} redirect stubs)\n`);
for (const r of results) {
  const tag = r.level === 'PASS' ? '\x1b[32mPASS\x1b[0m' : r.level === 'FAIL' ? '\x1b[31mFAIL\x1b[0m' : '\x1b[33mWARN\x1b[0m';
  console.log(`${tag}  ${r.name}${r.count ? `  [${r.count}]` : ''}`);
  r.sample.forEach(s => console.log(`        - ${s}`));
  if (r.level === 'FAIL') fail++;
}
const warn = results.filter(r => r.level === 'WARN').length;
console.log(`\n${results.length} checks: ${results.filter(r => r.level === 'PASS').length} pass, ${fail} FAIL, ${warn} WARN`);
process.exit(fail ? 1 : 0);
