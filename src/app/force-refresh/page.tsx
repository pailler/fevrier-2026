'use client';
import { useState, useEffect } from 'react';

export default function ForceRefreshPage() {
  const [refreshCount, setRefreshCount] = useState(0);
  const [timestamp, setTimestamp] = useState(new Date().toLocaleString());

  useEffect(() => {
    // Mettre à jour le timestamp toutes les secondes
    const interval = setInterval(() => {
      setTimestamp(new Date().toLocaleString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const forceRefresh = () => {
    setRefreshCount(prev => prev + 1);
    
    // Vider le cache du navigateur
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Recharger la page avec un cache buster
    const cacheBuster = Date.now();
    window.location.href = `/?v=${cacheBuster}&refresh=${refreshCount + 1}`;
  };

  const openInIncognito = () => {
    if (typeof window !== 'undefined') {
      window.open('/encours', '_blank');
    }
  };

  const clearLocalStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      alert('LocalStorage et SessionStorage vidés !');
    }
  };

  const testUrls = () => {
    if (typeof window !== 'undefined') {
      window.open('/test-urls', '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-4xl font-bold text-red-600 mb-6 text-center">
            🔄 Force Refresh - Contournement du Cache
          </h1>
          
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-8">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Problème de cache détecté !</strong> Cette page vous aide à contourner le cache Cloudflare et du navigateur.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-800 mb-4">📊 Informations</h2>
              <div className="space-y-2 text-sm">
                <div><strong>Timestamp:</strong> {timestamp}</div>
                <div><strong>Refresh Count:</strong> {refreshCount}</div>
                <div><strong>User Agent:</strong> {typeof window !== 'undefined' ? navigator.userAgent.substring(0, 50) + '...' : 'N/A'}</div>
                <div><strong>URL Actuelle:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</div>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-green-800 mb-4">🎯 Actions Rapides</h2>
              <div className="space-y-3">
                <button
                  onClick={forceRefresh}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  🔄 Force Refresh (Recommandé)
                </button>
                <button
                  onClick={openInIncognito}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  🕵️ Ouvrir en Navigation Privée
                </button>
                <button
                  onClick={testUrls}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  🧪 Tester les URLs
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">🛠️ Actions Avancées</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={clearLocalStorage}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                🗑️ Vider le Stockage Local
              </button>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/encours?v=' + Date.now();
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                📱 Aller à /encours avec Cache Buster
              </button>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-4">⚠️ Instructions Cloudflare</h2>
            <div className="space-y-3 text-sm text-red-700">
              <p><strong>Si le problème persiste :</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Connectez-vous à votre dashboard Cloudflare</li>
                <li>Allez dans "Caching" → "Configuration"</li>
                <li>Cliquez sur "Purge Everything"</li>
                <li>Ou purger spécifiquement les fichiers :</li>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li><code>iahome.fr/_next/static/*</code></li>
                  <li><code>iahome.fr/encours</code></li>
                  <li><code>iahome.fr/test-urls</code></li>
                </ul>
              </ol>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Cette page est conçue pour contourner tous les types de cache et forcer le chargement de la dernière version.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
