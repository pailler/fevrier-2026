'use client';

import { useState } from 'react';

export default function TestLibreSpeed() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testLibreSpeedAccess = async () => {
    setIsLoading(true);
    setResult('');

    try {
      // Simuler un accès depuis iahome.fr avec les bons headers
      const response = await fetch('/api/librespeed', {
        method: 'GET',
        headers: {
          'Referer': 'https://iahome.fr/encours',
          'Origin': 'https://iahome.fr',
        },
      });

      if (response.ok) {
        const content = await response.text();
        if (content.includes('LibreSpeed Speedtest')) {
          setResult('✅ SUCCÈS: LibreSpeed accessible !');
        } else {
          setResult('⚠️ Accès autorisé mais contenu inattendu');
        }
      } else if (response.status === 302) {
        const location = response.headers.get('location');
        setResult(`🔄 REDIRECTION: ${response.status} vers ${location}`);
      } else {
        setResult(`❌ ERREUR: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setResult(`❌ ERREUR: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Test LibreSpeed Authentication
          </h1>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Ce test simule un accès à LibreSpeed depuis iahome.fr avec les headers appropriés.
            </p>
            
            <button
              onClick={testLibreSpeedAccess}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Test en cours...' : 'Tester l\'accès LibreSpeed'}
            </button>
            
            {result && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Résultat :</h3>
                <p className="text-sm font-mono">{result}</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Instructions :</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Ce test simule un accès depuis iahome.fr</li>
              <li>• Il vérifie l'authentification et les permissions</li>
              <li>• Si autorisé, il devrait afficher LibreSpeed</li>
              <li>• Si non autorisé, il devrait rediriger vers /encours</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

