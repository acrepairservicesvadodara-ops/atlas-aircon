// Vercel Serverless Function: handles non-existent static routes.
// Static pages in dist/ ALWAYS take precedence on Vercel CDN before rewrites run.
// Returns HTTP 410 Gone + X-Robots-Tag: noindex, nofollow for permanently deleted WordPress,
// WooCommerce, tag/pagination, and legacy competitor-named URLs so Google drops them in bulk,
// and HTTP 404 Not Found + noindex for any other unknown URL.

const GONE_PATTERNS = [
  /hitech-aircool-engineers/i,
  /^\/product-tag(\/|$)/i,
  /^\/product(\/|$)/i,
  /^\/product-category(\/|$)/i,
  /^\/tag(\/|$)/i,
  /^\/category(\/|$)/i,
  /^\/author(\/|$)/i,
  /^\/brand(\/|$)/i,
  /^\/uncategorized(\/|$)/i,
  /\/page\/\d+(\/|$)/i,
  /\/feed(\/|$)/i,
  /\.kml$/i,
  /^\/(cart|checkout|my-account|register|abp-bookings|sitemap-xml|wp-admin|wp-login\.php|xmlrpc\.php)(\/|$)/i,
  /^\/hvac-work\/service-in-location-brand-equipment(\/|$)/i,
];

module.exports = function handler(req, res) {
  const rawUrl = req.url || '/';
  const pathname = rawUrl.split('?')[0] || '/';
  const isGone = GONE_PATTERNS.some((re) => re.test(pathname));
  const status = isGone ? 410 : 404;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');

  res.status(status).send(`<!doctype html>
<html lang="en-IN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <title>${isGone ? '410 Gone — Page Permanently Removed' : '404 — Page Not Found'} | Atlas Aircon</title>
  <style>
    body { margin:0; font-family: system-ui, -apple-system, sans-serif; background:#0B1120; color:#F8FAFC; display:flex; align-items:center; justify-content:center; min-height:100vh; padding:24px; }
    .box { max-width:560px; background:#111827; border:1px solid rgba(6,182,212,0.25); border-radius:16px; padding:36px; text-align:center; }
    .code { font-size:3rem; font-weight:800; color:#22D3EE; line-height:1; margin-bottom:12px; }
    h1 { font-size:1.4rem; margin:0 0 12px; }
    p { color:#94A3B8; line-height:1.6; font-size:0.95rem; margin:0 0 24px; }
    .links { display:flex; flex-wrap:wrap; gap:12px; justify-content:center; }
    a { display:inline-block; padding:10px 18px; border-radius:8px; text-decoration:none; font-weight:600; font-size:0.9rem; }
    .primary { background:#06B6D4; color:#0B1120; }
    .secondary { border:1px solid rgba(148,163,184,0.35); color:#E2E8F0; }
  </style>
</head>
<body>
  <main class="box">
    <div class="code">${status}</div>
    <h1>${isGone ? 'This Legacy Page Has Been Permanently Removed' : 'Page Not Found'}</h1>
    <p>${
      isGone
        ? 'This outdated archive or catalog URL is no longer part of Atlas Aircon. Explore our active 24/7 HVAC repair, installation, and industrial cooling services below.'
        : 'The address you requested could not be found. Browse our active HVAC services and Gujarat dispatch hubs below.'
    }</p>
    <div class="links">
      <a class="primary" href="/">Go to Homepage</a>
      <a class="secondary" href="/services/">All HVAC Services</a>
      <a class="secondary" href="/service-areas/">Service Areas</a>
      <a class="secondary" href="tel:+919727257141">Call +91 97272 57141</a>
    </div>
  </main>
</body>
</html>`);
}

