/**
 * Génère une carte PNG locale (modules absents des listes publiques).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const OUT_DIR = 'C:\\Users\\AAA\\Pictures\\Screenshots';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const LOCAL_CARDS = [
  {
    slug: 'hi3dgen',
    title: 'Hi3DGen',
    description:
      "Générez des modèles 3D à partir d'images avec Hi3DGen. Haute fidélité géométrique via ComfyUI.",
    image: '/images/hunyuan3d.jpg',
  },
];

function cardHtml({ title, description, imageAbs }) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Inter, system-ui, sans-serif;
      background: #eef2ff;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .card {
      width: 380px;
      background: #fff;
      border: 1px solid #f3f4f6;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,.08);
    }
    .media {
      height: 224px;
      overflow: hidden;
      background: #f9fafb;
    }
    .media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .body { padding: 24px; }
    h3 {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 12px;
    }
    p {
      font-size: 14px;
      line-height: 1.6;
      color: #374151;
    }
  </style>
</head>
<body>
  <div class="card" id="card">
    <div class="media"><img src="file:///${imageAbs.replace(/\\/g, '/')}" alt="" /></div>
    <div class="body">
      <h3>${title}</h3>
      <p>${description}</p>
    </div>
  </div>
</body>
</html>`;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 500, height: 700 }, deviceScaleFactor: 2 });

  for (const card of LOCAL_CARDS) {
    const imagePath = path.join(ROOT, 'public', card.image.replace(/^\//, ''));
    const html = cardHtml({
      title: card.title,
      description: card.description,
      imageAbs: imagePath,
    });
    const tmp = path.join(OUT_DIR, `_tmp-${card.slug}.html`);
    fs.writeFileSync(tmp, html, 'utf8');
    await page.goto(`file:///${tmp.replace(/\\/g, '/')}`, { waitUntil: 'load' });
    const out = path.join(OUT_DIR, `iahome-card-${card.slug}.png`);
    await page.locator('#card').screenshot({ path: out, type: 'png' });
    fs.unlinkSync(tmp);
    console.log(`✓ ${card.slug} -> ${out}`);
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
