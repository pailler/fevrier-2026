'use client';

import { useState, useEffect } from 'react';

interface UserDataDisplayProps {
  user: any;
  showDetails?: boolean;
  className?: string;
}

export default function UserDataDisplay({ 
  user, 
  showDetails = true, 
  className = "" 
}: UserDataDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!user) {
    return (
      <div className={`bg-gray-50 p-4 rounded-lg ${className}`}>
        <p className="text-gray-500 text-center">Aucune donnée utilisateur disponible</p>
      </div>
    );
  }

  return (
    <div className={`bg-blue-50 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          📋 Informations du compte
        </h2>
        {showDetails && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {isExpanded ? 'Masquer les détails' : 'Voir les détails'}
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="bg-white p-4 rounded-lg border">
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-lg font-semibold text-gray-900">{user.email}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <label className="text-sm font-medium text-gray-500">Nom complet</label>
            <p className="text-lg font-semibold text-gray-900">{user.full_name}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="bg-white p-4 rounded-lg border">
            <label className="text-sm font-medium text-gray-500">Rôle</label>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              user.role === 'admin' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {user.role === 'admin' ? '👑 Administrateur' : '👤 Utilisateur'}
            </span>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <label className="text-sm font-medium text-gray-500">Statut</label>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              user.is_active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {user.is_active ? '✅ Actif' : '⏳ En attente'}
            </span>
          </div>
        </div>
      </div>

      {/* Détails supplémentaires */}
      {showDetails && isExpanded && (
        <div className="mt-6 bg-white p-4 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 Détails techniques</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">ID utilisateur:</span>
              <p className="font-mono text-xs text-gray-700 break-all mt-1">{user.id}</p>
            </div>
            <div>
              <span className="text-gray-500">Email vérifié:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                user.email_verified 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {user.email_verified ? 'Oui' : 'Non'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Créé le:</span>
              <p className="text-gray-700 mt-1">
                {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
              </p>
            </div>
          </div>
          
          {/* Données JSON complètes */}
          <div className="mt-4">
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
                Voir les données JSON complètes
              </summary>
              <div className="mt-2 bg-gray-50 p-3 rounded border">
                <pre className="text-xs text-gray-700 overflow-auto max-h-40">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}
