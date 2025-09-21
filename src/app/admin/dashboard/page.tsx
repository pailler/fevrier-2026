'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import StatCard from '../../../components/admin/StatCard';
import LineChart from '../../../components/admin/LineChart';
import PieChart from '../../../components/admin/PieChart';
import BarChart from '../../../components/admin/BarChart';
import ToggleSwitch from '../../../components/admin/ToggleSwitch';
import AdminGuard from '../../../components/admin/AdminGuard';
import RealTimeStats from '../../../components/admin/RealTimeStats';
import SystemControls from '../../../components/admin/SystemControls';

// Icônes SVG
const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const ArticleIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ModuleIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const ActivityIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

interface Statistics {
  overview: {
    totalUsers: number;
    newUsers30d: number;
    newUsers7d: number;
    activeUsers24h: number;
    adminUsers: number;
    userGrowthRate: number;
  };
  content: {
    totalArticles: number;
    publishedArticles: number;
    totalViews: number;
    avgViewsPerArticle: number;
    articleGrowthRate: number;
    totalModules: number;
    activeModules: number;
    totalModuleAccess: number;
    moduleUsageRate: number;
    totalFormations: number;
    difficultyStats: Record<string, number>;
  };
  social: {
    totalLinkedInPosts: number;
    publishedLinkedInPosts: number;
    totalEngagement: number;
  };
  system: {
    totalMenus: number;
    totalMenuItems: number;
    totalPages: number;
    publishedPages: number;
    totalTokens: number;
    activeTokens: number;
    newTokens30d: number;
    expiringTokens7d: number;
  };
  charts: {
    userGrowth: Array<{ date: string; users: number }>;
    pageViews: Array<{ date: string; views: number }>;
    topModules: Array<{ title: string; access_count: number }>;
    recentArticles: Array<{ title: string; created_at: string }>;
  };
  recentActivity: Array<{ id: string; last_sign_in_at: string }>;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function AdminDashboardContent() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    userRegistration: true,
    moduleAccess: true,
    analytics: true,
    notifications: true
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);
        await fetchStatistics();
      }
    } catch (error) {
      console.error('Erreur d\'authentification:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      setStatsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('/api/admin/statistics', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      } else {
        console.error('Erreur lors de la récupération des statistiques');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleStatsUpdate = (newStats: Statistics) => {
    setStatistics(newStats);
  };


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tableau de bord administrateur</h1>
              <p className="mt-1 text-sm text-gray-500">
                Vue d'ensemble des statistiques et de l'activité du site
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchStatistics}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ActivityIcon />
                <span className="ml-2">Actualiser</span>
              </button>
              <RealTimeStats 
                onStatsUpdate={handleStatsUpdate}
                refreshInterval={30000}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Utilisateurs totaux"
            value={statistics?.overview.totalUsers || 0}
            change={statistics?.overview.userGrowthRate}
            changeType={statistics?.overview.userGrowthRate && statistics.overview.userGrowthRate > 0 ? 'positive' : 'negative'}
            icon={<UsersIcon />}
            color="blue"
            loading={statsLoading}
          />
          <StatCard
            title="Articles publiés"
            value={statistics?.content.publishedArticles || 0}
            change={statistics?.content.articleGrowthRate}
            changeType={statistics?.content.articleGrowthRate && statistics.content.articleGrowthRate > 0 ? 'positive' : 'negative'}
            icon={<ArticleIcon />}
            color="green"
            loading={statsLoading}
          />
          <StatCard
            title="Modules actifs"
            value={statistics?.content.activeModules || 0}
            change={statistics?.content.moduleUsageRate}
            changeType={statistics?.content.moduleUsageRate && statistics.content.moduleUsageRate > 0 ? 'positive' : 'negative'}
            icon={<ModuleIcon />}
            color="purple"
            loading={statsLoading}
          />
          <StatCard
            title="Vues totales"
            value={statistics?.content.totalViews || 0}
            icon={<EyeIcon />}
            color="yellow"
            loading={statsLoading}
          />
        </div>

        {/* Graphiques principaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <LineChart
            data={statistics?.charts.userGrowth || []}
            title="Croissance des utilisateurs (30 derniers jours)"
            color="#3B82F6"
            loading={statsLoading}
          />
          <LineChart
            data={statistics?.charts.pageViews || []}
            title="Pages vues (7 derniers jours)"
            color="#10B981"
            loading={statsLoading}
          />
        </div>

        {/* Métriques détaillées */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <BarChart
              data={statistics?.charts.topModules.map(module => ({
                label: module.title,
                value: module.access_count || 0,
                color: '#8B5CF6'
              })) || []}
              title="Modules les plus utilisés"
              loading={statsLoading}
            />
          </div>
          <div>
            <PieChart
              data={Object.entries(statistics?.content.difficultyStats || {}).map(([difficulty, count], index) => ({
                label: difficulty,
                value: count,
                color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 4]
              }))}
              title="Répartition des formations par difficulté"
              loading={statsLoading}
            />
          </div>
        </div>

        {/* Métriques secondaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Nouveaux utilisateurs (30j)"
            value={statistics?.overview.newUsers30d || 0}
            icon={<UsersIcon />}
            color="green"
            loading={statsLoading}
          />
          <StatCard
            title="Utilisateurs actifs (24h)"
            value={statistics?.overview.activeUsers24h || 0}
            icon={<ActivityIcon />}
            color="blue"
            loading={statsLoading}
          />
          <StatCard
            title="Tokens actifs"
            value={statistics?.system.activeTokens || 0}
            icon={<SettingsIcon />}
            color="purple"
            loading={statsLoading}
          />
          <StatCard
            title="Pages publiées"
            value={statistics?.system.publishedPages || 0}
            icon={<ArticleIcon />}
            color="yellow"
            loading={statsLoading}
          />
        </div>

        {/* Contrôles du cache */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Gestion du cache
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Cache buster actuel</h3>
              <p className="text-sm text-blue-700 font-mono">{Date.now()}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Dernière mise à jour</h3>
              <p className="text-sm text-green-700">{new Date().toLocaleString('fr-FR')}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">Actions rapides</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    window.location.href = '/force-refresh';
                  }}
                  className="w-full px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                >
                  🔄 Forcer le refresh
                </button>
                <button
                  onClick={() => {
                    window.location.reload();
                  }}
                  className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  🔄 Recharger la page
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Paramètres système */}
        <SystemControls
          settings={settings}
          onSettingChange={handleSettingChange}
          loading={statsLoading}
        />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  );
}
