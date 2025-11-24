/**
 * Script pour ajouter un lien "Obtenir +" en conclusion de chaque article de blog
 * Exécuter avec: node scripts/add-links-to-blog-articles.js
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

// Mapping des applications IAHome selon les mots-clés dans le contenu
const appMapping = {
  'stablediffusion': {
    keywords: ['stable diffusion', 'génération d\'images', 'images', 'diffusion', 'modèles', 'lora', 'génération visuelle', 'création visuelle', 'langchain'],
    url: 'https://iahome.fr/card/stablediffusion',
    name: 'Stable Diffusion'
  },
  'whisper': {
    keywords: ['whisper', 'transcription', 'audio', 'voix', 'reconnaissance vocale', 'parole', 'sous-titres', 'aide sans remplacer'],
    url: 'https://iahome.fr/card/whisper',
    name: 'Whisper'
  },
  'qrcodes': {
    keywords: ['qr code', 'qrcode', 'code qr', 'code-barres', 'lien rapide'],
    url: 'https://iahome.fr/card/qrcodes',
    name: 'QR Codes'
  },
  'comfyui': {
    keywords: ['comfyui', 'comfy ui', 'workflow', 'génération avancée'],
    url: 'https://iahome.fr/card/comfyui',
    name: 'ComfyUI'
  },
  'ruinedfooocus': {
    keywords: ['fooocus', 'ruined fooocus', 'génération simplifiée'],
    url: 'https://iahome.fr/card/ruinedfooocus',
    name: 'Ruined Fooocus'
  },
  'hunyuan3d': {
    keywords: ['hunyuan', '3d', 'modélisation 3d', 'génération 3d', 'impression 3d', 'fabrication'],
    url: 'https://iahome.fr/card/hunyuan3d',
    name: 'Hunyuan3D'
  },
  'meeting-reports': {
    keywords: ['compte rendu', 'meeting', 'réunion', 'transcription réunion', 'rapport automatique'],
    url: 'https://iahome.fr/card/meeting-reports',
    name: 'Compte rendu automatique'
  },
  'code-learning': {
    keywords: ['apprendre code', 'programmation', 'python', 'développement', 'formation code', 'apprendre à coder'],
    url: 'https://iahome.fr/card/code-learning',
    name: 'Code Learning'
  },
  'pdf': {
    keywords: ['pdf', 'document', 'conversion', 'fichier pdf'],
    url: 'https://iahome.fr/card/pdf',
    name: 'PDF Tools'
  },
  'metube': {
    keywords: ['vidéo', 'youtube', 'téléchargement', 'média'],
    url: 'https://iahome.fr/card/metube',
    name: 'MeTube'
  },
  'psitransfer': {
    keywords: ['transfert', 'fichier', 'partage', 'upload'],
    url: 'https://iahome.fr/card/psitransfer',
    name: 'PsiTransfer'
  },
  'librespeed': {
    keywords: ['vitesse', 'internet', 'test', 'bande passante', 'connexion'],
    url: 'https://iahome.fr/card/librespeed',
    name: 'LibreSpeed'
  }
};

function detectApp(title, content) {
  const text = (title + ' ' + (content || '')).toLowerCase();
  
  // Mapping spécifique pour certains articles connus
  const specificMappings = {
    'chatbots': null, // Pas d'application spécifique pour les chatbots généraux
    'openai': null, // Pas d'application spécifique pour OpenAI général
    'gpt-5': null, // Pas d'application spécifique pour GPT-5
    'prompting': null, // Pas d'application spécifique pour le prompting général
    'domotique': null, // Pas d'application spécifique pour la domotique
    'automatismes': null, // Pas d'application spécifique pour les automatismes
    'pme': null, // Pas d'application spécifique pour les PME
    'entreprise': null, // Pas d'application spécifique pour l'entreprise générale
    'tarification': null, // Pas d'application spécifique pour la tarification
    'guide': null, // Pas d'application spécifique pour les guides généraux
  };
  
  // Vérifier les mappings spécifiques d'abord
  for (const [key, value] of Object.entries(specificMappings)) {
    if (text.includes(key)) {
      // Si null, on continue avec la détection normale
      if (value === null) {
        break; // Sortir de la boucle et continuer avec la détection normale
      }
      return value;
    }
  }
  
  // Compter les correspondances pour chaque application
  const scores = {};
  
  for (const [appId, appData] of Object.entries(appMapping)) {
    let score = 0;
    for (const keyword of appData.keywords) {
      const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = text.match(regex);
      if (matches) {
        score += matches.length;
      }
    }
    if (score > 0) {
      scores[appId] = score;
    }
  }
  
  // Retourner l'application avec le score le plus élevé seulement si le score est significatif
  if (Object.keys(scores).length > 0) {
    const bestMatch = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    // Seulement si le score est >= 2 ou si c'est une correspondance très spécifique
    if (bestMatch[1] >= 2 || bestMatch[0] === 'stablediffusion' || bestMatch[0] === 'hunyuan3d' || bestMatch[0] === 'whisper') {
      return appMapping[bestMatch[0]];
    }
  }
  
  // Par défaut, retourner null pour utiliser le lien générique vers /applications
  return null;
}

function addConclusionLink(content, app) {
  // Vérifier si un lien "Obtenir +" existe déjà dans la conclusion
  if (content.includes('Obtenir +') || content.includes('obtenir +')) {
    console.log('   ℹ️  Un lien "Obtenir +" existe déjà');
    return content; // Ne pas modifier
  }
  
  // Chercher la conclusion (dernier paragraphe avec <p><strong>)
  const conclusionPattern = /<p><strong>([^<]*(?:Prêt|Découvrir|Explorer|Commencer|Tester|Essayer)[^<]*)<\/strong><\/p>/i;
  const match = content.match(conclusionPattern);
  
  if (match) {
    // Remplacer la conclusion existante par une nouvelle avec le lien
    const newConclusion = `<p><strong>Prêt à découvrir ${app.name} ? <a href="${app.url}" style="color: #2563eb; text-decoration: underline; font-weight: 600;">Obtenir +</a> et commencez dès aujourd'hui.</strong></p>`;
    return content.replace(conclusionPattern, newConclusion);
  }
  
  // Si pas de conclusion trouvée, ajouter une nouvelle conclusion à la fin
  const closingDiv = '</div>';
  const newConclusion = `\n  <p><strong>Prêt à découvrir ${app.name} ? <a href="${app.url}" style="color: #2563eb; text-decoration: underline; font-weight: 600;">Obtenir +</a> et commencez dès aujourd'hui.</strong></p>\n${closingDiv}`;
  
  if (content.endsWith('</div>')) {
    return content.replace('</div>', newConclusion);
  }
  
  return content + newConclusion;
}

async function addLinksToArticles() {
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
      // Détecter l'application la plus pertinente
      const app = detectApp(article.title, article.content);
      
      if (app) {
        console.log(`📝 Article: "${article.title}"`);
        console.log(`   → Application détectée: ${app.name}`);
        console.log(`   → URL: ${app.url}\n`);
        
        // Ajouter le lien en conclusion
        const updatedContent = addConclusionLink(article.content, app);
        
        if (updatedContent !== article.content) {
          updates.push({
            slug: article.slug,
            title: article.title,
            app: app.name,
            url: app.url,
            newContent: updatedContent
          });
        } else {
          console.log(`   ℹ️  Lien déjà présent ou conclusion non modifiée\n`);
        }
      } else {
        console.log(`📝 Article: "${article.title}"`);
        console.log(`   ⚠️  Aucune application spécifique détectée`);
        console.log(`   💡 Lien vers /applications suggéré\n`);
        
        // Pour les articles sans application spécifique, ajouter un lien vers /applications
        if (!article.content.includes('Obtenir +') && !article.content.includes('obtenir +')) {
          const newConclusion = `\n  <p><strong>Découvrez toutes nos applications IA ? <a href="https://iahome.fr/applications" style="color: #2563eb; text-decoration: underline; font-weight: 600;">Obtenir +</a> et commencez dès aujourd'hui.</strong></p>\n</div>`;
          let updatedContent = article.content;
          if (updatedContent.endsWith('</div>')) {
            updatedContent = updatedContent.replace('</div>', newConclusion);
          } else {
            updatedContent = updatedContent + newConclusion;
          }
          
          updates.push({
            slug: article.slug,
            title: article.title,
            app: 'Applications IA',
            url: 'https://iahome.fr/applications',
            newContent: updatedContent
          });
        }
      }
    }
    
    if (updates.length === 0) {
      console.log('✅ Tous les articles ont déjà un lien en conclusion.');
      return;
    }
    
    console.log(`\n📊 ${updates.length} articles à mettre à jour\n`);
    
    // Appliquer les mises à jour
    for (const update of updates) {
      console.log(`📝 Mise à jour: ${update.slug}...`);
      console.log(`   → Application: ${update.app}`);
      const success = await updateArticleContent(update.slug, update.newContent);
      if (success) {
        console.log(`✅ Mis à jour avec lien vers: ${update.url}\n`);
      } else {
        console.log(`❌ Erreur lors de la mise à jour de: ${update.slug}\n`);
      }
    }
    
    console.log('✅ Toutes les mises à jour terminées !');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

addLinksToArticles();

