import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Erreur parsing JSON:', parseError);
      return NextResponse.json(
        { error: 'Format de requête invalide' },
        { status: 400 }
      );
    }

    const { message, userId, conversationHistory } = body;

    // Le chatbot peut fonctionner sans authentification, mais on ne sauvegardera pas la conversation
    // Si userId est null, on utilise un ID temporaire pour la session
    const effectiveUserId = userId || 'anonymous';

    // Logique de réponse IA
    const response = await generateAIResponse(message, conversationHistory || [], effectiveUserId);

    // Sauvegarder la conversation dans la base de données seulement si l'utilisateur est authentifié
    if (userId) {
      await saveConversation(userId, message, response);
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Erreur dans l\'API chat:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur interne du serveur';
    console.error('Détails de l\'erreur:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

async function generateAIResponse(message: string, conversationHistory: any[], userId: string) {
  try {
    // Configuration OpenAI
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    // Vérification de la clé API
    if (!OPENAI_API_KEY) {
      console.log('⚠️ Pas de clé OpenAI - Utilisation du fallback');
      // Fallback vers la logique simple si pas de clé API
      return await generateSimpleResponse(message, userId);
    }
    
    // Récupérer les données contextuelles du projet IAHome (optimisé pour réduire les tokens)
    const contextData = await getCompleteContextData(message, userId);

    // Préparer l'historique des conversations pour le contexte
    const messages = [
      {
        role: 'system',
        content: `IAHome Assistant. Plateforme IA: IAHome.fr

MODULES: ${contextData.modules}

SERVICES: ${contextData.servicesData}

TARIFS: ${contextData.pricingData}

${contextData.statsData ? `STATS: ${contextData.statsData}\n` : ''}${contextData.userData ? `USER: ${contextData.userData}\n` : ''}Réponds en français, sois concis. Max 300 mots.`
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
        model: 'gpt-3.5-turbo', // Utiliser gpt-3.5-turbo au lieu de gpt-4 pour réduire les coûts
        messages: messages,
        max_tokens: 600, // Réduire de 1200 à 600 tokens
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
    ;
    
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

    // Récupérer les articles de blog (limité à 5 pour réduire les tokens)
    const { data: articles, error: articlesError } = await supabase
      .from('blog_articles')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(5);

    // Récupérer les données utilisateur si demandé (seulement si nécessaire)
    let userData = '';
    if (userId && userId !== 'anonymous' && (lowerMessage.includes('mon compte') || lowerMessage.includes('profil') || lowerMessage.includes('abonnement'))) {
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

    // Récupérer les statistiques de la plateforme (seulement si demandé pour économiser les tokens)
    let statsText = '';
    if (lowerMessage.includes('statistique') || lowerMessage.includes('nombre') || lowerMessage.includes('combien')) {
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: totalModules } = await supabase
        .from('modules')
        .select('*', { count: 'exact', head: true });

      statsText = `Stats: ${totalUsers || 0} utilisateurs, ${totalModules || 0} modules`;
    }

    // Services disponibles (version courte)
    const servicesData = `Services: Stable Diffusion, ComfyUI, RuinedFooocus, PDF, MeTube, PsiTransfer, LibreSpeed, QR Codes`;

    // Formater les données
    const modulesText = !modulesError && modules ? 
      modules.map(module => 
        `- ${module.title} (${module.category}, ${module.price} tokens): ${module.description}`
      ).join('\n') : 'Aucun module disponible';

    const articlesText = !articlesError && articles ? 
      articles.map(article => 
        `- ${article.title} (${article.category})`
      ).join('\n') : 'Aucun article disponible';

    // statsText est maintenant défini conditionnellement ci-dessus

    const pricingText = `Tarifs: Système de tokens. Modules: 10-100 tokens. Paiement Stripe.`;

    return {
      modules: modulesText,
      blogArticles: articlesText,
      userData: userData || '',
      servicesData,
      statsData: statsText || '',
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
        const modulesList = modules.map(m => `${m.title} (${m.price} tokens)`).join(', ');
        return `Nos modules IA disponibles incluent : ${modulesList}. Vous pouvez les trouver dans la section 'Mes applis' de votre tableau de bord. Chaque module a ses spécificités et fonctionnalités uniques.`;
      }
    } catch (error) {
      console.error('Erreur récupération modules:', error);
    }
    return "Nos modules IA sont disponibles dans la section 'Mes applis' de votre tableau de bord. Nous proposons Stable Diffusion, ComfyUI, et bien d'autres outils d'intelligence artificielle.";
  }
  
  if (lowerMessage.includes('prix') || lowerMessage.includes('tarif') || lowerMessage.includes('coût') || lowerMessage.includes('abonnement')) {
    try {
      const { data: modules, error } = await supabase
        .from('modules')
        .select('title, price')
        .order('price', { ascending: true });
      
      if (!error && modules && modules.length > 0) {
        const priceRange = `de ${modules[0].price} tokens à ${modules[modules.length - 1].price} tokens`;
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
    return "Stable Diffusion est notre module phare de génération d'images IA. Il vous permet de créer des images à partir de descriptions textuelles. Nous proposons plusieurs interfaces : Stable Diffusion WebUI et ComfyUI. Chaque interface a ses avantages selon vos besoins.";
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
    // Vérifier si userId est un UUID valide
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(userId)) {
      console.log('⚠️ userId non-UUID, sauvegarde ignorée:', userId);
      return;
    }

    // Vérifier si l'utilisateur existe dans la table profiles
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.log('⚠️ Utilisateur non trouvé, sauvegarde ignorée:', userId);
      return;
    }

    const { error } = await supabase
      .from('chatbot_config')
      .insert({
        user_id: userId,
        user_message: userMessage,
        ai_response: aiResponse,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erreur sauvegarde conversation:', error);
    } else {
      console.log('✅ Conversation sauvegardée pour user:', userId);
    }
  } catch (error) {
    console.error('Erreur sauvegarde conversation:', error);
  }
} 