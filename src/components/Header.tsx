'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCustomAuth } from '../hooks/useCustomAuth';
import DynamicNavigation from './DynamicNavigation';
import { useTokenContext } from '../contexts/TokenContext';
import { NotificationServiceClient } from '../utils/notificationServiceClient';
import { useIframeDetection } from '../utils/useIframeDetection';

// Version du Header - Incrémenter pour forcer le rechargement
const HEADER_VERSION = '4.0.0';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, loading, signOut } = useCustomAuth();
  const { tokens, isLoading: tokensLoading } = useTokenContext();
  const [role, setRole] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isInIframe = useIframeDetection();

  // Pages où le Header ne doit pas être affiché
  const PAGES_WITHOUT_HEADER = ['/code-learning', '/administration', '/ai-detector'];
  
  // Vérifier si le Header doit être masqué
  const shouldHideHeader = pathname && PAGES_WITHOUT_HEADER.some(page => 
    pathname === page || pathname.startsWith(`${page}/`)
  );

  // Masquer le Header sur les pages spécifiées
  if (shouldHideHeader) {
    return null;
  }

  // Fonction mémorisée pour fermer le menu
  const closeMobileMenu = useCallback((e?: React.MouseEvent) => {
    // Ne pas empêcher le comportement par défaut si c'est un lien
    if (e) {
      const target = e.target as HTMLElement;
      const linkElement = target.closest('a');
      if (!linkElement) {
        // Seulement empêcher le comportement par défaut si ce n'est pas un lien
        e.preventDefault();
        e.stopPropagation();
      }
    }
    setIsMobileMenuOpen(false);
  }, []);

  // Fonction mémorisée pour toggle le menu
  const toggleMobileMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  // Protection contre les erreurs de référence
  if (typeof window === 'undefined') {
    return null;
  }

  // Vérifier le rôle de l'utilisateur
  useEffect(() => {
    // Vérifier si l'utilisateur est l'admin (formateur_tic@hotmail.com)
    if (user?.email === 'formateur_tic@hotmail.com') {
      setRole('admin');
    } else if (user?.role) {
      setRole(user.role);
    } else {
      setRole('user');
    }
  }, [user]);

  // Appliquer les styles de soulignement uniquement au menu actif
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const applyStyles = () => {
      try {
        const nav = document.getElementById('main-nav');
        if (!nav) return;

        const links = nav.querySelectorAll('a[data-nav-path]');
        
        // Logs désactivés pour améliorer les performances
        
        links.forEach((link) => {
          try {
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
          } catch (error) {
            // Ignorer silencieusement les erreurs de style
          }
        });
      } catch (error) {
        // Ignorer silencieusement les erreurs
      }
    };

    // Appliquer immédiatement
    applyStyles();
    
    // Réappliquer une seule fois après un court délai pour s'assurer que le DOM est prêt
    const timeout = setTimeout(applyStyles, 50); // Réduit de 100ms à 50ms
    
    return () => {
      clearTimeout(timeout);
    };
  }, [pathname]);

  // Fermer le menu mobile quand on clique en dehors
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    if (!isMobileMenuOpen) {
      document.body.style.overflow = '';
      return;
    }

    // Empêcher le scroll du body quand le menu est ouvert
    document.body.style.overflow = 'hidden';

    let isHandling = false;
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // Éviter les appels multiples simultanés
      if (isHandling) return;
      
      try {
        const target = event.target as HTMLElement;
        if (!target) return;
        
        // Si le clic est sur un lien dans le menu mobile, ne rien faire - laisser le lien fonctionner
        const linkElement = target.closest('a');
        const menuElement = document.getElementById('mobile-menu');
        if (linkElement && menuElement && menuElement.contains(linkElement)) {
          // C'est un lien dans le menu mobile - laisser le lien fonctionner normalement
          // Le menu sera fermé par le onClick du lien lui-même
          return;
        }
        
        // Si le clic est sur un autre lien, fermer le menu et laisser le lien fonctionner
        if (linkElement) {
          setIsMobileMenuOpen(false);
          return;
        }
        
        // Vérifier si le clic est sur le bouton menu ou dans le menu
        const menuButton = target.closest('#mobile-menu-button');
        const menuContainer = target.closest('.mobile-menu-container');
        
        // Ne fermer que si on clique vraiment en dehors
        if (!menuContainer && !menuButton && !menuElement?.contains(target)) {
          isHandling = true;
          setTimeout(() => {
            setIsMobileMenuOpen(false);
            isHandling = false;
          }, 50);
        }
      } catch (error) {
        // Ignorer silencieusement pour éviter les boucles
      }
    };

    // Utiliser un délai court pour éviter les conflits avec le clic sur le bouton
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside, { passive: true, capture: false });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Fermer le menu quand on change de page
  useEffect(() => {
    setIsMobileMenuOpen(false);
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
    <header 
      className="bg-blue-600 text-white shadow-sm relative w-full" 
      data-header-version={HEADER_VERSION}
      suppressHydrationWarning
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full overflow-x-hidden">
        {/* Section supérieure - Informations de connexion */}
        <div className="flex items-center justify-between h-10 border-b border-blue-500/30">
          <div className="flex items-center space-x-4 text-sm">
            {isAuthenticated && user ? (
              <>
                <span className="text-blue-100">
                  {user.role === 'admin' ? '👑 Administrateur' : '👤 Connecté'} : {user?.full_name || user?.email?.split('@')[0] || 'Utilisateur'}
                </span>
                {role && (
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    role === 'admin' 
                      ? 'bg-red-500/20 text-red-100 border border-red-400/50' 
                      : 'bg-green-500/20 text-green-100 border border-green-400/50'
                  }`}>
                    {role === 'admin' ? 'ADMIN' : 'UTILISATEUR'}
                  </span>
                )}
              </>
            ) : (
              <span className="text-blue-100">Bienvenue sur IAhome</span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <button
                onClick={async (e) => {
                  try {
                    e.preventDefault();
                    e.stopPropagation();
                    await signOut();
                    router.push('/login');
                  } catch (error) {
                    console.error('Erreur lors de la déconnexion:', error);
                  }
                }}
                className="text-blue-100 hover:text-white text-sm font-medium transition-colors"
              >
                Se déconnecter
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  href="/login" 
                  className="text-blue-100 hover:text-white text-sm font-medium transition-colors"
                >
                  Se connecter
                </Link>
                <span className="text-blue-500">|</span>
                <Link 
                  href="/signup" 
                  className="text-blue-100 hover:text-white text-sm font-medium transition-colors"
                >
                  S'inscrire
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Section principale - Navigation et utilisateur */}
        <div className="flex items-center justify-between h-16 w-full relative">
          <div className="flex items-center space-x-2 md:space-x-6 flex-1 min-w-0 overflow-hidden">
            <Link 
              href="/" 
              className="flex items-center space-x-2 hover:opacity-90 transition-opacity flex-shrink-0 cursor-pointer relative z-20" 
              aria-label="Accueil IAhome"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
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
              <span className="text-lg sm:text-xl font-bold text-white">IAhome</span>
            </Link>
            
            {/* Bouton "Mes applis activées" avec tokens - Desktop et Mobile - VERSION 4.0.0 */}
            {isAuthenticated && user && (
              <div className="flex items-center space-x-1 md:space-x-3 flex-shrink-0 relative z-0 mr-3 md:mr-0" data-button-version="4.0.0">
                <Link
                  href="/encours" 
                  data-active={pathname === '/encours' || pathname?.startsWith('/encours/') ? 'true' : 'false'}
                  data-button-type="mes-applis-actives"
                  className="group relative bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white font-bold px-2.5 py-2 md:px-5 md:py-3 rounded-lg md:rounded-2xl text-sm md:text-base hover:from-green-600 hover:via-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 flex items-center space-x-1 md:space-x-3 border-2 border-white/20 hover:border-white/40 animate-pulse-subtle"
                  title="Cliquez pour accéder à vos applications activées"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  style={{ 
                    WebkitTapHighlightColor: 'transparent',
                    WebkitTouchCallout: 'none',
                    userSelect: 'none',
                    backgroundColor: 'rgb(34, 197, 94)',
                    backgroundImage: 'linear-gradient(to right, rgb(34, 197, 94), rgb(16, 185, 129), rgb(22, 163, 74))',
                    display: 'flex',
                    position: 'relative',
                    zIndex: 0,
                    maxWidth: 'fit-content'
                  }}
                >
                  {/* Effet de brillance animé */}
                  <div className="absolute inset-0 rounded-lg md:rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
                  
                  <span className="text-base md:text-xl relative z-10">📱</span>
                  <span className="relative z-10 text-sm md:text-base font-semibold">Mes applis activées</span>
                  <svg className="w-3 h-3 md:w-5 md:h-5 relative z-10 group-hover:translate-x-1 transition-transform hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
            
            {/* Boutons Applis essentielles et Applis IA - Toujours visibles */}
            <div className="flex items-center space-x-1 md:space-x-3 flex-shrink-0 relative z-30 mr-3 md:mr-0">
              <Link 
                href="/essentiels" 
                data-nav-path="/essentiels"
                className="font-medium text-white hover:text-blue-100 transition-colors px-2 py-1 md:px-3 md:py-2 rounded-lg border-2 border-yellow-300/50 md:border-yellow-300/30 relative text-xs md:text-base"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                style={{ zIndex: 30, position: 'relative' }}
              >
                ⭐ <span className="hidden sm:inline">Applis essentielles</span><span className="sm:hidden">Essentielles</span>
              </Link>
              <Link 
                href="/applications" 
                data-nav-path="/applications"
                className="font-medium text-white hover:text-blue-100 transition-colors px-2 py-1 md:px-3 md:py-2 rounded-lg border-2 border-yellow-300/50 md:border-yellow-300/30 relative text-xs md:text-base"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                style={{ zIndex: 30, position: 'relative' }}
              >
                ⭐ <span className="hidden sm:inline">Applis IA</span><span className="sm:hidden">IA</span>
              </Link>
            </div>

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
              {/* Affichage des tokens après Blog */}
              {isAuthenticated && user && !tokensLoading && (
                <div className="flex items-center space-x-1 px-2 py-1 rounded-md bg-white/10 border border-white/20">
                  <span className="text-sm">🪙</span>
                  <span className="text-sm font-bold">{tokens !== null ? tokens : 0}</span>
                </div>
              )}
              <Link 
                href="/pricing2" 
                className="flex items-center space-x-1 bg-purple-100 hover:bg-purple-200 text-purple-800 px-2 py-1.5 rounded-full font-semibold transition-all shadow-sm hover:shadow-md text-sm"
              >
                <svg 
                  className="w-3 h-3 text-purple-700" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-purple-800 font-bold">Obtenir +</span>
              </Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && (
              <>
                {/* Le bouton "Mes applis activées" est maintenant près du logo, on garde juste les tokens ici si besoin */}
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
          <div className="md:hidden flex-shrink-0 ml-2">
            <button 
              type="button"
              onClick={toggleMobileMenu}
              className="text-white hover:text-blue-100 transition-colors p-2 z-50 relative"
              aria-expanded={isMobileMenuOpen}
              aria-label="Menu mobile"
              id="mobile-menu-button"
              style={{ zIndex: 50, position: 'relative' }}
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {isMobileMenuOpen && (
          <div 
            id="mobile-menu"
            className="md:hidden border-t border-blue-500 py-4 mobile-menu-container bg-blue-600 max-h-[calc(100vh-4rem)] overflow-y-auto w-full z-40 relative"
            style={{
              width: '100%',
              maxWidth: '100vw',
              boxSizing: 'border-box',
              margin: 0,
              padding: 0,
              position: 'relative',
              left: 0,
              right: 0
            }}
            onClick={(e) => {
              // Ne pas bloquer les clics sur les liens
              const target = e.target as HTMLElement;
              if (target.tagName === 'A' || target.closest('a')) {
                // Laisser les liens fonctionner normalement - ne rien faire
                return;
              }
              // Empêcher la propagation seulement pour les autres éléments
              e.stopPropagation();
            }}
          >
            <div className="space-y-2 w-full">
              {/* Navigation principale */}
              <div className="px-2 sm:px-4 py-2 border-b border-blue-500 w-full">
                <div className="text-sm text-blue-100 mb-2">Navigation</div>
                <Link
                  href="/marketing"
                  className={`block px-4 py-2 transition-colors ${
                    pathname === '/marketing' || pathname?.startsWith('/marketing/')
                      ? 'text-yellow-300 underline decoration-yellow-300 decoration-2 underline-offset-2 bg-blue-600'
                      : 'text-white hover:bg-blue-500'
                  }`}
                  onClick={(e) => {
                    // Fermer le menu après un court délai pour permettre la navigation
                    setTimeout(() => {
                      setIsMobileMenuOpen(false);
                    }, 100);
                  }}
                >
                  Découvrir
                </Link>
                <Link
                  href="/formation"
                  className={`block px-4 py-2 transition-colors ${
                    pathname === '/formation' || pathname?.startsWith('/formation/')
                      ? 'text-yellow-300 underline decoration-yellow-300 decoration-2 underline-offset-2 bg-blue-600'
                      : 'text-white hover:bg-blue-500'
                  }`}
                  onClick={(e) => {
                    // Fermer le menu après un court délai pour permettre la navigation
                    setTimeout(() => {
                      setIsMobileMenuOpen(false);
                    }, 100);
                  }}
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
                  onClick={(e) => {
                    // Fermer le menu après un court délai pour permettre la navigation
                    setTimeout(() => {
                      setIsMobileMenuOpen(false);
                    }, 100);
                  }}
                >
                  Blog
                </Link>
                {/* Affichage des tokens après Blog (mobile menu) */}
                {isAuthenticated && user && !tokensLoading && (
                  <div className="px-4 py-2 flex items-center space-x-2 text-white">
                    <span className="text-base">🪙</span>
                    <span className="text-base font-bold">{tokens !== null ? tokens : 0}</span>
                  </div>
                )}
                {/* Boutons Applis essentielles et Applis IA - Toujours visibles (mobile menu) */}
                <Link
                  href="/essentiels"
                  className={`relative block px-4 py-3 transition-all duration-300 rounded-lg font-semibold border-2 ${
                    pathname === '/essentiels' || pathname?.startsWith('/essentiels/')
                      ? 'border-yellow-400 bg-yellow-400/10 text-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.5)]'
                      : 'border-yellow-500/40 bg-yellow-500/5 text-white hover:border-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300 hover:shadow-[0_0_10px_rgba(250,204,21,0.3)]'
                  }`}
                  onClick={(e) => {
                    // Fermer le menu après un court délai pour permettre la navigation
                    setTimeout(() => {
                      setIsMobileMenuOpen(false);
                    }, 100);
                  }}
                >
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></span>
                  <span className="relative z-10">⭐ Applis essentielles</span>
                </Link>
                <Link
                  href="/applications"
                  className={`relative block px-4 py-3 transition-all duration-300 rounded-lg font-semibold border-2 ${
                    pathname === '/applications' || pathname?.startsWith('/applications/')
                      ? 'border-cyan-400 bg-cyan-400/10 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.5)]'
                      : 'border-cyan-500/40 bg-cyan-500/5 text-white hover:border-cyan-400 hover:bg-cyan-400/10 hover:text-cyan-300 hover:shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                  }`}
                  onClick={(e) => {
                    // Fermer le menu après un court délai pour permettre la navigation
                    setTimeout(() => {
                      setIsMobileMenuOpen(false);
                    }, 100);
                  }}
                >
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></span>
                  <span className="relative z-10">⭐ Applis IA</span>
                </Link>
              </div>

              {/* Bouton Chat IA - Mobile */}
              <div className="px-2 sm:px-4 py-3 border-b border-blue-500 w-full">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeMobileMenu();
                    // Déclencher l'ouverture du chat via un événement personnalisé
                    if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
                      try {
                        window.dispatchEvent(new CustomEvent('openChatAI'));
                      } catch (error) {
                        console.error('Erreur lors de l\'ouverture du chat:', error);
                      }
                    }
                  }}
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-3 sm:px-4 py-2.5 sm:py-3 rounded-full font-semibold transition-all shadow-lg w-full"
                >
                  <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-white font-bold">Chat IA</span>
                  <span className="text-white font-semibold text-sm sm:text-base">conversation</span>
                </button>
              </div>

              {/* Bouton Obtenir Plus - Mobile */}
              <div className="px-2 sm:px-4 py-3 border-b border-blue-500 w-full">
                <Link
                  href="/pricing2"
                  className="flex items-center justify-center space-x-1 bg-purple-100 hover:bg-purple-200 text-purple-800 px-3 py-2 rounded-full font-semibold transition-all shadow-sm hover:shadow-md w-full text-sm"
                  onClick={closeMobileMenu}
                >
                  <svg 
                    className="w-4 h-4 text-purple-700" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-purple-800 font-bold">Obtenir +</span>
                </Link>
              </div>

              {/* Actions utilisateur */}
              {isAuthenticated && (
                <>
                  <div className="px-2 sm:px-4 py-2 border-b border-blue-500 w-full">
                    <div className="text-sm text-blue-100 mb-2">Compte</div>
                    <div className="py-2">
                      <span className="text-white text-sm font-medium">{user?.full_name || user?.email?.split('@')[0] || 'Utilisateur'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={async (e) => {
                        try {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsMobileMenuOpen(false);
                          await signOut();
                          router.push('/login');
                        } catch (error) {
                          console.error('Erreur lors de la déconnexion:', error);
                          // Fermer le menu même en cas d'erreur
                          setIsMobileMenuOpen(false);
                        }
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
      
      <style jsx>{`
        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 1;
            box-shadow: 0 10px 25px rgba(34, 197, 94, 0.3);
          }
          50% {
            opacity: 0.95;
            box-shadow: 0 10px 30px rgba(34, 197, 94, 0.5);
          }
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </header>
  );
} 