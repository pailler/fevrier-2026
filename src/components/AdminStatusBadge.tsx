'use client';

import { useCustomAuth } from '../hooks/useCustomAuth';

interface AdminStatusBadgeProps {
  className?: string;
  showEmail?: boolean;
  variant?: 'header' | 'banner' | 'compact';
}

export default function AdminStatusBadge({ 
  className = '', 
  showEmail = true, 
  variant = 'header' 
}: AdminStatusBadgeProps) {
  const { user, isAuthenticated, loading } = useCustomAuth();

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-500">Chargement...</span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const isAdmin = user.role === 'admin';

  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className={`w-2 h-2 rounded-full animate-pulse ${
          isAdmin ? 'bg-red-400' : 'bg-green-400'
        }`}></div>
        <div className={`px-2 py-1 rounded-full text-xs font-bold ${
          isAdmin 
            ? 'bg-red-600 text-white' 
            : 'bg-green-500 text-white'
        }`}>
          {isAdmin ? '👑 ADMIN' : 'CONNECTÉ'}
        </div>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        {showEmail && (
          <span className="text-sm text-gray-600">
            {isAdmin ? 'Administrateur' : 'Connecté'}: {user.email}
          </span>
        )}
        <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${
          isAdmin 
            ? 'bg-red-600 text-white border-2 border-red-400' 
            : 'bg-green-100 text-green-700'
        }`}>
          {isAdmin ? '👑 ADMIN' : 'USER'}
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            isAdmin ? 'bg-red-400' : 'bg-green-400'
          }`}></div>
          <span className={`text-xs font-medium ${
            isAdmin ? 'text-red-600' : 'text-green-600'
          }`}>
            {isAdmin ? 'Admin en ligne' : 'En ligne'}
          </span>
        </div>
      </div>
    );
  }

  // Variant 'header' par défaut
  return (
    <div className={`flex items-center space-x-3 text-sm ${className}`}>
      <span className="hidden sm:inline">
        {isAdmin ? 'Administrateur IAHome' : 'Connecté à IAHome'}
      </span>
      {showEmail && (
        <span className="font-medium">{user.email}</span>
      )}
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full animate-pulse ${
          isAdmin ? 'bg-red-400' : 'bg-green-400'
        }`}></div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-md transition-colors ${
          isAdmin 
            ? 'bg-red-600 text-white border-2 border-red-400 hover:bg-red-700' 
            : 'bg-green-500 text-white hover:bg-green-600'
        }`}>
          {isAdmin ? '👑 ADMIN' : 'CONNECTÉ'}
        </div>
      </div>
    </div>
  );
}





