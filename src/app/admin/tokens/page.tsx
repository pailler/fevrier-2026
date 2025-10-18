'use client';

import { useState, useEffect } from 'react';
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
  const [filter, setFilter] = useState({
    user: '',
    module: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    loadTokenConsumptions();
  }, []);

  const loadTokenConsumptions = async () => {
    try {
      ;
      
      const supabase = getSupabaseClient();

      // Récupérer les consommations de tokens depuis la table user_tokens
      const { data: tokenData, error: tokenError } = await supabase
        .from('user_tokens')
        .select(`
          id,
          user_id,
          tokens,
          purchase_date,
          package_name,
          is_active,
          created_at,
          updated_at
        `)
        .order('updated_at', { ascending: false });

      if (tokenError) {
        console.error('❌ Erreur lors de la récupération des tokens:', tokenError);
        return;
      }

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
        .order('last_used_at', { ascending: false });

      if (usageError) {
        console.error('❌ Erreur lors de la récupération des utilisations:', usageError);
        return;
      }

      // Récupérer les profils utilisateurs
      const userIds = [...new Set([
        ...(tokenData || []).map(t => t.user_id),
        ...(usageData || []).map(u => u.user_id)
      ])];

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('❌ Erreur lors de la récupération des profils:', profilesError);
        return;
      }

      // Récupérer les modules
      const moduleIds = [...new Set((usageData || []).map(u => u.module_id))];
      const { data: modules, error: modulesError } = await supabase
        .from('modules')
        .select('id, name')
        .in('id', moduleIds);

      if (modulesError) {
        console.error('❌ Erreur lors de la récupération des modules:', modulesError);
        return;
      }

      const profilesMap = {};
      (profiles || []).forEach(profile => {
        profilesMap[profile.id] = profile;
      });

      const modulesMap = {};
      (modules || []).forEach(module => {
        modulesMap[module.id] = module;
      });

      // Créer les consommations basées sur les utilisations
      const consumptions: TokenConsumption[] = [];
      
      // Calculer les coûts par module
      const getTokenCost = (moduleId: string) => {
        if (moduleId.includes('cogstudio') || 
            moduleId.includes('stablediffusion') || moduleId.includes('ruinedfooocus')) {
          return 100; // Applications IA
        } else if (moduleId.includes('metube') || moduleId.includes('librespeed') ||
                   moduleId.includes('pdf') || moduleId.includes('qrcodes') || 
                   moduleId.includes('psitransfer')) {
          return 10; // Applications essentielles
        }
        return 10; // Par défaut
      };

      // Traiter chaque utilisation pour créer des consommations
      (usageData || []).forEach(usage => {
        const profile = profilesMap[usage.user_id];
        const module = modulesMap[usage.module_id];
        const tokenCost = getTokenCost(usage.module_id);
        
        if (profile && module && usage.usage_count > 0) {
          // Créer une consommation pour chaque utilisation
          for (let i = 0; i < usage.usage_count; i++) {
            consumptions.push({
              id: `${usage.user_id}-${usage.module_id}-${i}`,
              user_id: usage.user_id,
              user_email: profile.email,
              user_name: profile.full_name || profile.email,
              module_id: usage.module_id,
              module_name: module.name,
              tokens_consumed: tokenCost,
              consumed_at: usage.last_used_at || usage.created_at,
              action_type: 'module_usage',
              description: `Utilisation de ${module.name}`
            });
          }
        }
      });

      // Trier par date de consommation (plus récent en premier)
      consumptions.sort((a, b) => new Date(b.consumed_at).getTime() - new Date(a.consumed_at).getTime());

      console.log(`✅ ${consumptions.length} consommations de tokens chargées`);
      setConsumptions(consumptions);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des consommations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConsumptions = consumptions.filter(consumption => {
    const matchesUser = !filter.user || 
      consumption.user_name.toLowerCase().includes(filter.user.toLowerCase()) ||
      consumption.user_email.toLowerCase().includes(filter.user.toLowerCase());
    
    const matchesModule = !filter.module || 
      consumption.module_name.toLowerCase().includes(filter.module.toLowerCase());
    
    const matchesDateFrom = !filter.dateFrom || 
      new Date(consumption.consumed_at) >= new Date(filter.dateFrom);
    
    const matchesDateTo = !filter.dateTo || 
      new Date(consumption.consumed_at) <= new Date(filter.dateTo);
    
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Consommation des tokens
        </h1>
        <p className="text-gray-600">
          Suivi chronologique de la consommation de tokens par utilisateur et application
        </p>
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
              value={filter.user}
              onChange={(e) => setFilter({...filter, user: e.target.value})}
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
              value={filter.module}
              onChange={(e) => setFilter({...filter, module: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de début
            </label>
            <input
              type="date"
              value={filter.dateFrom}
              onChange={(e) => setFilter({...filter, dateFrom: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de fin
            </label>
            <input
              type="date"
              value={filter.dateTo}
              onChange={(e) => setFilter({...filter, dateTo: e.target.value})}
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
