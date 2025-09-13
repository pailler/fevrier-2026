'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ConverterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Rediriger vers la page de transition pour activer le module
    router.push('/transition-converter');
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-blue-500 via-indigo-500 to-emerald-600 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/30">
            <svg className="w-12 h-12 text-white animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.9"/>
              <path d="M8 8 L16 8 L16 16 L8 16 Z" fill="white" opacity="0.9"/>
              <path d="M10 10 L14 10 L14 14 L10 14 Z" fill="currentColor"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Redirection vers HRConvert2...</h2>
          <p className="text-white/90">Vérification de votre accès en cours</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 via-pink-500 to-red-600 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/30">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Accès refusé</h2>
          <p className="text-white/90 mb-6">{error}</p>
          <button
            onClick={() => router.push('/essentiels')}
            className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl hover:bg-white/30 transition-all font-medium border border-white/30 shadow-lg"
          >
            Retour aux essentiels
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default function ConverterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-blue-500 via-indigo-500 to-emerald-600 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/30">
            <svg className="w-12 h-12 text-white animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.9"/>
              <path d="M8 8 L16 8 L16 16 L8 16 Z" fill="white" opacity="0.9"/>
              <path d="M10 10 L14 10 L14 14 L10 14 Z" fill="currentColor"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Chargement...</h2>
          <p className="text-white/90">Vérification de votre accès</p>
        </div>
      </div>
    }>
      <ConverterContent />
    </Suspense>
  );
}
