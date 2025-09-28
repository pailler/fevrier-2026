'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function PhotoPortfolioPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Connexion requise</h1>
          <p className="text-gray-600 mb-6">Veuillez vous connecter pour accéder au portfolio photo.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Portfolio Photo IA - Debug
          </h1>
          <p className="text-gray-600 mb-4">
            Utilisateur connecté : {user.email}
          </p>
          <p className="text-gray-600 mb-4">
            ID utilisateur : {user.id}
          </p>
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Test des API</h2>
            <div className="space-y-2">
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/photo-portfolio/stats?userId=' + user.id);
                    const data = await response.json();
                    console.log('Stats API:', data);
                    alert('Stats API: ' + JSON.stringify(data));
                  } catch (error) {
                    console.error('Erreur stats:', error);
                    alert('Erreur stats: ' + error);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-2"
              >
                Test Stats API
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/photo-portfolio/collections?userId=' + user.id);
                    const data = await response.json();
                    console.log('Collections API:', data);
                    alert('Collections API: ' + JSON.stringify(data));
                  } catch (error) {
                    console.error('Erreur collections:', error);
                    alert('Erreur collections: ' + error);
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mr-2"
              >
                Test Collections API
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}















