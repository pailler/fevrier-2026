import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { message, userId, conversationHistory } = await request.json();

    // Vérification de l'authentification
    if (!userId) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    // Logique de réponse IA
    const response = await generateAIResponse(message, conversationHistory, userId);

    // Sauvegarder la conversation dans la base de données
    await saveConversation(userId, message, response);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Erreur dans l\'API chat:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

async function generateAIResponse(message: string, conversationHistory: any[], userId: string) {
  try {
    // Configuration OpenAI
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    console.log('🔍 Diagnostic Chatbot:');
    console.log('- OPENAI_API_KEY présent:', !!OPENAI_API_KEY);
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- Message utilisateur:', message.substring(0, 100) + '...');
    
    if (!OPENAI_API_KEY) {
      console.log('⚠️ Pas de clé OpenAI - Utilisation du fallback');
      // Fallback vers la logique simple si pas de clé API
      return await generateSimpleResponse(message, userId);
    }

    console.log('✅ Clé OpenAI trouvée - Utilisation de GPT-4');
    
    // Récupérer toutes les données contextuelles du projet IAHome
    const contextData = await getCompleteContextData(message, userId);
    
    console.log('📊 Données contextuelles récupérées:');
    console.log('- Modules:', contextData.modules ? 'Oui' : 'Non');
    console.log('- Articles:', contextData.blogArticles ? 'Oui' : 'Non');
    console.log('- Services:', contextData.servicesData ? 'Oui' : 'Non');

    // Préparer l'historique des conversations pour le contexte
    const messages = [
      {
        role: 'system',
        content: `Tu es IAHome Assistant, un assistant IA spécialisé dans l'aide aux utilisateurs de la plateforme IAHome.fr.

IAHome est une plateforme complète d'intelligence artificielle qui propose :

🎯 MODULES IA DISPONIBLES :
${contextData.modules}

📝 ARTICLES DE BLOG :
${contextData.blogArticles}

👥 UTILISATEURS ET ABONNEMENTS :
${contextData.userData}

💰 TARIFS ET PAIEMENTS :
${contextData.pricingData}

🔧 SERVICES ET OUTILS :
${contextData.servicesData}

📊 STATISTIQUES PLATEFORME :
${contextData.statsData}

🎨 FONCTIONNALITÉS SPÉCIALES :
- Génération d'images avec Stable Diffusion, ComfyUI, InvokeAI
- Traitement de documents PDF avec Stirling PDF
- Téléchargement de vidéos avec MeTube
- Transfert de fichiers avec PsiTransfer
- Tests de vitesse avec LibreSpeed
- Génération de QR codes
- Modèles 3D avec Blender
- Et bien plus encore !

💡 CAPACITÉS :
1. Aide technique complète sur tous les modules
2. Support utilisateur et résolution de problèmes
3. Informations sur les tarifs et abonnements
4. Guide d'utilisation des fonctionnalités
5. Recommandations personnalisées
6. Support en français uniquement
7. Réponses précises basées sur les vraies données de la plateforme

🎯 TON RÔLE :
- Répondre à toutes les questions sur IAHome
- Aider avec les problèmes techniques
- Expliquer les fonctionnalités
- Guider les utilisateurs
- Fournir des informations précises et à jour
- Être amical et professionnel

Réponds de manière détaillée et utile en te basant sur les vraies données de IAHome.`
      },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    console.log('🚀 Appel API OpenAI...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: messages,
        max_tokens: 1200,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      }),
    });

    console.log('📡 Réponse OpenAI:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur OpenAI:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Réponse OpenAI reçue avec succès');
    
    return data.choices[0]?.message?.content || 'Désolé, je n\'ai pas pu traiter votre demande.';
  } catch (error) {
    console.error('❌ Erreur OpenAI:', error);
    // Fallback vers la logique simple en cas d'erreur
    return await generateSimpleResponse(message, userId);
  }
}

async function getCompleteContextData(message: string, userId: string) {
  const lowerMessage = message.toLowerCase();
  
  try {
    // Récupérer tous les modules IA
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('*')
      .order('title', { ascending: true });

    // Récupérer les articles de blog
    const { data: articles, error: articlesError } = await supabase
      .from('blog_articles')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(15);

    // Récupérer les données utilisateur si demandé
    let userData = '';
    if (lowerMessage.includes('mon compte') || lowerMessage.includes('profil') || lowerMessage.includes('abonnement')) {
      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data: userSubscriptions, error: subError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId);

      if (!userError && userProfile) {
        userData = `Utilisateur: ${userProfile.email}, Rôle: ${userProfile.role || 'user'}`;
        if (!subError && userSubscriptions && userSubscriptions.length > 0) {
          userData += `\nAbonnements actifs: ${userSubscriptions.map(sub => sub.module_name).join(', ')}`;
        }
      }
    }

    // Récupérer les statistiques de la plateforme
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: totalModules } = await supabase
      .from('modules')
      .select('*', { count: 'exact', head: true });

    const { count: totalArticles } = await supabase
      .from('blog_articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');

    // Récupérer les services disponibles
    const servicesData = `
Services IA disponibles :
- Stable Diffusion (génération d'images)
- ComfyUI (workflows IA avancés)
- InvokeAI (interface moderne)
- RuinedFooocus (génération rapide)
- SDNext (optimisations)
- CogStudio (modèles personnalisés)
- Stirling PDF (traitement PDF)
- MeTube (téléchargement vidéos)
- PsiTransfer (transfert fichiers)
- LibreSpeed (tests de vitesse)
- QR Codes (génération QR)
- Blender 3D (modélisation 3D)
- ChatGPT (assistance IA)
- IA Photo (traitement photos)
- IA Tube (plateforme vidéo)
`;

    // Formater les données
    const modulesText = !modulesError && modules ? 
      modules.map(module => 
        `- ${module.title} (${module.category}, ${module.price}€): ${module.description}`
      ).join('\n') : 'Aucun module disponible';

    const articlesText = !articlesError && articles ? 
      articles.map(article => 
        `- ${article.title} (${article.category}): ${article.content.substring(0, 150)}...`
      ).join('\n') : 'Aucun article disponible';

    const statsText = `
Statistiques IAHome :
- ${totalUsers || 0} utilisateurs inscrits
- ${totalModules || 0} modules IA disponibles
- ${totalArticles || 0} articles de blog publiés
- Plateforme active 24/7
- Support multilingue
- Infrastructure cloud sécurisée
`;

    const pricingText = `
Tarification IAHome :
- Modules gratuits disponibles
- Abonnements à partir de 5€/mois
- Paiements sécurisés via Stripe
- Facturation automatique
- Support premium inclus
`;

    return {
      modules: modulesText,
      blogArticles: articlesText,
      userData: userData || 'Informations utilisateur non disponibles',
      servicesData,
      statsData: statsText,
      pricingData: pricingText
    };

  } catch (error) {
    console.error('Erreur récupération données:', error);
    return {
      modules: 'Erreur lors de la récupération des modules',
      blogArticles: 'Erreur lors de la récupération des articles',
      userData: 'Erreur lors de la récupération des données utilisateur',
      servicesData: 'Services IA disponibles (données limitées)',
      statsData: 'Statistiques non disponibles',
      pricingData: 'Tarification non disponible'
    };
  }
}

async function generateSimpleResponse(message: string, userId: string) {
  // Logique de réponse simple basée sur les mots-clés (fallback)
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut') || lowerMessage.includes('hello')) {
    return "Bonjour ! Je suis IAHome Assistant, votre assistant IA personnel. Je peux vous aider avec tous les modules IA, le support technique, les articles de blog, ou toute question sur la plateforme IAHome. Comment puis-je vous aider aujourd'hui ?";
  }
  
  if (lowerMessage.includes('aide') || lowerMessage.includes('support') || lowerMessage.includes('problème')) {
    return "Je suis là pour vous aider ! Je peux vous assister avec :\n• Les modules IA (Stable Diffusion, ComfyUI, etc.)\n• Les problèmes techniques\n• Les abonnements et paiements\n• Les articles de blog\n• L'utilisation de la plateforme\n\nPouvez-vous me décrire plus précisément votre besoin ?";
  }
  
  if (lowerMessage.includes('module') || lowerMessage.includes('application') || lowerMessage.includes('app')) {
    try {
      const { data: modules, error } = await supabase
        .from('modules')
        .select('title, category, price')
        .order('title', { ascending: true });
      
      if (!error && modules && modules.length > 0) {
        const modulesList = modules.map(m => `${m.title} (${m.price}€)`).join(', ');
        return `Nos modules IA disponibles incluent : ${modulesList}. Vous pouvez les trouver dans la section 'Mes applis' de votre tableau de bord. Chaque module a ses spécificités et fonctionnalités uniques.`;
      }
    } catch (error) {
      console.error('Erreur récupération modules:', error);
    }
    return "Nos modules IA sont disponibles dans la section 'Mes applis' de votre tableau de bord. Nous proposons Stable Diffusion, ComfyUI, InvokeAI, et bien d'autres outils d'intelligence artificielle.";
  }
  
  if (lowerMessage.includes('prix') || lowerMessage.includes('tarif') || lowerMessage.includes('coût') || lowerMessage.includes('abonnement')) {
    try {
      const { data: modules, error } = await supabase
        .from('modules')
        .select('title, price')
        .order('price', { ascending: true });
      
      if (!error && modules && modules.length > 0) {
        const priceRange = `de ${modules[0].price}€ à ${modules[modules.length - 1].price}€`;
        return `Nos tarifs varient ${priceRange} selon les modules. Nous proposons des abonnements flexibles avec paiements sécurisés via Stripe. Vous pouvez consulter les détails dans votre espace personnel.`;
      }
    } catch (error) {
      console.error('Erreur récupération prix:', error);
    }
    return "Nos tarifs varient selon les modules. Nous proposons des abonnements flexibles avec paiements sécurisés. Vous pouvez consulter les détails dans votre espace personnel.";
  }
  
  if (lowerMessage.includes('blog') || lowerMessage.includes('article') || lowerMessage.includes('publication')) {
    try {
      const { data: articles, error } = await supabase
        .from('blog_articles')
        .select('title, category')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (!error && articles && articles.length > 0) {
        const articlesList = articles.map(a => a.title).join(', ');
        return `Nos derniers articles de blog incluent : ${articlesList}. Vous pouvez les consulter dans la section Blog du site pour des tutoriels, actualités IA et guides d'utilisation.`;
      }
    } catch (error) {
      console.error('Erreur récupération articles:', error);
    }
    return "Nous avons des articles de blog intéressants sur l'IA et nos modules. Consultez la section Blog du site pour des tutoriels, actualités et guides d'utilisation.";
  }
  
  if (lowerMessage.includes('stable diffusion') || lowerMessage.includes('génération') || lowerMessage.includes('image')) {
    return "Stable Diffusion est notre module phare de génération d'images IA. Il vous permet de créer des images à partir de descriptions textuelles. Nous proposons plusieurs interfaces : Stable Diffusion WebUI, ComfyUI, et InvokeAI. Chaque interface a ses avantages selon vos besoins.";
  }
  
  if (lowerMessage.includes('technique') || lowerMessage.includes('bug') || lowerMessage.includes('erreur')) {
    return "Pour les problèmes techniques, voici quelques solutions :\n1. Vérifiez votre connexion internet\n2. Actualisez la page (F5)\n3. Videz le cache de votre navigateur\n4. Essayez un autre navigateur\n\nSi le problème persiste, contactez notre support technique. Je peux aussi vous aider à diagnostiquer le problème.";
  }
  
  if (lowerMessage.includes('compte') || lowerMessage.includes('profil') || lowerMessage.includes('mon espace')) {
    return "Votre espace personnel vous permet de :\n• Accéder à vos modules IA\n• Gérer vos abonnements\n• Consulter votre historique\n• Modifier vos informations\n• Accéder au support\n\nVous pouvez y accéder depuis le menu principal du site.";
  }
  
  return "Merci pour votre message ! Je suis IAHome Assistant et je peux vous aider avec :\n• Les modules IA (Stable Diffusion, ComfyUI, etc.)\n• Le support technique\n• Les abonnements et paiements\n• Les articles de blog\n• L'utilisation de la plateforme\n• Et bien plus encore !\n\nN'hésitez pas à me poser des questions spécifiques.";
}

async function saveConversation(userId: string, userMessage: string, aiResponse: string) {
  try {
    const { error } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: userId,
        user_message: userMessage,
        ai_response: aiResponse,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erreur sauvegarde conversation:', error);
    }
  } catch (error) {
    console.error('Erreur sauvegarde conversation:', error);
  }
} 