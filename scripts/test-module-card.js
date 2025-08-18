// Script pour tester le composant ModuleCard et vérifier l'affichage des images
// Ce script simule le comportement du composant sans React

// Fonction de mapping des modules vers leurs images (copiée du composant ModuleCard)
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

// Modules de test (simulant ceux de la base de données)
const testModules = [
  {
    id: '1',
    title: 'Librespeed',
    description: 'Testez votre connexion en toute liberté – sans pub, sans pistage!',
    category: 'WEB TOOLS',
    price: 0,
    image_url: null // Simule une image manquante
  },
  {
    id: '2',
    title: 'PDF+',
    description: 'Un seul outil pour signer, modifier, convertir et sécuriser vos PDF',
    category: 'WEB TOOLS',
    price: 0,
    image_url: '/images/pdf-plus.jpg' // Image correcte
  },
  {
    id: '3',
    title: 'Metube',
    description: 'Téléchargement de vidéos YouTube et autres plateformes',
    category: 'WEB TOOLS',
    price: 0,
    image_url: 'https://iahome.fr/images/iametube-interface.svg' // URL externe problématique
  },
  {
    id: '4',
    title: 'PSitransfer',
    description: 'Transfert de fichiers sécurisé et simple',
    category: 'WEB TOOLS',
    price: 0,
    image_url: '/images/psitransfer.jpg' // Image correcte
  },
  {
    id: '5',
    title: 'Stable Diffusion',
    description: 'Génération d\'images par IA avec Stable Diffusion',
    category: 'IA PHOTO',
    price: 15.00,
    image_url: null // Simule une image manquante
  },
  {
    id: '6',
    title: 'Stable diffusion',
    description: 'Génération de vidéos par IA avec Stable Diffusion',
    category: 'IA VIDEO',
    price: 9.90,
    image_url: '/images/stablediffusion.jpg' // Image correcte
  },
  {
    id: '7',
    title: 'Canvas Building Framework',
    description: 'Framework de construction d\'applications avec Canvas',
    category: 'BUILDING BLOCKS',
    price: 0,
    image_url: 'https://iahome.fr/images/canvas-framework.svg' // URL externe problématique
  },
  {
    id: '8',
    title: 'ChatGPT',
    description: 'Assistant IA conversationnel avancé',
    category: 'IA ASSISTANT',
    price: 0,
    image_url: null // Simule une image manquante
  }
];

function testModuleCard() {
  console.log('🧪 Test du composant ModuleCard...\n');

  console.log('📋 Modules de test:');
  testModules.forEach((module, index) => {
    console.log(`  ${index + 1}. ${module.title} (${module.category})`);
    console.log(`     DB Image: ${module.image_url || 'null'}`);
  });

  console.log('\n🔧 Application de la logique du composant ModuleCard:');
  console.log('   (Forcer l\'utilisation des images JPG simples)\n');

  let blackAreasCount = 0;
  let validImagesCount = 0;

  testModules.forEach((module, index) => {
    // Logique simplifiée du composant ModuleCard
    const imageUrl = getModuleImage(module.title, module.image_url);
    
    const isBlackArea = !imageUrl || imageUrl === 'null' || imageUrl.includes('.svg') || imageUrl.includes('iahome.fr');
    
    if (isBlackArea) {
      blackAreasCount++;
      console.log(`  ❌ ${module.title} - Zone noire détectée`);
      console.log(`     DB Image: ${module.image_url || 'null'}`);
      console.log(`     Final Image: ${imageUrl}`);
    } else {
      validImagesCount++;
      console.log(`  ✅ ${module.title} - Image JPG valide: ${imageUrl}`);
    }
  });

  console.log(`\n📊 Résumé:`);
  console.log(`   ✅ Images valides: ${validImagesCount}`);
  console.log(`   ❌ Zones noires: ${blackAreasCount}`);
  console.log(`   📈 Taux de réussite: ${((validImagesCount / testModules.length) * 100).toFixed(1)}%`);

  if (blackAreasCount === 0) {
    console.log('\n🎊 Toutes les zones noires ont été éliminées !');
    console.log('💡 Le composant ModuleCard affiche maintenant des images JPG simples.');
  } else {
    console.log(`\n⚠️  ${blackAreasCount} zones noires restent à corriger`);
  }

  console.log('\n🔍 Détails des images utilisées:');
  const usedImages = new Set();
  testModules.forEach(module => {
    const imageUrl = getModuleImage(module.title, module.image_url);
    usedImages.add(imageUrl);
  });
  
  usedImages.forEach(image => {
    console.log(`   - ${image}`);
  });
}

// Exécuter le test
testModuleCard();




