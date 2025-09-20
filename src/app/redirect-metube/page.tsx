'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function RedirectMeTube() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkTokenAndRedirect = async () => {
      const token = searchParams.get('token');
      
      console.log('🔍 MeTube Redirect: Token reçu:', token ? token.substring(0, 10) + '...' : 'aucun');
      
      // Si un token est fourni, vérifier s'il est valide
      if (token) {
        // Vérifier si c'est un token provisoire valide
        if (token.startsWith('prov_')) {
          const tokenParts = token.split('_');
          if (tokenParts.length === 3) {
            const timestamp = parseInt(tokenParts[2], 36);
            const now = Date.now();
            const tokenAge = now - timestamp;
            
            // Token provisoire valide pendant 1 heure
            if (tokenAge < 3600000) {
              console.log('✅ MeTube Redirect: Token provisoire valide - autoriser accès direct');
              // Rediriger vers MeTube directement
              window.location.href = 'https://metube.iahome.fr';
              return;
            }
          }
        }
        
        // Vérifier si c'est un token d'accès valide
        if (!token.startsWith('prov_')) {
          console.log('✅ MeTube Redirect: Token d\'accès détecté - autoriser accès direct');
          window.location.href = 'https://metube.iahome.fr';
          return;
        }
      }
      
      // Aucun token ou token invalide - rediriger vers la page de connexion
      console.log('❌ MeTube Redirect: Aucun token valide - redirection vers login');
      window.location.href = 'https://iahome.fr/login';
    };

    checkTokenAndRedirect();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Vérification de l'accès...</h2>
        <p className="text-gray-600">Vérification de votre autorisation d'accès à MeTube.</p>
      </div>
    </div>
  );
}
