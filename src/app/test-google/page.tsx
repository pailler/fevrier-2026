'use client';

import GoogleSignInDebug from '../../components/GoogleSignInDebug';

export default function TestGooglePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Test Google OAuth
        </h1>
        
        <GoogleSignInDebug />
        
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Instructions de test :
          </h3>
          <ol className="list-decimal list-inside text-yellow-700 space-y-1">
            <li>Cliquez sur "Tester Google OAuth"</li>
            <li>Vérifiez les messages de debug dans la console</li>
            <li>Vérifiez si une redirection se produit</li>
            <li>Notez toute erreur affichée</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
