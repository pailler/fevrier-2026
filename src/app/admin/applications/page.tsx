'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../../../utils/supabaseService';

interface Application {
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

export default function AdminApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApplications = async () => {
      try {
        ;
        
        const supabase = getSupabaseClient();

        // Récupérer toutes les applications depuis la table modules (peut être vide)
        const { data: modulesData, error: modulesError } = await supabase
          .from('modules')
          .select('*')
          .order('created_at', { ascending: false });

        if (modulesError) {
          console.error('❌ Erreur lors de la récupération des modules:', modulesError);
        }

        // Récupérer les applications utilisateurs séparément
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
            user_id
          `)
          .eq('is_active', true);

        // Récupérer les profils et modules séparément
        const userIds = [...new Set((usageData || []).map(app => app.user_id))];
        const moduleIds = [...new Set((usageData || []).map(app => app.module_id))];

        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds);

        const { data: appModules, error: appModulesError } = await supabase
          .from('modules')
          .select('id, name')
          .in('id', moduleIds);

        const profilesMap = {};
        (profiles || []).forEach(profile => {
          profilesMap[profile.id] = profile;
        });

        const modulesMap = {};
        (appModules || []).forEach(module => {
          modulesMap[module.id] = module;
        });

        if (usageError) {
          console.error('❌ Erreur lors de la récupération des statistiques d\'usage:', usageError);
        }

        console.log(`📊 ${modulesData?.length || 0} applications trouvées dans la base de données`);
        console.log(`📋 ${usageData?.length || 0} applications utilisateurs trouvées`);

        // Calculer les statistiques par application et récupérer les utilisateurs actifs
        const applicationStats = (usageData || []).reduce((acc, app) => {
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
          const profile = profilesMap[app.user_id];
          if (profile) {
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

        // Créer les applications basées sur les données réelles de user_applications
        const uniqueModuleIds = [...new Set((usageData || []).map(app => app.module_id))];
        
        const applicationsWithRealData = uniqueModuleIds.map(moduleId => {
          const stats = applicationStats[moduleId] || {
            users: 0,
            totalUsage: 0,
            totalMaxUsage: 0,
            lastUsedAt: null,
            createdAt: null,
            activeUsers: []
          };

          // Déterminer le statut basé sur l'activité
          let status: 'active' | 'inactive' | 'maintenance' = 'inactive';
          if (stats.users > 0) {
            status = 'active';
          }

          // Calculer les revenus estimés basés sur les tokens consommés
          let estimatedRevenue = 0;
          let tokenCost = 0;
          let description = '';
          
          // Définir les paramètres selon le type d'application
          if (moduleId.includes('sdnext') || moduleId.includes('cogstudio') || moduleId.includes('stablediffusion') || moduleId.includes('ruinedfooocus')) {
            // Applications IA : 100 tokens par utilisation
            tokenCost = 100;
            estimatedRevenue = stats.totalUsage * tokenCost * 0.01; // 0.01€ par token
            description = `Application d'intelligence artificielle pour la génération d'images. Coût: ${tokenCost} tokens par utilisation.`;
          } else if (moduleId.includes('metube') || moduleId.includes('librespeed')) {
            // Applications média : 10 tokens par utilisation
            tokenCost = 10;
            estimatedRevenue = stats.totalUsage * tokenCost * 0.01; // 0.01€ par token
            if (moduleId.includes('metube')) {
              description = `Téléchargeur de vidéos YouTube. Coût: ${tokenCost} tokens par téléchargement.`;
            } else {
              description = `Test de vitesse de connexion internet. Coût: ${tokenCost} tokens par test.`;
            }
          } else if (moduleId.includes('pdf') || moduleId.includes('qrcodes') || moduleId.includes('psitransfer')) {
            // Applications utilitaires : 10 tokens par utilisation
            tokenCost = 10;
            estimatedRevenue = stats.totalUsage * tokenCost * 0.01; // 0.01€ par token
            if (moduleId.includes('pdf')) {
              description = `Convertisseur de documents PDF. Coût: ${tokenCost} tokens par conversion.`;
            } else if (moduleId.includes('qrcodes')) {
              description = `Générateur de codes QR. Coût: ${tokenCost} tokens par génération.`;
            } else {
              description = `Service de transfert de fichiers sécurisé. Coût: ${tokenCost} tokens par transfert.`;
            }
          } else {
            // Applications par défaut
            tokenCost = 10;
            estimatedRevenue = stats.totalUsage * tokenCost * 0.01;
            description = `Application utilitaire. Coût: ${tokenCost} tokens par utilisation.`;
          }

          return {
            id: moduleId,
            name: moduleId.charAt(0).toUpperCase() + moduleId.slice(1),
            description,
            status,
            users: stats.users,
            revenue: estimatedRevenue,
            lastUpdate: stats.lastUsedAt || stats.createdAt || new Date().toISOString(),
            version: '1.0.0',
            usageCount: stats.totalUsage,
            maxUsage: stats.totalMaxUsage,
            expiresAt: '2025-12-31',
            isActive: true,
            createdAt: stats.createdAt || new Date().toISOString(),
            lastUsedAt: stats.lastUsedAt || null,
            activeUsers: stats.activeUsers || [],
            tokenCost: tokenCost
          };
        });

        console.log(`✅ ${applicationsWithRealData.length} applications chargées avec les vraies données Supabase`);
        setApplications(applicationsWithRealData);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des applications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
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

  const getApplicationIcon = (appName: string) => {
    if (appName.includes('sdnext') || appName.includes('cogstudio') || appName.includes('stablediffusion') || appName.includes('ruinedfooocus')) {
      return '🤖'; // IA
    } else if (appName.includes('metube')) {
      return '📺'; // Vidéo
    } else if (appName.includes('librespeed')) {
      return '⚡'; // Vitesse
    } else if (appName.includes('pdf')) {
      return '📄'; // PDF
    } else if (appName.includes('qrcodes')) {
      return '📱'; // QR Codes
    } else if (appName.includes('psitransfer')) {
      return '📤'; // Transfert
    }
    return '📱'; // Par défaut
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
          Gestion des applications
        </h1>
        <p className="text-gray-600">
          Configurez et gérez les applications de la plateforme
        </p>
      </div>

      {/* Statistiques des applications */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📱</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total applications</p>
              <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🟢</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Applications actives</p>
              <p className="text-2xl font-bold text-gray-900">
                {applications.filter(a => a.status === 'active').length}
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
                {applications.reduce((sum, a) => sum + a.users, 0).toLocaleString()}
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
                {applications.reduce((sum, a) => sum + a.usageCount, 0).toLocaleString()}
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
                {applications.reduce((sum, a) => sum + a.revenue, 0).toLocaleString('fr-FR', { 
                  style: 'currency', 
                  currency: 'EUR' 
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des applications */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Applications disponibles</h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {applications.map((application) => (
            <div key={application.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getApplicationIcon(application.name)}</span>
                    <h3 className="text-lg font-medium text-gray-900">
                      {application.name}
                    </h3>
                    {getStatusBadge(application.status)}
                    <span className="text-sm text-gray-500">
                      v{application.version}
                    </span>
                  </div>
                  
                  <p className="mt-1 text-sm text-gray-600">
                    {application.description}
                  </p>
                  
                        <div className="mt-3 flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center">
                            <span className="mr-1">👥</span>
                            {application.users.toLocaleString()} utilisateurs
                          </div>
                          <div className="flex items-center">
                            <span className="mr-1">📊</span>
                            {application.usageCount.toLocaleString()} utilisations
                          </div>
                          <div className="flex items-center">
                            <span className="mr-1">🪙</span>
                            {(application as any).tokenCost} tokens/utilisation
                          </div>
                          <div className="flex items-center">
                            <span className="mr-1">💰</span>
                            {application.revenue.toLocaleString('fr-FR', {
                              style: 'currency',
                              currency: 'EUR'
                            })}
                          </div>
                          <div className="flex items-center">
                            <span className="mr-1">📅</span>
                            {application.lastUsedAt ? `Utilisé le ${new Date(application.lastUsedAt).toLocaleDateString('fr-FR')}` : 'Jamais utilisé'}
                          </div>
                        </div>

                  {/* Liste des utilisateurs actifs */}
                  {application.activeUsers && application.activeUsers.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Utilisateurs actifs ({application.activeUsers.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {application.activeUsers.map((user) => (
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
                                {user.usageCount} utilisations
                              </div>
                              <div className="flex items-center">
                                <span className="mr-1">📅</span>
                                {user.lastUsedAt ? new Date(user.lastUsedAt).toLocaleDateString('fr-FR') : 'Jamais'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!application.activeUsers || application.activeUsers.length === 0) && (
                    <div className="mt-4">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-sm text-gray-500 text-center">
                          Aucun utilisateur actif pour cette application
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