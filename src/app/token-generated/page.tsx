'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';

function TokenGeneratedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [moduleName, setModuleName] = useState<string>('');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Récupérer le nom du module depuis les paramètres d'URL
    const module = searchParams.get('module');
    if (module) {
      setModuleName(module);
    }

    // Compte à rebours automatique
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/encours');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [searchParams, router]);

  const getModuleColor = (module: string) => {
    switch (module.toLowerCase()) {
      case 'psitransfer':
        return 'from-green-500 to-teal-600';
      case 'metube':
        return 'from-red-500 to-pink-600';
      case 'pdf+':
      case 'pdf':
        return 'from-green-500 to-emerald-600';
      case 'librespeed':
        return 'from-blue-500 to-purple-600';
      default:
        return 'from-blue-500 to-indigo-600';
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module.toLowerCase()) {
      case 'psitransfer':
        return '📁';
      case 'metube':
        return '📹';
      case 'pdf+':
      case 'pdf':
        return '📄';
      case 'librespeed':
        return '⚡';
      default:
        return '🔑';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Header />
      
      {/* Page de transition */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="max-w-2xl w-full">
          {/* Carte principale */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-12 hover:shadow-3xl transition-all duration-300">
            
            {/* Animation de succès */}
            <div className="text-center mb-8">
              <div className="relative inline-block">
                {/* Cercle de fond animé */}
                <div className={`w-24 h-24 bg-gradient-to-r ${getModuleColor(moduleName)} rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse`}>
                  <span className="text-4xl">{getModuleIcon(moduleName)}</span>
                </div>
                
                {/* Badge de succès */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <span className="text-white text-sm">✓</span>
                </div>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Token Premium Généré !
              </h1>
              
              <p className="text-lg text-gray-600 mb-2">
                Votre token premium pour <span className="font-semibold text-blue-600">{moduleName}</span> a été créé avec succès.
              </p>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-8">
                <div className="flex items-center justify-center space-x-4 text-sm text-green-800">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span>20 utilisations</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span>3 mois de validité</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span>Accès premium</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Options de navigation */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">
                Que souhaitez-vous faire maintenant ?
              </h2>
              
              {/* Bouton vers /encours */}
              <Link 
                href="/encours"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <span className="text-2xl">📊</span>
                <span>Voir mes tokens et statistiques</span>
              </Link>
              
              {/* Bouton vers l'accueil */}
              <Link 
                href="/"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <span className="text-2xl">🏠</span>
                <span>Retourner à l'accueil</span>
              </Link>
              
              {/* Compte à rebours */}
              <div className="text-center mt-6">
                <p className="text-sm text-gray-500">
                  Redirection automatique vers vos tokens dans <span className="font-semibold text-blue-600">{countdown}</span> secondes
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Informations supplémentaires */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="text-2xl mb-2">🔑</div>
                  <div className="text-sm font-semibold text-blue-900">Token Premium</div>
                  <div className="text-xs text-blue-600">Accès étendu</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl">
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-sm font-semibold text-green-900">Suivi détaillé</div>
                  <div className="text-xs text-green-600">Statistiques complètes</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <div className="text-2xl mb-2">⚡</div>
                  <div className="text-sm font-semibold text-purple-900">Accès immédiat</div>
                  <div className="text-xs text-purple-600">Utilisation instantanée</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TokenGeneratedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <TokenGeneratedContent />
    </Suspense>
  );
}

