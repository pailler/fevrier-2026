'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ComfyUIPage() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const token = searchParams.get('token');
    const service = 'comfyui';
    
    if (token) {
      // Rediriger vers le proxy Gradio avec le token
      window.location.href = `/api/gradio-proxy?service=${service}&token=${token}`;
    } else {
      // Rediriger vers la page de connexion
      window.location.href = '/login?redirect=/comfyui';
    }
  }, [searchParams]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-lg">Redirection vers ComfyUI...</p>
      </div>
    </div>
  );
}













