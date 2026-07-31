'use client';

import { useEffect } from 'react';

export default function ReveilIntelligentEntryPage() {
  useEffect(() => {
    const query = window.location.search || '';
    window.location.replace(`/card/reveil-intelligent${query}`);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center text-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto mb-4" />
        <p className="font-medium">Redirection vers Réveil Intelligent…</p>
      </div>
    </div>
  );
}
