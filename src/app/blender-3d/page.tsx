'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Chat3DMCP from '../../components/Chat3DMCP';
import Breadcrumb from '../../components/Breadcrumb';

export default function Blender3DPage() {
  const [loading, setLoading] = useState(true);
  const [servicesStatus, setServicesStatus] = useState({
    webui: false,
    api: false
  });

  useEffect(() => {
    // Simuler un chargement rapide
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    // Vérifier le statut des services Blender
    checkServicesStatus();

    return () => clearTimeout(timer);
  }, []);

  const checkServicesStatus = async () => {
    try {
      // Vérifier l'interface web Blender
      const webuiResponse = await fetch('http://localhost:9091', { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      setServicesStatus(prev => ({ ...prev, webui: true }));
    } catch (error) {
      console.log('Interface web Blender non accessible');
    }

    try {
      // Vérifier l'API Blender
      const apiResponse = await fetch('http://localhost:3001/health', { 
        method: 'GET',
        mode: 'no-cors'
      });
      setServicesStatus(prev => ({ ...prev, api: true }));
    } catch (error) {
      console.log('API Blender non accessible');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">chargement</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Fil d'Ariane */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 pt-2">
        <div className="max-w-7xl mx-auto px-6 py-1">
          <Breadcrumb 
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Générateur 3D Blender' }
            ]}
          />
        </div>
      </div>

      {/* Bannière spéciale pour Blender 3D */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 py-8 relative overflow-hidden">
        {/* Effet de particules animées */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-white/30 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 bg-white/25 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-white/20 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-white/15 rounded-full animate-pulse"></div>
        </div>
        
        {/* Effet de vague en bas */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/10 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Contenu texte */}
            <div className="flex-1 max-w-2xl">
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                Créez des objets 3D avec l'IA
              </h1>
              <span className="inline-block px-4 py-2 bg-white/20 text-white text-sm font-bold rounded-full mb-4 backdrop-blur-sm">
                3D GENERATION
              </span>
              <p className="text-xl text-blue-100 mb-6">
                Blender 3D vous permet de créer des objets 3D de haute qualité à partir de descriptions textuelles avec une précision et une créativité exceptionnelles.
              </p>
              
              {/* Badges de fonctionnalités */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🎨 Modélisation 3D
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🤖 IA avancée
                </span>
                <span className="bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  ⚡ Génération rapide
                </span>
              </div>
            </div>
            
            {/* Logo Blender 3D animé */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                {/* Formes géométriques 3D abstraites */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-blue-400 rounded-full opacity-80 animate-pulse"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-indigo-400 rounded-lg opacity-80 animate-bounce"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-purple-400 transform rotate-45 opacity-80 animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-white rounded-full opacity-80 animate-bounce"></div>
                
                {/* Logo 3D centré */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-sm rounded-full p-6 shadow-2xl border-2 border-blue-500/20">
                    <svg className="w-20 h-20" viewBox="0 0 24 24" fill="none">
                      {/* Cube 3D stylisé */}
                      <path 
                        d="M4 4 L20 4 L20 20 L4 20 Z" 
                        stroke="#3B82F6" 
                        strokeWidth="2" 
                        fill="none"
                      />
                      <path 
                        d="M4 4 L12 12 L20 4" 
                        stroke="#3B82F6" 
                        strokeWidth="2" 
                        fill="none"
                      />
                      <path 
                        d="M12 12 L12 20" 
                        stroke="#3B82F6" 
                        strokeWidth="2" 
                        fill="none"
                      />
                      <path 
                        d="M20 4 L12 12" 
                        stroke="#3B82F6" 
                        strokeWidth="2" 
                        fill="none"
                      />
                      
                      {/* Points 3D */}
                      <circle cx="4" cy="4" r="1" fill="#3B82F6" className="animate-pulse">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
                      </circle>
                      <circle cx="20" cy="4" r="1" fill="#3B82F6" className="animate-pulse">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="0.5s"/>
                      </circle>
                      <circle cx="4" cy="20" r="1" fill="#3B82F6" className="animate-pulse">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="1s"/>
                      </circle>
                      <circle cx="20" cy="20" r="1" fill="#3B82F6" className="animate-pulse">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" begin="1.5s"/>
                      </circle>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interface de chat et services - Zone séparée après la bannière */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Colonne 1 - Interface de chat */}
          <div className="w-full bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
            <div className="text-left mb-8">
              <div className="w-3/4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-2xl shadow-lg mb-4">
                <div className="text-4xl font-bold mb-1">
                  Free
                </div>
                <div className="text-sm opacity-90">
                  Gratuit
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Boutons d'action */}
              <div className="space-y-4">
                <button 
                  className="w-3/4 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  onClick={() => {
                    const chatSection = document.getElementById('chat-section');
                    if (chatSection) {
                      chatSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <span className="text-xl">🎨</span>
                  <span>Commencer à créer</span>
                </button>
                
                <button 
                  className="w-3/4 font-semibold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  onClick={() => window.open('http://localhost:9091', '_blank')}
                >
                  <span className="text-xl">🔗</span>
                  <span>Interface Web Blender</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Colonne 2 - Services Blender Virtualisés */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              🔗 Services Blender Virtualisés
            </h3>
            <div className="space-y-4">
              {/* Interface Web Blender */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Interface Web Blender</h4>
                  <div className={`w-3 h-3 rounded-full ${servicesStatus.webui ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Visualisez et téléchargez les fichiers 3D générés par Blender.
                </p>
                <div className="flex space-x-2">
                  <a
                    href="http://localhost:9091"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Ouvrir l'interface
                  </a>
                  <span className="text-xs text-gray-500 self-center">
                    Port 9091
                  </span>
                </div>
              </div>

              {/* API Blender */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900">API Blender</h4>
                  <div className={`w-3 h-3 rounded-full ${servicesStatus.api ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  API Python pour communiquer directement avec Blender.
                </p>
                <div className="flex space-x-2">
                  <a
                    href="http://localhost:3001/health"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Tester l'API
                  </a>
                  <span className="text-xs text-gray-500 self-center">
                    Port 3001
                  </span>
                </div>
              </div>
            </div>

            {/* Informations supplémentaires */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">💡 Informations</h5>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• <strong>Interface Web :</strong> Visualisez les fichiers .obj, .stl, .fbx générés</li>
                <li>• <strong>API :</strong> Communiquez directement avec Blender via HTTP</li>
                <li>• <strong>Docker :</strong> Services conteneurisés dans <code>docker-services/</code></li>
                <li>• <strong>Démarrage :</strong> <code>.\start-blender-virtualized.ps1</code> depuis la racine</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Section "À propos de" en pleine largeur maximale */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 w-full relative overflow-hidden">
        {/* Effet de particules en arrière-plan */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400/20 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-indigo-400/30 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 bg-purple-400/25 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-blue-400/20 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-indigo-400/15 rounded-full animate-pulse"></div>
        </div>
        
        <div className="w-full px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 sm:p-12 lg:p-16 hover:shadow-3xl transition-all duration-300">
            <div className="prose max-w-none">
              <div className="text-center mb-12">
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-4">
                  À propos de Blender 3D
                </h3>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
              </div>
              
              <div className="space-y-8 sm:space-y-12 text-gray-700">
                {/* Description principale */}
                <div className="text-center max-w-5xl mx-auto">
                  <p className="text-lg sm:text-xl lg:text-2xl leading-relaxed text-gray-700 mb-6">
                    Blender 3D est un logiciel de modélisation 3D révolutionnaire qui transforme vos descriptions textuelles en objets 3D de haute qualité. 
                    Cette technologie de pointe vous permet de créer des modèles uniques et créatifs en quelques secondes.
                  </p>
                </div>

                {/* Fonctionnalités principales */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 my-12">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 sm:p-8 rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">🎨</span>
                      </div>
                      <h4 className="font-bold text-blue-900 mb-3 text-lg">Modélisation 3D</h4>
                      <p className="text-gray-700 text-sm">Créez des objets 3D complexes avec des outils de modélisation avancés.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 sm:p-8 rounded-2xl border border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">🤖</span>
                      </div>
                      <h4 className="font-bold text-indigo-900 mb-3 text-lg">IA Avancée</h4>
                      <p className="text-gray-700 text-sm">Génération intelligente d'objets 3D à partir de descriptions textuelles.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 sm:p-8 rounded-2xl border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">⚡</span>
                      </div>
                      <h4 className="font-bold text-purple-900 mb-3 text-lg">Performance</h4>
                      <p className="text-gray-700 text-sm">Génération rapide d'objets 3D avec notre infrastructure optimisée.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 sm:p-8 rounded-2xl border border-cyan-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-2xl">🌐</span>
                      </div>
                      <h4 className="font-bold text-cyan-900 mb-3 text-lg">Accessibilité</h4>
                      <p className="text-gray-700 text-sm">Interface intuitive accessible à tous les niveaux d'expertise.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interface de chat MCP */}
      <div id="chat-section" className="max-w-7xl mx-auto px-6 py-8">
        <Chat3DMCP />
      </div>
    </div>
  );
}
