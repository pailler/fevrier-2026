'use client';
import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useRouter, useSearchParams } from 'next/navigation';
import Link from "next/link";
import { useCustomAuth } from '../../hooks/useCustomAuth';
import ModuleCard from '../../components/ModuleCard';
import EcosystemValueBlock from '../../components/marketing/EcosystemValueBlock';
import GpuInfrastructureBlock from '../../components/marketing/GpuInfrastructureBlock';
import FrenchTrustBlock from '../../components/marketing/FrenchTrustBlock';
import AudienceSegmentsBlock from '../../components/marketing/AudienceSegmentsBlock';
import {
  AUDIENCE_EMPTY_REDIRECT,
  AUDIENCE_SEGMENTS,
  getApplicationAudienceSegment,
  isAudienceSegmentId,
  type AudienceSegmentId,
} from '../../data/audienceSegments';

type OfferLevel = 'autonome' | 'accompagnement' | 'specialise';

const AI_OFFER_LEVELS: Record<string, OfferLevel> = {
  whisper: 'autonome',
  ruinedfooocus: 'autonome',
  birefnet: 'autonome',
  'florence-2': 'autonome',
  'prompt-generator': 'autonome',
  'cv-generator': 'autonome',
  'ai-detector': 'autonome',
  tts: 'autonome',
  stablediffusion: 'accompagnement',
  photomaker: 'accompagnement',
  'animagine-xl': 'accompagnement',
  'voice-isolation': 'accompagnement',
  'meeting-reports': 'accompagnement',
  musetalk: 'accompagnement',
  'photo-vivante': 'accompagnement',
  comfyui: 'specialise',
  hunyuan3d: 'specialise',
  hi3dgen: 'specialise',
  cogstudio: 'specialise',
};

const AI_OFFER_NOTES: Record<string, string> = {
  whisper: 'Importez un fichier audio ou vidéo et récupérez directement sa transcription.',
  ruinedfooocus: 'Décrivez votre image et obtenez un premier résultat avec une interface simplifiée.',
  birefnet: 'Détourez une image et récupérez un fond transparent en quelques clics.',
  'florence-2': 'Analysez une image, extrayez son texte ou obtenez une description automatiquement.',
  'prompt-generator': 'Transformez une idée courte en prompt structuré prêt à réutiliser.',
  'cv-generator': 'Créez un CV optimisé ATS et une lettre de motivation avec l\'IA.',
  'ai-detector': 'Analysez un texte et utilisez le score comme indication, avec recul critique.',
  tts: 'Collez un texte, choisissez une voix et générez votre piste audio.',
  stablediffusion: 'Un atelier aide à maîtriser les prompts, modèles et paramètres de génération.',
  photomaker: 'La préparation des photos sources et du style peut être réalisée avec vous.',
  'animagine-xl': 'Un accompagnement aide à préciser le style, la composition et les prompts anime.',
  'voice-isolation': 'La qualité dépend du fichier et des réglages ; une prise en main peut optimiser le résultat.',
  'meeting-reports': 'Construisez un workflow adapté à vos réunions, comptes rendus et actions à suivre.',
  musetalk: 'Préparez correctement le portrait, l’audio et les paramètres de synchronisation labiale.',
  'photo-vivante': 'Choisissez l’image et le mouvement adaptés pour obtenir une animation crédible.',
  comfyui: 'IAHome peut préparer un workflow avancé et réutilisable pour votre besoin créatif.',
  hunyuan3d: 'Transformez une image en modèle 3D puis étudiez sa préparation pour le prototypage.',
  hi3dgen: 'Un projet peut aller de l’image source jusqu’au fichier 3D préparé pour impression.',
  cogstudio: 'La réalisation combine scénario, génération, sélection des plans et préparation de la vidéo.',
};

/** Toujours affichés sur /applications (même si absents ou masqués en base). */
const GUARANTEED_APPLICATIONS = [
  {
    id: 'cv-generator',
    title: 'Générateur de CV IA',
    subtitle: 'Import CV / LinkedIn · score ATS · export PDF',
    description:
      'Créez un CV professionnel optimisé pour les ATS avec l\'IA : import depuis PDF ou LinkedIn, adaptation au poste, lettre de motivation.',
    category: 'Productivité',
    price: 100,
    url: '/card/cv-generator',
    image_url: '/images/cv-generator.svg',
    is_visible: true,
  },
];

function mergeApplicationModules(dbModules: any[], fallbacks: any[]) {
  const map = new Map<string, any>();
  const norm = (id: unknown) => String(id ?? '').trim().toLowerCase();

  for (const m of dbModules) {
    const id = norm(m.id);
    if (!id || m.is_visible === false) continue;
    map.set(id, m);
  }
  for (const m of fallbacks) {
    const id = norm(m.id);
    if (!id || map.has(id)) continue;
    map.set(id, m);
  }
  for (const g of GUARANTEED_APPLICATIONS) {
    const id = norm(g.id);
    const existing = map.get(id);
    map.set(
      id,
      existing
        ? {
            ...g,
            ...existing,
            url: existing.url || g.url,
            subtitle: existing.subtitle || g.subtitle,
            description: existing.description || g.description,
            is_visible: true,
          }
        : { ...g }
    );
  }
  return Array.from(map.values());
}

function getAiOfferLevel(module: { id?: unknown; title?: string }): OfferLevel {
  const id = String(module.id ?? '').trim().toLowerCase();
  if (AI_OFFER_LEVELS[id]) return AI_OFFER_LEVELS[id];

  const title = (module.title ?? '').toLowerCase().replace(/\s+/g, '');
  if (title.includes('générateurdecv') || title.includes('curriculum') || title.includes('cvia')) {
    return 'autonome';
  }
  if (title.includes('comfy') || title.includes('3d') || title.includes('cogstudio')) return 'specialise';
  if (
    title.includes('stable') ||
    title.includes('photomaker') ||
    title.includes('musetalk') ||
    title.includes('meeting')
  ) {
    return 'accompagnement';
  }
  return 'autonome';
}

function getAiOfferNote(module: { id?: unknown; title?: string }): string {
  const id = String(module.id ?? '').trim().toLowerCase();
  return AI_OFFER_NOTES[id] ?? 'L’application peut être utilisée directement pour obtenir un premier résultat.';
}

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, loading: authLoading } = useCustomAuth();
  const [role, setRole] = useState<string | null>(null);
  const [selectedModules, setSelectedModules] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forceShowContent, setForceShowContent] = useState(false);
  const [segmentFilter, setSegmentFilter] = useState<'all' | AudienceSegmentId>('all');

  const [userSubscriptions, setUserSubscriptions] = useState<{[key: string]: boolean}>({});
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    const segment = searchParams.get('segment');
    if (isAudienceSegmentId(segment)) {
      setSegmentFilter(segment);
    }
  }, [searchParams]);

  // Vérification de l'authentification (optionnelle pour cette page)
  useEffect(() => {
    // Protection : si authLoading reste à true trop longtemps, ne pas bloquer
    if (authLoading) {
      // Timeout de sécurité : ne pas attendre indéfiniment
      const authTimeout = setTimeout(() => {
        console.warn('⚠️ authLoading prend trop de temps, continuation du chargement...');
      }, 5000);
      
      return () => clearTimeout(authTimeout);
    }
    
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
          .select('module_id')
          .eq('user_id', user.id)
          .eq('is_active', true);
        
        if (!error && data) {
          const subscriptions: {[key: string]: boolean} = {};
          // Pour l'instant, on marque juste que l'utilisateur a des accès actifs
          data.forEach(sub => {
            subscriptions[`module_${sub.module_id}`] = true;
          });
          setUserSubscriptions(subscriptions);
          }
      } catch (error) {
        }
    };

    if (user) {
      checkUserSubscriptions();
    }
  }, [user]);

  useEffect(() => {
    // Protection contre un chargement infini : forcer l'arrêt après 8 secondes
    const globalTimeout = setTimeout(() => {
      console.warn('⏱️ Timeout global: arrêt forcé du chargement après 8 secondes');
      setLoading(false);
      setForceShowContent(true); // Forcer l'affichage du contenu
      if (!error) {
        setError('Le chargement a pris trop de temps. Affichage du contenu disponible.');
      }
      // Si modules est vide, initialiser avec un tableau vide
      if (modules.length === 0) {
        setModules([]);
      }
    }, 8000);

    // Charger les modules depuis Supabase
    const fetchModules = async () => {
      try {
        setError(null);
        setLoading(true);
        
        // Wrapper les requêtes dans un Promise.race avec timeout pour éviter les blocages (réduit à 5 secondes)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: La requête Supabase a pris plus de 5 secondes')), 5000)
        );
        
        // Test de connexion de base avec timeout
        let testResult: any;
        try {
          const testQuery = supabase
            .from('modules')
            .select('count')
            .limit(1);
          testResult = await Promise.race([testQuery, timeoutPromise]);
        } catch (error) {
          console.error('❌ Erreur lors de la requête de test Supabase (timeout ou erreur):', error);
          testResult = { data: null, error: error };
        }
        
        const { error: testError } = testResult || { error: new Error('Résultat Supabase indéfini') };
        
        if (testError) {
          throw new Error(`Erreur de connexion à la base de données: ${testError.message}`);
        }
        
        // Récupérer les modules (structure simple sans jointure) avec timeout
        let modulesResult: any;
        try {
          const modulesQuery = supabase
            .from('modules')
            .select('*');
          modulesResult = await Promise.race([modulesQuery, timeoutPromise]);
        } catch (error) {
          console.error('❌ Erreur lors de la requête modules Supabase (timeout ou erreur):', error);
          modulesResult = { data: null, error: error };
        }
        
        const { data: modulesData, error: modulesError } = modulesResult || { data: null, error: new Error('Résultat Supabase indéfini') };
        
        if (modulesError) {
          throw new Error(`Erreur lors du chargement des modules: ${modulesError.message}`);
        } else {
          // Modules chargés avec succès
          
          // Module Sentinelle Numérique (à afficher même si absent de la DB)
          const sentinelleModule = {
            id: 'sentinelle-numerique',
            title: 'Sentinelle Numérique',
            subtitle: 'Cybersécurité personnelle et processus de fin de vie numérique',
            description: 'Cybersécurité personnelle et processus de fin de vie numérique: audit sécurité, plan de transmission et actions post-événement.',
            category: 'Cybersécurité',
            price: 10,
            image_url: '/images/sentinelle-numerique.jpg',
          };
          const allModules = modulesData || [];
          const hasSentinelle = allModules.some((m: any) => (m.id || '').toString().toLowerCase().includes('sentinelle'));
          const platformFallbacks = [
            ...(hasSentinelle ? [] : [sentinelleModule]),
            ...(!allModules.some((m: any) => (m.id || '').toString().toLowerCase() === 'vote')
              ? [{
                  id: 'vote',
                  title: 'Vote en ligne',
                  subtitle: 'Votes avec code PIN organisateur et QR code',
                  description: 'Créez un vote simple : participants, PIN admin, lien public et QR pour voter.',
                  category: 'OUTILS ÉVÉNEMENT',
                  price: 10,
                  url: '/card/vote',
                  image_url: '/iahome-logo.svg',
                }]
              : []),
            ...(!allModules.some((m: any) => (m.id || '').toString().toLowerCase() === 'reveil-intelligent')
              ? [{
                  id: 'reveil-intelligent',
                  title: 'Réveil Intelligent',
                  subtitle: 'Météo, jours fériés et vacances scolaires',
                  description:
                    'Réveil mobile : alarmes récurrentes, prévisions météo, jours fériés et vacances scolaires (zones A, B, C).',
                  category: 'OUTILS QUOTIDIEN',
                  price: 0,
                  url: '/card/reveil',
                  image_url: '/images/reveil-intelligent.svg',
                }]
              : []),
          ];
          const modulesToProcess = mergeApplicationModules(allModules, platformFallbacks);

          // Traiter les modules avec la structure simple
          const modulesWithRoles = modulesToProcess.map((module: any) => {
            // Utiliser la catégorie directement depuis la table modules
            const primaryCategory = module.category || 'Non classé';
            const isSentinelle = (module.id || '').toString().toLowerCase().includes('sentinelle');
            
            return {
              ...module,
              // Forcer l'image Sentinelle Numérique (public/images/sentinelle-numerique.png)
              ...(isSentinelle && { image_url: '/images/sentinelle-numerique.jpg' }),
              // Catégorie principale
              category: primaryCategory,
              // Catégories multiples (utiliser la même catégorie pour compatibilité)
              categories: [primaryCategory],
              // Sentinelle Numérique : prix fixe de 10 crédits
              price: isSentinelle ? 10 : module.price,
              // Ajouter des données aléatoires seulement pour l'affichage (pas stockées en DB)
              role: getRandomRole(),
              usage_count: Math.floor(Math.random() * 1000) + 1,
              profession: 'Généraliste'
            };
          });
          
          setModules(modulesWithRoles);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des modules:', error);
        setError(error instanceof Error ? error.message : 'Une erreur inattendue s\'est produite');
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

  useEffect(() => {
    // Le rôle est déjà géré dans l'effet précédent
  }, [user]);

  useEffect(() => {
    // Charger les modules sélectionnés depuis le localStorage
    const saved = localStorage.getItem('selectedModules');
    if (saved) {
      try {
        setSelectedModules(JSON.parse(saved));
      } catch {
        setSelectedModules([]);
      }
    }
  }, []);


  const isModuleSelected = (moduleId: string) => {
    return selectedModules.some(module => module.id === moduleId);
  };



  // Fonctions pour générer des données aléatoires
  const getRandomRole = () => {
    const roles = ['Développeur', 'Designer', 'Marketing', 'Business', 'Étudiant', 'Freelance'];
    return roles[Math.floor(Math.random() * roles.length)];
  };



  // Modules essentiels à exclure de la page applications (affichés dans la page essentiels)
  const essentialModules = ['metube', 'psitransfer', 'pdf', 'librespeed', 'qrcodes', 'code-learning', 'apprendre-autrement', 'home-assistant', 'administration', 'photobooth', 'sentinelle-numerique', 'vote', 'reveil-intelligent', 'resas-system'];
  // Modules masqués de la liste (vide : Hunyuan 3D / image→3D réaffiché avec lien Hi3DGen)
  const hiddenFromListing: string[] = [];
  const isHiddenModule = (module: { id?: string | number; title?: string }) => {
    const idStr = String(module.id ?? '').toLowerCase();
    const titleNorm = (module.title ?? '').toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
    return hiddenFromListing.some(id => {
      const idNorm = id.toLowerCase().replace(/-/g, '');
      return idStr === idNorm || idStr.includes(idNorm) || titleNorm.includes(idNorm);
    });
  };
  
  // Filtrer les modules
  const filteredModules = modules
    .filter(module => {
      // Exclure les modules masqués (liste configurable)
      if (isHiddenModule(module)) return false;
      // Exclure les modules essentiels (affichés dans la page essentiels)
      const isEssential = essentialModules.some(essentialId => 
        module.id === essentialId || 
        (module.title && (module.title.toLowerCase().includes(essentialId.toLowerCase()) || module.title.toLowerCase().includes(essentialId.replace('-', ' '))))
      );
      
      if (isEssential) return false;
      
      // Filtre de recherche uniquement
      const matchesSearch = !search || 
        module.title.toLowerCase().includes(search.toLowerCase()) ||
        module.description?.toLowerCase().includes(search.toLowerCase()) ||
        (module.categories || [module.category]).some((cat: string) =>
          cat.toLowerCase().includes(search.toLowerCase())
        );

      return matchesSearch;
    });

  // Pagination - Configuration pour 15 applications par page (désactivée pour afficher toutes les apps)
  const [currentPage, setCurrentPage] = useState(1);
  const modulesPerPage = 15; // Changé de 9 à 15 pour la pagination future
  
  // Afficher toutes les applications sur la première page (pas de pagination active)
  // Pour rétablir la pagination, remplacer filteredModules par currentModules ci-dessous
  const currentModules = filteredModules; // Afficher toutes les applications

  // Conserver un ordre stable pour rendre les niveaux d'accompagnement lisibles.
  const displayedModules = useMemo(
    () => [...currentModules].sort((a, b) => a.title.localeCompare(b.title, 'fr')),
    [currentModules.map(m => m.id).sort().join(',')]
  );

  const groupedModules = useMemo(
    () =>
      AUDIENCE_SEGMENTS.map((segment) => ({
        ...segment,
        modules: displayedModules.filter(
          (module) =>
            getApplicationAudienceSegment(module) === segment.id &&
            (segmentFilter === 'all' || segmentFilter === segment.id)
        ),
      })).filter((segment) => segment.modules.length > 0 || segmentFilter === segment.id),
    [displayedModules, segmentFilter]
  );
  
  // Calculer les indices pour la pagination (pour référence future)
  const indexOfLastModule = currentPage * modulesPerPage;
  const indexOfFirstModule = indexOfLastModule - modulesPerPage;
  // const currentModules = filteredModules.slice(indexOfFirstModule, indexOfLastModule); // Décommenter pour activer la pagination
  
  // Calculer le nombre total de pages
  const totalPages = Math.ceil(filteredModules.length / modulesPerPage);
  
  // Fonctions de navigation (pour référence future)
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };
  
  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };
  
  // Réinitialiser la pagination quand la recherche change
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Détecter le scroll pour afficher/masquer le bouton de retour en haut
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollToTop(scrollTop > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fonction pour remonter en haut de page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

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
              <EcosystemValueBlock
                variant="applications"
                layout="hero"
                showPillars={false}
                showAudiences={true}
                showProof={true}
              />
              
              {/* Barre de recherche et bouton Mes applis */}
              <div className="flex flex-col sm:flex-row gap-4 max-w-lg">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Applis"
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
                {isAuthenticated && user && (
                  <Link 
                    href="/account" 
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

      <GpuInfrastructureBlock variant="applications" />

      <FrenchTrustBlock variant="applications" density="band" />

      <EcosystemValueBlock variant="applications" useCasesOnly />

      <AudienceSegmentsBlock />

      {/* Section principale avec contenu */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Contenu principal */}
          <div className="w-full">

              {segmentFilter !== 'all' && (
                <div className="mb-8">
                  <Link
                    href="/applications"
                    className="text-sm font-semibold text-blue-700 hover:text-blue-900"
                  >
                    ← Afficher les trois univers
                  </Link>
                </div>
              )}

              {/* Applications classées par univers */}
              <div>
                {loading && !forceShowContent ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <div className="text-gray-500">Chargement des applications...</div>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="text-red-600 font-medium mb-2">Erreur de chargement</div>
                    <div className="text-gray-500 mb-4">{error}</div>
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Réessayer
                    </button>
                  </div>
                ) : filteredModules.length === 0 ? (
                  <div className="text-left py-12">
                    <div className="text-gray-500">Aucun template trouvé pour &quot;{search}&quot;</div>
                  </div>
                ) : displayedModules.length === 0 ? (
                  <div className="text-left py-12">
                    <div className="text-gray-500">Aucun module à afficher</div>
                    <div className="text-sm text-gray-400 mt-2">Total modules: {filteredModules.length}</div>
                  </div>
                ) : (
                  <div className="space-y-14">
                    {groupedModules.map((segment) => (
                      <section key={segment.id} aria-labelledby={`segment-${segment.id}`}>
                        <div className={`rounded-xl border-l-4 p-5 mb-6 ${segment.accent}`}>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wide opacity-75 mb-1">{segment.badge}</p>
                              <h2 id={`segment-${segment.id}`} className="text-2xl font-bold">{segment.title}</h2>
                            </div>
                            <p className="text-sm max-w-xl sm:text-right opacity-85">{segment.catalogHint}</p>
                          </div>
                        </div>
                        {segment.modules.length === 0 ? (
                          (() => {
                            const redirect = AUDIENCE_EMPTY_REDIRECT[segment.id];
                            if (!redirect) return null;
                            return (
                              <div className="rounded-xl border border-dashed border-purple-300 bg-purple-50/50 p-8 text-center">
                                <p className="text-gray-700 mb-4">{redirect.message}</p>
                                <Link
                                  href={redirect.href}
                                  className="inline-flex font-semibold text-purple-800 underline underline-offset-4 hover:opacity-80"
                                >
                                  {redirect.label}
                                </Link>
                              </div>
                            );
                          })()
                        ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-stretch gap-6">
                          {segment.modules.map((module) => {
                            const offerLevel = getAiOfferLevel(module);
                            return (
                            <div key={module.id} className="flex h-full flex-col">
                              <div className="flex-1 [&>div]:h-full">
                                <ModuleCard
                                  module={module}
                                  userEmail={user?.email}
                                />
                              </div>
                              <div className={`mt-3 flex min-h-28 flex-col rounded-lg border px-4 py-3 text-sm ${segment.accent}`}>
                                <p>{getAiOfferNote(module)}</p>
                                {offerLevel === 'accompagnement' && (
                                  <Link
                                    href={`/contact?type=help&app=${encodeURIComponent(module.title)}`}
                                    className="mt-auto pt-3 font-bold underline decoration-2 underline-offset-4 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                  >
                                    Demander une aide à l&apos;utilisation →
                                  </Link>
                                )}
                                {offerLevel === 'specialise' && (
                                  <Link
                                    href={`/contact?type=project&app=${encodeURIComponent(module.title)}`}
                                    className="mt-auto pt-3 font-bold underline decoration-2 underline-offset-4 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
                                  >
                                    Soumettre mon projet →
                                  </Link>
                                )}
                              </div>
                            </div>
                          );
                          })}
                        </div>
                        )}
                      </section>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Contrôles de pagination - Désactivée pour afficher toutes les applications */}
              {/* Pour rétablir la pagination, décommenter la condition ci-dessous et utiliser currentModules au lieu de filteredModules */}
              {false && filteredModules.length >= 15 && totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Précédent
                  </button>
                  
                  {/* Numéros de pages */}
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, index) => {
                      const pageNumber = index + 1;
                      // Afficher seulement quelques pages autour de la page actuelle
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => goToPage(pageNumber)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === pageNumber
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      } else if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                      ) {
                        return (
                          <span key={pageNumber} className="px-2 py-2 text-gray-500">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                  
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Suivant →
                  </button>
                </div>
              )}
              
              {/* Informations de pagination - Afficher toutes les applications */}
              {filteredModules.length > 0 && (
                <div className="text-left text-gray-600 text-sm mt-4">
                  Affichage de {filteredModules.length} application{filteredModules.length > 1 ? 's' : ''} sur {filteredModules.length} au total
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

