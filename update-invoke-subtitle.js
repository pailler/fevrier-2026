const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwNTMwNSwiZXhwIjoyMDY1OTgxMzA1fQ.CwVYrasKI78pAXnEfLMiamBIV_QtPQtwFJSmUJ68GQM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateInvokeSubtitle() {
  try {
    console.log('🔄 Mise à jour du sous-titre Invoke IA...');

    // Mise à jour Invoke IA avec le nouveau sous-titre
    const { data, error } = await supabase
      .from('modules')
      .update({ 
        description: 'Invoke IA : Suite d\'outils tout-en-un pour la génération d\'images'
      })
      .eq('id', 'invoke')
      .select();

    if (error) {
      console.error('❌ Erreur Invoke IA:', error);
    } else {
      console.log('✅ Invoke IA mis à jour avec succès:', data);
    }

    console.log('🎉 Mise à jour terminée !');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

updateInvokeSubtitle();
