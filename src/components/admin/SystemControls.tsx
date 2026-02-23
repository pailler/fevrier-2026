'use client';

import React, { useState, useEffect } from 'react';
import ToggleSwitch from './ToggleSwitch';

interface SystemControlsProps {
  settings: {
    maintenanceMode: boolean;
    userRegistration: boolean;
    moduleAccess: boolean;
    analytics: boolean;
    notifications: boolean;
  };
  onSettingChange: (key: string, value: boolean) => void;
  loading?: boolean;
}

export default function SystemControls({ 
  settings, 
  onSettingChange, 
  loading = false 
}: SystemControlsProps) {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleSettingChange = async (key: string, value: boolean) => {
    setIsUpdating(key);
    
    try {
      // Simulation d'un appel API pour sauvegarder les paramètres
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSettingChange(key, value);
      
      // Afficher une notification de succès
      console.log(`Paramètre ${key} mis à jour avec succès`);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de ${key}:`, error);
    } finally {
      setIsUpdating(null);
    }
  };

  const controls = [
    {
      key: 'maintenanceMode',
      label: 'Mode maintenance',
      description: 'Désactive temporairement l\'accès au site pour tous les utilisateurs',
      color: 'red' as const,
      warning: '⚠️ Le site sera inaccessible aux utilisateurs'
    },
    {
      key: 'userRegistration',
      label: 'Inscription utilisateurs',
      description: 'Autorise les nouvelles inscriptions sur le site',
      color: 'green' as const
    },
    {
      key: 'moduleAccess',
      label: 'Accès aux modules IA',
      description: 'Active l\'accès aux modules d\'intelligence artificielle',
      color: 'blue' as const
    },
    {
      key: 'analytics',
      label: 'Collecte d\'analytics',
      description: 'Active la collecte de données d\'utilisation et de performance',
      color: 'purple' as const
    },
    {
      key: 'notifications',
      label: 'Notifications système',
      description: 'Active l\'envoi de notifications aux utilisateurs',
      color: 'yellow' as const
    }
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Paramètres système</h3>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="h-6 w-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Paramètres système</h3>
        <div className="text-sm text-gray-500">
          {Object.values(settings).filter(Boolean).length} / {Object.keys(settings).length} accessibles
        </div>
      </div>
      
      <div className="space-y-6">
        {controls.map((control) => (
          <div key={control.key} className="relative">
            <ToggleSwitch
              enabled={settings[control.key as keyof typeof settings]}
              onChange={(enabled) => handleSettingChange(control.key, enabled)}
              label={control.label}
              description={control.description}
              color={control.color}
              disabled={isUpdating === control.key}
            />
            
            {isUpdating === control.key && (
              <div className="absolute right-0 top-0 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              </div>
            )}
            
            {control.warning && settings[control.key as keyof typeof settings] && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">{control.warning}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Actions globales */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Les modifications sont appliquées immédiatement
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                Object.keys(settings).forEach(key => {
                  handleSettingChange(key, true);
                });
              }}
              className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
            >
              Tout accéder à
            </button>
            <button
              onClick={() => {
                Object.keys(settings).forEach(key => {
                  if (key !== 'maintenanceMode') { // Ne pas suspendre le mode maintenance automatiquement
                    handleSettingChange(key, false);
                  }
                });
              }}
              className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
            >
              Tout suspendre
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

