'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '../../../components/Breadcrumb';
import Link from 'next/link';
import { useCustomAuth } from '../../../hooks/useCustomAuth';
import CardPageActivationSection from '../../../components/CardPageActivationSection';

export default function AdministrationPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useCustomAuth();
  const [loading, setLoading] = useState(false);
  const [alreadyActivatedModules, setAlreadyActivatedModules] = useState<string[]>([]);
  const [checkingActivation, setCheckingActivation] = useState(false);

  const moduleId = 'administration';
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

  // Ajouter les données structurées JSON-LD pour le SEO
  useEffect(() => {
    const softwareApplicationSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Services de l'Administration - IA Home",
      "applicationCategory": "WebApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "10",
        "priceCurrency": "TOKENS"
      },
      "description": "Portail centralisé pour accéder rapidement aux principaux services de l'administration française : CAF, Sécurité Sociale, permis de conduire, aides sociales, scolarité, études, retraites, famille, handicap, impôts. Accès simplifié aux démarches en ligne.",
      "url": "https://iahome.fr/card/administration",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.7",
        "ratingCount": "400"
      },
      "featureList": [
        "Accès centralisé aux services administratifs",
        "Navigation par catégories",
        "Liens directs vers sites officiels",
        "Applications mobiles",
        "Services populaires mis en avant",
        "Navigation par ancres",
        "Organisation par administration"
      ]
    };

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Qu'est-ce que le portail Services de l'Administration ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Le portail Services de l'Administration est un portail centralisé qui regroupe tous les liens essentiels vers les services administratifs français les plus utilisés. Il permet d'accéder rapidement aux sites officiels et aux applications mobiles pour effectuer vos démarches en ligne, organisés par catégorie (CAF, Sécurité Sociale, Impôts, etc.) pour faciliter votre navigation."
          }
        },
        {
          "@type": "Question",
          "name": "Comment accéder aux Services de l'Administration ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Pour accéder aux Services de l'Administration, accédez directement au service avec 10 tokens. L'accès est immédiat, le portail est accessible depuis vos applications. Vous pourrez alors naviguer par catégories ou utiliser la recherche pour trouver rapidement le service administratif dont vous avez besoin."
          }
        },
        {
          "@type": "Question",
          "name": "Quels services administratifs sont disponibles ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Le portail regroupe les principaux services administratifs français : CAF (allocations familiales, aide au logement, RSA), Sécurité Sociale (carte Vitale, remboursements), Impôts (déclaration en ligne, paiement), Permis de conduire, Aides sociales, Scolarité et Éducation, Études supérieures, Retraites, Famille, Handicap, Papiers d'identité, Emploi et Chômage."
          }
        },
        {
          "@type": "Question",
          "name": "Les Services de l'Administration sont-ils gratuits ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "L'accès du portail Services de l'Administration coûte 10 tokens par accès. Utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiat, vous pouvez accéder à tous les liens et services sans frais supplémentaires. Les liens pointent vers les sites officiels des administrations françaises."
          }
        },
        {
          "@type": "Question",
          "name": "Puis-je accéder aux applications mobiles des administrations ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Oui, pour les services qui disposent d'une application mobile officielle, le portail fournit des liens directs vers l'App Store (iOS) et le Play Store (Android). Vous pouvez ainsi effectuer vos démarches depuis votre smartphone où que vous soyez."
          }
        },
        {
          "@type": "Question",
          "name": "Mes données sont-elles sécurisées ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Le portail vous redirige vers les sites officiels de l'administration française. Assurez-vous toujours d'être sur le bon site avant de saisir vos informations personnelles. Les sites officiels utilisent généralement les domaines .gouv.fr, .fr ou des sous-domaines vérifiés. Ne saisissez jamais vos identifiants sur un site qui vous semble suspect."
          }
        },
        {
          "@type": "Question",
          "name": "Comment naviguer dans le portail ?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Le portail offre plusieurs moyens de navigation : un menu de navigation en haut de la page avec des ancres pour accéder directement à une section (CAF, Sécurité Sociale, Impôts, etc.), une organisation visuelle par catégories avec des icônes et des couleurs distinctes, et des services populaires mis en avant pour un accès encore plus rapide."
          }
        }
      ]
    };

    // Créer et ajouter le script pour SoftwareApplication
    const script1 = document.createElement('script');
    script1.type = 'application/ld+json';
    script1.id = 'software-application-schema-adm';
    script1.text = JSON.stringify(softwareApplicationSchema);
    
    // Créer et ajouter le script pour FAQPage
    const script2 = document.createElement('script');
    script2.type = 'application/ld+json';
    script2.id = 'faq-schema-adm';
    script2.text = JSON.stringify(faqSchema);

    // Vérifier si les scripts existent déjà avant de les ajouter
    if (!document.getElementById('software-application-schema-adm')) {
      document.head.appendChild(script1);
    }
    if (!document.getElementById('faq-schema-adm')) {
      document.head.appendChild(script2);
    }

    // Nettoyage lors du démontage
    return () => {
      const existingScript1 = document.getElementById('software-application-schema-adm');
      const existingScript2 = document.getElementById('faq-schema-adm');
      if (existingScript1) existingScript1.remove();
      if (existingScript2) existingScript2.remove();
    };
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Fil d'Ariane */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 pt-2">
        <div className="max-w-7xl mx-auto px-6 py-1">
          <Breadcrumb 
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Services de l\'Administration' }
            ]}
          />
        </div>
      </div>

      {/* Bannière spéciale */}
      <section className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 py-12 relative overflow-hidden">
        {/* Effet de particules animées */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-white/30 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 bg-white/25 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-white/20 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-white/15 rounded-full animate-pulse"></div>
          <div className="absolute top-32 left-1/2 w-1.5 h-1.5 bg-blue-300/30 rounded-full animate-pulse"></div>
          <div className="absolute bottom-32 right-1/4 w-1 h-1 bg-indigo-300/30 rounded-full animate-bounce"></div>
        </div>
        
        {/* Effet de vague en bas */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/10 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Contenu texte */}
            <div className="flex-1 max-w-2xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                Services de l'Administration : accès rapide aux démarches administratives françaises
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                SERVICES PUBLICS
              </span>
              <p className="text-xl text-blue-100 mb-6">
                Portail centralisé pour accéder rapidement aux principaux services de l'administration française : CAF, Sécurité Sociale, permis de conduire, aides sociales, scolarité, études, retraites, famille, handicap, impôts. Accès simplifié aux démarches en ligne.
              </p>
              
              {/* Badges de fonctionnalités */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  👨‍👩‍👧‍👦 CAF
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🏥 Sécurité Sociale
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🚗 Permis de conduire
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  📊 Impôts
                </span>
              </div>
            </div>
            
            {/* Logo animé avec thème administratif */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                {/* Formes géométriques abstraites - thème administratif */}
                {/* Document/formulaire stylisé */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-white/40 rounded-lg opacity-90 animate-pulse shadow-lg transform rotate-6">
                  <div className="absolute top-2 left-2 w-4 h-4 bg-blue-500/50 rounded"></div>
                  <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-500/50 rounded-full"></div>
                </div>
                {/* Timbre administratif */}
                <div className="absolute top-16 right-0 w-20 h-20 bg-red-400/60 rounded-full opacity-90 animate-bounce shadow-lg border-2 border-white/30">
                  <div className="absolute inset-2 bg-white/20 rounded-full"></div>
                </div>
                {/* Carte d'identité stylisée */}
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-blue-400/50 transform rotate-12 opacity-90 animate-pulse shadow-lg rounded-lg">
                  <div className="absolute inset-1 border-2 border-white/40 rounded"></div>
                </div>
                {/* Badge officiel */}
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-yellow-400/60 rounded-full opacity-90 animate-bounce shadow-lg">
                  <div className="absolute inset-1 bg-white/30 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-yellow-900">★</span>
                  </div>
                </div>
                {/* Ligne de texte (formulaire) */}
                <div className="absolute top-8 right-8 w-12 h-2 bg-white/50 rounded opacity-80 animate-pulse"></div>
                <div className="absolute top-12 right-8 w-8 h-2 bg-white/40 rounded opacity-80 animate-pulse"></div>
                
                {/* Logo principal centré */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-sm rounded-full p-8 shadow-2xl border-4 border-blue-500/30 transform hover:scale-105 transition-transform duration-300">
                    <span className="text-8xl">🏛️</span>
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
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              À propos du service
            </h2>
            <div className="space-y-4 text-gray-700">
              <p className="text-lg">
                Ce portail centralise tous les liens vers les services administratifs français les plus utilisés, 
                organisés par catégorie pour faciliter votre navigation. Accédez rapidement aux sites officiels 
                et aux applications mobiles pour effectuer vos démarches en ligne.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="font-semibold text-blue-900 mb-2">✨ Fonctionnalités :</p>
                <ul className="list-disc list-inside text-blue-800 space-y-1">
                  <li>Accès centralisé aux principaux services administratifs</li>
                  <li>Navigation simplifiée par catégorie (CAF, Sécurité Sociale, Impôts, etc.)</li>
                  <li>Liens directs vers les sites officiels et applications mobiles</li>
                  <li>Services populaires mis en avant</li>
                  <li>Navigation par ancres pour accéder rapidement à une section</li>
                  <li>Utilisez l'application aussi longtemps que vous souhaitez</li>
                </ul>
              </div>
              
              <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded mt-4">
                <p className="font-semibold text-indigo-900 mb-2">📋 Catégories disponibles :</p>
                <div className="grid grid-cols-2 gap-2 text-indigo-800 text-sm">
                  <div>• CAF</div>
                  <div>• Sécurité Sociale</div>
                  <div>• Permis de conduire</div>
                  <div>• Aides sociales</div>
                  <div>• Scolarité et Éducation</div>
                  <div>• Études supérieures</div>
                  <div>• Retraites</div>
                  <div>• Famille</div>
                  <div>• Handicap</div>
                  <div>• Impôts</div>
                  <div>• Papiers d'identité</div>
                  <div>• Emploi et Chômage</div>
                </div>
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
                    <Link
                      href="/administration"
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
                        // Utilisateur connecté : Accéder à administration via API
                        try {
                          setLoading(true);
                          const response = await fetch('/api/activate-administration', {
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
                              console.log('✅ Services administratifs accessibles avec succès');
                              setAlreadyActivatedModules(prev => [...prev, moduleId]);
                              // Rediriger vers la page des modules actifs
                              window.open('/administration', '_blank');
                            } else {
                              console.error('❌ Erreur accès services administratifs:', data.error);
                              alert('Erreur lors de l\'accès: ' + (data.error || 'Erreur inconnue'));
                            }
                          } else {
                            const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
                            console.error('❌ Erreur réponse API:', response.status, errorData);
                            alert('Erreur lors de l\'accès: ' + (errorData.error || 'Erreur inconnue'));
                          }
                        } catch (error) {
                          console.error('❌ Erreur lors de l\'accès des services administratifs:', error);
                          alert('Erreur lors de l\'accès');
                        } finally {
                          setLoading(false);
                        }
                      } else {
                        // Utilisateur non connecté : aller à la page de connexion puis retour à administration
                        console.log('🔒 Accès services administratifs - Redirection vers connexion');
                        router.push(`/login?redirect=${encodeURIComponent('/card/administration')}`);
                      }
                    }}
                    disabled={loading || checkingActivation}
                    className="w-full font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Ouverture en cours...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xl">🏛️</span>
                        <span>
                          {isAuthenticated && user ? 'Accédez à les services administratifs (10 tokens par accès)' : 'Connectez-vous pour accéder (10 tokens par accès)'}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section SEO optimisée - Contenu structuré */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 w-full relative overflow-hidden">
        {/* Effet de particules en arrière-plan */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400/20 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-indigo-400/30 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 bg-purple-400/25 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-blue-400/20 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-indigo-400/15 rounded-full animate-pulse"></div>
        </div>
        
        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-12 lg:p-16 hover:shadow-3xl transition-all duration-300">
            <div className="prose max-w-none">
              
              {/* Paragraphe citable par les IA (GEO) */}
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-6 rounded-2xl mb-8 border-l-4 border-blue-500">
                <p className="text-lg leading-relaxed text-gray-800">
                  <strong>Le portail Services de l'Administration est un portail centralisé qui regroupe tous les liens essentiels vers les services administratifs français les plus utilisés.</strong> Il permet d'accéder rapidement aux sites officiels et aux applications mobiles pour effectuer vos démarches en ligne, organisés par catégorie (CAF, Sécurité Sociale, Impôts, Permis de conduire, Aides sociales, Scolarité, Retraites, Famille, Handicap) pour faciliter votre navigation. Plus besoin de chercher dans vos favoris ou de mémoriser de nombreuses adresses : tout est organisé pour un accès rapide et intuitif.
                </p>
              </div>

              {/* H2 - À quoi sert le portail Services de l'Administration ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">À quoi sert le portail Services de l'Administration ?</h2>
                <div className="space-y-4 text-gray-700">
                  <p className="text-lg leading-relaxed">
                    Le portail Services de l'Administration permet de simplifier l'accès aux informations et démarches administratives en France. Il répond aux besoins de ceux qui souhaitent accéder rapidement aux services administratifs sans avoir à chercher dans leurs favoris ou mémoriser de nombreuses adresses.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li className="text-lg"><strong>Accès centralisé :</strong> Tous les liens essentiels vers les services administratifs français en un seul endroit</li>
                    <li className="text-lg"><strong>Navigation simplifiée :</strong> Organisation par catégories (CAF, Sécurité Sociale, Impôts, etc.) pour trouver rapidement ce que vous cherchez</li>
                    <li className="text-lg"><strong>Gain de temps :</strong> Évitez les recherches fastidieuses et accédez directement aux sites officiels et applications mobiles</li>
                    <li className="text-lg"><strong>Services populaires :</strong> Les services les plus demandés sont mis en avant pour un accès encore plus rapide</li>
                  </ul>
                  <p className="text-lg leading-relaxed mt-4">
                    <strong>Cas concrets d'utilisation :</strong> Accédez rapidement à la CAF pour faire une demande d'aide au logement, consultez votre compte Sécurité Sociale pour vérifier vos remboursements, déclarez vos impôts en ligne, renouvelez votre carte d'identité, ou effectuez toute autre démarche administrative en quelques clics.
                  </p>
                </div>
              </div>

              {/* H2 - Que peut faire le portail Services de l'Administration ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Que peut faire le portail Services de l'Administration ?</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                    <h3 className="text-2xl font-bold text-blue-900 mb-4">Accès centralisé</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Accédez à tous les liens essentiels vers les services administratifs français en un seul endroit. Plus besoin de chercher dans vos favoris ou de mémoriser de nombreuses adresses.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl border border-indigo-200">
                    <h3 className="text-2xl font-bold text-indigo-900 mb-4">Navigation par catégories</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Les services sont organisés par catégories (CAF, Sécurité Sociale, Impôts, Permis de conduire, Aides sociales, Scolarité, Retraites, Famille, Handicap) pour faciliter votre navigation.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                    <h3 className="text-2xl font-bold text-purple-900 mb-4">Applications mobiles</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Pour les services qui disposent d'une application mobile officielle, des liens directs vers l'App Store (iOS) et le Play Store (Android) sont fournis.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-2xl border border-pink-200">
                    <h3 className="text-2xl font-bold text-pink-900 mb-4">Services populaires</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Les services les plus demandés sont mis en avant en haut de la page pour un accès encore plus rapide. Navigation par ancres pour accéder directement à une section.
                    </p>
                  </div>
                </div>
              </div>

              {/* H2 - Comment utiliser le portail Services de l'Administration ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Comment utiliser le portail Services de l'Administration ?</h2>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">1</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Accéder à le portail</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Accédez à le portail Services de l'Administration avec 10 tokens. L'accès est immédiat, le portail est accessible depuis vos applications.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">2</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Naviguer par catégories</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Utilisez le menu de navigation en haut de la page pour accéder directement à la section qui vous intéresse (CAF, Sécurité Sociale, Impôts, etc.) ou parcourez les catégories disponibles.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">3</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Accéder aux services</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Cliquez sur le service dont vous avez besoin. Vous serez redirigé vers le site officiel de l'administration ou vers l'application mobile si disponible. Tous les liens pointent vers les sites officiels garantissant la sécurité et l'authenticité.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-pink-50 to-red-50 p-6 rounded-2xl border border-pink-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">4</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Effectuer vos démarches</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Une fois sur le site officiel, effectuez vos démarches en ligne. Assurez-vous toujours d'être sur le bon site avant de saisir vos informations personnelles. Vérifiez l'URL dans la barre d'adresse de votre navigateur.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* H2 - Pour qui est fait le portail Services de l'Administration ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Pour qui est fait le portail Services de l'Administration ?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 text-center">
                    <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Familles</h3>
                    <p className="text-gray-700">Accédez rapidement à la CAF pour les allocations familiales, aide au logement, ou à la Sécurité Sociale pour les remboursements de soins.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl border border-indigo-200 text-center">
                    <div className="text-4xl mb-4">👨‍💼</div>
                    <h3 className="text-xl font-bold text-indigo-900 mb-2">Travailleurs</h3>
                    <p className="text-gray-700">Déclarez vos impôts, consultez votre compte Sécurité Sociale, ou accédez à Pôle Emploi pour vos démarches liées à l'emploi.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 text-center">
                    <div className="text-4xl mb-4">🎓</div>
                    <h3 className="text-xl font-bold text-purple-900 mb-2">Étudiants</h3>
                    <p className="text-gray-700">Accédez aux services de scolarité, demandez des bourses, ou effectuez vos démarches pour les études supérieures.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-2xl border border-pink-200 text-center">
                    <div className="text-4xl mb-4">👴</div>
                    <h3 className="text-xl font-bold text-pink-900 mb-2">Retraités</h3>
                    <p className="text-gray-700">Consultez vos droits à la retraite, effectuez vos démarches, ou utilisez les simulateurs de retraite disponibles.</p>
                  </div>
                </div>
              </div>

              {/* H2 - Portail Services de l'Administration vs recherche manuelle */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Portail Services de l'Administration vs recherche manuelle</h2>
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                          <th className="border border-gray-300 p-4 text-left">Fonctionnalité</th>
                          <th className="border border-gray-300 p-4 text-center">Portail Services</th>
                          <th className="border border-gray-300 p-4 text-center">Recherche manuelle</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white">
                          <td className="border border-gray-300 p-4 font-semibold">Temps d'accès</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Accès instantané</td>
                          <td className="border border-gray-300 p-4 text-center">❌ Recherche fastidieuse</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 p-4 font-semibold">Organisation</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Par catégories</td>
                          <td className="border border-gray-300 p-4 text-center">⚠️ Non organisé</td>
                        </tr>
                        <tr className="bg-white">
                          <td className="border border-gray-300 p-4 font-semibold">Applications mobiles</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Liens directs</td>
                          <td className="border border-gray-300 p-4 text-center">❌ Recherche séparée</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 p-4 font-semibold">Sécurité</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Sites officiels vérifiés</td>
                          <td className="border border-gray-300 p-4 text-center">⚠️ Risque d'erreur</td>
                        </tr>
                        <tr className="bg-white">
                          <td className="border border-gray-300 p-4 font-semibold">Mise à jour</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Liens à jour</td>
                          <td className="border border-gray-300 p-4 text-center">⚠️ Liens obsolètes possibles</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-6 text-gray-700 leading-relaxed">
                    <strong>En résumé :</strong> Le portail Services de l'Administration offre un accès centralisé, organisé et sécurisé à tous les services administratifs français. Contrairement à une recherche manuelle qui peut être fastidieuse et risquée, le portail garantit des liens vers les sites officiels vérifiés, une organisation par catégories, et un accès rapide aux applications mobiles. C'est la solution idéale pour ceux qui veulent gagner du temps et accéder facilement aux démarches administratives.
                  </p>
                </div>
              </div>

              {/* H2 - Questions fréquentes sur le portail Services de l'Administration (FAQ) */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Questions fréquentes sur le portail Services de l'Administration (FAQ)</h2>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-l-4 border-blue-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Qu'est-ce que le portail Services de l'Administration ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Le portail Services de l'Administration est un portail centralisé qui regroupe tous les liens essentiels vers les services administratifs français les plus utilisés. Il permet d'accéder rapidement aux sites officiels et aux applications mobiles pour effectuer vos démarches en ligne, organisés par catégorie (CAF, Sécurité Sociale, Impôts, etc.) pour faciliter votre navigation.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border-l-4 border-indigo-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Comment accéder aux Services de l'Administration ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Pour accéder aux Services de l'Administration, accédez directement au service avec 10 tokens. L'accès est immédiat, le portail est accessible depuis vos applications. Vous pourrez alors naviguer par catégories ou utiliser la recherche pour trouver rapidement le service administratif dont vous avez besoin.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-l-4 border-purple-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Quels services administratifs sont disponibles ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Le portail regroupe les principaux services administratifs français : CAF (allocations familiales, aide au logement, RSA), Sécurité Sociale (carte Vitale, remboursements), Impôts (déclaration en ligne, paiement), Permis de conduire, Aides sociales, Scolarité et Éducation, Études supérieures, Retraites, Famille, Handicap, Papiers d'identité, Emploi et Chômage.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-pink-50 to-red-50 p-6 rounded-2xl border-l-4 border-pink-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Les Services de l'Administration sont-ils gratuits ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      L'accès du portail Services de l'Administration coûte 10 tokens par accès. Utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiat, vous pouvez accéder à tous les liens et services sans frais supplémentaires. Les liens pointent vers les sites officiels des administrations françaises.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-2xl border-l-4 border-red-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Puis-je accéder aux applications mobiles des administrations ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Oui, pour les services qui disposent d'une application mobile officielle, le portail fournit des liens directs vers l'App Store (iOS) et le Play Store (Android). Vous pouvez ainsi effectuer vos démarches depuis votre smartphone où que vous soyez.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-2xl border-l-4 border-orange-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Mes données sont-elles sécurisées ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Le portail vous redirige vers les sites officiels de l'administration française. Assurez-vous toujours d'être sur le bon site avant de saisir vos informations personnelles. Les sites officiels utilisent généralement les domaines .gouv.fr, .fr ou des sous-domaines vérifiés. Ne saisissez jamais vos identifiants sur un site qui vous semble suspect.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-yellow-50 to-green-50 p-6 rounded-2xl border-l-4 border-yellow-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Comment naviguer dans le portail ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Le portail offre plusieurs moyens de navigation : un menu de navigation en haut de la page avec des ancres pour accéder directement à une section (CAF, Sécurité Sociale, Impôts, etc.), une organisation visuelle par catégories avec des icônes et des couleurs distinctes, et des services populaires mis en avant pour un accès encore plus rapide.
                    </p>
                  </div>
                </div>
              </div>

              {/* Description principale */}
              <div className="text-center max-w-5xl mx-auto mb-8">
                <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed text-gray-700 mb-6">
                  Ce portail a été conçu pour simplifier l'accès aux informations et démarches administratives en France. 
                  Nous regroupons les liens essentiels vers les sites officiels et les applications mobiles des principales 
                  administrations, afin de vous faire gagner du temps et de vous éviter des recherches fastidieuses.
                </p>
                <p className="text-base sm:text-lg text-gray-600 italic mb-8">
                  Notre objectif est de rendre l'administration plus accessible et plus simple pour tous les citoyens.
                </p>
              </div>

                {/* Description détaillée en plusieurs chapitres */}
                <div className="max-w-6xl mx-auto space-y-8">
                  {/* Chapitre 1: Qu'est-ce que ce service */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">1</span>
                      </div>
                      <h4 className="text-2xl font-bold text-blue-900">Un portail centralisé</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        Ce service regroupe tous les liens essentiels vers les services administratifs français les plus utilisés. 
                        Plus besoin de chercher dans vos favoris ou de mémoriser de nombreuses adresses : tout est organisé 
                        par catégorie pour un accès rapide et intuitif.
                      </p>
                      <p className="text-base leading-relaxed">
                        Que vous ayez besoin de faire une demande d'aide, de renouveler un document d'identité, de consulter 
                        vos droits ou d'effectuer toute autre démarche administrative, vous trouverez ici les ressources nécessaires 
                        en quelques clics.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 2: Organisation par catégories */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-2xl border border-indigo-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">2</span>
                      </div>
                      <h4 className="text-2xl font-bold text-indigo-900">Organisation par catégories</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>CAF (Caisse d'Allocations Familiales) :</strong> Accès rapide aux allocations familiales, 
                        aide au logement, RSA, prime d'activité et toutes les prestations familiales.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Sécurité Sociale :</strong> Gestion de votre carte Vitale, remboursements de soins, 
                        déclaration de changement de situation, recherche de professionnels de santé.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Impôts :</strong> Déclaration en ligne, paiement des impôts, simulateur d'impôts, 
                        consultation de votre situation fiscale.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Et bien plus :</strong> Permis de conduire, aides sociales, scolarité, études supérieures, 
                        retraites, famille, handicap, papiers d'identité, emploi et chômage.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 3: Services populaires */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">3</span>
                      </div>
                      <h4 className="text-2xl font-bold text-purple-900">Services populaires mis en avant</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        Les services les plus demandés sont mis en avant en haut de la page pour un accès encore plus rapide. 
                        Vous trouverez notamment :
                      </p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Demande d'allocations familiales et aide au logement (CAF)</li>
                        <li>Gestion de la carte Vitale et remboursements (Sécurité Sociale)</li>
                        <li>Déclaration d'impôts en ligne</li>
                        <li>Demande ou renouvellement de carte d'identité et passeport</li>
                        <li>Inscription à Pôle Emploi et demande d'allocation chômage</li>
                        <li>Inscription scolaire et bourses</li>
                        <li>Demande de retraite et simulateur</li>
                      </ul>
                    </div>
                  </div>

                  {/* Chapitre 4: Applications mobiles */}
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-8 rounded-2xl border border-cyan-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">4</span>
                      </div>
                      <h4 className="text-2xl font-bold text-cyan-900">Applications mobiles</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        Pour les services qui disposent d'une application mobile officielle, nous fournissons des liens directs 
                        vers l'App Store (iOS) et le Play Store (Android). Effectuez vos démarches depuis votre smartphone 
                        où que vous soyez, de manière encore plus pratique.
                      </p>
                      <p className="text-base leading-relaxed">
                        Les applications mobiles des administrations offrent souvent des fonctionnalités supplémentaires comme 
                        la notification de remboursements, le suivi de dossiers en temps réel, ou l'accès à vos documents 
                        directement depuis votre téléphone.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 5: Navigation simplifiée */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-8 rounded-2xl border border-emerald-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">5</span>
                      </div>
                      <h4 className="text-2xl font-bold text-emerald-900">Navigation simplifiée</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Navigation par ancres :</strong> Utilisez le menu de navigation en haut de la page pour accéder 
                        directement à la section qui vous intéresse (CAF, Sécurité Sociale, Impôts, etc.).
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Recherche visuelle :</strong> Les services sont organisés de manière logique avec des icônes 
                        et des couleurs distinctes pour chaque administration, facilitant la recherche visuelle.
                      </p>
                      <p className="text-lg leading-relaxed">
                        <strong>Liens directs :</strong> Tous les liens pointent vers les sites officiels des administrations, 
                        garantissant la sécurité et l'authenticité des informations.
                      </p>
                    </div>
                  </div>

                  {/* Chapitre 6: Sécurité et confidentialité */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-2xl border border-amber-200 shadow-lg">
                    <div className="flex items-center mb-6">
                      <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                        <span className="text-white text-xl font-bold">⚠️</span>
                      </div>
                      <h4 className="text-2xl font-bold text-amber-900">Sécurité et confidentialité</h4>
                    </div>
                    <div className="space-y-4 text-gray-700">
                      <p className="text-lg leading-relaxed">
                        <strong>Important :</strong> Ce portail vous redirige vers les sites officiels de l'administration française. 
                        Assurez-vous toujours d'être sur le bon site avant de saisir vos informations personnelles.
                      </p>
                      <p className="text-base leading-relaxed">
                        Vérifiez l'URL dans la barre d'adresse de votre navigateur. Les sites officiels utilisent généralement 
                        les domaines <code className="bg-amber-100 px-2 py-1 rounded">.gouv.fr</code>, <code className="bg-amber-100 px-2 py-1 rounded">.fr</code> 
                        ou des sous-domaines vérifiés. Ne saisissez jamais vos identifiants sur un site qui vous semble suspect.
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
        moduleName="Administration"
        tokenCost={10}
        tokenUnit="Utilisez l'application aussi longtemps que vous souhaitez"
        apiEndpoint="/api/activate-administration"
        gradientColors="from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        icon="⚙️"
        isModuleActivated={alreadyActivatedModules.includes(moduleId)}
        onActivationSuccess={() => setAlreadyActivatedModules(prev => [...prev, moduleId])}
      />
    </div>
  );
}






