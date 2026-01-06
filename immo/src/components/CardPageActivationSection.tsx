'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCustomAuth } from '../hooks/useCustomAuth';

interface CardPageActivationSectionProps {
  moduleId: string;
  moduleName: string;
  tokenCost: number;
  tokenUnit?: string; // "par accès" ou "par utilisation"
  apiEndpoint: string; // e.g., '/api/activate-code-learning'
  gradientColors?: string; // e.g., 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
  icon?: string;
  isModuleActivated?: boolean; // Optionnel, sera vérifié automatiquement si non fourni
  onActivationSuccess?: () => void;
  // Paramètres supplémentaires pour les endpoints qui nécessitent plus d'infos
  moduleTitle?: string;
  moduleDescription?: string;
  moduleCategory?: string;
  moduleUrl?: string;
  // Fonction personnalisée pour construire le body de la requête
  customRequestBody?: (userId: string, email: string, moduleId: string) => any;
}

export default function CardPageActivationSection({
  moduleId,
  moduleName,
  tokenCost,
  tokenUnit = 'par accès',
  apiEndpoint,
  gradientColors = 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
  icon = '💻',
  isModuleActivated: externalIsModuleActivated,
  onActivationSuccess,
  moduleTitle,
  moduleDescription,
  moduleCategory,
  moduleUrl,
  customRequestBody
}: CardPageActivationSectionProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useCustomAuth();
  const [loading, setLoading] = useState(false);
  const [isModuleActivated, setIsModuleActivated] = useState(externalIsModuleActivated || false);
  const [checkingActivation, setCheckingActivation] = useState(false);

  // Vérifier l'état d'activation si non fourni
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

  useEffect(() => {
    if (externalIsModuleActivated !== undefined) {
      setIsModuleActivated(externalIsModuleActivated);
    } else if (user?.id && moduleId) {
      const checkActivation = async () => {
        setCheckingActivation(true);
        const isActivated = await checkModuleActivation(moduleId);
        setIsModuleActivated(isActivated);
        setCheckingActivation(false);
      };
      checkActivation();
    }
  }, [externalIsModuleActivated, user?.id, moduleId, checkModuleActivation]);

  const handleActivate = async () => {
    if (!isAuthenticated || !user) {
      router.push(`/login?redirect=${encodeURIComponent(`/card/${moduleId}`)}`);
      return;
    }

    try {
      setLoading(true);
      
      // Construire le body de la requête
      let requestBody: any;
      if (customRequestBody) {
        requestBody = customRequestBody(user.id, user.email || '', moduleId);
      } else if (moduleTitle) {
        // Si moduleTitle est fourni, utiliser le format complet
        requestBody = {
          moduleId: moduleId,
          userId: user.id,
          moduleTitle: moduleTitle,
          ...(moduleDescription && { moduleDescription }),
          ...(moduleCategory && { moduleCategory }),
          ...(moduleUrl && { moduleUrl })
        };
      } else {
        // Format simple par défaut
        requestBody = {
          userId: user.id,
          email: user.email
        };
      }
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log(`✅ ${moduleName} activé avec succès`);
          setIsModuleActivated(true);
          if (onActivationSuccess) {
            onActivationSuccess();
          }
          router.push('/encours');
        } else {
          console.error(`❌ Erreur activation ${moduleName}:`, data.error);
          alert('Erreur lors de l\'activation: ' + (data.error || 'Erreur inconnue'));
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        console.error('❌ Erreur réponse API:', response.status, errorData);
        alert('Erreur lors de l\'activation: ' + (errorData.error || 'Erreur inconnue'));
      }
    } catch (error) {
      console.error(`❌ Erreur lors de l'activation de ${moduleName}:`, error);
      alert('Erreur lors de l\'activation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12 w-full">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Colonne 1 - Description */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Activez {moduleName}
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Accédez à {moduleName} et profitez de toutes ses fonctionnalités. L'activation est simple et rapide.
              </p>
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                  <div className="text-2xl font-bold text-blue-900">
                    {tokenCost} tokens
                  </div>
                  <div className="text-sm text-blue-700">
                    {tokenUnit}
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne 2 - Bouton d'activation */}
            <div className="flex justify-center">
              {isModuleActivated ? (
                <div className="w-full max-w-md bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-center">
                  <div className="flex items-center justify-center space-x-3 text-green-800 mb-4">
                    <span className="text-3xl">✅</span>
                    <div>
                      <p className="font-semibold text-lg">Service déjà activé !</p>
                      <p className="text-sm opacity-80">Pour y accéder, cliquez sur Mes Applis activées</p>
                    </div>
                  </div>
                  <Link
                    href="/encours"
                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md hover:shadow-lg"
                  >
                    <span className="mr-2">📱</span>
                    Aller à Mes Applications
                  </Link>
                </div>
              ) : (
                <div className="w-full max-w-md">
                  <button
                    onClick={handleActivate}
                    disabled={loading || checkingActivation}
                    className={`w-full font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1
                      ${loading || checkingActivation
                        ? 'bg-gray-400 cursor-not-allowed'
                        : `bg-gradient-to-r ${gradientColors} text-white`
                      }`}
                  >
                    {loading || checkingActivation ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        <span>Activation en cours...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xl">{icon}</span>
                        <span>
                          {isAuthenticated && user 
                            ? `Activer ${moduleName} (${tokenCost} tokens)` 
                            : `Connectez-vous pour activer (${tokenCost} tokens)`
                          }
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
  );
}
