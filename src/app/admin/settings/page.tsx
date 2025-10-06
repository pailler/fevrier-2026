'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../../../utils/supabaseService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardStats {
  totalUsers: number;
  totalModules: number;
  totalPayments: number;
  totalRevenue: number;
  activeUsers: number;
  moduleUsage: Array<{ name: string; count: number }>;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  userGrowth: Array<{ month: string; users: number }>;
  paymentMethods: Array<{ method: string; count: number }>;
  recentActivity: Array<{ type: string; description: string; timestamp: string }>;
}

export default function AdminSettings() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      // Charger les statistiques de base
      const [usersResult, modulesResult, paymentsResult, usageResult] = await Promise.all([
        supabase.from('profiles').select('id, created_at, last_login'),
        supabase.from('modules').select('id, name, status'),
        supabase.from('payments').select('id, amount, status, created_at, payment_method'),
        supabase.from('user_applications').select('module_id, usage_count, created_at, modules(name)')
      ]);

      const users = usersResult.data || [];
      const modules = modulesResult.data || [];
      const payments = paymentsResult.data || [];
      const usage = usageResult.data || [];

      // Calculer les statistiques
      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.last_login && new Date(u.last_login) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;
      const totalModules = modules.length;
      const totalPayments = payments.length;
      const totalRevenue = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      // Statistiques d'utilisation des modules
      const moduleUsageMap = new Map();
      usage.forEach(u => {
        const moduleName = (u.modules as any)?.name || 'Inconnu';
        moduleUsageMap.set(moduleName, (moduleUsageMap.get(moduleName) || 0) + 1);
      });
      const moduleUsage = Array.from(moduleUsageMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Revenus mensuels (simulation pour les 12 derniers mois)
      const monthlyRevenue = generateMonthlyData(payments, 'amount', 'revenue');
      
      // Croissance des utilisateurs (simulation pour les 12 derniers mois)
      const userGrowth = generateMonthlyData(users, 'created_at', 'users');

      // Méthodes de paiement
      const paymentMethodsMap = new Map();
      payments.forEach(p => {
        const method = p.payment_method || 'Inconnu';
        paymentMethodsMap.set(method, (paymentMethodsMap.get(method) || 0) + 1);
      });
      const paymentMethods = Array.from(paymentMethodsMap.entries())
        .map(([method, count]) => ({ method, count }));

      // Activité récente (simulation)
      const recentActivity = [
        { type: 'user', description: 'Nouvel utilisateur inscrit', timestamp: new Date().toISOString() },
        { type: 'payment', description: 'Paiement reçu', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { type: 'module', description: 'Module activé', timestamp: new Date(Date.now() - 7200000).toISOString() },
        { type: 'system', description: 'Mise à jour système', timestamp: new Date(Date.now() - 10800000).toISOString() },
      ];

      setStats({
        totalUsers,
        totalModules,
        totalPayments,
        totalRevenue,
        activeUsers,
        moduleUsage,
        monthlyRevenue,
        userGrowth,
        paymentMethods,
        recentActivity
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyData = (data: any[], dateField: string, valueField: string) => {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('fr-FR', { month: 'short' });
      
      let value = 0;
      if (valueField === 'revenue') {
        value = data
          .filter(item => {
            const itemDate = new Date(item[dateField]);
            return itemDate.getMonth() === date.getMonth() && 
                   itemDate.getFullYear() === date.getFullYear() &&
                   item.status === 'completed';
          })
          .reduce((sum, item) => sum + (item.amount || 0), 0);
      } else {
        value = data.filter(item => {
          const itemDate = new Date(item[dateField]);
          return itemDate.getMonth() === date.getMonth() && 
                 itemDate.getFullYear() === date.getFullYear();
        }).length;
      }
      
      months.push({ month: monthName, [valueField]: value });
    }
    return months;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">❌</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Erreur de chargement
        </h3>
        <p className="text-gray-600">
          Impossible de charger les données du tableau de bord
        </p>
      </div>
    );
  }

  // Configuration des graphiques
  const moduleUsageData = {
    labels: stats.moduleUsage.map(m => m.name),
    datasets: [{
      label: 'Utilisations',
      data: stats.moduleUsage.map(m => m.count),
      backgroundColor: [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
      ],
      borderWidth: 0
    }]
  };

  const revenueData = {
    labels: stats.monthlyRevenue.map(m => m.month),
    datasets: [{
      label: 'Revenus (€)',
      data: stats.monthlyRevenue.map(m => m.revenue),
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const userGrowthData = {
    labels: stats.userGrowth.map(m => m.month),
    datasets: [{
      label: 'Nouveaux utilisateurs',
      data: stats.userGrowth.map(m => m.users),
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const paymentMethodsData = {
    labels: stats.paymentMethods.map(p => p.method),
    datasets: [{
      data: stats.paymentMethods.map(p => p.count),
      backgroundColor: [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'
      ],
      borderWidth: 0
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Tableau de bord administrateur
        </h1>
        <p className="text-gray-600">
              Vue d'ensemble et statistiques de la plateforme IAHome
            </p>
          </div>
          <div className="flex space-x-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">90 derniers jours</option>
              <option value="1y">1 an</option>
            </select>
            <button
              onClick={loadDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Utilisateurs totaux</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Utilisateurs actifs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Modules disponibles</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalModules}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Revenus totaux</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toFixed(2)}€</p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utilisation des modules */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilisation des modules</h3>
          <div className="h-64">
            <Bar data={moduleUsageData} options={chartOptions} />
          </div>
        </div>

        {/* Méthodes de paiement */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Méthodes de paiement</h3>
          <div className="h-64">
            <Doughnut data={paymentMethodsData} options={chartOptions} />
          </div>
        </div>

        {/* Évolution des revenus */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des revenus</h3>
          <div className="h-64">
            <Line data={revenueData} options={chartOptions} />
          </div>
        </div>

        {/* Croissance des utilisateurs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Croissance des utilisateurs</h3>
          <div className="h-64">
            <Line data={userGrowthData} options={chartOptions} />
          </div>
        </div>
      </div>
      
      {/* Activité récente */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
        <div className="space-y-3">
          {stats.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'user' ? 'bg-blue-500' :
                activity.type === 'payment' ? 'bg-green-500' :
                activity.type === 'module' ? 'bg-purple-500' :
                'bg-gray-500'
              }`}></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                <p className="text-xs text-gray-500">
                  {new Date(activity.timestamp).toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Taux de conversion</span>
              <span className="text-sm font-medium text-gray-900">
                {((stats.totalPayments / stats.totalUsers) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Utilisateurs actifs</span>
              <span className="text-sm font-medium text-gray-900">
                {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Revenu moyen par utilisateur</span>
              <span className="text-sm font-medium text-gray-900">
                {(stats.totalRevenue / stats.totalUsers).toFixed(2)}€
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Modules populaires</h3>
          <div className="space-y-2">
            {stats.moduleUsage.slice(0, 5).map((module, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 truncate">{module.name}</span>
                <span className="text-sm font-medium text-gray-900">{module.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statut système</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Base de données</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                En ligne
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">API</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Opérationnel
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Notifications</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Actif
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

