'use client';
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { useCustomAuth } from '../../hooks/useCustomAuth';
import Breadcrumb from '../../components/Breadcrumb';
import ModuleCard from '../../components/ModuleCard';

export default function Essentiels() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useCustomAuth();
  const [role, setRole] = useState<string | null>(null);
  const [selectedModules, setSelectedModules] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [userSubscriptions, setUserSubscriptions] = useState<{[key: string]: boolean}>({});
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Modules essentiels définis
  const essentialModules = [
    'librespeed',
    'metube', 
    'psitransfer',
    'qrcodes',
    'pdf',
    'code-learning',
    'apprendre-autrement',
    'home-assistant',
    'administration'
  ];

  // Vérification de l'authentification (optionnelle pour cette page)
  useEffect(() => {
    if (authLoading) return; // Attendre que l'authentification soit vérifiée
    
    // Authentification vérifiée
  }, [isAuthenticated, user, authLoading]);

  // Récupérer le rôle de l'utilisateur
  useEffect(() => {
    if (!user) return;
    
    // Le rôle est déjà disponible dans l'objet user de notre système d'authentification
    setRole(user.role || 'user');
  }, [user]);

  // Vérifier les sélections actives de l'utilisateur
  useEffect(() => {
    const checkUserSubscriptions = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('user_applications')
          .select(`
            module_id,
            expires_at
          `)
          .eq('user_id', user.id);

        if (error) {
          console.error('Erreur lors de la récupération des applications:', error);
          return;
        }

        const subscriptions: {[key: string]: boolean} = {};
        data?.forEach((sub: any) => {
          const isExpired = sub.expires_at && new Date(sub.expires_at) < new Date();
          subscriptions[sub.module_id] = !isExpired;
        });

        setUserSubscriptions(subscriptions);
      } catch (err) {
        console.error('Erreur lors de la vérification des abonnements:', err);
      }
    };

    checkUserSubscriptions();
  }, [user]);

  // Récupérer les modules depuis la base de données
  useEffect(() => {
    // Protection contre un chargement infini : forcer l'arrêt après 15 secondes
    const globalTimeout = setTimeout(() => {
      console.warn('⏱️ Timeout global: arrêt forcé du chargement après 15 secondes');
      setLoading(false);
      setError('Le chargement a pris trop de temps. Veuillez rafraîchir la page.');
    }, 15000);

    const fetchModules = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Wrapper la requête dans un Promise.race avec timeout pour éviter les blocages
        const supabaseQuery = supabase
          .from('modules')
          .select('*')
          .order('title');
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: La requête Supabase a pris plus de 10 secondes')), 10000)
        );
        
        let result: any;
        try {
          result = await Promise.race([supabaseQuery, timeoutPromise]);
        } catch (error) {
          console.error('❌ Erreur lors de la requête Supabase (timeout ou erreur):', error);
          result = { data: null, error: error };
        }
        
        const { data, error } = result || { data: null, error: new Error('Résultat Supabase indéfini') };

        if (error) {
          console.error('Erreur lors de la récupération des modules:', error);
          setError('Erreur lors du chargement des modules');
          setModules([]); // Initialiser avec un tableau vide
          return; // Le finally sera quand même exécuté
        }

        // Filtrer pour ne garder que les modules essentiels (exclure whisper)
        const essentialModulesData = data?.filter(module => 
          (essentialModules.includes(module.id) ||
          essentialModules.some(essentialId => 
            module.title.toLowerCase().includes(essentialId.toLowerCase()) ||
            module.title.toLowerCase().includes(essentialId.replace('-', ' '))
          )) && module.id !== 'whisper'
        ) || [];

        // Debug: vérifier si Home Assistant est dans les modules
        const homeAssistantModule = essentialModulesData.find(m => m.id === 'home-assistant' || m.title.toLowerCase().includes('domotisez'));
        if (homeAssistantModule) {
          console.log('✅ Home Assistant trouvé dans les modules essentiels:', homeAssistantModule);
        } else {
          console.log('⚠️ Home Assistant non trouvé dans les modules essentiels. Modules disponibles:', essentialModulesData.map(m => ({ id: m.id, title: m.title })));
        }

        setModules(essentialModulesData);
      } catch (err) {
        console.error('Erreur lors de la récupération des modules:', err);
        setError('Erreur lors du chargement des modules');
        setModules([]); // Initialiser avec un tableau vide en cas d'erreur
      } finally {
        clearTimeout(globalTimeout);
        setLoading(false); // ✅ Toujours arrêter le chargement, même en cas d'erreur
      }
    };

    fetchModules();
    
    // Cleanup function
    return () => {
      clearTimeout(globalTimeout);
    };
  }, []);

  // Gestion du scroll vers le haut
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fonction pour mapper les IDs de modules vers les slugs corrects pour les routes
  const getModuleSlug = (moduleId: string, moduleTitle: string): string => {
    // Mapping des IDs numériques et textuels vers les slugs corrects
    const moduleIdMapping: { [key: string]: string } = {
      // IDs numériques
      '1': 'pdf',
      '2': 'metube',
      '3': 'librespeed',
      '4': 'psitransfer',
      '5': 'qrcodes',
      '7': 'stablediffusion',
      '8': 'ruinedfooocus',
      '10': 'comfyui',
      '11': 'cogstudio',
      // IDs textuels (garder tels quels s'ils sont déjà corrects)
      'librespeed': 'librespeed',
      'metube': 'metube',
      'psitransfer': 'psitransfer',
      'qrcodes': 'qrcodes',
      'pdf': 'pdf',
      'pdf+': 'pdf',
      'stablediffusion': 'stablediffusion',
      'ruinedfooocus': 'ruinedfooocus',
      'comfyui': 'comfyui',
      'cogstudio': 'cogstudio',
      'code-learning': 'code-learning',
      'apprendre-autrement': 'apprendre-autrement',
      'meeting-reports': 'meeting-reports',
      'hunyuan3d': 'hunyuan3d',
      'whisper': 'whisper',
      'home-assistant': 'home-assistant',
      'administration': 'administration',
      'voice-isolation': 'voice-isolation',
      'photomaker': 'photomaker'
    };

    // Vérifier d'abord le mapping direct
    if (moduleIdMapping[moduleId]) {
      return moduleIdMapping[moduleId];
    }

    // Si pas de mapping, essayer de trouver par titre
    const titleLower = moduleTitle.toLowerCase();
    if (titleLower.includes('librespeed') || titleLower.includes('speed')) {
      return 'librespeed';
    }
    if (titleLower.includes('metube') || titleLower.includes('me tube')) {
      return 'metube';
    }
    if (titleLower.includes('psitransfer') || titleLower.includes('psi transfer')) {
      return 'psitransfer';
    }
    if (titleLower.includes('qrcode') || titleLower.includes('qr code')) {
      return 'qrcodes';
    }
    if (titleLower.includes('pdf')) {
      return 'pdf';
    }
    if (titleLower.includes('code learning') || titleLower.includes('code-learning')) {
      return 'code-learning';
    }
    if (titleLower.includes('apprendre autrement') || titleLower.includes('apprendre-autrement')) {
      return 'apprendre-autrement';
    }
    if (titleLower.includes('stable diffusion')) {
      return 'stablediffusion';
    }
    if (titleLower.includes('ruinedfooocus') || titleLower.includes('ruined fooocus')) {
      return 'ruinedfooocus';
    }
    if (titleLower.includes('comfyui') || titleLower.includes('comfy ui')) {
      return 'comfyui';
    }
    if (titleLower.includes('cogstudio') || titleLower.includes('cog studio')) {
      return 'cogstudio';
    }
    if (titleLower.includes('meeting reports') || titleLower.includes('meeting-reports')) {
      return 'meeting-reports';
    }
    if (titleLower.includes('hunyuan') || titleLower.includes('hunyuan3d')) {
      return 'hunyuan3d';
    }
    if (titleLower.includes('whisper')) {
      return 'whisper';
    }
    if (titleLower.includes('home assistant') || titleLower.includes('home-assistant') || titleLower.includes('domotique')) {
      return 'home-assistant';
    }
    if (titleLower.includes('administration') || titleLower.includes('services administratifs')) {
      return 'administration';
    }
    if (titleLower.includes('voice isolation') || titleLower.includes('voice-isolation') || titleLower.includes('isolation vocale')) {
      return 'voice-isolation';
    }

    // Fallback: utiliser l'ID tel quel (peut-être déjà un slug valide)
    return moduleId;
  };

  // Fonction pour gérer l'accès aux modules
  const handleModuleAccess = async (moduleId: string, moduleTitle: string) => {
    // Obtenir le slug correct pour le lien
    const moduleSlug = getModuleSlug(moduleId, moduleTitle);
    // Rediriger directement vers la page détaillée du module, même en mode déconnecté
    const moduleUrl = `/card/${moduleSlug}`;
    router.push(moduleUrl);
  };

  // Filtrer les modules selon la recherche
  const filteredModules = modules.filter(module => {
    const matchesSearch = !search || 
      module.title.toLowerCase().includes(search.toLowerCase()) ||
      module.description?.toLowerCase().includes(search.toLowerCase()) ||
      (module.categories || [module.category]).some((cat: string) =>
        cat.toLowerCase().includes(search.toLowerCase())
      );

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 font-sans">

      {/* Section héros */}
      <section className="bg-gradient-to-br from-yellow-100 via-green-50 to-green-200 py-16 relative overflow-hidden">
        {/* Effet de particules en arrière-plan */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-yellow-400/30 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-green-400/25 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 bg-yellow-500/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-green-500/30 rounded-full animate-bounce"></div>
          <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-yellow-600/15 rounded-full animate-pulse"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Contenu texte */}
            <div className="flex-1 max-w-2xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-yellow-800 via-green-800 to-green-900 bg-clip-text text-transparent leading-tight mb-4">
                Outils essentiels IAHome
              </h1>
              <p className="text-xl text-gray-700 mb-6">
                Les outils indispensables pour votre productivité : téléchargement de vidéos, transfert de fichiers, conversion PDF, test de vitesse internet, QR codes dynamiques, apprentissage du code, domotique et services administratifs. Tous accessibles directement depuis votre navigateur, sans téléchargement ni installation.
              </p>
              
              {/* Barre de recherche et bouton Mes applis */}
              <div className="flex flex-col sm:flex-row gap-4 max-w-lg">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Outils essentiels"
                    className="w-full px-6 py-4 pl-12 pr-16 rounded-xl border-2 border-green-200 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-200 transition-all"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                    </svg>
                  </div>
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-yellow-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-yellow-600 hover:to-green-700 transition-all font-medium">
                    Rechercher
                  </button>
                </div>
                
                {/* Bouton Mes applications - Visible seulement si connecté */}
                {user && (
                  <Link 
                    href="/encours" 
                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-800 font-semibold px-6 py-4 rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 min-w-[160px]"
                  >
                    <span className="text-lg">📱</span>
                    <span className="hidden sm:inline">Mes applications</span>
                    <span className="sm:hidden">Mes applications</span>
                  </Link>
                )}
              </div>
            </div>
            
            {/* Illustration */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-80 h-64">
                {/* Formes géométriques abstraites */}
                <div className="absolute top-0 left-0 w-24 h-24 bg-red-400 rounded-full opacity-60 animate-pulse"></div>
                <div className="absolute top-16 right-0 w-20 h-20 bg-yellow-400 rounded-lg opacity-60 animate-bounce"></div>
                <div className="absolute bottom-0 left-16 w-20 h-20 bg-green-400 transform rotate-45 opacity-60 animate-pulse"></div>
                <div className="absolute bottom-16 right-16 w-16 h-16 bg-blue-400 rounded-full opacity-60 animate-bounce"></div>
                
                {/* Éléments centraux */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-left">
                    <div className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-green-700 bg-clip-text text-transparent mb-3">IAHome</div>
                    <div className="text-xs text-gray-600">Intelligence Artificielle</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section principale avec contenu */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="w-full">

        {/* Grille des modules */}
        {filteredModules.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Aucune application essentielle trouvée</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModules.map((module) => (
              <div key={module.id} onClick={() => handleModuleAccess(module.id, module.title)}>
                <ModuleCard
                  module={module}
                  userEmail={user?.email}
                />
              </div>
            ))}
          </div>
        )}
          </div>
        </div>
      </section>

      {/* Bouton de retour en haut */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          title="Retour en haut"
          aria-label="Retour en haut de page"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2} 
            stroke="currentColor" 
            className="w-6 h-6"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M4.5 15.75l7.5-7.5 7.5 7.5" 
            />
          </svg>
        </button>
      )}
    </div>
  );
}
