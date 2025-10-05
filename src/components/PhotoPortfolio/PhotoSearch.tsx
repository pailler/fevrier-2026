'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Clock, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface PhotoSearchProps {
  userId: string;
  onSearchResults: (results: any[]) => void;
  onSearchError: (error: string) => void;
}

export default function PhotoSearch({ 
  userId, 
  onSearchResults, 
  onSearchError 
}: PhotoSearchProps) {
  const { authenticatedFetch } = useAuth();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    threshold: 0.7,
    limit: 10
  });

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const response = await authenticatedFetch(`/api/photo-portfolio/stats?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setRecentSearches(data.recentSearches.map((s: any) => s.search_query));
      }
    } catch (error) {
      console.error('Erreur chargement recherches récentes:', error);
    }
  };

  const handleSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await authenticatedFetch('/api/photo-portfolio/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          userId,
          limit: filters.limit,
          threshold: filters.threshold
        }),
      });

      const data = await response.json();
      if (data.success) {
        onSearchResults(data.results);
        loadRecentSearches(); // Rafraîchir les recherches récentes
      } else {
        onSearchError(data.error || 'Erreur lors de la recherche');
      }
    } catch (error) {
      onSearchError('Erreur de connexion');
    } finally {
      setIsSearching(false);
    }
  };


  const handleRecentSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    handleSearch(searchQuery);
  };

  return (
    <div className="w-full space-y-4">
      {/* Barre de recherche */}
      <div className="relative">
        <div className="flex">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder="Recherchez vos photos... (ex: 'photos de mariage en extérieur au coucher du soleil')"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSearching}
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={isSearching || !query.trim()}
            className="px-6 py-3 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? 'Recherche...' : 'Rechercher'}
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <Filter className="w-4 h-4" />
          <span>Filtres</span>
        </button>

        {recentSearches.length > 0 && (
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">Recherches récentes:</span>
            <div className="flex space-x-2">
              {recentSearches.slice(0, 3).map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearch(search)}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Panneau de filtres */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seuil de similarité: {filters.threshold}
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={filters.threshold}
                onChange={(e) => setFilters(prev => ({ ...prev, threshold: parseFloat(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Moins précis</span>
                <span>Plus précis</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de résultats: {filters.limit}
              </label>
              <select
                value={filters.limit}
                onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions de recherche */}
      <div className="text-sm text-gray-600">
        <p className="font-medium mb-2">Exemples de recherches :</p>
        <div className="flex flex-wrap gap-2">
          {[
            'photos de mariage en extérieur',
            'portraits en noir et blanc',
            'paysages au coucher du soleil',
            'photos de famille joyeuses',
            'architecture moderne',
            'nature et animaux'
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleRecentSearch(suggestion)}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
