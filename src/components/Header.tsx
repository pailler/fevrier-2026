'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../utils/supabaseClient';
import DynamicNavigation from './DynamicNavigation';
import TokenBalance from './TokenBalance';
import { NotificationServiceClient } from '../utils/notificationServiceClient';
import { useIframeDetection } from '../utils/useIframeDetection';

export default function Header() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isInIframe = useIframeDetection();

  // Vérification de la configuration Supabase
  useEffect(() => {
    // Récupérer la session actuelle
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user || null);
    };

    getSession();

    // Écouter les changements de session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        setSession(session);
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Vérifier le rôle de l'utilisateur
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.id) {
        setRole(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setRole(data.role);
        } else {
          setRole('user');
        }
      } catch (error) {
        setRole('user');
      }
    };

    fetchUserRole();
  }, [session, user]);

  // Fonction pour obtenir l'URL d'accès d'un module
  const getModuleAccessUrl = async (moduleName: string) => {
    // Mapping des modules vers leurs pages d'accès sécurisées
    const secureModuleUrls: { [key: string]: string } = {

    };
    
    // Vérifier si l'utilisateur est connecté
    if (!user?.id) {
      router.push('/login');
      return null;
    }
    
    // Rediriger vers la page d'accès sécurisé appropriée
    const secureUrl = secureModuleUrls[moduleName];
    if (secureUrl) {
      router.push(secureUrl);
      return null;
    }
    
    // Fallback pour les modules non configurés
    return `/secure-module-access?module=${moduleName.toLowerCase()}`;
  };

  return (
    <header className="bg-blue-600 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section supérieure - Informations de connexion */}
        <div className="flex items-center justify-between h-10">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
              <span className="hidden sm:inline">Bienvenue sur IAhome</span>
            </div>
            <div className="flex items-center space-x-3">
              {!session ? (
                <div className="flex items-center space-x-3">
                  <button 
                    className="text-blue-100 hover:text-white transition-colors text-sm"
                    onClick={() => router.push('/login')}
                  >
                    Se connecter
                  </button>
                  <button 
                    className="bg-white text-blue-600 font-semibold px-3 py-1 rounded text-sm hover:bg-blue-50 transition-colors"
                    onClick={() => router.push('/register')}
                  >
                    Commencer
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <span className="text-blue-100 text-sm">
                    {role === 'admin' ? 'Administrateur IAHome' : 'Connecté à IAHome'}
                  </span>
                  <span className="text-blue-100 text-sm font-medium">
                    {user?.email}
                  </span>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    role === 'admin' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-green-500 text-white'
                  }`}>
                    {role === 'admin' ? '👑 ADMIN' : 'CONNECTÉ'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section principale - Navigation et utilisateur */}
        <div className="flex items-center justify-between h-16 border-t border-blue-500">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">I</span>
              </div>
              <span className="text-xl font-bold text-white">IAhome</span>
            </Link>

            {/* Navigation statique */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/formation" 
                className="text-white hover:text-blue-100 font-medium transition-colors"
              >
                Formation
              </Link>
              <Link 
                href="/blog" 
                className="text-white hover:text-blue-100 font-medium transition-colors"
              >
                Blog
              </Link>
              <Link 
                href="/essentiels" 
                className="text-white hover:text-blue-100 font-medium transition-colors"
              >
                Essentiels
              </Link>
              <Link 
                href="/applications" 
                className="text-white hover:text-blue-100 font-medium transition-colors"
              >
                Applications IA
              </Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {session && (
              <>
                <TokenBalance
                  className="text-blue-100 hover:text-white transition-colors"
                />
                <Link
                  href="/encours"
                  className="bg-white text-blue-600 font-semibold px-3 py-1 rounded text-sm hover:bg-blue-50 transition-colors flex items-center space-x-1"
                >
                  <span>📱</span>
                  <span className="hidden sm:inline">Mes applis</span>
                </Link>
                <span className="text-white font-medium px-3 py-1 rounded-lg">
                  {user?.email}
                </span>
                <button
                  onClick={async () => { 
                    // Envoyer une notification de déconnexion avant de se déconnecter
                    try {
                      console.log('🔍 DEBUG: Tentative d\'envoi de notification de déconnexion...');
                      console.log('🔍 DEBUG: Email:', user?.email);
                      console.log('🔍 DEBUG: UserName:', user?.email?.split('@')[0] || 'Utilisateur');
                      
                      const notificationService = NotificationServiceClient.getInstance();
                      console.log('🔍 DEBUG: Service de notification chargé');
                      
                      const result = await notificationService.notifyUserLogout(user?.email || '', user?.email?.split('@')[0] || 'Utilisateur');
                      console.log('🔍 DEBUG: Résultat notification:', result);
                      
                      if (result) {
                        console.log('✅ Notification de déconnexion envoyée avec succès');
                      } else {
                        console.log('❌ Échec de l\'envoi de la notification de déconnexion');
                      }
                    } catch (notificationError) {
                      console.error('❌ Erreur lors de l\'envoi de la notification de déconnexion:', notificationError);
                    }
                    
                    await supabase.auth.signOut(); 
                    router.push('/login'); 
                  }}
                  className="text-white hover:text-blue-100 transition-colors font-medium px-3 py-1 rounded-lg hover:bg-blue-500 cursor-pointer"
                >
                  Se déconnecter
                </button>
              </>
            )}
            
            {!session && (
              <Link 
                href="/contact" 
                className="text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors"
              >
                Contact
              </Link>
            )}
          </div>

          {/* Menu mobile */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-blue-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-blue-500 py-4">
            <div className="space-y-2">
              {/* Navigation principale */}
              <div className="px-4 py-2 border-b border-blue-500">
                <div className="text-sm text-blue-100 mb-2">Navigation</div>
                <Link
                  href="/formation"
                  className="block px-4 py-2 text-white hover:bg-blue-500 transition-colors"
                >
                  Formation
                </Link>
                <Link
                  href="/blog"
                  className="block px-4 py-2 text-white hover:bg-blue-500 transition-colors"
                >
                  Blog
                </Link>
                <Link
                  href="/essentiels"
                  className="block px-4 py-2 text-white hover:bg-blue-500 transition-colors"
                >
                  Essentiels
                </Link>
                <Link
                  href="/applications"
                  className="block px-4 py-2 text-white hover:bg-blue-500 transition-colors"
                >
                  Applications IA
                </Link>
              </div>

              {/* Actions utilisateur */}
              {session && (
                <>
                  <div className="px-4 py-2 border-b border-blue-500">
                    <div className="text-sm text-blue-100 mb-2">Compte</div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-white">{user?.email}</span>
                <TokenBalance
                  className="text-blue-100 hover:text-white transition-colors"
                />
                    </div>
                    <Link
                      href="/encours"
                      className="block px-4 py-2 text-white hover:bg-blue-500 transition-colors"
                    >
                      Mes applis
                    </Link>
                    <button
                      onClick={async () => { 
                        await supabase.auth.signOut(); 
                        router.push('/login'); 
                      }}
                      className="block px-4 py-2 text-white hover:bg-blue-500 transition-colors w-full text-left"
                    >
                      Se déconnecter
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 