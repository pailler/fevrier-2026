const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwNTMwNSwiZXhwIjoyMDY1OTgxMzA1fQ.CwVYrasKI78pAXnEfLMiamBIV_QtPQtwFJSmUJ68GQM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateRuinedFooocusSubtitle() {
  try {
    console.log('🔄 Mise à jour du sous-titre RuinedFooocus...');

    // Mise à jour RuinedFooocus avec le nouveau sous-titre
    const { data, error } = await supabase
      .from('modules')
      .update({ 
        description: 'RuinedFooocus : Fork ultra-puissante avec une qualité de génération haut de gamme'
      })
      .eq('id', 'ruinedfooocus')
      .select();

    if (error) {
      console.error('❌ Erreur RuinedFooocus:', error);
    } else {
      console.log('✅ RuinedFooocus mis à jour avec succès:', data);
    }

    console.log('🎉 Mise à jour terminée !');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

updateRuinedFooocusSubtitle();
