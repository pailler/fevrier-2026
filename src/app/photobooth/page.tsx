'use client';

import { useEffect } from 'react';

export default function PhotoboothEntryPage() {
  useEffect(() => {
    const query = window.location.search || '';
    // Le workflow Photobooth passe par la page detaillee comme les autres applis.
    window.location.replace(`/card/photobooth${query}`);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-600 mx-auto mb-4"></div>
        <p className="text-gray-700 font-medium">Redirection vers la page detaillee Photobooth...</p>
      </div>
    </div>
  );
}
