'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Toujours activé
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement
    const consent = localStorage.getItem('cookieConsent');
    const consentDate = localStorage.getItem('cookieConsentDate');
    
    if (!consent || !consentDate) {
      setIsVisible(true);
    } else {
      // Vérifier si le consentement est encore valide (moins de 12 mois)
      const consentTimestamp = parseInt(consentDate);
      const oneYear = 365 * 24 * 60 * 60 * 1000; // 1 an en millisecondes
      
      if (Date.now() - consentTimestamp > oneYear) {
        // Le consentement a expiré, demander à nouveau
        setIsVisible(true);
      } else {
        // Charger les préférences sauvegardées
        try {
          const savedPreferences = JSON.parse(consent);
          setPreferences(savedPreferences);
        } catch (error) {
          console.error('Erreur lors du chargement des préférences cookies:', error);
          setIsVisible(true);
        }
      }
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem('cookieConsent', JSON.stringify(prefs));
    localStorage.setItem('cookieConsentDate', Date.now().toString());
    
    // Appliquer les cookies selon les préférences
    applyCookiePreferences(prefs);
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    saveConsent(allAccepted);
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    saveConsent(onlyNecessary);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const applyCookiePreferences = (prefs: CookiePreferences) => {
    // Ici vous pouvez ajouter la logique pour activer/désactiver les cookies
    // selon les préférences de l'utilisateur
    
    if (prefs.analytics) {
      // Activer Google Analytics ou autres outils d'analyse
      console.log('Analytics cookies activés');
    } else {
      // Désactiver les cookies d'analyse
      console.log('Analytics cookies désactivés');
    }

    if (prefs.marketing) {
      // Activer les cookies marketing/publicité
      console.log('Marketing cookies activés');
    } else {
      // Désactiver les cookies marketing
      console.log('Marketing cookies désactivés');
    }

    if (prefs.functional) {
      // Activer les cookies fonctionnels
      console.log('Functional cookies activés');
    } else {
      // Désactiver les cookies fonctionnels
      console.log('Functional cookies désactivés');
    }
  };

  const handlePreferenceChange = (type: keyof CookiePreferences, value: boolean) => {
    if (type === 'necessary') return; // Les cookies nécessaires ne peuvent pas être désactivés
    
    setPreferences(prev => ({
      ...prev,
      [type]: value
    }));
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Bannière de consentement */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-[9999] max-h-[90vh] overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          {!showDetails ? (
            // Vue simplifiée
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">🍪</div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Gestion des cookies
                  </h3>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Nous utilisons des cookies pour améliorer votre expérience, analyser notre trafic et personnaliser le contenu. 
                  Vous pouvez choisir quels cookies accepter ou configurer vos préférences.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <Link 
                    href="/privacy" 
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Politique de confidentialité
                  </Link>
                  <span className="text-gray-400">•</span>
                  <button
                    onClick={() => setShowDetails(true)}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Paramètres détaillés
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Refuser tout
                </button>
                <button
                  onClick={() => setShowDetails(true)}
                  className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Personnaliser
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Accepter tout
                </button>
              </div>
            </div>
          ) : (
            // Vue détaillée
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🍪</div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Paramètres des cookies
                  </h3>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ✕
                </button>
              </div>

              <p className="text-gray-700 text-sm mb-6">
                Configurez vos préférences de cookies. Les cookies nécessaires sont toujours activés pour assurer le bon fonctionnement du site.
              </p>

              <div className="space-y-6">
                {/* Cookies nécessaires */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Cookies nécessaires</h4>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={true}
                        disabled={true}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 opacity-50"
                      />
                      <span className="ml-2 text-sm text-green-600 font-medium">Toujours activé</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Ces cookies sont essentiels pour que le site web fonctionne correctement. Ils comprennent l'authentification, la sécurité et les fonctions de base.
                  </p>
                </div>

                {/* Cookies d'analyse */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Cookies d'analyse</h4>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {preferences.analytics ? 'Activé' : 'Désactivé'}
                      </span>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Ces cookies nous aident à comprendre comment les visiteurs utilisent notre site web en collectant des informations anonymes.
                  </p>
                </div>

                {/* Cookies fonctionnels */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Cookies fonctionnels</h4>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.functional}
                        onChange={(e) => handlePreferenceChange('functional', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {preferences.functional ? 'Activé' : 'Désactivé'}
                      </span>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Ces cookies permettent d'améliorer les fonctionnalités et la personnalisation, comme les préférences de langue et les paramètres utilisateur.
                  </p>
                </div>

                {/* Cookies marketing */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Cookies marketing</h4>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) => handlePreferenceChange('marketing', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {preferences.marketing ? 'Activé' : 'Désactivé'}
                      </span>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Ces cookies sont utilisés pour afficher des publicités personnalisées et mesurer l'efficacité de nos campagnes publicitaires.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleRejectAll}
                  className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Refuser tout
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="px-6 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Sauvegarder mes préférences
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Accepter tout
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                <Link 
                  href="/privacy" 
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Consulter notre politique de confidentialité complète
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
