#!/usr/bin/env node
/**
 * Vérifie que les fiches /card/{slug} ont un bouton d'accès et que l'URL app ne redirige pas vers la fiche.
 *
 * Usage:
 *   node scripts/check-card-access-buttons.mjs
 *   node scripts/check-card-access-buttons.mjs --base https://iahome.fr
 *
 * Préférez l'API admin POST /api/admin/applications/check-card-access depuis l'interface.
 */

const baseUrl = (process.argv.includes('--base')
  ? process.argv[process.argv.indexOf('--base') + 1]
  : process.env.NEXT_PUBLIC_APP_URL || 'https://iahome.fr'
).replace(/\/$/, '');

const apiUrl = `${baseUrl}/api/admin/applications/check-card-access`;

async function main() {
  console.log(`🔎 Vérification boutons d'accès — ${apiUrl}\n`);

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ check_all: true }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.success) {
    console.error('❌ Échec:', data.error || res.statusText);
    process.exit(1);
  }

  const results = data.results || [];
  const failed = results.filter((r) => !r.isValid);

  for (const row of results) {
    const icon = row.isValid ? '✅' : '❌';
    console.log(`${icon} ${row.card_slug}`);
    console.log(`   Fiche: ${row.card_page_url}`);
    if (row.expected_app_url) {
      console.log(`   App:   ${row.expected_app_url}`);
    }
    if (row.issues?.length) {
      for (const issue of row.issues) {
        console.log(`   → ${issue}`);
      }
    }
    console.log('');
  }

  console.log(`Résumé: ${data.summary?.passed ?? 0} OK / ${data.summary?.failed ?? failed.length} erreur(s) / ${results.length} total`);

  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
