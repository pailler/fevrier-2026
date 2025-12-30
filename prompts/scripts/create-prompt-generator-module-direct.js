const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwNTMwNSwiZXhwIjoyMDY1OTgxMzA1fQ.CwVYrasKI78pAXnEfLMiamBIV_QtPQtwFJSmUJ68GQM';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createPromptGeneratorModule() {
  try {
    console.log('🔄 Création du module Générateur de prompts dans Supabase...');

    // Vérifier si le module existe déjà
    const { data: existingModule, error: checkError } = await supabase
      .from('modules')
      .select('id, title')
      .eq('id', 'prompt-generator')
      .single();

    if (existingModule) {
      console.log('✅ Module Générateur de prompts existe déjà:', existingModule.id);
      console.log('📦 Titre:', existingModule.title);
      return {
        success: true,
        message: 'Module Générateur de prompts existe déjà',
        moduleId: existingModule.id
      };
    }

    // Créer le module
    const { data: newModule, error: createError } = await supabase
      .from('modules')
      .insert([{
        id: 'prompt-generator',
        title: 'Générateur de prompts',
        description: 'Créez des prompts optimisés pour ChatGPT et autres modèles de langage en utilisant les meilleures pratiques du prompt engineering.',
        category: 'IA',
        price: 100,
        url: 'http://localhost:9001/prompt-generator',
        image_url: '/images/prompt-generator.jpg',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (createError) {
      console.error('❌ Erreur création module:', createError);
      throw createError;
    }

    console.log('✅ Module Générateur de prompts créé avec succès:', newModule.id);
    console.log('📦 Titre:', newModule.title);
    console.log('📦 Catégorie:', newModule.category);
    console.log('📦 Prix:', newModule.price, 'tokens');

    return {
      success: true,
      message: 'Module Générateur de prompts créé avec succès',
      moduleId: newModule.id,
      module: newModule
    };

  } catch (error) {
    console.error('❌ Erreur lors de la création du module:', error);
    return {
      success: false,
      error: error.message || 'Erreur inconnue'
    };
  }
}

// Exécuter le script
createPromptGeneratorModule()
  .then(result => {
    if (result.success) {
      console.log('\n✅ Succès:', result.message);
      process.exit(0);
    } else {
      console.log('\n❌ Échec:', result.error);
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  });


