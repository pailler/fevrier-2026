const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertLangChainArticle() {
  try {
    // Lire le contenu HTML
    const htmlContent = fs.readFileSync('langchain-article.html', 'utf8');
    
    // Données de l'article
    const articleData = {
      title: "Le LangChain, qu'est-ce que c'est ?",
      slug: "langchain-qu-est-ce-que-c-est",
      content: htmlContent,
      excerpt: "Découvrez LangChain, le framework révolutionnaire qui simplifie le développement d'applications d'intelligence artificielle en connectant facilement les modèles de langage aux données et outils externes.",
      category: "resources",
      author: "IAHome Team",
      read_time: 8,
      published_at: new Date().toISOString(),
      status: "published",
      image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
    };

    // Insérer l'article
    const { data, error } = await supabase
      .from('blog_articles')
      .insert([articleData])
      .select();

    if (error) {
      console.error('Erreur lors de l\'insertion:', error);
      return;
    }

    console.log('Article LangChain inséré avec succès:', data[0]);
  } catch (error) {
    console.error('Erreur:', error);
  }
}

insertLangChainArticle();
