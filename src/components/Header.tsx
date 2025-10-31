'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCustomAuth } from '../hooks/useCustomAuth';
import DynamicNavigation from './DynamicNavigation';
import TokenBalance from './TokenBalance';
import { NotificationServiceClient } from '../utils/notificationServiceClient';
import { useIframeDetection } from '../utils/useIframeDetection';

export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated, loading, signOut } = useCustomAuth();
  const [role, setRole] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isInIframe = useIframeDetection();

  // Vérifier le rôle de l'utilisateur
  useEffect(() => {
    if (user?.role) {
      setRole(user.role);
    } else {
      setRole('user');
    }
  }, [user]);

  // Fonction pour obtenir l'URL d'accès d'un module
  const getModuleAccessUrl = async (moduleName: string) => {
    // Mapping des modules vers leurs pages d'accès sécurisées
    const secureModuleUrls: { [key: string]: string } = {

    };
    
    // Vérifier si l'utilisateur est connecté
    if (!user?.id) {
      router.push('/login');
      return null;
    }
    
    // Rediriger vers la page d'accès sécurisé appropriée
    const secureUrl = secureModuleUrls[moduleName];
    if (secureUrl) {
      router.push(secureUrl);
      return null;
    }
    
    // Fallback pour les modules non configurés
    return `/secure-module-access?module=${moduleName.toLowerCase()}`;
  };

  return (
    <header className="bg-blue-600 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section supérieure - Informations de connexion */}
        <div className="flex items-center justify-between h-10">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
              <span className="hidden sm:inline">Bienvenue sur IAhome</span>
            </div>
            <div className="flex items-center space-x-3">
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-200 border-t-white rounded-full animate-spin"></div>
                  <span className="text-blue-100 text-sm">Chargement...</span>
                </div>
              ) : !isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <button 
                    className="text-blue-100 hover:text-white transition-colors text-sm"
                    onClick={() => router.push('/login')}
                  >
                    Se connecter
                  </button>
                  <button 
                    className="bg-white text-blue-600 font-semibold px-3 py-1 rounded text-sm hover:bg-blue-50 transition-colors"
                    onClick={() => router.push('/signup')}
                  >
                    Commencer
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <span className="text-blue-100 text-sm">
                    {role === 'admin' ? 'Administrateur IAHome' : 'Connecté à IAHome'}
                  </span>
                  <span className="text-blue-100 text-sm font-medium">
                    {user?.email}
                  </span>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    role === 'admin' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-green-500 text-white'
                  }`}>
                    {role === 'admin' ? '👑 ADMIN' : 'CONNECTÉ'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section principale - Navigation et utilisateur */}
        <div className="flex items-center justify-between h-16 border-t border-blue-500">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity" aria-label="Accueil IAhome">
              <div className="relative h-8 w-auto md:h-9 lg:h-10">
                <Image
                  src="/iahome-logo.svg"
                  alt="IAhome"
                  width={40}
                  height={40}
                  priority
                  className="h-8 md:h-9 lg:h-10 w-auto"
                />
              </div>
              <span className="text-xl font-bold text-white hidden sm:inline">IAhome</span>
            </Link>
            
            {/* Bouton Mes applis avec tokens pour mobile UNIQUEMENT - entre le logo et le menu */}
            {isAuthenticated && user && (
              <div className="flex md:hidden items-center space-x-2">
                <Link
                  href="/encours"
                  className="bg-white text-blue-600 font-semibold px-2 py-1.5 rounded text-xs hover:bg-blue-50 transition-colors flex items-center space-x-1"
                >
                  <span>📱</span>
                  <span>Mes applis</span>
                </Link>
                <TokenBalance className="text-yellow-400 font-bold text-xs" showIcon={true} />
              </div>
            )}

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
              <Link 
                href="/services" 
                className="text-white hover:text-blue-100 font-medium transition-colors"
              >
                Services
              </Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && (
              <>
                <TokenBalance
                  className="text-blue-100 hover:text-white transition-colors"
                />
                <Link
                  href="/encours"
                  className="hidden md:flex bg-white text-blue-600 font-semibold px-3 py-1 rounded text-sm hover:bg-blue-50 transition-colors items-center space-x-1"
                >
                  <span>📱</span>
                  <span>Mes applis</span>
                </Link>
                <span className="text-white font-medium px-3 py-1 rounded-lg">
                  {user?.email}
                </span>
                <button
                  onClick={async () => { 
                    // Envoyer une notification de déconnexion avant de se déconnecter
                    try {
                      console.log('🔍 DEBUG: Email:', user?.email);
                      
                      const notificationService = NotificationServiceClient.getInstance();
                      
                      const result = await notificationService.notifyUserLogout(user?.email || '', user?.email?.split('@')[0] || 'Utilisateur');
                      console.log('🔍 DEBUG: Résultat notification:', result);
                      
                      if (result) {
                        console.log('✅ Notification de déconnexion envoyée');
                      } else {
                        console.log('❌ Échec envoi notification de déconnexion');
                      }
                    } catch (notificationError) {
                      console.error('❌ Erreur lors de l\'envoi de la notification de déconnexion:', notificationError);
                    }
                    
                    // Utiliser la fonction signOut de useCustomAuth
                    signOut();
                    router.push('/login'); 
                  }}
                  className="text-white hover:text-blue-100 transition-colors font-medium px-3 py-1 rounded-lg hover:bg-blue-500 cursor-pointer"
                >
                  Se déconnecter
                </button>
              </>
            )}
            
            {!isAuthenticated && (
              <Link 
                href="/contact" 
                className="text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors"
              >
                Contact
              </Link>
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
                href="/services"
                className="block px-4 py-2 text-white hover:bg-blue-500 transition-colors"
              >
                Services
              </Link>
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

              {/* Actions utilisateur */}
              {isAuthenticated && (
                <>
                  <div className="px-4 py-2 border-b border-blue-500">
                    <div className="text-sm text-blue-100 mb-2">Compte</div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-white">{user?.email}</span>
                <TokenBalance
                  className="text-blue-100 hover:text-white transition-colors"
                />
                    </div>
                    <button
                      onClick={async () => { 
                        await signOut(); 
                        router.push('/login'); 
                      }}
                      className="block px-4 py-2 text-white hover:bg-blue-500 transition-colors w-full text-left"
                    >
                      Se déconnecter
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 