'use client';

import React from 'react';
import AdminGuard from '../../../components/admin/AdminGuard';

function TestContent() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Test de l'administration</h1>
        <p className="text-gray-600 mb-6">
          Si vous voyez cette page, cela signifie que vous avez accès à l'administration.
        </p>
        <div className="space-y-3">
          <a
            href="/admin/dashboard"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors inline-block"
          >
            Accéder au tableau de bord
          </a>
          <a
            href="/"
            className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors inline-block"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AdminTest() {
  return (
    <AdminGuard>
      <TestContent />
    </AdminGuard>
  );
}
