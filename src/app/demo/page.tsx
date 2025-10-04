'use client';

import Link from 'next/link';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-6">
            <span className="text-white font-bold text-2xl">🚀</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            Démonstration du Système d'Authentification
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez notre système d'authentification personnalisé qui fonctionne parfaitement, 
            sans dépendre de Supabase Auth pour éviter les erreurs "Database error granting user".
          </p>
        </div>

        {/* Fonctionnalités principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-green-600 text-xl">✅</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Inscription Sécurisée</h3>
            <p className="text-gray-600 mb-4">
              Créez un compte avec validation côté serveur, hachage bcrypt et protection contre les doublons.
            </p>
            <Link 
              href="/signup" 
              className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
            >
              Tester l'inscription →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-blue-600 text-xl">🔐</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Connexion Rapide</h3>
            <p className="text-gray-600 mb-4">
              Connectez-vous avec vos identifiants ou utilisez les comptes de démonstration pré-configurés.
            </p>
            <Link 
              href="/login" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              Tester la connexion →
            </Link>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-purple-600 text-xl">🎫</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Tokens JWT</h3>
            <p className="text-gray-600 mb-4">
              Authentification basée sur des tokens JWT sécurisés pour une session persistante.
            </p>
            <span className="text-purple-600 font-medium">Système fonctionnel ✓</span>
          </div>
        </div>

        {/* Comptes de démonstration */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Comptes de Démonstration Disponibles
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Compte Démo Principal</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> <code className="bg-gray-100 px-1 rounded">demo@example.com</code></p>
                <p><strong>Mot de passe:</strong> <code className="bg-gray-100 px-1 rounded">Password123!</code></p>
                <p className="text-gray-600">Compte de démonstration principal</p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Compte Test</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> <code className="bg-gray-100 px-1 rounded">test-working@example.com</code></p>
                <p><strong>Mot de passe:</strong> <code className="bg-gray-100 px-1 rounded">Password123!</code></p>
                <p className="text-gray-600">Compte créé lors des tests</p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Nouveau Compte</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">Créez votre propre compte avec le formulaire d'inscription</p>
                <Link 
                  href="/signup" 
                  className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
                >
                  Créer un compte →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Tests API */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Tests API Disponibles
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Test d'Inscription</h3>
              <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                <p>POST /api/auth/signup-alternative</p>
                <p className="text-gray-600 mt-1">
                  {`{"email": "test@example.com", "password": "Password123!", "fullName": "Test User"}`}
                </p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Test de Connexion</h3>
              <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                <p>POST /api/auth/signin-alternative</p>
                <p className="text-gray-600 mt-1">
                  {`{"email": "demo@example.com", "password": "Password123!"}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statut du système */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-lg border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Statut du Système
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600 text-xl">✅</span>
              </div>
              <h3 className="font-semibold text-gray-900">Application</h3>
              <p className="text-sm text-gray-600">localhost:3000</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600 text-xl">✅</span>
              </div>
              <h3 className="font-semibold text-gray-900">Base de données</h3>
              <p className="text-sm text-gray-600">Table profiles</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600 text-xl">✅</span>
              </div>
              <h3 className="font-semibold text-gray-900">API Routes</h3>
              <p className="text-sm text-gray-600">Fonctionnelles</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-green-600 text-xl">✅</span>
              </div>
              <h3 className="font-semibold text-gray-900">Authentification</h3>
              <p className="text-sm text-gray-600">100% Opérationnelle</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="text-center mt-12">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/login"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Tester la Connexion
            </Link>
            <Link 
              href="/signup"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Tester l'Inscription
            </Link>
            <Link 
              href="/"
              className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Retour à l'Accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}




