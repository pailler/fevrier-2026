'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function LibreSpeedRedirect() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      // Token présent - rediriger vers LibreSpeed
      window.location.href = 'http://192.168.1.150:8083';
    } else {
      // Aucun token - rediriger vers iahome.fr
      window.location.href = 'https://iahome.fr';
    }
  }, [token]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <p>Redirection en cours...</p>
      {token ? (
        <p>Accès autorisé à LibreSpeed</p>
      ) : (
        <p>Redirection vers iahome.fr</p>
      )}
    </div>
  );
}






