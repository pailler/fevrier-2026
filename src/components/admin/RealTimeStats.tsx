'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface RealTimeStatsProps {
  onStatsUpdate: (stats: any) => void;
  refreshInterval?: number;
}

export default function RealTimeStats({ 
  onStatsUpdate, 
  refreshInterval = 30000 // 30 secondes par défaut
}: RealTimeStatsProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchRealTimeStats = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setIsConnected(false);
          return;
        }

        // Récupérer les statistiques en temps réel
        const response = await fetch('/api/admin/statistics', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const stats = await response.json();
          onStatsUpdate(stats);
          setLastUpdate(new Date());
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des stats temps réel:', error);
        setIsConnected(false);
      }
    };

    // Récupération initiale
    fetchRealTimeStats();

    // Configuration de l'intervalle de mise à jour
    intervalId = setInterval(fetchRealTimeStats, refreshInterval);

    // Nettoyage
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [onStatsUpdate, refreshInterval]);

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
      <span className={`${isConnected ? 'text-green-600' : 'text-red-600'}`}>
        {isConnected ? 'Connecté' : 'Déconnecté'}
      </span>
      <span className="text-gray-500">
        • Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
      </span>
    </div>
  );
}
