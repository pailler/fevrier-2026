'use client';
import type { CardInteractiveProps, CardModuleData } from '@/types/cardModule';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '../../../components/Breadcrumb';
import Link from 'next/link';
import { useCustomAuth } from '../../../hooks/useCustomAuth';
import CardPageActivationSection from '../../../components/CardPageActivationSection';

export default function LibreSpeedCardPage({ initialModule }: CardInteractiveProps) {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useCustomAuth();
  const [loading, setLoading] = useState(false);
  const [alreadyActivatedModules, setAlreadyActivatedModules] = useState<string[]>([]);
  const [checkingActivation, setCheckingActivation] = useState(false);

  const moduleId = 'librespeed';
  const isFreeModule = false; // Module payant : 10 tokens par accès

  // Configuration du module LibreSpeed
  const librespeedModule = {
    id: 'librespeed',
    title: 'LibreSpeed',
    subtitle: 'Test de vitesse internet complet - 10 tokens par accès, utilisez aussi longtemps que vous souhaitez',
    description: 'Test de vitesse internet rapide et précis. Mesurez votre débit de téléchargement et d\'upload avec précision. Coûte 10 tokens par accès. Utilisez l\'application aussi longtemps que vous souhaitez.',
    category: 'WEB TOOLS',
    price: '10 tokens',
    image: '/images/librespeed.jpg',
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Fil d'Ariane */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 pt-2">
        <div className="max-w-7xl mx-auto px-6 py-1">
          <Breadcrumb 
            items={[
              { label: 'Accueil', href: '/' },
              { label: librespeedModule?.title || 'LibreSpeed' }
            ]}
          />
        </div>
      </div>

      {/* Bannière spéciale pour LibreSpeed */}
      <section className="bg-gradient-to-br from-yellow-400 via-blue-500 via-indigo-500 to-emerald-600 py-8 relative overflow-hidden">
        {/* Effet de particules animées */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-white/30 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 bg-white/25 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-white/20 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-white/15 rounded-full animate-pulse"></div>
        </div>
        
        {/* Effet de vague en bas */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/10 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Contenu texte */}
            <div className="flex-1 max-w-2xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                LibreSpeed : test de vitesse internet rapide et précis
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                {(librespeedModule?.category || 'WEB TOOLS').toUpperCase()}
              </span>
              <p className="text-xl text-blue-100 mb-6">
                Testez votre débit internet avec LibreSpeed : mesure précise du téléchargement, upload et latence. Test de vitesse internet gratuit, open-source, sans publicité et respectueux de la vie privée.
              </p>
              
              {/* Badges de fonctionnalités */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  ⚡ Test de vitesse
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  📊 Statistiques détaillées
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🔒 Sécurisé et privé
                </span>
              </div>
            </div>
            
            {/* Logo LibreSpeed animé */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                {/* Formes géométriques abstraites */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-red-400 rounded-full opacity-80 animate-pulse"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-yellow-400 rounded-lg opacity-80 animate-bounce"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-green-400 transform rotate-45 opacity-80 animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-white rounded-full opacity-80 animate-bounce"></div>
                
                {/* Logo LibreSpeed centré */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-sm rounded-full p-6 shadow-2xl border-2 border-blue-500/20">
                    <svg className="w-20 h-20" viewBox="0 0 24 24" fill="none">
                      {/* Icône vitesse */}
                      <circle cx="12" cy="12" r="10" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2"/>
                      <path d="M12 2 L12 12 L18 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
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
              À propos de LibreSpeed
            </h2>
            <div className="space-y-4 text-gray-700">
              <p className="text-lg">
                LibreSpeed est un outil de test de vitesse internet open-source et gratuit. 
                Mesurez précisément votre débit de téléchargement, upload et latence avec une interface 
                moderne et intuitive.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="font-semibold text-blue-900 mb-2">✨ Fonctionnalités :</p>
                <ul className="list-disc list-inside text-blue-800 space-y-1">
                  <li>Test de vitesse précis</li>
                  <li>Interface moderne et intuitive</li>
                  <li>Résultats détaillés</li>
                  <li>Compatible tous navigateurs</li>
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
                          router.push(`/login?redirect=${encodeURIComponent(`/card/${moduleId}?openApp=1`)}`);
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
                              moduleId: 'librespeed',
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
                          const baseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8085' : 'https://librespeed.iahome.fr';
                          window.open(`${baseUrl}?token=${encodeURIComponent(tokenData.token)}`, '_blank', 'noopener,noreferrer');
                        } catch (error) {
                          alert(`Erreur lors de l'accès: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
                        }
                      }}
                      className="inline-flex flex-col items-center gap-1 px-6 py-3 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-2xl transition-colors font-semibold shadow-lg"
                    >
                      <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                      </svg>
                      <span>Aller à Mes Applications</span>
                    </button>
                  </div>
                </div>
              )}

              {!isModuleActivated && (
                <div className="w-full">
                  <button
                    onClick={async () => {
                      if (isAuthenticated && user) {
                        try {
                          setLoading(true);
                          const response = await fetch('/api/activate-librespeed-test', {
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
                              console.log('✅ LibreSpeed accessible avec succès');
                              setAlreadyActivatedModules(prev => [...prev, moduleId]);
                              const tokenResponse = await fetch('/api/generate-access-token', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  userId: user.id,
                                  userEmail: user.email,
                                  moduleId: 'librespeed',
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
                              const baseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8085' : 'https://librespeed.iahome.fr';
                              window.open(`${baseUrl}?token=${encodeURIComponent(tokenData.token)}`, '_blank', 'noopener,noreferrer');
                            } else {
                              console.error('❌ Erreur accès LibreSpeed:', data.error);
                              alert('Erreur lors de l\'accès: ' + (data.error || 'Erreur inconnue'));
                            }
                          } else {
                            const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
                            console.error('❌ Erreur réponse API:', response.status, errorData);
                            alert('Erreur lors de l\'accès: ' + (errorData.error || 'Erreur inconnue'));
                          }
                        } catch (error) {
                          console.error('❌ Erreur lors de l\'accès de LibreSpeed:', error);
                          alert('Erreur lors de l\'accès');
                        } finally {
                          setLoading(false);
                        }
                      } else {
                        console.log('🔒 Accès LibreSpeed - Redirection vers connexion');
                        router.push(`/login?redirect=${encodeURIComponent(`/card/${moduleId}?openApp=1`)}`);
                      }
                    }}
                    disabled={loading || checkingActivation}
                    className={`w-full font-semibold py-6 px-8 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-2
                      ${loading || checkingActivation
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#16a34a] hover:bg-[#15803d] text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                      }`}
                  >
                    {loading || checkingActivation ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        <span className="font-semibold text-base sm:text-lg">Ouverture en cours...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                          <polyline points="10 17 15 12 10 7" />
                          <line x1="15" y1="12" x2="3" y2="12" />
                        </svg>
                        <span className="font-bold text-base sm:text-lg md:text-xl text-center drop-shadow-sm">{isAuthenticated && user ? 'Accéder à LibreSpeed' : 'Connectez-vous pour accéder'}</span>
                        <span className="text-sm sm:text-base font-normal text-white/95 text-center drop-shadow-sm">10 tokens par accès</span>
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
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 w-full relative overflow-hidden">
        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-12 lg:p-16 hover:shadow-3xl transition-all duration-300">
            <div className="prose max-w-none">
              
              {/* Paragraphe citable par les IA (GEO) */}
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-6 rounded-2xl mb-8 border-l-4 border-blue-500">
                <p className="text-lg leading-relaxed text-gray-800">
                  <strong>LibreSpeed est un outil de test de débit Internet open-source et gratuit qui permet de mesurer précisément les performances de votre connexion.</strong> Contrairement aux services traditionnels de test de vitesse qui collectent vos données, LibreSpeed respecte totalement votre vie privée : aucune donnée personnelle n'est collectée, aucun cookie de tracking, et aucune publicité. Testez votre débit de téléchargement, upload et latence avec une précision au milliseconde près.
                </p>
              </div>

              {/* H2 - À quoi sert LibreSpeed ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">À quoi sert LibreSpeed ?</h2>
                <div className="space-y-4 text-gray-700">
                  <p className="text-lg leading-relaxed">
                    LibreSpeed est un outil de test de vitesse internet qui permet de mesurer précisément les performances de votre connexion. Il vous aide à comprendre la qualité réelle de votre bande passante et à diagnostiquer les problèmes de connexion.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li className="text-lg"><strong>Test de vitesse internet :</strong> Mesurez votre débit de téléchargement (download) et d'upload avec précision</li>
                    <li className="text-lg"><strong>Test de latence :</strong> Découvrez votre ping pour évaluer la réactivité de votre connexion</li>
                    <li className="text-lg"><strong>Diagnostic réseau :</strong> Identifiez les problèmes de connexion et vérifiez que votre FAI respecte ses engagements</li>
                    <li className="text-lg"><strong>Optimisation :</strong> Comprenez vos performances pour optimiser votre configuration réseau</li>
                  </ul>
                  <p className="text-lg leading-relaxed mt-4">
                    <strong>Cas concrets d'utilisation :</strong> Vérifier que votre fournisseur d'accès respecte le débit promis, diagnostiquer des problèmes de connexion lente, tester la qualité de votre connexion avant une réunion importante, ou simplement connaître les performances réelles de votre internet.
                  </p>
                </div>
              </div>

              {/* H2 - Que peut faire LibreSpeed ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Que peut faire LibreSpeed ?</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                    <h3 className="text-2xl font-bold text-blue-900 mb-4">Test de débit précis</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Mesurez votre débit de téléchargement et d'upload avec une précision au milliseconde près. Les algorithmes de test sont optimisés pour fournir des résultats fiables et reproductibles.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
                    <h3 className="text-2xl font-bold text-green-900 mb-4">Test de latence (ping)</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Découvrez votre latence réseau pour évaluer la réactivité de votre connexion. Le ping est essentiel pour les jeux en ligne, les appels vidéo, et les applications en temps réel.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                    <h3 className="text-2xl font-bold text-purple-900 mb-4">Statistiques détaillées</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Analysez vos performances réseau avec des statistiques complètes et des graphiques en temps réel. Comprenez les variations de votre connexion au fil du temps.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl border border-indigo-200">
                    <h3 className="text-2xl font-bold text-indigo-900 mb-4">Interface moderne</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Une interface intuitive et moderne qui s'adapte à tous les appareils, des smartphones aux écrans 4K. Graphiques en temps réel et animations fluides pour une expérience agréable.
                    </p>
                  </div>
                </div>
              </div>

              {/* H2 - Comment utiliser LibreSpeed ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Comment utiliser LibreSpeed ?</h2>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">1</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Accéder à LibreSpeed</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Accédez à LibreSpeed avec 10 tokens. L'accès est immédiat, le service est accessible depuis vos applications.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">2</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Lancer le test</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Cliquez sur "Commencer le test" dans l'interface LibreSpeed. Le test mesurera automatiquement votre latence, puis votre débit de téléchargement et d'upload.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-2xl border border-purple-200">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0">3</div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Analyser les résultats</h3>
                        <p className="text-gray-700 leading-relaxed">
                          Consultez vos résultats détaillés : débit de téléchargement, débit d'upload, latence, et statistiques. Utilisez ces informations pour diagnostiquer des problèmes ou vérifier les performances de votre connexion.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* H2 - Pour qui est fait LibreSpeed ? */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Pour qui est fait LibreSpeed ?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 text-center">
                    <div className="text-4xl mb-4">👤</div>
                    <h3 className="text-xl font-bold text-blue-900 mb-2">Particuliers</h3>
                    <p className="text-gray-700">Vérifiez que votre FAI respecte ses engagements, diagnostiquez les problèmes de connexion, et optimisez votre configuration réseau.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 text-center">
                    <div className="text-4xl mb-4">💼</div>
                    <h3 className="text-xl font-bold text-green-900 mb-2">Professionnels</h3>
                    <p className="text-gray-700">Testez la qualité de votre connexion professionnelle, validez les performances avant des réunions importantes, et documentez les problèmes.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 text-center">
                    <div className="text-4xl mb-4">👨‍💻</div>
                    <h3 className="text-xl font-bold text-purple-900 mb-2">Développeurs</h3>
                    <p className="text-gray-700">Intégrez LibreSpeed dans vos applications pour offrir des tests de vitesse intégrés, ou utilisez l'API pour créer des outils de monitoring.</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-2xl border border-indigo-200 text-center">
                    <div className="text-4xl mb-4">🎮</div>
                    <h3 className="text-xl font-bold text-indigo-900 mb-2">Gamers</h3>
                    <p className="text-gray-700">Testez votre latence pour optimiser vos performances en jeu, vérifiez la stabilité de votre connexion, et diagnostiquez les lag.</p>
                  </div>
                </div>
              </div>

              {/* H2 - LibreSpeed vs autres tests de vitesse */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">LibreSpeed vs autres tests de vitesse</h2>
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 rounded-2xl border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                          <th className="border border-gray-300 p-4 text-left">Fonctionnalité</th>
                          <th className="border border-gray-300 p-4 text-center">LibreSpeed</th>
                          <th className="border border-gray-300 p-4 text-center">Speedtest (Ookla)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white">
                          <td className="border border-gray-300 p-4 font-semibold">Respect de la vie privée</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Aucune collecte de données</td>
                          <td className="border border-gray-300 p-4 text-center">❌ Collecte de données</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 p-4 font-semibold">Publicités</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Aucune publicité</td>
                          <td className="border border-gray-300 p-4 text-center">❌ Publicités affichées</td>
                        </tr>
                        <tr className="bg-white">
                          <td className="border border-gray-300 p-4 font-semibold">Open-source</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Code source ouvert</td>
                          <td className="border border-gray-300 p-4 text-center">❌ Propriétaire</td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="border border-gray-300 p-4 font-semibold">Précision</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Très précise</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Très précise</td>
                        </tr>
                        <tr className="bg-white">
                          <td className="border border-gray-300 p-4 font-semibold">Gratuit</td>
                          <td className="border border-gray-300 p-4 text-center">✅ 100% gratuit</td>
                          <td className="border border-gray-300 p-4 text-center">✅ Gratuit (avec pub)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-6 text-gray-700 leading-relaxed">
                    <strong>En résumé :</strong> LibreSpeed offre une alternative open-source et respectueuse de la vie privée à Speedtest. Contrairement à Speedtest qui collecte des données et affiche des publicités, LibreSpeed ne collecte aucune donnée personnelle, n'affiche aucune publicité, et respecte totalement votre confidentialité. Les résultats sont tout aussi précis.
                  </p>
                </div>
              </div>

              {/* H2 - Questions fréquentes sur LibreSpeed (FAQ) */}
              <div className="mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Questions fréquentes sur LibreSpeed (FAQ)</h2>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-l-4 border-blue-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Qu'est-ce que LibreSpeed ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      LibreSpeed est un outil de test de débit Internet open-source et gratuit qui permet de mesurer précisément les performances de votre connexion. Contrairement aux services traditionnels de test de vitesse, LibreSpeed se distingue par son approche respectueuse de la vie privée et son absence totale de publicités.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border-l-4 border-indigo-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Comment tester ma vitesse internet avec LibreSpeed ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Pour tester votre vitesse internet avec LibreSpeed, accédez directement au service avec 10 tokens. L'accès est immédiat, lancez le test depuis l'interface. LibreSpeed mesurera automatiquement votre débit de téléchargement (download), votre débit d'upload, et votre latence (ping) en quelques secondes.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-2xl border-l-4 border-purple-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">LibreSpeed est-il gratuit ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      LibreSpeed est un outil open-source et gratuit. L'accès du service coûte 10 tokens par accès. Utilisez l'application aussi longtemps que vous souhaitez. L'accès est immédiat, vous pouvez effectuer des tests de vitesse sans frais supplémentaires.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-2xl border-l-4 border-blue-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Mes données sont-elles protégées avec LibreSpeed ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Oui, LibreSpeed respecte totalement votre vie privée. Aucune donnée personnelle n'est collectée, aucun cookie de tracking n'est installé, et aucune publicité n'est affichée. Tous les calculs sont effectués localement dans votre navigateur. Vos tests restent strictement privés.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-2xl border-l-4 border-green-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Quelle est la différence entre LibreSpeed et Speedtest ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      LibreSpeed est une alternative open-source et respectueuse de la vie privée à Speedtest. Contrairement à Speedtest qui collecte des données et affiche des publicités, LibreSpeed ne collecte aucune donnée personnelle, n'affiche aucune publicité, et respecte totalement votre confidentialité. Les résultats sont tout aussi précis.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-2xl border-l-4 border-teal-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">LibreSpeed fonctionne-t-il sur mobile ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Oui, LibreSpeed fonctionne sur tous les appareils et navigateurs modernes, y compris les smartphones et tablettes. L'interface s'adapte automatiquement à la taille de l'écran pour offrir une expérience optimale sur mobile.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-2xl border-l-4 border-cyan-500">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Combien de temps dure un test de vitesse ?</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Un test de vitesse avec LibreSpeed dure généralement entre 10 et 30 secondes, selon la vitesse de votre connexion. Le test mesure successivement votre latence (ping), votre débit de téléchargement, et votre débit d'upload.
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
        moduleName="LibreSpeed"
        tokenCost={10}
        tokenUnit="Utilisez l'application aussi longtemps que vous souhaitez"
        apiEndpoint="/api/activate-librespeed-test"
        gradientColors="from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        icon="⚡"
        isModuleActivated={isModuleActivated}
        onActivationSuccess={() => setAlreadyActivatedModules(prev => [...prev, moduleId])}
      />
    </div>
  );
}








