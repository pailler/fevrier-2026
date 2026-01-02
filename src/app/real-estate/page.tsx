'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/utils/supabaseService';
import dynamic from 'next/dynamic';
import { MapPin, Home, Euro, Square, Search, Filter, Heart, Eye, Calendar } from 'lucide-react';

// Import dynamique de la carte pour éviter les erreurs SSR
const PropertyMap = dynamic(() => import('@/components/real-estate/PropertyMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 flex items-center justify-center">Chargement de la carte...</div>
});

interface SearchCriteria {
  id?: string;
  name: string;
  minPrice: number;
  maxPrice: number;
  minSurface?: number;
  maxSurface?: number;
  region: string;
  department?: string;
  city?: string;
  propertyType?: string;
  stylePreferences?: Record<string, any>;
  keywords?: string[];
}

interface Property {
  id: string;
  title: string;
  price: number;
  surface?: number;
  rooms?: number;
  address?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  url: string;
  images?: string[];
  source: string;
  is_new: boolean;
  is_favorite: boolean;
  is_viewed: boolean;
  first_seen_at: string;
}

export default function RealEstatePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [criteria, setCriteria] = useState<SearchCriteria[]>([]);
  const [selectedCriteria, setSelectedCriteria] = useState<SearchCriteria | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showCriteriaForm, setShowCriteriaForm] = useState(false);
  const [includeAI, setIncludeAI] = useState(true);
  const [includeAuctions, setIncludeAuctions] = useState(true);
  const [includeNotaires, setIncludeNotaires] = useState(true);
  const [includeSaisies, setIncludeSaisies] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadCriteria();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCriteria) {
      loadProperties();
    }
  }, [selectedCriteria]);

  useEffect(() => {
    filterProperties();
  }, [properties, showNewOnly, showFavoritesOnly]);

  const checkAuth = async () => {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);
  };

  const loadCriteria = async () => {
    try {
      const response = await fetch('/api/real-estate/criteria');
      const data = await response.json();
      if (data.criteria && data.criteria.length > 0) {
        setCriteria(data.criteria);
        setSelectedCriteria(data.criteria[0]);
      } else {
        // Créer les critères par défaut pour la Vendée
        createDefaultCriteria();
      }
    } catch (error) {
      console.error('Erreur lors du chargement des critères:', error);
    }
  };

  const createDefaultCriteria = async () => {
    const defaultCriteria: SearchCriteria = {
      name: 'Recherche Vendée - Maison Moderne Campagne',
      minPrice: 150000,
      maxPrice: 200000,
      minSurface: 100,
      maxSurface: undefined,
      region: 'Vendée',
      department: '85',
      propertyType: 'house',
      stylePreferences: {
        style: 'moderne_campagne',
        keywords: ['moderne', 'campagne', 'piscine', 'jardin']
      },
      keywords: ['moderne', 'campagne']
    };

    try {
      const response = await fetch('/api/real-estate/criteria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(defaultCriteria)
      });
      const data = await response.json();
      if (data.criteria) {
        setCriteria([data.criteria]);
        setSelectedCriteria(data.criteria);
      }
    } catch (error) {
      console.error('Erreur lors de la création des critères:', error);
    }
  };

  const loadProperties = async () => {
    if (!selectedCriteria?.id) return;

    try {
      const response = await fetch(`/api/real-estate/properties?searchCriteriaId=${selectedCriteria.id}`);
      const data = await response.json();
      if (data.properties) {
        setProperties(data.properties);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des propriétés:', error);
    }
  };

  const filterProperties = () => {
    let filtered = [...properties];

    if (showNewOnly) {
      filtered = filtered.filter(p => p.is_new);
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter(p => p.is_favorite);
    }

    setFilteredProperties(filtered);
  };

  const handleSearch = async () => {
    if (!selectedCriteria) return;

    setIsSearching(true);
    try {
      const response = await fetch('/api/real-estate/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchCriteriaId: selectedCriteria.id,
          criteria: {
            minPrice: selectedCriteria.minPrice,
            maxPrice: selectedCriteria.maxPrice,
            minSurface: selectedCriteria.minSurface,
            maxSurface: selectedCriteria.maxSurface,
            region: selectedCriteria.region,
            department: selectedCriteria.department,
            city: selectedCriteria.city,
            propertyType: selectedCriteria.propertyType,
            keywords: selectedCriteria.keywords
          },
          includeAI,
          includeAuctions,
          includeNotaires,
          includeSaisies
        })
      });

      const data = await response.json();
      if (data.success) {
        await loadProperties();
        alert(`Recherche terminée: ${data.statistics.totalFound} biens trouvés, ${data.statistics.newProperties} nouveaux`);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      alert('Erreur lors de la recherche');
    } finally {
      setIsSearching(false);
    }
  };

  const toggleFavorite = async (property: Property) => {
    try {
      const response = await fetch('/api/real-estate/properties', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: property.id,
          isFavorite: !property.is_favorite
        })
      });

      const data = await response.json();
      if (data.property) {
        setProperties(properties.map(p => 
          p.id === property.id ? { ...p, is_favorite: data.property.is_favorite } : p
        ));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const markAsViewed = async (property: Property) => {
    try {
      const response = await fetch('/api/real-estate/properties', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: property.id,
          isViewed: true
        })
      });

      const data = await response.json();
      if (data.property) {
        setProperties(properties.map(p => 
          p.id === property.id ? { ...p, is_viewed: true } : p
        ));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const analyzeProperty = async (property: Property) => {
    try {
      const response = await fetch('/api/real-estate/ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id
        })
      });

      const data = await response.json();
      if (data.analysis) {
        setAiAnalysis(data.analysis);
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse IA:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentification requise</h1>
          <p className="text-gray-600">Veuillez vous connecter pour accéder à la recherche immobilière.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Recherche Immobilière</h1>
              <p className="text-sm text-gray-600 mt-1">Vendée - Maison Moderne Campagne</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCriteriaForm(!showCriteriaForm)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
              >
                <Filter className="w-4 h-4 inline mr-2" />
                Critères
              </button>
              <button
                onClick={handleSearch}
                disabled={isSearching || !selectedCriteria}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                    Recherche...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 inline mr-2" />
                    Rechercher
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Liste des propriétés */}
          <div className="lg:col-span-1 space-y-4">
            {/* Filtres */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold mb-3">Filtres</h2>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showNewOnly}
                    onChange={(e) => setShowNewOnly(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Nouveaux biens uniquement</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showFavoritesOnly}
                    onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Favoris uniquement</span>
                </label>
              </div>
            </div>

            {/* Options de recherche */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold mb-3">Sources de recherche</h2>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeAI}
                    onChange={(e) => setIncludeAI(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">🤖 Recherche par IA</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeAuctions}
                    onChange={(e) => setIncludeAuctions(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">🔨 Ventes aux enchères</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeNotaires}
                    onChange={(e) => setIncludeNotaires(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">📜 Notaires</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeSaisies}
                    onChange={(e) => setIncludeSaisies(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">⚖️ Saisies immobilières</span>
                </label>
              </div>
            </div>

            {/* Statistiques */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="font-semibold mb-3">Statistiques</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total biens:</span>
                  <span className="font-medium">{properties.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nouveaux:</span>
                  <span className="font-medium text-green-600">
                    {properties.filter(p => p.is_new).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Favoris:</span>
                  <span className="font-medium text-red-600">
                    {properties.filter(p => p.is_favorite).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Liste des propriétés */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="font-semibold">
                  Biens trouvés ({filteredProperties.length})
                </h2>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {filteredProperties.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <Home className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Aucun bien trouvé</p>
                    <p className="text-sm mt-2">Lancez une recherche pour commencer</p>
                  </div>
                ) : (
                  filteredProperties.map((property) => (
                    <div
                      key={property.id}
                      onClick={() => setSelectedProperty(property)}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                        selectedProperty?.id === property.id ? 'bg-blue-50 border-blue-200' : ''
                      } ${property.is_new ? 'border-l-4 border-l-green-500' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-sm line-clamp-2 flex-1">
                          {property.title}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(property);
                          }}
                          className={`ml-2 ${property.is_favorite ? 'text-red-500' : 'text-gray-400'}`}
                        >
                          <Heart className={`w-4 h-4 ${property.is_favorite ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                        <div className="flex items-center">
                          <Euro className="w-3 h-3 mr-1" />
                          {property.price.toLocaleString('fr-FR')} €
                        </div>
                        {property.surface && (
                          <div className="flex items-center">
                            <Square className="w-3 h-3 mr-1" />
                            {property.surface} m²
                          </div>
                        )}
                        {property.rooms && (
                          <div className="flex items-center">
                            <Home className="w-3 h-3 mr-1" />
                            {property.rooms} pièces
                          </div>
                        )}
                      </div>

                      {property.address && (
                        <div className="flex items-center text-xs text-gray-500 mb-2">
                          <MapPin className="w-3 h-3 mr-1" />
                          {property.address}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">{property.source}</span>
                        {property.is_new && (
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                            Nouveau
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Carte */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow h-[800px] relative">
              <PropertyMap
                properties={filteredProperties}
                selectedProperty={selectedProperty}
                onPropertySelect={(property) => setSelectedProperty(property)}
                center={[46.6702, -1.4277]} // Centre de la Vendée
                zoom={9}
              />
            </div>

            {/* Détails de la propriété sélectionnée */}
            {selectedProperty && (
              <div className="mt-4 bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-bold">{selectedProperty.title}</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleFavorite(selectedProperty)}
                      className={`p-2 rounded ${selectedProperty.is_favorite ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:bg-gray-100'}`}
                    >
                      <Heart className={`w-5 h-5 ${selectedProperty.is_favorite ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => markAsViewed(selectedProperty)}
                      className="p-2 rounded text-gray-400 hover:bg-gray-100"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <a
                      href={selectedProperty.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Voir l'annonce
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-600">Prix</div>
                    <div className="text-lg font-semibold">{selectedProperty.price.toLocaleString('fr-FR')} €</div>
                  </div>
                  {selectedProperty.surface && (
                    <div>
                      <div className="text-sm text-gray-600">Surface</div>
                      <div className="text-lg font-semibold">{selectedProperty.surface} m²</div>
                    </div>
                  )}
                  {selectedProperty.rooms && (
                    <div>
                      <div className="text-sm text-gray-600">Pièces</div>
                      <div className="text-lg font-semibold">{selectedProperty.rooms}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-gray-600">Source</div>
                    <div className="text-lg font-semibold">{selectedProperty.source}</div>
                  </div>
                </div>

                {selectedProperty.address && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-1">Adresse</div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {selectedProperty.address}
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-500 flex items-center mb-4">
                  <Calendar className="w-4 h-4 mr-2" />
                  Découvert le {new Date(selectedProperty.first_seen_at).toLocaleDateString('fr-FR')}
                </div>

                {/* Analyse IA */}
                <div className="mt-4 border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Analyse IA</h3>
                    <button
                      onClick={() => analyzeProperty(selectedProperty)}
                      className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                    >
                      Analyser
                    </button>
                  </div>
                  {aiAnalysis && (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Score de correspondance:</span>
                        <span className={`font-bold ${
                          aiAnalysis.matchScore >= 80 ? 'text-green-600' :
                          aiAnalysis.matchScore >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {aiAnalysis.matchScore}/100
                        </span>
                      </div>
                      {aiAnalysis.highlights && aiAnalysis.highlights.length > 0 && (
                        <div>
                          <div className="font-medium text-green-700 mb-1">Points forts:</div>
                          <ul className="list-disc list-inside text-gray-700">
                            {aiAnalysis.highlights.map((h: string, i: number) => (
                              <li key={i}>{h}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {aiAnalysis.concerns && aiAnalysis.concerns.length > 0 && (
                        <div>
                          <div className="font-medium text-orange-700 mb-1">Points d'attention:</div>
                          <ul className="list-disc list-inside text-gray-700">
                            {aiAnalysis.concerns.map((c: string, i: number) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {aiAnalysis.recommendations && aiAnalysis.recommendations.length > 0 && (
                        <div>
                          <div className="font-medium text-blue-700 mb-1">Recommandations:</div>
                          <ul className="list-disc list-inside text-gray-700">
                            {aiAnalysis.recommendations.map((r: string, i: number) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
