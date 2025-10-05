'use client';

import { useState, useEffect } from 'react';

interface Module {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'maintenance';
  users: number;
  revenue: number;
  lastUpdate: string;
  version: string;
  usageCount: number;
  maxUsage: number;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt: string;
  activeUsers: Array<{
    id: string;
    email: string;
    fullName: string;
    usageCount: number;
    maxUsage: number;
    expiresAt: string;
    lastUsedAt: string;
    createdAt: string;
  }>;
}

export default function AdminModules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadModules = async () => {
      try {
        console.log('🔍 Chargement des vrais modules depuis la base de données...');
        
        // Récupération directe des données depuis Supabase
        const { createClient } = await import('@supabase/supabase-js');
        
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Récupérer tous les modules depuis la table modules
        const { data: modulesData, error: modulesError } = await supabase
          .from('modules')
          .select('*')
          .order('created_at', { ascending: false });

        if (modulesError) {
          console.error('❌ Erreur lors de la récupération des modules:', modulesError);
          return;
        }

        console.log(`📊 ${modulesData?.length || 0} modules trouvés dans la base de données`);

        // Récupérer les statistiques d'usage depuis user_applications avec les profils utilisateurs
        const { data: usageData, error: usageError } = await supabase
          .from('user_applications')
          .select(`
            module_id, 
            usage_count, 
            max_usage, 
            expires_at, 
            is_active, 
            created_at, 
            last_used_at,
            user_id,
            profiles:user_id (
              id,
              email,
              full_name
            )
          `)
          .eq('is_active', true);

        if (usageError) {
          console.error('❌ Erreur lors de la récupération des statistiques d\'usage:', usageError);
        }

        // Calculer les statistiques par module et récupérer les utilisateurs actifs
        const moduleStats = (usageData || []).reduce((acc, app) => {
          if (!acc[app.module_id]) {
            acc[app.module_id] = {
              users: 0,
              totalUsage: 0,
              totalMaxUsage: 0,
              lastUsedAt: null,
              createdAt: null,
              activeUsers: []
            };
          }
          acc[app.module_id].users++;
          acc[app.module_id].totalUsage += app.usage_count || 0;
          acc[app.module_id].totalMaxUsage += app.max_usage || 0;
          if (app.last_used_at && (!acc[app.module_id].lastUsedAt || new Date(app.last_used_at) > new Date(acc[app.module_id].lastUsedAt))) {
            acc[app.module_id].lastUsedAt = app.last_used_at;
          }
          if (app.created_at && (!acc[app.module_id].createdAt || new Date(app.created_at) < new Date(acc[app.module_id].createdAt))) {
            acc[app.module_id].createdAt = app.created_at;
          }
          
          // Ajouter l'utilisateur actif
          if (app.profiles && Array.isArray(app.profiles) && app.profiles.length > 0) {
            const profile = app.profiles[0];
            acc[app.module_id].activeUsers.push({
              id: app.user_id,
              email: profile.email,
              fullName: profile.full_name || profile.email,
              usageCount: app.usage_count || 0,
              maxUsage: app.max_usage || 0,
              expiresAt: app.expires_at,
              lastUsedAt: app.last_used_at,
              createdAt: app.created_at
            });
          }
          
          return acc;
        }, {} as Record<string, any>);

        // Mapper les modules avec les vraies données
        const modulesWithRealData = (modulesData || []).map(module => {
          const stats = moduleStats[module.id] || {
            users: 0,
            totalUsage: 0,
            totalMaxUsage: 0,
            lastUsedAt: null,
            createdAt: module.created_at,
            activeUsers: []
          };

          // Déterminer le statut basé sur l'activité
          let status: 'active' | 'inactive' | 'maintenance' = 'inactive';
          if (stats.users > 0) {
            status = 'active';
          }
          if (module.status === 'maintenance') {
            status = 'maintenance';
          }

          // Calculer les revenus estimés (basé sur l'usage)
          const estimatedRevenue = stats.totalUsage * 0.5; // 0.5€ par utilisation

          return {
            id: module.id,
            name: module.name || module.id,
            description: module.description || `Module ${module.id}`,
            status,
            users: stats.users,
            revenue: estimatedRevenue,
            lastUpdate: stats.lastUsedAt || module.updated_at || module.created_at,
            version: module.version || '1.0.0',
            usageCount: stats.totalUsage,
            maxUsage: stats.totalMaxUsage,
            expiresAt: module.expires_at || '2025-12-31',
            isActive: module.is_active !== false,
            createdAt: stats.createdAt || module.created_at,
            lastUsedAt: stats.lastUsedAt || null,
            activeUsers: stats.activeUsers || []
          };
        });

        console.log(`✅ ${modulesWithRealData.length} modules chargés avec les vraies données Supabase`);
        setModules(modulesWithRealData);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des modules:', error);
      } finally {
        setLoading(false);
      }
    };

    loadModules();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', text: 'Actif', icon: '🟢' },
      inactive: { color: 'bg-gray-100 text-gray-800', text: 'Inactif', icon: '⚫' },
      maintenance: { color: 'bg-yellow-100 text-yellow-800', text: 'Maintenance', icon: '🔧' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {config.text}
      </span>
    );
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
          Gestion des modules
        </h1>
        <p className="text-gray-600">
          Configurez et gérez les modules de la plateforme
        </p>
      </div>

      {/* Statistiques des modules */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🧩</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total modules</p>
              <p className="text-2xl font-bold text-gray-900">{modules.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🟢</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Modules actifs</p>
              <p className="text-2xl font-bold text-gray-900">
                {modules.filter(m => m.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Utilisateurs totaux</p>
              <p className="text-2xl font-bold text-gray-900">
                {modules.reduce((sum, m) => sum + m.users, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Utilisations totales</p>
              <p className="text-2xl font-bold text-gray-900">
                {modules.reduce((sum, m) => sum + m.usageCount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenus totaux</p>
              <p className="text-2xl font-bold text-gray-900">
                {modules.reduce((sum, m) => sum + m.revenue, 0).toLocaleString('fr-FR', { 
                  style: 'currency', 
                  currency: 'EUR' 
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des modules */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Modules disponibles</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {modules.map((module) => (
            <div key={module.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {module.name}
                    </h3>
                    {getStatusBadge(module.status)}
                    <span className="text-sm text-gray-500">
                      v{module.version}
                    </span>
                  </div>
                  
                  <p className="mt-1 text-sm text-gray-600">
                    {module.description}
                  </p>
                  
                  <div className="mt-3 flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <span className="mr-1">👥</span>
                      {module.users.toLocaleString()} utilisateurs
                    </div>
                    <div className="flex items-center">
                      <span className="mr-1">📊</span>
                      {module.usageCount.toLocaleString()} utilisations
                    </div>
                    <div className="flex items-center">
                      <span className="mr-1">🎯</span>
                      {module.maxUsage.toLocaleString()} max
                    </div>
                    <div className="flex items-center">
                      <span className="mr-1">💰</span>
                      {module.revenue.toLocaleString('fr-FR', { 
                        style: 'currency', 
                        currency: 'EUR' 
                      })}
                    </div>
                    <div className="flex items-center">
                      <span className="mr-1">📅</span>
                      {module.lastUsedAt ? `Utilisé le ${new Date(module.lastUsedAt).toLocaleDateString('fr-FR')}` : 'Jamais utilisé'}
                    </div>
                  </div>

                  {/* Liste des utilisateurs actifs */}
                  {module.activeUsers && module.activeUsers.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Utilisateurs actifs ({module.activeUsers.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {module.activeUsers.map((user) => (
                          <div key={user.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {user.fullName}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center">
                                <span className="mr-1">📊</span>
                                {user.usageCount}/{user.maxUsage}
                              </div>
                              <div className="flex items-center">
                                <span className="mr-1">📅</span>
                                {user.lastUsedAt ? new Date(user.lastUsedAt).toLocaleDateString('fr-FR') : 'Jamais'}
                              </div>
                            </div>
                            <div className="mt-1 text-xs text-gray-400">
                              Expire: {new Date(user.expiresAt).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!module.activeUsers || module.activeUsers.length === 0) && (
                    <div className="mt-4">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-500 text-center">
                          Aucun utilisateur actif pour ce module
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                    Configurer
                  </button>
                  
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                    Statistiques
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

