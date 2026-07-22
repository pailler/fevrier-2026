#!/usr/bin/env node
/**
 * Pipeline SEO dev : sync JSON-LD + vérifs code + audit HTTP (prod ou local)
 * Usage: node scripts/seo/run-all.mjs [--skip-fetch] [--base-url=URL]
 */

import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '../..');

const args = process.argv.slice(2);
const skipFetch = args.includes('--skip-fetch');
const baseUrlArg = args.find((a) => a.startsWith('--base-url='));
const baseUrl = baseUrlArg?.split('=')[1] || process.env.SEO_BASE_URL || 'https://iahome.fr';

function run(label, cmd, cmdArgs, opts = {}) {
  console.log(`\n▶ ${label}`);
  const r = spawnSync(cmd, cmdArgs, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...opts,
  });
  if (r.status !== 0) {
    console.error(`✗ Échec : ${label}`);
    return false;
  }
  return true;
}

function checkCodebase() {
  console.log('\n▶ Vérifications codebase');
  let ok = true;
  const cardDir = path.join(root, 'src/app/card');
  const slugs = fs.readdirSync(cardDir).filter((d) => {
    const layout = path.join(cardDir, d, 'layout.tsx');
    return fs.existsSync(layout) && d !== '[id]';
  });
  const missingJsonLd = [];
  const missingSsrPage = [];
  for (const slug of slugs) {
    const layout = fs.readFileSync(path.join(cardDir, slug, 'layout.tsx'), 'utf8');
    if (!layout.includes('CardPageJsonLd')) missingJsonLd.push(slug);
    const page = path.join(cardDir, slug, 'page.tsx');
    if (fs.existsSync(page)) {
      const p = fs.readFileSync(page, 'utf8');
      if (p.startsWith("'use client'")) missingSsrPage.push(slug);
    }
  }
  if (missingJsonLd.length) {
    console.error(`❌ Layouts sans CardPageJsonLd : ${missingJsonLd.join(', ')}`);
    ok = false;
  } else {
    console.log(`✅ ${slugs.length} layouts avec JSON-LD serveur`);
  }
  if (missingSsrPage.length) {
    console.error(`❌ Pages card encore client-only : ${missingSsrPage.join(', ')}`);
    ok = false;
  } else {
    console.log('✅ Fiches /card/* en SSR (page.tsx serveur)');
  }
  const homePage = fs.readFileSync(path.join(root, 'src/app/page.tsx'), 'utf8');
  if (homePage.startsWith("'use client'")) {
    console.error('❌ Homepage encore client-only');
    ok = false;
  } else {
    console.log('✅ Homepage en SSR/ISR');
  }
  return ok;
}

console.log('═'.repeat(50));
console.log('  IAHome — pipeline SEO');
console.log('═'.repeat(50));

let success = true;

if (fs.existsSync(path.join(root, 'src/data/card-seo/generated.ts'))) {
  const gen = fs.readFileSync(path.join(root, 'src/data/card-seo/generated.ts'), 'utf8');
  const withData = (gen.match(/"faqs":/g) || []).length;
  if (withData < 5) {
    console.log('\n▶ Sync JSON-LD (données CardInteractive.tsx)');
    success = run('Sync JSON-LD fiches produit', 'node', ['scripts/extract-card-jsonld.mjs']) && success;
  } else {
    console.log('\n⏭ JSON-LD generated.ts déjà peuplé — sync ignorée (relancer npm run seo:sync-jsonld si besoin)');
  }
} else {
  success = run('Sync JSON-LD fiches produit', 'node', ['scripts/extract-card-jsonld.mjs']) && success;
}
success = checkCodebase() && success;

if (!skipFetch) {
  success =
    run('Audit HTTP', 'node', ['scripts/seo/verify-seo.mjs', `--base-url=${baseUrl}`]) && success;
} else {
  console.log('\n⏭ Audit HTTP ignoré (--skip-fetch)');
}

console.log('\n' + '═'.repeat(50));
console.log(success ? '✅ Pipeline SEO terminé avec succès' : '❌ Pipeline SEO : échecs détectés');
console.log('═'.repeat(50));

process.exit(success ? 0 : 1);
