'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ServiceQRCode from '../../components/ServiceQRCode';

// Désactiver le cache pour cette page
export const dynamic = 'force-dynamic';

interface Service {
  name: string;
  description: string;
  url: string;
  icon: string;
  popular?: boolean;
  appStoreUrl?: string;
  playStoreUrl?: string;
}

interface Administration {
  name: string;
  icon: string;
  color: string;
  services: Service[];
}

// Données par défaut (fallback si l'API ne répond pas)
const defaultAdministrations: Administration[] = [];

// Fonction pour normaliser les noms en slugs d'ancres (gérer les accents)
const normalizeToSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD') // Décompose les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/\s+/g, '-') // Remplace les espaces par des tirets
    .replace(/[^a-z0-9-]/g, '') // Supprime les caractères non alphanumériques
    .replace(/-+/g, '-') // Remplace les tirets multiples par un seul
    .replace(/^-|-$/g, ''); // Supprime les tirets en début et fin
};

export default function AdministrationPage() {
  const [administrations, setAdministrations] = useState<Administration[]>(defaultAdministrations);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const [tokenValidated, setTokenValidated] = useState(false);

  // Valider le token au chargement de la page
  useEffect(() => {
    const validateToken = async () => {
      if (typeof window === 'undefined') return;

      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (!token) {
        setError('Token d\'accès manquant. Veuillez accéder à cette page via le bouton "Accéder aux services administratifs".');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/validate-internal-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: token,
            moduleId: 'administration'
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.error || 'Token invalide ou expiré. Veuillez réessayer.');
          setLoading(false);
          return;
        }

        // Token valide, nettoyer l'URL
        window.history.replaceState({}, document.title, window.location.pathname);
        setTokenValidated(true);
      } catch (err) {
        console.error('Erreur validation token:', err);
        setError('Erreur lors de la validation du token. Veuillez réessayer.');
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  // Fonction pour toggle l'ouverture/fermeture d'une catégorie
  const toggleCategory = (categoryName: string) => {
    setOpenCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  // Charger les données depuis l'API (qui fonctionne)
  useEffect(() => {
    // Ne charger les données que si le token est validé
    if (!tokenValidated) return;

    let cancelled = false;
    let controller: AbortController | null = null;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Créer un nouveau AbortController pour cette requête
        controller = new AbortController();
        
        // Timeout de 5 secondes
        const timeoutId = setTimeout(() => {
          controller?.abort();
        }, 5000);
        
        const timestamp = Date.now();
        const response = await fetch(`/api/administration/data?t=${timestamp}`, {
          method: 'GET',
          cache: 'no-store',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (cancelled) return;

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json();

        if (cancelled) return;

        if (result.success && Array.isArray(result.data)) {
          setAdministrations(result.data);
        } else {
          throw new Error('Format de réponse invalide');
        }
      } catch (err: any) {
        if (cancelled) return;
        
        if (err.name === 'AbortError') {
          setError('La requête a pris trop de temps');
        } else {
          console.error('Erreur:', err);
          setError(err.message || 'Erreur lors du chargement');
        }
        setAdministrations([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();
    
    return () => {
      cancelled = true;
      controller?.abort();
    };
  }, [tokenValidated]);

  useEffect(() => {
    document.title = 'Services de l\'Administration - Accès Rapide aux Démarches Administratives';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Accédez rapidement aux principaux services de l\'administration française : CAF, Sécurité Sociale, permis de conduire, aides sociales, scolarité, études, retraites, famille, handicap et bien plus.');
    } else {
      const newMetaDescription = document.createElement('meta');
      newMetaDescription.name = 'description';
      newMetaDescription.content = 'Accédez rapidement aux principaux services de l\'administration française : CAF, Sécurité Sociale, permis de conduire, aides sociales, scolarité, études, retraites, famille, handicap et bien plus.';
      document.head.appendChild(newMetaDescription);
    }

    // Gérer les ancres (avec ou sans accents) - attendre que les données soient chargées
    if (!loading && administrations.length > 0 && typeof window !== 'undefined' && window.location.hash) {
      const hash = decodeURIComponent(window.location.hash.substring(1));
      
      // Chercher la section correspondante
      const matchingAdmin = administrations.find(admin => {
        const normalizedAdminName = normalizeToSlug(admin.name);
        const normalizedHash = normalizeToSlug(hash);
        
        // Correspondance exacte avec le slug normalisé
        if (normalizedAdminName === normalizedHash) {
          return true;
        }
        
        // Correspondance avec le nom original (pour compatibilité)
        if (admin.name.toLowerCase() === hash.toLowerCase()) {
          return true;
        }
        
        return false;
      });
      
      if (matchingAdmin) {
        const normalizedId = normalizeToSlug(matchingAdmin.name);
        const element = document.getElementById(normalizedId);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Mettre à jour l'URL sans recharger la page
            window.history.replaceState(null, '', `#${normalizedId}`);
          }, 300);
        }
      }
    }
  }, [loading, administrations]);

  // Fonction de recherche pour normaliser et comparer les textes
  const normalizeSearchText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  };

  // Fonction pour vérifier si un texte correspond à la recherche
  const matchesSearch = (text: string, query: string): boolean => {
    if (!query.trim()) return true;
    const normalizedText = normalizeSearchText(text);
    const normalizedQuery = normalizeSearchText(query);
    return normalizedText.includes(normalizedQuery);
  };

  // Filtrer les administrations et services selon la recherche
  const filteredAdministrations = searchQuery.trim()
    ? administrations
        .map(admin => {
          // Vérifier si la catégorie correspond
          const categoryMatches = matchesSearch(admin.name, searchQuery);
          
          // Filtrer les services qui correspondent
          const matchingServices = admin.services.filter(service =>
            matchesSearch(service.name, searchQuery) ||
            matchesSearch(service.description, searchQuery)
          );

          // Inclure la catégorie si elle correspond ou si elle a des services correspondants
          if (categoryMatches || matchingServices.length > 0) {
            return {
              ...admin,
              services: categoryMatches ? admin.services : matchingServices
            };
          }
          return null;
        })
        .filter((admin): admin is Administration => admin !== null)
    : administrations;

  // Compter le nombre total de résultats
  const totalResults = filteredAdministrations.reduce(
    (count, admin) => count + admin.services.length,
    0
  );

  // Récupérer tous les services populaires (filtrés)
  const popularServices = filteredAdministrations.flatMap(admin => 
    admin.services.filter(service => service.popular)
  );

  // Si une recherche est active, ouvrir automatiquement toutes les catégories filtrées
  useEffect(() => {
    if (searchQuery.trim()) {
      const filteredNames = new Set(filteredAdministrations.map(admin => admin.name));
      setOpenCategories(filteredNames);
    }
  }, [searchQuery, filteredAdministrations]);

  // Scroll automatique vers le premier résultat lors d'une recherche
  useEffect(() => {
    if (searchQuery.trim() && filteredAdministrations.length > 0) {
      const firstAdmin = filteredAdministrations[0];
      const firstAdminId = normalizeToSlug(firstAdmin.name);
      const element = document.getElementById(firstAdminId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [searchQuery, filteredAdministrations]);

  // Affichage du chargement avec timeout de sécurité
  useEffect(() => {
    // Timeout de sécurité global : si loading reste true après 20 secondes, le forcer à false
    if (loading) {
      const globalTimeout = setTimeout(() => {
        console.warn('⚠️ Timeout global : loading est resté true trop longtemps, forcer à false');
        setLoading(false);
        setError('Le chargement prend trop de temps. Veuillez rafraîchir la page.');
      }, 20000);
      
      return () => clearTimeout(globalTimeout);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Chargement des services administratifs...</p>
          <p className="text-sm text-gray-500 mt-2">Si le chargement prend trop de temps, veuillez rafraîchir la page.</p>
        </div>
      </div>
    );
  }

  // Affichage de l'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800 font-medium mb-2">⚠️ Erreur</p>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Affichage si aucune donnée
  if (administrations.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-gray-600">Aucun service administratif disponible pour le moment.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Section héros */}
        <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-float-slow"></div>
            <div className="absolute top-20 right-20 w-16 h-16 bg-white rounded-full animate-float-medium"></div>
            <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-white rounded-full animate-float-fast"></div>
            <div className="absolute bottom-20 right-1/3 w-14 h-14 bg-white rounded-full animate-float-slow"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="text-center text-white">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 animate-fade-in-up px-2">
                Services de l'Administration
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-6 opacity-90 animate-fade-in-up px-2" style={{animationDelay: '0.2s'}}>
                Accès rapide aux démarches administratives les plus courantes
              </p>
              <p className="text-sm sm:text-base md:text-lg opacity-80 max-w-3xl mx-auto animate-fade-in-up px-2 mb-6" style={{animationDelay: '0.4s'}}>
                Trouvez rapidement le service dont vous avez besoin et accédez directement au site officiel ou à l'application mobile pour effectuer vos démarches en ligne. Très utile pour les Médiateurs Numériques.
              </p>
              
              {/* Barre de recherche */}
              <div className="max-w-2xl mx-auto animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un service (ex: CAF, carte vitale, permis...)"
                    className="w-full pl-12 pr-4 py-4 text-gray-900 bg-white rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 text-base sm:text-lg"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {searchQuery && (
                  <div className="mt-3 text-white/90 text-sm">
                    {totalResults > 0 ? (
                      <span>{totalResults} résultat{totalResults > 1 ? 's' : ''} trouvé{totalResults > 1 ? 's' : ''}</span>
                    ) : (
                      <span className="text-yellow-200">Aucun résultat trouvé</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Styles CSS pour les animations */}
        <style jsx>{`
          @keyframes float-slow {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          
          @keyframes float-medium {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
          }
          
          @keyframes float-fast {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          
          .animate-float-slow {
            animation: float-slow 6s ease-in-out infinite;
          }
          
          .animate-float-medium {
            animation: float-medium 4s ease-in-out infinite;
          }
          
          .animate-float-fast {
            animation: float-fast 3s ease-in-out infinite;
          }
          
          .animate-fade-in-up {
            animation: fade-in-up 1s ease-out;
          }
        `}</style>

        {/* Section Catégories - Navigation stylée */}
        <section className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Explorez par catégorie
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                Naviguez facilement parmi tous les services administratifs organisés par thématique
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredAdministrations.map((admin) => {
                // Descriptions courtes pour chaque catégorie
                const descriptions: Record<string, string> = {
                  'CAF (Caisse d\'Allocations Familiales)': 'Allocations familiales, aides au logement, RSA et prestations sociales',
                  'Sécurité Sociale': 'Carte Vitale, remboursements, arrêts de travail et professionnels de santé',
                  'Permis de conduire': 'Demande, renouvellement et échange de permis de conduire',
                  'Aides sociales': 'Aide sociale à l\'enfance, au logement, alimentaire et personnes âgées',
                  'Scolarité et Éducation': 'Inscriptions scolaires, bourses, formation professionnelle et création d\'entreprise',
                  'Famille': 'Naissance, mariage, décès et garde d\'enfants',
                  'Papiers d\'identité': 'Carte d\'identité, passeport, actes d\'état civil et citoyenneté',
                  'Événements de vie': 'Guides complets pour les moments importants de la vie'
                };
                
                const description = descriptions[admin.name] || `Services et démarches liés à ${admin.name.toLowerCase()}`;
                
                return (
                  <a
                    key={admin.name}
                    href={`#${normalizeToSlug(admin.name)}`}
                    className={`group relative bg-gradient-to-br ${admin.color} rounded-xl p-5 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden`}
                  >
                    {/* Effet de brillance au survol */}
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <span className="text-3xl sm:text-4xl">{admin.icon}</span>
                        <h3 className="text-lg sm:text-xl font-bold text-white flex-1">
                          {admin.name}
                        </h3>
                      </div>
                      
                      <p className="text-sm sm:text-base text-white/90 mb-4 line-clamp-2">
                        {description}
                      </p>
                      
                      <div className="flex items-center text-white/80 text-sm font-medium group-hover:text-white transition-colors">
                        <span>Voir les services</span>
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
          {/* Section Services populaires */}
          {popularServices.length > 0 && (
            <section className="mb-16">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl md:text-4xl">⭐</span>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                  Services les plus demandés
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {popularServices.map((service, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-md border-2 border-blue-200 p-3 sm:p-4 hover:shadow-lg hover:border-blue-400 transition-all group"
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <span className="text-xl sm:text-2xl flex-shrink-0">{service.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base text-gray-900 group-hover:text-blue-600 transition-colors break-words">
                          {searchQuery ? (
                            <span dangerouslySetInnerHTML={{
                              __html: service.name.replace(
                                new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
                                '<mark class="bg-yellow-200 font-semibold">$1</mark>'
                              )
                            }} />
                          ) : (
                            service.name
                          )}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                          {searchQuery ? (
                            <span dangerouslySetInnerHTML={{
                              __html: service.description.replace(
                                new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
                                '<mark class="bg-yellow-200 font-semibold">$1</mark>'
                              )
                            }} />
                          ) : (
                            service.description
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-3 flex items-center justify-between gap-2">
                      <a
                        href={service.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 text-xs sm:text-sm font-medium hover:text-blue-700 transition-colors"
                      >
                        Accéder au service
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                      <ServiceQRCode url={service.url} size={50} className="flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Liste des services par administration */}
          {filteredAdministrations.map((admin) => {
            const categoryId = normalizeToSlug(admin.name);
            const isOpen = openCategories.has(admin.name);
            
            return (
              <section
                key={admin.name}
                id={categoryId}
                className="mb-8 sm:mb-12 md:mb-16 scroll-mt-16 sm:scroll-mt-8"
              >
                <div className={`bg-gradient-to-r ${admin.color} rounded-t-xl p-4 sm:p-5 md:p-6 mb-4 sm:mb-6 shadow-lg`}>
                  <button
                    onClick={() => toggleCategory(admin.name)}
                    className="w-full flex items-center justify-between gap-3 sm:gap-4 hover:opacity-95 transition-opacity cursor-pointer group"
                    aria-expanded={isOpen}
                    aria-controls={`services-${categoryId}`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1">
                      <span className="text-2xl sm:text-3xl md:text-4xl">{admin.icon}</span>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white break-words text-left">
                        {admin.name}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                      {!isOpen && (
                        <span className="text-white text-sm sm:text-base font-semibold hidden sm:inline-block bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                          Déplier pour voir les liens
                        </span>
                      )}
                      <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-white/25 hover:bg-white/35 rounded-full transition-all group-hover:scale-110 shadow-lg border-2 border-white/30">
                        <svg
                          className={`w-7 h-7 sm:w-8 sm:h-8 text-white transform transition-transform duration-300 font-bold ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </button>
                </div>
              
                <div
                  id={`services-${categoryId}`}
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    isOpen ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                {admin.services.map((service, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 md:p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex items-start gap-2 sm:gap-3 flex-1">
                        <span className="text-2xl sm:text-3xl flex-shrink-0">{service.icon}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-1 break-words">
                            {searchQuery ? (
                              <span dangerouslySetInnerHTML={{
                                __html: service.name.replace(
                                  new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
                                  '<mark class="bg-yellow-200 font-semibold">$1</mark>'
                                )
                              }} />
                            ) : (
                              service.name
                            )}
                            {service.popular && (
                              <span className="ml-1 sm:ml-2 text-xs bg-yellow-100 text-yellow-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                                Populaire
                              </span>
                            )}
                          </h3>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-3">
                      {searchQuery ? (
                        <span dangerouslySetInnerHTML={{
                          __html: service.description.replace(
                            new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'),
                            '<mark class="bg-yellow-200 font-semibold">$1</mark>'
                          )
                        }} />
                      ) : (
                        service.description
                      )}
                    </p>

                    {/* Boutons d'accès */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <a
                          href={service.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg transition-all transform hover:scale-105 shadow-md hover:shadow-lg text-sm sm:text-base"
                        >
                          <span className="flex items-center justify-center">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            Site web
                          </span>
                        </a>
                        <ServiceQRCode url={service.url} size={60} className="flex-shrink-0" />
                      </div>

                      {/* Liens vers les applications mobiles */}
                      {(service.appStoreUrl || service.playStoreUrl) && (
                        <div className="flex gap-2">
                          {service.appStoreUrl && (
                            <div className="flex items-center gap-2 flex-1">
                              <a
                                href={service.appStoreUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg transition-all shadow-md hover:shadow-lg text-xs sm:text-sm"
                              >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C1.79 15.25 4.3 7.59 9.55 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                                </svg>
                                <span className="hidden sm:inline">App Store</span>
                                <span className="sm:hidden">iOS</span>
                              </a>
                              <ServiceQRCode url={service.appStoreUrl} size={50} className="flex-shrink-0" />
                            </div>
                          )}
                          {service.playStoreUrl && (
                            <div className="flex items-center gap-2 flex-1">
                              <a
                                href={service.playStoreUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg transition-all shadow-md hover:shadow-lg text-xs sm:text-sm"
                              >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                                </svg>
                                <span className="hidden sm:inline">Play Store</span>
                                <span className="sm:hidden">Android</span>
                              </a>
                              <ServiceQRCode url={service.playStoreUrl} size={50} className="flex-shrink-0" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                  </div>
                </div>
              </section>
            );
          })}

          {/* Section informative */}
          <section className="mt-8 sm:mt-12 md:mt-16 bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              💡 Comment utiliser cette page ?
            </h2>
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-600">
              <p>
                Cette page regroupe les principaux services de l'administration française pour vous faciliter l'accès aux démarches en ligne.
              </p>
              <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 ml-2 sm:ml-4">
                <li>Les services sont organisés par administration (CAF, Sécurité Sociale, etc.)</li>
                <li>Les services les plus demandés sont mis en avant en haut de la page</li>
                <li>Cliquez sur un service pour accéder directement au site officiel</li>
                <li>Utilisez les applications mobiles pour un accès encore plus rapide</li>
                <li>Utilisez la navigation en haut pour accéder rapidement à une administration</li>
              </ul>
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800 font-medium text-xs sm:text-sm md:text-base">
                  ⚠️ Important : Cette page vous redirige vers les sites officiels de l'administration française. 
                  Assurez-vous d'être sur le bon site avant de saisir vos informations personnelles.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
