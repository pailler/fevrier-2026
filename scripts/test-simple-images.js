// Script simple pour tester l'affichage des images JPG
// Ce script vérifie que les images existent et sont accessibles

const fs = require('fs');
const path = require('path');

// Liste des images JPG à vérifier
const imagesToCheck = [
  '/images/chatgpt.jpg',
  '/images/stablediffusion.jpg',
  '/images/iaphoto.jpg',
  '/images/iatube.jpg',
  '/images/pdf-plus.jpg',
  '/images/psitransfer.jpg',
  '/images/librespeed.jpg',
  '/images/canvas-framework.jpg'
];

// Fonction de fallback du composant ModuleCard (simplifiée)
function getModuleImage(title) {
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

function testImages() {
  console.log('🧪 Test simple des images JPG...\n');

  // Test 1: Vérifier que les fichiers existent
  console.log('📁 Vérification des fichiers images:');
  let existingImages = 0;
  
  imagesToCheck.forEach(imagePath => {
    const fullPath = path.join(__dirname, '..', 'public', imagePath);
    const exists = fs.existsSync(fullPath);
    
    if (exists) {
      existingImages++;
      console.log(`  ✅ ${imagePath} - Existe`);
    } else {
      console.log(`  ❌ ${imagePath} - Manquant`);
    }
  });

  console.log(`\n📊 ${existingImages}/${imagesToCheck.length} images existent\n`);

  // Test 2: Tester la fonction de mapping
  console.log('🔗 Test de la fonction de mapping des modules:');
  
  const testModules = [
    'ChatGPT',
    'Stable Diffusion',
    'DALL-E',
    'Metube',
    'PDF+',
    'PSitransfer',
    'Librespeed',
    'Canvas Building Framework',
    'Module Inconnu'
  ];

  testModules.forEach(moduleTitle => {
    const imageUrl = getModuleImage(moduleTitle);
    console.log(`  ${moduleTitle} → ${imageUrl}`);
  });

  console.log('\n🎯 Résumé:');
  console.log(`  - Images disponibles: ${existingImages}/${imagesToCheck.length}`);
  console.log(`  - Modules testés: ${testModules.length}`);
  
  if (existingImages === imagesToCheck.length) {
    console.log('  ✅ Toutes les images sont disponibles');
  } else {
    console.log('  ⚠️  Certaines images sont manquantes');
  }

  console.log('\n💡 Les zones noires devraient maintenant être remplacées par des images JPG !');
}

// Exécuter le test
testImages();




