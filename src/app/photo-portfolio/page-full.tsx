'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
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
  const { user, loading, authenticatedFetch } = useAuth();
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
    if (user) {
      loadPhotos();
      loadCollections();
    } else if (!loading) {
      router.push('/auth/signin');
    }
  }, [user, selectedCollection, loading]);

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

      const response = await authenticatedFetch(`/api/photo-portfolio/search?${params}`);
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
      const response = await authenticatedFetch(`/api/photo-portfolio/collections?userId=${user!.id}`);
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
    alert(`Erreur: ${error}`);
  };

  const handleSearchResults = (results: Photo[]) => {
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSearchError = (error: string) => {
    console.error('Erreur recherche:', error);
    alert(`Erreur recherche: ${error}`);
    setIsSearching(false);
  };

  const handlePhotoClick = (photo: Photo) => {
    // Ouvrir la photo en plein écran ou dans un modal
    console.log('Photo cliquée:', photo);
  };

  const handlePhotoDownload = (photo: Photo) => {
    // Télécharger la photo
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const bucket = 'photo-portfolio';
    const url = `${baseUrl}/storage/v1/object/public/${bucket}/${photo.file_path}`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = photo.file_name;
    link.click();
  };

  const createCollection = async () => {
    if (!newCollectionName.trim()) return;

    try {
      const response = await authenticatedFetch('/api/photo-portfolio/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        loadCollections();
      }
    } catch (error) {
      console.error('Erreur création collection:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentPhotos = activeTab === 'search' ? searchResults : photos;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Portfolio Photo IA</h1>
              <p className="text-gray-600 mt-1">
                Gérez et recherchez vos photos avec l'intelligence artificielle
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateCollection(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Nouvelle collection</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'gallery' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Galerie</span>
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'search' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Recherche IA</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'upload' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Filtre par collection */}
            <select
              value={selectedCollection || ''}
              onChange={(e) => setSelectedCollection(e.target.value || null)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Toutes les photos</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name} ({collection._count.count})
                </option>
              ))}
            </select>

            {/* Mode d'affichage */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="space-y-8">
          {activeTab === 'upload' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Uploader une photo</h2>
              <PhotoUpload
                userId={user.id}
                collectionId={selectedCollection || undefined}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
            </div>
          )}

          {activeTab === 'search' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Recherche intelligente</h2>
              <PhotoSearch
                userId={user.id}
                onSearchResults={handleSearchResults}
                onSearchError={handleSearchError}
              />
            </div>
          )}

          {(activeTab === 'gallery' || activeTab === 'search') && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {activeTab === 'search' ? 'Résultats de recherche' : 'Vos photos'}
                </h2>
                <div className="text-sm text-gray-500">
                  {currentPhotos.length} photo{currentPhotos.length !== 1 ? 's' : ''}
                </div>
              </div>

              <PhotoGrid
                photos={currentPhotos}
                viewMode="grid"
                onPhotoClick={handlePhotoClick}
                onDownload={handlePhotoDownload}
                onLike={(photo) => console.log('Aimer:', photo)}
                onShare={(photo) => console.log('Partager:', photo)}
                loading={isSearching}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal création collection */}
      {showCreateCollection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Nouvelle collection</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la collection
                </label>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Ex: Photos de mariage"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optionnelle)
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
                disabled={!newCollectionName.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
