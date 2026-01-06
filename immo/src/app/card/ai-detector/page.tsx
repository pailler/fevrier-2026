'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '../../../components/Breadcrumb';
import Link from 'next/link';
import { useCustomAuth } from '../../../hooks/useCustomAuth';
import CardPageActivationSection from '../../../components/CardPageActivationSection';

export default function AIDetectorCardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useCustomAuth();
  const [loading, setLoading] = useState(false);
  const [alreadyActivatedModules, setAlreadyActivatedModules] = useState<string[]>([]);
  const [checkingActivation, setCheckingActivation] = useState(false);

  const moduleId = 'ai-detector';
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de l'authentification...</p>
          <p className="text-sm text-gray-500 mt-2">Si le chargement prend trop de temps, veuillez rafraîchir la page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Fil d'Ariane */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 pt-2">
        <div className="max-w-7xl mx-auto px-6 py-1">
          <Breadcrumb 
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Détecteur de Contenu IA' }
            ]}
          />
        </div>
      </div>

      {/* Bannière spéciale */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-500 py-12 relative overflow-hidden">
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
                Détecteur de Contenu IA : Analysez vos documents et images
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                DÉTECTION IA
              </span>
              <p className="text-xl text-white/90 mb-6">
                Analysez vos documents texte, PDF, DOCX et images pour détecter la proportion de contenu généré par l'intelligence artificielle. Détection précise avec scores détaillés.
              </p>
              
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  📝 Analyse de texte
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  📄 Support PDF/DOCX
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🖼️ Détection d'images
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  📊 Scores détaillés
                </span>
              </div>
            </div>
            
            {/* Logo animé */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                <div className="absolute top-0 left-0 w-24 h-24 bg-yellow-300 rounded-full opacity-80 animate-pulse"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-blue-300 rounded-lg opacity-80 animate-bounce"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-purple-300 transform rotate-45 opacity-80 animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-white rounded-full opacity-80 animate-bounce"></div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-sm rounded-full p-8 shadow-2xl border-4 border-blue-500/20">
                    <span className="text-8xl">🔍</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section principale - Description */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Colonne 1 - Description */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                À propos de l'application
              </h2>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg">
                  Le Détecteur de Contenu IA est un outil avancé qui analyse vos documents et images pour déterminer si le contenu a été généré par une intelligence artificielle.
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="font-semibold text-blue-900 mb-2">✨ Fonctionnalités :</p>
                  <ul className="list-disc list-inside text-blue-800 space-y-1">
                    <li>Analyse de texte (collage direct ou fichiers)</li>
                    <li>Support des formats PDF et DOCX</li>
                    <li>Détection d'images générées par IA</li>
                    <li>Scores détaillés avec analyse phrase par phrase</li>
                    <li>Détection du style IA (ChatGPT, Claude, etc.)</li>
                    <li>100 tokens par accès</li>
                  </ul>
                </div>
              </div>
            </div>
          
            {/* Colonne 2 - Accès */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
              <div className="text-center mb-8">
                <div className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-2xl shadow-lg mb-4">
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
                          // Utilisateur connecté : activer ai-detector via API
                          try {
                            setLoading(true);
                            const response = await fetch('/api/activate-ai-detector', {
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
                                console.log('✅ Détecteur IA activé avec succès');
                                setAlreadyActivatedModules(prev => [...prev, moduleId]);
                                router.push('/encours'); // Redirect to /encours
                              } else {
                                console.error('❌ Erreur activation Détecteur IA:', data.error);
                                alert('Erreur lors de l\'activation: ' + (data.error || 'Erreur inconnue'));
                              }
                            } else {
                              const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
                              console.error('❌ Erreur réponse API:', response.status, errorData);
                              alert('Erreur lors de l\'activation: ' + (errorData.error || 'Erreur inconnue'));
                            }
                          } catch (error) {
                            console.error('❌ Erreur lors de l\'activation du Détecteur IA:', error);
                            alert('Erreur lors de l\'activation');
                          } finally {
                            setLoading(false);
                          }
                        } else {
                          // Utilisateur non connecté : aller à la page de connexion puis retour à la page actuelle
                          console.log('🔒 Accès Détecteur IA - Redirection vers connexion');
                          router.push(`/login?redirect=${encodeURIComponent(`/card/${moduleId}`)}`);
                        }
                      }}
                      disabled={loading || checkingActivation}
                      className={`w-full font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3
                        ${loading || checkingActivation
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                        }`}
                    >
                      {loading || checkingActivation ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          <span>Activation en cours...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xl">🔍</span>
                          <span>
                            {isAuthenticated && user ? 'Activez le Détecteur IA (100 tokens)' : 'Connectez-vous pour activer (100 tokens)'}
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
      </section>

      {/* Section d'activation en bas de page */}
      <CardPageActivationSection
        moduleId={moduleId}
        moduleName="AI Detector"
        tokenCost={100}
        tokenUnit="par accès"
        apiEndpoint="/api/activate-ai-detector"
        gradientColors="from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
        icon="🔍"
        isModuleActivated={alreadyActivatedModules.includes(moduleId)}
        onActivationSuccess={() => setAlreadyActivatedModules(prev => [...prev, moduleId])}
      />
    </div>
  );
}

