'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCustomAuth } from '../hooks/useCustomAuth';
import DynamicNavigation from './DynamicNavigation';
import TokenBalance from './TokenBalance';
import { NotificationServiceClient } from '../utils/notificationServiceClient';
import { useIframeDetection } from '../utils/useIframeDetection';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
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

  // Appliquer les styles de soulignement uniquement au menu actif
  useEffect(() => {
    const applyStyles = () => {
      const nav = document.getElementById('main-nav');
      if (!nav) return;

      const links = nav.querySelectorAll('a[data-nav-path]');
      
      // Logs de debug uniquement en développement
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 [Menu] Pathname: ${pathname}, Liens trouvés: ${links.length}`);
      }
      
      links.forEach((link) => {
        const navPath = link.getAttribute('data-nav-path');
        const isActive = navPath && (pathname === navPath || pathname?.startsWith(navPath + '/'));
        
        const element = link as HTMLElement;
        
        // FORCER la suppression de tous les styles de soulignement d'abord
        element.style.setProperty('text-decoration', 'none', 'important');
        element.style.setProperty('text-decoration-color', 'transparent', 'important');
        element.style.setProperty('text-decoration-thickness', '0', 'important');
        element.style.setProperty('text-underline-offset', '0', 'important');
        
        // Puis appliquer le soulignement SEULEMENT si actif
        if (isActive) {
          element.style.setProperty('text-decoration', 'underline', 'important');
          element.style.setProperty('text-decoration-color', 'rgb(253, 224, 71)', 'important');
          element.style.setProperty('text-decoration-thickness', '2px', 'important');
          element.style.setProperty('text-underline-offset', '4px', 'important');
        }
      });
    };

    // Appliquer immédiatement
    applyStyles();
    
    // Réappliquer après plusieurs délais pour s'assurer que le DOM est prêt
    const timeout1 = setTimeout(applyStyles, 50);
    const timeout2 = setTimeout(applyStyles, 200);
    const timeout3 = setTimeout(applyStyles, 500);
    const timeout4 = setTimeout(applyStyles, 1000);
    
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      clearTimeout(timeout4);
    };
  }, [pathname]);


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
                  <button
                    onClick={async () => { 
                      try {
                        const notificationService = NotificationServiceClient.getInstance();
                        await notificationService.notifyUserLogout(user?.email || '', user?.email?.split('@')[0] || 'Utilisateur');
                      } catch (notificationError) {
                        console.error('❌ Erreur lors de l\'envoi de la notification de déconnexion:', notificationError);
                      }
                      signOut();
                      router.push('/login'); 
                    }}
                    className="text-white hover:text-blue-100 transition-colors px-3 py-1 rounded-lg hover:bg-blue-500 cursor-pointer text-sm"
                  >
                    Se déconnecter
                  </button>
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
              <div className="flex md:hidden items-center space-x-3">
                <Link
                  href="/encours" data-active={pathname === '/encours' || pathname?.startsWith('/encours/') ? 'true' : 'false'}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold px-4 py-2.5 rounded-lg text-lg hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                >
                  <span className="text-xl">📱</span>
                  <span>Mes applis</span>
                </Link>
                <TokenBalance className="text-yellow-300 font-bold text-xl" showIcon={true} />
              </div>
            )}

            {/* Navigation statique */}
            <nav className="hidden md:flex items-center space-x-6" id="main-nav">
              <Link 
                href="/marketing" 
                data-nav-path="/marketing"
                className={`font-medium transition-colors ${
                  pathname === '/marketing' || pathname?.startsWith('/marketing/')
                    ? 'text-yellow-300'
                    : 'text-white hover:text-blue-100'
                }`}
              >
                Découvrir
              </Link>
              <Link 
                href="/formation" 
                data-nav-path="/formation"
                className={`font-medium transition-colors ${
                  pathname === '/formation' || pathname?.startsWith('/formation/')
                    ? 'text-yellow-300'
                    : 'text-white hover:text-blue-100'
                }`}
              >
                Formation
              </Link>
              <Link 
                href="/blog" 
                data-nav-path="/blog"
                className={`font-medium transition-colors ${
                  pathname === '/blog' || pathname?.startsWith('/blog/')
                    ? 'text-yellow-300'
                    : 'text-white hover:text-blue-100'
                }`}
              >
                Blog
              </Link>
              <Link 
                href="/essentiels" 
                data-nav-path="/essentiels"
                className={`font-medium transition-colors ${
                  pathname === '/essentiels' || pathname?.startsWith('/essentiels/')
                    ? 'text-yellow-300'
                    : 'text-white hover:text-blue-100'
                }`}
              >
                Essentiels
              </Link>
              <Link 
                href="/applications" 
                data-nav-path="/applications"
                className={`font-medium transition-colors ${
                  pathname === '/applications' || pathname?.startsWith('/applications/')
                    ? 'text-yellow-300'
                    : 'text-white hover:text-blue-100'
                }`}
              >
                Applications IA
              </Link>
              <Link 
                href="/services" 
                data-nav-path="/services"
                className={`font-medium transition-colors ${
                  pathname === '/services' || pathname?.startsWith('/services/')
                    ? 'text-yellow-300'
                    : 'text-white hover:text-blue-100'
                }`}
              >
                Services
              </Link>
              <Link 
                href="/pricing" 
                className="flex items-center space-x-2 bg-purple-100 hover:bg-purple-200 text-purple-800 px-4 py-2 rounded-full font-semibold transition-all shadow-sm hover:shadow-md"
              >
                <svg 
                  className="w-5 h-5 text-purple-700" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-purple-800 font-bold">Obtenir Plus</span>
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
                  href="/encours" data-active={pathname === '/encours' || pathname?.startsWith('/encours/') ? 'true' : 'false'}
                  className="hidden md:flex bg-white text-blue-600 font-semibold px-3 py-1 rounded text-sm hover:bg-blue-50 transition-colors items-center space-x-1"
                >
                  <span>📱</span>
                  <span>Mes applis</span>
                </Link>
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
                href="/marketing"
                className={`block px-4 py-2 transition-colors ${
                  pathname === '/marketing' || pathname?.startsWith('/marketing/')
                    ? 'text-yellow-300 underline decoration-yellow-300 decoration-2 underline-offset-2 bg-blue-600'
                    : 'text-white hover:bg-blue-500'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Découvrir
              </Link>
              <Link
                href="/services"
                className={`block px-4 py-2 transition-colors ${
                  pathname === '/services' || pathname?.startsWith('/services/')
                    ? 'text-yellow-300 underline decoration-yellow-300 decoration-2 underline-offset-2 bg-blue-600'
                    : 'text-white hover:bg-blue-500'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                href="/formation"
                className={`block px-4 py-2 transition-colors ${
                  pathname === '/formation' || pathname?.startsWith('/formation/')
                    ? 'text-yellow-300 underline decoration-yellow-300 decoration-2 underline-offset-2 bg-blue-600'
                    : 'text-white hover:bg-blue-500'
                }`}
              >
                Formation
                </Link>
                <Link
                  href="/blog"
                  className={`block px-4 py-2 transition-colors ${
                    pathname === '/blog' || pathname?.startsWith('/blog/')
                      ? 'text-yellow-300 underline decoration-yellow-300 decoration-2 underline-offset-2 bg-blue-600'
                      : 'text-white hover:bg-blue-500'
                  }`}
                >
                  Blog
                </Link>
                <Link
                  href="/essentiels"
                  className={`block px-4 py-2 transition-colors ${
                    pathname === '/essentiels' || pathname?.startsWith('/essentiels/')
                      ? 'text-yellow-300 underline decoration-yellow-300 decoration-2 underline-offset-2 bg-blue-600'
                      : 'text-white hover:bg-blue-500'
                  }`}
                >
                  Essentiels
                </Link>
                <Link
                  href="/applications"
                  className={`block px-4 py-2 transition-colors ${
                    pathname === '/applications' || pathname?.startsWith('/applications/')
                      ? 'text-yellow-300 underline decoration-yellow-300 decoration-2 underline-offset-2 bg-blue-600'
                      : 'text-white hover:bg-blue-500'
                  }`}
                >
                  Applications IA
                </Link>
              </div>

              {/* Bouton Obtenir Plus - Mobile */}
              <div className="px-4 py-3 border-b border-blue-500">
                <Link
                  href="/pricing"
                  className="flex items-center justify-center space-x-2 bg-purple-100 hover:bg-purple-200 text-purple-800 px-4 py-3 rounded-full font-semibold transition-all shadow-sm hover:shadow-md w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg 
                    className="w-5 h-5 text-purple-700" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-purple-800 font-bold">Obtenir Plus</span>
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
                      className="block px-4 py-2 text-white hover:text-blue-100 hover:bg-blue-500 rounded-lg transition-colors w-full text-left text-sm"
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