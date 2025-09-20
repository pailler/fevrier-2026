'use client';

import { useState } from 'react';

export default function PurgeCachePage() {
  const [purging, setPurging] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const purgeCloudflareCache = async () => {
    setPurging(true);
    setResults([]);
    
    addResult('🚀 Début de la purge du cache Cloudflare...');
    
    try {
      // URLs à purger
      const urlsToPurge = [
        'https://iahome.fr/',
        'https://iahome.fr/encours',
        'https://iahome.fr/encours-simple',
        'https://iahome.fr/test-urls-direct',
        'https://metube.iahome.fr/',
        'https://pdf.iahome.fr/',
        'https://librespeed.iahome.fr/',
        'https://psitransfer.iahome.fr/'
      ];

      for (const url of urlsToPurge) {
        try {
          addResult(`🔄 Purge de ${url}...`);
          
          // Simulation d'une purge (en réalité, il faudrait l'API Cloudflare)
          const response = await fetch(`/api/purge-cache?url=${encodeURIComponent(url)}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            addResult(`✅ ${url} purgé avec succès`);
          } else {
            addResult(`⚠️ ${url} - Erreur: ${response.status}`);
          }
        } catch (error) {
          addResult(`❌ ${url} - Erreur: ${error}`);
        }
        
        // Pause entre les requêtes
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      addResult('🎉 Purge terminée !');
      
    } catch (error) {
      addResult(`❌ Erreur générale: ${error}`);
    } finally {
      setPurging(false);
    }
  };

  const clearBrowserCache = () => {
    addResult('🧹 Nettoyage du cache du navigateur...');
    
    // Instructions pour l'utilisateur
    addResult('📋 Instructions:');
    addResult('1. Appuyez sur F12 pour ouvrir les outils de développement');
    addResult('2. Allez dans l\'onglet "Application" ou "Storage"');
    addResult('3. Cliquez sur "Clear storage" ou "Vider le stockage"');
    addResult('4. Cochez toutes les options et cliquez sur "Clear site data"');
    addResult('5. Rechargez la page avec Ctrl+F5');
    
    // Tentative de nettoyage automatique
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        addResult('✅ localStorage et sessionStorage vidés');
      }
    } catch (error) {
      addResult(`⚠️ Impossible de vider automatiquement: ${error}`);
    }
  };

  const forceRefresh = () => {
    addResult('🔄 Rechargement forcé...');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-500 text-white p-6 rounded-lg mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">🧹 PURGE DU CACHE CLOUDFLARE</h1>
          <p className="text-lg">Version: {new Date().toLocaleString()}</p>
          <p className="text-sm">Cache buster: {Date.now()}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={purgeCloudflareCache}
            disabled={purging}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-4 px-6 rounded-lg font-medium transition-colors"
          >
            {purging ? '🔄 Purge en cours...' : '☁️ Purger Cloudflare'}
          </button>
          
          <button
            onClick={clearBrowserCache}
            className="bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-lg font-medium transition-colors"
          >
            🧹 Vider le cache navigateur
          </button>
          
          <button
            onClick={forceRefresh}
            className="bg-purple-600 hover:bg-purple-700 text-white py-4 px-6 rounded-lg font-medium transition-colors"
          >
            🔄 Recharger la page
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📋 Instructions manuelles pour Cloudflare :</h2>
          <ol className="space-y-2 text-gray-700">
            <li>1. Connectez-vous à votre dashboard Cloudflare</li>
            <li>2. Sélectionnez le domaine "iahome.fr"</li>
            <li>3. Allez dans l'onglet "Caching" → "Configuration"</li>
            <li>4. Cliquez sur "Purge Everything" ou "Tout purger"</li>
            <li>5. Confirmez l'opération</li>
            <li>6. Attendez 1-2 minutes pour la propagation</li>
          </ol>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🔧 Techniques de contournement :</h2>
          <ul className="space-y-2 text-gray-700">
            <li>• <strong>Ctrl+F5</strong> : Rechargement forcé (ignore le cache)</li>
            <li>• <strong>Onglet privé</strong> : Pas de cache persistant</li>
            <li>• <strong>Paramètres URL</strong> : Ajoutez ?v=1234567890</li>
            <li>• <strong>Différents navigateurs</strong> : Chrome, Firefox, Edge</li>
            <li>• <strong>Réseau mobile</strong> : 4G au lieu du WiFi</li>
          </ul>
        </div>

        {results.length > 0 && (
          <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm">
            <h3 className="text-white font-bold mb-4">📊 Logs de purge :</h3>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {results.map((result, index) => (
                <div key={index}>{result}</div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center space-x-4">
          <a 
            href="/test-urls-direct" 
            className="bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            🧪 Tester les URLs
          </a>
          <a 
            href="/encours-simple" 
            className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            🔄 Page de test des modules
          </a>
        </div>
      </div>
    </div>
  );
}



