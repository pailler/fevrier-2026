/**
 * Script pour ajouter des tokens à un utilisateur
 * Usage: node scripts/add-tokens-to-user.js <email> <tokens> [reason]
 * 
 * Exemple: node scripts/add-tokens-to-user.js alexandre.saintetienne@gmail.com 200 "Crédit manuel"
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

// Initialiser Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function addTokensToUser(email, tokensToAdd, reason = 'Crédit manuel') {
  try {
    console.log(`🔄 Ajout de ${tokensToAdd} tokens à l'utilisateur: ${email}`);
    console.log(`📝 Raison: ${reason}`);

    // Récupérer l'utilisateur par email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      console.error('❌ Utilisateur non trouvé:', email);
      console.error('Erreur:', profileError);
      process.exit(1);
    }

    console.log(`✅ Utilisateur trouvé: ${profile.full_name || 'N/A'} (ID: ${profile.id})`);

    // Vérifier les tokens actuels
    const { data: existingTokens, error: tokensError } = await supabase
      .from('user_tokens')
      .select('tokens, package_name, purchase_date')
      .eq('user_id', profile.id)
      .single();

    if (tokensError && tokensError.code !== 'PGRST116') {
      console.error('❌ Erreur lors de la récupération des tokens:', tokensError);
      process.exit(1);
    }

    const currentTokens = existingTokens?.tokens || 0;
    const newTokenCount = currentTokens + tokensToAdd;

    console.log(`📊 Tokens actuels: ${currentTokens}`);
    console.log(`➕ Tokens à ajouter: ${tokensToAdd}`);
    console.log(`📈 Nouveau total: ${newTokenCount}`);

    // Mettre à jour ou créer les tokens (upsert)
    const { error: updateError } = await supabase
      .from('user_tokens')
      .upsert({
        user_id: profile.id,
        tokens: newTokenCount,
        package_name: existingTokens?.package_name || 'Manual Credit',
        purchase_date: existingTokens?.purchase_date || new Date().toISOString(),
        is_active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour des tokens:', updateError);
      process.exit(1);
    }

    console.log(`✅ Tokens crédités avec succès!`);
    console.log(`📊 Résumé:`);
    console.log(`   - Utilisateur: ${profile.full_name || 'N/A'} (${email})`);
    console.log(`   - Tokens ajoutés: ${tokensToAdd}`);
    console.log(`   - Ancien total: ${currentTokens}`);
    console.log(`   - Nouveau total: ${newTokenCount}`);
    console.log(`   - Raison: ${reason}`);

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
    process.exit(1);
  }
}

// Récupérer les arguments de la ligne de commande
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: node scripts/add-tokens-to-user.js <email> <tokens> [reason]');
  console.log('');
  console.log('Exemples:');
  console.log('  node scripts/add-tokens-to-user.js alexandre.saintetienne@gmail.com 200');
  console.log('  node scripts/add-tokens-to-user.js alexandre.saintetienne@gmail.com 200 "Crédit manuel"');
  process.exit(1);
}

const email = args[0];
const tokens = parseInt(args[1], 10);
const reason = args[2] || 'Crédit manuel';

if (isNaN(tokens) || tokens <= 0) {
  console.error('❌ Le nombre de tokens doit être un nombre positif');
  process.exit(1);
}

// Exécuter le script
addTokensToUser(email, tokens, reason)
  .then(() => {
    console.log('✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
