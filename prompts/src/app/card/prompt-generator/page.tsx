'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
// Note: Ce fichier est dans prompts/ mais devrait être dans src/app/card/prompt-generator/
// Les imports sont corrigés pour pointer vers le projet principal
import Breadcrumb from '../../../../../src/components/Breadcrumb';
import Link from 'next/link';
import { useCustomAuth } from '../../../../../src/hooks/useCustomAuth';

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
                🚀 Générateur de prompts
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                PROMPT ENGINEERING
              </span>
              <p className="text-xl text-white/90 mb-6">
                Créez des prompts optimisés pour ChatGPT et autres modèles de langage en utilisant les meilleures pratiques du prompt engineering.
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

            {/* Section Économie Marketing */}
            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 backdrop-blur-md rounded-2xl shadow-xl border-2 border-green-500/30 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/20 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-200/20 rounded-full -ml-12 -mb-12"></div>
              <div className="relative z-10">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-4xl">💰</span>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Remplacez une agence marketing à 3000€/mois
                  </h2>
                </div>
                <div className="bg-white/80 rounded-xl p-6 mb-4 border border-green-200">
                  <p className="text-lg font-semibold text-gray-900 mb-3">
                    🎯 Économisez jusqu'à <span className="text-green-600 text-2xl">36 000€/an</span> avec des prompts marketing professionnels
                  </p>
                  <p className="text-sm text-gray-700 mb-4">
                    Créez vous-même tous les contenus marketing dont vous avez besoin : stratégies, campagnes, posts réseaux sociaux, emails, landing pages, et bien plus encore.
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-green-100 rounded-lg p-2">
                      <p className="font-semibold text-green-900">✅ Stratégies marketing</p>
                    </div>
                    <div className="bg-green-100 rounded-lg p-2">
                      <p className="font-semibold text-green-900">✅ Campagnes publicitaires</p>
                    </div>
                    <div className="bg-green-100 rounded-lg p-2">
                      <p className="font-semibold text-green-900">✅ Posts réseaux sociaux</p>
                    </div>
                    <div className="bg-green-100 rounded-lg p-2">
                      <p className="font-semibold text-green-900">✅ Emails marketing</p>
                    </div>
                    <div className="bg-green-100 rounded-lg p-2">
                      <p className="font-semibold text-green-900">✅ Landing pages</p>
                    </div>
                    <div className="bg-green-100 rounded-lg p-2">
                      <p className="font-semibold text-green-900">✅ Contenu SEO</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-4">
                  <p className="font-bold text-sm mb-2">💡 Exemple de prompt marketing :</p>
                  <p className="text-xs font-mono bg-white/20 rounded p-2 mb-2">
                    "Crée une stratégie marketing complète pour [votre secteur] avec : 
                    analyse de la cible, positionnement, plan de communication 3 mois, 
                    calendrier éditorial LinkedIn/Instagram, et KPIs de suivi."
                  </p>
                  <p className="text-xs opacity-90">
                    ⚡ Résultat : Une stratégie marketing complète en quelques minutes au lieu de plusieurs semaines
                  </p>
                </div>
              </div>
            </div>

            {/* Section Exemples d'utilisation */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                💡 Exemples d'utilisation
              </h2>
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-l-4 border-pink-500 p-4 rounded">
                  <p className="font-semibold text-pink-900 mb-2">📝 Génération de contenu marketing (remplace agence 3000€/mois)</p>
                  <p className="text-sm text-pink-800 mb-2">
                    Créez des stratégies marketing complètes, des campagnes publicitaires, des posts LinkedIn/Instagram engageants, 
                    des emails marketing, des landing pages, du contenu SEO, et bien plus encore.
                  </p>
                  <ul className="text-xs text-pink-700 space-y-1 list-disc list-inside">
                    <li>Type: Génération de texte / Stratégie</li>
                    <li>Technique: Zero-shot ou Chain-of-Thought</li>
                    <li>Ton: Professionnel / Marketing</li>
                    <li>💰 Économie: Jusqu'à 36 000€/an vs agence marketing</li>
                  </ul>
                  <div className="mt-3 p-2 bg-pink-100 rounded text-xs">
                    <p className="font-semibold text-pink-900 mb-1">Exemples de prompts :</p>
                    <ul className="text-pink-800 space-y-1 list-disc list-inside">
                      <li>"Stratégie marketing B2B pour SaaS avec plan 3 mois"</li>
                      <li>"Campagne LinkedIn pour lancement produit tech"</li>
                      <li>"Email marketing séquence onboarding client"</li>
                      <li>"Landing page optimisée conversion pour [produit]"</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="font-semibold text-blue-900 mb-2">🧮 Résolution de problèmes mathématiques</p>
                  <p className="text-sm text-blue-800 mb-2">
                    Générez des prompts pour résoudre des problèmes de géométrie, algèbre ou calcul avec raisonnement détaillé.
                  </p>
                  <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                    <li>Type: Raisonnement</li>
                    <li>Technique: Chain-of-Thought</li>
                    <li>Ton: Technique</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded">
                  <p className="font-semibold text-green-900 mb-2">📊 Classification de sentiment</p>
                  <p className="text-sm text-green-800 mb-2">
                    Analysez des avis clients, des commentaires ou des feedbacks avec des prompts de classification.
                  </p>
                  <ul className="text-xs text-green-700 space-y-1 list-disc list-inside">
                    <li>Type: Classification</li>
                    <li>Technique: Few-shot (avec exemples)</li>
                    <li>Format: JSON avec score de confiance</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Section Conseils */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                🎓 Conseils pour de meilleurs prompts
              </h2>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-start space-x-3">
                  <span className="text-xl">1️⃣</span>
                  <div>
                    <p className="font-semibold">Soyez spécifique</p>
                    <p className="text-sm text-gray-600">Plus votre objectif est précis, meilleur sera le prompt généré</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-xl">2️⃣</span>
                  <div>
                    <p className="font-semibold">Ajoutez du contexte</p>
                    <p className="text-sm text-gray-600">Le domaine et le contexte aident le modèle à mieux comprendre</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-xl">3️⃣</span>
                  <div>
                    <p className="font-semibold">Définissez des contraintes</p>
                    <p className="text-sm text-gray-600">Spécifiez la longueur, le style, le format attendu</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-xl">4️⃣</span>
                  <div>
                    <p className="font-semibold">Utilisez des exemples</p>
                    <p className="text-sm text-gray-600">Pour few-shot, fournissez 3-5 exemples de qualité</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-xl">5️⃣</span>
                  <div>
                    <p className="font-semibold">Ajustez la créativité</p>
                    <p className="text-sm text-gray-600">0.0-0.3: Précis | 0.4-0.7: Équilibré | 0.8-1.0: Créatif</p>
                  </div>
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
                <p className="text-sm text-gray-600">
                  Application IA premium - Accès illimité pendant 90 jours après activation
                </p>
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

            {/* Section Prompts Marketing */}
            <div className="bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 backdrop-blur-md rounded-2xl shadow-xl border-2 border-orange-500/30 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <span>🎯</span>
                <span>Prompts Marketing Professionnels</span>
              </h2>
              <p className="text-sm text-gray-700 mb-6">
                Remplacez une agence marketing à <span className="font-bold text-orange-600">3000€/mois</span> avec ces prompts prêts à l'emploi :
              </p>
              
              <div className="space-y-4">
                <div className="bg-white/90 rounded-lg p-4 border border-orange-200">
                  <p className="font-semibold text-orange-900 mb-2 text-sm">📊 Stratégie Marketing Complète</p>
                  <p className="text-xs text-gray-700 mb-2 font-mono bg-gray-50 p-2 rounded">
                    "Crée une stratégie marketing complète pour [secteur] avec analyse SWOT, 
                    personas cibles, positionnement, plan communication 3 mois, budget, et KPIs."
                  </p>
                  <p className="text-xs text-orange-700">💡 Remplace : Consultant stratégie (2000€/mois)</p>
                </div>

                <div className="bg-white/90 rounded-lg p-4 border border-pink-200">
                  <p className="font-semibold text-pink-900 mb-2 text-sm">📱 Campagne Réseaux Sociaux</p>
                  <p className="text-xs text-gray-700 mb-2 font-mono bg-gray-50 p-2 rounded">
                    "Génère un calendrier éditorial LinkedIn/Instagram 1 mois pour [marque] 
                    avec 20 posts engageants, hashtags, heures de publication optimales."
                  </p>
                  <p className="text-xs text-pink-700">💡 Remplace : Community Manager (1500€/mois)</p>
                </div>

                <div className="bg-white/90 rounded-lg p-4 border border-purple-200">
                  <p className="font-semibold text-purple-900 mb-2 text-sm">✉️ Email Marketing</p>
                  <p className="text-xs text-gray-700 mb-2 font-mono bg-gray-50 p-2 rounded">
                    "Crée une séquence email marketing 5 emails pour [objectif] avec 
                    sujets accrocheurs, corps optimisés, CTA, et timing d'envoi."
                  </p>
                  <p className="text-xs text-purple-700">💡 Remplace : Email Marketer (1200€/mois)</p>
                </div>

                <div className="bg-white/90 rounded-lg p-4 border border-orange-200">
                  <p className="font-semibold text-orange-900 mb-2 text-sm">🌐 Landing Page</p>
                  <p className="text-xs text-gray-700 mb-2 font-mono bg-gray-50 p-2 rounded">
                    "Génère le contenu d'une landing page optimisée conversion pour [produit] 
                    avec hero section, bénéfices, témoignages, FAQ, et CTA."
                  </p>
                  <p className="text-xs text-orange-700">💡 Remplace : Copywriter (1800€/mois)</p>
                </div>

                <div className="bg-white/90 rounded-lg p-4 border border-pink-200">
                  <p className="font-semibold text-pink-900 mb-2 text-sm">🔍 Contenu SEO</p>
                  <p className="text-xs text-gray-700 mb-2 font-mono bg-gray-50 p-2 rounded">
                    "Crée un article SEO 2000 mots sur [mot-clé] avec structure H1-H6, 
                    mots-clés LSI, meta description, et balises optimisées."
                  </p>
                  <p className="text-xs text-pink-700">💡 Remplace : SEO Content Writer (1500€/mois)</p>
                </div>
              </div>

              <div className="mt-6 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl p-4">
                <p className="font-bold text-sm mb-1">💰 Économie totale :</p>
                <p className="text-2xl font-bold mb-2">36 000€/an</p>
                <p className="text-xs opacity-90">vs agence marketing complète à 3000€/mois</p>
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

