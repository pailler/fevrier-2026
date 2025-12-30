'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ApprendreAutrementCardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Fil d'Ariane */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 pt-2">
        <div className="max-w-7xl mx-auto px-6 py-1">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Accueil
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Apprendre Autrement</span>
          </nav>
        </div>
      </div>

      {/* Bannière spéciale */}
      <section className="bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 py-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-4 h-4 bg-yellow-300 rounded-full animate-bounce"></div>
          <div className="absolute top-20 right-20 w-3 h-3 bg-pink-300 rounded-full animate-pulse"></div>
          <div className="absolute bottom-10 left-1/4 w-5 h-5 bg-blue-300 rounded-full animate-bounce"></div>
          <div className="absolute bottom-20 right-1/3 w-2 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1 max-w-2xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                🌟 Apprendre Autrement
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                ÉDUCATION ADAPTÉE
              </span>
              <p className="text-xl text-white/90 mb-6">
                Application d'apprentissage adaptée pour les enfants dys et autistes. 
                Des activités personnalisées avec messages vocaux d'encouragement.
              </p>
              
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  📅 Organisation
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  👨‍👩‍👧‍👦 Famille
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🎯 Activités
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🏆 Points & Badges
                </span>
              </div>
            </div>
            
            {/* Logo animé */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                <div className="absolute top-0 left-0 w-24 h-24 bg-yellow-300 rounded-full opacity-80 animate-pulse"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-pink-300 rounded-lg opacity-80 animate-bounce"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-blue-300 transform rotate-45 opacity-80 animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-white rounded-full opacity-80 animate-bounce"></div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-sm rounded-full p-8 shadow-2xl border-4 border-green-500/20">
                    <span className="text-8xl">🌟</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section principale */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Colonne 1 - Description */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📚 À propos</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              <strong>Apprendre Autrement</strong> est une application spécialement conçue pour les enfants 
              dyslexiques et autistes. Elle propose des activités adaptées avec un système de points, 
              badges et parcours d'apprentissage progressifs.
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              L'application inclut des messages vocaux personnalisés pour encourager l'enfant à chaque étape 
              de son parcours d'apprentissage.
            </p>
            
            <div className="mt-6 space-y-3">
              <h3 className="text-xl font-bold text-gray-800 mb-3">✨ Fonctionnalités principales</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2">🎯</span>
                  <span><strong>15 activités variées</strong> : couleurs, nombres, émotions, organisation, famille...</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">📅</span>
                  <span><strong>Calendrier visuel</strong> : organisation de la journée avec pictogrammes</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">👨‍👩‍👧‍👦</span>
                  <span><strong>Activités familiales</strong> : photos, voix, histoires, arbre généalogique</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🏆</span>
                  <span><strong>Système de points</strong> : 10 niveaux, badges, récompenses</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🗺️</span>
                  <span><strong>6 parcours</strong> : débutant, visuel, famille, organisation, avancé, complet</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🔊</span>
                  <span><strong>Messages vocaux</strong> : encouragements personnalisés à chaque étape</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">♿</span>
                  <span><strong>Accessibilité complète</strong> : polices, couleurs, contrastes personnalisables</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Colonne 2 - Accès */}
          <div className="space-y-6">
            {/* Carte d'accès */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">🚀 Accéder à l'application</h2>
              <p className="text-gray-700 mb-6">
                Cliquez sur le bouton ci-dessous pour accéder à l'application Apprendre Autrement.
              </p>
              
              <button
                onClick={() => router.push('/apprendre-autrement')}
                className="w-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white px-6 py-4 rounded-lg font-bold text-lg hover:from-green-600 hover:via-blue-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🌟 Ouvrir Apprendre Autrement
              </button>
            </div>

            {/* Informations techniques */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">ℹ️ Informations</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span className="font-semibold">Type :</span>
                  <span>Application web</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Technologie :</span>
                  <span>Next.js 15, React 19</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Stockage :</span>
                  <span>LocalStorage (navigateur)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Accessibilité :</span>
                  <span>WCAG 2.1</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}







