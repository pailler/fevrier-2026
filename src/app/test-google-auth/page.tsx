'use client';

import { useState } from 'react';
import GoogleSignInButton from '../../components/GoogleSignInButton';
import GoogleSignInDebug from '../../components/GoogleSignInDebug';
import SimpleGoogleTest from '../../components/SimpleGoogleTest';

export default function TestGoogleAuth() {
  const [activeTest, setActiveTest] = useState<'button' | 'debug' | 'simple'>('button');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Test de Connexion Google
          </h1>
          <p className="text-gray-600">
            Testez différents composants de connexion Google pour diagnostiquer les problèmes
          </p>
        </div>

        {/* Navigation des tests */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <button
              onClick={() => setActiveTest('button')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTest === 'button'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Bouton Standard
            </button>
            <button
              onClick={() => setActiveTest('debug')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTest === 'debug'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Debug Avancé
            </button>
            <button
              onClick={() => setActiveTest('simple')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTest === 'simple'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Test Simple
            </button>
          </div>
        </div>

        {/* Contenu des tests */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {activeTest === 'button' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Test avec le bouton standard
              </h2>
              <p className="text-gray-600 mb-6">
                Utilise le composant GoogleSignInButton standard utilisé dans l'application.
              </p>
              <div className="max-w-md mx-auto">
                <GoogleSignInButton
                  onSuccess={(user) => {
                    console.log('✅ Connexion réussie:', user);
                    alert('Connexion réussie !');
                  }}
                  onError={(error) => {
                    console.error('❌ Erreur de connexion:', error);
                    alert('Erreur de connexion: ' + error.message);
                  }}
                />
              </div>
            </div>
          )}

          {activeTest === 'debug' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Test avec debug avancé
              </h2>
              <p className="text-gray-600 mb-6">
                Affiche des informations de debug détaillées pour diagnostiquer les problèmes.
              </p>
              <GoogleSignInDebug />
            </div>
          )}

          {activeTest === 'simple' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Test simple
              </h2>
              <p className="text-gray-600 mb-6">
                Teste la configuration Supabase et la connexion Google avec des logs détaillés.
              </p>
              <SimpleGoogleTest />
            </div>
          )}
        </div>

        {/* Informations de debug */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Informations de Debug
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>URL actuelle:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
            <p><strong>Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
            <p><strong>URL de callback:</strong> {typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : 'N/A'}</p>
            <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'}</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">
            Instructions de Test
          </h3>
          <div className="space-y-2 text-sm text-yellow-800">
            <p>1. Cliquez sur "Se connecter avec Google" dans l'un des tests ci-dessus</p>
            <p>2. Autorisez l'application dans la popup Google</p>
            <p>3. Vous devriez être redirigé vers <code>/auth/callback</code></p>
            <p>4. Puis redirigé vers la page d'accueil</p>
            <p>5. Vérifiez la console du navigateur pour les logs de debug</p>
          </div>
        </div>
      </div>
    </div>
  );
}
