// Script de test pour vérifier l'affichage des images
// Ce script simule le comportement du composant ModuleCard

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseKey);

// Fonction de fallback du composant ModuleCard
function getModuleImage(title, imageUrl) {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('chatgpt') || titleLower.includes('chat')) {
    return '/images/chatgpt.jpg';
  }
  
  if (titleLower.includes('stable') || titleLower.includes('diffusion') || titleLower.includes('sd')) {
    return '/images/stablediffusion.jpg';
  }
  
  if (titleLower.includes('photo') || titleLower.includes('image')) {
    return '/images/iaphoto.jpg';
  }
  
  if (titleLower.includes('tube') || titleLower.includes('youtube') || titleLower.includes('video') || titleLower.includes('metube')) {
    return '/images/iatube.jpg';
  }
  
  if (titleLower.includes('pdf') || titleLower.includes('pdf+')) {
    return '/images/pdf-plus.jpg';
  }
  
  if (titleLower.includes('psi') || titleLower.includes('transfer')) {
    return '/images/psitransfer.jpg';
  }
  
  if (titleLower.includes('librespeed')) {
    return '/images/librespeed.jpg';
  }
  
  if (titleLower.includes('canvas') || titleLower.includes('framework')) {
    return '/images/canvas-framework.jpg';
  }
  
  return '/images/chatgpt.jpg';
}

async function testImagesDisplay() {
  console.log('🧪 Test de l\'affichage des images...');

  try {
    // Récupérer tous les modules
    const { data: modules, error: fetchError } = await supabase
      .from('modules')
      .select('id, title, image_url, category');

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération des modules:', fetchError);
      return;
    }

    console.log(`📋 ${modules.length} modules trouvés\n`);

    // Tester chaque module
    let blackAreasCount = 0;
    let validImagesCount = 0;

    for (const module of modules) {
      // Logique du composant ModuleCard
      const finalImageUrl = module.image_url && module.image_url !== 'null' && !module.image_url.includes('.svg') && !module.image_url.includes('iahome.fr') 
        ? module.image_url 
        : getModuleImage(module.title, module.image_url);

      const isBlackArea = !finalImageUrl || finalImageUrl === 'null' || finalImageUrl.includes('.svg') || finalImageUrl.includes('iahome.fr');
      
      if (isBlackArea) {
        blackAreasCount++;
        console.log(`❌ ${module.title} - Zone noire détectée`);
        console.log(`   DB Image: ${module.image_url || 'null'}`);
        console.log(`   Final Image: ${finalImageUrl}`);
      } else {
        validImagesCount++;
        console.log(`✅ ${module.title} - Image JPG valide: ${finalImageUrl}`);
      }
    }

    console.log(`\n📊 Résumé:`);
    console.log(`   ✅ Images valides: ${validImagesCount}`);
    console.log(`   ❌ Zones noires: ${blackAreasCount}`);
    console.log(`   📈 Taux de réussite: ${((validImagesCount / modules.length) * 100).toFixed(1)}%`);

    if (blackAreasCount === 0) {
      console.log('\n🎊 Toutes les zones noires ont été éliminées !');
    } else {
      console.log(`\n⚠️  ${blackAreasCount} zones noires restent à corriger`);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testImagesDisplay();




