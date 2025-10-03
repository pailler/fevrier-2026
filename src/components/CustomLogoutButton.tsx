'use client';

import { useRouter } from 'next/navigation';
import { useCustomAuth } from '../hooks/useCustomAuth';

interface CustomLogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function CustomLogoutButton({ 
  className = "", 
  children = "Se déconnecter" 
}: CustomLogoutButtonProps) {
  const router = useRouter();
  const { signOut, isAuthenticated, user } = useCustomAuth();

  const handleLogout = async () => {
    try {
      console.log('🔄 Tentative de déconnexion...');
      console.log('État avant déconnexion:', { isAuthenticated, user: user?.email });
      
      signOut();
      
      console.log('✅ Déconnexion réussie');
      router.push('/');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
    }
  };

  // Debug: afficher l'état d'authentification
  console.log('🔍 CustomLogoutButton - État:', { isAuthenticated, user: user?.email });

  return (
    <button
      onClick={handleLogout}
      className={`font-medium px-3 py-1 rounded-lg transition-colors cursor-pointer ${className}`}
      style={{ 
        backgroundColor: 'transparent',
        border: 'none',
        outline: 'none'
      }}
    >
      {children}
    </button>
  );
}
