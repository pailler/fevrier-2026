'use client';

import { useEffect } from 'react';

export default function ConverterPage() {
  useEffect(() => {
    // Redirection directe vers le container converter sans authentification
    window.location.href = 'http://localhost:8096';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 mt-4">
            Convertisseur Universel
          </h1>
          <p className="text-gray-600">Redirection vers le convertisseur...</p>
        </div>
      </div>
    </div>
  );
}
