'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '../../../components/Breadcrumb';
import Link from 'next/link';
import { useCustomAuth } from '../../../hooks/useCustomAuth';
import CardPageActivationSection from '../../../components/CardPageActivationSection';

export default function ApprendreAutrementCardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useCustomAuth();
  const [loading, setLoading] = useState(false);
  const [alreadyActivatedModules, setAlreadyActivatedModules] = useState<string[]>([]);
  const [checkingActivation, setCheckingActivation] = useState(false);

  const moduleId = 'apprendre-autrement';
  const isFreeModule = false; // Module payant : 10 tokens par accès

  // Fonction pour vérifier si un module est déjà accessible
  const checkModuleActivation = useCallback(async (moduleId: string) => {
    if (!user?.id || !moduleId) return false;
    
    try {
      const response = await fetch('/api/check-module-accès', {
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
      console.error('Erreur lors de la vérification d\'accès:', error);
    }
    return false;
  }, [user?.id]);

  // Vérifier si le module est accessible
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

  // Ajouter les données structurées JSON-LD pour le SEO
  useEffect(() => {
    const softwareApplicationSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Apprendre Autrement - IA Home",
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "10",
        "priceCurrency": "TOKENS"
      },
      "description": "Application éducative interactive pour enfants avec besoins spécifiques. Activités progressives, système de récompenses, encouragement vocal personnalisé, paramètres d'accessibilité adaptables.",
      "url": "https://iahome.fr/card/apprendre-autrement",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "100"
      },
      "featureList": [
        "Activités progressives",
        "Système de récompenses avec badges et niveaux",
        "Encouragement vocal personnalisé",
        "Paramètres d'accessibilité adaptables",
        "Interface multi-sensorielle",
        "Éducation adaptée pour besoins spécifiques",
        "Activités pour autisme, TDAH, dyslexie"
      ]
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Qu'est-ce qu'Apprendre Autrement ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Apprendre Autrement est une application éducative interactive conçue pour les enfants avec des besoins spécifiques. Elle propose des activités progressives, un système de récompenses avec badges et niveaux, et des paramètres d'accessibilité adaptables pour permettre à chaque enfant d'apprendre à son rythme de manière ludique et motivante."
          }
        },
        {
          "@type": "Question",
          "name": "Pour quels enfants est conçue cette application ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Apprendre Autrement est spécialement conçue pour les enfants avec des besoins spécifiques : autisme, TDAH, dyslexie, troubles d'apprentissage, ou tout enfant qui apprend mieux avec une approche ludique et personnalisée. L'application s'adapte aux différents styles d'apprentissage et aux besoins individuels."
          }
        },
        {
          "@type": "Question",
          "name": "Comment fonctionne le système de récompenses ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "L'application utilise un système de points, badges et niveaux pour motiver l'enfant. Chaque activité complétée rapporte des points, et l'enfant peut débloquer des badges et monter de niveau. L'encouragement vocal personnalisé avec le prénom de l'enfant renforce les réussites et maintient la motivation."
          }
        },
        {
          "@type": "Question",
          "name": "Quels sont les paramètres d'accessibilité disponibles ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Les paramètres d'accessibilité permettent d'adapter l'interface aux besoins spécifiques de chaque enfant : taille des éléments, couleurs, sons, encouragement vocal, et bien plus. Ces paramètres peuvent être ajustés à tout moment pour offrir une expérience personnalisée."
          }
        },
        {
          "@type": "Question",
          "name": "Combien coûte l'application ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "L'accès d'Apprendre Autrement coûte 10 tokens par accès. Utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiate, l'application est accessible depuis vos applications."
          }
        },
        {
          "@type": "Question",
          "name": "Les activités sont-elles adaptées aux enfants avec autisme ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Oui, les activités sont spécialement conçues pour être structurées, visuelles et adaptées aux besoins des enfants avec troubles du spectre autistique. L'interface claire, les activités progressives, et les paramètres d'accessibilité permettent une expérience adaptée et rassurante."
          }
        },
        {
          "@type": "Question",
          "name": "L'application peut-elle être utilisée à l'école ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Oui, Apprendre Autrement peut être utilisée à l'école, à la maison, ou dans tout environnement éducatif. L'application est accessible en ligne et peut être utilisée sur différents appareils (tablette, ordinateur, smartphone) pour offrir une flexibilité maximale."
          }
        }
      ]
    };

    // Créer et ajouter le script pour SoftwareApplication
    const script1 = document.createElement('script');
    script1.type = 'application/ld+json';
    script1.id = 'software-application-schema-aa';
    script1.text = JSON.stringify(softwareApplicationSchema);
    
    // Créer et ajouter le script pour FAQPage
    const script2 = document.createElement('script');
    script2.type = 'application/ld+json';
    script2.id = 'faq-schema-aa';
    script2.text = JSON.stringify(faqSchema);

    // Vérifier si les scripts existent déjà avant de les ajouter
    if (!document.getElementById('software-application-schema-aa')) {
      document.head.appendChild(script1);
    }
    if (!document.getElementById('faq-schema-aa')) {
      document.head.appendChild(script2);
    }

    // Nettoyage lors du démontage
    return () => {
      const existingScript1 = document.getElementById('software-application-schema-aa');
      const existingScript2 = document.getElementById('faq-schema-aa');
      if (existingScript1) existingScript1.remove();
      if (existingScript2) existingScript2.remove();
    };
  }, []);

  // Timeout de sécurité pour authLoading
  useEffect(() => {
    if (authLoading) {
      const timeout = setTimeout(() => {
        console.warn('⚠️ Timeout authLoading - Arrêt après 8 secondes');
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
              { label: 'Apprendre Autrement' }
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
                Apprendre Autrement : activités éducatives adaptées pour enfants avec besoins spécifiques
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                ÉDUCATION ADAPTÉE
              </span>
              <p className="text-xl text-white/90 mb-6">
                Apprendre Autrement est une application éducative interactive conçue pour les enfants avec des besoins spécifiques. Avec des activités progressives, un système de récompenses, et des paramètres d'accessibilité adaptables, chaque enfant peut apprendre à son rythme de manière ludique et motivante.
              </p>
              
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🎨 Multi-sensoriel
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  ⭐ Système de points
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🏆 Badges et niveaux
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🔊 Encouragement vocal
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
                    <span className="text-8xl">🌈</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section principale - Description (en haut de page) */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Colonne 1 - Description */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              À propos de l'application
            </h2>
            <div className="space-y-4 text-gray-700">
              <p className="text-lg">
                Cette application propose des activités interactives et amusantes pour apprendre 
                différemment. Chaque activité est conçue pour être courte, concrète 
                et adaptée aux enfants avec des besoins spécifiques.
              </p>
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                <p className="font-semibold text-purple-900 mb-2">✨ Fonctionnalités :</p>
                <ul className="list-disc list-inside text-purple-800 space-y-1">
                  <li>Activités progressives</li>
                  <li>Interface colorée et ludique</li>
                  <li>Système de progression avec récompenses</li>
                  <li>Encouragement vocal personnalisé</li>
                  <li>Paramètres d'accessibilité adaptables</li>
                  <li>Utilisez l'application aussi longtemps que vous souhaitez</li>
                </ul>
              </div>
            </div>
          </div>
    
          {/* Colonne 2 - Accès */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
            <div className="space-y-6">
              {isModuleActivated && (
                <div className="w-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-center space-x-3 text-green-800 mb-4">
                    <span className="text-2xl">✅</span>
                    <div className="text-center">
                      <p className="font-semibold">Accès direct disponible</p>
                      <p className="text-sm opacity-80">Pour y accéder, cliquez sur Mes applications</p>
                    </div>
                  </div>
                  <div className="mt-3 text-center">
                    <button
                      onClick={async () => {
                        if (!user?.id || !user?.email) {
                          router.push(`/login?redirect=${encodeURIComponent(`/card/${moduleId}`)}`);
                          return;
                        }
                        try {
                          const tokenResponse = await fetch('/api/generate-access-token', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              userId: user.id,
                              userEmail: user.email,
                              moduleId: 'apprendre-autrement',
                            }),
                          });
                          if (!tokenResponse.ok) {
                            const tokenError = await tokenResponse.json().catch(() => ({ error: 'Erreur inconnue' }));
                            throw new Error(tokenError.error || 'Erreur génération token');
                          }
                          const tokenData = await tokenResponse.json();
                          if (!tokenData?.token) {
                            throw new Error('Token d\'accès manquant');
                          }
                          window.open(`https://apprendre-autrement.iahome.fr?token=${encodeURIComponent(tokenData.token)}`, '_blank', 'noopener,noreferrer');
                        } catch (error) {
                          alert(`Erreur lors de l'accès: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
                        }
                      }}
                      className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md hover:shadow-lg"
                    >
                      <span className="mr-2">📱</span>
                      Aller à Mes Applications
                    </button>
                  </div>
                </div>
              )}

              {!isModuleActivated && (
                <div className="w-full">
                  <button
                    onClick={async () => {
                      if (isAuthenticated && user) {
                        // Utilisateur connecté : Accéder à apprendre-autrement via API
                        try {
                          setLoading(true);
                          const response = await fetch('/api/activate-apprendre-autrement', {
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
                              console.log('✅ Apprendre Autrement accessible avec succès');
                              setAlreadyActivatedModules(prev => [...prev, moduleId]);
                              const tokenResponse = await fetch('/api/generate-access-token', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  userId: user.id,
                                  userEmail: user.email,
                                  moduleId: 'apprendre-autrement',
                                }),
                              });
                              if (!tokenResponse.ok) {
                                const tokenError = await tokenResponse.json().catch(() => ({ error: 'Erreur inconnue' }));
                                throw new Error(tokenError.error || 'Erreur génération token');
                              }
                              const tokenData = await tokenResponse.json();
                              if (!tokenData?.token) {
                                throw new Error('Token d\'accès manquant');
                              }
                              window.open(`https://apprendre-autrement.iahome.fr?token=${encodeURIComponent(tokenData.token)}`, '_blank', 'noopener,noreferrer');
                            } else {
                              console.error('❌ Erreur accès Apprendre Autrement:', data.error);
                              alert('Erreur lors de l\'accès: ' + (data.error || 'Erreur inconnue'));
                            }
                          } else {
                            const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
                            console.error('❌ Erreur réponse API:', response.status, errorData);
                            alert('Erreur lors de l\'accès: ' + (errorData.error || 'Erreur inconnue'));
                          }
                        } catch (error) {
                          console.error('❌ Erreur lors de l\'accès de Apprendre Autrement:', error);
                          alert('Erreur lors de l\'accès');
                        } finally {
                          setLoading(false);
                        }
                      } else {
                        // Utilisateur non connecté : aller à la page de connexion puis retour à la page actuelle
                        console.log('🔒 Accès Apprendre Autrement - Redirection vers connexion');
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
                        <span>Ouverture en cours...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xl">🌈</span>
                        <span>
                          {isAuthenticated && user ? 'Accédez à Apprendre Autrement (10 tokens par accès)' : 'Connectez-vous pour accéder (10 tokens par accès)'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section SEO optimisée - Contenu structuré */}
      <section className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 py-8 w-full relative overflow-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-12 lg:p-16 hover:shadow-3xl transition-all duration-300">
            <div className="prose max-w-none">
              
              {/* Paragraphe citable par les IA (GEO) */}
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-2xl mb-8 border-l-4 border-purple-500">
                <p className="text-lg leading-relaxed text-gray-800">
                  <strong>Apprendre Autrement est une application éducative interactive conçue pour les enfants avec des besoins spécifiques.</strong> Avec des activités progressives, un système de récompenses avec badges et niveaux, et des paramètres d'accessibilité adaptables, chaque enfant peut apprendre à son rythme de manière ludique et motivante. L'application propose des activités multi-sensorielles avec encouragement vocal personnalisé, parfaite pour les enfants avec troubles d'apprentissage, autisme, TDAH, ou dyslexie.
                </p>
              </div>

              {/* H2 - À quoi sert Apprendre Autrement ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">À quoi sert Apprendre Autrement ?</h2>
                <div className="space-y-4 text-gray-700">
                  <p className="text-lg leading-relaxed">
                    Apprendre Autrement est une solution éducative adaptée qui permet aux enfants avec des besoins spécifiques d'apprendre de manière différente et personnalisée. L'application répond aux besoins des enfants qui ont des difficultés avec les méthodes d'apprentissage traditionnelles.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li className="text-lg"><strong>Éducation adaptée :</strong> Activités conçues spécifiquement pour les enfants avec besoins spécifiques (autisme, TDAH, dyslexie, troubles d'apprentissage)</li>
                    <li className="text-lg"><strong>Apprentissage différencié :</strong> Chaque enfant peut progresser à son propre rythme avec des activités adaptées à son niveau</li>
                    <li className="text-lg"><strong>Pédagogie inclusive :</strong> Interface multi-sensorielle qui s'adapte aux différents styles d'apprentissage</li>
                    <li className="text-lg"><strong>Motivation et engagement :</strong> Système de récompenses, badges et niveaux pour maintenir la motivation</li>
                  </ul>
                  <p className="text-lg leading-relaxed mt-4">
                    <strong>Cas concrets d'utilisation :</strong> Enfants avec autisme qui ont besoin d'activités structurées et visuelles, enfants avec TDAH qui bénéficient d'activités courtes et interactives, enfants avec dyslexie qui ont besoin d'un apprentissage multi-sensoriel, ou tout enfant qui apprend mieux avec une approche ludique et personnalisée.
                  </p>
                </div>
              </div>

              {/* H2 - Que peut faire Apprendre Autrement ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Que peut faire Apprendre Autrement ?</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                    <h3 className="text-2xl font-bold text-purple-900 mb-4">Activités progressives</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Des activités éducatives interactives conçues pour être courtes, concrètes et adaptées. Chaque activité est progressive et permet à l'enfant de développer ses compétences étape par étape.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-2xl border border-pink-200">
                    <h3 className="text-2xl font-bold text-pink-900 mb-4">Système de récompenses</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Points, badges et niveaux pour motiver l'enfant et célébrer ses progrès. Le système de progression encourage la persévérance et renforce la confiance en soi.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
                    <h3 className="text-2xl font-bold text-orange-900 mb-4">Encouragement vocal personnalisé</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Messages vocaux personnalisés avec le prénom de l'enfant pour un encouragement positif et motivant. L'encouragement vocal renforce les réussites et soutient l'enfant dans son apprentissage.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                    <h3 className="text-2xl font-bold text-blue-900 mb-4">Paramètres d'accessibilité</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Interface adaptable avec des paramètres d'accessibilité pour s'adapter aux besoins spécifiques de chaque enfant : taille des éléments, couleurs, sons, et bien plus.
                    </p>
                  </div>
                </div>
              </div>

              {/* H2 - Comment utiliser Apprendre Autrement ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Comment utiliser Apprendre Autrement ?</h2>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">1</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Accéder à l'application</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Accédez à Apprendre Autrement avec 10 tokens. L'accès est immédiate, l'application est accessible depuis vos applications.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-pink-50 to-orange-50 p-6 rounded-2xl border border-pink-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">2</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Configurer les paramètres d'accessibilité</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Personnalisez l'interface selon les besoins de l'enfant : ajustez la taille des éléments, les couleurs, les sons, et les options d'encouragement vocal.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-50 to-blue-50 p-6 rounded-2xl border border-orange-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">3</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Commencer les activités</h3>
                        <p className="text-gray-700 leading-relaxed">
                          L'enfant peut commencer par les activités de son choix. Chaque activité est progressive et adaptée, avec un système de points et de récompenses pour maintenir la motivation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* H2 - Pour qui est fait Apprendre Autrement ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Pour qui est fait Apprendre Autrement ?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 text-center">
                    <div className="text-4xl mb-4">🧩</div>
                    <h3 className="text-xl font-bold text-purple-900 mb-2">Enfants avec autisme</h3>
                    <p className="text-gray-700">Activités structurées et visuelles adaptées aux besoins des enfants avec troubles du spectre autistique.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-2xl border border-pink-200 text-center">
                    <div className="text-4xl mb-4">⚡</div>
                    <h3 className="text-xl font-bold text-pink-900 mb-2">Enfants avec TDAH</h3>
                    <p className="text-gray-700">Activités courtes et interactives qui maintiennent l'attention et encouragent la concentration.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200 text-center">
                    <div className="text-4xl mb-4">📚</div>
                    <h3 className="text-xl font-bold text-orange-900 mb-2">Enfants avec dyslexie</h3>
                    <p className="text-gray-700">Approche multi-sensorielle qui facilite l'apprentissage pour les enfants avec troubles de la lecture.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 text-center">
                    <div className="text-4xl mb-4">🌟</div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Tous les enfants</h3>
                    <p className="text-gray-700">Pour tout enfant qui apprend mieux avec une approche ludique, personnalisée et motivante.</p>
                  </div>
                </div>
              </div>

              {/* H2 - Apprendre Autrement vs autres solutions éducatives */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Apprendre Autrement vs autres solutions éducatives</h2>
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          <th className="border border-gray-300 p-4 text-left">Fonctionnalité</th>
                          <th className="border border-gray-300 p-4 text-center">Apprendre Autrement</th>
                          <th className="border border-gray-300 p-4 text-center">Applications classiques</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white">
                          <td className="border border-gray-300 p-4 font-semibold">Adaptation aux besoins spécifiques</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Spécialement conçu</td>
                          <td className="border border-gray-300 p-4 text-center">⚠️ Générique</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 p-4 font-semibold">Paramètres d'accessibilité</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Complets et adaptables</td>
                          <td className="border border-gray-300 p-4 text-center">⚠️ Limités</td>
                        </tr>
                        <tr className="bg-white">
                          <td className="border border-gray-300 p-4 font-semibold">Encouragement personnalisé</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Vocal avec prénom</td>
                          <td className="border border-gray-300 p-4 text-center">❌ Générique</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 p-4 font-semibold">Système de récompenses</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Points, badges, niveaux</td>
                          <td className="border border-gray-300 p-4 text-center">⚠️ Variable</td>
                        </tr>
                        <tr className="bg-white">
                          <td className="border border-gray-300 p-4 font-semibold">Activités multi-sensorielles</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Interface adaptée</td>
                          <td className="border border-gray-300 p-4 text-center">⚠️ Variable</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-6 text-gray-700 leading-relaxed">
                    <strong>En résumé :</strong> Apprendre Autrement est spécialement conçu pour les enfants avec des besoins spécifiques, avec des paramètres d'accessibilité complets, un encouragement personnalisé, et un système de récompenses motivant. C'est une solution éducative adaptée qui répond aux besoins particuliers de chaque enfant.
                  </p>
                </div>
              </div>

              {/* H2 - Questions fréquentes sur Apprendre Autrement (FAQ) */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Questions fréquentes sur Apprendre Autrement (FAQ)</h2>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-l-4 border-purple-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Qu'est-ce qu'Apprendre Autrement ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Apprendre Autrement est une application éducative interactive conçue pour les enfants avec des besoins spécifiques. Elle propose des activités progressives, un système de récompenses avec badges et niveaux, et des paramètres d'accessibilité adaptables pour permettre à chaque enfant d'apprendre à son rythme de manière ludique et motivante.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-pink-50 to-orange-50 p-6 rounded-2xl border-l-4 border-pink-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Pour quels enfants est conçue cette application ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Apprendre Autrement est spécialement conçue pour les enfants avec des besoins spécifiques : autisme, TDAH, dyslexie, troubles d'apprentissage, ou tout enfant qui apprend mieux avec une approche ludique et personnalisée. L'application s'adapte aux différents styles d'apprentissage et aux besoins individuels.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-50 to-blue-50 p-6 rounded-2xl border-l-4 border-orange-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Comment fonctionne le système de récompenses ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      L'application utilise un système de points, badges et niveaux pour motiver l'enfant. Chaque activité complétée rapporte des points, et l'enfant peut débloquer des badges et monter de niveau. L'encouragement vocal personnalisé avec le prénom de l'enfant renforce les réussites et maintient la motivation.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-l-4 border-blue-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Quels sont les paramètres d'accessibilité disponibles ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Les paramètres d'accessibilité permettent d'adapter l'interface aux besoins spécifiques de chaque enfant : taille des éléments, couleurs, sons, encouragement vocal, et bien plus. Ces paramètres peuvent être ajustés à tout moment pour offrir une expérience personnalisée.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border-l-4 border-indigo-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Combien coûte l'application ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      L'accès d'Apprendre Autrement coûte 10 tokens par accès. Utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiate, l'application est accessible depuis vos applications.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-l-4 border-purple-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Les activités sont-elles adaptées aux enfants avec autisme ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Oui, les activités sont spécialement conçues pour être structurées, visuelles et adaptées aux besoins des enfants avec troubles du spectre autistique. L'interface claire, les activités progressives, et les paramètres d'accessibilité permettent une expérience adaptée et rassurante.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-2xl border-l-4 border-teal-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">L'application peut-elle être utilisée à l'école ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Oui, Apprendre Autrement peut être utilisée à l'école, à la maison, ou dans tout environnement éducatif. L'application est accessible en ligne et peut être utilisée sur différents appareils (tablette, ordinateur, smartphone) pour offrir une flexibilité maximale.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Section d'accès en bas de page */}
      <CardPageActivationSection
        moduleId={moduleId}
        moduleName="Apprendre Autrement"
        tokenCost={10}
        tokenUnit="par accès"
        apiEndpoint="/api/activate-apprendre-autrement"
        gradientColors="from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        icon="🌈"
        isModuleActivated={isModuleActivated}
        onActivationSuccess={() => setAlreadyActivatedModules(prev => [...prev, moduleId])}
      />
    </div>
  );
}







