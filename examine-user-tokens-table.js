const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwNTMwNSwiZXhwIjoyMDY1OTgxMzA1fQ.CwVYrasKI78pAXnEfLMiamBIV_QtPQtwFJSmUJ68GQM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function examineUserTokensTable() {
  try {
    console.log('🔍 Examen de la table user_tokens existante...');

    // Vérifier la structure de la table
    const { data: testData, error: testError } = await supabase
      .from('user_tokens')
      .select('*')
      .limit(1);

    if (testError) {
      console.error('❌ Erreur accès table user_tokens:', testError);
      return;
    }

    console.log('📊 Structure de la table user_tokens:', testData);

    // Vérifier les contraintes de clé étrangère
    console.log('\n🔍 Test d\'insertion avec un utilisateur existant...');
    const testUserId = '77e8d61e-dbec-49fe-bd5a-517fc495c84a';
    
    // Essayer d'insérer un enregistrement de test
    const { data: insertData, error: insertError } = await supabase
      .from('user_tokens')
      .insert([{
        user_id: testUserId,
        tokens: 10
      }])
      .select();

    if (insertError) {
      console.error('❌ Erreur insertion test:', insertError);
      
      // Analyser l'erreur pour comprendre le problème
      if (insertError.code === '23503') {
        console.log('🔍 Erreur de clé étrangère détectée');
        console.log('💡 La table user_tokens référence probablement une table "users" qui n\'existe pas');
        console.log('💡 Il faut modifier la contrainte pour référencer "profiles" au lieu de "users"');
      }
    } else {
      console.log('✅ Insertion test réussie:', insertData);
      
      // Supprimer l'enregistrement de test
      if (insertData && insertData.length > 0) {
        const { error: deleteError } = await supabase
          .from('user_tokens')
          .delete()
          .eq('id', insertData[0].id);
        
        if (deleteError) {
          console.error('⚠️ Erreur suppression test:', deleteError);
        } else {
          console.log('🗑️ Enregistrement de test supprimé');
        }
      }
    }

  } catch (error) {
    console.error('❌ Erreur examen table:', error);
  }
}

examineUserTokensTable();
