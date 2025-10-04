'use client';

import { useCustomAuth } from '../hooks/useCustomAuth';

export default function CustomTopBanner() {
  const { user, isAuthenticated, loading } = useCustomAuth();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white text-gray-800 py-2 px-8 flex items-center justify-between text-sm border-b border-gray-200">
      <div className="flex items-center space-x-4">
        <span className="font-semibold">IAhome</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-600">
          {loading ? 'Chargement...' : isAuthenticated && user ? `Connecté: ${user.email}` : 'Non connecté'}
        </span>
      </div>
      
      <div className="flex items-center space-x-4">
        {isAuthenticated && user && (
          <>
            <div className={`px-2 py-1 rounded-full text-xs font-bold ${
              user.role === 'admin' 
                ? 'bg-red-100 text-red-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {user.role === 'admin' ? 'ADMIN' : 'USER'}
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-600 font-medium">En ligne</span>
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




