'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import WorkingSignInForm from '../../components/WorkingSignInForm';

export default function DemoLoginPage() {
  const router = useRouter();
  const [selectedDemo, setSelectedDemo] = useState<string>('');

  const demoAccounts = [
    {
      email: 'demo@example.com',
      password: 'Password123!',
      name: 'Compte Démo Principal',
      description: 'Compte de démonstration principal'
    },
    {
      email: 'test-working@example.com',
      password: 'Password123!',
      name: 'Compte Test',
      description: 'Compte créé lors des tests'
    },
    {
      email: 'admin@example.com',
      password: 'Admin123!',
      name: 'Compte Admin',
      description: 'Compte administrateur (à créer)'
    }
  ];

  const handleDemoSelect = (email: string, password: string) => {
    setSelectedDemo(email);
    // Pré-remplir le formulaire (nécessiterait une modification du composant)
  };

  const handleAuthSuccess = (user: any) => {
    console.log('Connexion réussie:', user);
    router.push('/');
  };

  const handleAuthError = (error: any) => {
    console.error('Erreur de connexion:', error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">🔐</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Page de Démonstration - Connexion
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Utilisez les comptes de démonstration ci-dessous pour tester l'authentification
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Comptes de démonstration */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Comptes de Démonstration Disponibles
            </h3>
            
            <div className="space-y-4">
              {demoAccounts.map((account, index) => (
                <div 
                  key={index}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedDemo === account.email 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleDemoSelect(account.email, account.password)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{account.name}</h4>
                      <p className="text-sm text-gray-600">{account.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Email: <code className="bg-gray-100 px-1 rounded">{account.email}</code>
                      </p>
                      <p className="text-xs text-gray-500">
                        Mot de passe: <code className="bg-gray-100 px-1 rounded">{account.password}</code>
                      </p>
                    </div>
                    <div className="text-blue-600">
                      {selectedDemo === account.email ? '✓' : '→'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">💡 Instructions</h4>
              <ol className="text-sm text-yellow-700 space-y-1">
                <li>1. Cliquez sur un compte de démonstration ci-dessus</li>
                <li>2. Copiez l'email et le mot de passe</li>
                <li>3. Utilisez ces identifiants dans le formulaire de connexion</li>
                <li>4. Ou créez un nouveau compte avec le formulaire d'inscription</li>
              </ol>
            </div>
          </div>

          {/* Formulaire de connexion */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Formulaire de Connexion
            </h3>
            
            <WorkingSignInForm
              onSuccess={handleAuthSuccess}
              onError={handleAuthError}
            />

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Pas encore de compte ?{' '}
                <a href="/signup" className="text-green-600 hover:text-green-500 font-medium">
                  Créer un compte
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Page de démonstration - Système d'authentification fonctionnel
          </p>
        </div>
      </div>
    </div>
  );
}


