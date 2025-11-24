/**
 * Script pour mettre à jour le lien dans l'article Stable Diffusion
 * Exécuter avec: node scripts/fix-stable-diffusion-link.js
 */

const https = require('https');

const SUPABASE_URL = 'xemtoyzcihmncbrlsmhr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaGhtbmNicmxzbWhyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDQwNTMwNSwiZXhwIjoyMDY1OTgxMzA1fQ.CwVYrasKI78pAXnEfLMiamBIV_QtPQtwFJSmUJ68GQM';
const SLUG = 'ia-generative-stable-diffusion-alternative-chatbots-commerciaux';

function getArticle() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SUPABASE_URL,
      path: `/rest/v1/blog_articles?slug=eq.${SLUG}&select=content,id`,
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const articles = JSON.parse(data);
          console.log('📊 Articles trouvés:', articles.length);
          if (articles && articles.length > 0) {
            resolve(articles[0]);
          } else {
            reject(new Error('Article non trouvé'));
          }
        } catch (e) {
          console.error('❌ Erreur parsing JSON:', e.message);
          console.log('📄 Données reçues:', data.substring(0, 200));
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

function updateArticle(id, updatedContent) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ content: updatedContent });
    
    const options = {
      hostname: SUPABASE_URL,
      path: `/rest/v1/blog_articles?id=eq.${id}`,
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          resolve(data); // Peut être vide
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function fixLink() {
  try {
    console.log('📝 Récupération de l\'article...');
    const article = await getArticle();
    
    console.log('✅ Article trouvé, ID:', article.id);
    
    // Mettre à jour le lien
    const updatedContent = article.content.replace(
      /href="\/card\/stablediffusion"/g,
      'href="https://iahome.fr/card/stablediffusion"'
    );
    
    if (updatedContent === article.content) {
      console.log('ℹ️  Le lien est déjà correct ou n\'existe pas dans le contenu.');
      // Vérifier s'il y a un lien relatif
      if (article.content.includes('/card/stablediffusion')) {
        console.log('⚠️  Un lien relatif existe mais n\'a pas été remplacé. Vérifiez le format.');
      } else {
        console.log('✅ Aucun lien à mettre à jour.');
      }
      return;
    }
    
    console.log('📝 Mise à jour du lien...');
    await updateArticle(article.id, updatedContent);
    
    console.log('✅ Article mis à jour avec succès !');
    console.log('🔗 Lien mis à jour vers: https://iahome.fr/card/stablediffusion');
    console.log('\n🌐 URL de l\'article: https://iahome.fr/blog/' + SLUG);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

fixLink();

