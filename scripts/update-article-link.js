/**
 * Script pour mettre à jour le lien dans l'article Stable Diffusion
 * Exécuter avec: node scripts/update-article-link.js
 */

const articleData = {
  slug: 'ia-generative-stable-diffusion-alternative-chatbots-commerciaux',
  content: null // Sera récupéré puis mis à jour
};

async function updateArticleLink() {
  try {
    console.log('📝 Mise à jour du lien dans l\'article...');
    
    // D'abord, récupérer l'article actuel depuis l'API publique
    const articleUrl = `https://iahome.fr/blog/${articleData.slug}`;
    console.log('🔍 Récupération de l\'article depuis:', articleUrl);
    
    // Utiliser l'API Supabase directement via fetch pour mettre à jour
    // Note: Cette approche nécessite d'utiliser l'API interne ou de créer un endpoint de mise à jour
    console.log('⚠️  Pour mettre à jour l\'article, veuillez utiliser l\'interface admin ou créer un endpoint de mise à jour.');
    console.log('💡 Le lien dans l\'article doit pointer vers: https://iahome.fr/card/stablediffusion');
    console.log('\n📝 Pour mettre à jour manuellement:');
    console.log('1. Allez sur https://iahome.fr/admin/blog');
    console.log('2. Trouvez l\'article "IA générative : Stable Diffusion..."');
    console.log('3. Modifiez le lien "/card/stablediffusion" en "https://iahome.fr/card/stablediffusion"');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

updateArticleLink();

























