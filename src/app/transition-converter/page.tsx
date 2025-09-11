'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import { supabase } from '../../utils/supabaseClient';

export default function TransitionConverterPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Initialisation...');

  useEffect(() => {
    const steps = [
      { progress: 20, status: 'Préparation du convertisseur...' },
      { progress: 40, status: 'Ajout à vos applications...' },
      { progress: 60, status: 'Configuration de l\'accès...' },
      { progress: 80, status: 'Ouverture de l\'application...' },
      { progress: 100, status: 'Terminé !' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep].progress);
        setStatus(steps[currentStep].status);
        currentStep++;
      } else {
        clearInterval(interval);
        // Ajouter le module à la page /encours
        addModuleToEncours();
        // Rediriger immédiatement vers /encours
        setTimeout(() => {
          router.push('/encours');
        }, 500);
        
        // Ouvrir l'application en arrière-plan après la redirection
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user?.id) {
              // Utilisateur connecté - générer le token et ouvrir l'application
              generateConverterToken().then(converterUrl => {
                if (converterUrl) {
                  // Ouvrir l'application dans un nouvel onglet avec le token
                  window.open(converterUrl, '_blank');
                } else {
                  // Fallback vers l'URL directe si le token échoue
                  window.open('https://converter.iahome.fr', '_blank');
                }
              });
            } else {
              // Utilisateur non connecté - rediriger vers la page de connexion
              console.log('Utilisateur non connecté - redirection vers la page de connexion');
              router.push('/login');
            }
          });
        }, 1000);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [router]);

  const addModuleToEncours = async () => {
    try {
      // Récupérer l'utilisateur connecté
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        console.log('Utilisateur non connecté - simulation de l\'ajout du module');
        // Simuler l'ajout pour les utilisateurs non connectés
        return;
      }

      // Appeler l'API pour ajouter le module
      const response = await fetch('/api/add-module-to-encours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          moduleId: 'converter'
        })
      });

      if (response.ok) {
        console.log('Module Universal Converter ajouté à /encours');
      } else {
        const errorData = await response.json();
        console.error('Erreur lors de l\'ajout du module:', errorData);
        // Continuer même en cas d'erreur
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du module:', error);
      // Continuer même en cas d'erreur
    }
  };

  const generateConverterToken = async () => {
    try {
      // Vérifier d'abord si l'utilisateur est connecté
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        console.log('Utilisateur non connecté - pas de token généré');
        return null;
      }

      const response = await fetch('/api/converter-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        return data.url; // URL avec le token
      } else {
        console.error('Erreur lors de la génération du token');
        return null;
      }
    } catch (error) {
      console.error('Erreur lors de la génération du token:', error);
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center">
          {/* Logo du convertisseur */}
          <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="currentColor"/>
              <path d="M8 8 L16 8 L16 16 L8 16 Z" fill="white" opacity="0.9"/>
              <path d="M10 10 L14 10 L14 14 L10 14 Z" fill="currentColor"/>
              <path d="M12 6 L12 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M6 12 L18 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>

          {/* Titre */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔄 Universal Converter
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Configuration de votre accès au convertisseur universel
          </p>

          {/* Barre de progression */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-gray-200 rounded-full h-4 mb-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-lg font-semibold text-gray-700">
              {progress}% - {status}
            </div>
          </div>

          {/* Animation de chargement */}
          <div className="flex justify-center space-x-2 mb-8">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>

          {/* Informations */}
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🚀 Ce qui se passe :
            </h3>
            <ul className="text-left space-y-2 text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Ajout du module à votre page "Mes Applications"
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                Configuration de l'accès sécurisé
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                Redirection vers votre page "Mes Applications"
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Ouverture automatique de l'application
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
