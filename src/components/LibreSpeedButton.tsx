'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../utils/supabaseClient';

interface LibreSpeedButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function LibreSpeedButton({ className = '', children }: LibreSpeedButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLibreSpeedAccess = async () => {
    setIsLoading(true);
    
    try {
      // Vérifier si l'utilisateur est connecté
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        // Rediriger vers la page de login
        router.push('/login?redirect=/librespeed');
        return;
      }

      // Générer un token d'accès
      const response = await fetch('/api/librespeed-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          userEmail: session.user.email
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          // Rediriger vers LibreSpeed avec le token
          window.location.href = `https://librespeed.iahome.fr/?token=${data.token}`;
        } else {
          console.error('Erreur génération token:', data.error);
          alert('Erreur: ' + data.error);
        }
      } else {
        const errorData = await response.json();
        console.error('Erreur API:', errorData);
        alert('Erreur: ' + (errorData.error || 'Impossible d\'accéder à LibreSpeed'));
      }
    } catch (error) {
      console.error('Erreur LibreSpeed:', error);
      alert('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLibreSpeedAccess}
      disabled={isLoading}
      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Chargement...
        </>
      ) : (
        children || 'Accéder à LibreSpeed'
      )}
    </button>
  );
}
