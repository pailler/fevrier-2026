'use client';
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useRouter } from 'next/navigation';
import { loginUrlWithReturn } from '../../utils/loginRedirect';
import Link from "next/link";
import { NotificationServiceClient } from "../../utils/notificationServiceClient";
// import AuthorizedAccessButton from "../../components/AuthorizedAccessButton";

export default function ModulesPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);

  // Vérification de la session
  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user || null);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        setSession(session);
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Récupérer le rôle de l'utilisateur
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (!error && data) {
          setRole(data.role);
        }
      } catch (error) {
        }
    };

    if (user) {
      fetchUserRole();
    }
  }, [user]);

  // Rediriger si pas connecté
  useEffect(() => {
    if (!session) {
      router.push(loginUrlWithReturn('/modules', { toString: () => '' }));
    }
  }, [session, router]);

  if (!session) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-left">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de la session...</p>
        </div>
      </div>
    );
  }

  const modules = [
    {
      id: 'metube',
      name: 'IAmetube',
      description: 'Téléchargement et gestion de vidéos YouTube',
      url: '/api/proxy-metube',
      icon: '📺',
      color: 'bg-blue-500 hover:bg-blue-600',
      status: 'active'
    },
    {
      id: 'future-module',
      name: 'Appli Futur',
      description: 'Appli en développement',
      url: '#',
      icon: '🚧',
      color: 'bg-gray-400 hover:bg-gray-500',
      status: 'coming-soon'
    }
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      {/* En-tête */}
      <header className="w-full bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">I</span>
                </div>
                <span className="text-xl font-bold text-blue-900">IAhome</span>
              </Link>
              <span className="text-gray-400">/</span>
              <h1 className="text-xl font-semibold text-gray-900">Mes applis</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                role === 'admin' 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {role === 'admin' ? 'ADMIN' : 'USER'}
              </div>
              <button 
                className="text-gray-700 font-medium px-3 py-1 rounded hover:bg-gray-100 text-sm" 
                onClick={async () => { 
                  await supabase.auth.signOut(); 
                  router.push(loginUrlWithReturn('/modules', { toString: () => '' })); 
                }}
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Mes applis d'accès
          </h2>
          <p className="text-gray-600">
            Accédez directement à vos applis autorisées. Toutes nos applications sont accessibles depuis votre navigateur, sans téléchargement ni installation.
          </p>
        </div>

        {/* Grille des modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <div key={module.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{module.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{module.name}</h3>
                    <div 
                      className="text-sm text-gray-500"
                      dangerouslySetInnerHTML={{ __html: module.description }}
                    />
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  module.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {module.status === 'active' ? 'Actif' : 'Bientôt'}
                </div>
              </div>
              
              {/* Bouton d'accès supprimé - Les utilisateurs peuvent accéder via les sous-domaines */}
              <div className="w-full bg-green-100 text-green-800 font-medium py-3 px-4 rounded-lg text-center">
                ✅ Accès via sous-domaine — ouverture avec vos crédits depuis la fiche de l&apos;appli
              </div>
            </div>
          ))}
        </div>

        {/* Section d'aide */}
        <div className="mt-12 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            💡 Comment ça marche ?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div className="flex items-start space-x-2">
              <span className="text-blue-600 font-bold">1.</span>
              <p>Connectez-vous à votre compte IAhome</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-600 font-bold">2.</span>
              <p>Cliquez sur le bouton d'accès de l'appli souhaitée</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-600 font-bold">3.</span>
              <p>Vous êtes automatiquement connecté à l'appli</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 