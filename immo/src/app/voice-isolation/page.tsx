'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function VoiceIsolationPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  useEffect(() => {
    const voiceIsolationUrl = process.env.NEXT_PUBLIC_VOICE_ISOLATION_URL || 'http://localhost:8100';
    
    // Rediriger directement après un court délai
    // Pas besoin de vérifier avec fetch car cela peut causer des problèmes CORS
    setStatus('redirecting');
    
    const redirectTimeout = setTimeout(() => {
      window.location.href = voiceIsolationUrl;
    }, 1500);
    
    return () => clearTimeout(redirectTimeout);
  }, []);
  
  if (status === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Service non accessible
          </h1>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
            <p className="font-semibold text-yellow-800 mb-2">Pour démarrer le service :</p>
            <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
              <li>Ouvrez PowerShell dans le dossier <code className="bg-yellow-100 px-1 rounded">voice-isolation-service</code></li>
              <li>Exécutez : <code className="bg-yellow-100 px-1 rounded">.\start.ps1</code></li>
              <li>Attendez que le service démarre (2-3 minutes)</li>
              <li>Rechargez cette page</li>
            </ol>
          </div>
          
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
        <p className="mt-4 text-lg font-semibold text-gray-700">
          {status === 'loading' 
            ? "Chargement de l'application d'isolation vocale..." 
            : "Redirection vers Gradio en cours..."}
        </p>
        <p className="mt-2 text-sm text-gray-500">
          {status === 'loading' 
            ? "Vérification du service..." 
            : "Ouverture de l'interface Gradio..."}
        </p>
      </div>
    </div>
  );
}
