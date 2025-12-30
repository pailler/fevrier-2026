'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '../../../components/Breadcrumb';
import Link from 'next/link';
import { useCustomAuth } from '../../../hooks/useCustomAuth';

export default function PromptGeneratorCardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useCustomAuth();
  const [loading, setLoading] = useState(false);
  const [alreadyActivatedModules, setAlreadyActivatedModules] = useState<string[]>([]);
  const [checkingActivation, setCheckingActivation] = useState(false);

  const moduleId = 'prompt-generator';
  const isFreeModule = false; // Module payant : 100 tokens par accès

  // Fonction pour vérifier si un module est déjà activé
  const checkModuleActivation = useCallback(async (moduleId: string) => {
    if (!user?.id || !moduleId) return false;
    
    try {
      const response = await fetch('/api/check-module-activation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleId: moduleId,
          userId: user.id
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return result.isActivated || false;
      }
    } catch (error) {
      console.error('Erreur lors de la vérification d\'activation:', error);
    }
    return false;
  }, [user?.id]);

  // Ajouter les données structurées JSON-LD pour le SEO
  useEffect(() => {
    const softwareApplicationSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Générateur de prompts IA - IA Home",
      "applicationCategory": "WebApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "100",
        "priceCurrency": "TOKENS"
      },
      "description": "Générateur de prompts optimisés pour ChatGPT, Claude, Gemini et autres modèles de langage. Techniques avancées de prompt engineering : Zero-shot, Few-shot, Chain-of-Thought, ReAct, Self-Consistency, RAG. Basé sur Prompting Guide. Multi-langues, personnalisation avancée, génération avec GPT-4o-mini.",
      "url": "https://iahome.fr/card/prompt-generator",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "450"
      },
      "featureList": [
        "Génération de prompts optimisés",
        "Techniques avancées (Zero-shot, Few-shot, Chain-of-Thought, ReAct)",
        "Multi-langues (Français, Anglais, Espagnol, Allemand, Italien)",
        "Personnalisation (ton, créativité, longueur)",
        "Génération avec GPT-4o-mini",
        "Basé sur Prompting Guide",
        "Prompts marketing professionnels",
        "Copie en un clic"
      ]
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Qu'est-ce que le Générateur de prompts IA ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Le Générateur de prompts IA est un outil qui permet de créer des prompts optimisés et efficaces pour les modèles de langage (ChatGPT, Claude, Gemini, etc.) en utilisant les meilleures pratiques du prompt engineering. Basé sur le guide officiel de Prompting Guide, il offre des techniques avancées comme Zero-shot, Few-shot, Chain-of-Thought, ReAct, Self-Consistency, et RAG."
          }
        },
        {
          "@type": "Question",
          "name": "Comment utiliser le Générateur de prompts IA ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Pour utiliser le Générateur de prompts IA, activez d'abord le service avec 100 tokens. Une fois activé, accédez à l'interface, remplissez le formulaire intuitif avec vos paramètres (type de tâche, technique, langue, ton, créativité, longueur), et l'IA génère automatiquement un prompt optimisé. Vous pouvez ensuite copier le prompt en un clic et l'utiliser avec ChatGPT, Claude, Gemini ou tout autre modèle de langage."
          }
        },
        {
          "@type": "Question",
          "name": "Quelles techniques de prompting sont supportées ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Le Générateur de prompts IA supporte 6 techniques avancées : Zero-shot (sans exemples, pour tâches simples), Few-shot (avec exemples, pour guider le format), Chain-of-Thought (raisonnement étape par étape), ReAct (raisonnement + actions), Self-Consistency (plusieurs raisonnements), et RAG (Retrieval Augmented Generation pour enrichir avec connaissances externes)."
          }
        },
        {
          "@type": "Question",
          "name": "Le Générateur de prompts IA est-il gratuit ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "L'activation du Générateur de prompts IA coûte 100 tokens par accès. Une fois activé, vous avez un accès illimité pendant 90 jours. Il n'y a pas de frais supplémentaires pour la génération de prompts."
          }
        },
        {
          "@type": "Question",
          "name": "Puis-je créer des prompts marketing avec le Générateur de prompts IA ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Oui, le Générateur de prompts IA est particulièrement efficace pour créer des prompts marketing professionnels. Vous pouvez générer des stratégies marketing complètes, des campagnes publicitaires, des posts réseaux sociaux, des emails marketing, des landing pages, du contenu SEO, et bien plus. Cela peut remplacer une agence marketing à 3000€/mois, soit une économie de 36 000€/an."
          }
        },
        {
          "@type": "Question",
          "name": "Quels modèles de langage sont compatibles avec les prompts générés ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Les prompts générés sont compatibles avec tous les modèles de langage modernes : ChatGPT (OpenAI), Claude (Anthropic), Gemini (Google), Llama, Mistral, et bien d'autres. Les techniques de prompt engineering utilisées sont universelles et fonctionnent avec tous les modèles de langage basés sur des transformers."
          }
        },
        {
          "@type": "Question",
          "name": "Quelles langues sont supportées par le Générateur de prompts IA ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Le Générateur de prompts IA supporte 5 langues : Français, Anglais, Espagnol, Allemand, et Italien. Vous pouvez générer des prompts dans la langue de votre choix, ce qui est particulièrement utile pour créer du contenu marketing localisé ou pour travailler avec des modèles de langage dans différentes langues."
          }
        }
      ]
    };

    // Créer et ajouter le script pour SoftwareApplication
    const script1 = document.createElement('script');
    script1.type = 'application/ld+json';
    script1.id = 'software-application-schema-pg';
    script1.text = JSON.stringify(softwareApplicationSchema);
    
    // Créer et ajouter le script pour FAQPage
    const script2 = document.createElement('script');
    script2.type = 'application/ld+json';
    script2.id = 'faq-schema-pg';
    script2.text = JSON.stringify(faqSchema);

    // Vérifier si les scripts existent déjà avant de les ajouter
    if (!document.getElementById('software-application-schema-pg')) {
      document.head.appendChild(script1);
    }
    if (!document.getElementById('faq-schema-pg')) {
      document.head.appendChild(script2);
    }

    // Nettoyage lors du démontage
    return () => {
      const existingScript1 = document.getElementById('software-application-schema-pg');
      const existingScript2 = document.getElementById('faq-schema-pg');
      if (existingScript1) existingScript1.remove();
      if (existingScript2) existingScript2.remove();
    };
  }, []);

  // Vérifier si le module est activé
  useEffect(() => {
    const checkActivation = async () => {
      if (user?.id && moduleId) {
        setCheckingActivation(true);
        const isActivated = await checkModuleActivation(moduleId);
        if (isActivated) {
          setAlreadyActivatedModules(prev => [...prev, moduleId]);
        }
        setCheckingActivation(false);
      }
    };

    checkActivation();
  }, [user?.id, moduleId, checkModuleActivation]);

  const isModuleActivated = alreadyActivatedModules.includes(moduleId);

  // Timeout de sécurité pour authLoading
  useEffect(() => {
    if (authLoading) {
      const timeout = setTimeout(() => {
        console.warn('⚠️ Timeout authLoading - Arrêt après 8 secondes');
        // Le hook useCustomAuth gère son propre timeout, mais on peut forcer l'affichage
      }, 8000);
      
      return () => clearTimeout(timeout);
    }
  }, [authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de l'authentification...</p>
          <p className="text-sm text-gray-500 mt-2">Si le chargement prend trop de temps, veuillez rafraîchir la page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Fil d'Ariane */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 pt-2">
        <div className="max-w-7xl mx-auto px-6 py-1">
          <Breadcrumb 
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Générateur de prompts' }
            ]}
          />
        </div>
      </div>

      {/* Bannière spéciale */}
      <section className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 py-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-4 h-4 bg-yellow-300 rounded-full animate-bounce"></div>
          <div className="absolute top-20 right-20 w-3 h-3 bg-blue-300 rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 left-1/4 w-5 h-5 bg-green-300 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 right-1/3 w-2 h-2 bg-red-300 rounded-full animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1 max-w-2xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                Générateur de prompts IA : créez des prompts optimisés pour ChatGPT et autres modèles
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                PROMPT ENGINEERING
              </span>
              <p className="text-xl text-white/90 mb-6">
                Créez des prompts optimisés pour ChatGPT, Claude, Gemini et autres modèles de langage avec le Générateur de prompts IA. Techniques avancées : Zero-shot, Few-shot, Chain-of-Thought, ReAct. Basé sur Prompting Guide. Remplacez une agence marketing à 3000€/mois.
              </p>
              
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  ✨ Basé sur Prompting Guide
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🤖 OpenAI GPT-4
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🎯 Techniques avancées
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🌍 Multi-langues
                </span>
              </div>
            </div>
            
            {/* Logo animé */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                <div className="absolute top-0 left-0 w-24 h-24 bg-yellow-300 rounded-full opacity-80 animate-pulse"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-pink-300 rounded-lg opacity-80 animate-bounce"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-orange-300 transform rotate-45 opacity-80 animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-white rounded-full opacity-80 animate-bounce"></div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-sm rounded-full p-8 shadow-2xl border-4 border-purple-500/20">
                    <span className="text-8xl">📝</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section principale */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Colonne 1 - Description */}
          <div className="space-y-8">
            {/* Paragraphe citable par les IA (GEO) */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-2xl border-l-4 border-purple-500">
              <p className="text-lg leading-relaxed text-gray-800">
                <strong>Le Générateur de prompts IA permet de créer des prompts optimisés et efficaces pour les modèles de langage (ChatGPT, Claude, Gemini, etc.) en utilisant les meilleures pratiques du prompt engineering.</strong> Basé sur le guide officiel de Prompting Guide, il offre des techniques avancées comme Zero-shot, Few-shot, Chain-of-Thought, ReAct, Self-Consistency, et RAG. Avec support multi-langues, personnalisation avancée, et génération avec GPT-4o-mini, c'est l'outil idéal pour créer des prompts marketing professionnels qui peuvent remplacer une agence marketing à 3000€/mois.
              </p>
            </div>

            {/* H2 - À quoi sert le Générateur de prompts IA ? */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                À quoi sert le Générateur de prompts IA ?
              </h2>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg leading-relaxed">
                  Le Générateur de prompts IA permet de créer des prompts optimisés pour obtenir de meilleurs résultats avec les modèles de langage. Il répond aux besoins de ceux qui souhaitent améliorer leurs interactions avec ChatGPT, Claude, Gemini, ou créer des prompts marketing professionnels sans expertise en prompt engineering.
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li className="text-lg"><strong>Améliorer les résultats :</strong> Créez des prompts optimisés qui donnent de meilleurs résultats avec les modèles de langage</li>
                  <li className="text-lg"><strong>Économiser du temps :</strong> Générez des prompts professionnels en quelques secondes au lieu de les écrire manuellement</li>
                  <li className="text-lg"><strong>Techniques avancées :</strong> Utilisez des techniques de prompt engineering avancées sans expertise technique</li>
                  <li className="text-lg"><strong>Prompts marketing :</strong> Créez des prompts marketing professionnels qui peuvent remplacer une agence marketing à 3000€/mois</li>
                </ul>
                <p className="text-lg leading-relaxed mt-4">
                  <strong>Cas concrets d'utilisation :</strong> Créez des stratégies marketing complètes, générez des campagnes publicitaires, créez des posts réseaux sociaux engageants, rédigez des emails marketing, créez du contenu SEO, résolvez des problèmes mathématiques avec raisonnement détaillé, ou analysez des sentiments avec classification.
                </p>
              </div>
            </div>

            {/* H2 - Que peut faire le Générateur de prompts IA ? */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Que peut faire le Générateur de prompts IA ?
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                  <h3 className="text-2xl font-bold text-purple-900 mb-4">Techniques avancées</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Utilisez 6 techniques de prompt engineering : Zero-shot, Few-shot, Chain-of-Thought, ReAct, Self-Consistency, et RAG. Chaque technique est adaptée à différents types de tâches pour optimiser les résultats.
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-2xl border border-pink-200">
                  <h3 className="text-2xl font-bold text-pink-900 mb-4">Multi-langues</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Générez des prompts dans 5 langues : Français, Anglais, Espagnol, Allemand, et Italien. Parfait pour créer du contenu marketing localisé ou travailler avec des modèles dans différentes langues.
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
                  <h3 className="text-2xl font-bold text-orange-900 mb-4">Personnalisation avancée</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Personnalisez vos prompts avec le ton (professionnel, créatif, technique), la créativité (0.0-1.0), et la longueur de réponse souhaitée. Adaptez chaque prompt à vos besoins spécifiques.
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                  <h3 className="text-2xl font-bold text-blue-900 mb-4">Prompts marketing</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Créez des prompts marketing professionnels pour stratégies, campagnes, posts réseaux sociaux, emails, landing pages, contenu SEO. Remplacez une agence marketing à 3000€/mois.
                  </p>
                </div>
              </div>
            </div>


            {/* H2 - Générateur de prompts IA vs prompts manuels */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Générateur de prompts IA vs prompts manuels
              </h2>
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        <th className="border border-gray-300 p-4 text-left">Fonctionnalité</th>
                        <th className="border border-gray-300 p-4 text-center">Générateur de prompts IA</th>
                        <th className="border border-gray-300 p-4 text-center">Prompts manuels</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white">
                        <td className="border border-gray-300 p-4 font-semibold text-gray-900">Temps de création</td>
                        <td className="border border-gray-300 p-4 text-center text-gray-900">✅ Quelques secondes</td>
                        <td className="border border-gray-300 p-4 text-center text-gray-900">❌ Minutes ou heures</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 p-4 font-semibold text-gray-900">Techniques avancées</td>
                        <td className="border border-gray-300 p-4 text-center text-gray-900">✅ 6 techniques intégrées</td>
                        <td className="border border-gray-300 p-4 text-center text-gray-900">⚠️ Expertise requise</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="border border-gray-300 p-4 font-semibold text-gray-900">Optimisation</td>
                        <td className="border border-gray-300 p-4 text-center text-gray-900">✅ Basé sur Prompting Guide</td>
                        <td className="border border-gray-300 p-4 text-center text-gray-900">⚠️ Essais et erreurs</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border border-gray-300 p-4 font-semibold text-gray-900">Multi-langues</td>
                        <td className="border border-gray-300 p-4 text-center text-gray-900">✅ 5 langues supportées</td>
                        <td className="border border-gray-300 p-4 text-center text-gray-900">⚠️ Traduction manuelle</td>
                      </tr>
                      <tr className="bg-white">
                        <td className="border border-gray-300 p-4 font-semibold text-gray-900">Personnalisation</td>
                        <td className="border border-gray-300 p-4 text-center text-gray-900">✅ Avancée (ton, créativité, longueur)</td>
                        <td className="border border-gray-300 p-4 text-center text-gray-900">⚠️ Manuelle</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-6 text-gray-700 leading-relaxed">
                  <strong>En résumé :</strong> Le Générateur de prompts IA offre une alternative rapide et optimisée à la création manuelle de prompts. Contrairement aux prompts manuels qui nécessitent du temps et de l'expertise, le Générateur de prompts IA génère des prompts optimisés en quelques secondes en utilisant les meilleures pratiques du prompt engineering. C'est la solution idéale pour ceux qui veulent améliorer leurs résultats avec les modèles de langage sans expertise technique.
                </p>
              </div>
            </div>

            {/* H2 - Questions fréquentes sur le Générateur de prompts IA (FAQ) */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Questions fréquentes sur le Générateur de prompts IA (FAQ)
              </h2>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-l-4 border-purple-500">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Qu'est-ce que le Générateur de prompts IA ?</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Le Générateur de prompts IA est un outil qui permet de créer des prompts optimisés et efficaces pour les modèles de langage (ChatGPT, Claude, Gemini, etc.) en utilisant les meilleures pratiques du prompt engineering. Basé sur le guide officiel de Prompting Guide, il offre des techniques avancées comme Zero-shot, Few-shot, Chain-of-Thought, ReAct, Self-Consistency, et RAG.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-pink-50 to-orange-50 p-6 rounded-2xl border-l-4 border-pink-500">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Comment utiliser le Générateur de prompts IA ?</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Pour utiliser le Générateur de prompts IA, activez d'abord le service avec 100 tokens. Une fois activé, accédez à l'interface, remplissez le formulaire intuitif avec vos paramètres (type de tâche, technique, langue, ton, créativité, longueur), et l'IA génère automatiquement un prompt optimisé. Vous pouvez ensuite copier le prompt en un clic et l'utiliser avec ChatGPT, Claude, Gemini ou tout autre modèle de langage.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-2xl border-l-4 border-orange-500">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Quelles techniques de prompting sont supportées ?</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Le Générateur de prompts IA supporte 6 techniques avancées : Zero-shot (sans exemples, pour tâches simples), Few-shot (avec exemples, pour guider le format), Chain-of-Thought (raisonnement étape par étape), ReAct (raisonnement + actions), Self-Consistency (plusieurs raisonnements), et RAG (Retrieval Augmented Generation pour enrichir avec connaissances externes).
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-50 to-green-50 p-6 rounded-2xl border-l-4 border-yellow-500">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Le Générateur de prompts IA est-il gratuit ?</h3>
                  <p className="text-gray-700 leading-relaxed">
                    L'activation du Générateur de prompts IA coûte 100 tokens par accès. Une fois activé, vous avez un accès illimité pendant 90 jours. Il n'y a pas de frais supplémentaires pour la génération de prompts.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border-l-4 border-green-500">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Puis-je créer des prompts marketing avec le Générateur de prompts IA ?</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Oui, le Générateur de prompts IA est particulièrement efficace pour créer des prompts marketing professionnels. Vous pouvez générer des stratégies marketing complètes, des campagnes publicitaires, des posts réseaux sociaux, des emails marketing, des landing pages, du contenu SEO, et bien plus. Cela peut remplacer une agence marketing à 3000€/mois, soit une économie de 36 000€/an.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-2xl border-l-4 border-emerald-500">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Quels modèles de langage sont compatibles avec les prompts générés ?</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Les prompts générés sont compatibles avec tous les modèles de langage modernes : ChatGPT (OpenAI), Claude (Anthropic), Gemini (Google), Llama, Mistral, et bien d'autres. Les techniques de prompt engineering utilisées sont universelles et fonctionnent avec tous les modèles de langage basés sur des transformers.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-2xl border-l-4 border-teal-500">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Quelles langues sont supportées par le Générateur de prompts IA ?</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Le Générateur de prompts IA supporte 5 langues : Français, Anglais, Espagnol, Allemand, et Italien. Vous pouvez générer des prompts dans la langue de votre choix, ce qui est particulièrement utile pour créer du contenu marketing localisé ou pour travailler avec des modèles de langage dans différentes langues.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                À propos de l'application
              </h2>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg">
                  Le Générateur de prompts vous permet de créer des prompts optimisés et efficaces 
                  pour les modèles de langage (ChatGPT, Claude, Gemini, etc.) en utilisant les meilleures 
                  pratiques du prompt engineering basées sur le guide officiel de <a href="https://www.promptingguide.ai/fr" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800 underline">Prompting Guide</a>.
                </p>
                <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                  <p className="font-semibold text-purple-900 mb-2">✨ Fonctionnalités principales :</p>
                  <ul className="list-disc list-inside text-purple-800 space-y-1">
                    <li>Formulaire intuitif pour définir tous les paramètres</li>
                    <li>Techniques avancées : Zero-shot, Few-shot, Chain-of-Thought, ReAct</li>
                    <li>Multi-langues : Français, Anglais, Espagnol, Allemand, Italien</li>
                    <li>Personnalisation : Ton, créativité, longueur de réponse</li>
                    <li>Génération avec OpenAI GPT-4o-mini</li>
                    <li>Copie en un clic du prompt généré</li>
                    <li>100 tokens par accès</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section Techniques */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🎯 Techniques de Prompting
              </h2>
              <div className="space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="font-semibold text-blue-900 mb-2">Techniques supportées :</p>
                  <ul className="list-disc list-inside text-blue-800 space-y-2 text-sm">
                    <li><strong>Zero-shot:</strong> Sans exemples, pour des tâches simples et bien définies</li>
                    <li><strong>Few-shot:</strong> Avec exemples, pour guider le modèle vers le format attendu</li>
                    <li><strong>Chain-of-Thought:</strong> Raisonnement étape par étape pour améliorer la précision</li>
                    <li><strong>ReAct:</strong> Combinaison raisonnement + actions pour des tâches complexes</li>
                    <li><strong>Self-Consistency:</strong> Plusieurs raisonnements pour plus de cohérence</li>
                    <li><strong>RAG:</strong> Retrieval Augmented Generation pour enrichir avec des connaissances externes</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
          
          {/* Colonne 2 - Accès */}
          <div className="space-y-8">
            {/* Prix et activation */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
              <div className="text-center mb-8">
                <div className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-4 rounded-2xl shadow-lg mb-4">
                  <div className="text-4xl font-bold mb-1">
                    100 tokens
                  </div>
                  <div className="text-sm opacity-90">
                    par accès
                  </div>
                </div>
              </div>

              <div className="space-y-6">
              {isModuleActivated && (
                <div className="w-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-center space-x-3 text-green-800 mb-4">
                    <span className="text-2xl">✅</span>
                    <div className="text-center">
                      <p className="font-semibold">Service déjà activé !</p>
                      <p className="text-sm opacity-80">Pour y accéder, cliquez sur Mes Applis activées</p>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <Link
                      href="/encours"
                      className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md hover:shadow-lg"
                    >
                      <span className="mr-2">📱</span>
                      Aller à Mes Applications
                    </Link>
                  </div>
                </div>
              )}

              {!isModuleActivated && (
                <div className="w-full">
                  <button
                    onClick={async () => {
                      if (isAuthenticated && user) {
                        // Utilisateur connecté : activer prompt-generator via API
                        try {
                          setLoading(true);
                          const response = await fetch('/api/activate-prompt-generator', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              userId: user.id,
                              email: user.email
                            }),
                          });

                          if (response.ok) {
                            const data = await response.json();
                            if (data.success) {
                              console.log('✅ Générateur de prompts activé avec succès');
                              setAlreadyActivatedModules(prev => [...prev, moduleId]);
                              // Attendre un peu avant la redirection pour que l'état soit mis à jour
                              setTimeout(() => {
                                try {
                                  // Utiliser window.location.href pour éviter les problèmes avec router.push
                                  if (typeof window !== 'undefined') {
                                    window.location.href = '/encours';
                                  } else {
                                    try {
                                      router.push('/encours');
                                    } catch (err) {
                                      console.error('❌ Erreur router.push:', err);
                                    }
                                  }
                                } catch (redirectError) {
                                  console.error('❌ Erreur lors de la redirection:', redirectError);
                                  // Fallback : recharger la page si window est disponible
                                  if (typeof window !== 'undefined') {
                                    window.location.href = '/encours';
                                  }
                                  if (typeof window !== 'undefined') {
                                    window.location.href = '/encours';
                                  }
                                }
                              }, 500);
                            } else {
                              console.error('❌ Erreur activation Générateur de prompts:', data.error);
                              alert('Erreur lors de l\'activation: ' + (data.error || 'Erreur inconnue'));
                              setLoading(false);
                            }
                          } else {
                            let errorData;
                            try {
                              errorData = await response.json();
                            } catch (parseError) {
                              errorData = { error: `Erreur HTTP ${response.status}: ${response.statusText}` };
                            }
                            console.error('❌ Erreur réponse API:', response.status, errorData);
                            alert('Erreur lors de l\'activation: ' + (errorData.error || 'Erreur inconnue'));
                            setLoading(false);
                          }
                        } catch (error) {
                          console.error('❌ Erreur lors de l\'activation de Générateur de prompts:', error);
                          const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
                          alert('Erreur lors de l\'activation: ' + errorMessage);
                          setLoading(false);
                        }
                      } else {
                        // Utilisateur non connecté : aller à la page de connexion puis retour à la page actuelle
                        console.log('🔒 Accès Générateur de prompts - Redirection vers connexion');
                        router.push(`/login?redirect=${encodeURIComponent(`/card/${moduleId}`)}`);
                      }
                    }}
                    disabled={loading || checkingActivation}
                    className={`w-full font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3
                      ${loading || checkingActivation
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                      }`}
                  >
                    {loading || checkingActivation ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        <span>Activation en cours...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xl">🚀</span>
                        <span>
                          {isAuthenticated && user ? 'Activez Générateur de prompts (100 tokens)' : 'Connectez-vous pour activer (100 tokens)'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}
              </div>
            </div>

            {/* Section Caractéristiques techniques */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ⚙️ Caractéristiques techniques
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Modèle IA utilisé</span>
                  <span className="font-semibold text-gray-900">GPT-4o-mini</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Techniques supportées</span>
                  <span className="font-semibold text-gray-900">6 techniques</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Langues disponibles</span>
                  <span className="font-semibold text-gray-900">5 langues</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Types de tâches</span>
                  <span className="font-semibold text-gray-900">10 types</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Format de sortie</span>
                  <span className="font-semibold text-gray-900">Personnalisable</span>
                </div>
              </div>
            </div>


            {/* Section Ressources */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                📚 Ressources
              </h2>
              <div className="space-y-3">
                <a 
                  href="https://www.promptingguide.ai/fr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
                >
                  <span className="text-2xl">📖</span>
                  <div>
                    <p className="font-semibold text-purple-900">Prompt Engineering Guide</p>
                    <p className="text-xs text-purple-700">Guide complet sur le prompt engineering</p>
                  </div>
                </a>
                <a 
                  href="https://platform.openai.com/docs/guides/prompt-engineering" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                >
                  <span className="text-2xl">🤖</span>
                  <div>
                    <p className="font-semibold text-blue-900">OpenAI Best Practices</p>
                    <p className="text-xs text-blue-700">Meilleures pratiques OpenAI</p>
                  </div>
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

