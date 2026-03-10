'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '../../../components/Breadcrumb';
import Link from 'next/link';
import { useCustomAuth } from '../../../hooks/useCustomAuth';
import CardPageActivationSection from '../../../components/CardPageActivationSection';

export default function AIDetectorCardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useCustomAuth();
  const [loading, setLoading] = useState(false);

  const moduleId = 'ai-detector';

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de l'authentification...</p>
          <p className="text-sm text-gray-500 mt-2">Si le chargement prend trop de temps, veuillez rafraîchir la page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Fil d'Ariane */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 pt-2">
        <div className="max-w-7xl mx-auto px-6 py-1">
          <Breadcrumb 
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Détecteur de Contenu IA' }
            ]}
          />
        </div>
      </div>

      {/* Bannière spéciale */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-500 py-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-4 h-4 bg-yellow-300 rounded-full animate-bounce"></div>
          <div className="absolute top-20 right-20 w-3 h-3 bg-blue-300 rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 left-1/4 w-5 h-5 bg-green-300 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 right-1/3 w-2 h-2 bg-red-300 rounded-full animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1 max-w-2xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                Détecteur de Contenu IA : Analysez vos documents et images
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                DÉTECTION IA
              </span>
              <p className="text-xl text-white/90 mb-6">
                Analysez vos documents texte, PDF, DOCX et images pour détecter la proportion de contenu généré par l'intelligence artificielle. Détection précise avec scores détaillés.
              </p>
              
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  📝 Analyse de texte
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  📄 Support PDF/DOCX
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🖼️ Détection d'images
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  📊 Scores détaillés
                </span>
              </div>
            </div>
            
            {/* Logo animé */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                <div className="absolute top-0 left-0 w-24 h-24 bg-yellow-300 rounded-full opacity-80 animate-pulse"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-blue-300 rounded-lg opacity-80 animate-bounce"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-purple-300 transform rotate-45 opacity-80 animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-white rounded-full opacity-80 animate-bounce"></div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-sm rounded-full p-8 shadow-2xl border-4 border-blue-500/20">
                    <span className="text-8xl">🔍</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section principale - Description */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Colonne 1 - Description */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                À propos de l'application
              </h2>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg">
                  Le Détecteur de Contenu IA est un outil avancé qui analyse vos documents et images pour déterminer si le contenu a été généré par une intelligence artificielle.
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="font-semibold text-blue-900 mb-2">✨ Fonctionnalités :</p>
                  <ul className="list-disc list-inside text-blue-800 space-y-1">
                    <li>Analyse de texte (collage direct ou fichiers)</li>
                    <li>Support des formats PDF et DOCX</li>
                    <li>Détection d'images générées par IA</li>
                    <li>Scores détaillés avec analyse phrase par phrase</li>
                    <li>Détection du style IA (ChatGPT, Claude, etc.)</li>
                    <li>100 crédits par accès</li>
                  </ul>
                </div>
              </div>
            </div>
          
            {/* Colonne 2 - Accès */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
              <div className="space-y-6">
                <div className="w-full">
                  <button
                    onClick={async () => {
                      if (isAuthenticated && user) {
                        try {
                          setLoading(true);
                          const response = await fetch('/api/generate-access-token', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              moduleId,
                              userId: user.id,
                              userEmail: user.email,
                            }),
                          });
                          if (!response.ok) {
                            const err = await response.json().catch(() => ({}));
                            throw new Error(err.error || `Erreur ${response.status}`);
                          }
                          const data = await response.json();
                          if (data.token) {
                            const url = typeof window !== 'undefined' && window.location.hostname === 'localhost'
                              ? `${window.location.origin}/ai-detector?token=${encodeURIComponent(data.token)}`
                              : `https://iahome.fr/ai-detector?token=${encodeURIComponent(data.token)}`;
                            window.open(url, '_blank');
                          } else {
                            throw new Error('Token manquant');
                          }
                        } catch (error) {
                          alert('Erreur lors de l\'accès: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
                        } finally {
                          setLoading(false);
                        }
                      } else {
                        router.push(`/login?redirect=${encodeURIComponent(`/card/${moduleId}`)}`);
                      }
                    }}
                    disabled={loading}
                    className={`w-full font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3
                      ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'}`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        <span>Ouverture en cours...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xl">🔍</span>
                        <span>{isAuthenticated && user ? 'Accéder au Détecteur IA (100 crédits)' : 'Connectez-vous pour accéder (100 crédits)'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section d'accès en bas de page */}
      <CardPageActivationSection
        moduleId={moduleId}
        moduleName="AI Detector"
        tokenCost={100}
        tokenUnit="par accès"
        gradientColors="from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
        icon="🔍"
        accessUrl={typeof window !== 'undefined' && window.location.hostname === 'localhost'
          ? `${window.location.origin}/ai-detector`
          : 'https://iahome.fr/ai-detector'}
      />
    </div>
  );
}






