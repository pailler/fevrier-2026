const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwNTMwNSwiZXhwIjoyMDY1OTgxMzA1fQ.CwVYrasKI78pAXnEfLMiamBIV_QtPQtwFJSmUJ68GQM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addSubtitleColumn() {
  try {
    console.log('🔄 Ajout de la colonne subtitle...');

    // D'abord, vérifier la structure actuelle de la table
    const { data: modules, error: fetchError } = await supabase
      .from('modules')
      .select('*')
      .limit(1);

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération des modules:', fetchError);
      return;
    }

    console.log('📋 Structure actuelle de la table modules:', Object.keys(modules[0] || {}));

    // Mettre à jour les modules avec les nouvelles descriptions qui incluent les sous-titres
    const updates = [
      {
        id: 'whisper',
        description: 'Whisper IA : Transformez vos fichiers audio, vidéo et images en texte avec une précision exceptionnelle grâce aux technologies OpenAI Whisper et Tesseract OCR.'
      },
      {
        id: 'sdnext',
        description: 'SDNext : Expérience plus performante et moderne - Révolutionne la génération d\'images avec des modèles d\'IA de pointe et une interface ultra-rapide pour des résultats exceptionnels.'
      },
      {
        id: 'cogstudio',
        description: 'CogStudio IA : Plateforme node-based de nouvelle génération pour créer, organiser et exécuter des pipelines d\'IA génératives'
      },
      {
        id: 'comfyui',
        description: 'ComfyUI : Un contrôle total sur chaque étape de la création d\'image'
      }
    ];

    for (const update of updates) {
      const { data, error } = await supabase
        .from('modules')
        .update({ description: update.description })
        .eq('id', update.id)
        .select();

      if (error) {
        console.error(`❌ Erreur ${update.id}:`, error);
      } else {
        console.log(`✅ ${update.id} mis à jour:`, data);
      }
    }

    console.log('🎉 Mise à jour terminée !');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

addSubtitleColumn();
