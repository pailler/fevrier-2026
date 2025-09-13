'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { User } from '@supabase/supabase-js';

// 📸 Photos de démo avec descriptions générées par IA
const demoPhotos = [
  {
    id: 'demo-1',
    filename: 'mariage-coucher-soleil.jpg',
    url: '/images/demo/mariage-coucher-soleil.jpg',
    description: 'Mariage en extérieur au coucher du soleil avec vue sur la mer, couple en tenue élégante, ambiance romantique et chaleureuse, couleurs dorées et orange du crépuscule',
    tags: ['mariage', 'coucher-soleil', 'extérieur', 'romantique', 'mer', 'couple', 'crépuscule'],
    category: 'mariage',
    metadata: {
      location: 'Plage de Nice',
      date: '2024-06-15',
      photographer: 'Jean Dupont',
      camera: 'Canon EOS R5'
    },
    searchScore: 0.95
  },
  {
    id: 'demo-2',
    filename: 'portrait-femme-professionnelle.jpg',
    url: '/images/demo/portrait-femme-professionnelle.jpg',
    description: 'Portrait professionnel d\'une femme d\'affaires en costume, sourire confiant, éclairage studio professionnel, fond neutre, image corporate',
    tags: ['portrait', 'professionnel', 'femme', 'costume', 'studio', 'confiance', 'corporate'],
    category: 'portrait',
    metadata: {
      location: 'Studio Paris',
      date: '2024-07-20',
      photographer: 'Marie Martin',
      camera: 'Sony A7R IV'
    },
    searchScore: 0.92
  },
  {
    id: 'demo-3',
    filename: 'nature-montagne-aurore.jpg',
    url: '/images/demo/nature-montagne-aurore.jpg',
    description: 'Paysage de montagne à l\'aurore, brume matinale, couleurs dorées et orange, nature sauvage et préservée, vue panoramique',
    tags: ['nature', 'montagne', 'aurore', 'brume', 'paysage', 'sauvage', 'panoramique'],
    category: 'paysage',
    metadata: {
      location: 'Alpes françaises',
      date: '2024-08-10',
      photographer: 'Pierre Durand',
      camera: 'Nikon D850'
    },
    searchScore: 0.88
  },
  {
    id: 'demo-4',
    filename: 'enfant-jouant-parc.jpg',
    url: '/images/demo/enfant-jouant-parc.jpg',
    description: 'Enfant de 5 ans jouant dans un parc, sourire éclatant, moment de joie pure, éclairage naturel, mouvement spontané',
    tags: ['enfant', 'parc', 'joie', 'jeu', 'sourire', 'famille', 'spontané'],
    category: 'famille',
    metadata: {
      location: 'Parc de Vincennes',
      date: '2024-09-05',
      photographer: 'Sophie Leroy',
      camera: 'Fujifilm X-T4'
    },
    searchScore: 0.91
  },
  {
    id: 'demo-5',
    filename: 'architecture-moderne-ville.jpg',
    url: '/images/demo/architecture-moderne-ville.jpg',
    description: 'Architecture moderne en ville, gratte-ciel et bâtiments contemporains, lignes géométriques, urbanisme futuriste, reflets de verre',
    tags: ['architecture', 'moderne', 'ville', 'gratte-ciel', 'géométrique', 'urbain', 'futuriste'],
    category: 'architecture',
    metadata: {
      location: 'La Défense, Paris',
      date: '2024-07-30',
      photographer: 'Alex Moreau',
      camera: 'Canon EOS R6'
    },
    searchScore: 0.89
  }
];

// 🔍 Prompts de recherche de démo
const searchPrompts = [
  {
    prompt: "Montre-moi les photos de mariage en extérieur au coucher du soleil",
    expectedPhotos: ['demo-1'],
    description: "Recherche sémantique basée sur le contexte et l'ambiance"
  },
  {
    prompt: "Je veux voir des portraits professionnels de femmes",
    expectedPhotos: ['demo-2'],
    description: "Recherche par type de photo et caractéristiques"
  },
  {
    prompt: "Photos de nature sauvage avec des montagnes",
    expectedPhotos: ['demo-3'],
    description: "Recherche par environnement et éléments naturels"
  },
  {
    prompt: "Images d'enfants heureux et joyeux",
    expectedPhotos: ['demo-4'],
    description: "Recherche par émotion et sujet"
  },
  {
    prompt: "Architecture moderne et urbaine",
    expectedPhotos: ['demo-5'],
    description: "Recherche par style architectural"
  }
];

export default function DemoPhotoPortfolioPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
      setLoading(false);
    } catch (error) {
      console.error('Erreur auth:', error);
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setSearchQuery(query);
    
    // Simulation de la recherche sémantique
    const results = demoPhotos.filter(photo => 
      query.toLowerCase().split(' ').some(keyword => 
        photo.description.toLowerCase().includes(keyword) ||
        photo.tags.some(tag => tag.toLowerCase().includes(keyword)) ||
        photo.category.toLowerCase().includes(keyword)
      )
    ).map(photo => ({
      ...photo,
      relevanceScore: Math.random() * 0.3 + 0.7
    })).sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    setSearchResults(results);
    setIsSearching(false);
  };

  const handlePromptClick = (prompt: any) => {
    setSelectedPrompt(prompt);
    handleSearch(prompt.prompt);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la démo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🎯 Démo Portfolio Photo IA
              </h1>
              <p className="text-gray-600 mt-2">
                Démonstration des capacités de recherche sémantique avec LangChain + OpenAI
              </p>
            </div>
            {user && (
              <div className="text-right">
                <p className="text-sm text-gray-500">Connecté en tant que</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Barre de recherche */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Recherchez des photos avec des descriptions naturelles..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
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

        {/* Prompts de démo */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🔍 Prompts de Démonstration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handlePromptClick(prompt)}
                className={`p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors ${
                  selectedPrompt === prompt ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <p className="font-medium text-gray-900 mb-2">"{prompt.prompt}"</p>
                <p className="text-sm text-gray-600">{prompt.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Résultats de recherche */}
        {searchResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📸 Résultats de la Recherche
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((photo) => (
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
                      <span className="text-sm text-gray-500">
                        Score: {(photo.relevanceScore * 100).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{photo.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {photo.tags.slice(0, 3).map((tag: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Galerie complète */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📚 Galerie Complète des Photos de Démo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoPhotos.map((photo) => (
              <div key={photo.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-w-16 aspect-h-12 bg-gray-200">
                  <div className="flex items-center justify-center h-48 bg-gradient-to-br from-green-100 to-blue-100">
                    <div className="text-center">
                      <div className="text-4xl mb-2">📸</div>
                      <p className="text-sm text-gray-600">{photo.filename}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {photo.category}
                    </span>
                    <span className="text-sm text-gray-500">
                      Score: {(photo.searchScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{photo.description}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {photo.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">
                    <p>📍 {photo.metadata.location}</p>
                    <p>📅 {photo.metadata.date}</p>
                    <p>👤 {photo.metadata.photographer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Informations techniques */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            🔧 Informations Techniques
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Technologies utilisées :</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• LangChain pour l'IA</li>
                <li>• OpenAI GPT-4 Vision</li>
                <li>• Supabase PostgreSQL</li>
                <li>• pgvector pour les embeddings</li>
                <li>• Next.js 15.5.3</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Fonctionnalités :</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Recherche sémantique intelligente</li>
                <li>• Classification automatique</li>
                <li>• Embeddings vectoriels</li>
                <li>• Interface intuitive</li>
                <li>• Authentification sécurisée</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
