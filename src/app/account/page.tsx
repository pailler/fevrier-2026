'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../utils/supabaseClient';
import { useCustomAuth } from '../../hooks/useCustomAuth';
import Breadcrumb from '../../components/Breadcrumb';
import { useTokenContext } from '../../contexts/TokenContext';
import { type UserApplication } from '../../utils/moduleDescriptions';

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

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, signOut, token } = useCustomAuth();
  const { tokens, isLoading: tokensLoading } = useTokenContext();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<UserApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [subdomainAccessNotice, setSubdomainAccessNotice] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sp = new URLSearchParams(window.location.search);
    if (sp.get('error') !== 'direct_access_denied') return;
    setSubdomainAccessNotice(
      'Accès direct au sous-domaine refusé (sécurité). Ouvrez l’application depuis « Vos applications » sur l’accueil : un code d’accès sera ajouté à l’URL.'
    );
    const u = new URL(window.location.href);
    u.searchParams.delete('error');
    const next = u.pathname + (u.searchParams.toString() ? `?${u.searchParams.toString()}` : '');
    router.replace(next, { scroll: false });
  }, [router]);

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

      // Récupérer les applis visitées (user_applications actives)
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

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'SUPPRIMER') return;
    setDeleteError(null);
    setDeleteLoading(true);
    try {
      const headers: HeadersInit = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        credentials: 'include',
        headers,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression du compte');
      }
      setShowDeleteModal(false);
      setDeleteConfirm('');
      await signOut();
      router.push('/');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setDeleteLoading(false);
    }
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
      {subdomainAccessNotice && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-950 px-4 py-3">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-sm sm:text-base pr-4">{subdomainAccessNotice}</p>
            <button
              type="button"
              onClick={() => setSubdomainAccessNotice(null)}
              className="shrink-0 text-sm font-medium text-amber-900 underline hover:no-underline"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
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
          </div>

          {/* Colonne latérale - Statistiques */}
          <div className="space-y-6">
            {/* Carte Crédits */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <span className="mr-2">🪙</span>
                Mes crédits
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
                  <p className="text-blue-100 text-sm mb-4">crédits disponibles</p>
                  <Link
                    href="/pricing2"
                    className="block w-full text-center px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold transition-colors mb-2"
                  >
                    Acheter des crédits
                  </Link>
                  <Link
                    href="/mes-credits"
                    className="block w-full text-center px-4 py-2 bg-white/15 text-white rounded-lg hover:bg-white/25 font-medium transition-colors text-sm"
                  >
                    Historique d&apos;utilisation
                  </Link>
                </>
              )}
            </div>

            {/* Carte Statistiques rapides */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Statistiques</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Applis visitées</span>
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
                  href="/#vos-applications"
                  className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center font-medium transition-colors"
                >
                  Vos applications
                </Link>
                <Link
                  href="/applications"
                  className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-center font-medium transition-colors"
                >
                  Découvrir les applications
                </Link>
                <Link
                  href="/pricing2"
                  className="block w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center font-medium transition-colors"
                >
                  Acheter des crédits
                </Link>
              </div>
            </div>

            {/* Zone dangereuse - Supprimer mon compte */}
            <div className="bg-white rounded-xl shadow-lg border border-red-200 p-6">
              <h2 className="text-xl font-bold text-red-700 mb-2 flex items-center">
                <span className="mr-2">⚠️</span>
                Zone dangereuse
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                La suppression de votre compte est définitive. Toutes vos données (profil, historique d&apos;applis, crédits) seront supprimées.
              </p>
              <button
                type="button"
                onClick={() => { setShowDeleteModal(true); setDeleteError(null); setDeleteConfirm(''); }}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-center font-medium transition-colors"
              >
                Supprimer mon compte
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 id="delete-modal-title" className="text-lg font-bold text-red-700 mb-2">Supprimer définitivement mon compte</h3>
            <p className="text-gray-600 text-sm mb-4">
              Cette action est irréversible. Pour confirmer, tapez <strong>SUPPRIMER</strong> ci-dessous.
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="SUPPRIMER"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              aria-label="Confirmer en tapant SUPPRIMER"
            />
            {deleteError && (
              <p className="text-red-600 text-sm mb-4" role="alert">{deleteError}</p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); setDeleteError(null); }}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== 'SUPPRIMER' || deleteLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? 'Suppression…' : 'Supprimer mon compte'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

