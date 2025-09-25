'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function QRCodesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Rediriger automatiquement vers la page de redirection avec sessions
    const token = searchParams.get('token') || 'default';
    router.replace(`/qrcodes-redirect?token=${token}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirection vers l'interface QR codes...</p>
      </div>
    </div>
  );
}
