'use client';

import { useState, useEffect } from 'react';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false,
};

export function useCookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);
  const [hasConsent, setHasConsent] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Charger les préférences depuis localStorage
    loadPreferences();
  }, []);

  const loadPreferences = () => {
    try {
      const consent = localStorage.getItem('cookieConsent');
      const consentDate = localStorage.getItem('cookieConsentDate');
      
      if (consent && consentDate) {
        // Vérifier si le consentement est encore valide (moins de 12 mois)
        const consentTimestamp = parseInt(consentDate);
        const oneYear = 365 * 24 * 60 * 60 * 1000; // 1 an en millisecondes
        
        if (Date.now() - consentTimestamp <= oneYear) {
          const savedPreferences = JSON.parse(consent);
          setPreferences(savedPreferences);
          setHasConsent(true);
        } else {
          // Le consentement a expiré
          clearConsent();
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des préférences cookies:', error);
      clearConsent();
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = (newPreferences: CookiePreferences) => {
    try {
      localStorage.setItem('cookieConsent', JSON.stringify(newPreferences));
      localStorage.setItem('cookieConsentDate', Date.now().toString());
      setPreferences(newPreferences);
      setHasConsent(true);
      
      // Appliquer les préférences
      applyCookieSettings(newPreferences);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences cookies:', error);
    }
  };

  const clearConsent = () => {
    try {
      localStorage.removeItem('cookieConsent');
      localStorage.removeItem('cookieConsentDate');
      setPreferences(DEFAULT_PREFERENCES);
      setHasConsent(false);
      
      // Nettoyer les cookies existants
      clearExistingCookies();
    } catch (error) {
      console.error('Erreur lors de la suppression du consentement:', error);
    }
  };

  const applyCookieSettings = (prefs: CookiePreferences) => {
    // Émettre un événement personnalisé pour notifier les autres composants
    window.dispatchEvent(new CustomEvent('cookiePreferencesChanged', {
      detail: prefs
    }));

    // Logique d'application des cookies selon les préférences
    if (prefs.analytics) {
      enableAnalyticsCookies();
    } else {
      disableAnalyticsCookies();
    }

    if (prefs.marketing) {
      enableMarketingCookies();
    } else {
      disableMarketingCookies();
    }

    if (prefs.functional) {
      enableFunctionalCookies();
    } else {
      disableFunctionalCookies();
    }
  };

  const enableAnalyticsCookies = () => {
    // Ici vous pouvez ajouter la logique pour activer Google Analytics, etc.
    console.log('Analytics cookies activés');
    
    // Exemple d'activation de Google Analytics (à adapter selon vos besoins)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
    }
  };

  const disableAnalyticsCookies = () => {
    console.log('Analytics cookies désactivés');
    
    // Exemple de désactivation de Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'denied'
      });
    }
  };

  const enableMarketingCookies = () => {
    console.log('Marketing cookies activés');
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted'
      });
    }
  };

  const disableMarketingCookies = () => {
    console.log('Marketing cookies désactivés');
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      });
    }
  };

  const enableFunctionalCookies = () => {
    console.log('Functional cookies activés');
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        functionality_storage: 'granted'
      });
    }
  };

  const disableFunctionalCookies = () => {
    console.log('Functional cookies désactivés');
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        functionality_storage: 'denied'
      });
    }
  };

  const clearExistingCookies = () => {
    // Supprimer les cookies non nécessaires si le consentement est retiré
    const cookies = document.cookie.split(';');
    
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      
      // Ne pas supprimer les cookies nécessaires
      const necessaryCookies = ['session', 'csrf', 'auth', 'cookieConsent'];
      const isNecessary = necessaryCookies.some(necessary => name.includes(necessary));
      
      if (!isNecessary) {
        // Supprimer le cookie
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
      }
    });
  };

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    savePreferences(allAccepted);
  };

  const rejectAll = () => {
    savePreferences(DEFAULT_PREFERENCES);
  };

  const updatePreference = (type: keyof CookiePreferences, value: boolean) => {
    if (type === 'necessary') return; // Les cookies nécessaires ne peuvent pas être désactivés
    
    const newPreferences = {
      ...preferences,
      [type]: value
    };
    setPreferences(newPreferences);
  };

  const saveCurrentPreferences = () => {
    savePreferences(preferences);
  };

  return {
    preferences,
    hasConsent,
    isLoading,
    savePreferences,
    clearConsent,
    acceptAll,
    rejectAll,
    updatePreference,
    saveCurrentPreferences,
    applyCookieSettings
  };
}
