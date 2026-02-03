'use client';

import { useState, useEffect } from 'react';
import Header from './Header';

// Squelette identique serveur + premier rendu client pour éviter l'erreur d'hydratation.
// Après montage client, on affiche le vrai Header (avec auth, nav, etc.).
function HeaderSkeleton() {
  return (
    <header
      className="bg-blue-600 text-white shadow-sm relative w-full"
      data-header-version="4.0.0"
      suppressHydrationWarning
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full overflow-x-hidden">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-white/20 rounded animate-pulse" />
            <div className="ml-3 h-6 w-32 bg-white/20 rounded animate-pulse" />
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-8 w-20 bg-white/20 rounded animate-pulse" />
            <div className="h-8 w-8 bg-white/20 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default function ClientHeader() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Même HTML côté serveur et au premier rendu client → pas de hydration mismatch.
  if (!mounted) {
    return <HeaderSkeleton />;
  }
  return <Header />;
}







































