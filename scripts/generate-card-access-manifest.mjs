#!/usr/bin/env node
/**
 * Génère src/data/card-access-manifest.json à partir des fiches /card/* (build + prod Docker).
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const CARD_DIR = path.join(ROOT, 'src', 'app', 'card');
const OUT = path.join(ROOT, 'src', 'data', 'card-access-manifest.json');

const ACCESS_PATTERNS = [
  /CardPageAccessSection/,
  /CardPageActivationSection/,
  /ModuleAccessButton/,
  /EssentialAccessButton/,
  /openModuleAppWithToken/,
  /generate-access-token/,
];

function readCardSlugInfo(slug) {
  const interactivePath = path.join(CARD_DIR, slug, 'CardInteractive.tsx');
  const pagePath = path.join(CARD_DIR, slug, 'page.tsx');
  let content = '';
  if (fs.existsSync(interactivePath)) content += fs.readFileSync(interactivePath, 'utf8');
  if (fs.existsSync(pagePath)) content += fs.readFileSync(pagePath, 'utf8');
  const hasAccessButton = content.length > 0 && ACCESS_PATTERNS.some((p) => p.test(content));
  return { slug, hasAccessButton, hasCardPage: fs.existsSync(pagePath) };
}

if (!fs.existsSync(CARD_DIR)) {
  console.warn('⚠️ card dir missing, skipping manifest generation');
  process.exit(0);
}

const slugs = fs
  .readdirSync(CARD_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== '[id]')
  .map((d) => d.name)
  .sort();

const entries = slugs.map(readCardSlugInfo);

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(
  OUT,
  JSON.stringify({ generatedAt: new Date().toISOString(), entries }, null, 2) + '\n',
  'utf8'
);

console.log(`✅ card-access-manifest: ${entries.length} fiches (${entries.filter((e) => e.hasAccessButton).length} avec bouton d'accès)`);
