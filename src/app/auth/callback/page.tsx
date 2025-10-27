'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Laissez Supabase gérer automatiquement le callback OAuth
    // Il va détecter les paramètres dans l'URL et établir la session
    
    // Attendre un peu pour que Supabase traite le callback
    const timer = setTimeout(() => {
      router.push('/');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Connexion en cours...</h1>
        <p className="text-gray-600">Veuillez patienter pendant que nous finalisons votre connexion.</p>
      </div>
    </div>
  );
}
