'use client';

import dynamic from 'next/dynamic';

// Import dynamique du Header pour éviter les erreurs SSR
// Ajouter un timestamp pour forcer le rechargement du chunk
const Header = dynamic(() => import('./Header'), {
  ssr: false,
  loading: () => (
    <header className="bg-blue-600 text-white shadow-sm" data-header-version="4.0.0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-white/20 rounded animate-pulse"></div>
            <div className="ml-3 h-6 w-32 bg-white/20 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-20 bg-white/20 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-white/20 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </header>
  )
});

export default function ClientHeader() {
  return <Header />;
}







































