// Shared access to the exported WordPress pages/posts (wp-export/*.json).
// Used by the HTML sitemap page and by the "Related pages" links on every migrated page.
import fs from 'node:fs';
import path from 'node:path';

export interface WpEntry {
  path: string; // e.g. /ac-service-in-mandvi/
  slug: string; // decoded, no slashes
  title: string;
  type: 'page' | 'post';
}

const decode = (s: string) =>
  s
    .replace(/&#0*38;|&amp;/g, '&')
    .replace(/&#8217;|&#8216;|&#0*39;/g, "'")
    .replace(/&#8220;|&#8221;|&quot;/g, '"')
    .replace(/&#8211;|&#8212;/g, '-')
    .replace(/<[^>]+>/g, '')
    .trim();

let cache: WpEntry[] | null = null;

export function wpEntries(): WpEntry[] {
  if (cache) return cache;
  const dir = path.resolve('wp-export');
  const read = (f: string) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const seen = new Set<string>();
  const out: WpEntry[] = [];
  for (const it of [...read('pages.json'), ...read('posts.json')]) {
    const p = new URL(it.link).pathname;
    const slug = decodeURIComponent(p).replace(/^\/|\/$/g, '');
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    out.push({ path: decodeURIComponent(p), slug, title: decode(it.title.rendered) || slug, type: it.type });
  }
  cache = out.sort((a, b) => a.slug.localeCompare(b.slug));
  return cache;
}

const tokens = (slug: string) => new Set(slug.split('-').filter(Boolean));

const relatedCache = new Map<string, WpEntry[]>();

/**
 * Up to 6 related pages: the previous + next page (alphabetical, same type) so EVERY page
 * is guaranteed at least two inbound links, plus the 4 most similar slugs (shared words).
 */
export function relatedFor(entry: WpEntry): WpEntry[] {
  if (relatedCache.has(entry.slug)) return relatedCache.get(entry.slug)!;
  const same = wpEntries().filter((e) => e.type === entry.type);
  const i = same.findIndex((e) => e.slug === entry.slug);
  const picked: WpEntry[] = [];
  const add = (e?: WpEntry) => e && e.slug !== entry.slug && !picked.includes(e) && picked.push(e);
  add(same[(i - 1 + same.length) % same.length]);
  add(same[(i + 1) % same.length]);

  const mine = tokens(entry.slug);
  const scored = same
    .filter((e) => e.slug !== entry.slug)
    .map((e, idx) => {
      const t = tokens(e.slug);
      let inter = 0;
      mine.forEach((x) => t.has(x) && inter++);
      return { e, score: inter / (mine.size + t.size - inter), idx };
    })
    .sort((a, b) => b.score - a.score || a.idx - b.idx);
  for (const s of scored) {
    if (picked.length >= 6) break;
    add(s.e);
  }
  relatedCache.set(entry.slug, picked);
  return picked;
}
