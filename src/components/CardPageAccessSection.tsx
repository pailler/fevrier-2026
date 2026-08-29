'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomAuth } from '../hooks/useCustomAuth';
import { useTokenContext } from '../contexts/TokenContext';
import { FREE_UNLIMITED_ACCESS_LABEL, formatCreditsAmount } from '../utils/tokenActionService';
import {
  getModuleAppUrl,
  openModuleAppWithToken,
  openPendingModuleTab,
  redirectToLogin,
} from '../utils/moduleAppUrl';

interface CardPageAccessSectionProps {
  moduleId: string;
  moduleName: string;
  tokenCost: number;
  tokenUnit?: string;
  /** Si false, le bouton n’affiche pas la répétition « N tokens + unité » (déjà dans le bloc bleu à gauche). */
  showCostSummaryOnButton?: boolean;
  /** Classes Tailwind (sans bg-gradient) : ex. from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 */
  gradientColors?: string;
  icon?: string;
  moduleTitle?: string;
  moduleDescription?: string;
  moduleCategory?: string;
  moduleUrl?: string;
  accessUrl?: string;
}


export default function CardPageAccessSection({
  moduleId,
  moduleName,
  tokenCost,
  tokenUnit = 'par accès',
  showCostSummaryOnButton = true,
  gradientColors,
  icon = '💻',
  moduleUrl,
  accessUrl,
  moduleTitle: _moduleTitle,
  moduleDescription: _moduleDescription,
  moduleCategory: _moduleCategory,
}: CardPageAccessSectionProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useCustomAuth();
  const { refreshTokens } = useTokenContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveModuleUrl = () => {
    if (accessUrl) return accessUrl;
    if (moduleUrl) return moduleUrl;
    return getModuleAppUrl(moduleId);
  };

  const handleDirectAccess = async () => {
    const loginReturnPath = `/card/${(moduleId || '').trim().toLowerCase()}`;
    if (!isAuthenticated || !user) {
      redirectToLogin(loginReturnPath);
      return;
    }

    const targetUrlPreview = resolveModuleUrl();
    // Toujours ouvrir un onglet au clic (évite le bloqueur popup après le fetch token)
    const pendingTab = openPendingModuleTab();

    try {
      setLoading(true);
      setError(null);
      const normalizedModuleId = (moduleId || '').trim().toLowerCase();
      const response = await fetch('/api/generate-access-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          moduleId: normalizedModuleId,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        throw new Error(errorData.error || `Erreur HTTP ${response.status}`);
      }

      const data = await response.json();
      const token = data?.token;
      if (!token) {
        throw new Error('Token d\'accès manquant');
      }

      const targetUrl = resolveModuleUrl();
      if (!targetUrl) {
        throw new Error(`URL d'accès introuvable pour le module ${moduleId}`);
      }

      openModuleAppWithToken(normalizedModuleId, token, targetUrl, pendingTab);

      try {
        await refreshTokens();
      } catch {
        // Non bloquant
      }
    } catch (err) {
      if (pendingTab && !pendingTab.closed) {
        pendingTab.close();
      }
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error(`❌ Erreur lors de l'accès à ${moduleName}:`, err);
      setError(message);
      alert(`Erreur lors de l'accès: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-12 w-full">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Accès à {moduleName}
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Ouvrez {moduleName} via un code d&apos;accès sécurisé.
              </p>
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                  <div className="text-2xl font-bold text-blue-900">
                    {tokenCost === 0 ? FREE_UNLIMITED_ACCESS_LABEL : formatCreditsAmount(tokenCost)}
                  </div>
                  {tokenCost > 0 ? (
                    <div className="text-sm text-blue-700">
                      {tokenUnit}
                    </div>
                  ) : (
                    <div className="text-sm text-blue-700">
                      Connexion requise · mode connecté
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <button
                  type="button"
                  onClick={handleDirectAccess}
                  disabled={loading}
                  className={`w-full font-semibold py-6 px-8 rounded-2xl transition-all duration-300 flex flex-col items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-white
                    ${
                      loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : gradientColors
                          ? `bg-gradient-to-r ${gradientColors}`
                          : 'bg-[#16a34a] hover:bg-[#15803d]'
                    }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span className="font-semibold text-base sm:text-lg">Ouverture en cours...</span>
                    </>
                  ) : (
                    <>
                      {icon ? (
                        <span className="text-3xl sm:text-4xl leading-none" aria-hidden>
                          {icon}
                        </span>
                      ) : null}
                      <svg className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                      </svg>
                      <span className="font-bold text-base sm:text-lg md:text-xl text-center drop-shadow-sm">
                        {isAuthenticated && user ? `Accéder à ${moduleName}` : `Connectez-vous pour accéder`}
                      </span>
                      {showCostSummaryOnButton ? (
                        <span className="text-sm sm:text-base font-normal text-white/95 text-center drop-shadow-sm">
                          {tokenCost === 0
                            ? FREE_UNLIMITED_ACCESS_LABEL
                            : `${formatCreditsAmount(tokenCost)} ${tokenUnit}`}
                        </span>
                      ) : null}
                    </>
                  )}
                </button>
                {error ? (
                  <p className="mt-3 text-sm text-red-600 text-center max-w-md">{error}</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
