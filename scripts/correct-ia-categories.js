/**
 * Script pour corriger les catégories IA des articles existants
 * Exécuter avec: node scripts/correct-ia-categories.js
 */

async function getArticles() {
  try {
    const response = await fetch('http://localhost:3000/api/get-blog-articles');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    if (result.success && Array.isArray(result.articles)) {
      return result.articles;
    }
    
    return [];
  } catch (error) {
    console.error('Erreur getArticles:', error.message);
    return [];
  }
}

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

// Mapping des corrections spécifiques selon le slug ou le contenu
const categoryCorrections = {
  'ia-impression-3d': {
    from: 'IA générative',
    to: 'IA créative',
    reason: 'Article sur impression 3D'
  },
  'ia-aide-sans-remplacer': {
    from: 'IA générative',
    to: 'IA générale',
    reason: 'Article général sur l\'aide de l\'IA'
  },
  'democratiser-ia-pme': {
    from: 'IA générale',
    to: 'IA d\'entreprise',
    reason: 'Article sur les PME'
  },
  'applications-concretes-et-mesurables': {
    from: 'IA générative',
    to: 'IA générale',
    reason: 'Article général sur les applications'
  },
  'guide-tarification-solutions-ia': {
    from: 'IA générative',
    to: 'IA générale',
    reason: 'Guide général sur la tarification'
  }
};

function correctCategory(title, slug) {
  // Vérifier si une correction spécifique existe pour ce slug
  if (categoryCorrections[slug]) {
    const correction = categoryCorrections[slug];
    if (title.startsWith(correction.from + ' :')) {
      const newTitle = title.replace(correction.from + ' :', correction.to + ' :');
      return {
        corrected: true,
        newTitle: newTitle,
        reason: correction.reason
      };
    }
  }
  
  return { corrected: false };
}

async function correctCategories() {
  try {
    console.log('📝 Récupération de tous les articles...');
    const articles = await getArticles();
    
    if (!Array.isArray(articles)) {
      console.error('❌ Les articles ne sont pas un tableau:', typeof articles);
      return;
    }
    
    console.log(`✅ ${articles.length} articles trouvés\n`);
    
    if (articles.length === 0) {
      console.log('ℹ️  Aucun article trouvé.');
      return;
    }
    
    const updates = [];
    
    for (const article of articles) {
      const correction = correctCategory(article.title, article.slug);
      
      if (correction.corrected) {
        console.log(`📝 Article: "${article.title}"`);
        console.log(`   → Raison: ${correction.reason}`);
        console.log(`   → Nouveau titre: "${correction.newTitle}"\n`);
        
        updates.push({
          slug: article.slug,
          oldTitle: article.title,
          newTitle: correction.newTitle,
          reason: correction.reason
        });
      }
    }
    
    if (updates.length === 0) {
      console.log('✅ Aucune correction nécessaire.');
      return;
    }
    
    console.log(`\n📊 ${updates.length} articles à corriger\n`);
    
    // Appliquer les corrections
    for (const update of updates) {
      console.log(`📝 Correction: ${update.slug}...`);
      const success = await updateArticleTitle(update.slug, update.newTitle);
      if (success) {
        console.log(`✅ Corrigé: "${update.newTitle}"\n`);
      } else {
        console.log(`❌ Erreur lors de la correction de: ${update.slug}\n`);
      }
    }
    
    console.log('✅ Toutes les corrections terminées !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

correctCategories();

