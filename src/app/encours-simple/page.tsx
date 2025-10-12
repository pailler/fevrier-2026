'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface UserModule {
  id: number;
  module_id: string;
  module_title: string;
  module_category: string;
  access_type: string;
  is_free: boolean;
  price: number;
}

export default function EncoursSimplePage() {
  const [userModules, setUserModules] = useState<UserModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [cacheBuster] = useState(() => Date.now() + Math.random() * 1000);

  useEffect(() => {
    // Modules statiques pour tester les URLs
    const staticModules: UserModule[] = [
      {
        id: 1,
        module_id: '1',
        module_title: 'PDF+',
        module_category: 'Module essentiel',
        access_type: 'Module essentiel',
        is_free: true,
        price: 0
      },
      {
        id: 2,
        module_id: '2', 
        module_title: 'MeTube',
        module_category: 'Module essentiel',
        access_type: 'Module essentiel',
        is_free: true,
        price: 0
      },
      {
        id: 3,
        module_id: '3',
        module_title: 'LibreSpeed',
        module_category: 'Module essentiel', 
        access_type: 'Module essentiel',
        is_free: true,
        price: 0
      },
      {
        id: 4,
        module_id: '4',
        module_title: 'PsiTransfer',
        module_category: 'Module essentiel',
        access_type: 'Module essentiel', 
        is_free: true,
        price: 0
      }
    ];
    
    setUserModules(staticModules);
    setLoading(false);
    console.log('✅ Modules statiques chargés:', staticModules.length);
  }, []);

  // Mapping des modules vers leurs routes de redirection sécurisées
  const getModuleUrl = (moduleId: string): string => {
    // Mapping des module_id (numériques) vers les slugs
    const moduleIdMapping: { [key: string]: string } = {
      '1': 'pdf',      // PDF+ -> pdf
      '2': 'metube',   // MeTube -> metube
      '3': 'librespeed', // LibreSpeed -> librespeed
      '4': 'psitransfer', // PsiTransfer -> psitransfer
      '5': 'qrcodes',  // QR Codes -> qrcodes
      '7': 'stablediffusion', // Stable Diffusion -> stablediffusion
      '8': 'ruinedfooocus', // Ruined Fooocus -> ruinedfooocus
      '9': 'invoke',   // Invoke AI -> invoke
      '10': 'comfyui', // ComfyUI -> comfyui
      '11': 'cogstudio', // Cog Studio -> cogstudio
      '12': 'sdnext',  // SD.Next -> sdnext
    };

    // Mapping des slugs vers les routes de redirection sécurisées
    const secureRedirectUrls: { [key: string]: string } = {
      'metube': '/api/redirect-metube',  // Redirection sécurisée MeTube
      'librespeed': '/api/redirect-librespeed',  // Redirection sécurisée LibreSpeed
      'pdf': '/api/redirect-pdf',  // Redirection sécurisée PDF
      'psitransfer': '/api/redirect-psitransfer',  // Redirection sécurisée PsiTransfer
      'qrcodes': '/api/redirect-qrcodes',  // Redirection sécurisée QR Codes
      'stablediffusion': '/api/redirect-stablediffusion',  // Redirection sécurisée StableDiffusion
      'ruinedfooocus': '/api/redirect-ruinedfooocus',  // Redirection sécurisée RuinedFooocus
      'invoke': '/api/redirect-invoke',  // Redirection sécurisée Invoke
      'comfyui': '/api/redirect-comfyui',  // Redirection sécurisée ComfyUI
      'cogstudio': '/api/redirect-cogstudio',  // Redirection sécurisée CogStudio
      'sdnext': '/api/redirect-sdnext',  // Redirection sécurisée SDNext
    };
    
    // Convertir module_id numérique en slug si nécessaire
    const slug = moduleIdMapping[moduleId] || moduleId;
    const url = secureRedirectUrls[slug] || '';
    
    console.log(`🔗 getModuleUrl: ${moduleId} -> ${slug} -> ${url}`);
    return url;
  };

  // Fonction pour accéder à un module
  const accessModule = async (module: UserModule) => {
    console.log('🚀 Accès au module:', module.module_title);
    
    const url = getModuleUrl(module.module_id);
    if (url) {
      console.log(`🌐 Ouverture de l'URL: ${url}`);
      window.open(url, '_blank');
    } else {
      console.error('❌ URL non trouvée pour le module:', module.module_id);
    }
  };

  // Fonction pour obtenir le label du type de module
  const getModuleTypeLabel = (module: UserModule) => {
    if (module.module_category === 'Token d\'accès') {
      return 'Token d\'accès';
    }
    
    // Pour les modules essentiels, afficher "Module essentiel"
    const essentialModules = ['metube', 'psitransfer', 'pdf', 'librespeed', 'qrcodes'];
    const isEssential = essentialModules.some(essentialId => 
      module.module_id === essentialId || 
      module.module_title.toLowerCase().includes(essentialId.toLowerCase()) ||
      module.module_title.toLowerCase().includes(essentialId.replace('-', ' '))
    );
    
    if (isEssential) {
      return 'Module essentiel ✅';
    }
    
    // Pour les autres modules, afficher "Module IA"
    return 'Module IA 🤖';
  };

  // Fonction pour obtenir l'icône du type de module
  const getModuleTypeIcon = (module: UserModule) => {
    if (module.module_category === 'Token d\'accès') {
      return '🎫';
    }
    
    // Pour les modules essentiels
    const essentialModules = ['metube', 'psitransfer', 'pdf', 'librespeed', 'qrcodes'];
    const isEssential = essentialModules.some(essentialId => 
      module.module_id === essentialId || 
      module.module_title.toLowerCase().includes(essentialId.toLowerCase()) ||
      module.module_title.toLowerCase().includes(essentialId.replace('-', ' '))
    );
    
    if (isEssential) {
      return '✅';
    }
    
    // Pour les autres modules (non-gratuits, non-tokens)
    return '🤖';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Chargement...</h2>
            <p className="text-gray-600">Veuillez patienter pendant le chargement de la page.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cache buster: {cacheBuster} */}
      <div className="bg-red-500 text-white p-4 text-center font-bold">
        🔄 VERSION MISE À JOUR - {new Date().toLocaleString()} - Cache buster: {cacheBuster}
        <br />
        <span className="text-sm">URLs CORRIGÉES - Test des liens MeTube/PDF</span>
        <br />
        <a href="/force-refresh" className="text-yellow-200 underline">🔄 Force Refresh</a>
      </div>
      <Header />
      
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Mes Modules d'Accès
            </h1>
            <p className="text-xl text-gray-600">
              Accédez directement à vos outils IA préférés
            </p>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{userModules.length}</div>
              <div className="text-gray-600">Modules disponibles</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {userModules.filter(m => m.is_free).length}
              </div>
              <div className="text-gray-600">Appli essentielle</div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {userModules.filter(m => !m.is_free).length}
              </div>
              <div className="text-gray-600">Modules premium</div>
            </div>
          </div>

          {/* Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userModules.map((module) => (
              <div key={module.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{module.module_title}</h3>
                    <span className="text-2xl">{getModuleTypeIcon(module)}</span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <span>🔑 {getModuleTypeLabel(module)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm opacity-90">
                    {/* Ne pas afficher "Appli essentielle" pour le module QR codes */}
                    {module.module_id !== '5' && module.module_id !== 'qrcodes' && (
                      <span>🔑 Appli essentielle</span>
                    )}
                    {module.price && Number(module.price) > 0 && (
                      <span>💎 €{module.price}</span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => accessModule(module)}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Accéder au module
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}


