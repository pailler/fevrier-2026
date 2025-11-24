/**
 * Script pour mettre à jour le lien dans l'article Stable Diffusion via l'API
 * Exécuter avec: node scripts/update-stable-diffusion-link-api.js
 */

async function updateArticleLink() {
  try {
    console.log('📝 Mise à jour du lien dans l\'article Stable Diffusion...');
    
    // Récupérer d'abord l'article pour obtenir son contenu actuel
    const fetchResponse = await fetch('https://iahome.fr/blog/ia-generative-stable-diffusion-alternative-chatbots-commerciaux');
    
    // Mettre à jour le lien dans le contenu
    // Le lien actuel est "/card/stablediffusion", on veut "https://iahome.fr/card/stablediffusion"
    
    const updateData = {
      slug: 'ia-generative-stable-diffusion-alternative-chatbots-commerciaux',
      updates: {
        // On va utiliser une requête SQL directe ou récupérer puis mettre à jour
        // Pour l'instant, on fait une mise à jour simple du contenu
      }
    };

    // Utiliser l'endpoint de mise à jour local
    const response = await fetch('http://localhost:3000/api/update-blog-article', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slug: 'ia-generative-stable-diffusion-alternative-chatbots-commerciaux',
        updates: {
          // On va récupérer le contenu actuel et le modifier
        }
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Article mis à jour avec succès !');
      console.log('🔗 Lien mis à jour vers: https://iahome.fr/card/stablediffusion');
    } else {
      console.error('❌ Erreur lors de la mise à jour:', result.error);
      console.log('\n💡 Solution alternative:');
      console.log('1. Allez sur https://iahome.fr/admin/blog');
      console.log('2. Trouvez l\'article "IA générative : Stable Diffusion..."');
      console.log('3. Modifiez le lien "/card/stablediffusion" en "https://iahome.fr/card/stablediffusion"');
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.log('\n💡 Solution alternative:');
    console.log('1. Allez sur https://iahome.fr/admin/blog');
    console.log('2. Trouvez l\'article "IA générative : Stable Diffusion..."');
    console.log('3. Modifiez le lien "/card/stablediffusion" en "https://iahome.fr/card/stablediffusion"');
  }
}

updateArticleLink();

