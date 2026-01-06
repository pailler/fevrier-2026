'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/utils/supabaseService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Home, TrendingUp, Bell, Euro } from 'lucide-react';

interface Statistics {
  totalProperties: number;
  newProperties: number;
  favoriteProperties: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  bySource: Record<string, any>;
  byMonth: Record<string, any>;
  searchStats: {
    totalSearches: number;
    totalPropertiesFound: number;
    totalNewProperties: number;
    successfulSearches: number;
  };
}

export default function RealEstateDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadStatistics();
    }
  }, [user, days]);

  const checkAuth = async () => {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);
  };

  const loadStatistics = async () => {
    try {
      const response = await fetch(`/api/real-estate/statistics?days=${days}`);
      const data = await response.json();
      if (data.statistics) {
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentification requise</h1>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Aucune donnée disponible</p>
      </div>
    );
  }

  // Préparer les données pour les graphiques
  const sourceData = Object.entries(statistics.bySource).map(([source, data]: [string, any]) => ({
    source,
    total: data.total,
    nouveaux: data.new,
    favoris: data.favorites
  }));

  const monthData = Object.entries(statistics.byMonth)
    .sort()
    .map(([month, data]: [string, any]) => ({
      month,
      total: data.total,
      nouveaux: data.new
    }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Recherche Immobilière</h1>
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="7">7 derniers jours</option>
            <option value="30">30 derniers jours</option>
            <option value="90">3 derniers mois</option>
            <option value="180">6 derniers mois</option>
            <option value="365">1 an</option>
          </select>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total biens</p>
                <p className="text-2xl font-bold mt-2">{statistics.totalProperties}</p>
              </div>
              <Home className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nouveaux biens</p>
                <p className="text-2xl font-bold mt-2 text-green-600">{statistics.newProperties}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Favoris</p>
                <p className="text-2xl font-bold mt-2 text-red-600">{statistics.favoriteProperties}</p>
              </div>
              <Bell className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Prix moyen</p>
                <p className="text-2xl font-bold mt-2">
                  {Math.round(statistics.averagePrice).toLocaleString('fr-FR')} €
                </p>
              </div>
              <Euro className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Statistiques de recherche */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Statistiques de recherche</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Recherches effectuées</p>
              <p className="text-2xl font-bold">{statistics.searchStats.totalSearches}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Biens trouvés</p>
              <p className="text-2xl font-bold">{statistics.searchStats.totalPropertiesFound}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Nouveaux biens</p>
              <p className="text-2xl font-bold text-green-600">{statistics.searchStats.totalNewProperties}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Taux de succès</p>
              <p className="text-2xl font-bold">
                {statistics.searchStats.totalSearches > 0
                  ? Math.round((statistics.searchStats.successfulSearches / statistics.searchStats.totalSearches) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Biens par source */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Biens par source</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sourceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#2563eb" name="Total" />
                <Bar dataKey="nouveaux" fill="#10b981" name="Nouveaux" />
                <Bar dataKey="favoris" fill="#ef4444" name="Favoris" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Évolution mensuelle */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Évolution mensuelle</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#2563eb" name="Total" />
                <Line type="monotone" dataKey="nouveaux" stroke="#10b981" name="Nouveaux" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plage de prix */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Plage de prix</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Prix minimum</p>
              <p className="text-xl font-bold">{statistics.minPrice.toLocaleString('fr-FR')} €</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Prix moyen</p>
              <p className="text-xl font-bold">{Math.round(statistics.averagePrice).toLocaleString('fr-FR')} €</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Prix maximum</p>
              <p className="text-xl font-bold">{statistics.maxPrice.toLocaleString('fr-FR')} €</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
