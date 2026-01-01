'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../../../utils/supabaseService';
import { useCustomAuth } from '@/hooks/useCustomAuth';

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

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Service {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  url: string;
  icon: string;
  is_popular: boolean;
  app_store_url?: string;
  play_store_url?: string;
  display_order: number;
  is_active: boolean;
  category?: Category;
}

interface UrlCheck {
  id: string;
  service_id: string;
  url: string;
  status_code?: number;
  is_valid: boolean;
  error_message?: string;
  response_time_ms?: number;
  last_checked_at: string;
  service?: Service;
}

interface ApplicationHealthCheck {
  module_id: string;
  module_name: string;
  url: string | null;
  isValid: boolean;
  statusCode?: number;
  errorMessage?: string;
  responseTime?: number;
  isCloudflareError?: boolean;
}

export default function AdminApplications() {
  const { user, isAuthenticated } = useCustomAuth();
  const [activeMainTab, setActiveMainTab] = useState<'applications' | 'services-admin'>('applications');
  
  // Détecter le paramètre d'URL pour ouvrir l'onglet Services admin
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      if (tab === 'services-admin') {
        setActiveMainTab('services-admin');
        // Nettoyer l'URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);
  
  // Applications state
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [healthChecks, setHealthChecks] = useState<Record<string, ApplicationHealthCheck>>({});
  const [checkingHealth, setCheckingHealth] = useState(false);
  
  // Services admin state
  const [activeTab, setActiveTab] = useState<'categories' | 'services' | 'url-checks'>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [urlChecks, setUrlChecks] = useState<UrlCheck[]>([]);
  const [adminLoading, setAdminLoading] = useState(true);
  const [checkingUrls, setCheckingUrls] = useState(false);
  
  // Form states
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);

  // Form data
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    icon: '📋',
    color: 'from-blue-500 to-blue-600',
    description: '',
    display_order: 0,
    is_active: true
  });

  const [serviceForm, setServiceForm] = useState({
    category_id: '',
    name: '',
    description: '',
    url: '',
    icon: '🔗',
    is_popular: false,
    app_store_url: '',
    play_store_url: '',
    display_order: 0,
    is_active: true
  });

  // Load applications
  useEffect(() => {
    if (activeMainTab === 'applications') {
      loadApplications();
    }
  }, [activeMainTab]);

  // Load admin services
  useEffect(() => {
    if (activeMainTab === 'services-admin' && isAuthenticated && user?.role === 'admin') {
      loadAdminData();
    }
  }, [activeMainTab, isAuthenticated, user, activeTab]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .order('created_at', { ascending: false });

      if (modulesError) {
        console.error('❌ Erreur lors de la récupération des modules:', modulesError);
      }

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

        let status: 'active' | 'inactive' | 'maintenance' = 'inactive';
        if (stats.users > 0) {
          status = 'active';
        }

        let estimatedRevenue = 0;
        let tokenCost = 0;
        let description = '';
        
        if (moduleId.includes('cogstudio') || moduleId.includes('stablediffusion') || moduleId.includes('ruinedfooocus')) {
          tokenCost = 100;
          estimatedRevenue = stats.totalUsage * tokenCost * 0.01;
          description = `Application d'intelligence artificielle pour la génération d'images. Coût: ${tokenCost} tokens par utilisation.`;
        } else if (moduleId.includes('metube') || moduleId.includes('librespeed')) {
          tokenCost = 10;
          estimatedRevenue = stats.totalUsage * tokenCost * 0.01;
          if (moduleId.includes('metube')) {
            description = `Téléchargeur de vidéos YouTube. Coût: ${tokenCost} tokens par téléchargement.`;
          } else {
            description = `Test de vitesse de connexion internet. Coût: ${tokenCost} tokens par test.`;
          }
        } else if (moduleId.includes('pdf') || moduleId.includes('psitransfer')) {
          tokenCost = 10;
          estimatedRevenue = stats.totalUsage * tokenCost * 0.01;
          if (moduleId.includes('pdf')) {
            description = `Convertisseur de documents PDF. Coût: ${tokenCost} tokens par conversion.`;
          } else {
            description = `Service de transfert de fichiers sécurisé. Coût: ${tokenCost} tokens par transfert.`;
          }
        } else if (moduleId.includes('code-learning')) {
          tokenCost = 10;
          estimatedRevenue = stats.totalUsage * tokenCost * 0.01;
          description = `Application d'apprentissage du code pour enfants. Coût: ${tokenCost} tokens par accès.`;
        } else if (moduleId.includes('qrcodes')) {
          tokenCost = 100;
          estimatedRevenue = stats.totalUsage * tokenCost * 0.01;
          description = `Générateur de codes QR dynamiques. Coût: ${tokenCost} tokens par génération.`;
        } else if (moduleId.includes('home-assistant') || moduleId.includes('homeassistant')) {
          tokenCost = 100;
          estimatedRevenue = stats.totalUsage * tokenCost * 0.01;
          description = `Manuel utilisateur ultra complet pour domotiser votre habitat. Coût: ${tokenCost} tokens par activation.`;
        } else if (moduleId.includes('administration')) {
          tokenCost = 10;
          estimatedRevenue = stats.totalUsage * tokenCost * 0.01;
          description = `Portail centralisé pour accéder rapidement aux principaux services de l'administration française. Coût: ${tokenCost} tokens par activation.`;
        } else if (moduleId.includes('prompt-generator')) {
          tokenCost = 100;
          estimatedRevenue = stats.totalUsage * tokenCost * 0.01;
          description = `Générateur de prompts optimisés pour ChatGPT et autres modèles de langage. Coût: ${tokenCost} tokens par accès.`;
        } else if (moduleId.includes('ai-detector') || moduleId.includes('detecteur')) {
          tokenCost = 100;
          estimatedRevenue = stats.totalUsage * tokenCost * 0.01;
          description = `Détecteur de contenu généré par IA. Analyse les documents texte, PDF, DOCX et images. Coût: ${tokenCost} tokens par accès.`;
        } else {
          tokenCost = 10;
          estimatedRevenue = stats.totalUsage * tokenCost * 0.01;
          description = `Application utilitaire. Coût: ${tokenCost} tokens par utilisation.`;
        }

        let moduleName = moduleId.charAt(0).toUpperCase() + moduleId.slice(1);
        if (moduleId.includes('home-assistant') || moduleId.includes('homeassistant')) {
          moduleName = 'Home Assistant';
        } else if (moduleId.includes('code-learning')) {
          moduleName = 'Code Learning';
        } else if (moduleId.includes('meeting-reports')) {
          moduleName = 'Meeting Reports';
        } else if (moduleId.includes('administration')) {
          moduleName = 'Services de l\'Administration';
        } else if (moduleId.includes('prompt-generator')) {
          moduleName = 'Générateur de prompts';
        } else if (moduleId.includes('ai-detector') || moduleId.includes('detecteur')) {
          moduleName = 'Détecteur de Contenu IA';
        }

        return {
          id: moduleId,
          name: moduleName,
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

      setApplications(applicationsWithRealData);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminData = async (forceAll = false) => {
    setAdminLoading(true);
    try {
      const timestamp = Date.now();
      const tabsToLoad = forceAll 
        ? ['categories', 'services', 'url-checks']
        : [activeTab];

      if (tabsToLoad.includes('categories')) {
        const res = await fetch(`/api/admin/administration/categories?t=${timestamp}`, {
          cache: 'no-store'
        });
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        }
      }
      
      if (tabsToLoad.includes('services')) {
        const res = await fetch(`/api/admin/administration/services?t=${timestamp}`, {
          cache: 'no-store'
        });
        const data = await res.json();
        if (data.success) {
          setServices(data.data);
        }
      }
      
      if (tabsToLoad.includes('url-checks')) {
        const res = await fetch(`/api/admin/administration/check-urls?limit=100&t=${timestamp}`, {
          cache: 'no-store'
        });
        const data = await res.json();
        if (data.success) {
          setUrlChecks(data.data);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/administration/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowCategoryForm(false);
        setCategoryForm({
          name: '',
          icon: '📋',
          color: 'from-blue-500 to-blue-600',
          description: '',
          display_order: 0,
          is_active: true
        });
        loadAdminData(true);
      } else {
        alert('Erreur: ' + data.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création de la catégorie');
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      const res = await fetch(`/api/admin/administration/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      });
      const data = await res.json();
      if (data.success) {
        setEditingCategory(null);
        setShowCategoryForm(false);
        loadAdminData(true);
      } else {
        alert('Erreur: ' + data.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour de la catégorie');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ? Les services associés seront également supprimés.')) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/administration/categories/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        loadAdminData(true);
      } else {
        alert('Erreur: ' + data.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression de la catégorie');
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/administration/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowServiceForm(false);
        setServiceForm({
          category_id: '',
          name: '',
          description: '',
          url: '',
          icon: '🔗',
          is_popular: false,
          app_store_url: '',
          play_store_url: '',
          display_order: 0,
          is_active: true
        });
        loadAdminData(true);
      } else {
        alert('Erreur: ' + data.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création du service');
    }
  };

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    try {
      const res = await fetch(`/api/admin/administration/services/${editingService.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceForm)
      });
      const data = await res.json();
      if (data.success) {
        setEditingService(null);
        setShowServiceForm(false);
        loadAdminData(true);
      } else {
        alert('Erreur: ' + data.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour du service');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/administration/services/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        loadAdminData(true);
      } else {
        alert('Erreur: ' + data.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression du service');
    }
  };

  const handleCheckUrls = async (serviceId?: string) => {
    setCheckingUrls(true);
    try {
      const res = await fetch('/api/admin/administration/check-urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: serviceId,
          check_all: !serviceId
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Vérification terminée: ${data.message || 'URLs vérifiées'}`);
        loadAdminData(true);
      } else {
        alert('Erreur: ' + data.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la vérification des URLs');
    } finally {
      setCheckingUrls(false);
    }
  };

  const handleCheckApplicationsHealth = async (moduleId?: string) => {
    setCheckingHealth(true);
    try {
      // Vérifier que l'utilisateur est connecté
      if (!user || !isAuthenticated) {
        alert('Vous devez être connecté pour effectuer cette action');
        setCheckingHealth(false);
        return;
      }

      // Les cookies de session seront automatiquement envoyés avec la requête
      const res = await fetch('/api/admin/applications/check-health', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Inclure les cookies
        body: JSON.stringify({
          module_id: moduleId,
          check_all: !moduleId
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        if (data.results) {
          // Mettre à jour les résultats de santé pour toutes les applications
          const healthMap: Record<string, ApplicationHealthCheck> = {};
          data.results.forEach((result: ApplicationHealthCheck) => {
            healthMap[result.module_id] = result;
          });
          setHealthChecks(healthMap);
        } else {
          // Résultat pour une seule application
          setHealthChecks(prev => ({
            ...prev,
            [data.module_id]: {
              module_id: data.module_id,
              module_name: data.module_name,
              url: data.url,
              isValid: data.isValid,
              statusCode: data.statusCode,
              errorMessage: data.errorMessage,
              responseTime: data.responseTime,
              isCloudflareError: data.isCloudflareError
            }
          }));
        }
      } else {
        alert('Erreur: ' + data.error);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la vérification de la santé des applications');
    } finally {
      setCheckingHealth(false);
    }
  };

  const startEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      icon: category.icon,
      color: category.color,
      description: category.description || '',
      display_order: category.display_order,
      is_active: category.is_active
    });
    setShowCategoryForm(true);
  };

  const startEditService = (service: Service) => {
    setEditingService(service);
    setServiceForm({
      category_id: service.category_id,
      name: service.name,
      description: service.description || '',
      url: service.url,
      icon: service.icon,
      is_popular: service.is_popular,
      app_store_url: service.app_store_url || '',
      play_store_url: service.play_store_url || '',
      display_order: service.display_order,
      is_active: service.is_active
    });
    setShowServiceForm(true);
  };

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
    if (appName.includes('cogstudio') || appName.includes('stablediffusion') || appName.includes('ruinedfooocus')) {
      return '🤖';
    } else if (appName.includes('metube')) {
      return '📺';
    } else if (appName.includes('librespeed')) {
      return '⚡';
    } else if (appName.includes('pdf')) {
      return '📄';
    } else if (appName.includes('qrcodes')) {
      return '📱';
    } else if (appName.includes('psitransfer')) {
      return '📤';
    } else if (appName.includes('home-assistant') || appName.includes('homeassistant')) {
      return '🏠';
    } else if (appName.includes('administration')) {
      return '🏛️';
    } else if (appName.includes('voice') || appName.includes('isolation') || appName.includes('vocale')) {
      return '🎤';
    }
    return '📱';
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-bold text-red-800 mb-2">Accès non autorisé</h2>
          <p className="text-red-700">Vous devez être administrateur pour accéder à cette page.</p>
        </div>
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

      {/* Onglets principaux */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveMainTab('applications')}
              className={`px-6 py-3 font-medium text-sm ${
                activeMainTab === 'applications'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📱 Applications disponibles
            </button>
            <button
              onClick={() => setActiveMainTab('services-admin')}
              className={`px-6 py-3 font-medium text-sm ${
                activeMainTab === 'services-admin'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🏛️ Services admin
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Onglet Applications disponibles */}
          {activeMainTab === 'applications' && (
            <>
              {/* Section de vérification de santé */}
              <div className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      🔍 Vérification de santé des applications
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Vérifiez si toutes les applications sont opérationnelles et ne contiennent pas d'erreurs (404, 502, Cloudflare, etc.)
                    </p>
                    {Object.keys(healthChecks).length > 0 && (
                      <div className="flex items-center gap-4 text-sm mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 font-medium">
                            ✅ {Object.values(healthChecks).filter(h => h.isValid).length} opérationnelles
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-red-600 font-medium">
                            ❌ {Object.values(healthChecks).filter(h => !h.isValid).length} en erreur
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">
                            Total: {Object.keys(healthChecks).length} vérifiées
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleCheckApplicationsHealth()}
                    disabled={checkingHealth}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    {checkingHealth ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Vérification en cours...
                      </>
                    ) : (
                      <>
                        <span className="text-xl">🔍</span>
                        Vérifier toutes les applications
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Statistiques des applications */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
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
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
              ) : (
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

                          {/* Affichage de l'état de santé */}
                          {healthChecks[application.id] && (
                            <div className={`mt-3 p-3 rounded-lg border ${
                              healthChecks[application.id].isValid
                                ? 'bg-green-50 border-green-200'
                                : 'bg-red-50 border-red-200'
                            }`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">
                                    {healthChecks[application.id].isValid ? '✅' : '❌'}
                                  </span>
                                  <div>
                                    <p className="font-medium text-sm">
                                      {healthChecks[application.id].isValid 
                                        ? 'Application opérationnelle' 
                                        : 'Application en erreur'}
                                    </p>
                                    {healthChecks[application.id].url && (
                                      <p className="text-xs text-gray-600 mt-1">
                                        URL: {healthChecks[application.id].url}
                                      </p>
                                    )}
                                    {healthChecks[application.id].statusCode && (
                                      <p className="text-xs text-gray-600">
                                        Status: {healthChecks[application.id].statusCode}
                                      </p>
                                    )}
                                    {healthChecks[application.id].errorMessage && (
                                      <p className="text-xs text-red-600 mt-1">
                                        {healthChecks[application.id].errorMessage}
                                      </p>
                                    )}
                                    {healthChecks[application.id].responseTime && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        Temps de réponse: {healthChecks[application.id].responseTime}ms
                                      </p>
                                    )}
                                    {healthChecks[application.id].isCloudflareError && (
                                      <p className="text-xs text-orange-600 mt-1 font-medium">
                                        ⚠️ Erreur Cloudflare détectée
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleCheckApplicationsHealth(application.id)}
                                  disabled={checkingHealth}
                                  className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                                  title="Revérifier cette application"
                                >
                                  🔄
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Bouton pour vérifier la santé si pas encore vérifiée */}
                          {!healthChecks[application.id] && (
                            <div className="mt-3">
                              <button
                                onClick={() => handleCheckApplicationsHealth(application.id)}
                                disabled={checkingHealth}
                                className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 flex items-center gap-1"
                              >
                                <span>🔍</span>
                                Vérifier la santé de cette application
                              </button>
                            </div>
                          )}

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
              )}
            </>
          )}

          {/* Onglet Services admin */}
          {activeMainTab === 'services-admin' && (
            <>
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  Services Administratifs - Administration
                </h2>
                <p className="text-blue-100">
                  Gérez les catégories et services administratifs, et vérifiez l'état des URLs
                </p>
              </div>

              {/* Sous-onglets Services admin */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="border-b border-gray-200">
                  <nav className="flex -mb-px">
                    <button
                      onClick={() => {
                        setActiveTab('categories');
                        loadAdminData();
                      }}
                      className={`px-6 py-3 font-medium text-sm ${
                        activeTab === 'categories'
                          ? 'border-b-2 border-blue-600 text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      📁 Catégories
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('services');
                        loadAdminData();
                      }}
                      className={`px-6 py-3 font-medium text-sm ${
                        activeTab === 'services'
                          ? 'border-b-2 border-blue-600 text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      🔗 Services
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('url-checks');
                        loadAdminData();
                      }}
                      className={`px-6 py-3 font-medium text-sm ${
                        activeTab === 'url-checks'
                          ? 'border-b-2 border-blue-600 text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      ✅ Vérification URLs
                    </button>
                  </nav>
                </div>

                <div className="p-6">
                  {adminLoading ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <p className="mt-4 text-gray-600">Chargement...</p>
                    </div>
                  ) : (
                    <>
                      {/* Categories Tab */}
                      {activeTab === 'categories' && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Catégories</h2>
                            <button
                              onClick={() => {
                                setEditingCategory(null);
                                setCategoryForm({
                                  name: '',
                                  icon: '📋',
                                  color: 'from-blue-500 to-blue-600',
                                  description: '',
                                  display_order: 0,
                                  is_active: true
                                });
                                setShowCategoryForm(true);
                              }}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                              + Nouvelle catégorie
                            </button>
                          </div>

                          {showCategoryForm && (
                            <form
                              onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
                              className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                            >
                              <h3 className="font-bold mb-4">
                                {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                              </h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium mb-1">Nom *</label>
                                  <input
                                    type="text"
                                    value={categoryForm.name}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">Icône *</label>
                                  <input
                                    type="text"
                                    value={categoryForm.icon}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                                    placeholder="👨‍👩‍👧‍👦"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">Couleur *</label>
                                  <input
                                    type="text"
                                    value={categoryForm.color}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                                    placeholder="from-blue-500 to-blue-600"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">Ordre d'affichage</label>
                                  <input
                                    type="number"
                                    value={categoryForm.display_order}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, display_order: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <label className="block text-sm font-medium mb-1">Description</label>
                                  <textarea
                                    value={categoryForm.description}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                                    rows={3}
                                  />
                                </div>
                                <div>
                                  <label className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={categoryForm.is_active}
                                      onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                                      className="mr-2"
                                    />
                                    Actif
                                  </label>
                                </div>
                              </div>
                              <div className="mt-4 flex gap-2">
                                <button
                                  type="submit"
                                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                >
                                  {editingCategory ? 'Mettre à jour' : 'Créer'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowCategoryForm(false);
                                    setEditingCategory(null);
                                  }}
                                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                                >
                                  Annuler
                                </button>
                              </div>
                            </form>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categories.map((category) => (
                              <div
                                key={category.id}
                                className={`bg-gradient-to-br ${category.color} rounded-lg p-4 text-white`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl">{category.icon}</span>
                                    <h3 className="font-bold">{category.name}</h3>
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => startEditCategory(category)}
                                      className="text-white hover:text-gray-200"
                                      title="Modifier"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => handleDeleteCategory(category.id)}
                                      className="text-white hover:text-red-200"
                                      title="Supprimer"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </div>
                                {category.description && (
                                  <p className="text-sm text-white/90 mb-2">{category.description}</p>
                                )}
                                <div className="text-xs text-white/80">
                                  Ordre: {category.display_order} | {category.is_active ? '✅ Actif' : '❌ Inactif'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Services Tab */}
                      {activeTab === 'services' && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Services</h2>
                            <button
                              onClick={() => {
                                setEditingService(null);
                                setServiceForm({
                                  category_id: categories[0]?.id || '',
                                  name: '',
                                  description: '',
                                  url: '',
                                  icon: '🔗',
                                  is_popular: false,
                                  app_store_url: '',
                                  play_store_url: '',
                                  display_order: 0,
                                  is_active: true
                                });
                                setShowServiceForm(true);
                              }}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                              disabled={categories.length === 0}
                            >
                              + Nouveau service
                            </button>
                          </div>

                          {categories.length === 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
                              ⚠️ Vous devez créer au moins une catégorie avant de pouvoir ajouter des services.
                            </div>
                          )}

                          {showServiceForm && (
                            <form
                              onSubmit={editingService ? handleUpdateService : handleCreateService}
                              className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                            >
                              <h3 className="font-bold mb-4">
                                {editingService ? 'Modifier le service' : 'Nouveau service'}
                              </h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium mb-1">Catégorie *</label>
                                  <select
                                    value={serviceForm.category_id}
                                    onChange={(e) => setServiceForm({ ...serviceForm, category_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                                    required
                                  >
                                    <option value="">Sélectionner une catégorie</option>
                                    {categories.map((cat) => (
                                      <option key={cat.id} value={cat.id}>
                                        {cat.icon} {cat.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">Nom *</label>
                                  <input
                                    type="text"
                                    value={serviceForm.name}
                                    onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                                    required
                                  />
                                </div>
                                <div className="col-span-2">
                                  <label className="block text-sm font-medium mb-1">URL *</label>
                                  <input
                                    type="url"
                                    value={serviceForm.url}
                                    onChange={(e) => setServiceForm({ ...serviceForm, url: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                                    placeholder="https://..."
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">Icône</label>
                                  <input
                                    type="text"
                                    value={serviceForm.icon}
                                    onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                                    placeholder="🔗"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">Ordre d'affichage</label>
                                  <input
                                    type="number"
                                    value={serviceForm.display_order}
                                    onChange={(e) => setServiceForm({ ...serviceForm, display_order: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <label className="block text-sm font-medium mb-1">Description</label>
                                  <textarea
                                    value={serviceForm.description}
                                    onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                                    rows={3}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">App Store URL</label>
                                  <input
                                    type="url"
                                    value={serviceForm.app_store_url}
                                    onChange={(e) => setServiceForm({ ...serviceForm, app_store_url: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                                    placeholder="https://apps.apple.com/..."
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">Play Store URL</label>
                                  <input
                                    type="url"
                                    value={serviceForm.play_store_url}
                                    onChange={(e) => setServiceForm({ ...serviceForm, play_store_url: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                                    placeholder="https://play.google.com/..."
                                  />
                                </div>
                                <div className="col-span-2 flex gap-4">
                                  <label className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={serviceForm.is_popular}
                                      onChange={(e) => setServiceForm({ ...serviceForm, is_popular: e.target.checked })}
                                      className="mr-2"
                                    />
                                    Service populaire
                                  </label>
                                  <label className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={serviceForm.is_active}
                                      onChange={(e) => setServiceForm({ ...serviceForm, is_active: e.target.checked })}
                                      className="mr-2"
                                    />
                                    Actif
                                  </label>
                                </div>
                              </div>
                              <div className="mt-4 flex gap-2">
                                <button
                                  type="submit"
                                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                >
                                  {editingService ? 'Mettre à jour' : 'Créer'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowServiceForm(false);
                                    setEditingService(null);
                                  }}
                                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                                >
                                  Annuler
                                </button>
                              </div>
                            </form>
                          )}

                          <div className="space-y-4">
                            {services.map((service) => (
                              <div
                                key={service.id}
                                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-2xl">{service.icon}</span>
                                      <h3 className="font-bold text-lg">{service.name}</h3>
                                      {service.is_popular && (
                                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                          ⭐ Populaire
                                        </span>
                                      )}
                                    </div>
                                    {service.description && (
                                      <p className="text-gray-600 mb-2">{service.description}</p>
                                    )}
                                    <div className="flex flex-wrap gap-2 text-sm">
                                      <a
                                        href={service.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                      >
                                        🔗 {service.url}
                                      </a>
                                      {service.category && (
                                        <span className="text-gray-500">
                                          | Catégorie: {service.category.icon} {service.category.name}
                                        </span>
                                      )}
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500">
                                      Ordre: {service.display_order} | {service.is_active ? '✅ Actif' : '❌ Inactif'}
                                    </div>
                                  </div>
                                  <div className="flex gap-2 ml-4">
                                    <button
                                      onClick={() => handleCheckUrls(service.id)}
                                      className="text-blue-600 hover:text-blue-800"
                                      title="Vérifier l'URL"
                                    >
                                      ✅
                                    </button>
                                    <button
                                      onClick={() => startEditService(service)}
                                      className="text-gray-600 hover:text-gray-800"
                                      title="Modifier"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => handleDeleteService(service.id)}
                                      className="text-red-600 hover:text-red-800"
                                      title="Supprimer"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* URL Checks Tab */}
                      {activeTab === 'url-checks' && (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Vérification des URLs</h2>
                            <button
                              onClick={() => handleCheckUrls()}
                              disabled={checkingUrls}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                              {checkingUrls ? 'Vérification en cours...' : '✅ Vérifier toutes les URLs'}
                            </button>
                          </div>

                          <div className="space-y-2">
                            {urlChecks.map((check) => (
                              <div
                                key={check.id}
                                className={`border rounded-lg p-4 ${
                                  check.is_valid
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-red-50 border-red-200'
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xl">
                                        {check.is_valid ? '✅' : '❌'}
                                      </span>
                                      <h3 className="font-bold">
                                        {check.service?.name || 'Service inconnu'}
                                      </h3>
                                      {check.status_code && (
                                        <span className="text-sm text-gray-600">
                                          (Status: {check.status_code})
                                        </span>
                                      )}
                                    </div>
                                    <a
                                      href={check.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline text-sm"
                                    >
                                      {check.url}
                                    </a>
                                    {check.error_message && (
                                      <p className="text-red-600 text-sm mt-1">{check.error_message}</p>
                                    )}
                                    {check.response_time_ms && (
                                      <p className="text-gray-500 text-xs mt-1">
                                        Temps de réponse: {check.response_time_ms}ms
                                      </p>
                                    )}
                                    <p className="text-gray-500 text-xs mt-1">
                                      Vérifié le: {new Date(check.last_checked_at).toLocaleString('fr-FR')}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => handleCheckUrls(check.service_id)}
                                    disabled={checkingUrls}
                                    className="text-blue-600 hover:text-blue-800 ml-4"
                                    title="Revérifier"
                                  >
                                    🔄
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {urlChecks.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                              Aucune vérification d'URL enregistrée. Cliquez sur "Vérifier toutes les URLs" pour commencer.
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
