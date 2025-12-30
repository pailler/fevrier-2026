/**
 * Script pour mettre à jour l'article Stable Diffusion avec un lien vers /card/stablediffusion
 * Exécuter avec: node scripts/update-stable-diffusion-article-link.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://xemtoyzcihmncbrlsmhr.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaGhtbmNicmxzbWhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwNTMwNSwiZXhwIjoyMDY1OTgxMzA1fQ.CwVYrasKI78pAXnEfLMiamBIV_QtPQtwFJSmUJ68GQM';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function updateArticle() {
  try {
    console.log('📝 Mise à jour de l\'article Stable Diffusion...');

    // Récupérer l'article actuel
    const { data: article, error: fetchError } = await supabase
      .from('blog_articles')
      .select('*')
      .eq('slug', 'ia-generative-stable-diffusion-alternative-chatbots-commerciaux')
      .single();

    if (fetchError || !article) {
      console.error('❌ Erreur lors de la récupération de l\'article:', fetchError);
      return;
    }

    console.log('✅ Article trouvé:', article.title);

    // Mettre à jour le contenu pour ajouter le lien vers /card/stablediffusion
    // Remplacer le lien existant dans la conclusion par le bon lien
    let updatedContent = article.content;
    
    // Remplacer le lien existant s'il y en a un
    updatedContent = updatedContent.replace(
      /href="\/card\/stablediffusion"/g,
      'href="https://iahome.fr/card/stablediffusion"'
    );

    // Si le lien n'existe pas encore, l'ajouter dans la conclusion
    if (!updatedContent.includes('https://iahome.fr/card/stablediffusion')) {
      // Remplacer le lien relatif par le lien absolu
      updatedContent = updatedContent.replace(
        /href="\/card\/stablediffusion"/g,
        'href="https://iahome.fr/card/stablediffusion"'
      );
      
      // Si toujours pas trouvé, ajouter le lien dans la conclusion
      if (!updatedContent.includes('https://iahome.fr/card/stablediffusion')) {
        updatedContent = updatedContent.replace(
          /<p><strong>Prêt à découvrir Stable Diffusion \? <a href="([^"]*)"[^>]*>Explorez notre module Stable Diffusion<\/a> et commencez à générer vos propres images dès aujourd'hui\.<\/strong><\/p>/,
          '<p><strong>Prêt à découvrir Stable Diffusion ? <a href="https://iahome.fr/card/stablediffusion" style="color: #2563eb; text-decoration: underline;">Explorez notre module Stable Diffusion</a> et commencez à générer vos propres images dès aujourd\'hui.</strong></p>'
        );
      }
    }

    // Mettre à jour l'article
    const { data: updatedArticle, error: updateError } = await supabase
      .from('blog_articles')
      .update({
        content: updatedContent
      })
      .eq('id', article.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Erreur lors de la mise à jour:', updateError);
      return;
    }

    console.log('✅ Article mis à jour avec succès !');
    console.log('🔗 Lien ajouté vers: https://iahome.fr/card/stablediffusion');
    console.log('\n🌐 URL de l\'article: https://iahome.fr/blog/' + updatedArticle.slug);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

updateArticle();

































