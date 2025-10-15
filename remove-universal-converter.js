const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwNTMwNSwiZXhwIjoyMDY1OTgxMzA1fQ.CwVYrasKI78pAXnEfLMiamBIV_QtPQtwFJSmUJ68GQM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeUniversalConverter() {
  try {
    console.log('🔄 Suppression du module Universal Converter...');

    // Supprimer le module Universal Converter de la base de données
    const { data, error } = await supabase
      .from('modules')
      .delete()
      .eq('id', 'converter')
      .select();

    if (error) {
      console.error('❌ Erreur lors de la suppression:', error);
    } else {
      console.log('✅ Module Universal Converter supprimé de la base de données:', data);
    }

    // Vérifier s'il y a d'autres modules avec "converter" dans le nom
    const { data: converterModules, error: searchError } = await supabase
      .from('modules')
      .select('*')
      .ilike('title', '%converter%');

    if (searchError) {
      console.error('❌ Erreur lors de la recherche:', searchError);
    } else if (converterModules && converterModules.length > 0) {
      console.log('📋 Autres modules avec "converter" trouvés:', converterModules);
      
      // Supprimer tous les modules contenant "converter"
      for (const module of converterModules) {
        const { data: deleteData, error: deleteError } = await supabase
          .from('modules')
          .delete()
          .eq('id', module.id)
          .select();

        if (deleteError) {
          console.error(`❌ Erreur suppression ${module.id}:`, deleteError);
        } else {
          console.log(`✅ Module ${module.id} supprimé:`, deleteData);
        }
      }
    } else {
      console.log('✅ Aucun autre module "converter" trouvé');
    }

    console.log('🎉 Suppression terminée !');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

removeUniversalConverter();
