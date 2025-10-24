'use client';

import { useEffect, useState } from 'react';
import { useCustomAuth } from '../../hooks/useCustomAuth';

export default function QRCodesPage() {
  const { user, loading: authLoading } = useCustomAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <iframe
        src="/qrcodes/template.html"
        className="w-full h-screen border-0"
        title="QR Codes Generator"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
}