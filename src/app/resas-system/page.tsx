'use client';

import { useEffect } from 'react';

export default function ResasSystemEntryPage() {
  useEffect(() => {
    const query = window.location.search || '';
    window.location.replace(`/card/resas-system${query}`);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-950">
      <div className="text-center text-purple-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4" />
        <p className="font-medium">Redirection vers Réservation matériel…</p>
      </div>
    </div>
  );
}