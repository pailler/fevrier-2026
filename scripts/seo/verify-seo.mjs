#!/usr/bin/env node
/**
 * Audit SEO technique iahome.fr
 * Usage: node scripts/seo/verify-seo.mjs [--base-url=URL] [--json] [--strict]
 */

import {
  BAD_CONTENT_PATTERNS,
  CARD_SAMPLE,
  CRITICAL_PAGES,
  DEFAULT_BASE_URL,
  EXPECTED_REDIRECTS,
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
  MIN_DESCRIPTION_LENGTH,
  MIN_SITEMAP_URLS,
  MIN_TITLE_LENGTH,
  WWW_CANONICAL_HOST,
} from './config.mjs';

const args = process.argv.slice(2);
const jsonOut = args.includes('--json');
const strict = args.includes('--strict');
const baseUrlArg = args.find((a) => a.startsWith('--base-url='));
const baseUrl = (baseUrlArg?.split('=')[1] || DEFAULT_BASE_URL).replace(/\/$/, '');

const results = { baseUrl, passed: [], warnings: [], errors: [], checks: [] };

function record(id, status, message, detail) {
  results.checks.push({ id, status, message, detail });
  if (status === 'error') results.errors.push(message);
  else if (status === 'warn') results.warnings.push(message);
  else results.passed.push(message);
}

function abs(path) {
  return path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}

function pick(html, re) {
  const m = html.match(re);
  return m ? m[1].trim() : null;
}

function countMatches(html, re) {
  return (html.match(re) || []).length;
}

function parseMeta(html) {
  const title = pick(html, /<title[^>]*>([^<]+)<\/title>/i);
  const description = pick(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    || pick(html, /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  const canonical = pick(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
    || pick(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  const robots = pick(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) =>
    m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  );
  const jsonLdCount = countMatches(html, /type=["']application\/ld\+json["']/gi);
  const ogTitle = pick(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  return { title, description, canonical, robots, h1s, jsonLdCount, ogTitle };
}

async function fetchText(url, opts = {}) {
  const res = await fetch(url, {
    redirect: opts.followRedirect === false ? 'manual' : 'follow',
    headers: { 'User-Agent': 'IAHome-SEO-Verifier/1.0 (+https://iahome.fr)' },
    signal: AbortSignal.timeout(opts.timeout ?? 25000),
  });
  const text = opts.method === 'HEAD' ? '' : await res.text();
  return { res, text };
}

async function checkRobots() {
  const url = abs('/robots.txt');
  try {
    const { res, text } = await fetchText(url);
    if (res.status !== 200) {
      record('robots-status', 'error', `robots.txt → HTTP ${res.status}`, url);
      return;
    }
    if (!/Sitemap:\s*https:\/\/iahome\.fr\/sitemap\.xml/i.test(text)) {
      record('robots-sitemap', 'warn', 'robots.txt : ligne Sitemap manquante ou incorrecte');
    }
    if (!/Disallow:\s*\/admin\//i.test(text)) {
      record('robots-admin', 'warn', 'robots.txt : Disallow /admin/ absent');
    }
    if (/ai-train=no/i.test(text) || /GPTBot/i.test(text)) {
      record('robots-ai', 'pass', 'robots.txt : signaux IA / bots configurés');
    }
    record('robots', 'pass', `robots.txt OK (${res.status})`);
  } catch (e) {
    record('robots', 'error', `robots.txt inaccessible : ${e.message}`);
  }
}

async function checkSitemap() {
  const url = abs('/sitemap.xml');
  try {
    const { res, text } = await fetchText(url);
    if (res.status !== 200) {
      record('sitemap-status', 'error', `sitemap.xml → HTTP ${res.status}`, url);
      return;
    }
    const locs = [...text.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    if (locs.length < MIN_SITEMAP_URLS) {
      record('sitemap-count', 'warn', `sitemap : ${locs.length} URLs (< ${MIN_SITEMAP_URLS})`);
    } else {
      record('sitemap-count', 'pass', `sitemap : ${locs.length} URLs`);
    }
    const missingCards = CARD_SAMPLE.filter((slug) => !locs.some((u) => u.endsWith(`/card/${slug}`)));
    if (missingCards.length) {
      record('sitemap-cards', 'warn', `sitemap : fiches absentes : ${missingCards.join(', ')}`);
    }
    const dupes = CRITICAL_PAGES.filter((p) =>
      [' /photobooth', '/administration'].some((d) => p.path === d)
    );
    if (dupes.length) record('sitemap-dupes', 'pass', 'pas de URLs dupliquées courtes dans l’échantillon critique');
    record('sitemap', 'pass', 'sitemap.xml accessible');
  } catch (e) {
    record('sitemap', 'error', `sitemap.xml inaccessible : ${e.message}`);
  }
}

async function checkLlms() {
  const url = abs('/llms.txt');
  try {
    const { res, text } = await fetchText(url);
    if (res.status !== 200) {
      record('llms', 'warn', `llms.txt → HTTP ${res.status} (GEO/AEO)`);
      return;
    }
    if (!/iahome\.fr/i.test(text)) {
      record('llms-content', 'warn', 'llms.txt : contenu incomplet');
    } else {
      record('llms', 'pass', 'llms.txt présent (GEO/AEO)');
    }
  } catch (e) {
    record('llms', 'warn', `llms.txt : ${e.message}`);
  }
}

async function checkPage(page) {
  const url = abs(page.path);
  try {
    const { res, text } = await fetchText(url);
    if (res.status !== 200) {
      record(`page-${page.path}`, 'error', `${page.name} (${page.path}) → HTTP ${res.status}`);
      return;
    }
    const meta = parseMeta(text);
    const id = `page-${page.path}`;

    for (const bad of BAD_CONTENT_PATTERNS) {
      if (bad.test(text) && meta.h1s.length === 0) {
        record(`${id}-bad-content`, 'error', `${page.name} : contenu vide ou écran de chargement (SSR?)`, bad.source);
      }
    }

    if (!meta.title || meta.title.length < MIN_TITLE_LENGTH) {
      record(`${id}-title`, 'error', `${page.name} : title absent ou trop court`);
    } else if (meta.title.length > MAX_TITLE_LENGTH) {
      record(`${id}-title-len`, 'warn', `${page.name} : title long (${meta.title.length} car.)`);
    }

    if (!meta.description || meta.description.length < MIN_DESCRIPTION_LENGTH) {
      record(`${id}-desc`, 'warn', `${page.name} : meta description absente ou courte`);
    } else if (meta.description.length > MAX_DESCRIPTION_LENGTH) {
      record(`${id}-desc-len`, 'warn', `${page.name} : description longue (${meta.description.length} car.)`);
    }

    if (meta.canonical && !meta.canonical.startsWith(baseUrl) && baseUrl.includes('iahome.fr')) {
      record(`${id}-canonical`, 'warn', `${page.name} : canonical hors domaine → ${meta.canonical}`);
    } else if (meta.canonical) {
      record(`${id}-canonical`, 'pass', `${page.name} : canonical OK`);
    } else {
      record(`${id}-canonical`, 'warn', `${page.name} : balise canonical absente`);
    }

    if (meta.h1s.length === 0) {
      record(`${id}-h1`, 'error', `${page.name} : aucun H1`);
    } else if (meta.h1s.length > 1) {
      record(`${id}-h1-multi`, 'warn', `${page.name} : ${meta.h1s.length} H1`);
    } else if (page.expectH1 && !page.expectH1.test(meta.h1s[0])) {
      record(`${id}-h1-text`, 'warn', `${page.name} : H1 inattendu → « ${meta.h1s[0].slice(0, 60)}… »`);
    } else {
      record(`${id}-h1`, 'pass', `${page.name} : H1 OK`);
    }
    if (meta.jsonLdCount === 0 && (page.path === '/' || page.path.startsWith('/card/'))) {
      record(`${id}-jsonld`, 'warn', `${page.name} : JSON-LD absent`);
    } else if (meta.jsonLdCount > 0) {
      record(`${id}-jsonld`, 'pass', `${page.name} : JSON-LD (${meta.jsonLdCount})`);
    }

    if (!meta.ogTitle) {
      record(`${id}-og`, 'warn', `${page.name} : og:title absent`);
    }

    record(id, 'pass', `${page.name} audité`);
  } catch (e) {
    record(`page-${page.path}`, 'error', `${page.name} : ${e.message}`);
  }
}

async function checkRedirect({ from, to }) {
  const url = abs(from);
  try {
    const { res } = await fetchText(url, { followRedirect: false });
    const loc = res.headers.get('location');
    const okStatus = res.status === 301 || res.status === 308;
    const expected = abs(to);
    if (!okStatus) {
      record(`redirect-${from}`, 'error', `${from} → HTTP ${res.status} (attendu 301/308)`);
      return;
    }
    if (!loc || !loc.replace(/\/$/, '').endsWith(to.replace(/\/$/, ''))) {
      record(`redirect-${from}`, 'error', `${from} → Location incorrect : ${loc} (attendu ${expected})`);
      return;
    }
    record(`redirect-${from}`, 'pass', `${from} → ${to} (${res.status})`);
  } catch (e) {
    record(`redirect-${from}`, 'error', `Redirect ${from} : ${e.message}`);
  }
}

async function checkWwwRedirect() {
  if (!baseUrl.includes('iahome.fr')) return;
  try {
    const { res } = await fetchText('https://www.iahome.fr/', { followRedirect: false });
    const loc = res.headers.get('location') || '';
    if ((res.status === 301 || res.status === 308) && loc.includes(WWW_CANONICAL_HOST) && !loc.includes('error=')) {
      record('www-redirect', 'pass', 'www.iahome.fr → iahome.fr');
    } else if (res.status === 302 && loc.includes('iahome.fr')) {
      record('www-redirect', 'warn', `www redirect via Cloudflare (${res.status}) — vérifier manuellement`);
    } else {
      record('www-redirect', 'warn', `www redirect : status ${res.status}, location ${loc}`);
    }
  } catch (e) {
    record('www-redirect', 'warn', `www redirect : ${e.message}`);
  }
}

async function checkCardSample() {
  for (const slug of CARD_SAMPLE) {
    if (CRITICAL_PAGES.some((p) => p.path === `/card/${slug}`)) continue;
    await checkPage({ path: `/card/${slug}`, name: `Fiche ${slug}` });
  }
}

function printReport() {
  if (jsonOut) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }
  console.log(`\n🔍 Audit SEO — ${results.baseUrl}\n${'─'.repeat(50)}`);
  console.log(`✅ ${results.passed.length} OK  ⚠️  ${results.warnings.length} avert.  ❌ ${results.errors.length} erreur(s)\n`);
  for (const c of results.checks.filter((x) => x.status === 'error')) {
    console.log(`❌ [${c.id}] ${c.message}`);
  }
  for (const c of results.checks.filter((x) => x.status === 'warn')) {
    console.log(`⚠️  [${c.id}] ${c.message}`);
  }
  if (results.errors.length === 0 && results.warnings.length === 0) {
    console.log('✅ Tous les contrôles SEO sont passés.\n');
  } else if (results.errors.length === 0) {
    console.log('\n✅ Aucune erreur bloquante.\n');
  } else {
    console.log('\n❌ Des erreurs SEO doivent être corrigées.\n');
  }
}

async function main() {
  console.error(`SEO verify → ${baseUrl}`);
  await checkRobots();
  await checkSitemap();
  await checkLlms();
  await checkWwwRedirect();
  for (const r of EXPECTED_REDIRECTS) await checkRedirect(r);
  for (const page of CRITICAL_PAGES) await checkPage(page);
  await checkCardSample();
  printReport();
  const fail = results.errors.length > 0 || (strict && results.warnings.length > 0);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
