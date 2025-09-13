'use client';

import React from 'react';

export default function PhotoPortfolioPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🎯 Portfolio Photo IA - iAhome
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Fonctionnalités disponibles :</h2>
          <ul className="space-y-2 text-gray-700">
            <li>✅ Upload intelligent de photos</li>
            <li>✅ Analyse automatique par IA</li>
            <li>✅ Recherche sémantique</li>
            <li>✅ Gestion des collections</li>
            <li>✅ Statistiques d'utilisation</li>
          </ul>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Configuration requise :</h3>
          <p className="text-blue-800">
            Pour utiliser cette application, vous devez :
          </p>
          <ol className="list-decimal list-inside mt-2 space-y-1 text-blue-800">
            <li>Activer l'extension pgvector dans Supabase</li>
            <li>Exécuter le script SQL de création des tables</li>
            <li>Configurer les variables d'environnement</li>
            <li>Vous connecter avec votre compte</li>
          </ol>
        </div>

        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-900 mb-2">Prochaines étapes :</h3>
          <p className="text-green-800">
            L'application est prête ! Les composants complets seront chargés une fois la configuration terminée.
          </p>
        </div>
      </div>
    </div>
  );
}
