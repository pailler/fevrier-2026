/**
 * Génère une capture PNG par application IAHome (style carte module).
 * Usage: node scripts/generate-iahome-card-screenshots.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = 'C:\\Users\\AAA\\Pictures\\Screenshots';

const PAGES = [
  'https://iahome.fr/applications',
  'https://iahome.fr/essentiels',
];

function slugFromHref(href) {
  const m = href.match(/^\/card\/([^/?#]+)/);
  return m ? decodeURIComponent(m[1]).toLowerCase() : null;
}

async function collectSlugs(page) {
  const hrefs = await page.$$eval('a[href^="/card/"]', (links) =>
    [...new Set(links.map((a) => a.getAttribute('href')).filter(Boolean))]
  );
  return hrefs.map(slugFromHref).filter(Boolean);
}

async function screenshotCard(page, slug) {
  const href = `/card/${slug}`;
  const link = page.locator(`a[href="${href}"]`).first();
  const count = await link.count();
  if (count === 0) return false;

  const card = link.locator(
    'xpath=ancestor::div[contains(@class,"bg-white") and contains(@class,"rounded-xl")][1]'
  );
  if ((await card.count()) === 0) return false;

  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(350);

  const outPath = path.join(OUT_DIR, `iahome-card-${slug}.png`);
  await card.screenshot({ path: outPath, type: 'png' });
  return outPath;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const manifestPath = path.join(ROOT, 'src', 'data', 'card-access-manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const expectedSlugs = manifest.entries.map((e) => e.slug);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1200 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  const slugSet = new Set();
  for (const url of PAGES) {
    console.log(`Chargement ${url}…`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
    await page.waitForTimeout(2500);
    for (const slug of await collectSlugs(page)) slugSet.add(slug);
  }

  const slugs = [...new Set([...expectedSlugs, ...slugSet])].sort();
  console.log(`${slugs.length} applications à capturer.`);

  const saved = [];
  const missing = [];

  for (const slug of slugs) {
    let done = false;
    for (const url of PAGES) {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
      await page.waitForTimeout(1500);
      const out = await screenshotCard(page, slug);
      if (out) {
        saved.push(out);
        console.log(`✓ ${slug}`);
        done = true;
        break;
      }
    }
    if (!done) missing.push(slug);
  }

  await browser.close();

  console.log(`\n${saved.length} images enregistrées dans ${OUT_DIR}`);
  if (missing.length) {
    console.log(`Manquantes sur le site (${missing.length}): ${missing.join(', ')}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
