'use client';

import Link from 'next/link';

export default function LibreSpeedBlockedPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Titre principal */}
        <h1 className="text-4xl font-bold text-black mb-8">
          LibreSpeed Speedtest
        </h1>
        
        {/* Bloc d'erreur rouge */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Authentification requise
            </h2>
            <p className="text-red-600">
              Vous devez être connecté à IAHome.fr pour accéder à ce service.
            </p>
          </div>
        </div>
        
        {/* Bloc d'information bleu */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="text-center">
            <p className="text-blue-600 mb-2">
              Ce service est intégré à IAHome.fr et nécessite une authentification centralisée.
            </p>
            <p className="text-blue-600">
              Veuillez accéder au service via <Link href="https://www.iahome.fr" className="underline font-semibold">IAHome.fr</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
