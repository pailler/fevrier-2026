'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import WorkingSignUpForm from '../../components/WorkingSignUpForm';

export default function DemoSignUpPage() {
  const router = useRouter();
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleAuthSuccess = (user: any) => {
    console.log('Inscription réussie:', user);
    setSuccessMessage(`Compte créé avec succès pour ${user.email} ! Redirection vers la page de confirmation...`);
    setTimeout(() => {
      const userData = encodeURIComponent(JSON.stringify(user));
      router.push(`/signup-success?user=${userData}`);
    }, 2000);
  };

  const handleAuthError = (error: any) => {
    console.error('Erreur lors de l\'inscription:', error);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">📝</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Page de Démonstration - Inscription
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Créez un nouveau compte pour tester le système d'inscription
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informations sur l'inscription */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Comment ça marche ?
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Remplissez le formulaire</h4>
                  <p className="text-sm text-gray-600">Entrez vos informations personnelles et choisissez un mot de passe sécurisé</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Validation automatique</h4>
                  <p className="text-sm text-gray-600">Le système vérifie que l'email n'existe pas déjà et valide le mot de passe</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Création du compte</h4>
                  <p className="text-sm text-gray-600">Votre compte est créé avec un mot de passe haché de manière sécurisée</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">4</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Redirection vers la connexion</h4>
                  <p className="text-sm text-gray-600">Vous serez redirigé vers la page de connexion pour vous connecter immédiatement</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">🔒 Sécurité</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Mot de passe haché avec bcrypt</li>
                <li>• Validation côté serveur</li>
                <li>• Protection contre les doublons</li>
                <li>• Tokens JWT sécurisés</li>
              </ul>
            </div>

            {successMessage && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">{successMessage}</p>
              </div>
            )}
          </div>

          {/* Formulaire d'inscription */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Créer un Nouveau Compte
            </h3>
            
            <WorkingSignUpForm
              onSuccess={handleAuthSuccess}
              onError={handleAuthError}
            />

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Vous avez déjà un compte ?{' '}
                <a href="/demo-login" className="text-blue-600 hover:text-blue-500 font-medium">
                  Se connecter
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Page de démonstration - Système d'inscription fonctionnel
          </p>
        </div>
      </div>
    </div>
  );
}

