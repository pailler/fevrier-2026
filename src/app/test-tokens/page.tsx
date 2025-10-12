'use client';

import { useCustomAuth } from '../../hooks/useCustomAuth';
import TokenBalance from '../../components/TokenBalance';

export default function TestTokenDisplay() {
  const { user, isAuthenticated, loading } = useCustomAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test d'affichage des tokens</h1>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">État de l'authentification</h2>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <span className="font-medium">Authentifié:</span>
              <span className={`px-2 py-1 rounded text-sm ${isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isAuthenticated ? 'Oui' : 'Non'}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="font-medium">Utilisateur:</span>
              <span className="text-gray-700">
                {user ? `${user.full_name || user.email} (${user.id})` : 'Aucun'}
              </span>
            </div>
          </div>
        </div>

        {isAuthenticated && user && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Affichage des tokens</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Composant TokenBalance:</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <TokenBalance />
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Simulation de la bannière:</h3>
                <div className="bg-blue-600 text-white p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-xl font-bold">IAhome</span>
                      <span className="text-white">Navigation</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <TokenBalance />
                      <span className="bg-white text-blue-600 px-3 py-1 rounded text-sm">Mes applis</span>
                      <span className="text-white">{user.full_name || user.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isAuthenticated && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">Utilisateur non connecté</h2>
            <p className="text-yellow-700">
              Pour voir l'affichage des tokens, vous devez être connecté. 
              Le composant TokenBalance ne s'affiche que pour les utilisateurs authentifiés.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
