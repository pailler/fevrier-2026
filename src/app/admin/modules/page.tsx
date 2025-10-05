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
}

export default function AdminModules() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadModules = async () => {
      try {
        const mockModules: Module[] = [
          {
            id: 'librespeed',
            name: 'LibreSpeed',
            description: 'Test de vitesse de connexion internet',
            status: 'active',
            users: 1250,
            revenue: 2500.00,
            lastUpdate: '2024-01-20',
            version: '1.2.3',
          },
          {
            id: 'metube',
            name: 'MeTube',
            description: 'Téléchargement de vidéos YouTube',
            status: 'active',
            users: 890,
            revenue: 1800.00,
            lastUpdate: '2024-01-19',
            version: '2.1.0',
          },
          {
            id: 'whisper',
            name: 'Whisper AI',
            description: 'Transcription audio et vidéo avec IA',
            status: 'active',
            users: 650,
            revenue: 3200.00,
            lastUpdate: '2024-01-18',
            version: '1.5.2',
          },
          {
            id: 'psitransfer',
            name: 'PsiTransfer',
            description: 'Transfert de fichiers sécurisé',
            status: 'maintenance',
            users: 420,
            revenue: 850.00,
            lastUpdate: '2024-01-15',
            version: '1.0.8',
          },
          {
            id: 'qrcodes',
            name: 'QR Codes',
            description: 'Génération et gestion de codes QR',
            status: 'active',
            users: 780,
            revenue: 1200.00,
            lastUpdate: '2024-01-17',
            version: '1.3.1',
          },
          {
            id: 'pdf',
            name: 'PDF Tools',
            description: 'Outils de manipulation PDF',
            status: 'inactive',
            users: 0,
            revenue: 0.00,
            lastUpdate: '2024-01-10',
            version: '1.0.0',
          },
        ];
        setModules(mockModules);
      } catch (error) {
        console.error('Erreur lors du chargement des modules:', error);
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

  const toggleModuleStatus = (moduleId: string) => {
    setModules(modules.map(module => 
      module.id === moduleId 
        ? { 
            ...module, 
            status: module.status === 'active' ? 'inactive' : 'active' 
          }
        : module
    ));
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <div className="flex items-center justify-between">
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
                      <span className="mr-1">💰</span>
                      {module.revenue.toLocaleString('fr-FR', { 
                        style: 'currency', 
                        currency: 'EUR' 
                      })}
                    </div>
                    <div className="flex items-center">
                      <span className="mr-1">📅</span>
                      Mis à jour le {new Date(module.lastUpdate).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleModuleStatus(module.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      module.status === 'active'
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {module.status === 'active' ? 'Désactiver' : 'Activer'}
                  </button>
                  
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

      {/* Actions globales */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Actions globales
        </h2>
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Activer tous les modules
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            Désactiver tous les modules
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Mettre à jour tous les modules
          </button>
        </div>
      </div>
    </div>
  );
}

