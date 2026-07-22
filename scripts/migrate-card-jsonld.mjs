import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cardDir = path.join(__dirname, '../src/app/card');

const JSON_LD_USE_EFFECT = /\/\/ Ajouter les données structurées JSON-LD pour le SEO[\s\S]*?^\s*\}, \[\]\);\s*\n/m;

const slugs = fs.readdirSync(cardDir).filter((d) => {
  const pagePath = path.join(cardDir, d, 'page.tsx');
  return fs.statSync(path.join(cardDir, d)).isDirectory() && fs.existsSync(pagePath);
});

let pagesCleaned = 0;
let layoutsUpdated = 0;

for (const slug of slugs) {
  const pagePath = path.join(cardDir, slug, 'page.tsx');
  const layoutPath = path.join(cardDir, slug, 'layout.tsx');
  let page = fs.readFileSync(pagePath, 'utf8');

  if (JSON_LD_USE_EFFECT.test(page)) {
    page = page.replace(JSON_LD_USE_EFFECT, '');
    fs.writeFileSync(pagePath, page);
    pagesCleaned++;
  }

  if (!fs.existsSync(layoutPath)) continue;

  let layout = fs.readFileSync(layoutPath, 'utf8');
  if (layout.includes('CardPageJsonLd')) continue;

  if (!layout.includes("import type { Metadata }")) {
    layout = "import type { Metadata } from 'next'\n" + layout.replace(/^import type \{ Metadata \} from 'next'\n?/, '');
  }

  if (!layout.includes('CardPageJsonLd')) {
    layout = layout.replace(
      /^(import type \{ Metadata \} from 'next'\n)/,
      "$1import { CardPageJsonLd } from '@/components/CardPageJsonLd'\n"
    );
  }

  layout = layout.replace(
    /export default function (\w+)\(\{[\s\S]*?\}\) \{\s*return children\s*\}/,
    `export default function $1({\n  children,\n}: {\n  children: React.ReactNode\n}) {\n  return (\n    <>\n      <CardPageJsonLd slug="${slug}" />\n      {children}\n    </>\n  )\n}`
  );

  layout = layout.replace(
    /export default function (\w+)\(\{\s*children,\s*\}: \{\s*children: React\.ReactNode\s*\}\) \{\s*return children\s*\}/,
    `export default function $1({\n  children,\n}: {\n  children: React.ReactNode\n}) {\n  return (\n    <>\n      <CardPageJsonLd slug="${slug}" />\n      {children}\n    </>\n  )\n}`
  );

  if (layout.includes('CardPageJsonLd')) {
    fs.writeFileSync(layoutPath, layout);
    layoutsUpdated++;
  }
}

console.log(`Pages cleaned: ${pagesCleaned}, layouts updated: ${layoutsUpdated}`);
