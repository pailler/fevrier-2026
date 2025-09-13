'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import PhotoUpload from '@/components/PhotoPortfolio/PhotoUpload';
import PhotoSearch from '@/components/PhotoPortfolio/PhotoSearch';
import PhotoGrid from '@/components/PhotoPortfolio/PhotoGrid';
import { 
  Upload, 
  Search, 
  Grid, 
  List, 
  Plus, 
  Settings, 
  BarChart3,
  FolderPlus,
  Image as ImageIcon
} from 'lucide-react';

interface User {
  id: string;
  email?: string;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
  cover_photo: any;
  _count: { count: number };
}

interface Photo {
  id: string;
  file_name: string;
  file_path: string;
  created_at: string;
  photo_descriptions: Array<{
    description: string;
    tags: string[];
    categories: string[];
    location?: string;
    date_taken?: string;
  }>;
  photo_analytics: Array<{
    view_count: number;
    download_count: number;
  }>;
}

export default function PhotoPortfolioPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upload' | 'search' | 'gallery'>('gallery');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Photo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadPhotos();
      loadCollections();
    }
  }, [user, selectedCollection]);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      } else {
        // Rediriger vers la page de connexion existante d'iAhome
        router.push('/login');
      }
    } catch (error) {
      console.error('Erreur auth:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadPhotos = async () => {
    try {
      const params = new URLSearchParams({
        userId: user!.id,
        page: '1',
        limit: '50'
      });

      if (selectedCollection) {
        params.append('collectionId', selectedCollection);
      }

      const response = await fetch(`/api/photo-portfolio/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setPhotos(data.photos);
      }
    } catch (error) {
      console.error('Erreur chargement photos:', error);
    }
  };

  const loadCollections = async () => {
    try {
      const response = await fetch(`/api/photo-portfolio/collections?userId=${user!.id}`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setCollections(data.collections);
      }
    } catch (error) {
      console.error('Erreur chargement collections:', error);
    }
  };

  const handleUploadSuccess = (photoId: string) => {
    console.log('Photo uploadée:', photoId);
    loadPhotos(); // Rafraîchir la galerie
  };

  const handleUploadError = (error: string) => {
    console.error('Erreur upload:', error);
    alert('Erreur lors de l\'upload: ' + error);
  };

  const handleSearchResults = (results: Photo[]) => {
    setSearchResults(results);
    setIsSearching(true);
  };

  const handleSearchError = (error: string) => {
    console.error('Erreur recherche:', error);
    alert('Erreur lors de la recherche: ' + error);
  };

  const createCollection = async () => {
    if (!newCollectionName.trim()) return;

    try {
      const response = await fetch('/api/photo-portfolio/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          name: newCollectionName,
          description: newCollectionDescription,
          isPublic: false,
          userId: user!.id
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewCollectionName('');
        setNewCollectionDescription('');
        setShowCreateCollection(false);
        loadCollections(); // Rafraîchir les collections
      }
    } catch (error) {
      console.error('Erreur création collection:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirection en cours
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ImageIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Portfolio Photo IA
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Connecté en tant que {user.email}
              </span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'gallery'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid className="h-4 w-4 mr-2" />
              Galerie
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'search'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Search className="h-4 w-4 mr-2" />
              Recherche
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </button>
          </div>
        </div>

        {/* Contenu principal */}
        {activeTab === 'gallery' && (
          <div>
            {/* Filtres et contrôles */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <select
                  value={selectedCollection || ''}
                  onChange={(e) => setSelectedCollection(e.target.value || null)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Toutes les collections</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name} ({collection._count.count})
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={() => setShowCreateCollection(true)}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Nouvelle collection
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${
                    viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${
                    viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Grille de photos */}
            <PhotoGrid
              photos={photos}
              viewMode={viewMode}
              onPhotoClick={(photo) => console.log('Photo cliquée:', photo)}
              onDownload={(photo) => console.log('Télécharger:', photo)}
              onLike={(photo) => console.log('Aimer:', photo)}
              onShare={(photo) => console.log('Partager:', photo)}
            />
          </div>
        )}

        {activeTab === 'search' && (
          <PhotoSearch
            userId={user.id}
            onSearchResults={handleSearchResults}
            onSearchError={handleSearchError}
          />
        )}

        {activeTab === 'upload' && (
          <PhotoUpload
            userId={user.id}
            collectionId={selectedCollection || undefined}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
          />
        )}

        {/* Modal de création de collection */}
        {showCreateCollection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Créer une collection</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de la collection
                  </label>
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Ma collection"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optionnel)
                  </label>
                  <textarea
                    value={newCollectionDescription}
                    onChange={(e) => setNewCollectionDescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                    placeholder="Description de la collection..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateCollection(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button
                  onClick={createCollection}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
