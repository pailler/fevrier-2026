'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../../../utils/supabaseService';

interface UserApplication {
  moduleId: string;
  usageCount: number;
  maxUsage: number;
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
  lastLogin: string | null;
  status: 'active' | 'inactive' | 'suspended';
  modules: string[];
  applications: UserApplication[];
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        console.log('🔍 Chargement des vrais utilisateurs depuis la base de données...');
        
        // Récupération directe des données depuis Supabase
        
        
        const supabase = getSupabaseClient();

        // Récupérer tous les profils utilisateurs
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (profilesError) {
          console.error('❌ Erreur lors de la récupération des profils:', profilesError);
          return;
        }

        console.log(`📊 ${profiles?.length || 0} profils trouvés dans la base de données`);

        // Récupérer les applications utilisateurs pour chaque profil
        const usersWithApplications = await Promise.all(
          (profiles || []).map(async (profile) => {
            // Récupérer les applications actives de l'utilisateur
            const { data: applications, error: appsError } = await supabase
              .from('user_applications')
              .select('module_id, usage_count, max_usage, expires_at, is_active, created_at, last_used_at')
              .eq('user_id', profile.id)
              .eq('is_active', true);

            if (appsError) {
              console.error(`❌ Erreur applications pour ${profile.email}:`, appsError);
            }

            // Récupérer la dernière connexion depuis les logs d'accès
            const { data: lastAccess, error: accessError } = await supabase
              .from('access_logs')
              .select('created_at')
              .eq('user_id', profile.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            // Calculer les modules actifs
            const activeModules = applications?.map(app => app.module_id) || [];
            
            // Calculer le statut basé sur l'activité
            const now = new Date();
            const lastLogin = lastAccess?.created_at ? new Date(lastAccess.created_at) : null;
            const daysSinceLastLogin = lastLogin ? Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)) : null;
            
            let status: 'active' | 'inactive' | 'suspended' = 'active';
            if (!profile.is_active) {
              status = 'suspended';
            } else if (daysSinceLastLogin && daysSinceLastLogin > 30) {
              status = 'inactive';
            }

            return {
              id: profile.id,
              email: profile.email,
              fullName: profile.full_name || profile.email,
              role: profile.role || 'user',
              createdAt: profile.created_at,
              lastLogin: lastLogin?.toISOString() || null,
              status,
              modules: activeModules,
              applications: applications?.map(app => ({
                moduleId: app.module_id,
                usageCount: app.usage_count || 0,
                maxUsage: app.max_usage || 0,
                expiresAt: app.expires_at,
                lastUsedAt: app.last_used_at,
                createdAt: app.created_at
              })) || []
            };
          })
        );

        console.log(`✅ ${usersWithApplications.length} vrais utilisateurs chargés depuis Supabase`);
        setUsers(usersWithApplications);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des utilisateurs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', text: 'Actif' },
      inactive: { color: 'bg-gray-100 text-gray-800', text: 'Inactif' },
      suspended: { color: 'bg-red-100 text-red-800', text: 'Suspendu' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { color: 'bg-red-100 text-red-800', text: 'Admin' },
      user: { color: 'bg-blue-100 text-blue-800', text: 'Utilisateur' },
    };
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
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
          Gestion des utilisateurs
        </h1>
        <p className="text-gray-600">
          Gérez les comptes utilisateurs, les rôles et les permissions
        </p>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher
            </label>
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rôle
            </label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">Tous les rôles</option>
              <option value="admin">Administrateur</option>
              <option value="user">Utilisateur</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="suspended">Suspendu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modules
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière connexion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {user.fullName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                        <div className="text-xs text-gray-400">
                          ID: {user.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {user.modules.length > 0 ? (
                        user.modules.map((module) => (
                          <span
                            key={module}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {module}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">Aucun module</span>
                      )}
                    </div>
                    {user.applications.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        {user.applications.map((app, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span>{app.moduleId}:</span>
                            <span className="font-medium">{app.usageCount}/{app.maxUsage}</span>
                            {app.expiresAt && (
                              <span className="text-gray-400">
                                (exp: {new Date(app.expiresAt).toLocaleDateString('fr-FR')})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : 'Jamais'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        Modifier
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Suspendre
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Affichage de {filteredUsers.length} utilisateur(s) sur {users.length}
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              Précédent
            </button>
            <button className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
              1
            </button>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}