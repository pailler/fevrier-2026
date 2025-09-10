'use client';
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import ModuleCard from '../../components/ModuleCard';

export default function Essentiels() {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [professionFilter, setProfessionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('most_used');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modules essentiels spécifiques
  const essentialModules = [
    'librespeed',
    'metube', 
    'pdf',
    'psitransfer',
    'qrcodes'
  ];

  useEffect(() => {
    // Charger les modules depuis Supabase
    const fetchModules = async () => {
      try {
        const { data: modulesData, error: modulesError } = await supabase
          .from('modules')
          .select('*');

        if (modulesError) {
          console.error('Erreur lors du chargement des modules:', modulesError);
        } else {
          // Filtrer seulement les modules essentiels
          const essentialModulesData = (modulesData || []).filter(module => 
            essentialModules.includes(module.id) || 
            essentialModules.some(essentialId => 
              module.title.toLowerCase().includes(essentialId.toLowerCase())
            )
          );

          // Traiter les modules avec la structure simple
          const modulesWithRoles = essentialModulesData.map(module => {
            const primaryCategory = module.category || 'Non classé';

            return {
              ...module,
              category: cleanCategory(primaryCategory),
              categories: [cleanCategory(primaryCategory)],
              role: getRandomRole(),
              usage_count: Math.floor(Math.random() * 1000) + 1,
              profession: getModuleProfession(module.title, primaryCategory)
            };
          });

          setModules(modulesWithRoles);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des modules:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  // Fonction pour nettoyer les catégories
  const cleanCategory = (category: string) => {
    return category.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  };

  // Fonction pour attribuer une profession selon le nom du module
  const getModuleProfession = (moduleTitle: string, moduleCategory: string) => {
    const title = moduleTitle.toLowerCase();
    const category = moduleCategory.toLowerCase();

    if (title.includes('photo') || title.includes('image') || category.includes('photo')) {
      return 'Photographe';
    }
    if (title.includes('pdf') || title.includes('document') || category.includes('bureautique')) {
      return 'Rédacteur';
    }
    if (title.includes('video') || title.includes('tube') || category.includes('video')) {
      return 'Photographe';
    }
    if (title.includes('transfer') || title.includes('file') || category.includes('web')) {
      return 'Rédacteur';
    }
    if (title.includes('qr') || title.includes('code') || category.includes('web')) {
      return 'Rédacteur';
    }

    return 'Rédacteur';
  };

  // Fonctions pour générer des données aléatoires
  const getRandomRole = () => {
    const roles = ['Développeur', 'Designer', 'Marketing', 'Business', 'Étudiant', 'Freelance'];
    return roles[Math.floor(Math.random() * roles.length)];
  };

  // Générer la liste des catégories disponibles
  const existingCategories = Array.from(new Set(
    modules.flatMap(module => module.categories || [module.category]).filter(Boolean)
  ));

  const authorizedCategories = [
    'IA ASSISTANT',
    'IA BUREAUTIQUE', 
    'IA PHOTO',
    'IA VIDEO',
    'IA AUDIO',
    'IA PROMPTS',
    'IA MARKETING',
    'IA DESIGN',
    'Web Tools',
    'IA FORMATION',
    'IA DEVELOPPEMENT',
  ];

  const filteredExistingCategories = existingCategories.filter(cat => authorizedCategories.includes(cat));
  const missingCategories = authorizedCategories.filter(cat => !filteredExistingCategories.includes(cat));
  const allCategories = [...filteredExistingCategories, ...missingCategories];
  const categories = ['Toutes les catégories', ...allCategories];

  // Filtrer et trier les modules
  const filteredAndSortedModules = modules
    .filter(module => {
      const matchesSearch = !search ||
        module.title.toLowerCase().includes(search.toLowerCase()) ||
        module.description?.toLowerCase().includes(search.toLowerCase()) ||
        (module.categories || [module.category]).some((cat: string) =>
          cat.toLowerCase().includes(search.toLowerCase())
        );

      const isModuleFree = module.price === '0' || module.price === 0 || module.price === 'Gratuit' || module.price === 'gratuit' || module.price === 'FREE' || module.price === 'free';
      const matchesPrice = priceFilter === 'all' ||
        (priceFilter === 'free' && isModuleFree) ||
        (priceFilter === 'paid' && !isModuleFree);

      const matchesProfession = professionFilter === 'all' ||
        module.profession === professionFilter;

      const matchesCategory = categoryFilter === 'all' ||
        (module.categories || [module.category]).includes(categoryFilter);

      return matchesSearch && matchesPrice && matchesProfession && matchesCategory;
    })
    .sort((a, b) => {
      // Tri spécial : librespeed toujours en premier
      const aIsLibrespeed = a.title.toLowerCase().includes('librespeed') || a.id === 'librespeed';
      const bIsLibrespeed = b.title.toLowerCase().includes('librespeed') || b.id === 'librespeed';

      if (aIsLibrespeed && !bIsLibrespeed) return -1;
      if (!aIsLibrespeed && bIsLibrespeed) return 1;

      // Tri principal : modules gratuits en premier
      const aIsFree = a.price === '0' || a.price === 0 || a.price === 'Gratuit' || a.price === 'gratuit' || a.price === 'FREE' || a.price === 'free';
      const bIsFree = b.price === '0' || b.price === 0 || b.price === 'Gratuit' || b.price === 'gratuit' || b.price === 'FREE' || b.price === 'free';

      if (aIsFree && !bIsFree) return -1;
      if (!aIsFree && bIsFree) return 1;

      switch (sortBy) {
        case 'most_used':
          return (b.usage_count || 0) - (a.usage_count || 0);
        case 'least_used':
          return (a.usage_count || 0) - (b.usage_count || 0);
        case 'price_high':
          return (b.price || 0) - (a.price || 0);
        case 'price_low':
          return (a.price || 0) - (b.price || 0);
        case 'name_az':
          return a.title.localeCompare(b.title);
        case 'name_za':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const modulesPerPage = 9;

  const indexOfLastModule = currentPage * modulesPerPage;
  const indexOfFirstModule = indexOfLastModule - modulesPerPage;
  const currentModules = filteredAndSortedModules.slice(indexOfFirstModule, indexOfLastModule);
  const totalPages = Math.ceil(filteredAndSortedModules.length / modulesPerPage);

  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  // Réinitialiser la pagination quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [search, priceFilter, professionFilter, sortBy, categoryFilter]);

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
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-yellow-800 via-green-800 to-green-900 bg-clip-text text-transparent leading-tight mb-4">
                Modules Essentiels
              </h1>
              <p className="text-xl text-gray-700 mb-6">
                Les outils essentiels. Accès direct aux modules PDF, LibreSpeed, MeTube et plus encore.
              </p>

              {/* Barre de recherche */}
              <div className="flex flex-col sm:flex-row gap-4 max-w-lg">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Rechercher un module..."
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
                    <div className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-green-700 bg-clip-text text-transparent mb-3">Essentiels</div>
                    <div className="text-xs text-gray-600">Outils indispensables</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section principale avec filtres et contenu */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar gauche - Catégories */}
            <aside className="lg:w-64 shrink-0 order-2 lg:order-1">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                        categoryFilter === (cat === 'Toutes les catégories' ? 'all' : cat)
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                      }`}
                      onClick={() => setCategoryFilter(cat === 'Toutes les catégories' ? 'all' : cat)}
                    >
                      {cat === 'Toutes les catégories' ? 'Toutes' : cat.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Contenu principal */}
            <div className="flex-1 order-1 lg:order-2">
              {/* Filtres */}
              <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100 mb-6 lg:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-4">
                  {/* Dropdowns */}
                  <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 flex-1">
                    <select
                      className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={priceFilter}
                      onChange={(e) => setPriceFilter(e.target.value)}
                    >
                      <option value="all">Gratuit et payant</option>
                      <option value="free">Gratuit uniquement</option>
                      <option value="paid">Payant uniquement</option>
                    </select>

                    <select
                      className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={professionFilter}
                      onChange={(e) => setProfessionFilter(e.target.value)}
                    >
                      <option value="all">Tous les métiers</option>
                      <option value="Photographe">📸 Photographes</option>
                      <option value="Rédacteur">✍️ Rédacteurs & Journalistes</option>
                      <option value="Architecte">🏗️ Architectes & Designers</option>
                      <option value="Avocat">⚖️ Avocats & Juristes</option>
                      <option value="Médecin">🩺 Médecins & Santé</option>
                    </select>
                  </div>

                  {/* Boutons */}
                  <div className="flex items-center gap-3">
                    <select
                      className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="most_used">Trier par : Plus installés</option>
                      <option value="least_used">Trier par : Moins installés</option>
                      <option value="price_high">Trier par : Prix élevé à bas</option>
                      <option value="price_low">Trier par : Prix bas à élevé</option>
                      <option value="name_az">Trier par : Nom A-Z</option>
                      <option value="name_za">Trier par : Nom Z-A</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Grille de modules */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  <div className="col-span-full text-left py-12">
                    <div className="text-gray-500">Chargement des modules essentiels...</div>
                  </div>
                ) : filteredAndSortedModules.length === 0 ? (
                  <div className="col-span-full text-left py-12">
                    <div className="text-gray-500">Aucun module essentiel trouvé pour "{search}"</div>
                  </div>
                ) : currentModules.length === 0 ? (
                  <div className="col-span-full text-left py-12">
                    <div className="text-gray-500">Aucun module à afficher</div>
                    <div className="text-sm text-gray-400 mt-2">Total modules: {filteredAndSortedModules.length}</div>
                  </div>
                ) : (
                  currentModules.map((module) => (
                    <ModuleCard
                      key={module.id}
                      module={module}
                      userEmail={undefined}
                    />
                  ))
                )}
              </div>

              {/* Contrôles de pagination */}
              {totalPages > 1 && (
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

              {/* Informations de pagination */}
              {filteredAndSortedModules.length > 0 && (
                <div className="text-left text-gray-600 text-sm mt-4">
                  Affichage de {indexOfFirstModule + 1} à {Math.min(indexOfLastModule, filteredAndSortedModules.length)} sur {filteredAndSortedModules.length} modules essentiels
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
