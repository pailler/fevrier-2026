// Script Node.js pour mettre à jour les modules avec leurs images JPG via Supabase
// Ce script élimine les zones noires en utilisant des images JPG simples

const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase (utiliser les variables d'environnement)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M';

const supabase = createClient(supabaseUrl, supabaseKey);

// Modules à ajouter/mettre à jour avec leurs images JPG
const modules = [
  {
    title: 'Librespeed',
    description: 'Testez votre connexion en toute liberté – sans pub, sans pistage!',
    category: 'WEB TOOLS',
    price: 0.00,
    image_url: '/images/librespeed.jpg',
    url: '/api/proxy-librespeed'
  },
  {
    title: 'PDF+',
    description: 'Un seul outil pour signer, modifier, convertir et sécuriser vos PDF',
    category: 'WEB TOOLS',
    price: 0.00,
    image_url: '/images/pdf-plus.jpg',
    url: '/api/proxy-pdf'
  },
  {
    title: 'Metube',
    description: 'Téléchargement de vidéos YouTube et autres plateformes',
    category: 'WEB TOOLS',
    price: 0.00,
    image_url: '/images/iatube.jpg',
    url: '/api/proxy-metube'
  },
  {
    title: 'PSitransfer',
    description: 'Transfert de fichiers sécurisé et simple',
    category: 'WEB TOOLS',
    price: 0.00,
    image_url: '/images/psitransfer.jpg',
    url: '/api/proxy-psitransfer'
  },
  {
    title: 'Stable Diffusion',
    description: 'Génération d\'images par IA avec Stable Diffusion',
    category: 'IA PHOTO',
    price: 15.00,
    image_url: '/images/stablediffusion.jpg',
    url: '/api/proxy-stablediffusion'
  },
  {
    title: 'Stable diffusion',
    description: 'Génération de vidéos par IA avec Stable Diffusion',
    category: 'IA VIDEO',
    price: 9.90,
    image_url: '/images/stablediffusion.jpg',
    url: '/api/proxy-stablediffusion-video'
  },
  {
    title: 'Canvas Building Framework',
    description: 'Framework de construction d\'applications avec Canvas',
    category: 'BUILDING BLOCKS',
    price: 0.00,
    image_url: '/images/canvas-framework.jpg',
    url: '/api/proxy-canvas'
  },
  {
    title: 'ChatGPT',
    description: 'Assistant IA conversationnel avancé',
    category: 'IA ASSISTANT',
    price: 0.00,
    image_url: '/images/chatgpt.jpg',
    url: '/api/proxy-chatgpt'
  },
  {
    title: 'IA Photo',
    description: 'Édition et génération d\'images par IA',
    category: 'IA PHOTO',
    price: 0.00,
    image_url: '/images/iaphoto.jpg',
    url: '/api/proxy-iaphoto'
  },
  {
    title: 'IA Tube',
    description: 'Gestion et téléchargement de vidéos avec IA',
    category: 'IA VIDEO',
    price: 0.00,
    image_url: '/images/iatube.jpg',
    url: '/api/proxy-iatube'
  }
];

async function updateModules() {
  console.log('🔄 Mise à jour des modules avec leurs images JPG...');

  try {
    // Vérifier d'abord les modules existants
    const { data: existingModules, error: fetchError } = await supabase
      .from('modules')
      .select('id, title, image_url');

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération des modules existants:', fetchError);
      return;
    }

    console.log(`📋 ${existingModules.length} modules existants trouvés`);

    // Mettre à jour ou insérer chaque module
    for (const module of modules) {
      const existingModule = existingModules.find(m => m.title === module.title);
      
      if (existingModule) {
        // Mettre à jour le module existant
        const { data, error } = await supabase
          .from('modules')
          .update({
            description: module.description,
            category: module.category,
            price: module.price,
            image_url: module.image_url,
            url: module.url,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingModule.id);

        if (error) {
          console.error(`❌ Erreur lors de la mise à jour de ${module.title}:`, error);
        } else {
          console.log(`✅ Module ${module.title} mis à jour`);
        }
      } else {
        // Insérer un nouveau module
        const { data, error } = await supabase
          .from('modules')
          .insert([{
            title: module.title,
            description: module.description,
            category: module.category,
            price: module.price,
            image_url: module.image_url,
            url: module.url,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);

        if (error) {
          console.error(`❌ Erreur lors de l'insertion de ${module.title}:`, error);
        } else {
          console.log(`✅ Module ${module.title} ajouté`);
        }
      }
    }

    // Vérifier le résultat final
    const { data: finalModules, error: finalError } = await supabase
      .from('modules')
      .select('id, title, category, price, image_url')
      .order('title');

    if (finalError) {
      console.error('❌ Erreur lors de la vérification finale:', finalError);
    } else {
      console.log('\n📊 Modules mis à jour:');
      finalModules.forEach(module => {
        const price = module.price === 0 ? 'Free' : `${module.price} €`;
        console.log(`  - ${module.title} (${module.category}) - ${price} - ${module.image_url}`);
      });
      console.log(`\n🎉 Total: ${finalModules.length} modules`);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le script
updateModules();




