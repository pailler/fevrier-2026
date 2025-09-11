'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SetupAdminPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [message, setMessage] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      if (currentSession?.user) {
        setCurrentUser(currentSession.user);
        await checkUserRole(currentSession.user.id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Erreur d\'authentification:', error);
      setLoading(false);
    }
  };

  const checkUserRole = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur lors de la vérification du profil:', error);
        setUserRole(null);
      } else {
        setUserRole(profile?.role || null);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du rôle:', error);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  const setupAdmin = async () => {
    if (!currentUser?.id) {
      setMessage('Vous devez être connecté pour effectuer cette action.');
      return;
    }

    setIsSettingUp(true);
    setMessage('');

    try {
      // Créer ou mettre à jour le profil avec le rôle admin
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: currentUser.id,
          email: currentUser.email,
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erreur lors de la création du profil admin:', error);
        setMessage(`Erreur: ${error.message}`);
      } else {
        setMessage('✅ Votre compte a été configuré comme administrateur avec succès !');
        setUserRole('admin');
        
        // Rediriger vers le dashboard admin après 2 secondes
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Erreur lors de la configuration admin:', error);
      setMessage('Erreur lors de la configuration du compte administrateur.');
    } finally {
      setIsSettingUp(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Connexion requise</h1>
          <p className="text-gray-600 mb-6">
            Vous devez être connecté pour configurer un compte administrateur.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  if (userRole === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Déjà administrateur</h1>
          <p className="text-gray-600 mb-6">
            Votre compte est déjà configuré comme administrateur.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Accéder au tableau de bord
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Configuration Administrateur</h1>
          <p className="text-gray-600">
            Configurez votre compte comme administrateur pour accéder au panel d'administration.
          </p>
        </div>

        <div className="mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Informations du compte</h3>
            <p className="text-sm text-gray-600">
              <strong>Email:</strong> {currentUser?.email}
            </p>
            <p className="text-sm text-gray-600">
              <strong>ID:</strong> {currentUser?.id}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Rôle actuel:</strong> {userRole || 'Aucun'}
            </p>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('✅') 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={setupAdmin}
            disabled={isSettingUp}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSettingUp ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Configuration en cours...
              </>
            ) : (
              'Configurer comme administrateur'
            )}
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            Annuler
          </button>
        </div>

        <div className="mt-6 text-xs text-gray-500 text-center">
          <p>⚠️ Cette action vous donnera accès à toutes les fonctionnalités d'administration.</p>
        </div>
      </div>
    </div>
  );
}