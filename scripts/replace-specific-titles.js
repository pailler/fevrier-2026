/**
 * Script pour remplacer des titres d'articles spécifiques
 * Exécuter avec: node scripts/replace-specific-titles.js
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

// Mapping des remplacements spécifiques
const titleReplacements = {
  'ia-domotique': {
    oldTitle: 'IA générative : L\'IA et la domotique',
    newTitle: 'IA et automatismes : La domotique'
  },
  'applications-concretes-et-mesurables': {
    oldTitle: 'IA générale : IA, applications concrètes et mesurables',
    newTitle: 'Futur de l\'IA : Applications concrètes et mesurables'
  },
  'ia-pour-grandes-entreprises': {
    oldTitle: 'IA générative : IA pour grandes entreprises',
    newTitle: 'IA et l\'entreprise : Les grandes entreprises'
  },
  'openai-a-devoile-son-tout-nouveau-guide-de-prompting-pour-gpt-5-1': {
    oldTitle: 'IA générative : OpenAI a dévoilé son tout nouveau guide de prompting pour GPT-5.1…',
    newTitle: 'Chatbots IA : OpenAI dévoile son tout nouveau guide de prompting pour GPT-5.1'
  }
};

async function replaceTitles() {
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
      const replacement = titleReplacements[article.slug];
      
      if (replacement) {
        // Vérifier si le titre actuel correspond (peut avoir des variations)
        if (article.title.includes(replacement.oldTitle.split(' : ')[1]) || 
            article.title.startsWith(replacement.oldTitle.split(' : ')[0])) {
          console.log(`📝 Article trouvé: "${article.title}"`);
          console.log(`   → Nouveau titre: "${replacement.newTitle}"\n`);
          
          updates.push({
            slug: article.slug,
            oldTitle: article.title,
            newTitle: replacement.newTitle
          });
        }
      }
    }
    
    if (updates.length === 0) {
      console.log('ℹ️  Aucun article à remplacer trouvé.');
      console.log('\n📋 Articles recherchés:');
      for (const [slug, replacement] of Object.entries(titleReplacements)) {
        console.log(`   - ${slug}: "${replacement.oldTitle}"`);
      }
      return;
    }
    
    console.log(`\n📊 ${updates.length} articles à remplacer\n`);
    
    // Appliquer les remplacements
    for (const update of updates) {
      console.log(`📝 Remplacement: ${update.slug}...`);
      const success = await updateArticleTitle(update.slug, update.newTitle);
      if (success) {
        console.log(`✅ Remplacé: "${update.newTitle}"\n`);
      } else {
        console.log(`❌ Erreur lors du remplacement de: ${update.slug}\n`);
      }
    }
    
    console.log('✅ Tous les remplacements terminés !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

replaceTitles();

































