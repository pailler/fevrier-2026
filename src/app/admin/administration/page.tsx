'use client';

import { useState, useEffect } from 'react';
import { useCustomAuth } from '@/hooks/useCustomAuth';

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

export default function AdministrationAdminPage() {
  const { user, isAuthenticated } = useCustomAuth();
  const [activeTab, setActiveTab] = useState<'categories' | 'services' | 'url-checks'>('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [urlChecks, setUrlChecks] = useState<UrlCheck[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadData();
    }
  }, [isAuthenticated, user, activeTab]);

  const loadData = async (forceAll = false) => {
    setLoading(true);
    try {
      // Ajouter un timestamp pour éviter le cache
      const timestamp = Date.now();
      
      // Si forceAll est true, charger toutes les données
      // Sinon, charger seulement l'onglet actif
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
      setLoading(false);
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
        // Recharger toutes les données car les catégories affectent aussi les services
        loadData(true);
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
        // Recharger toutes les données car les catégories affectent aussi les services
        loadData(true);
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
        // Recharger toutes les données car la suppression d'une catégorie supprime aussi ses services
        loadData(true);
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
        // Recharger toutes les données (services et url-checks)
        loadData(true);
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
        // Recharger toutes les données (services et url-checks)
        loadData(true);
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
        // Recharger toutes les données (services et url-checks)
        loadData(true);
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
        // Recharger toutes les données (services et url-checks)
        loadData(true);
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

  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-lg font-bold text-yellow-800 mb-2">Authentification requise</h2>
          <p className="text-yellow-700">Vous devez être connecté pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-bold text-red-800 mb-2">Accès non autorisé</h2>
          <p className="text-red-700">Vous devez être administrateur pour accéder à cette page.</p>
          <p className="text-sm text-red-600 mt-2">Rôle actuel: {user?.role || 'non défini'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Services Administratifs - Administration
        </h1>
        <p className="text-blue-100">
          Gérez les catégories et services administratifs, et vérifiez l'état des URLs
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => {
                setActiveTab('categories');
                loadData();
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
                loadData();
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
                loadData();
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
          {loading ? (
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
    </div>
  );
}

