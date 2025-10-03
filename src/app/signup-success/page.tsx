'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCustomAuth } from '../../hooks/useCustomAuth';
import CustomHeader from '../../components/CustomHeader';
import CustomTopBanner from '../../components/CustomTopBanner';
import UserDataDisplay from '../../components/UserDataDisplay';

export default function SignUpSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, loading } = useCustomAuth();
  const [userData, setUserData] = useState<any>(null);
  const [countdown, setCountdown] = useState(5);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Récupérer les données utilisateur depuis l'URL ou le localStorage
    const userFromUrl = searchParams.get('user');
    const userFromStorage = localStorage.getItem('user_data');
    
    if (userFromUrl) {
      try {
        setUserData(JSON.parse(decodeURIComponent(userFromUrl)));
      } catch (error) {
        console.error('Erreur lors du parsing des données utilisateur:', error);
      }
    } else if (userFromStorage) {
      try {
        setUserData(JSON.parse(userFromStorage));
      } catch (error) {
        console.error('Erreur lors du parsing des données utilisateur:', error);
      }
    } else if (user) {
      setUserData(user);
    }
  }, [searchParams, user]);

  // Compte à rebours séparé pour éviter les conflits de rendu
  useEffect(() => {
    if (isRedirecting) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setIsRedirecting(true);
          // Utiliser setTimeout pour éviter l'erreur de rendu
          setTimeout(() => {
            router.push('/?message=Compte créé avec succès ! Bienvenue sur IAhome.');
          }, 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, isRedirecting]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <CustomTopBanner />
      
      <div className="pt-20">
        <CustomHeader />
        
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* En-tête de succès */}
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🎉 Compte créé avec succès !
              </h1>
              <p className="text-lg text-gray-600">
                Bienvenue sur IAhome, votre plateforme d'outils IA
              </p>
            </div>

            {/* Données utilisateur */}
            {userData && (
              <UserDataDisplay 
                user={userData} 
                showDetails={true}
                className="mb-8"
              />
            )}

            {/* Prochaines étapes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-yellow-900 mb-4">
                🚀 Prochaines étapes
              </h3>
              <div className="space-y-3 text-yellow-800">
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-sm font-medium">1</span>
                  <p>Explorez nos outils IA disponibles dans le menu principal</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-sm font-medium">2</span>
                  <p>Configurez vos préférences dans votre profil</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-sm font-medium">3</span>
                  <p>Découvrez nos services premium pour débloquer plus de fonctionnalités</p>
                </div>
              </div>
            </div>

            {/* Compte à rebours et actions */}
            <div className="text-center">
              <div className="mb-6">
                <p className="text-gray-600 mb-2">
                  Redirection automatique vers l'accueil dans :
                </p>
                <div className="text-3xl font-bold text-blue-600">
                  {countdown}s
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    setIsRedirecting(true);
                    setTimeout(() => {
                      router.push('/?message=Compte créé avec succès ! Bienvenue sur IAhome.');
                    }, 100);
                  }}
                  disabled={isRedirecting}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRedirecting ? 'Redirection...' : 'Aller à l\'accueil maintenant'}
                </button>
                
                <button
                  onClick={() => {
                    setIsRedirecting(true);
                    setTimeout(() => {
                      router.push('/test-auth-display');
                    }, 100);
                  }}
                  disabled={isRedirecting}
                  className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tester l'affichage
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
