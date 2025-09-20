'use client';

import { useState } from 'react';

export default function TestUrlsDirectPage() {
  const [testResults, setTestResults] = useState<{ [key: string]: string }>({});

  // URLs de test directes (sans cache)
  const testUrls = {
    'MeTube': 'https://metube.iahome.fr',
    'PDF': 'https://pdf.iahome.fr', 
    'LibreSpeed': 'https://librespeed.iahome.fr',
    'PsiTransfer': 'https://psitransfer.iahome.fr',
    'QR Codes': 'https://qrcodes.iahome.fr',
    'Converter': 'https://convert.iahome.fr'
  };

  const testUrl = async (name: string, url: string) => {
    try {
      console.log(`🧪 Test de ${name}: ${url}`);
      setTestResults(prev => ({ ...prev, [name]: 'Testing...' }));
      
      const response = await fetch(url, { 
        method: 'HEAD',
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (response.ok) {
        setTestResults(prev => ({ ...prev, [name]: `✅ OK (${response.status})` }));
        console.log(`✅ ${name} accessible: ${response.status}`);
      } else {
        setTestResults(prev => ({ ...prev, [name]: `❌ Error (${response.status})` }));
        console.log(`❌ ${name} erreur: ${response.status}`);
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, [name]: `❌ Failed: ${error}` }));
      console.error(`❌ ${name} échec:`, error);
    }
  };

  const openUrl = (url: string) => {
    // Ouvrir avec cache busting
    const cacheBuster = `?cb=${Date.now()}&r=${Math.random()}`;
    window.open(`${url}${cacheBuster}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-500 text-white p-6 rounded-lg mb-8 text-center">
          <h1 className="text-2xl font-bold mb-2">🚨 TEST DIRECT DES URLs - SANS CACHE</h1>
          <p className="text-lg">Version: {new Date().toLocaleString()}</p>
          <p className="text-sm">Cache buster: {Date.now()}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(testUrls).map(([name, url]) => (
            <div key={name} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">{name}</h3>
              <p className="text-gray-600 mb-4 font-mono text-sm break-all">{url}</p>
              
              <div className="space-y-3">
                <button
                  onClick={() => testUrl(name, url)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  🧪 Tester la connectivité
                </button>
                
                <button
                  onClick={() => openUrl(url)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  🌐 Ouvrir dans un nouvel onglet
                </button>
                
                {testResults[name] && (
                  <div className={`p-3 rounded-lg text-center font-medium ${
                    testResults[name].includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {testResults[name]}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-yellow-100 border-l-4 border-yellow-500 p-4">
          <h3 className="font-bold text-yellow-800 mb-2">Instructions pour contourner le cache :</h3>
          <ul className="text-yellow-700 space-y-1 text-sm">
            <li>1. Utilisez Ctrl+F5 pour forcer le rechargement</li>
            <li>2. Ouvrez un onglet privé/incognito</li>
            <li>3. Videz le cache du navigateur (F12 → Application → Storage → Clear)</li>
            <li>4. Purgez le cache Cloudflare dans le dashboard</li>
            <li>5. Testez avec différents navigateurs</li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <a 
            href="/encours-simple" 
            className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
          >
            🔄 Retour à la page de test des modules
          </a>
        </div>
      </div>
    </div>
  );
}



