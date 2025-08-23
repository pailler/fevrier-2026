'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import Breadcrumb from '../../components/Breadcrumb';
import { useCookieConsent } from '../../utils/useCookieConsent';
import Link from 'next/link';

export default function CookiesPage() {
  const {
    preferences,
    hasConsent,
    updatePreference,
    saveCurrentPreferences,
    acceptAll,
    rejectAll,
    clearConsent
  } = useCookieConsent();

  const [showSuccess, setShowSuccess] = useState(false);

  const handleSavePreferences = () => {
    saveCurrentPreferences();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleClearConsent = () => {
    clearConsent();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Fil d'ariane avec espacement correct */}
      <div className="pt-20">
        <Breadcrumb />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* En-tête */}
        <div className="text-center mb-12">
          <div className="text-4xl mb-4">🍪</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Gestion des cookies
          </h1>
          <p className="text-lg text-gray-600">
            Configurez vos préférences de cookies et consultez les informations détaillées
          </p>
        </div>

        {/* Message de succès */}
        {showSuccess && (
          <div className="mb-8 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            ✅ Vos préférences ont été sauvegardées avec succès !
          </div>
        )}

        {/* Statut actuel */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Statut actuel
          </h2>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-3 h-3 rounded-full ${hasConsent ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-gray-700">
              {hasConsent ? 'Consentement donné' : 'Aucun consentement enregistré'}
            </span>
            {hasConsent && (
              <span className="text-sm text-gray-500">
                (Valide pendant 12 mois)
              </span>
            )}
          </div>
          
          {hasConsent && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-medium text-gray-900">Nécessaires</div>
                <div className="text-green-600 font-medium">✓ Activé</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-medium text-gray-900">Analyse</div>
                <div className={`font-medium ${preferences.analytics ? 'text-green-600' : 'text-red-600'}`}>
                  {preferences.analytics ? '✓ Activé' : '✗ Désactivé'}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-medium text-gray-900">Fonctionnels</div>
                <div className={`font-medium ${preferences.functional ? 'text-green-600' : 'text-red-600'}`}>
                  {preferences.functional ? '✓ Activé' : '✗ Désactivé'}
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-medium text-gray-900">Marketing</div>
                <div className={`font-medium ${preferences.marketing ? 'text-green-600' : 'text-red-600'}`}>
                  {preferences.marketing ? '✓ Activé' : '✗ Désactivé'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Configuration des préférences */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Configurer vos préférences
          </h2>

          <div className="space-y-6">
            {/* Cookies nécessaires */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Cookies nécessaires
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Ces cookies sont essentiels pour que le site web fonctionne correctement. 
                    Ils permettent l'authentification, la sécurité et les fonctions de base du site.
                  </p>
                  <div className="text-xs text-gray-500">
                    <strong>Exemples :</strong> Cookies de session, authentification, sécurité CSRF, préférences linguistiques de base
                  </div>
                </div>
                <div className="flex items-center ml-4">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled={true}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 opacity-50"
                  />
                  <span className="ml-3 text-sm text-green-600 font-medium">Toujours activé</span>
                </div>
              </div>
            </div>

            {/* Cookies d'analyse */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Cookies d'analyse
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Ces cookies nous aident à comprendre comment les visiteurs utilisent notre site web 
                    en collectant des informations anonymes sur les pages visitées et les interactions.
                  </p>
                  <div className="text-xs text-gray-500">
                    <strong>Exemples :</strong> Google Analytics, statistiques de trafic, mesure des performances, heatmaps
                  </div>
                </div>
                <label className="flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => updatePreference('analytics', e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700 font-medium">
                    {preferences.analytics ? 'Activé' : 'Désactivé'}
                  </span>
                </label>
              </div>
            </div>

            {/* Cookies fonctionnels */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Cookies fonctionnels
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Ces cookies permettent d'améliorer les fonctionnalités et la personnalisation 
                    du site, comme les préférences utilisateur et les paramètres d'interface.
                  </p>
                  <div className="text-xs text-gray-500">
                    <strong>Exemples :</strong> Préférences d'affichage, paramètres personnalisés, widgets interactifs, chat support
                  </div>
                </div>
                <label className="flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={preferences.functional}
                    onChange={(e) => updatePreference('functional', e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700 font-medium">
                    {preferences.functional ? 'Activé' : 'Désactivé'}
                  </span>
                </label>
              </div>
            </div>

            {/* Cookies marketing */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Cookies marketing
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Ces cookies sont utilisés pour afficher des publicités personnalisées et 
                    mesurer l'efficacité de nos campagnes publicitaires.
                  </p>
                  <div className="text-xs text-gray-500">
                    <strong>Exemples :</strong> Publicités ciblées, remarketing, pixels de suivi, réseaux sociaux
                  </div>
                </div>
                <label className="flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => updatePreference('marketing', e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700 font-medium">
                    {preferences.marketing ? 'Activé' : 'Désactivé'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={rejectAll}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Refuser tout
            </button>
            <button
              onClick={handleSavePreferences}
              className="px-6 py-3 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Sauvegarder mes préférences
            </button>
            <button
              onClick={acceptAll}
              className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Accepter tout
            </button>
          </div>
        </div>

        {/* Informations légales */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Informations légales
          </h2>
          
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Durée de conservation</h3>
              <p>Votre consentement est conservé pendant 12 mois. Passé ce délai, il vous sera demandé de nouveau.</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Vos droits</h3>
              <p>Vous pouvez modifier ou retirer votre consentement à tout moment en revenant sur cette page ou en utilisant les liens présents dans nos communications.</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Base légale</h3>
              <p>Le traitement de vos données personnelles via les cookies est basé sur votre consentement libre et éclairé, conformément au RGPD (article 6.1.a).</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleClearConsent}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-300 rounded-lg hover:bg-red-100 transition-colors"
            >
              Révoquer tout consentement
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Cela supprimera tous vos choix et vous demandera de donner à nouveau votre consentement.
            </p>
          </div>
        </div>

        {/* Liens utiles */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Liens utiles
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Link 
              href="/privacy" 
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl mr-3">🔒</div>
              <div>
                <div className="font-medium text-gray-900">Politique de confidentialité</div>
                <div className="text-sm text-gray-600">Consultez notre politique complète</div>
              </div>
            </Link>
            
            <Link 
              href="/contact" 
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl mr-3">💬</div>
              <div>
                <div className="font-medium text-gray-900">Nous contacter</div>
                <div className="text-sm text-gray-600">Questions sur vos données</div>
              </div>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
