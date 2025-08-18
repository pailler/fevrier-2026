// Script Node.js pour corriger les modules sans images ou avec des URLs SVG
// Ce script remplace les zones noires par des images JPG simples

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapping des modules vers leurs images JPG appropriées
const imageMapping = {
  'Canva AI': '/images/chatgpt.jpg',
  'ChatGPT': '/images/chatgpt.jpg',
  'Cogstudio': '/images/stablediffusion.jpg',
  'ComfyUI': '/images/stablediffusion.jpg',
  'Copy.ai': '/images/chatgpt.jpg',
  'DALL-E': '/images/iaphoto.jpg',
  'Deemix': '/images/iatube.jpg',
  'Figma AI': '/images/chatgpt.jpg',
  'Grammarly': '/images/chatgpt.jpg',
  'Invoke': '/images/stablediffusion.jpg',
  'Jasper': '/images/chatgpt.jpg',
  'Librespeed': '/images/librespeed.jpg',
  'Metube': '/images/iatube.jpg',
  'Midjourney': '/images/iaphoto.jpg',
  'Notion AI': '/images/chatgpt.jpg',
  'PDF+': '/images/pdf-plus.jpg',
  'PSitransfer': '/images/psitransfer.jpg',
  'QR codes dynamiques': '/images/chatgpt.jpg',
  'ruinedfooocus': '/images/stablediffusion.jpg',
  'SDnext': '/images/stablediffusion.jpg',
  'Stable diffusion': '/images/stablediffusion.jpg',
  'Stable Diffusion': '/images/stablediffusion.jpg'
};

async function fixMissingImages() {
  console.log('🔄 Correction des modules sans images ou avec des URLs SVG...');

  try {
    // Récupérer tous les modules
    const { data: modules, error: fetchError } = await supabase
      .from('modules')
      .select('id, title, image_url, category');

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération des modules:', fetchError);
      return;
    }

    console.log(`📋 ${modules.length} modules trouvés`);

    // Identifier les modules à corriger
    const modulesToFix = modules.filter(module => {
      const hasNoImage = !module.image_url || module.image_url === 'null';
      const hasSvgImage = module.image_url && module.image_url.includes('.svg');
      const hasWrongUrl = module.image_url && module.image_url.includes('iahome.fr');
      
      return hasNoImage || hasSvgImage || hasWrongUrl;
    });

    console.log(`🔧 ${modulesToFix.length} modules à corriger`);

    // Corriger chaque module
    for (const module of modulesToFix) {
      const newImageUrl = imageMapping[module.title] || '/images/chatgpt.jpg';
      
      const { data, error } = await supabase
        .from('modules')
        .update({
          image_url: newImageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', module.id);

      if (error) {
        console.error(`❌ Erreur lors de la correction de ${module.title}:`, error);
      } else {
        console.log(`✅ ${module.title} corrigé: ${module.image_url} → ${newImageUrl}`);
      }
    }

    // Vérifier le résultat final
    const { data: finalModules, error: finalError } = await supabase
      .from('modules')
      .select('id, title, category, image_url')
      .order('title');

    if (finalError) {
      console.error('❌ Erreur lors de la vérification finale:', finalError);
    } else {
      console.log('\n📊 Modules corrigés:');
      finalModules.forEach(module => {
        const status = module.image_url && !module.image_url.includes('.svg') && !module.image_url.includes('iahome.fr') 
          ? '✅' : '❌';
        console.log(`  ${status} ${module.title} (${module.category}) - ${module.image_url}`);
      });
      
      const fixedCount = finalModules.filter(m => 
        m.image_url && !m.image_url.includes('.svg') && !m.image_url.includes('iahome.fr')
      ).length;
      
      console.log(`\n🎉 ${fixedCount}/${finalModules.length} modules ont des images JPG valides`);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le script
fixMissingImages();




