'use client';

import { useState, useEffect } from 'react';
import { useCustomAuth } from '@/hooks/useCustomAuth';
import { getSupabaseClient } from '@/utils/supabaseService';
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
import { Line, Bar } from 'react-chartjs-2';

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

interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  format: 'image' | 'video' | 'carousel';
  budget: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  objectives: {
    impressions: string;
    clicks: string;
    ctr: string;
    cpc: string;
    conversions: string;
    cpl: string;
    purchases: string;
    cpa: string;
    roi: string;
  };
  audience: {
    size: string;
    location: string;
    interests: string[];
  };
  creative: {
    type: string;
    specifications: string;
    text: string;
    cta: string;
  };
  duration: string;
  expectedResults: {
    week1: string;
    week2: string;
    week3: string;
    week4: string;
  };
}

const facebookTemplates: CampaignTemplate[] = [
  {
    id: 'metube-gratuit',
    name: 'MeTube - Focus Gratuit',
    description: 'Campagne axée sur l\'offre gratuite (100 tokens offerts) pour maximiser les inscriptions',
    format: 'image',
    budget: {
      daily: 10,
      weekly: 70,
      monthly: 300
    },
    objectives: {
      impressions: '50 000 - 60 000',
      clicks: '1 000 - 1 500',
      ctr: '2,0% - 2,5%',
      cpc: '0,30€ - 0,50€',
      conversions: '50 - 100 inscriptions',
      cpl: '2,00€ - 3,00€',
      purchases: '5 - 10 achats',
      cpa: '15€ - 30€',
      roi: '200% - 400%'
    },
    audience: {
      size: '500k - 2M personnes',
      location: 'France, Belgique, Suisse',
      interests: ['YouTube', 'Téléchargement vidéo', 'Technologie', 'Informatique']
    },
    creative: {
      type: 'Image 1080x1080px',
      specifications: 'Format carré, couleurs vives (rouge/blanc), texte clair',
      text: '🎥 Téléchargez vos vidéos YouTube préférées GRATUITEMENT\n\n✅ 100 tokens offerts à l\'inscription\n✅ Sans logiciel à installer\n✅ Sans publicité\n✅ 100% Privé et sécurisé',
      cta: 'Essayer maintenant'
    },
    duration: '30 jours minimum',
    expectedResults: {
      week1: '50-100 inscriptions, 5-10 achats',
      week2: '100-150 inscriptions, 10-15 achats',
      week3: '150-200 inscriptions, 20-30 achats',
      week4: '200-300 inscriptions, 30-50 achats'
    }
  },
  {
    id: 'metube-prive',
    name: 'MeTube - Focus Privé',
    description: 'Campagne axée sur la confidentialité et la sécurité pour cibler les utilisateurs soucieux de leur vie privée',
    format: 'image',
    budget: {
      daily: 12,
      weekly: 84,
      monthly: 360
    },
    objectives: {
      impressions: '40 000 - 50 000',
      clicks: '800 - 1 200',
      ctr: '2,0% - 2,4%',
      cpc: '0,35€ - 0,55€',
      conversions: '40 - 80 inscriptions',
      cpl: '2,50€ - 3,50€',
      purchases: '4 - 8 achats',
      cpa: '18€ - 35€',
      roi: '180% - 350%'
    },
    audience: {
      size: '300k - 1M personnes',
      location: 'France, Belgique, Suisse',
      interests: ['Vie privée', 'Sécurité informatique', 'Open-source', 'Technologie']
    },
    creative: {
      type: 'Image 1080x1080px',
      specifications: 'Format carré, couleurs sombres (bleu foncé/blanc), icône cadenas',
      text: '🔒 Téléchargez YouTube en toute PRIVACITÉ\n\n✅ Ne collecte AUCUNE donnée\n✅ N\'affiche AUCUNE publicité\n✅ Fonctionne sur VOS serveurs\n✅ Open-source et transparent',
      cta: 'Découvrir MeTube'
    },
    duration: '30 jours minimum',
    expectedResults: {
      week1: '40-80 inscriptions, 4-8 achats',
      week2: '80-120 inscriptions, 8-12 achats',
      week3: '120-180 inscriptions, 15-25 achats',
      week4: '180-250 inscriptions, 25-40 achats'
    }
  },
  {
    id: 'metube-video',
    name: 'MeTube - Vidéo Démo',
    description: 'Campagne avec vidéo de démonstration pour maximiser l\'engagement et les conversions',
    format: 'video',
    budget: {
      daily: 15,
      weekly: 105,
      monthly: 450
    },
    objectives: {
      impressions: '60 000 - 80 000',
      clicks: '1 500 - 2 500',
      ctr: '2,5% - 3,5%',
      cpc: '0,25€ - 0,40€',
      conversions: '75 - 150 inscriptions',
      cpl: '1,50€ - 2,50€',
      purchases: '8 - 15 achats',
      cpa: '12€ - 25€',
      roi: '300% - 500%'
    },
    audience: {
      size: '800k - 2M personnes',
      location: 'France, Belgique, Suisse',
      interests: ['YouTube', 'Création de contenu', 'Technologie', 'Tutoriels']
    },
    creative: {
      type: 'Vidéo 30 secondes',
      specifications: 'Format MP4, 1080p, ratio 1:1 ou 16:9, sous-titres recommandés',
      text: '🎥 Découvrez MeTube en action\n\nRegardez comment télécharger vos vidéos YouTube en quelques clics.\n\n✅ Simple et rapide\n✅ 100 tokens offerts\n✅ Sans logiciel',
      cta: 'Regarder la démo'
    },
    duration: '30 jours minimum',
    expectedResults: {
      week1: '75-150 inscriptions, 8-15 achats',
      week2: '150-250 inscriptions, 15-25 achats',
      week3: '250-400 inscriptions, 30-50 achats',
      week4: '400-600 inscriptions, 50-80 achats'
    }
  },
  {
    id: 'metube-carousel',
    name: 'MeTube - Carrousel Avantages',
    description: 'Campagne avec carrousel pour présenter tous les avantages de MeTube de manière visuelle',
    format: 'carousel',
    budget: {
      daily: 12,
      weekly: 84,
      monthly: 360
    },
    objectives: {
      impressions: '45 000 - 55 000',
      clicks: '900 - 1 400',
      ctr: '2,0% - 2,8%',
      cpc: '0,30€ - 0,45€',
      conversions: '45 - 90 inscriptions',
      cpl: '2,00€ - 3,00€',
      purchases: '5 - 9 achats',
      cpa: '15€ - 30€',
      roi: '200% - 400%'
    },
    audience: {
      size: '600k - 1,5M personnes',
      location: 'France, Belgique, Suisse',
      interests: ['YouTube', 'Téléchargement', 'Technologie', 'Informatique']
    },
    creative: {
      type: 'Carrousel 5 cartes',
      specifications: '5 images 1080x1080px : Titre, Avantage 1, Avantage 2, Avantage 3, CTA',
      text: '🎥 Découvrez tous les avantages de MeTube\n\nSwipez pour voir pourquoi MeTube est la meilleure solution pour télécharger YouTube.',
      cta: 'Découvrir les avantages'
    },
    duration: '30 jours minimum',
    expectedResults: {
      week1: '45-90 inscriptions, 5-9 achats',
      week2: '90-140 inscriptions, 10-15 achats',
      week3: '140-220 inscriptions, 18-30 achats',
      week4: '220-350 inscriptions, 30-50 achats'
    }
  },
  {
    id: 'metube-simplicite',
    name: 'MeTube - Focus Simplicité',
    description: 'Campagne axée sur la facilité d\'utilisation pour cibler les utilisateurs non techniques',
    format: 'image',
    budget: {
      daily: 10,
      weekly: 70,
      monthly: 300
    },
    objectives: {
      impressions: '50 000 - 60 000',
      clicks: '1 000 - 1 500',
      ctr: '2,0% - 2,5%',
      cpc: '0,30€ - 0,50€',
      conversions: '50 - 100 inscriptions',
      cpl: '2,00€ - 3,00€',
      purchases: '5 - 10 achats',
      cpa: '15€ - 30€',
      roi: '200% - 400%'
    },
    audience: {
      size: '700k - 2M personnes',
      location: 'France, Belgique, Suisse',
      interests: ['YouTube', 'Tutoriels', 'Apprentissage', 'Technologie grand public']
    },
    creative: {
      type: 'Image 1080x1080px',
      specifications: 'Format carré, design épuré, icônes simples, texte minimal',
      text: '📹 Téléchargez YouTube en 1 CLIC\n\n✅ Collez l\'URL YouTube\n✅ Choisissez le format\n✅ Téléchargez !\n\n100 tokens offerts pour commencer.',
      cta: 'Essayer maintenant'
    },
    duration: '30 jours minimum',
    expectedResults: {
      week1: '50-100 inscriptions, 5-10 achats',
      week2: '100-150 inscriptions, 10-15 achats',
      week3: '150-200 inscriptions, 20-30 achats',
      week4: '200-300 inscriptions, 30-50 achats'
    }
  }
];

const googleTemplates: CampaignTemplate[] = [];

interface ActiveCampaign {
  id: string;
  name: string;
  platform: string;
  template_id?: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  budget_daily: number;
  budget_total?: number;
  spent: number;
  start_date?: string;
  end_date?: string;
  impressions: number;
  clicks: number;
  conversions: number;
  purchases: number;
  revenue: number;
  ctr: number;
  cpc: number;
  cpl: number;
  cpa: number;
  roi: number;
  created_at: string;
  updated_at: string;
  tags?: string[];
  category?: string;
  target_impressions?: number;
  target_clicks?: number;
  target_conversions?: number;
  target_purchases?: number;
  target_roi?: number;
}

interface CampaignHistory {
  id: string;
  campaign_id: string;
  impressions: number;
  clicks: number;
  conversions: number;
  purchases: number;
  spent: number;
  revenue: number;
  ctr: number;
  cpc: number;
  cpl: number;
  cpa: number;
  roi: number;
  created_at: string;
}

export default function AdminCampaigns() {
  const { user, isAuthenticated } = useCustomAuth();
  const [activeTab, setActiveTab] = useState<'facebook' | 'google' | 'overview' | 'active'>('overview');
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);
  const [activeCampaigns, setActiveCampaigns] = useState<ActiveCampaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'compare' | 'charts'>('list');
  const [campaignHistory, setCampaignHistory] = useState<Record<string, CampaignHistory[]>>({});
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    platform: 'facebook',
    template_id: '',
    budget_daily: 10,
    budget_total: '',
    start_date: '',
    end_date: '',
    audience_size: '',
    audience_location: 'France, Belgique, Suisse',
    creative_type: '',
    landing_page_url: 'https://iahome.fr/card/metube',
    notes: '',
    tags: '',
    category: ''
  });

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadActiveCampaigns();
    }
  }, [isAuthenticated, user]);

  const loadActiveCampaigns = async () => {
    try {
      setLoadingCampaigns(true);
      const response = await fetch('/api/admin/campaigns');
      if (response.ok) {
        const data = await response.json();
        setActiveCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Erreur chargement campagnes:', error);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const handleCreateCampaign = async () => {
    try {
      const response = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCampaign,
          created_by: user?.id,
          budget_total: newCampaign.budget_total ? parseFloat(newCampaign.budget_total) : null,
          tags: newCampaign.tags ? newCampaign.tags.split(',').map(t => t.trim()).filter(t => t) : [],
          category: newCampaign.category || null
        })
      });

      if (response.ok) {
        await loadActiveCampaigns();
        setShowCreateForm(false);
        setNewCampaign({
          name: '',
          platform: 'facebook',
          template_id: '',
          budget_daily: 10,
          budget_total: '',
          start_date: '',
          end_date: '',
          audience_size: '',
          audience_location: 'France, Belgique, Suisse',
          creative_type: '',
          landing_page_url: 'https://iahome.fr/card/metube',
          notes: '',
          tags: '',
          category: ''
        });
        alert('Campagne créée avec succès !');
      } else {
        alert('Erreur lors de la création de la campagne');
      }
    } catch (error) {
      console.error('Erreur création campagne:', error);
      alert('Erreur lors de la création de la campagne');
    }
  };

  const handleUpdateCampaignStatus = async (campaignId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        await loadActiveCampaigns();
      }
    } catch (error) {
      console.error('Erreur mise à jour campagne:', error);
    }
  };

  const handleUpdateCampaignMetrics = async (campaignId: string, metrics: any) => {
    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics)
      });

      if (response.ok) {
        await loadActiveCampaigns();
      }
    } catch (error) {
      console.error('Erreur mise à jour métriques:', error);
    }
  };

  if (!isAuthenticated || !user || user.role !== 'admin') {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'active': return 'Active';
      case 'paused': return 'En pause';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const loadCampaignHistory = async (campaignId: string) => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('advertising_campaigns_history')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setCampaignHistory(prev => ({ ...prev, [campaignId]: data }));
      }
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Nom', 'Plateforme', 'Statut', 'Budget/Jour', 'Dépensé', 'Budget Total',
      'Impressions', 'Clics', 'CTR', 'CPC', 'Conversions', 'CPL', 'Achats', 'CPA', 'ROI', 'Revenu',
      'Date début', 'Date fin', 'Tags', 'Catégorie', 'Créé le'
    ];

    const rows = activeCampaigns.map(campaign => [
      campaign.name,
      campaign.platform,
      getStatusLabel(campaign.status),
      campaign.budget_daily.toString(),
      campaign.spent.toString(),
      campaign.budget_total?.toString() || '',
      campaign.impressions.toString(),
      campaign.clicks.toString(),
      campaign.ctr.toFixed(2) + '%',
      campaign.cpc.toFixed(2) + '€',
      campaign.conversions.toString(),
      campaign.cpl.toFixed(2) + '€',
      campaign.purchases.toString(),
      campaign.cpa.toFixed(2) + '€',
      campaign.roi.toFixed(2) + '%',
      campaign.revenue.toFixed(2) + '€',
      campaign.start_date || '',
      campaign.end_date || '',
      (campaign.tags || []).join(', '),
      campaign.category || '',
      new Date(campaign.created_at).toLocaleDateString('fr-FR')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `campagnes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAlerts = (campaign: ActiveCampaign) => {
    const alerts: Array<{ type: 'warning' | 'error' | 'info'; message: string }> = [];

    // Budget dépassé
    if (campaign.budget_total && campaign.spent >= campaign.budget_total * 0.9) {
      alerts.push({
        type: campaign.spent >= campaign.budget_total ? 'error' : 'warning',
        message: `Budget ${campaign.spent >= campaign.budget_total ? 'dépassé' : 'presque épuisé'} (${((campaign.spent / campaign.budget_total) * 100).toFixed(1)}%)`
      });
    }

    // CTR faible
    if (campaign.ctr < 1 && campaign.clicks > 100) {
      alerts.push({
        type: 'warning',
        message: `CTR faible (${campaign.ctr.toFixed(2)}%) - Améliorer le créatif`
      });
    }

    // CPC élevé
    if (campaign.cpc > 0.5 && campaign.clicks > 50) {
      alerts.push({
        type: 'warning',
        message: `CPC élevé (${campaign.cpc.toFixed(2)}€) - Affiner l'audience`
      });
    }

    // ROI négatif
    if (campaign.roi < 0 && campaign.purchases > 0) {
      alerts.push({
        type: 'error',
        message: `ROI négatif (${campaign.roi.toFixed(2)}%) - Optimiser la campagne`
      });
    }

    // Objectifs non atteints
    if (campaign.target_conversions && campaign.conversions < campaign.target_conversions * 0.5) {
      alerts.push({
        type: 'warning',
        message: `Objectif conversions: ${campaign.conversions}/${campaign.target_conversions}`
      });
    }

    return alerts;
  };

  const getAllTags = () => {
    const tags = new Set<string>();
    activeCampaigns.forEach(campaign => {
      (campaign.tags || []).forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  };

  const getAllCategories = () => {
    const categories = new Set<string>();
    activeCampaigns.forEach(campaign => {
      if (campaign.category) categories.add(campaign.category);
    });
    return Array.from(categories).sort();
  };

  const filteredCampaigns = activeCampaigns.filter(campaign => {
    if (filterTag && (!campaign.tags || !campaign.tags.includes(filterTag))) return false;
    if (filterCategory && campaign.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📢 Campagnes Publicitaires</h1>
        <p className="text-gray-600">
          Gérez vos campagnes publicitaires et consultez les templates recommandés pour chaque plateforme
        </p>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📊 Vue d'ensemble
            </button>
            <button
              onClick={() => setActiveTab('facebook')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'facebook'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📘 Facebook Ads
            </button>
            <button
              onClick={() => setActiveTab('google')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'google'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🔍 Google Ads
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'active'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📈 Campagnes Actives
              {activeCampaigns.filter(c => c.status === 'active').length > 0 && (
                <span className="ml-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeCampaigns.filter(c => c.status === 'active').length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Vue d'ensemble des campagnes</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-blue-600">{facebookTemplates.length + googleTemplates.length}</div>
                    <div className="text-sm text-gray-600">Templates disponibles</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-green-600">{activeCampaigns.filter(c => c.status === 'active').length}</div>
                    <div className="text-sm text-gray-600">Campagnes actives</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-orange-600">
                      {formatCurrency(activeCampaigns.reduce((sum, c) => sum + c.spent, 0))}
                    </div>
                    <div className="text-sm text-gray-600">Total dépensé</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-purple-600">
                      {activeCampaigns.reduce((sum, c) => sum + c.conversions, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total conversions</div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Recommandations</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Commencez par le template "Focus Gratuit" pour maximiser les inscriptions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Testez 2-3 templates simultanément pour identifier le plus performant</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Budget recommandé : 10-20€/jour pour commencer (300-600€/mois)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Surveillez les performances quotidiennement et optimisez après 1 semaine</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'facebook' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-blue-900 mb-2">📘 Templates Facebook Ads pour MeTube</h2>
                <p className="text-blue-800 text-sm">
                  Sélectionnez un template pour voir les détails complets : coûts, objectifs attendus, et configuration recommandée.
                </p>
              </div>

              {/* Liste des templates */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {facebookTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {template.format === 'image' && <span className="text-2xl">🖼️</span>}
                          {template.format === 'video' && <span className="text-2xl">🎬</span>}
                          {template.format === 'carousel' && <span className="text-2xl">🎠</span>}
                          <h3 className="text-lg font-bold text-gray-900">{template.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                      </div>
                    </div>

                    {/* Budget rapide */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="text-xs text-gray-500 mb-1">Budget recommandé</div>
                      <div className="text-lg font-bold text-blue-600">
                        {formatCurrency(template.budget.daily)}/jour
                      </div>
                      <div className="text-xs text-gray-600">
                        {formatCurrency(template.budget.monthly)}/mois
                      </div>
                    </div>

                    {/* Objectifs clés */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">CTR attendu :</span>
                        <span className="font-semibold text-green-600">{template.objectives.ctr}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">CPC attendu :</span>
                        <span className="font-semibold text-blue-600">{template.objectives.cpc}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">CPL attendu :</span>
                        <span className="font-semibold text-purple-600">{template.objectives.cpl}</span>
                      </div>
                    </div>

                    <button className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                      Voir les détails →
                    </button>
                  </div>
                ))}
              </div>

              {/* Modal de détails */}
              {selectedTemplate && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                      <h2 className="text-2xl font-bold text-gray-900">{selectedTemplate.name}</h2>
                      <button
                        onClick={() => setSelectedTemplate(null)}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                      >
                        ×
                      </button>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Description */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">📝 Description</h3>
                        <p className="text-gray-700">{selectedTemplate.description}</p>
                      </div>

                      {/* Budget détaillé */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Budget et Coûts</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="text-sm text-gray-600 mb-1">Budget quotidien</div>
                            <div className="text-2xl font-bold text-blue-600">
                              {formatCurrency(selectedTemplate.budget.daily)}
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="text-sm text-gray-600 mb-1">Budget hebdomadaire</div>
                            <div className="text-2xl font-bold text-green-600">
                              {formatCurrency(selectedTemplate.budget.weekly)}
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="text-sm text-gray-600 mb-1">Budget mensuel</div>
                            <div className="text-2xl font-bold text-purple-600">
                              {formatCurrency(selectedTemplate.budget.monthly)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Objectifs attendus */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Objectifs Attendus</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-600 mb-2">Impressions</div>
                            <div className="text-lg font-semibold text-gray-900">{selectedTemplate.objectives.impressions}</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-600 mb-2">Clics</div>
                            <div className="text-lg font-semibold text-gray-900">{selectedTemplate.objectives.clicks}</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-600 mb-2">Taux de clic (CTR)</div>
                            <div className="text-lg font-semibold text-green-600">{selectedTemplate.objectives.ctr}</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-600 mb-2">Coût par clic (CPC)</div>
                            <div className="text-lg font-semibold text-blue-600">{selectedTemplate.objectives.cpc}</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-600 mb-2">Conversions (Inscriptions)</div>
                            <div className="text-lg font-semibold text-purple-600">{selectedTemplate.objectives.conversions}</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-600 mb-2">Coût par lead (CPL)</div>
                            <div className="text-lg font-semibold text-orange-600">{selectedTemplate.objectives.cpl}</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-600 mb-2">Achats attendus</div>
                            <div className="text-lg font-semibold text-red-600">{selectedTemplate.objectives.purchases}</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-600 mb-2">Coût par acquisition (CPA)</div>
                            <div className="text-lg font-semibold text-pink-600">{selectedTemplate.objectives.cpa}</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                            <div className="text-sm text-gray-600 mb-2">Retour sur investissement (ROI)</div>
                            <div className="text-2xl font-bold text-green-600">{selectedTemplate.objectives.roi}</div>
                          </div>
                        </div>
                      </div>

                      {/* Audience */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Audience Ciblée</h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Taille de l'audience</div>
                            <div className="font-semibold text-gray-900">{selectedTemplate.audience.size}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Localisation</div>
                            <div className="font-semibold text-gray-900">{selectedTemplate.audience.location}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-2">Intérêts</div>
                            <div className="flex flex-wrap gap-2">
                              {selectedTemplate.audience.interests.map((interest, idx) => (
                                <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                  {interest}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Créatif */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">🎨 Créatif Recommandé</h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Type</div>
                            <div className="font-semibold text-gray-900">{selectedTemplate.creative.type}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Spécifications</div>
                            <div className="text-gray-700">{selectedTemplate.creative.specifications}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Texte de l'annonce</div>
                            <div className="bg-white rounded p-3 text-gray-700 whitespace-pre-line border border-gray-200">
                              {selectedTemplate.creative.text}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Bouton CTA</div>
                            <div className="font-semibold text-gray-900">{selectedTemplate.creative.cta}</div>
                          </div>
                        </div>
                      </div>

                      {/* Résultats attendus par semaine */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Résultats Attendus (par semaine)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                            <div className="text-sm text-gray-600 mb-1">Semaine 1</div>
                            <div className="font-semibold text-gray-900">{selectedTemplate.expectedResults.week1}</div>
                          </div>
                          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                            <div className="text-sm text-gray-600 mb-1">Semaine 2</div>
                            <div className="font-semibold text-gray-900">{selectedTemplate.expectedResults.week2}</div>
                          </div>
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                            <div className="text-sm text-gray-600 mb-1">Semaine 3</div>
                            <div className="font-semibold text-gray-900">{selectedTemplate.expectedResults.week3}</div>
                          </div>
                          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                            <div className="text-sm text-gray-600 mb-1">Semaine 4</div>
                            <div className="font-semibold text-gray-900">{selectedTemplate.expectedResults.week4}</div>
                          </div>
                        </div>
                      </div>

                      {/* Durée */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <span className="text-yellow-600 mr-2">⏱️</span>
                          <div>
                            <div className="font-semibold text-yellow-900 mb-1">Durée recommandée</div>
                            <div className="text-yellow-800">{selectedTemplate.duration}</div>
                            <div className="text-sm text-yellow-700 mt-2">
                              Minimum 1 mois pour avoir des données significatives et optimiser la campagne.
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-4 pt-4 border-t border-gray-200">
                        <a
                          href="/docs/CAMPAGNE_FACEBOOK_METUBE.md"
                          target="_blank"
                          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
                        >
                          📖 Voir le guide complet
                        </a>
                        <a
                          href="/docs/TEMPLATES_CREATIFS_FACEBOOK.md"
                          target="_blank"
                          className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors text-center font-medium"
                        >
                          🎨 Voir les templates créatifs
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'google' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h2 className="text-lg font-semibold text-green-900 mb-2">🔍 Templates Google Ads pour MeTube</h2>
                <p className="text-green-800 text-sm">
                  Sélectionnez un template pour voir les détails complets : coûts, objectifs attendus, et configuration recommandée.
                </p>
              </div>

              {/* Liste des templates Google */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {googleTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-green-500 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {template.format === 'image' && <span className="text-2xl">🖼️</span>}
                          {template.format === 'video' && <span className="text-2xl">🎬</span>}
                          {template.format === 'carousel' && <span className="text-2xl">🎠</span>}
                          <h3 className="text-lg font-bold text-gray-900">{template.name}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                      </div>
                    </div>

                    {/* Budget rapide */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="text-xs text-gray-500 mb-1">Budget recommandé</div>
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(template.budget.daily)}/jour
                      </div>
                      <div className="text-xs text-gray-600">
                        {formatCurrency(template.budget.monthly)}/mois
                      </div>
                    </div>

                    {/* Objectifs clés */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">CTR attendu :</span>
                        <span className="font-semibold text-green-600">{template.objectives.ctr}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">CPC attendu :</span>
                        <span className="font-semibold text-blue-600">{template.objectives.cpc}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">CPL attendu :</span>
                        <span className="font-semibold text-purple-600">{template.objectives.cpl}</span>
                      </div>
                    </div>

                    <button className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                      Voir les détails →
                    </button>
                  </div>
                ))}
              </div>

              {/* Modal de détails (réutilise le même modal que Facebook) */}
              {selectedTemplate && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                      <h2 className="text-2xl font-bold text-gray-900">{selectedTemplate.name}</h2>
                      <button
                        onClick={() => setSelectedTemplate(null)}
                        className="text-gray-400 hover:text-gray-600 text-2xl"
                      >
                        ×
                      </button>
                    </div>

                    <div className="p-6 space-y-6">
                      {/* Description */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">📝 Description</h3>
                        <p className="text-gray-700">{selectedTemplate.description}</p>
                      </div>

                      {/* Budget détaillé */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Budget et Coûts</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="text-sm text-gray-600 mb-1">Budget quotidien</div>
                            <div className="text-2xl font-bold text-green-600">
                              {formatCurrency(selectedTemplate.budget.daily)}
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="text-sm text-gray-600 mb-1">Budget hebdomadaire</div>
                            <div className="text-2xl font-bold text-green-600">
                              {formatCurrency(selectedTemplate.budget.weekly)}
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="text-sm text-gray-600 mb-1">Budget mensuel</div>
                            <div className="text-2xl font-bold text-green-600">
                              {formatCurrency(selectedTemplate.budget.monthly)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Objectifs détaillés */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Objectifs Attendus</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-xs text-gray-600 mb-1">Impressions</div>
                            <div className="text-lg font-bold text-gray-900">{selectedTemplate.objectives.impressions}</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-xs text-gray-600 mb-1">Clics</div>
                            <div className="text-lg font-bold text-gray-900">{selectedTemplate.objectives.clicks}</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-xs text-gray-600 mb-1">CTR</div>
                            <div className="text-lg font-bold text-green-600">{selectedTemplate.objectives.ctr}</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-xs text-gray-600 mb-1">CPC</div>
                            <div className="text-lg font-bold text-blue-600">{selectedTemplate.objectives.cpc}</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-xs text-gray-600 mb-1">Conversions</div>
                            <div className="text-lg font-bold text-purple-600">{selectedTemplate.objectives.conversions}</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-xs text-gray-600 mb-1">CPL</div>
                            <div className="text-lg font-bold text-purple-600">{selectedTemplate.objectives.cpl}</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-xs text-gray-600 mb-1">Achats</div>
                            <div className="text-lg font-bold text-orange-600">{selectedTemplate.objectives.purchases}</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-xs text-gray-600 mb-1">ROI</div>
                            <div className="text-lg font-bold text-green-600">{selectedTemplate.objectives.roi}</div>
                          </div>
                        </div>
                      </div>

                      {/* Audience */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Audience</h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <div>
                            <span className="font-semibold">Taille :</span> {selectedTemplate.audience.size}
                          </div>
                          <div>
                            <span className="font-semibold">Localisation :</span> {selectedTemplate.audience.location}
                          </div>
                          <div>
                            <span className="font-semibold">Intérêts :</span> {selectedTemplate.audience.interests.join(', ')}
                          </div>
                        </div>
                      </div>

                      {/* Créatif */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">🎨 Créatif</h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div>
                            <span className="font-semibold">Type :</span> {selectedTemplate.creative.type}
                          </div>
                          <div>
                            <span className="font-semibold">Spécifications :</span> {selectedTemplate.creative.specifications}
                          </div>
                          <div className="bg-white rounded p-3 whitespace-pre-line">
                            {selectedTemplate.creative.text}
                          </div>
                          <div>
                            <span className="font-semibold">CTA :</span> {selectedTemplate.creative.cta}
                          </div>
                        </div>
                      </div>

                      {/* Résultats attendus */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Résultats Attendus (par semaine)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="text-sm font-semibold text-blue-900 mb-2">Semaine 1</div>
                            <div className="text-sm text-blue-800">{selectedTemplate.expectedResults.week1}</div>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="text-sm font-semibold text-blue-900 mb-2">Semaine 2</div>
                            <div className="text-sm text-blue-800">{selectedTemplate.expectedResults.week2}</div>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="text-sm font-semibold text-blue-900 mb-2">Semaine 3</div>
                            <div className="text-sm text-blue-800">{selectedTemplate.expectedResults.week3}</div>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-4">
                            <div className="text-sm font-semibold text-blue-900 mb-2">Semaine 4</div>
                            <div className="text-sm text-blue-800">{selectedTemplate.expectedResults.week4}</div>
                          </div>
                        </div>
                      </div>

                      {/* Durée */}
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="font-semibold text-yellow-900 mb-1">⏱️ Durée recommandée</div>
                        <div className="text-yellow-800">{selectedTemplate.duration}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'active' && (
            <div className="space-y-6">
              {/* En-tête avec boutons */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">📈 Campagnes Actives</h2>
                  <p className="text-gray-600">Suivez et gérez vos campagnes publicitaires en cours</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={exportToCSV}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    📥 Export CSV
                  </button>
                  <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    + Créer une campagne
                  </button>
                </div>
              </div>

              {/* Filtres et modes d'affichage */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  {/* Filtres */}
                  <div className="flex gap-2 flex-wrap">
                    <select
                      value={filterTag}
                      onChange={(e) => setFilterTag(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">Tous les tags</option>
                      {getAllTags().map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">Toutes les catégories</option>
                      {getAllCategories().map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Modes d'affichage */}
                  <div className="flex gap-2 ml-auto">
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      📋 Liste
                    </button>
                    <button
                      onClick={() => {
                        setViewMode('compare');
                        if (selectedCampaigns.length < 2) {
                          alert('Sélectionnez au moins 2 campagnes pour comparer');
                          setViewMode('list');
                        }
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        viewMode === 'compare' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      ⚖️ Comparer
                    </button>
                    <button
                      onClick={() => setViewMode('charts')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        viewMode === 'charts' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      📊 Graphiques
                    </button>
                  </div>
                </div>
              </div>

              {/* Formulaire de création */}
              {showCreateForm && (
                <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Nouvelle Campagne</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la campagne *</label>
                      <input
                        type="text"
                        value={newCampaign.name}
                        onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Ex: MeTube - Focus Gratuit"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Plateforme *</label>
                      <select
                        value={newCampaign.platform}
                        onChange={(e) => setNewCampaign({ ...newCampaign, platform: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      >
                        <option value="facebook">Facebook Ads</option>
                        <option value="google">Google Ads</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Template ID (optionnel)</label>
                      <input
                        type="text"
                        value={newCampaign.template_id}
                        onChange={(e) => setNewCampaign({ ...newCampaign, template_id: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Ex: metube-gratuit"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Budget quotidien (€) *</label>
                      <input
                        type="number"
                        value={newCampaign.budget_daily}
                        onChange={(e) => setNewCampaign({ ...newCampaign, budget_daily: parseFloat(e.target.value) || 0 })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        min="1"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Budget total (€) (optionnel)</label>
                      <input
                        type="number"
                        value={newCampaign.budget_total}
                        onChange={(e) => setNewCampaign({ ...newCampaign, budget_total: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        min="1"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                      <input
                        type="date"
                        value={newCampaign.start_date}
                        onChange={(e) => setNewCampaign({ ...newCampaign, start_date: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                      <input
                        type="date"
                        value={newCampaign.end_date}
                        onChange={(e) => setNewCampaign({ ...newCampaign, end_date: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">URL de destination</label>
                      <input
                        type="url"
                        value={newCampaign.landing_page_url}
                        onChange={(e) => setNewCampaign({ ...newCampaign, landing_page_url: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="https://iahome.fr/card/metube"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags (séparés par des virgules)</label>
                      <input
                        type="text"
                        value={newCampaign.tags || ''}
                        onChange={(e) => setNewCampaign({ ...newCampaign, tags: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Ex: metube, gratuit, test"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                      <input
                        type="text"
                        value={newCampaign.category || ''}
                        onChange={(e) => setNewCampaign({ ...newCampaign, category: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        placeholder="Ex: Acquisition, Retention"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        value={newCampaign.notes}
                        onChange={(e) => setNewCampaign({ ...newCampaign, notes: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        rows={3}
                        placeholder="Notes additionnelles sur la campagne..."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleCreateCampaign}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Créer la campagne
                    </button>
                  </div>
                </div>
              )}

              {/* Liste des campagnes */}
              {loadingCampaigns ? (
                <div className="text-center py-12">
                  <div className="text-gray-500">Chargement des campagnes...</div>
                </div>
              ) : activeCampaigns.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune campagne</h3>
                  <p className="text-gray-600 mb-6">Créez votre première campagne pour commencer le suivi</p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    + Créer une campagne
                  </button>
                </div>
              ) : viewMode === 'compare' ? (
                /* Mode Comparaison */
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-blue-800 text-sm">
                      💡 Sélectionnez 2-4 campagnes pour les comparer côte à côte
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            <input
                              type="checkbox"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCampaigns(filteredCampaigns.map(c => c.id));
                                } else {
                                  setSelectedCampaigns([]);
                                }
                              }}
                              className="rounded"
                            />
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campagne</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget/Jour</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dépensé</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CTR</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPC</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conversions</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CPL</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ROI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredCampaigns.map((campaign) => (
                          <tr key={campaign.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selectedCampaigns.includes(campaign.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedCampaigns([...selectedCampaigns, campaign.id]);
                                  } else {
                                    setSelectedCampaigns(selectedCampaigns.filter(id => id !== campaign.id));
                                  }
                                }}
                                className="rounded"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900">{campaign.name}</div>
                              <div className="text-sm text-gray-500">{campaign.platform}</div>
                            </td>
                            <td className="px-4 py-3 text-sm">{formatCurrency(campaign.budget_daily)}</td>
                            <td className="px-4 py-3 text-sm">{formatCurrency(campaign.spent)}</td>
                            <td className="px-4 py-3 text-sm">{campaign.ctr.toFixed(2)}%</td>
                            <td className="px-4 py-3 text-sm">{formatCurrency(campaign.cpc)}</td>
                            <td className="px-4 py-3 text-sm">{campaign.conversions}</td>
                            <td className="px-4 py-3 text-sm">{formatCurrency(campaign.cpl)}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={campaign.roi >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {campaign.roi.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {selectedCampaigns.length >= 2 && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparaison détaillée</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedCampaigns.map(campaignId => {
                          const campaign = activeCampaigns.find(c => c.id === campaignId);
                          if (!campaign) return null;
                          return (
                            <div key={campaignId} className="border border-gray-200 rounded-lg p-4">
                              <h4 className="font-semibold text-gray-900 mb-3">{campaign.name}</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">CTR:</span>
                                  <span className="font-medium">{campaign.ctr.toFixed(2)}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">CPC:</span>
                                  <span className="font-medium">{formatCurrency(campaign.cpc)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">CPL:</span>
                                  <span className="font-medium">{formatCurrency(campaign.cpl)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">ROI:</span>
                                  <span className={`font-medium ${campaign.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {campaign.roi.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : viewMode === 'charts' ? (
                /* Mode Graphiques */
                <div className="space-y-6">
                  {filteredCampaigns.filter(c => c.status === 'active').map((campaign) => {
                    const history = campaignHistory[campaign.id] || [];
                    if (history.length === 0) {
                      loadCampaignHistory(campaign.id);
                      return null;
                    }

                    const chartData = {
                      labels: history.map(h => new Date(h.created_at).toLocaleDateString('fr-FR')),
                      datasets: [
                        {
                          label: 'Impressions',
                          data: history.map(h => h.impressions),
                          borderColor: '#3B82F6',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          tension: 0.4,
                        },
                        {
                          label: 'Clics',
                          data: history.map(h => h.clicks),
                          borderColor: '#10B981',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          tension: 0.4,
                        },
                        {
                          label: 'Conversions',
                          data: history.map(h => h.conversions),
                          borderColor: '#8B5CF6',
                          backgroundColor: 'rgba(139, 92, 246, 0.1)',
                          tension: 0.4,
                        }
                      ]
                    };

                    const roiData = {
                      labels: history.map(h => new Date(h.created_at).toLocaleDateString('fr-FR')),
                      datasets: [{
                        label: 'ROI (%)',
                        data: history.map(h => h.roi),
                        borderColor: campaign.roi >= 0 ? '#10B981' : '#EF4444',
                        backgroundColor: campaign.roi >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                      }]
                    };

                    return (
                      <div key={campaign.id} className="bg-white rounded-lg shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">{campaign.name}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Évolution des métriques</h4>
                            <div style={{ height: '300px' }}>
                              <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Évolution du ROI</h4>
                            <div style={{ height: '300px' }}>
                              <Line data={roiData} options={{ responsive: true, maintainAspectRatio: false }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {filteredCampaigns.filter(c => c.status === 'active').length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <p className="text-gray-600">Aucune campagne active pour afficher les graphiques</p>
                    </div>
                  )}
                </div>
              ) : (
                /* Mode Liste */
                <div className="space-y-4">
                  {filteredCampaigns.map((campaign) => {
                    const alerts = getAlerts(campaign);
                    return (
                      <div key={campaign.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        {/* Alertes */}
                        {alerts.length > 0 && (
                          <div className="mb-4 space-y-2">
                            {alerts.map((alert, idx) => (
                              <div
                                key={idx}
                                className={`p-3 rounded-lg text-sm ${
                                  alert.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                                  alert.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
                                  'bg-blue-50 text-blue-800 border border-blue-200'
                                }`}
                              >
                                {alert.type === 'error' && '⚠️ '}
                                {alert.type === 'warning' && '⚡ '}
                                {alert.type === 'info' && 'ℹ️ '}
                                {alert.message}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h3 className="text-lg font-bold text-gray-900">{campaign.name}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                                {getStatusLabel(campaign.status)}
                              </span>
                              <span className="text-sm text-gray-500">
                                {campaign.platform === 'facebook' ? '📘' : campaign.platform === 'google' ? '🔍' : '📢'} {campaign.platform}
                              </span>
                              {campaign.tags && campaign.tags.length > 0 && (
                                <div className="flex gap-1 flex-wrap">
                                  {campaign.tags.map(tag => (
                                    <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {campaign.category && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                                  {campaign.category}
                                </span>
                              )}
                            </div>
                            {campaign.template_id && (
                              <p className="text-sm text-gray-600 mb-2">Template: {campaign.template_id}</p>
                            )}
                            {campaign.start_date && campaign.end_date && (
                              <p className="text-sm text-gray-600">
                                {new Date(campaign.start_date).toLocaleDateString('fr-FR')} - {new Date(campaign.end_date).toLocaleDateString('fr-FR')}
                              </p>
                            )}
                          </div>
                        <div className="flex gap-2">
                          {campaign.status === 'draft' && (
                            <button
                              onClick={() => handleUpdateCampaignStatus(campaign.id, 'active')}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                            >
                              accéder à
                            </button>
                          )}
                          {campaign.status === 'active' && (
                            <button
                              onClick={() => handleUpdateCampaignStatus(campaign.id, 'paused')}
                              className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700"
                            >
                              Mettre en pause
                            </button>
                          )}
                          {campaign.status === 'paused' && (
                            <button
                              onClick={() => handleUpdateCampaignStatus(campaign.id, 'active')}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                            >
                              Reprendre
                            </button>
                          )}
                          <button
                            onClick={() => handleUpdateCampaignStatus(campaign.id, 'completed')}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                          >
                            Terminer
                          </button>
                        </div>
                      </div>

                      {/* Métriques */}
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4 pt-4 border-t border-gray-200">
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Budget/Jour</div>
                          <div className="text-lg font-bold text-blue-600">{formatCurrency(campaign.budget_daily)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Dépensé</div>
                          <div className="text-lg font-bold text-orange-600">{formatCurrency(campaign.spent)}</div>
                          {campaign.budget_total && (
                            <div className="text-xs text-gray-500">sur {formatCurrency(campaign.budget_total)}</div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Impressions</div>
                          <div className="text-lg font-bold text-gray-900">{campaign.impressions.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Clics</div>
                          <div className="text-lg font-bold text-gray-900">{campaign.clicks.toLocaleString()}</div>
                          {campaign.clicks > 0 && (
                            <div className="text-xs text-green-600">CTR: {campaign.ctr.toFixed(2)}%</div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Conversions</div>
                          <div className="text-lg font-bold text-purple-600">{campaign.conversions}</div>
                          {campaign.clicks > 0 && (
                            <div className="text-xs text-gray-500">CVR: {((campaign.conversions / campaign.clicks) * 100).toFixed(2)}%</div>
                          )}
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Achats</div>
                          <div className="text-lg font-bold text-green-600">{campaign.purchases}</div>
                          {campaign.revenue > 0 && (
                            <div className="text-xs text-green-600">ROI: {campaign.roi.toFixed(1)}%</div>
                          )}
                        </div>
                      </div>

                      {/* Actions rapides */}
                      <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3 flex-wrap">
                        <button
                          onClick={() => {
                            const impressions = prompt('Impressions:', campaign.impressions.toString());
                            const clicks = prompt('Clics:', campaign.clicks.toString());
                            const conversions = prompt('Conversions:', campaign.conversions.toString());
                            const purchases = prompt('Achats:', campaign.purchases.toString());
                            const spent = prompt('Dépensé (€):', campaign.spent.toString());
                            
                            if (impressions && clicks && conversions && purchases && spent) {
                              const newImpressions = parseInt(impressions);
                              const newClicks = parseInt(clicks);
                              const newConversions = parseInt(conversions);
                              const newPurchases = parseInt(purchases);
                              const newSpent = parseFloat(spent);
                              
                              const newCtr = newImpressions > 0 ? (newClicks / newImpressions) * 100 : 0;
                              const newCpc = newClicks > 0 ? newSpent / newClicks : 0;
                              const newCpl = newConversions > 0 ? newSpent / newConversions : 0;
                              const newCpa = newPurchases > 0 ? newSpent / newPurchases : 0;
                              
                              // Estimation du revenu (exemple: 15€ par achat)
                              const estimatedRevenue = newPurchases * 15;
                              const newRoi = newSpent > 0 ? ((estimatedRevenue - newSpent) / newSpent) * 100 : 0;
                              
                              handleUpdateCampaignMetrics(campaign.id, {
                                impressions: newImpressions,
                                clicks: newClicks,
                                conversions: newConversions,
                                purchases: newPurchases,
                                spent: newSpent,
                                ctr: newCtr,
                                cpc: newCpc,
                                cpl: newCpl,
                                cpa: newCpa,
                                revenue: estimatedRevenue,
                                roi: newRoi
                              });
                            }
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          ✏️ Mettre à jour les métriques
                        </button>
                        <button
                          onClick={() => {
                            if (expandedCampaign === campaign.id) {
                              setExpandedCampaign(null);
                            } else {
                              setExpandedCampaign(campaign.id);
                              loadCampaignHistory(campaign.id);
                            }
                          }}
                          className="text-sm text-purple-600 hover:text-purple-800"
                        >
                          📊 {expandedCampaign === campaign.id ? 'Masquer' : 'Voir'} l'historique
                        </button>
                        <button
                          onClick={() => {
                            const tags = prompt('Tags (séparés par des virgules):', (campaign.tags || []).join(', '));
                            const category = prompt('Catégorie:', campaign.category || '');
                            if (tags !== null || category !== null) {
                              handleUpdateCampaignMetrics(campaign.id, {
                                tags: tags ? tags.split(',').map(t => t.trim()).filter(t => t) : campaign.tags,
                                category: category || campaign.category
                              });
                            }
                          }}
                          className="text-sm text-green-600 hover:text-green-800"
                        >
                          🏷️ Gérer tags/catégorie
                        </button>
                      </div>

                      {/* Historique */}
                      {expandedCampaign === campaign.id && campaignHistory[campaign.id] && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-900 mb-3">📊 Historique des modifications</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Impressions</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Clics</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Conversions</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Achats</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Dépensé</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">ROI</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {campaignHistory[campaign.id].slice(-10).reverse().map((entry) => (
                                  <tr key={entry.id}>
                                    <td className="px-3 py-2 text-gray-600">
                                      {new Date(entry.created_at).toLocaleString('fr-FR')}
                                    </td>
                                    <td className="px-3 py-2">{entry.impressions.toLocaleString()}</td>
                                    <td className="px-3 py-2">{entry.clicks.toLocaleString()}</td>
                                    <td className="px-3 py-2">{entry.conversions}</td>
                                    <td className="px-3 py-2">{entry.purchases}</td>
                                    <td className="px-3 py-2">{formatCurrency(entry.spent)}</td>
                                    <td className={`px-3 py-2 ${entry.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {entry.roi.toFixed(1)}%
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


