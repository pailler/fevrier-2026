'use client';

import Link from 'next/link';
import { useCustomAuth } from '../hooks/useCustomAuth';

export default function CustomTopBanner() {
  const { user, isAuthenticated, loading } = useCustomAuth();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white text-gray-800 py-2 px-8 flex items-center justify-between text-sm border-b border-gray-200">
      <div className="flex items-center space-x-4">
        <span className="font-semibold">IAhome</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-600">
          {loading ? 'Chargement...' : isAuthenticated && user ? 
            `${user.role === 'admin' ? 'Administrateur' : 'Connecté'}: ${user.email}` : 'Non connecté'}
        </span>
      </div>
      
      <div className="flex items-center space-x-4">
        {isAuthenticated && user && (
          <>
            <Link
              href="/account"
              className={`px-3 py-1 rounded-full text-xs font-bold shadow-md transition-all hover:scale-105 cursor-pointer ${
                user.role === 'admin' 
                  ? 'bg-red-600 text-white border-2 border-red-400 hover:bg-red-700' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
              title="Voir mes informations"
            >
              {user.role === 'admin' ? '👑 ADMIN' : 'USER'}
            </Link>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                user.role === 'admin' ? 'bg-red-400' : 'bg-green-400'
              }`}></div>
              <span className={`font-medium ${
                user.role === 'admin' ? 'text-red-600' : 'text-green-600'
              }`}>
                {user.role === 'admin' ? 'Admin en ligne' : 'En ligne'}
              </span>
            </div>
          </>
        )}
        
        {!isAuthenticated && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span className="text-gray-500">Hors ligne</span>
          </div>
        )}
      </div>
    </div>
  );
}

