'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { User } from '@supabase/supabase-js';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Eye, Download, Trash2, Search, Tag, Calendar, MapPin, Camera } from 'lucide-react';

interface Photo {
  id: string;
  filename: string;
  url: string;
  description: string;
  tags: string[];
  category: string;
  metadata: {
    location?: string;
    date?: string;
    photographer?: string;
    camera?: string;
  };
  created_at: string;
  search_score?: number;
}

export default function PhotoUploadPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Photo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await loadUserPhotos();
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Erreur auth:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadUserPhotos = async () => {
    if (!user) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch(`/api/photo-portfolio/search?userId=${user.id}&page=1&limit=100`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPhotos(data.photos || []);
      }
    } catch (error) {
      console.error('Erreur chargement photos:', error);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) {
      console.error('Aucun utilisateur connecté');
      return;
    }

    setUploading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      console.error('Aucun token d\'accès trouvé');
      setUploading(false);
      return;
    }

    console.log('Session utilisateur:', {
      userId: user.id,
      userEmail: user.email,
      hasToken: !!session.access_token,
      tokenLength: session.access_token?.length
    });

    for (const file of acceptedFiles) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', user.id);

        console.log('Tentative d\'upload pour:', {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          userId: user.id
        });

        const response = await fetch('/api/photo-portfolio/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          },
          body: formData
        });

        console.log('Réponse upload:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Photo uploadée:', result);
          await loadUserPhotos(); // Recharger les photos
        } else {
          let errorMessage = `Erreur ${response.status}: ${response.statusText}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
            console.error('Erreur upload détaillée:', errorData);
          } catch (parseError) {
            console.error('Erreur upload (réponse non-JSON):', errorMessage);
          }
          console.error('Erreur upload:', errorMessage);
          alert(`Erreur lors de l'upload: ${errorMessage}`);
        }
      } catch (error) {
        console.error('Erreur upload:', error);
      }
    }

    setUploading(false);
  }, [user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true,
    disabled: uploading
  });

  const handleSearch = async (query: string) => {
    if (!query.trim() || !user) return;
    
    setIsSearching(true);
    setSearchQuery(query);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch(`/api/photo-portfolio/search?userId=${user.id}&query=${encodeURIComponent(query)}&page=1&limit=50`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.photos || []);
      }
    } catch (error) {
      console.error('Erreur recherche:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!user) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch(`/api/photo-portfolio/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ photoId, userId: user.id })
      });

      if (response.ok) {
        await loadUserPhotos();
        setSearchResults(searchResults.filter(p => p.id !== photoId));
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos photos...</p>
        </div>
      </div>
    );
  }

  const displayPhotos = searchQuery ? searchResults : photos;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📸 Mes Photos Privées
              </h1>
              <p className="text-gray-600 mt-2">
                Uploadez vos photos et testez la reconnaissance d'images IA
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Connecté en tant que</p>
              <p className="font-medium text-gray-900">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Zone d'upload */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📤 Upload de Photos
          </h2>
          
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            {uploading ? (
              <div>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Upload en cours...</p>
              </div>
            ) : isDragActive ? (
              <p className="text-blue-600">Déposez vos photos ici...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Glissez-déposez vos photos ici, ou cliquez pour sélectionner
                </p>
                <p className="text-sm text-gray-500">
                  Formats supportés: JPEG, PNG, GIF, WebP
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🔍 Recherche
          </h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Recherchez vos photos avec des descriptions naturelles..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch(searchQuery);
                }
              }}
            />
            <button
              onClick={() => handleSearch(searchQuery)}
              disabled={isSearching}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? 'Recherche...' : 'Rechercher'}
            </button>
          </div>
        </div>

        {/* Galerie de photos */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {searchQuery ? `Résultats de recherche (${searchResults.length})` : `Mes Photos (${photos.length})`}
            </h2>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Effacer la recherche
              </button>
            )}
          </div>

          {displayPhotos.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">
                {searchQuery ? 'Aucune photo trouvée' : 'Aucune photo uploadée'}
              </p>
              <p className="text-gray-400">
                {searchQuery ? 'Essayez avec d\'autres mots-clés' : 'Commencez par uploader vos premières photos'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayPhotos.map((photo) => (
                <div key={photo.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-w-16 aspect-h-12 bg-gray-200">
                    <div className="flex items-center justify-center h-48 bg-gradient-to-br from-blue-100 to-purple-100">
                      <div className="text-center">
                        <div className="text-4xl mb-2">📸</div>
                        <p className="text-sm text-gray-600">{photo.filename}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {photo.category}
                      </span>
                      {photo.search_score && (
                        <span className="text-sm text-gray-500">
                          Score: {(photo.search_score * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">{photo.description}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {photo.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedPhoto(photo)}
                          className="p-2 text-gray-400 hover:text-blue-600"
                          title="Voir détails"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="p-2 text-gray-400 hover:text-red-600"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(photo.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de détails */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Détails de la Photo</h3>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fichier</label>
                  <p className="text-sm text-gray-900">{selectedPhoto.filename}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description IA</label>
                  <p className="text-sm text-gray-900">{selectedPhoto.description}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {selectedPhoto.category}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <div className="flex flex-wrap gap-1">
                    {selectedPhoto.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                {selectedPhoto.metadata.location && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
                    <p className="text-sm text-gray-900 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {selectedPhoto.metadata.location}
                    </p>
                  </div>
                )}
                
                {selectedPhoto.metadata.date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <p className="text-sm text-gray-900 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {selectedPhoto.metadata.date}
                    </p>
                  </div>
                )}
                
                {selectedPhoto.metadata.photographer && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Photographe</label>
                    <p className="text-sm text-gray-900">{selectedPhoto.metadata.photographer}</p>
                  </div>
                )}
                
                {selectedPhoto.metadata.camera && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Appareil</label>
                    <p className="text-sm text-gray-900 flex items-center">
                      <Camera className="w-4 h-4 mr-1" />
                      {selectedPhoto.metadata.camera}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
