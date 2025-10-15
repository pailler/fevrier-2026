const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwNTMwNSwiZXhwIjoyMDY1OTgxMzA1fQ.CwVYrasKI78pAXnEfLMiamBIV_QtPQtwFJSmUJ68GQM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateModules() {
  try {
    console.log('🔄 Mise à jour des sous-titres des modules...');

    // Mise à jour SDNext
    const { data: sdnextData, error: sdnextError } = await supabase
      .from('modules')
      .update({ 
        subtitle: 'SDNext : Expérience plus performante et moderne',
        description: 'SDNext révolutionne la génération d\'images avec des modèles d\'IA de pointe et une interface ultra-rapide pour des résultats exceptionnels.'
      })
      .eq('id', 'sdnext')
      .select();

    if (sdnextError) {
      console.error('❌ Erreur SDNext:', sdnextError);
    } else {
      console.log('✅ SDNext mis à jour:', sdnextData);
    }

    // Mise à jour CogStudio
    const { data: cogstudioData, error: cogstudioError } = await supabase
      .from('modules')
      .update({ 
        subtitle: 'CogStudio IA : Plateforme node-based de nouvelle génération pour créer, organiser et exécuter des pipelines d\'IA génératives',
        description: 'CogStudio IA : Plateforme node-based de nouvelle génération pour créer, organiser et exécuter des pipelines d\'IA génératives'
      })
      .eq('id', 'cogstudio')
      .select();

    if (cogstudioError) {
      console.error('❌ Erreur CogStudio:', cogstudioError);
    } else {
      console.log('✅ CogStudio mis à jour:', cogstudioData);
    }

    // Mise à jour ComfyUI
    const { data: comfyuiData, error: comfyuiError } = await supabase
      .from('modules')
      .update({ 
        subtitle: 'ComfyUI : Un contrôle total sur chaque étape de la création d\'image',
        description: 'ComfyUI : Un contrôle total sur chaque étape de la création d\'image'
      })
      .eq('id', 'comfyui')
      .select();

    if (comfyuiError) {
      console.error('❌ Erreur ComfyUI:', comfyuiError);
    } else {
      console.log('✅ ComfyUI mis à jour:', comfyuiData);
    }

    // Mise à jour Whisper (déjà fait mais on s'assure)
    const { data: whisperData, error: whisperError } = await supabase
      .from('modules')
      .update({ 
        subtitle: 'Whisper IA : Transformez vos fichiers audio, vidéo et images en texte avec une précision exceptionnelle grâce aux technologies',
        description: 'Whisper IA : Transformez vos fichiers audio, vidéo et images en texte avec une précision exceptionnelle grâce aux technologies OpenAI Whisper et Tesseract OCR.'
      })
      .eq('id', 'whisper')
      .select();

    if (whisperError) {
      console.error('❌ Erreur Whisper:', whisperError);
    } else {
      console.log('✅ Whisper mis à jour:', whisperData);
    }

    console.log('🎉 Mise à jour terminée !');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

updateModules();
