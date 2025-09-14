'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';

export default function TransitionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [moduleName, setModuleName] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [isActivating, setIsActivating] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const module = searchParams.get('module');
    const id = searchParams.get('id');
    
    if (module) setModuleName(decodeURIComponent(module));
    if (id) setModuleId(id);

    // Simuler le processus d'activation
    const activationProcess = async () => {
      // Étape 1: Vérification des permissions (20%)
      await new Promise(resolve => setTimeout(resolve, 500));
      setProgress(20);

      // Étape 2: Configuration du module (40%)
      await new Promise(resolve => setTimeout(resolve, 500));
      setProgress(40);

      // Étape 3: Installation des dépendances (60%)
      await new Promise(resolve => setTimeout(resolve, 500));
      setProgress(60);

      // Étape 4: Finalisation (80%)
      await new Promise(resolve => setTimeout(resolve, 500));
      setProgress(80);

      // Étape 5: Activation complète (100%)
      await new Promise(resolve => setTimeout(resolve, 500));
      setProgress(100);
      setIsActivating(false);

      // Rediriger vers /encours après 2 secondes
      setTimeout(() => {
        router.push('/encours');
      }, 2000);
    };

    activationProcess();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Icône du module */}
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">🎯</span>
        </div>

        {/* Titre */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Activation en cours
        </h1>
        
        {/* Nom du module */}
        <p className="text-lg text-gray-600 mb-8">
          {moduleName}
        </p>

        {/* Barre de progression */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">
            {isActivating ? `${progress}% complété` : 'Activation terminée !'}
          </p>
        </div>

        {/* Messages d'état */}
        <div className="space-y-2 mb-8">
          {progress >= 20 && (
            <p className="text-sm text-green-600 flex items-center justify-center">
              <span className="mr-2">✅</span>
              Permissions vérifiées
            </p>
          )}
          {progress >= 40 && (
            <p className="text-sm text-green-600 flex items-center justify-center">
              <span className="mr-2">✅</span>
              Module configuré
            </p>
          )}
          {progress >= 60 && (
            <p className="text-sm text-green-600 flex items-center justify-center">
              <span className="mr-2">✅</span>
              Dépendances installées
            </p>
          )}
          {progress >= 80 && (
            <p className="text-sm text-green-600 flex items-center justify-center">
              <span className="mr-2">✅</span>
              Finalisation en cours
            </p>
          )}
          {progress >= 100 && (
            <p className="text-sm text-green-600 flex items-center justify-center">
              <span className="mr-2">🎉</span>
              Module activé avec succès !
            </p>
          )}
        </div>

        {/* Animation de chargement */}
        {isActivating && (
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Message de redirection */}
        {!isActivating && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">
              Redirection vers vos applications...
            </p>
          </div>
        )}

        {/* Bouton de retour (si nécessaire) */}
        <button
          onClick={() => router.push('/applications')}
          className="mt-6 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Retour aux applications
        </button>
      </div>
    </div>
  );
}
