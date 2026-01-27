// Script Node.js pour désactiver l'activation de home-assistant pour "regis pailler"
// Usage: node scripts/deactivate-home-assistant-regis.js

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaGhtbmNicmxzbWhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwNTMwNSwiZXhwIjoyMDY1OTgxMzA1fQ.CwVYrasKI78pAXnEfLMiamBIV_QtPQtwFJSmUJ68GQM';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function deactivateHomeAssistant() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║  Désactivation Home Assistant - Regis Pailler        ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    // 1. Trouver l'utilisateur "regis pailler"
    console.log('🔍 Recherche de l\'utilisateur "regis pailler"...');
    
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .ilike('full_name', '%regis%pailler%');

    if (userError) {
      console.error('❌ Erreur lors de la recherche de l\'utilisateur:', userError);
      process.exit(1);
    }

    if (!users || users.length === 0) {
      console.error('❌ Utilisateur "regis pailler" non trouvé');
      process.exit(1);
    }

    // Prendre le premier utilisateur trouvé (ou celui qui correspond le mieux)
    const user = users.find(u => 
      u.full_name && u.full_name.toLowerCase().includes('regis') && 
      u.full_name.toLowerCase().includes('pailler')
    ) || users[0];

    console.log('✅ Utilisateur trouvé:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Nom: ${user.full_name}\n`);

    // 2. Trouver les activations de home-assistant pour cet utilisateur
    console.log('🔍 Recherche des activations de home-assistant...');
    
    const { data: activations, error: activationError } = await supabase
      .from('user_applications')
      .select('*')
      .eq('user_id', user.id)
      .eq('module_id', 'home-assistant')
      .eq('is_active', true);

    if (activationError) {
      console.error('❌ Erreur lors de la recherche des activations:', activationError);
      process.exit(1);
    }

    if (!activations || activations.length === 0) {
      console.log('⚠️  Aucune activation active de home-assistant trouvée pour cet utilisateur');
      console.log('   L\'application n\'est peut-être pas activée ou déjà désactivée.\n');
      process.exit(0);
    }

    console.log(`📋 ${activations.length} activation(s) trouvée(s):`);
    activations.forEach((activation, index) => {
      console.log(`   ${index + 1}. ID: ${activation.id}`);
      console.log(`      Module: ${activation.module_id}`);
      console.log(`      Titre: ${activation.module_title}`);
      console.log(`      Créé le: ${activation.created_at}`);
      console.log(`      Expire le: ${activation.expires_at || 'Jamais'}\n`);
    });

    // 3. Désactiver toutes les activations trouvées
    console.log('🔄 Désactivation des activations...');
    
    const activationIds = activations.map(a => a.id);
    const { data: updatedActivations, error: updateError } = await supabase
      .from('user_applications')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .in('id', activationIds)
      .select();

    if (updateError) {
      console.error('❌ Erreur lors de la désactivation:', updateError);
      process.exit(1);
    }

    console.log(`✅ ${updatedActivations?.length || 0} activation(s) désactivée(s) avec succès\n`);

    // 4. Résumé
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  RÉSUMÉ                                                ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log(`✅ Utilisateur: ${user.email} (${user.full_name})`);
    console.log(`✅ Activations désactivées: ${updatedActivations?.length || 0}`);
    console.log('\n✅ L\'application home-assistant a été désactivée pour cet utilisateur.');
    console.log('   Elle n\'apparaîtra plus dans la page /encours.');
    console.log('   L\'application et le workflow d\'activation restent intacts.\n');

  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
    process.exit(1);
  }
}

// Exécuter le script
deactivateHomeAssistant();
