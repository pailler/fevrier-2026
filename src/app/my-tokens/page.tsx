'use client';
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import Link from "next/link";
import Breadcrumb from "../../components/Breadcrumb";
import Header from '../../components/Header';

interface UserTokens {
  tokens: number;
  packageName: string | null;
  purchaseDate: string | null;
  isActive: boolean;
}

interface TokenUsage {
  id: string;
  module_id: string;
  module_name: string;
  tokens_consumed: number;
  usage_date: string;
}

export default function MyTokensPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userTokens, setUserTokens] = useState<UserTokens | null>(null);
  const [tokenUsage, setTokenUsage] = useState<TokenUsage[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      if (currentSession?.user) {
        setCurrentUser(currentSession.user);
        fetchUserTokens(currentSession.user.id);
      } else {
        setLoading(false);
      }
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        setSession(session);
        setCurrentUser(session?.user || null);
        if (session?.user) {
          fetchUserTokens(session.user.id);
        } else {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserTokens = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les tokens de l'utilisateur
      const response = await fetch(`/api/user-tokens?userId=${userId}`);
      const data = await response.json();

      if (response.ok) {
        setUserTokens(data);
        fetchTokenUsage(userId);
      } else {
        setError(data.error || 'Erreur lors du chargement des tokens');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tokens:', error);
      setError('Erreur lors du chargement des tokens');
    } finally {
      setLoading(false);
    }
  };

  const fetchTokenUsage = async (userId: string) => {
    try {
      // Récupérer l'historique d'utilisation des tokens
      const { data: usageData, error: usageError } = await supabase
        .from('token_usage')
        .select('*')
        .eq('user_id', userId)
        .order('usage_date', { ascending: false })
        .limit(20);

      if (usageError) {
        console.error('Erreur lors du chargement de l\'historique:', usageError);
        return;
      }

      setTokenUsage(usageData || []);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTokenStatusColor = (tokens: number) => {
    if (tokens === 0) return 'text-red-600';
    if (tokens < 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getTokenStatusText = (tokens: number) => {
    if (tokens === 0) return 'Aucun token disponible';
    if (tokens < 50) return 'Tokens faibles';
    return 'Tokens disponibles';
  };

  // Contrôles d'accès
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-left">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès refusé</h1>
            <p className="text-gray-600 mb-8">Vous devez être connecté pour accéder à cette page.</p>
            <Link href="/login" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">Se connecter</Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="w-full px-4 sm:px-6 lg:px-8 pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-20">
        <Breadcrumb items={[
          { label: 'Accueil', href: '/' },
          { label: 'Mes Tokens', href: '/my-tokens' }
        ]} />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes Tokens</h1>
          <p className="text-gray-600">Gérez vos tokens et consultez votre historique d'utilisation</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Carte principale des tokens */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Vos Tokens</h2>
            <Link
              href="/pricing"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Acheter des tokens
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Solde des tokens */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Tokens disponibles</p>
                  <p className={`text-3xl font-bold ${getTokenStatusColor(userTokens?.tokens || 0)}`}>
                    {userTokens?.tokens || 0}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    {getTokenStatusText(userTokens?.tokens || 0)}
                  </p>
                </div>
                <div className="text-4xl text-blue-400">
                  🪙
                </div>
              </div>
            </div>

            {/* Package actuel */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Package actuel</p>
                  <p className="text-lg font-semibold text-green-800">
                    {userTokens?.packageName || 'Aucun package'}
                  </p>
                  {userTokens?.purchaseDate && (
                    <p className="text-sm text-green-600 mt-1">
                      Acheté le {formatDate(userTokens.purchaseDate)}
                    </p>
                  )}
                </div>
                <div className="text-4xl text-green-400">
                  📦
                </div>
              </div>
            </div>

            {/* Statut */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Statut</p>
                  <p className="text-lg font-semibold text-purple-800">
                    {userTokens?.isActive ? 'Actif' : 'Inactif'}
                  </p>
                  <p className="text-sm text-purple-600 mt-1">
                    {userTokens?.isActive ? 'Tokens utilisables' : 'Tokens non disponibles'}
                  </p>
                </div>
                <div className="text-4xl text-purple-400">
                  {userTokens?.isActive ? '✅' : '❌'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Historique d'utilisation */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Historique d'utilisation</h2>
          
          {tokenUsage.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl text-gray-400 mb-4">📊</div>
              <p className="text-gray-500">Aucune utilisation enregistrée</p>
              <p className="text-sm text-gray-400 mt-2">
                Vos utilisations de tokens apparaîtront ici
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Module
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tokens consommés
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date d'utilisation
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tokenUsage.map((usage) => (
                    <tr key={usage.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {usage.module_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {usage.module_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          -{usage.tokens_consumed} tokens
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(usage.usage_date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Informations sur les tokens */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Comment utiliser vos tokens ?</h3>
          <div className="space-y-2 text-blue-800">
            <p>• Les tokens sont automatiquement débités lors de l'utilisation des modules payants</p>
            <p>• Chaque module consomme un nombre différent de tokens selon sa complexité</p>
            <p>• Vous pouvez acheter des tokens supplémentaires à tout moment</p>
            <p>• Les tokens n'expirent pas et restent disponibles dans votre compte</p>
            <p>• Consultez l'historique ci-dessus pour voir vos utilisations récentes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

