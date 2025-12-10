/**
 * Script pour mettre à jour tous les articles de blog avec des préfixes de catégorie IA
 * Exécuter avec: node scripts/update-all-blog-titles.js
 */

async function updateAllArticles() {
  try {
    console.log('📝 Récupération de tous les articles...');
    
    // Récupérer tous les articles depuis l'API publique
    const response = await fetch('https://iahome.fr/blog');
    
    // Note: On va utiliser l'API locale pour récupérer les articles
    // Pour l'instant, on va créer un script qui met à jour l'article Stable Diffusion
    // et préparer la structure pour les autres articles
    
    console.log('✅ Script prêt pour mettre à jour les articles');
    console.log('\n📋 Catégories IA disponibles:');
    console.log('- IA générative (pour génération d\'images, texte, etc.)');
    console.log('- IA robotique (pour robots, automatisation)');
    console.log('- IA applicative (pour applications pratiques)');
    console.log('- IA entreprise (pour solutions business)');
    console.log('- IA conversationnelle (pour chatbots, assistants)');
    console.log('- IA analytique (pour analyse de données)');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

updateAllArticles();
























