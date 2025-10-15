const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwNTMwNSwiZXhwIjoyMDY1OTgxMzA1fQ.CwVYrasKI78pAXnEfLMiamBIV_QtPQtwFJSmUJ68GQM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateComfyUISubtitle() {
  try {
    console.log('🔄 Mise à jour du sous-titre ComfyUI...');

    // Mise à jour ComfyUI avec le nouveau sous-titre
    const { data, error } = await supabase
      .from('modules')
      .update({ 
        description: 'ComfyUI : Un contrôle total sur chaque étape de la création d\'image'
      })
      .eq('id', 'comfyui')
      .select();

    if (error) {
      console.error('❌ Erreur ComfyUI:', error);
    } else {
      console.log('✅ ComfyUI mis à jour avec succès:', data);
    }

    console.log('🎉 Mise à jour terminée !');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

updateComfyUISubtitle();
