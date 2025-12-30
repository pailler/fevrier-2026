/**
 * Script pour corriger manuellement les liens d'articles spécifiques
 * Exécuter avec: node scripts/fix-specific-article-links.js
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

// Mapping spécifique pour corriger certains articles
const specificCorrections = {
  'openai-a-devoile-son-tout-nouveau-guide-de-prompting-pour-gpt-5-1': {
    app: 'Applications IA',
    url: 'https://iahome.fr/applications',
    name: 'nos applications IA'
  },
  'ia-domotique': {
    app: 'Applications IA',
    url: 'https://iahome.fr/applications',
    name: 'nos applications IA'
  },
  'democratiser-ia-pme': {
    app: 'Applications IA',
    url: 'https://iahome.fr/applications',
    name: 'nos applications IA'
  },
  'applications-concretes-et-mesurables': {
    app: 'Applications IA',
    url: 'https://iahome.fr/applications',
    name: 'nos applications IA'
  },
  'ia-entreprise-cas-usage': {
    app: 'Applications IA',
    url: 'https://iahome.fr/applications',
    name: 'nos applications IA'
  },
  'guide-tarification-solutions-ia': {
    app: 'Applications IA',
    url: 'https://iahome.fr/applications',
    name: 'nos applications IA'
  },
  'ia-pour-grandes-entreprises': {
    app: 'Applications IA',
    url: 'https://iahome.fr/applications',
    name: 'nos applications IA'
  }
};

function replaceConclusionLink(content, app) {
  // Remplacer tous les liens "Obtenir +" existants par le nouveau lien
  const linkPattern = /<a[^>]*href="[^"]*"[^>]*>Obtenir \+<\/a>/gi;
  
  const newLink = `<a href="${app.url}" style="color: #2563eb; text-decoration: underline; font-weight: 600;">Obtenir +</a>`;
  
  // Remplacer le lien dans la conclusion
  let updatedContent = content.replace(linkPattern, newLink);
  
  // Vérifier si le texte de la conclusion doit être mis à jour
  const conclusionPattern = /<p><strong>([^<]*(?:Prêt|Découvrir|Explorer|Commencer|Tester|Essayer)[^<]*)<\/strong><\/p>/i;
  const match = updatedContent.match(conclusionPattern);
  
  if (match) {
    // Remplacer la conclusion existante par une nouvelle avec le bon nom d'application
    const newConclusion = `<p><strong>Prêt à découvrir ${app.name} ? ${newLink} et commencez dès aujourd'hui.</strong></p>`;
    updatedContent = updatedContent.replace(conclusionPattern, newConclusion);
  } else {
    // Chercher le dernier paragraphe avec un lien "Obtenir +"
    const lastLinkPattern = /(<p><strong>[^<]*)(<a[^>]*href="[^"]*"[^>]*>Obtenir \+<\/a>)([^<]*<\/strong><\/p>)/i;
    const linkMatch = updatedContent.match(lastLinkPattern);
    if (linkMatch) {
      const newConclusion = `<p><strong>Prêt à découvrir ${app.name} ? ${newLink} et commencez dès aujourd'hui.</strong></p>`;
      updatedContent = updatedContent.replace(lastLinkPattern, newConclusion);
    }
  }
  
  return updatedContent;
}

async function fixSpecificArticleLinks() {
  try {
    console.log('📝 Récupération de tous les articles...');
    const articles = await getArticles();
    
    if (!Array.isArray(articles)) {
      console.error('❌ Les articles ne sont pas un tableau:', typeof articles);
      return;
    }
    
    console.log(`✅ ${articles.length} articles trouvés\n`);
    
    const updates = [];
    
    for (const article of articles) {
      const correction = specificCorrections[article.slug];
      
      if (correction) {
        console.log(`📝 Article: "${article.title}"`);
        console.log(`   → Correction: ${correction.app}`);
        console.log(`   → URL: ${correction.url}\n`);
        
        const updatedContent = replaceConclusionLink(article.content, correction);
        
        if (updatedContent !== article.content) {
          updates.push({
            slug: article.slug,
            title: article.title,
            app: correction.app,
            url: correction.url,
            newContent: updatedContent
          });
        } else {
          console.log(`   ℹ️  Aucun changement nécessaire\n`);
        }
      }
    }
    
    if (updates.length === 0) {
      console.log('✅ Aucun article à corriger.');
      return;
    }
    
    console.log(`\n📊 ${updates.length} articles à corriger\n`);
    
    // Appliquer les mises à jour
    for (const update of updates) {
      console.log(`📝 Correction: ${update.slug}...`);
      console.log(`   → Application: ${update.app}`);
      const success = await updateArticleContent(update.slug, update.newContent);
      if (success) {
        console.log(`✅ Corrigé avec lien vers: ${update.url}\n`);
      } else {
        console.log(`❌ Erreur lors de la correction de: ${update.slug}\n`);
      }
    }
    
    console.log('✅ Toutes les corrections terminées !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

fixSpecificArticleLinks();

































