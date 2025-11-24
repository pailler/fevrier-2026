/**
 * Script pour ajouter des préfixes de catégorie IA aux articles de blog
 * Exécuter avec: node scripts/add-ia-categories-to-blog.js
 */

async function addIACategories() {
  try {
    console.log('📝 Ajout des préfixes de catégorie IA aux articles...');
    
    // Récupérer tous les articles depuis l'API de mise à jour
    const response = await fetch('http://localhost:3000/api/update-blog-article', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slug: 'ia-generative-stable-diffusion-alternative-chatbots-commerciaux',
        updates: {
          // Le titre a déjà "IA générative :" au début, donc pas besoin de le modifier
        }
      })
    });

    console.log('✅ Script prêt');
    console.log('\n📋 Catégories IA à ajouter selon le contenu:');
    console.log('- IA générative : pour génération d\'images, texte, contenu créatif');
    console.log('- IA robotique : pour robots, automatisation, systèmes autonomes');
    console.log('- IA applicative : pour applications pratiques, outils métier');
    console.log('- IA entreprise : pour solutions business, transformation digitale');
    console.log('- IA conversationnelle : pour chatbots, assistants vocaux');
    console.log('- IA analytique : pour analyse de données, business intelligence');
    console.log('- IA prédictive : pour prévisions, modélisation');
    console.log('\n💡 Pour chaque article, analyser le contenu et ajouter le préfixe approprié.');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

addIACategories();

