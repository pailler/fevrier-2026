'use client';

import { useCustomAuth } from '../../hooks/useCustomAuth';
import CustomHeader from '../../components/CustomHeader';
import CustomTopBanner from '../../components/CustomTopBanner';
import UserDataDisplay from '../../components/UserDataDisplay';

export default function TestAuthDisplayPage() {
  const { user, isAuthenticated, loading, token } = useCustomAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomTopBanner />
      
      <div className="pt-20">
        <CustomHeader />
        
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              🧪 Test d'Affichage de l'Authentification
            </h1>
            
            <div className="space-y-6">
              {/* État de l'authentification */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  État de l'Authentification
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Chargement:</span>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        loading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {loading ? 'En cours...' : 'Terminé'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Authentifié:</span>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isAuthenticated ? 'Oui' : 'Non'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Token présent:</span>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        token ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {token ? 'Oui' : 'Non'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Utilisateur:</span>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        user ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user ? 'Présent' : 'Absent'}
                      </span>
                    </div>
                    
                    {user && (
                      <>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Email:</span>
                          <span className="text-sm text-gray-600">{user.email}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Nom:</span>
                          <span className="text-sm text-gray-600">{user.full_name}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Rôle:</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            user.role === 'admin' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Informations détaillées */}
              {user && (
                <UserDataDisplay 
                  user={user} 
                  showDetails={true}
                />
              )}

              {/* Token JWT */}
              {token && (
                <div className="bg-green-50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Token JWT
                  </h2>
                  
                  <div className="bg-white p-4 rounded border">
                    <code className="text-sm text-gray-700 break-all">
                      {token}
                    </code>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-yellow-900 mb-4">
                  💡 Instructions de Test
                </h2>
                
                <div className="space-y-3 text-yellow-800">
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-sm font-medium">1</span>
                    <p>Connectez-vous avec un compte existant (demo@example.com / Password123!)</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-sm font-medium">2</span>
                    <p>Vérifiez que les informations utilisateur s'affichent correctement</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-sm font-medium">3</span>
                    <p>Vérifiez que la bannière bleue affiche l'email de l'utilisateur</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-sm font-medium">4</span>
                    <p>Rechargez la page pour vérifier que l'état persiste</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-4">
                <a 
                  href="/demo-login" 
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Se connecter
                </a>
                <a 
                  href="/demo-signup" 
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  S'inscrire
                </a>
                <a 
                  href="/" 
                  className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Retour à l'accueil
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


