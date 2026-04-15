/**
 * Supprime un utilisateur IAHome (même ordre que /api/account/delete).
 * Usage : node scripts/delete-user-by-email.mjs <email>
 * Charge .env.local puis .env (SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL).
 */
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

config({ path: resolve(root, '.env.local') });
config({ path: resolve(root, '.env') });

const email = (process.argv[2] || '').trim().toLowerCase();
if (!email || !email.includes('@')) {
  console.error('Usage: node scripts/delete-user-by-email.mjs <email>');
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(url, serviceKey);

async function main() {
  const { data: profile, error: pErr } = await admin
    .from('profiles')
    .select('id, email, full_name')
    .ilike('email', email)
    .maybeSingle();

  if (pErr) {
    console.error('profiles:', pErr.message);
    process.exit(1);
  }
  if (!profile) {
    console.error('Aucun profil pour:', email);
    process.exit(1);
  }

  const userId = profile.id;
  console.log('Suppression:', profile.email, profile.full_name || '', userId);

  const steps = [
    ['user_applications', () => admin.from('user_applications').delete().eq('user_id', userId)],
    ['user_tokens', () => admin.from('user_tokens').delete().eq('user_id', userId)],
    ['access_tokens', () => admin.from('access_tokens').delete().eq('created_by', userId)],
    ['librespeed_tokens', () => admin.from('librespeed_tokens').delete().eq('user_id', userId)],
    ['auto_tokens', () => admin.from('auto_tokens').delete().eq('user_id', userId)],
    ['profiles', () => admin.from('profiles').delete().eq('id', userId)],
  ];

  for (const [name, run] of steps) {
    const { error } = await run();
    if (error) {
      if (String(error.message).includes('does not exist')) {
        console.warn('Table absente, ignorée:', name);
        continue;
      }
      console.error(name, error.message);
      process.exit(1);
    }
  }

  const { error: authErr } = await admin.auth.admin.deleteUser(userId);
  if (authErr) {
    console.warn('Auth deleteUser:', authErr.message);
  }

  console.log('OK — compte supprimé.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
