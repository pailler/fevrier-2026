/**
 * Script pour corriger les titres avec deux deux-points (::) en remplaçant par une virgule
 * Exécuter avec: node scripts/fix-double-colons-in-titles.js
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

function fixDoubleColons(title) {
  // Chercher les titres avec deux deux-points
  // Format attendu: "IA générative : Titre : Suite"
  // Remplacer par: "IA générative : Titre, Suite"
  
  // Compter les occurrences de " : "
  const matches = title.match(/ : /g);
  
  if (matches && matches.length >= 2) {
    // Remplacer le dernier " : " par ", "
    const lastIndex = title.lastIndexOf(' : ');
    if (lastIndex !== -1) {
      const newTitle = title.substring(0, lastIndex) + ', ' + title.substring(lastIndex + 3);
      return newTitle;
    }
  }
  
  return title; // Pas de changement nécessaire
}

async function fixTitles() {
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
      const fixedTitle = fixDoubleColons(article.title);
      
      if (fixedTitle !== article.title) {
        console.log(`📝 Article: "${article.title}"`);
        console.log(`   → Titre corrigé: "${fixedTitle}"\n`);
        
        updates.push({
          slug: article.slug,
          oldTitle: article.title,
          newTitle: fixedTitle
        });
      }
    }
    
    if (updates.length === 0) {
      console.log('✅ Aucun titre à corriger (pas de double deux-points trouvé).');
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

fixTitles();

































