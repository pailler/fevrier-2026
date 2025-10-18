'use client';
import { useState } from 'react';

export default function TestUrlsPage() {
  const [testResults, setTestResults] = useState<any[]>([]);

  const testUrls = [
    { id: 'metube', expected: 'https://metube.iahome.fr' },
    { id: 'pdf', expected: 'https://pdf.iahome.fr' },
    { id: 'librespeed', expected: 'https://librespeed.iahome.fr' },
    { id: 'psitransfer', expected: 'https://psitransfer.iahome.fr' },
  ];

  const getModuleUrl = (moduleId: string): string => {
    const moduleUrls: { [key: string]: string } = {
      'metube': 'https://metube.iahome.fr',  // MeTube doit aller vers MeTube
      'librespeed': 'https://librespeed.iahome.fr',
      'pdf': 'https://pdf.iahome.fr',  // PDF doit aller vers PDF
      'psitransfer': 'https://psitransfer.iahome.fr',
      'qrcodes': 'https://qrcodes.iahome.fr',
      'stablediffusion': 'https://stablediffusion.iahome.fr',
      'ruinedfooocus': 'https://ruinedfooocus.iahome.fr',
      'comfyui': 'https://comfyui.iahome.fr',
      'cogstudio': 'https://cogstudio.iahome.fr',
    };
    
    const url = moduleUrls[moduleId] || '';
    console.log(`🔗 getModuleUrl: ${moduleId} -> ${url}`);
    return url;
  };

  const runTests = () => {
    const results = testUrls.map(test => {
      const actual = getModuleUrl(test.id);
      const isCorrect = actual === test.expected;
      
      return {
        id: test.id,
        expected: test.expected,
        actual,
        isCorrect,
        timestamp: new Date().toLocaleTimeString()
      };
    });
    
    setTestResults(results);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🧪 Test des URLs des Modules</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Configuration Actuelle</h2>
          <div className="space-y-2 text-sm font-mono">
            <div>metube → https://metube.iahome.fr</div>
            <div>pdf → https://pdf.iahome.fr</div>
            <div>librespeed → https://librespeed.iahome.fr</div>
            <div>psitransfer → https://psitransfer.iahome.fr</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <button
            onClick={runTests}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            🚀 Lancer les Tests
          </button>
        </div>

        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Résultats des Tests</h2>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    result.isCorrect 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-lg">
                      {result.isCorrect ? '✅' : '❌'} {result.id}
                    </span>
                    <span className="text-sm text-gray-500">{result.timestamp}</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div><strong>Attendu:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{result.expected}</code></div>
                    <div><strong>Obtenu:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{result.actual}</code></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Instructions de Test</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
            <li>Cliquez sur "Lancer les Tests" pour vérifier les URLs</li>
            <li>Vérifiez que tous les tests passent (✅)</li>
            <li>Si un test échoue (❌), il y a un problème dans la configuration</li>
            <li>Ouvrez la console (F12) pour voir les logs détaillés</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

