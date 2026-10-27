// After `vite build`: renders every page to its own static HTML file (good for search engines and
// link previews), fills in SITE_URL from .env, and writes sitemap.xml.
import { preview } from 'vite';
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const env = Object.fromEntries(readFileSync('.env','utf8').split('\n').filter(l=>/^\w+=/.test(l)).map(l=>l.split(/=(.*)/s).slice(0,2)));
const SITE_URL = (process.env.SITE_URL || env.SITE_URL || 'https://www.yourdomain.com').replace(/\/$/,'');
const ROUTES = ['/', '/solutions', '/platform', '/how', '/company', '/privacy'];

const server = await preview({ preview: { port: 4179, strictPort: true }, logLevel: 'silent' });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
for (const route of ROUTES) {
  await page.goto('http://localhost:4179' + route, { waitUntil: 'networkidle' });
  await page.waitForSelector('main');
  await page.waitForTimeout(400);
  let html = '<!doctype html>\n' + await page.evaluate(() => document.documentElement.outerHTML);
  const dir = route === '/' ? 'dist' : join('dist', route.slice(1));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
  console.log('prerendered', route);
}
await browser.close();
server.httpServer.close();

// Fill in the site address everywhere it appears.
const walk = d => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
for (const f of walk('dist').filter(f => /\.(html|txt|xml)$/.test(f))) {
  const s = readFileSync(f, 'utf8'); if (s.includes('__SITE_URL__')) writeFileSync(f, s.replaceAll('__SITE_URL__', SITE_URL));
}
const today = new Date().toISOString().slice(0, 10);
writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  ROUTES.map(r => `  <url><loc>${SITE_URL}${r === '/' ? '/' : r + '/'}</loc><lastmod>${today}</lastmod></url>`).join('\n') + '\n</urlset>\n');
console.log('site url:', SITE_URL);
