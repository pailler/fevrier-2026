const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwNTMwNSwiZXhwIjoyMDY1OTgxMzA1fQ.CwVYrasKI78pAXnEfLMiamBIV_QtPQtwFJSmUJ68GQM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUserTokensAndAddTokens() {
  try {
    console.log('🔧 Correction de la table user_tokens et ajout de tokens...');

    // 1. Supprimer la contrainte de clé étrangère existante
    console.log('1️⃣ Suppression de l\'ancienne contrainte...');
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE user_tokens DROP CONSTRAINT IF EXISTS user_tokens_user_id_fkey;'
    });

    if (dropError) {
      console.error('❌ Erreur suppression contrainte:', dropError);
      return;
    }
    console.log('✅ Ancienne contrainte supprimée');

    // 2. Ajouter une nouvelle contrainte de clé étrangère
    console.log('2️⃣ Ajout de la nouvelle contrainte...');
    const { error: addError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE user_tokens ADD CONSTRAINT user_tokens_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;`
    });

    if (addError) {
      console.error('❌ Erreur ajout contrainte:', addError);
      return;
    }
    console.log('✅ Nouvelle contrainte ajoutée');

    // 3. Insérer 10 tokens par défaut pour tous les utilisateurs
    console.log('3️⃣ Insertion des tokens par défaut...');
    const { error: insertError } = await supabase.rpc('exec_sql', {
      sql: `INSERT INTO user_tokens (user_id, tokens)
            SELECT id, 10 FROM profiles
            ON CONFLICT (user_id) DO NOTHING;`
    });

    if (insertError) {
      console.error('❌ Erreur insertion tokens:', insertError);
      return;
    }
    console.log('✅ Tokens par défaut insérés');

    // 4. Ajouter des tokens supplémentaires pour regispailler
    console.log('4️⃣ Ajout de tokens supplémentaires pour regispailler...');
    const userId = '77e8d61e-dbec-49fe-bd5a-517fc495c84a';
    
    const { error: updateError } = await supabase
      .from('user_tokens')
      .update({ tokens: 20 })
      .eq('user_id', userId);

    if (updateError) {
      console.error('❌ Erreur mise à jour tokens:', updateError);
    } else {
      console.log('✅ Tokens mis à jour pour regispailler: 20 tokens');
    }

    // 5. Vérifier le résultat
    console.log('5️⃣ Vérification...');
    const { data: userTokens, error: tokensError } = await supabase
      .from('user_tokens')
      .select('user_id, tokens')
      .eq('user_id', userId);

    if (tokensError) {
      console.error('❌ Erreur récupération tokens:', tokensError);
    } else {
      console.log('📊 Tokens pour regispailler:', userTokens[0]?.tokens || 'Non trouvé');
    }

    console.log('\n🎉 Script SQL exécuté avec succès !');
    console.log('💡 Les tokens devraient maintenant être persistés correctement.');

  } catch (error) {
    console.error('❌ Erreur exécution script:', error);
  }
}

fixUserTokensAndAddTokens();
