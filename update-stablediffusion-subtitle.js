const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwNTMwNSwiZXhwIjoyMDY1OTgxMzA1fQ.CwVYrasKI78pAXnEfLMiamBIV_QtPQtwFJSmUJ68GQM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateStableDiffusionSubtitle() {
  try {
    console.log('🔄 Mise à jour du sous-titre StableDiffusion...');

    // Mise à jour StableDiffusion avec le nouveau sous-titre
    const { data, error } = await supabase
      .from('modules')
      .update({ 
        description: 'StableDiffusion : IA génératif spécialisé dans la création d\'images à partir de prompts'
      })
      .eq('id', 'stablediffusion')
      .select();

    if (error) {
      console.error('❌ Erreur StableDiffusion:', error);
    } else {
      console.log('✅ StableDiffusion mis à jour avec succès:', data);
    }

    console.log('🎉 Mise à jour terminée !');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

updateStableDiffusionSubtitle();
