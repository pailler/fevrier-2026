'use client';

import { useEffect } from 'react';

export default function PhotoVivanteEntryPage() {
  useEffect(() => {
    const query = window.location.search || '';
    window.location.replace(`/card/photo-vivante${query}`);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium">Redirection vers la page detaillee Photo Vivante...</p>
      </div>
    </div>
  );
}
