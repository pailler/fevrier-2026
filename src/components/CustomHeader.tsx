'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCustomAuth } from '../hooks/useCustomAuth';
import TokenBalance from './TokenBalance';

export default function CustomHeader() {
  const router = useRouter();
  const { user, isAuthenticated, loading, signOut } = useCustomAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Debug: afficher l'état d'authentification
  console.log('🔍 CustomHeader - État:', { 
    isAuthenticated, 
    user: user?.email, 
    loading,
    hasUser: !!user 
  });

  // Forcer un re-rendu quand l'état d'authentification change
  useEffect(() => {
    console.log('🔄 CustomHeader - useEffect déclenché:', { 
      isAuthenticated, 
      user: user?.email, 
      loading 
    });
  }, [isAuthenticated, user, loading]);

  // Écouter les événements de connexion pour forcer la mise à jour
  useEffect(() => {
    const handleUserLoggedIn = () => {
      console.log('🔄 CustomHeader - Événement userLoggedIn reçu, rechargement...');
      // Forcer un rechargement de la page pour s'assurer que les données sont à jour
      window.location.reload();
    };

    window.addEventListener('userLoggedIn', handleUserLoggedIn);
    
    return () => {
      window.removeEventListener('userLoggedIn', handleUserLoggedIn);
    };
  }, []);

  // Fonction pour obtenir l'URL d'accès d'un module
  const getModuleAccessUrl = async (moduleName: string) => {
    try {
      const response = await fetch(`/api/modules/access/${moduleName}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.accessUrl;
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'URL d'accès pour ${moduleName}:`, error);
    }
    return null;
  };


  return (
    <>
      {/* Bannière unifiée */}
      <div className="bg-blue-600 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section supérieure - Informations de connexion */}
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center justify-between w-full">
              <div></div>
              <div className="flex items-center space-x-4 text-sm">
                {loading ? (
                  <span className="hidden sm:inline">Chargement...</span>
                ) : isAuthenticated && user ? (
                  /* Mode connecté */
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="hidden sm:inline">Connecté à IAHome</span>
                    <span className="font-medium">{user.email}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        user.role === 'admin' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-green-500 text-white'
                      }`}>
                        {user.role === 'admin' ? 'ADMIN' : 'CONNECTÉ'}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Mode non connecté */
                  <div className="flex items-center space-x-3">
                    <span className="hidden sm:inline">Bienvenue sur IAhome</span>
                    <div className="flex items-center space-x-3">
                      <Link 
                        href="/login" 
                        className="text-blue-100 hover:text-white transition-colors text-sm"
                      >
                        Se connecter
                      </Link>
                      <Link 
                        href="/signup" 
                        className="bg-white text-blue-600 font-semibold px-3 py-1 rounded text-sm hover:bg-blue-50 transition-colors"
                      >
                        Commencer
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section principale - Navigation et utilisateur */}
          <div className="flex items-center justify-between h-16 border-t border-blue-500">
                   <div className="flex items-center space-x-6">
                     <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                       <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                         <span className="text-blue-600 font-bold text-lg">I</span>
                       </div>
                       <span className="text-xl font-bold text-white">IAhome</span>
                     </Link>

                     {/* Navigation statique */}
                     <nav className="hidden md:flex items-center space-x-6">
                       <Link 
                         href="/formation" 
                         className="text-white hover:text-blue-100 font-medium transition-colors"
                       >
                         Formation
                       </Link>
                       <Link 
                         href="/blog" 
                         className="text-white hover:text-blue-100 font-medium transition-colors"
                       >
                         Blog
                       </Link>
                       <Link 
                         href="/essentiels" 
                         className="text-white hover:text-blue-100 font-medium transition-colors"
                       >
                         Essentiels
                       </Link>
                       <Link 
                         href="/applications" 
                         className="text-white hover:text-blue-100 font-medium transition-colors"
                       >
                         Applications IA
                       </Link>
                     </nav>
                   </div>

                   <div className="hidden md:flex items-center space-x-4">
                     {isAuthenticated && user && (
                       <>
                         <TokenBalance userId={user.id} />
                         <Link
                           href="/encours"
                           className="bg-white text-blue-600 font-semibold px-3 py-1 rounded text-sm hover:bg-blue-50 transition-colors flex items-center space-x-1"
                         >
                           <span>📱</span>
                           <span className="hidden sm:inline">Mes applis</span>
                         </Link>
                         <div className="flex items-center space-x-3">
                           <span className="text-white font-medium px-3 py-1 rounded-lg hover:bg-blue-500 transition-colors">
                             {user.full_name || user.email}
                           </span>
                           <button
                             onClick={() => {
                               console.log('🔄 Déconnexion directe...');
                               signOut();
                               router.push('/');
                             }}
                             className="text-white hover:text-blue-100 transition-colors font-medium px-3 py-1 rounded-lg hover:bg-blue-500 cursor-pointer"
                           >
                             Se déconnecter
                           </button>
                         </div>
                       </>
                     )}
              
              {!isAuthenticated && (
                <>
                  <Link 
                    href="/contact" 
                    className="text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors"
                  >
                    Contact
                  </Link>
                </>
              )}
            </div>

            {/* Menu mobile */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:text-blue-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>

                 {/* Menu mobile déroulant */}
                 {isMobileMenuOpen && (
                   <div className="md:hidden border-t border-blue-500 py-4">
                     <div className="space-y-2">
                       {/* Navigation principale */}
                       <div className="px-4 py-2 border-b border-blue-500">
                         <div className="text-sm text-blue-100 mb-2">Navigation</div>
                         <Link
                           href="/formation"
                           className="block px-4 py-2 text-white hover:bg-blue-500 transition-colors"
                         >
                           Formation
                         </Link>
                         <Link
                           href="/blog"
                           className="block px-4 py-2 text-white hover:bg-blue-500 transition-colors"
                         >
                           Blog
                         </Link>
                         <Link
                           href="/essentiels"
                           className="block px-4 py-2 text-white hover:bg-blue-500 transition-colors"
                         >
                           Essentiels
                         </Link>
                         <Link
                           href="/applications"
                           className="block px-4 py-2 text-white hover:bg-blue-500 transition-colors"
                         >
                           Applications IA
                         </Link>
                       </div>

                       {/* Section utilisateur */}
                       {isAuthenticated && user ? (
                         <>
                           <div className="px-4 py-2 text-sm text-blue-100">
                             Connecté en tant que: {user.email}
                           </div>
                           <Link
                             href="/encours"
                             className="block px-4 py-2 text-white hover:bg-blue-500 transition-colors flex items-center space-x-2"
                           >
                             <span>📱</span>
                             <span>Mes applis</span>
                           </Link>
                           <button
                             onClick={() => {
                               console.log('🔄 Déconnexion mobile...');
                               signOut();
                               router.push('/');
                             }}
                             className="block w-full text-left px-4 py-2 text-white hover:bg-blue-500 transition-colors font-medium cursor-pointer"
                           >
                             Se déconnecter
                           </button>
                         </>
                       ) : (
                         <>
                           <Link
                             href="/login"
                             className="block px-4 py-2 text-white hover:bg-blue-500 transition-colors"
                           >
                             Se connecter
                           </Link>
                           <Link
                             href="/signup"
                             className="block px-4 py-2 text-white hover:bg-blue-500 transition-colors"
                           >
                             S'inscrire
                           </Link>
                         </>
                       )}
                     </div>
                   </div>
                 )}
        </div>
      </div>
    </>
  );
}
