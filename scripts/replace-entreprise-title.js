/**
 * Script pour remplacer le titre de l'article sur l'IA dans l'entreprise
 * Exécuter avec: node scripts/replace-entreprise-title.js
 */

async function updateArticleTitle(slug, newTitle) {
  try {
    const response = await fetch('http://localhost:3000/api/update-blog-article', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slug: slug,
        updates: {
          title: newTitle
        }
      })
    });

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Erreur updateArticleTitle:', error.message);
    return false;
  }
}

async function replaceTitle() {
  try {
    console.log('📝 Remplacement du titre de l\'article sur l\'IA dans l\'entreprise...');
    
    const slug = 'ia-entreprise-cas-usage';
    const newTitle = 'L\'IA dans l\'entreprise : Cas d\'usage concrets';
    
    console.log(`📝 Slug: ${slug}`);
    console.log(`   → Nouveau titre: "${newTitle}"\n`);
    
    const success = await updateArticleTitle(slug, newTitle);
    
    if (success) {
      console.log(`✅ Titre remplacé avec succès !`);
      console.log(`   "${newTitle}"`);
    } else {
      console.log(`❌ Erreur lors du remplacement`);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

replaceTitle();

