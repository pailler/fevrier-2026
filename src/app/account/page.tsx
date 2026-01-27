'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../utils/supabaseClient';
import { useCustomAuth } from '../../hooks/useCustomAuth';
import Breadcrumb from '../../components/Breadcrumb';
import { useTokenContext } from '../../contexts/TokenContext';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  email_verified?: boolean;
  last_sign_in_at?: string | null;
}

interface UserApplication {
  id: string;
  module_id: string;
  module_title: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  usage_count: number;
  max_usage: number | null;
}

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useCustomAuth();
  const { tokens, isLoading: tokensLoading } = useTokenContext();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<UserApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/account');
      return;
    }

    if (isAuthenticated && user) {
      fetchUserData();
    }
  }, [isAuthenticated, user, authLoading, router]);

  const fetchUserData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Récupérer le profil utilisateur
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw new Error('Erreur lors de la récupération du profil');
      }

      setProfile(profileData);

      // Récupérer les applications actives
      const { data: appsData, error: appsError } = await supabase
        .from('user_applications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (appsError) {
        console.error('Erreur lors de la récupération des applications:', appsError);
      } else {
        setApplications(appsData || []);
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Non disponible';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getDaysRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos informations...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Redirection en cours
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">❌ {error}</div>
          <button
            onClick={fetchUserData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Fil d'Ariane */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 pt-2">
        <div className="max-w-7xl mx-auto px-6 py-1">
          <Breadcrumb 
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Mon compte' }
            ]}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mon compte</h1>
          <p className="text-gray-600">Gérez vos informations personnelles et consultez vos statistiques</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale - Informations du compte */}
          <div className="lg:col-span-2 space-y-6">
            {/* Carte Informations personnelles */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-3">👤</span>
                Informations personnelles
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Email</span>
                  <span className="text-gray-900 font-semibold">{profile?.email || user.email}</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Nom complet</span>
                  <span className="text-gray-900 font-semibold">
                    {profile?.full_name || user.full_name || 'Non renseigné'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Rôle</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    profile?.role === 'admin' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {profile?.role === 'admin' ? '👑 ADMINISTRATEUR' : '👤 UTILISATEUR'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Statut</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    profile?.is_active 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {profile?.is_active ? '✅ Actif' : '❌ Inactif'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Email vérifié</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    profile?.email_verified 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {profile?.email_verified ? '✅ Vérifié' : '⚠️ Non vérifié'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Date de création</span>
                  <span className="text-gray-900 font-semibold">
                    {formatDate(profile?.created_at)}
                  </span>
                </div>
                
                {profile?.last_sign_in_at && (
                  <div className="flex items-center justify-between py-3">
                    <span className="text-gray-600 font-medium">Dernière connexion</span>
                    <span className="text-gray-900 font-semibold">
                      {formatDate(profile.last_sign_in_at)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Carte Applications actives */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-3">📱</span>
                Applications actives ({applications.length})
              </h2>
              
              {applications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Aucune application active</p>
                  <Link href="/applications" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
                    Découvrir les applications →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.map((app) => {
                    const daysRemaining = getDaysRemaining(app.expires_at);
                    const isExpired = daysRemaining !== null && daysRemaining < 0;
                    const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7;
                    
                    return (
                      <div
                        key={app.id}
                        className={`p-4 rounded-lg border ${
                          isExpired
                            ? 'bg-red-50 border-red-200'
                            : isExpiringSoon
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{app.module_title}</h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                              <span>Utilisations: {app.usage_count}{app.max_usage ? ` / ${app.max_usage}` : ''}</span>
                              {app.expires_at && (
                                <span className={isExpired ? 'text-red-600' : isExpiringSoon ? 'text-yellow-600' : 'text-gray-600'}>
                                  {isExpired 
                                    ? 'Expiré' 
                                    : daysRemaining === 0 
                                    ? 'Expire aujourd\'hui'
                                    : daysRemaining === 1
                                    ? 'Expire demain'
                                    : `${daysRemaining} jours restants`}
                                </span>
                              )}
                            </div>
                          </div>
                          <Link
                            href="/encours"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                          >
                            Accéder
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Colonne latérale - Statistiques */}
          <div className="space-y-6">
            {/* Carte Tokens */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="mr-2">🪙</span>
                Mes tokens
              </h2>
              {tokensLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                </div>
              ) : (
                <>
                  <div className="text-4xl font-bold mb-2">
                    {tokens !== null ? tokens.toLocaleString() : '0'}
                  </div>
                  <p className="text-blue-100 text-sm mb-4">tokens disponibles</p>
                  <Link
                    href="/pricing"
                    className="block w-full text-center px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-colors"
                  >
                    Acheter des tokens
                  </Link>
                </>
              )}
            </div>

            {/* Carte Statistiques rapides */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Statistiques</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Applications actives</span>
                  <span className="text-2xl font-bold text-blue-600">{applications.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total utilisations</span>
                  <span className="text-2xl font-bold text-green-600">
                    {applications.reduce((sum, app) => sum + (app.usage_count || 0), 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Membre depuis</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {profile?.created_at 
                      ? new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">⚡ Actions rapides</h2>
              <div className="space-y-2">
                <Link
                  href="/encours"
                  className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center font-medium transition-colors"
                >
                  Mes applications
                </Link>
                <Link
                  href="/applications"
                  className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-center font-medium transition-colors"
                >
                  Découvrir les applications
                </Link>
                <Link
                  href="/pricing"
                  className="block w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center font-medium transition-colors"
                >
                  Acheter des tokens
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
