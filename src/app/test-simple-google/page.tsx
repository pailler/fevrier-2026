'use client';

import SimpleGoogleTest from '../../components/SimpleGoogleTest';

export default function TestSimpleGooglePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Test Google OAuth Simple
        </h1>
        
        <SimpleGoogleTest />
        
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Instructions :
          </h3>
          <ol className="list-decimal list-inside text-blue-700 space-y-1">
            <li>Cliquez sur "Tester Google OAuth"</li>
            <li>Ouvrez la console du navigateur (F12)</li>
            <li>Vérifiez les messages de debug</li>
            <li>Notez toute erreur affichée</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
