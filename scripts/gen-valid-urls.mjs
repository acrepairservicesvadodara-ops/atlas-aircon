// Writes wp-export/valid-urls.json = every page URL that exists in dist/.
// The WP content cleaner uses it to drop dead internal links (keeps the link text).
// Usage: node scripts/gen-valid-urls.mjs   (run after `astro build`; re-run when pages are added)
import fs from 'node:fs';
import path from 'node:path';

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const urls = walk('dist')
  .filter(f => f.endsWith('index.html'))
  .map(f => '/' + path.relative('dist', path.dirname(f)).replace(/\\/g, '/'))
  .map(u => (u === '/' ? '/' : u + '/'));
fs.writeFileSync('wp-export/valid-urls.json', JSON.stringify([...new Set(urls)].sort()));
console.log(`${urls.length} valid URLs written`);
