'use client';
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { useCustomAuth } from '../../hooks/useCustomAuth';
import Breadcrumb from '../../components/Breadcrumb';
import ModuleCard from '../../components/ModuleCard';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useCustomAuth();
  const [role, setRole] = useState<string | null>(null);
  const [selectedModules, setSelectedModules] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forceShowContent, setForceShowContent] = useState(false);

  const [userSubscriptions, setUserSubscriptions] = useState<{[key: string]: boolean}>({});
  const [showScrollToTop, setShowScrollToTop] = useState(false);

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
          .select(`
            module_id,
            expires_at
          `)
          .eq('user_id', user.id)
          .eq('is_active', true)
          .gt('expires_at', new Date().toISOString());
        
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
          
          // Traiter les modules avec la structure simple
          const modulesWithRoles = (modulesData || []).map(module => {
            // Utiliser la catégorie directement depuis la table modules
            const primaryCategory = module.category || 'Non classé';
            
            return {
              ...module,
              // Catégorie principale
              category: primaryCategory,
              // Catégories multiples (utiliser la même catégorie pour compatibilité)
              categories: [primaryCategory],
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
  const essentialModules = ['metube', 'psitransfer', 'pdf', 'librespeed', 'qrcodes', 'code-learning', 'apprendre-autrement', 'home-assistant', 'administration'];
  // Modules masqués de la liste (page et fichiers conservés, seul l'affichage dans la liste est désactivé)
  const hiddenFromListing = ['hunyuan3d'];
  const isHiddenModule = (module: { id?: string | number; title?: string }) => {
    const idStr = String(module.id ?? '').toLowerCase();
    const titleNorm = (module.title ?? '').toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
    return hiddenFromListing.some(id => {
      const idNorm = id.toLowerCase().replace(/-/g, '');
      return idStr === idNorm || idStr.includes(idNorm) || titleNorm.includes(idNorm) || (module.title?.toLowerCase().includes('hunyuan') && module.title?.toLowerCase().includes('3d'));
    });
  };
  
  // Filtrer les modules
  const filteredModules = modules
    .filter(module => {
      // Exclure les modules masqués (ex: Hunyuan 3D)
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
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-yellow-800 via-green-800 to-green-900 bg-clip-text text-transparent leading-tight mb-4">
                Utilisez à distance la puissance GPU des ordinateurs IAHome
              </h1>
              <p className="text-xl text-gray-700 mb-6">
                Le numérique à portée de main, pour une utilisation simple et directe de l'IA. Sans téléchargement.
              </p>
              
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
          {/* Contenu principal */}
          <div className="w-full">

              {/* Grille de templates */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && !forceShowContent ? (
                  <div className="col-span-full text-center py-12">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </div>
                    <div className="text-gray-500">Chargement des applications...</div>
                  </div>
                ) : error ? (
                  <div className="col-span-full text-center py-12">
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
                  <div className="col-span-full text-left py-12">
                    <div className="text-gray-500">Aucun template trouvé pour "{search}"</div>
                  </div>
                ) : currentModules.length === 0 ? (
                  <div className="col-span-full text-left py-12">
                    <div className="text-gray-500">Aucun module à afficher (currentModules vide)</div>
                    <div className="text-sm text-gray-400 mt-2">Total modules: {filteredModules.length}</div>
                  </div>
                ) : (
                  currentModules.map((module) => (
                    <ModuleCard
                      key={module.id}
                      module={module}
                      userEmail={user?.email}
                    />
                  ))
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
