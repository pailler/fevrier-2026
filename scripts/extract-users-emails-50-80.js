#!/usr/bin/env node
/**
 * Extrait les emails des utilisateurs numérotés 50 à 80 dans Supabase.
 * Numérotation : 1 = plus ancien inscrit, N = plus récent.
 *
 * Usage:
 *   node scripts/extract-users-emails-50-80.js
 *
 * Variables d'environnement requises (.env.production.local ou .env.production) :
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

const path = require('path');
const fs = require('fs');

// Charger les variables d'environnement (tous les fichiers, dernier gagne)
function loadEnv() {
  const envFiles = ['env.production.local', '.env.production.local', '.env.production', '.env.local', '.env'];
  const projectRoot = path.resolve(__dirname, '..');
  const loaded = [];

  for (const file of envFiles) {
    const filePath = path.join(projectRoot, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      for (const line of content.split('\n')) {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^["']|["']$/g, '');
          process.env[key] = value;
        }
      }
      loaded.push(file);
    }
  }
  if (loaded.length) console.log(`📂 Config chargée depuis: ${loaded.join(', ')}`);
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes('example.supabase.co') || serviceRoleKey === 'REPLACE_WITH_REAL_VALUE') {
  console.error('❌ Variables NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requises dans .env.production.local');
  process.exit(1);
}

async function main() {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Utilisateurs ordonnés par date d'inscription (plus ancien en premier)
  // Numéro 1 = premier inscrit, Numéro N = dernier inscrit
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Erreur Supabase:', error.message);
    process.exit(1);
  }

  const users = profiles || [];
  const users50to80 = users
    .map((p, index) => ({ ...p, userNumber: index + 1 }))
    .filter((u) => u.userNumber >= 50 && u.userNumber <= 80);

  console.log(`\n📧 Emails des utilisateurs 50 à 80 (${users50to80.length} utilisateurs):\n`);

  for (const u of users50to80) {
    console.log(`  #${u.userNumber}: ${u.email || '(sans email)'}`);
  }

  // Sortie également en format liste seule (pour copier-coller facilement)
  console.log('\n--- Liste des emails (un par ligne) ---\n');
  users50to80.forEach((u) => console.log(u.email || ''));

  // Optionnel : sortie JSON
  if (process.argv.includes('--json')) {
    console.log('\n--- JSON ---');
    console.log(JSON.stringify(users50to80.map((u) => ({ userNumber: u.userNumber, email: u.email, full_name: u.full_name })), null, 2));
  }

  console.log(`\n✅ Total: ${users50to80.length} emails extraits`);
}

main().catch((err) => {
  console.error('❌', err);
  process.exit(1);
});
