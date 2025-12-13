'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCustomAuth } from '../hooks/useCustomAuth';
import TokenBalance from './TokenBalance';
import TokenBalanceLink from './TokenBalanceLink';

export default function SimpleHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, signOut } = useCustomAuth();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-blue-600 text-white shadow-sm" data-header-version="4.0.0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section unique - Navigation et utilisateur */}
        <div className="flex items-center justify-between h-16">
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
            
            {/* Bouton "Mes applis activées" avec tokens pour mobile - VERSION 4.0.0 */}
            {isAuthenticated && user && (
              <div className="flex md:hidden items-center space-x-3" data-button-version="4.0.0">
                <Link
                  href="/encours"
                  data-button-type="mes-applis-actives"
                  className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white font-bold px-4 py-2.5 rounded-lg text-lg hover:from-green-600 hover:via-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                  style={{
                    backgroundColor: 'rgb(34, 197, 94)',
                    backgroundImage: 'linear-gradient(to right, rgb(34, 197, 94), rgb(16, 185, 129), rgb(22, 163, 74))'
                  }}
                >
                  <span className="text-xl">📱</span>
                  <span>Mes applis activées</span>
                </Link>
                <TokenBalance className="text-yellow-300 font-bold text-xl" showIcon={true} />
              </div>
            )}

            {/* Navigation principale - TOUJOURS VISIBLE */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/marketing" 
                className={`font-medium transition-colors ${
                  pathname === '/marketing' || pathname?.startsWith('/marketing/')
                    ? 'text-yellow-300'
                    : 'text-white hover:text-blue-100'
                }`}
                style={pathname === '/marketing' || pathname?.startsWith('/marketing/') ? {
                  textDecoration: 'underline',
                  textDecorationColor: 'rgb(253 224 71)',
                  textDecorationThickness: '2px',
                  textUnderlineOffset: '4px'
                } : { textDecoration: 'none' }}
              >
                Découvrir
              </Link>
              <Link 
                href="/formation" 
                className={`font-medium transition-colors ${
                  pathname === '/formation' || pathname?.startsWith('/formation/')
                    ? 'text-yellow-300'
                    : 'text-white hover:text-blue-100'
                }`}
                style={pathname === '/formation' || pathname?.startsWith('/formation/') ? {
                  textDecoration: 'underline',
                  textDecorationColor: 'rgb(253 224 71)',
                  textDecorationThickness: '2px',
                  textUnderlineOffset: '4px'
                } : { textDecoration: 'none' }}
              >
                Formation
              </Link>
              <Link 
                href="/blog" 
                className={`font-medium transition-colors ${
                  pathname === '/blog' || pathname?.startsWith('/blog/')
                    ? 'text-yellow-300'
                    : 'text-white hover:text-blue-100'
                }`}
                style={pathname === '/blog' || pathname?.startsWith('/blog/') ? {
                  textDecoration: 'underline',
                  textDecorationColor: 'rgb(253 224 71)',
                  textDecorationThickness: '2px',
                  textUnderlineOffset: '4px'
                } : { textDecoration: 'none' }}
              >
                Blog
              </Link>
              <Link 
                href="/essentiels" 
                className={`font-medium transition-colors ${
                  pathname === '/essentiels' || pathname?.startsWith('/essentiels/')
                    ? 'text-yellow-300'
                    : 'text-white hover:text-blue-100'
                }`}
                style={pathname === '/essentiels' || pathname?.startsWith('/essentiels/') ? {
                  textDecoration: 'underline',
                  textDecorationColor: 'rgb(253 224 71)',
                  textDecorationThickness: '2px',
                  textUnderlineOffset: '4px'
                } : { textDecoration: 'none' }}
              >
                Essentiels
              </Link>
              <Link 
                href="/applications" 
                className={`font-medium transition-colors ${
                  pathname === '/applications' || pathname?.startsWith('/applications/')
                    ? 'text-yellow-300'
                    : 'text-white hover:text-blue-100'
                }`}
                style={pathname === '/applications' || pathname?.startsWith('/applications/') ? {
                  textDecoration: 'underline',
                  textDecorationColor: 'rgb(253 224 71)',
                  textDecorationThickness: '2px',
                  textUnderlineOffset: '4px'
                } : { textDecoration: 'none' }}
              >
                Applications IA
              </Link>
              <Link 
                href="/pricing" 
                className="flex items-center space-x-2 bg-purple-100 hover:bg-purple-200 px-4 py-2 rounded-full font-medium transition-colors group"
              >
                <svg 
                  className="w-4 h-4 text-indigo-600" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-indigo-600">Obtenir Plus</span>
              </Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                <TokenBalanceLink />
                <Link
                  href="/encours"
                  className="hidden md:flex bg-white text-blue-600 font-semibold px-3 py-1 rounded text-sm hover:bg-blue-50 transition-colors items-center space-x-1"
                >
                  <span>📱</span>
                  <span>Mes applis</span>
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    router.push('/');
                  }}
                  className="text-white hover:text-blue-100 transition-colors px-3 py-1 rounded-lg hover:bg-blue-500 cursor-pointer text-sm"
                >
                  Se déconnecter
                </button>
              </>
            ) : (
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
            )}
          </div>

          {/* Menu mobile */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Affichage du nom/prénom pour mobile */}
            {isAuthenticated && user && (
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  user.role === 'admin' ? 'bg-red-400' : 'bg-green-400'
                }`}></div>
                <div className="text-white text-sm font-medium truncate max-w-20">
                  {user.full_name || user.email}
                </div>
              </div>
            )}
            
            {/* Affichage des tokens pour mobile */}
            {isAuthenticated && user && (
              <TokenBalanceLink className="text-yellow-300 font-bold text-xl hover:text-yellow-200 transition-colors" showIcon={true} />
            )}
            
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
                  href="/formation"
                  className={`block px-4 py-2 transition-colors ${
                    pathname === '/formation' || pathname?.startsWith('/formation/')
                      ? 'text-yellow-300 underline decoration-yellow-300 decoration-2 underline-offset-2 bg-blue-600'
                      : 'text-white hover:bg-blue-500'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
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
                  onClick={() => setIsMobileMenuOpen(false)}
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
                  onClick={() => setIsMobileMenuOpen(false)}
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
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Applications IA
                </Link>
              </div>
              
              {/* Bouton Obtenir Plus - Section séparée pour plus de visibilité */}
              <div className="px-4 py-3 border-b border-blue-500">
                <div className="text-sm text-blue-100 mb-2">Premium</div>
                <Link
                  href="/pricing"
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white px-4 py-3 rounded-full font-semibold transition-all shadow-lg w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg 
                    className="w-5 h-5 text-yellow-300" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-white font-bold">Obtenir Plus</span>
                </Link>
              </div>

              {/* Bouton Chat IA - Centré */}
              <div className="px-4 py-3 border-b border-blue-500">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    // Déclencher l'ouverture du chat via un événement personnalisé
                    window.dispatchEvent(new CustomEvent('openChatAI'));
                  }}
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-full font-semibold transition-all shadow-lg w-full mx-auto"
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

              {/* Actions utilisateur */}
              {isAuthenticated && user && (
                <div className="px-4 py-2">
                  <div className="text-sm text-blue-100 mb-2">Mon compte</div>
                  
                  {/* Affichage du nom/prénom de l'utilisateur */}
                  <div className="px-4 py-2 bg-blue-500 rounded-lg mb-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${
                        user.role === 'admin' ? 'bg-red-400' : 'bg-green-400'
                      }`}></div>
                      <div className="text-xs text-blue-100">
                        {user.role === 'admin' ? 'Administrateur connecté :' : 'Connecté en tant que :'}
                      </div>
                    </div>
                    <div className="text-white font-medium">
                      {user.full_name || user.email}
                    </div>
                  </div>
                  
                  {/* Affichage des tokens */}
                  <div className="px-4 py-2 mb-2">
                    <TokenBalance className="text-white" />
                  </div>
                  
                  <button
                    onClick={() => {
                      signOut();
                      router.push('/');
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-white hover:bg-blue-500 transition-colors"
                  >
                    Se déconnecter
                  </button>
                </div>
              )}

              {!isAuthenticated && (
                <div className="px-4 py-2">
                  <div className="text-sm text-blue-100 mb-2">Connexion</div>
                  <Link
                    href="/login"
                    className="block px-4 py-2 text-white hover:bg-blue-500 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Se connecter
                  </Link>
                  <Link
                    href="/signup"
                    className="block px-4 py-2 text-white hover:bg-blue-500 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    S'inscrire
                  </Link>
                  <Link
                    href="/contact"
                    className="block px-4 py-2 text-white hover:bg-blue-500 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
