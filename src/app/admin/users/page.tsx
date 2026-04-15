'use client';

import { useState, useEffect, useCallback } from 'react';
import EditUserModal from '../../../components/admin/EditUserModal';
import AddTokensModal from '../../../components/admin/AddTokensModal';

// Intervalle de rafraîchissement automatique (en millisecondes)
const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

interface UserApplication {
  moduleId: string;
  usageCount: number;
  lastUsedAt: string | null;
  createdAt: string;
}

interface User {
  id: string;
  userNumber?: number;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
  lastLogin: string | null;
  status: 'active' | 'inactive' | 'suspended';
  activeModules?: string[];
  activeApplications?: UserApplication[];
  modules: string[];
  applications: UserApplication[];
  tokens?: number;
  tokensRemaining?: number;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [addingTokensUser, setAddingTokensUser] = useState<User | null>(null);
  const [isAddTokensModalOpen, setIsAddTokensModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [editingTokens, setEditingTokens] = useState<{ userId: string; value: number } | null>(null);
  const [tokensLoading, setTokensLoading] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        const details = errBody.details || errBody.error || '';
        throw new Error(`Erreur API admin/users: ${response.status}${details ? ` - ${details}` : ''}`);
      }

      const payload = await response.json();
      const usersFromApi: User[] = Array.isArray(payload?.users) ? payload.users : [];

      console.log(`✅ ${usersFromApi.length} utilisateurs chargés via API admin/users`);
      setUsers(usersFromApi);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('❌ Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    
    // Rafraîchir les données automatiquement
    const refreshInterval = setInterval(() => {
      console.log('🔄 Mise à jour automatique des données...');
      loadUsers();
    }, REFRESH_INTERVAL);

    // Nettoyer l'intervalle au démontage du composant
    return () => clearInterval(refreshInterval);
  }, [loadUsers]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.userNumber != null && String(user.userNumber).includes(searchTerm));
    return matchesSearch;
  });

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleSaveUser = async (userId: string, data: { fullName: string; role: string }) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'update_profile',
          data
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      // Mettre à jour la liste des utilisateurs
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, fullName: data.fullName, role: data.role }
          : user
      ));

      console.log('✅ Utilisateur mis à jour avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour:', error);
      throw error;
    }
  };

  const handleSuspendUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir suspendre cet utilisateur ?')) {
      return;
    }

    setActionLoading(userId);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'suspend_user'
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suspension');
      }

      // Mettre à jour la liste des utilisateurs
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, status: 'suspended' as const }
          : user
      ));

      console.log('✅ Utilisateur suspendu avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la suspension:', error);
      alert('Erreur lors de la suspension de l\'utilisateur');
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivateUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir accéder à cet utilisateur ?')) {
      return;
    }

    setActionLoading(userId);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'activate_user'
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'accès');
      }

      // Mettre à jour la liste des utilisateurs
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, status: 'active' as const }
          : user
      ));

      console.log('✅ Utilisateur accessible avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'accès:', error);
      alert('Erreur lors de l\'accès de l\'utilisateur');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddTokens = (user: User) => {
    setAddingTokensUser(user);
    setIsAddTokensModalOpen(true);
  };

  const handleTokensAdded = () => {
    // Recharger les utilisateurs pour mettre à jour les tokens
    loadUsers();
  };

  const handleEditTokens = (user: User) => {
    setEditingTokens({ userId: user.id, value: user.tokens || 0 });
  };

  const handleSaveTokens = async (userId: string, newTokens: number) => {
    if (newTokens < 0) {
      alert('Le nombre de crédits ne peut pas être négatif');
      return;
    }

    setTokensLoading(userId);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'update_tokens',
          data: { tokens: newTokens }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }

      // Mettre à jour la liste des utilisateurs
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, tokens: newTokens }
          : user
      ));

      setEditingTokens(null);
      console.log('✅ Tokens mis à jour avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des tokens:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la mise à jour des tokens');
    } finally {
      setTokensLoading(null);
    }
  };

  const handleCancelEditTokens = () => {
    setEditingTokens(null);
  };

  const formatLastActivity = (lastLogin: string | null) => {
    if (!lastLogin) {
      return <span className="text-gray-400">Jamais</span>;
    }

    const now = new Date();
    const lastActivity = new Date(lastLogin);
    const daysSince = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    const hoursSince = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60));
    const minutesSince = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60));

    let timeText = '';
    let colorClass = '';

    if (minutesSince < 60) {
      timeText = minutesSince <= 1 ? 'À l\'instant' : `Il y a ${minutesSince} min`;
      colorClass = 'text-green-600';
    } else if (hoursSince < 24) {
      timeText = hoursSince === 1 ? 'Il y a 1h' : `Il y a ${hoursSince}h`;
      colorClass = 'text-green-600';
    } else if (daysSince === 0) {
      timeText = 'Aujourd\'hui';
      colorClass = 'text-green-600';
    } else if (daysSince === 1) {
      timeText = 'Hier';
      colorClass = 'text-green-600';
    } else if (daysSince <= 7) {
      timeText = `Il y a ${daysSince} jours`;
      colorClass = 'text-yellow-600';
    } else if (daysSince <= 30) {
      timeText = `Il y a ${daysSince} jours`;
      colorClass = 'text-orange-600';
    } else {
      timeText = `Il y a ${daysSince} jours`;
      colorClass = 'text-red-600';
    }

    return (
      <div>
        <div className="font-medium">
          {lastActivity.toLocaleDateString('fr-FR')}
        </div>
        <div className="text-xs text-gray-400">
          {lastActivity.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
        <div className={`text-xs font-medium ${colorClass}`}>
          {timeText}
        </div>
      </div>
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
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestion administrateur IAHome
            </h1>
            <p className="text-gray-600">
              Gérez les comptes utilisateurs, les rôles et les permissions
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
            </div>
            <button
              onClick={() => {
                setLoading(true);
                loadUsers();
              }}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Rafraîchissement...' : 'Rafraîchir'}
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total utilisateurs</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{users.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Utilisateurs actifs</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avec applis sur le compte</p>
              <p className="text-3xl font-bold text-amber-600 mt-2">
                {users.filter(u => (u.activeModules || []).length > 0).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sans applis visitées</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {users.filter(u => u.modules.length === 0).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Au moins 2 applis visitées</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {users.filter(u => u.modules.length >= 2).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rechercher
          </label>
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900"
          />
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  N°
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applis référencées
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applis visitées
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tokens restants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière activité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                    {user.userNumber ?? '—'}
                  </td>
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
                    <div className="flex flex-wrap gap-1">
                      {(user.activeModules || []).length > 0 ? (
                        (user.activeModules || []).map((module) => (
                          <span
                            key={module}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
                          >
                            {module}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">Aucune appli référencée</span>
                      )}
                    </div>
                    {(user.activeApplications || []).length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        {(user.activeApplications || []).map((app, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span>{app.moduleId}:</span>
                            <span className="font-medium">{app.usageCount}</span>
                          </div>
                        ))}
                      </div>
                    )}
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
                        <span className="text-xs text-gray-400">Aucune appli visitée</span>
                      )}
                    </div>
                    {user.applications.length > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        {user.applications.map((app, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span>{app.moduleId}:</span>
                            <span className="font-medium">{app.usageCount}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingTokens?.userId === user.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={editingTokens.value}
                          onChange={(e) => setEditingTokens({ ...editingTokens, value: parseInt(e.target.value) || 0 })}
                          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveTokens(user.id, editingTokens.value);
                            } else if (e.key === 'Escape') {
                              handleCancelEditTokens();
                            }
                          }}
                        />
                        <button
                          onClick={() => handleSaveTokens(user.id, editingTokens.value)}
                          disabled={tokensLoading === user.id}
                          className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Sauvegarder"
                        >
                          {tokensLoading === user.id ? '...' : '✓'}
                        </button>
                        <button
                          onClick={handleCancelEditTokens}
                          disabled={tokensLoading === user.id}
                          className="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Annuler"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span 
                          className={`text-sm font-semibold cursor-pointer hover:text-blue-600 ${((user.tokensRemaining ?? user.tokens) || 0) > 0 ? 'text-green-600' : 'text-gray-400'}`}
                          onClick={() => handleEditTokens(user)}
                          title="Cliquer pour modifier"
                        >
                          {(user.tokensRemaining ?? user.tokens ?? 0).toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleAddTokens(user)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          title="Ajouter des crédits"
                        >
                          + Ajouter
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatLastActivity(user.lastLogin)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        disabled={actionLoading === user.id}
                      >
                        Modifier
                      </button>
                      {user.status === 'suspended' ? (
                        <button 
                          onClick={() => handleActivateUser(user.id)}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          disabled={actionLoading === user.id}
                        >
                          {actionLoading === user.id ? 'accès...' : 'accéder à'}
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleSuspendUser(user.id)}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          disabled={actionLoading === user.id}
                        >
                          {actionLoading === user.id ? 'Suspension...' : 'Suspendre'}
                        </button>
                      )}
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

      {/* Modal de modification d'utilisateur */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingUser(null);
          }}
          onSave={handleSaveUser}
        />
      )}

      {/* Modal d'ajout de crédits */}
      {addingTokensUser && (
        <AddTokensModal
          user={addingTokensUser}
          isOpen={isAddTokensModalOpen}
          onClose={() => {
            setIsAddTokensModalOpen(false);
            setAddingTokensUser(null);
          }}
          onSuccess={handleTokensAdded}
        />
      )}
    </div>
  );
}

