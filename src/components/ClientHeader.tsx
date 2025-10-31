'use client';

import dynamic from 'next/dynamic';

// Import dynamique du Header pour éviter les erreurs SSR
const Header = dynamic(() => import('./Header'), {
  ssr: false,
  loading: () => (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-blue-600 rounded animate-pulse"></div>
            <div className="ml-3 h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </header>
  )
});

export default function ClientHeader() {
  return <Header />;
}























