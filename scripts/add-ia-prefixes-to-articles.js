/**
 * Script pour ajouter des préfixes de catégorie IA aux articles de blog
 * Exécuter avec: node scripts/add-ia-prefixes-to-articles.js
 */

const https = require('https');

const SUPABASE_URL = 'xemtoyzcihmncbrlsmhr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaGhtbmNicmxzbWhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwNTMwNSwiZXhwIjoyMDY1OTgxMzA1fQ.CwVYrasKI78pAXnEfLMiamBIV_QtPQtwFJSmUJ68GQM';

// Mapping des catégories IA selon les mots-clés dans le titre/contenu
// L'ordre est important : les catégories plus spécifiques doivent être vérifiées en premier
const IACategoryMapping = {
  'IA créative': ['impression 3d', '3d', 'fabrication', 'design', 'création', 'art', 'modélisation 3d', 'prototypage'],
  'IA générative': ['stable diffusion', 'génération', 'image', 'texte', 'dall-e', 'midjourney', 'gpt', 'chatgpt', 'claude', 'langchain', 'prompting'],
  'IA d\'entreprise': ['pme', 'petite entreprise', 'moyenne entreprise', 'tpe', 'entreprise', 'business', 'transformation', 'digital', 'organisation', 'grandes entreprises', 'cas d\'usage'],
  'IA générale': ['aide', 'applications', 'solutions', 'guide', 'démocratiser', 'accès'],
  'IA robotique': ['robot', 'automatisation', 'autonome', 'drone', 'véhicule autonome'],
  'IA applicative': ['application', 'outil', 'workflow', 'productivité', 'métier'],
  'IA conversationnelle': ['chatbot', 'assistant', 'conversation', 'dialogue', 'vocale'],
  'IA analytique': ['analyse', 'données', 'business intelligence', 'métriques', 'statistiques'],
  'IA prédictive': ['prédiction', 'modèle', 'forecast', 'prévision', 'tendance']
};

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

function detectIACategory(title, content) {
  const text = (title + ' ' + (content || '')).toLowerCase();
  
  // Vérifier si le titre commence déjà par une catégorie IA
  for (const category of Object.keys(IACategoryMapping)) {
    if (title.startsWith(category + ' :') || title.startsWith(category + ':')) {
      return null; // Déjà catégorisé
    }
  }
  
  // Détecter la catégorie selon les mots-clés
  for (const [category, keywords] of Object.entries(IACategoryMapping)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return category;
      }
    }
  }
  
  return 'IA applicative'; // Par défaut
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

async function addIAPrefixes() {
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
      const category = detectIACategory(article.title, article.content);
      
      if (category) {
        const newTitle = `${category} : ${article.title}`;
        console.log(`📝 Article: "${article.title}"`);
        console.log(`   → Catégorie détectée: ${category}`);
        console.log(`   → Nouveau titre: "${newTitle}"\n`);
        
        updates.push({
          id: article.id,
          slug: article.slug,
          oldTitle: article.title,
          newTitle: newTitle,
          category: category
        });
      } else {
        console.log(`✓ Article déjà catégorisé: "${article.title}"\n`);
      }
    }
    
    if (updates.length === 0) {
      console.log('✅ Tous les articles ont déjà un préfixe de catégorie IA.');
      return;
    }
    
    console.log(`\n📊 ${updates.length} articles à mettre à jour\n`);
    
    // Appliquer les mises à jour
    for (const update of updates) {
      console.log(`📝 Mise à jour: ${update.slug}...`);
      const success = await updateArticleTitle(update.slug, update.newTitle);
      if (success) {
        console.log(`✅ Mis à jour: "${update.newTitle}"\n`);
      } else {
        console.log(`❌ Erreur lors de la mise à jour de: ${update.slug}\n`);
      }
    }
    
    console.log('✅ Toutes les mises à jour terminées !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

addIAPrefixes();

