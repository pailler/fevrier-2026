'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCustomAuth } from '@/hooks/useCustomAuth';
import TokenBalance from '../TokenBalance';

interface AdminHeaderProps {
  user: {
    email: string;
    role: string;
    id: string;
  };
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { signOut } = useCustomAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className="bg-blue-600 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section supérieure - Informations de connexion */}
        <div className="flex items-center justify-between h-10">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
              <span className="hidden sm:inline">Administrateur IAHome</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-3">
                <span className="text-blue-100 text-sm">
                  Administrateur IAHome
                </span>
                <span className="text-blue-100 text-sm font-medium">
                  {user.email}
                </span>
                <div className="px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white">
                  👑 ADMIN
                </div>
              </div>
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

            {/* Bouton Mes applis avec tokens pour mobile UNIQUEMENT - entre le logo et le menu */}
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

            {/* Navigation admin */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/admin" 
                className="text-white hover:text-blue-100 font-medium transition-colors"
              >
                🛡️ Dashboard
              </Link>
              <Link 
                href="/admin/users" 
                className="text-white hover:text-blue-100 font-medium transition-colors"
              >
                Utilisateurs
              </Link>
              <Link 
                href="/admin/modules" 
                className="text-white hover:text-blue-100 font-medium transition-colors"
              >
                Modules
              </Link>
              <Link 
                href="/admin/statistics" 
                className="text-white hover:text-blue-100 font-medium transition-colors"
              >
                Statistiques
              </Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <TokenBalance className="text-base font-bold" />
            <Link
              href="/encours"
              className="bg-white text-blue-600 font-semibold px-3 py-1 rounded text-sm hover:bg-blue-50 transition-colors flex items-center space-x-1"
            >
              <span>📱</span>
              <span className="hidden sm:inline">Mes applis</span>
            </Link>
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">👑</span>
                </div>
                <div className="text-left">
                  <p className="font-medium text-white">{user.email}</p>
                  <p className="text-sm text-red-200 font-semibold">Administrateur</p>
                </div>
              </button>
              
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Se déconnecter
                  </button>
                </div>
              )}
            </div>
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
              {/* Navigation admin mobile */}
              <div className="px-4 py-2 border-b border-blue-500">
                <div className="text-sm text-blue-100 mb-2">Administration</div>
                <Link
                  href="/admin"
                  className="block px-4 py-2 text-white hover:bg-blue-500 transition-colors"
                >
                  🛡️ Dashboard
                </Link>
                <Link
                  href="/admin/users"
                  className="block px-4 py-2 text-white hover:bg-blue-500 transition-colors"
                >
                  Utilisateurs
                </Link>
                <Link
                  href="/admin/modules"
                  className="block px-4 py-2 text-white hover:bg-blue-500 transition-colors"
                >
                  Modules
                </Link>
                <Link
                  href="/admin/statistics"
                  className="block px-4 py-2 text-white hover:bg-blue-500 transition-colors"
                >
                  Statistiques
                </Link>
              </div>

              {/* Actions utilisateur mobile */}
              <div className="px-4 py-2 border-b border-blue-500">
                <div className="text-sm text-blue-100 mb-2">Compte</div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-white">{user.email}</span>
                  <TokenBalance className="text-base font-bold" />
                </div>
                <Link
                  href="/encours"
                  className="block px-4 py-2 text-white hover:bg-blue-500 transition-colors"
                >
                  Mes applis
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block px-4 py-2 text-white hover:bg-blue-500 transition-colors w-full text-left"
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

