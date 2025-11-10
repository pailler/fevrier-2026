'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCustomAuth } from '../hooks/useCustomAuth';
import TokenBalance from './TokenBalance';
import TokenBalanceLink from './TokenBalanceLink';

export default function SimpleHeader() {
  const router = useRouter();
  const { user, isAuthenticated, signOut } = useCustomAuth();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-blue-600 text-white shadow-sm">
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
            
            {/* Bouton Mes applis avec tokens pour mobile UNIQUEMENT - à droite du logo */}
            {isAuthenticated && user && (
              <div className="flex md:hidden items-center space-x-3">
                <Link
                  href="/encours"
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold px-4 py-2.5 rounded-lg text-lg hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2"
                >
                  <span className="text-xl">📱</span>
                  <span>Mes applis</span>
                </Link>
                <TokenBalance className="text-yellow-300 font-bold text-xl" showIcon={true} />
              </div>
            )}

            {/* Navigation principale - TOUJOURS VISIBLE */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/marketing" 
                className="text-white hover:text-blue-100 font-medium transition-colors"
              >
                Découvrir
              </Link>
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
                href="/pricing" 
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Offres
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
                  className="text-white hover:text-blue-100 transition-colors font-medium px-3 py-1 rounded-lg hover:bg-blue-500 cursor-pointer"
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
                  href="/formation"
                  className="block px-4 py-2 text-white hover:bg-blue-500 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Formation
                </Link>
                <Link
                  href="/blog"
                  className="block px-4 py-2 text-white hover:bg-blue-500 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Blog
                </Link>
                <Link
                  href="/essentiels"
                  className="block px-4 py-2 text-white hover:bg-blue-500 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Essentiels
                </Link>
                <Link
                  href="/applications"
                  className="block px-4 py-2 text-white hover:bg-blue-500 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Applications IA
                </Link>
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
