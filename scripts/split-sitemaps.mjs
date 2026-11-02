// Splits Astro's monolithic sitemap-0.xml into clean, categorized XML sitemaps
// so Google Search Console tracks indexing separately for Core, Content, Cities, and Service-City Matrix pages.
import fs from 'node:fs';
import path from 'node:path';

const ORIGIN = 'https://www.atlasaircons.com';
const DIST = path.resolve('dist');
const LASTMOD = new Date().toISOString().slice(0, 10);

const locations = JSON.parse(fs.readFileSync(path.resolve('src/data/locations.json'), 'utf8'));
const cityPaths = new Set(locations.map((l) => `/ac-repair-${l.slug}/`));

const coreExact = new Set([
  '/',
  '/services/',
  '/service-areas/',
  '/book-appointment/',
  '/ac-repair-cost-vadodara/',
  '/ac-tonnage-calculator/',
  '/ac-power-calculator/',
  '/testimonials/',
  '/gallery/',
  '/about-us/',
  '/contact-us/',
  '/shop/',
  '/fault-codes/',
  '/wiki/',
  '/recent-projects/',
  '/blogs/',
  '/franchise/',
  '/ac-technician-jobs/',
  '/privacy-policy/',
  '/terms-and-conditions/',
  '/sitemap/',
]);

const existingSitemapFiles = fs
  .readdirSync(DIST)
  .filter((f) => /^sitemap-\d+\.xml$/.test(f))
  .map((f) => path.join(DIST, f));

const allUrls = new Set();
for (const file of existingSitemapFiles) {
  const xml = fs.readFileSync(file, 'utf8');
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    allUrls.add(m[1].trim());
  }
  fs.unlinkSync(file);
}

const core = [];
const cities = [];
const matrix = [];
const content = [];

for (const url of [...allUrls].sort()) {
  const pathname = decodeURIComponent(url.replace(ORIGIN, '')) || '/';
  if (coreExact.has(pathname) || pathname.startsWith('/services/')) {
    core.push(url);
  } else if (cityPaths.has(pathname)) {
    cities.push(url);
  } else if (pathname.startsWith('/service/')) {
    matrix.push(url);
  } else {
    content.push(url);
  }
}

const writeUrlset = (filename, urls) => {
  const body = urls
    .map((u) => `  <url><loc>${u}</loc><lastmod>${LASTMOD}</lastmod></url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
  fs.writeFileSync(path.join(DIST, filename), xml, 'utf8');
  return filename;
};

const generated = [];
if (core.length) generated.push(writeUrlset('sitemap-core.xml', core));
if (content.length) generated.push(writeUrlset('sitemap-content.xml', content));
if (cities.length) generated.push(writeUrlset('sitemap-cities.xml', cities));

const MATRIX_CHUNK = 1600;
for (let i = 0; i < matrix.length; i += MATRIX_CHUNK) {
  const idx = Math.floor(i / MATRIX_CHUNK) + 1;
  generated.push(writeUrlset(`sitemap-matrix-${idx}.xml`, matrix.slice(i, i + MATRIX_CHUNK)));
}

const indexBody = generated
  .map((f) => `  <sitemap><loc>${ORIGIN}/${f}</loc><lastmod>${LASTMOD}</lastmod></sitemap>`)
  .join('\n');
const indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexBody}\n</sitemapindex>\n`;
fs.writeFileSync(path.join(DIST, 'sitemap-index.xml'), indexXml, 'utf8');

console.log(
  `Split sitemaps written: ${generated.length} files (${core.length} core, ${content.length} content, ${cities.length} cities, ${matrix.length} matrix = ${allUrls.size} total URLs)`
);

