'use client';

import { useEffect } from 'react';

export default function VoteEntryPage() {
  useEffect(() => {
    const query = window.location.search || '';
    window.location.replace(`/card/vote${query}`);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center text-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto mb-4" />
        <p className="font-medium">Redirection vers Vote…</p>
      </div>
    </div>
  );
}
