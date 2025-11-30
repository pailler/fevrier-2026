'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getSupabaseClient } from '../../../utils/supabaseService';

interface TokenConsumption {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  module_id: string;
  module_name: string;
  tokens_consumed: number;
  consumed_at: string;
  action_type: string;
  description: string;
}

export default function AdminTokens() {
  const [consumptions, setConsumptions] = useState<TokenConsumption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  const [filterState, setFilter] = useState({
    user: '',
    module: '',
    dateFrom: '',
    dateTo: ''
  });
  const supabase = getSupabaseClient();
  const channelsRef = useRef<any[]>([]);

  const loadTokenConsumptions = useCallback(async () => {
    try {
      setIsUpdating(true);
      console.log('🔄 Chargement des consommations de tokens...');
      
      const supabase = getSupabaseClient();

      // Essayer d'abord de récupérer depuis la table token_usage si elle existe
      let consumptions: TokenConsumption[] = [];
      
      try {
        const { data: tokenUsageData, error: tokenUsageError } = await supabase
          .from('token_usage')
          .select(`
            id,
            user_id,
            module_id,
            module_name,
            tokens_consumed,
            usage_date,
            action_type
          `)
          .order('usage_date', { ascending: false })
          .limit(1000); // Limiter à 1000 pour les performances

        if (!tokenUsageError && tokenUsageData && tokenUsageData.length > 0) {
          console.log(`✅ ${tokenUsageData.length} consommations trouvées dans token_usage`);
          
          // Récupérer les profils utilisateurs
          const userIds = [...new Set(tokenUsageData.map(t => t.user_id))];
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, email, full_name')
            .in('id', userIds);

          if (!profilesError && profiles) {
            const profilesMap = {};
            profiles.forEach(profile => {
              profilesMap[profile.id] = profile;
            });

            consumptions = tokenUsageData.map(usage => {
              const profile = profilesMap[usage.user_id];
              return {
                id: usage.id?.toString() || `${usage.user_id}-${usage.module_id}-${usage.usage_date}`,
                user_id: usage.user_id,
                user_email: profile?.email || 'Utilisateur inconnu',
                user_name: profile?.full_name || profile?.email || 'Utilisateur inconnu',
                module_id: usage.module_id,
                module_name: usage.module_name || usage.module_id,
                tokens_consumed: usage.tokens_consumed || 10,
                consumed_at: usage.usage_date || new Date().toISOString(),
                action_type: usage.action_type || 'module_usage',
                description: `Utilisation de ${usage.module_name || usage.module_id}`
              };
            });
          }
        } else {
          console.log('ℹ️ Table token_usage vide ou inexistante, utilisation de user_applications');
        }
      } catch (error) {
        console.log('ℹ️ Table token_usage non accessible, utilisation de user_applications:', error);
      }

      // Si pas de données dans token_usage, utiliser user_applications comme fallback
      if (consumptions.length === 0) {
        // Récupérer les utilisations de modules pour calculer les consommations
        const { data: usageData, error: usageError } = await supabase
          .from('user_applications')
          .select(`
            user_id,
            module_id,
            usage_count,
            last_used_at,
            created_at
          `)
          .order('last_used_at', { ascending: false })
          .limit(1000);

        if (!usageError && usageData) {
          // Récupérer les profils utilisateurs
          const userIds = [...new Set(usageData.map(u => u.user_id))];
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, email, full_name')
            .in('id', userIds);

          if (!profilesError && profiles) {
            // Récupérer les modules
            const moduleIds = [...new Set(usageData.map(u => u.module_id))];
            const { data: modules, error: modulesError } = await supabase
              .from('modules')
              .select('id, name')
              .in('id', moduleIds);

            const profilesMap = {};
            profiles.forEach(profile => {
              profilesMap[profile.id] = profile;
            });

            const modulesMap = {};
            if (!modulesError && modules) {
              modules.forEach(module => {
                modulesMap[module.id] = module;
              });
            }

            // Calculer les coûts par module
            const getTokenCost = (moduleId: string) => {
              if (moduleId.includes('cogstudio') || 
                  moduleId.includes('stablediffusion') || 
                  moduleId.includes('ruinedfooocus') ||
                  moduleId.includes('hunyuan3d') ||
                  moduleId.includes('comfyui') ||
                  moduleId.includes('whisper')) {
                return 100; // Applications IA
              } else if (moduleId.includes('metube') || moduleId.includes('librespeed') ||
                         moduleId.includes('pdf') || moduleId.includes('psitransfer')) {
                return 10; // Applications essentielles
              } else if (moduleId.includes('qrcodes') || moduleId.includes('home-assistant') || moduleId.includes('homeassistant')) {
                return 100; // QR Codes et Home Assistant (premium)
              }
              return 10; // Par défaut
            };

            // Créer les consommations basées sur les utilisations récentes
            usageData.forEach(usage => {
              const profile = profilesMap[usage.user_id];
              const module = modulesMap[usage.module_id];
              const tokenCost = getTokenCost(usage.module_id);
              
              if (profile && usage.usage_count > 0) {
                // Créer une consommation pour la dernière utilisation
                consumptions.push({
                  id: `${usage.user_id}-${usage.module_id}-${usage.last_used_at || usage.created_at}`,
                  user_id: usage.user_id,
                  user_email: profile.email,
                  user_name: profile.full_name || profile.email,
                  module_id: usage.module_id,
                  module_name: module?.name || usage.module_id,
                  tokens_consumed: tokenCost,
                  consumed_at: usage.last_used_at || usage.created_at,
                  action_type: 'module_usage',
                  description: `Utilisation de ${module?.name || usage.module_id}`
                });
              }
            });
          }
        }
      }

      // Trier par date de consommation (plus récent en premier)
      consumptions.sort((a, b) => new Date(b.consumed_at).getTime() - new Date(a.consumed_at).getTime());

      console.log(`✅ ${consumptions.length} consommations de tokens chargées`);
      setConsumptions(consumptions);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('❌ Erreur lors du chargement des consommations:', error);
    } finally {
      setLoading(false);
      setIsUpdating(false);
    }
  }, []);

  useEffect(() => {
    loadTokenConsumptions();

    // Configuration de la mise à jour en temps réel
    const setupRealTimeUpdates = () => {
      // Vérifier si WebSocket est disponible
      const isWebSocketAvailable = typeof window !== 'undefined' && typeof WebSocket !== 'undefined';
      
      if (!isWebSocketAvailable) {
        console.warn('⚠️ WebSocket non disponible, utilisation du polling uniquement');
      } else {
        console.log('🔔 Configuration de l\'écoute en temps réel pour les tokens');
      }

      const channels: any[] = [];

      // S'abonner aux changements dans token_usage (si elle existe)
      if (isWebSocketAvailable) {
        try {
          const channelTokenUsage = supabase
            .channel('admin_tokens_token_usage')
            .on(
              'postgres_changes',
              {
                event: '*', // Écouter INSERT, UPDATE, DELETE
                schema: 'public',
                table: 'token_usage'
              },
              (payload) => {
                console.log('🔔 Changement détecté dans token_usage:', payload);
                setIsUpdating(true);
                loadTokenConsumptions().finally(() => {
                  setIsUpdating(false);
                  setLastUpdate(new Date());
                });
              }
            )
            .subscribe((status) => {
              console.log('🔔 Statut abonnement token_usage:', status);
              if (status === 'SUBSCRIBED') {
                setIsRealTimeConnected(true);
              }
            });
          
          channels.push(channelTokenUsage);
        } catch (error: any) {
          console.log('ℹ️ Table token_usage non accessible pour Realtime:', error);
        }

        // S'abonner aux changements dans user_applications
        try {
          const channel1 = supabase
            .channel('admin_tokens_user_applications')
            .on(
              'postgres_changes',
              {
                event: '*', // Écouter INSERT, UPDATE, DELETE
                schema: 'public',
                table: 'user_applications'
              },
              (payload) => {
                console.log('🔔 Changement détecté dans user_applications:', payload);
                setIsUpdating(true);
                loadTokenConsumptions().finally(() => {
                  setIsUpdating(false);
                  setLastUpdate(new Date());
                });
              }
            )
            .subscribe((status) => {
              console.log('🔔 Statut abonnement user_applications:', status);
              if (status === 'SUBSCRIBED') {
                setIsRealTimeConnected(true);
              }
            });
          
          channels.push(channel1);
        } catch (error: any) {
          console.error('❌ Erreur lors de la configuration Realtime user_applications:', error);
        }

        // S'abonner aux changements dans user_tokens
        try {
          const channel2 = supabase
            .channel('admin_tokens_user_tokens')
            .on(
              'postgres_changes',
              {
                event: '*', // Écouter INSERT, UPDATE, DELETE
                schema: 'public',
                table: 'user_tokens'
              },
              (payload) => {
                console.log('🔔 Changement détecté dans user_tokens:', payload);
                setIsUpdating(true);
                loadTokenConsumptions().finally(() => {
                  setIsUpdating(false);
                  setLastUpdate(new Date());
                });
              }
            )
            .subscribe((status) => {
              console.log('🔔 Statut abonnement user_tokens:', status);
              if (status === 'SUBSCRIBED') {
                setIsRealTimeConnected(true);
              }
            });
          
          channels.push(channel2);
        } catch (error: any) {
          console.error('❌ Erreur lors de la configuration Realtime user_tokens:', error);
        }
      }

      channelsRef.current = channels;

      // Polling de secours toutes les 30 secondes (toujours actif même si Realtime fonctionne)
      const pollingInterval = setInterval(() => {
        console.log('🔄 Polling de secours - Vérification des nouvelles consommations');
        loadTokenConsumptions();
      }, 30000);

      // Nettoyer les abonnements et le polling au démontage
      return () => {
        console.log('🔔 Nettoyage des abonnements en temps réel');
        clearInterval(pollingInterval);
        channels.forEach(channel => {
          try {
            supabase.removeChannel(channel);
          } catch (error) {
            console.warn('⚠️ Erreur lors du nettoyage du channel Realtime:', error);
          }
        });
        channelsRef.current = [];
      };
    };

    const cleanup = setupRealTimeUpdates();
    return cleanup;
  }, [loadTokenConsumptions]);

  const filteredConsumptions = consumptions.filter(consumption => {
    const matchesUser = !filterState.user || 
      consumption.user_name.toLowerCase().includes(filterState.user.toLowerCase()) ||
      consumption.user_email.toLowerCase().includes(filterState.user.toLowerCase());
    
    const matchesModule = !filterState.module || 
      consumption.module_name.toLowerCase().includes(filterState.module.toLowerCase());
    
    const matchesDateFrom = !filterState.dateFrom || 
      new Date(consumption.consumed_at) >= new Date(filterState.dateFrom);
    
    const matchesDateTo = !filterState.dateTo || 
      new Date(consumption.consumed_at) <= new Date(filterState.dateTo);
    
    return matchesUser && matchesModule && matchesDateFrom && matchesDateTo;
  });

  const getModuleIcon = (moduleName: string) => {
    if (moduleName.includes('cogstudio') || 
        moduleName.includes('stablediffusion') || moduleName.includes('ruinedfooocus')) {
      return '🤖';
    } else if (moduleName.includes('metube')) {
      return '📺';
    } else if (moduleName.includes('librespeed')) {
      return '⚡';
    } else if (moduleName.includes('pdf')) {
      return '📄';
    } else if (moduleName.includes('qrcodes')) {
      return '📱';
    } else if (moduleName.includes('psitransfer')) {
      return '📤';
    } else if (moduleName.includes('home-assistant') || moduleName.includes('homeassistant')) {
      return '🏠';
    }
    return '📱';
  };

  const getTotalConsumption = () => {
    return filteredConsumptions.reduce((sum, c) => sum + c.tokens_consumed, 0);
  };

  const getUniqueUsers = () => {
    return new Set(filteredConsumptions.map(c => c.user_id)).size;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Consommation des tokens
            </h1>
            <p className="text-gray-600">
              Suivi chronologique de la consommation de tokens par utilisateur et application
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {isUpdating && (
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm font-medium">Mise à jour...</span>
              </div>
            )}
            <div className={`flex items-center space-x-2 ${isRealTimeConnected ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-2 h-2 rounded-full ${isRealTimeConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm font-medium">
                {isRealTimeConnected ? 'Temps réel actif' : 'Polling uniquement'}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🪙</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tokens consommés</p>
              <p className="text-2xl font-bold text-gray-900">{getTotalConsumption().toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Utilisateurs actifs</p>
              <p className="text-2xl font-bold text-gray-900">{getUniqueUsers()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total consommations</p>
              <p className="text-2xl font-bold text-gray-900">{filteredConsumptions.length.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📱</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Applications utilisées</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(filteredConsumptions.map(c => c.module_id)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtres</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Utilisateur
            </label>
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={filterState.user}
              onChange={(e) => setFilter({...filterState, user: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Application
            </label>
            <input
              type="text"
              placeholder="Rechercher par application..."
              value={filterState.module}
              onChange={(e) => setFilter({...filterState, module: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de début
            </label>
            <input
              type="date"
              value={filterState.dateFrom}
              onChange={(e) => setFilter({...filterState, dateFrom: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de fin
            </label>
            <input
              type="date"
              value={filterState.dateTo}
              onChange={(e) => setFilter({...filterState, dateTo: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>
      </div>

      {/* Liste des consommations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Historique des consommations ({filteredConsumptions.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Application
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tokens
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredConsumptions.map((consumption) => (
                <tr key={consumption.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {consumption.user_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {consumption.user_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {consumption.user_email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{getModuleIcon(consumption.module_name)}</span>
                      <div className="text-sm font-medium text-gray-900">
                        {consumption.module_name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {consumption.tokens_consumed} tokens
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(consumption.consumed_at).toLocaleString('fr-FR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {consumption.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredConsumptions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🪙</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune consommation trouvée</h3>
            <p className="text-gray-500">Aucune consommation de tokens ne correspond aux critères de filtrage.</p>
          </div>
        )}
      </div>
    </div>
  );
}
