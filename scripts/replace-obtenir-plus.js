/**
 * Script pour remplacer "Obtenir +" par "Cliquez ici" dans tous les articles de blog
 * Exécuter avec: node scripts/replace-obtenir-plus.js
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

async function updateArticleContent(slug, newContent) {
  try {
    const response = await fetch('http://localhost:3000/api/update-blog-article', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slug: slug,
        updates: {
          content: newContent
        }
      })
    });

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Erreur updateArticleContent:', error.message);
    return false;
  }
}

function replaceObtenirPlus(content) {
  // Remplacer "Obtenir +" par "Cliquez ici" dans tous les liens
  // Pattern pour trouver les liens avec "Obtenir +"
  const pattern = /(<a[^>]*>)(Obtenir \+)(<\/a>)/gi;
  
  const updatedContent = content.replace(pattern, '$1Cliquez ici$3');
  
  return updatedContent;
}

async function replaceAllObtenirPlus() {
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
      // Vérifier si l'article contient "Obtenir +"
      if (article.content && (article.content.includes('Obtenir +') || article.content.includes('obtenir +'))) {
        console.log(`📝 Article: "${article.title}"`);
        
        const updatedContent = replaceObtenirPlus(article.content);
        
        if (updatedContent !== article.content) {
          updates.push({
            slug: article.slug,
            title: article.title,
            newContent: updatedContent
          });
          console.log(`   → "Obtenir +" trouvé et remplacé\n`);
        }
      }
    }
    
    if (updates.length === 0) {
      console.log('✅ Aucun article ne contient "Obtenir +".');
      return;
    }
    
    console.log(`\n📊 ${updates.length} articles à mettre à jour\n`);
    
    // Appliquer les mises à jour
    for (const update of updates) {
      console.log(`📝 Mise à jour: ${update.slug}...`);
      const success = await updateArticleContent(update.slug, update.newContent);
      if (success) {
        console.log(`✅ "Obtenir +" remplacé par "Cliquez ici"\n`);
      } else {
        console.log(`❌ Erreur lors de la mise à jour de: ${update.slug}\n`);
      }
    }
    
    console.log('✅ Toutes les mises à jour terminées !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

replaceAllObtenirPlus();








