'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '../../../components/Breadcrumb';
import Link from 'next/link';
import { useCustomAuth } from '../../../hooks/useCustomAuth';
import CardPageActivationSection from '../../../components/CardPageActivationSection';

export default function CodeLearningCardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useCustomAuth();
  const [loading, setLoading] = useState(false);
  const [alreadyActivatedModules, setAlreadyActivatedModules] = useState<string[]>([]);
  const [checkingActivation, setCheckingActivation] = useState(false);

  const moduleId = 'code-learning';
  const isFreeModule = false; // Module payant : 10 tokens par accès

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

  // Ajouter les données structurées JSON-LD pour le SEO
  useEffect(() => {
    const softwareApplicationSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Apprendre le Code aux Enfants - IA Home",
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "10",
        "priceCurrency": "TOKENS"
      },
      "description": "Application éducative interactive pour apprendre la programmation aux enfants de 6 à 14 ans, avec une progression par âge. Exercices progressifs sur les variables, boucles, conditions, logique, fonctions, tableaux et objets. Interface ludique et colorée.",
      "url": "https://iahome.fr/card/code-learning",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "150"
      },
      "featureList": [
        "35 exercices progressifs",
        "Apprentissage des variables",
        "Apprentissage des boucles",
        "Apprentissage des conditions",
        "Apprentissage de la logique (ET / OU)",
        "Apprentissage des fonctions",
        "Tableaux et objets (notions essentielles)",
        "Interface ludique et colorée",
        "Système de progression",
        "Progression par âge (6-14 ans)"
      ]
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Qu'est-ce qu'Apprendre le Code aux Enfants ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Apprendre le Code aux Enfants est une application éducative interactive qui permet aux enfants de 6 à 14 ans d'apprendre les bases de la programmation de manière ludique. L'application propose 35 exercices progressifs, organisés par âge, sur les concepts fondamentaux : variables, boucles, conditions, logique, fonctions, tableaux et objets."
          }
        },
        {
          "@type": "Question",
          "name": "Pour quel âge est conçue cette application ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "L'application est conçue pour les enfants de 6 à 14 ans. Les exercices sont regroupés par tranches d'âge, du plus simple au plus avancé, avec une interface colorée et ludique qui rend l'apprentissage de la programmation amusant et accessible."
          }
        },
        {
          "@type": "Question",
          "name": "Quels concepts de programmation sont enseignés ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "L'application couvre les concepts fondamentaux de la programmation : les variables (stockage de données), les boucles (répétition d'actions), les conditions (décisions), la logique (ET/OU), les fonctions (blocs réutilisables), ainsi que les tableaux et objets. Chaque concept est expliqué de manière simple et illustré par des exercices pratiques."
          }
        },
        {
          "@type": "Question",
          "name": "Les enfants ont-ils besoin de connaissances préalables ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Non, aucune connaissance préalable en programmation n'est nécessaire. L'application est conçue pour les débutants complets. Les exercices sont progressifs et commencent par les concepts les plus simples, avec des explications claires et des exemples concrets."
          }
        },
        {
          "@type": "Question",
          "name": "Combien coûte l'application ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "L'activation d'Apprendre le Code aux Enfants coûte 10 tokens par accès, et utilisez l'application aussi longtemps que vous souhaitez. Une fois activée, l'application est accessible depuis vos applications actives."
          }
        },
        {
          "@type": "Question",
          "name": "L'application peut-elle être utilisée à l'école ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Oui, l'application peut être utilisée à l'école, à la maison, ou dans tout environnement éducatif. Elle est accessible en ligne et peut être utilisée sur différents appareils (tablette, ordinateur, smartphone) pour offrir une flexibilité maximale."
          }
        },
        {
          "@type": "Question",
          "name": "Quel langage de programmation est enseigné ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Les exercices sont réalisés en JavaScript (directement dans le navigateur), mais les concepts appris (variables, boucles, conditions, logique, fonctions, tableaux, objets) sont universels et s'appliquent à tous les langages. C'est une excellente base avant d'apprendre ensuite Python, JavaScript plus avancé, ou tout autre langage."
          }
        }
      ]
    };

    // Créer et ajouter le script pour SoftwareApplication
    const script1 = document.createElement('script');
    script1.type = 'application/ld+json';
    script1.id = 'software-application-schema-cl';
    script1.text = JSON.stringify(softwareApplicationSchema);
    
    // Créer et ajouter le script pour FAQPage
    const script2 = document.createElement('script');
    script2.type = 'application/ld+json';
    script2.id = 'faq-schema-cl';
    script2.text = JSON.stringify(faqSchema);

    // Vérifier si les scripts existent déjà avant de les ajouter
    if (!document.getElementById('software-application-schema-cl')) {
      document.head.appendChild(script1);
    }
    if (!document.getElementById('faq-schema-cl')) {
      document.head.appendChild(script2);
    }

    // Nettoyage lors du démontage
    return () => {
      const existingScript1 = document.getElementById('software-application-schema-cl');
      const existingScript2 = document.getElementById('faq-schema-cl');
      if (existingScript1) existingScript1.remove();
      if (existingScript2) existingScript2.remove();
    };
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de l'authentification...</p>
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
              { label: 'Apprendre le code informatique' }
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
                Apprendre le code aux enfants : programmation ludique (6 à 14 ans)
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                ÉDUCATION
              </span>
              <p className="text-xl text-white/90 mb-6">
                Apprenez la programmation en vous amusant ! Des exercices interactifs et progressifs, organisés par âge, pour découvrir les bases du code : variables, boucles, conditions, logique, fonctions, tableaux, objets. Interface ludique et colorée, parfaite pour les enfants de 6 à 14 ans.
              </p>
              
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  📝 Variables
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🔁 Boucles
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🤔 Conditions
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  ⚙️ Fonctions
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
                    <span className="text-8xl">💻</span>
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
                Cette application propose des exercices interactifs et amusants pour apprendre 
                les bases de la programmation. Chaque exercice est conçu pour être court, concret 
                et adapté aux enfants de 6 à 14 ans (progression par âge).
              </p>
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                <p className="font-semibold text-purple-900 mb-2">✨ Fonctionnalités :</p>
                <ul className="list-disc list-inside text-purple-800 space-y-1">
                  <li>35 exercices progressifs</li>
                  <li>Interface colorée et ludique</li>
                  <li>Système de progression avec récompenses</li>
                  <li>Progression par âge (du plus simple au plus avancé)</li>
                  <li>Concepts : variables, boucles, conditions, logique, fonctions, tableaux, objets</li>
                  <li>10 tokens par accès, et utilisez l'application aussi longtemps que vous souhaitez</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Colonne 2 - Accès */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
            <div className="text-center mb-8">
              <div className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-4 rounded-2xl shadow-lg mb-4">
                <div className="text-4xl font-bold mb-1">
                  10 tokens
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
                        // Utilisateur connecté : activer code-learning via API
                        try {
                          setLoading(true);
                          const response = await fetch('/api/activate-code-learning', {
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
                              console.log('✅ Code Learning activé avec succès');
                              setAlreadyActivatedModules(prev => [...prev, moduleId]);
                              router.push('/encours'); // Redirect to /encours
                            } else {
                              console.error('❌ Erreur activation Code Learning:', data.error);
                              alert('Erreur lors de l\'activation: ' + (data.error || 'Erreur inconnue'));
                            }
                          } else {
                            const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
                            console.error('❌ Erreur réponse API:', response.status, errorData);
                            alert('Erreur lors de l\'activation: ' + (errorData.error || 'Erreur inconnue'));
                          }
                        } catch (error) {
                          console.error('❌ Erreur lors de l\'activation de Code Learning:', error);
                          alert('Erreur lors de l\'activation');
                        } finally {
                          setLoading(false);
                        }
                      } else {
                        // Utilisateur non connecté : aller à la page de connexion puis retour à la page actuelle
                        console.log('🔒 Accès Code Learning - Redirection vers connexion');
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
                        <span className="text-xl">💻</span>
                        <span>
                          {isAuthenticated && user ? 'Activez l\'apprentissage du code (10 tokens par accès)' : 'Connectez-vous pour activer (10 tokens par accès)'}
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
                  <strong>Apprendre le Code aux Enfants est une application éducative interactive qui permet aux enfants de 6 à 14 ans d'apprendre les bases de la programmation de manière ludique.</strong> Avec 35 exercices progressifs organisés par âge (variables, boucles, conditions, logique, fonctions, tableaux, objets), une interface colorée et ludique, et un système de progression, chaque enfant peut découvrir la programmation à son rythme. L'application est parfaite pour une initiation à la programmation sans connaissances préalables.
                </p>
              </div>

              {/* H2 - À quoi sert Apprendre le Code aux Enfants ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">À quoi sert Apprendre le Code aux Enfants ?</h2>
                <div className="space-y-4 text-gray-700">
                  <p className="text-lg leading-relaxed">
                    Apprendre le Code aux Enfants est une solution éducative qui permet aux enfants de découvrir la programmation de manière ludique et accessible. L'application initie les enfants aux concepts fondamentaux du code informatique sans nécessiter de connaissances préalables.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li className="text-lg"><strong>Initiation à la programmation :</strong> Découvrir les bases du code informatique de manière simple et amusante</li>
                    <li className="text-lg"><strong>Développement de la logique :</strong> Apprendre à penser de manière structurée et à résoudre des problèmes</li>
                    <li className="text-lg"><strong>Préparation à l'avenir :</strong> Acquérir des compétences essentielles pour le monde numérique de demain</li>
                    <li className="text-lg"><strong>Apprentissage ludique :</strong> Découvrir la programmation à travers des exercices interactifs et amusants</li>
                  </ul>
                  <p className="text-lg leading-relaxed mt-4">
                    <strong>Cas concrets d'utilisation :</strong> Enfants qui souhaitent découvrir la programmation, parents qui veulent initier leurs enfants au code, enseignants qui cherchent des ressources éducatives pour leurs cours, ou tout enfant curieux du fonctionnement des ordinateurs et des applications.
                  </p>
                </div>
              </div>

              {/* H2 - Que peut faire Apprendre le Code aux Enfants ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Que peut faire Apprendre le Code aux Enfants ?</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                    <h3 className="text-2xl font-bold text-purple-900 mb-4">35 exercices progressifs</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Des exercices interactifs et amusants qui couvrent les concepts fondamentaux de la programmation. Chaque exercice est conçu pour être court, concret et adapté aux enfants de 6 à 14 ans, avec une progression par âge.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-2xl border border-pink-200">
                    <h3 className="text-2xl font-bold text-pink-900 mb-4">Apprentissage des variables</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Découvrir comment stocker et manipuler des données avec les variables. Comprendre les différents types de données et leur utilisation dans la programmation.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
                    <h3 className="text-2xl font-bold text-orange-900 mb-4">Apprentissage des boucles</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Apprendre à répéter des actions avec les boucles. Comprendre comment automatiser des tâches répétitives et optimiser le code.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                    <h3 className="text-2xl font-bold text-blue-900 mb-4">Apprentissage des conditions</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Découvrir comment prendre des décisions avec les conditions. Apprendre à créer des programmes qui réagissent différemment selon les situations.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl border border-indigo-200">
                    <h3 className="text-2xl font-bold text-indigo-900 mb-4">Apprentissage des fonctions</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Comprendre comment créer des blocs de code réutilisables avec les fonctions. Apprendre à organiser et structurer son code efficacement.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-2xl border border-teal-200">
                    <h3 className="text-2xl font-bold text-teal-900 mb-4">Interface ludique et colorée</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Une interface adaptée aux enfants avec des couleurs vives, des animations amusantes, et un design qui rend l'apprentissage de la programmation agréable et motivant.
                    </p>
                  </div>
                </div>
              </div>

              {/* H2 - Comment utiliser Apprendre le Code aux Enfants ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Comment utiliser Apprendre le Code aux Enfants ?</h2>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">1</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Activer l'application</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Activez Apprendre le Code aux Enfants avec 10 tokens. Une fois activée, l'application est accessible depuis vos applications actives.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-pink-50 to-orange-50 p-6 rounded-2xl border border-pink-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">2</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Commencer les exercices</h3>
                        <p className="text-gray-700 leading-relaxed">
                          L'enfant peut commencer par les exercices de son choix. Les exercices sont progressifs et commencent par les concepts les plus simples, avec des explications claires et des exemples concrets.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-50 to-blue-50 p-6 rounded-2xl border border-orange-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">3</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Progresser à son rythme</h3>
                        <p className="text-gray-700 leading-relaxed">
                          L'enfant peut progresser à son propre rythme, revenir sur les exercices précédents, et suivre sa progression grâce au système de récompenses intégré.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* H2 - Pour qui est fait Apprendre le Code aux Enfants ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Pour qui est fait Apprendre le Code aux Enfants ?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 text-center">
                    <div className="text-4xl mb-4">👶</div>
                    <h3 className="text-xl font-bold text-purple-900 mb-2">Enfants de 8-10 ans</h3>
                    <p className="text-gray-700">Découverte des concepts de base avec des exercices simples et visuels adaptés aux plus jeunes.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-2xl border border-pink-200 text-center">
                    <div className="text-4xl mb-4">🧒</div>
                    <h3 className="text-xl font-bold text-pink-900 mb-2">Enfants de 10-12 ans</h3>
                    <p className="text-gray-700">Approfondissement des concepts avec des exercices plus complexes et des défis stimulants.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200 text-center">
                    <div className="text-4xl mb-4">👨‍👩‍👧</div>
                    <h3 className="text-xl font-bold text-orange-900 mb-2">Parents</h3>
                    <p className="text-gray-700">Pour initier leurs enfants à la programmation de manière ludique et structurée à la maison.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 text-center">
                    <div className="text-4xl mb-4">👨‍🏫</div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Enseignants</h3>
                    <p className="text-gray-700">Pour compléter leurs cours d'informatique avec des exercices interactifs et progressifs.</p>
                  </div>
                </div>
              </div>

              {/* H2 - Apprendre le Code aux Enfants vs autres solutions */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Apprendre le Code aux Enfants vs autres solutions</h2>
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          <th className="border border-gray-300 p-4 text-left">Fonctionnalité</th>
                          <th className="border border-gray-300 p-4 text-center">Apprendre le Code aux Enfants</th>
                          <th className="border border-gray-300 p-4 text-center">Cours traditionnels</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white">
                          <td className="border border-gray-300 p-4 font-semibold">Approche ludique</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Interface colorée et amusante</td>
                          <td className="border border-gray-300 p-4 text-center">⚠️ Souvent théorique</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 p-4 font-semibold">Exercices interactifs</td>
                          <td className="border border-gray-300 p-4 text-center">✅ 35 exercices pratiques</td>
                          <td className="border border-gray-300 p-4 text-center">⚠️ Exercices papier</td>
                        </tr>
                        <tr className="bg-white">
                          <td className="border border-gray-300 p-4 font-semibold">Progression à son rythme</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Chaque enfant avance à sa vitesse</td>
                          <td className="border border-gray-300 p-4 text-center">⚠️ Rythme de groupe</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 p-4 font-semibold">Accessibilité</td>
                          <td className="border border-gray-300 p-4 text-center">✅ En ligne, accessible partout</td>
                          <td className="border border-gray-300 p-4 text-center">⚠️ Lieu et horaire fixes</td>
                        </tr>
                        <tr className="bg-white">
                          <td className="border border-gray-300 p-4 font-semibold">Coût</td>
                          <td className="border border-gray-300 p-4 text-center">✅ 10 tokens par accès, et utilisez l'application aussi longtemps que vous souhaitez</td>
                          <td className="border border-gray-300 p-4 text-center">⚠️ Souvent plus cher</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-6 text-gray-700 leading-relaxed">
                    <strong>En résumé :</strong> Apprendre le Code aux Enfants offre une approche ludique et interactive pour découvrir la programmation, avec des exercices pratiques, une progression personnalisée, et une accessibilité en ligne. C'est une solution idéale pour initier les enfants au code de manière amusante et efficace.
                  </p>
                </div>
              </div>

              {/* H2 - Questions fréquentes sur Apprendre le Code aux Enfants (FAQ) */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Questions fréquentes sur Apprendre le Code aux Enfants (FAQ)</h2>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-l-4 border-purple-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Qu'est-ce qu'Apprendre le Code aux Enfants ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Apprendre le Code aux Enfants est une application éducative interactive qui permet aux enfants de 6 à 14 ans d'apprendre les bases de la programmation de manière ludique. L'application propose 35 exercices progressifs organisés par âge (variables, boucles, conditions, logique, fonctions, tableaux, objets).
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-pink-50 to-orange-50 p-6 rounded-2xl border-l-4 border-pink-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Pour quel âge est conçue cette application ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      L'application est conçue pour les enfants de 6 à 14 ans. Les exercices sont regroupés par tranches d'âge, du plus simple au plus avancé, avec une interface colorée et ludique qui rend l'apprentissage de la programmation amusant et accessible.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-50 to-blue-50 p-6 rounded-2xl border-l-4 border-orange-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Quels concepts de programmation sont enseignés ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      L'application couvre les concepts fondamentaux de la programmation : les variables (stockage de données), les boucles (répétition d'actions), les conditions (décisions), la logique (ET/OU), les fonctions (blocs de code réutilisables), ainsi que les tableaux et objets. Chaque concept est expliqué de manière simple et illustré par des exercices pratiques.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-l-4 border-blue-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Les enfants ont-ils besoin de connaissances préalables ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Non, aucune connaissance préalable en programmation n'est nécessaire. L'application est conçue pour les débutants complets. Les exercices sont progressifs et commencent par les concepts les plus simples, avec des explications claires et des exemples concrets.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border-l-4 border-indigo-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Combien coûte l'application ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      L'activation d'Apprendre le Code aux Enfants coûte 10 tokens par accès, et utilisez l'application aussi longtemps que vous souhaitez. Une fois activée, l'application est accessible depuis vos applications actives.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-l-4 border-purple-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">L'application peut-elle être utilisée à l'école ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Oui, l'application peut être utilisée à l'école, à la maison, ou dans tout environnement éducatif. Elle est accessible en ligne et peut être utilisée sur différents appareils (tablette, ordinateur, smartphone) pour offrir une flexibilité maximale.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-2xl border-l-4 border-teal-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Quel langage de programmation est enseigné ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Les exercices sont réalisés en JavaScript (directement dans le navigateur), mais les concepts appris (variables, boucles, conditions, logique, fonctions, tableaux, objets) sont universels et s'appliquent à tous les langages. C'est une excellente base avant d'apprendre ensuite Python, JavaScript plus avancé, ou tout autre langage.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Section d'activation en bas de page */}
      <CardPageActivationSection
        moduleId={moduleId}
        moduleName="Apprendre le Code aux Enfants"
        tokenCost={10}
        tokenUnit="par accès"
        apiEndpoint="/api/activate-code-learning"
        gradientColors="from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        icon="💻"
        isModuleActivated={isModuleActivated}
        onActivationSuccess={() => setAlreadyActivatedModules(prev => [...prev, moduleId])}
      />
    </div>
  );
}

