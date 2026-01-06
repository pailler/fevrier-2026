'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function SupabaseMaintenanceWarning() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Vérifier si Supabase est en maintenance
    const checkSupabaseStatus = async () => {
      try {
        // Tentative de connexion avec timeout court
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        );
        
        const queryPromise = supabase
          .from('profiles')
          .select('id')
          .limit(1);
        
        const { error } = await Promise.race([queryPromise, timeoutPromise]) as any;
        
        if (error) {
          const errorMessage = error.message?.toLowerCase() || '';
          if (errorMessage.includes('maintenance') || 
              errorMessage.includes('503') || 
              errorMessage.includes('service unavailable') ||
              errorMessage.includes('timeout') ||
              error.code === 'PGRST301' || // Service unavailable
              error.code === 'PGRST302') {  // Timeout
            setIsMaintenance(true);
          }
        }
      } catch (err: any) {
        // Erreur réseau ou timeout = probablement maintenance
        if (err.name === 'AbortError' || 
            err.message?.includes('timeout') ||
            err.message?.includes('network')) {
          setIsMaintenance(true);
        }
      }
    };

    // Vérifier immédiatement
    checkSupabaseStatus();
    
    // Vérifier périodiquement (toutes les 5 minutes)
    const interval = setInterval(checkSupabaseStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Vérifier si l'avertissement a été masqué
  useEffect(() => {
    const dismissed = localStorage.getItem('supabase_maintenance_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('supabase_maintenance_dismissed', 'true');
    // Réafficher après 1 heure
    setTimeout(() => {
      localStorage.removeItem('supabase_maintenance_dismissed');
    }, 60 * 60 * 1000);
  };

  if (!isMaintenance || isDismissed) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="font-semibold">Maintenance Supabase en cours</p>
            <p className="text-sm">
              Supabase est actuellement en maintenance (21-23 nov 2025, 23:00 UTC). 
              L'application fonctionne en mode hors ligne avec vos données locales.
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="ml-4 text-yellow-900 hover:text-yellow-800 font-semibold"
          aria-label="Masquer l'avertissement"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

