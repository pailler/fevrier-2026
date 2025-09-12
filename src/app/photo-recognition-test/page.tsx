'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { User } from '@supabase/supabase-js';
import { Upload, Search, Eye, Tag, Calendar, MapPin, Camera, Brain, Zap, Target } from 'lucide-react';

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

interface RecognitionTest {
  id: string;
  prompt: string;
  expectedCategory: string;
  expectedTags: string[];
  result: Photo | null;
  score: number;
  passed: boolean;
}

export default function PhotoRecognitionTestPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [testResults, setTestResults] = useState<RecognitionTest[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const router = useRouter();

  // Tests de reconnaissance prédéfinis
  const recognitionTests = [
    {
      id: 'test-1',
      prompt: 'Montre-moi les photos de nature et paysages',
      expectedCategory: 'paysage',
      expectedTags: ['nature', 'paysage', 'montagne', 'brume', 'aurore']
    },
    {
      id: 'test-2',
      prompt: 'Je veux voir des portraits professionnels',
      expectedCategory: 'portrait',
      expectedTags: ['portrait', 'professionnel', 'studio', 'corporate']
    },
    {
      id: 'test-3',
      prompt: 'Photos d\'architecture moderne',
      expectedCategory: 'architecture',
      expectedTags: ['architecture', 'moderne', 'urbain', 'gratte-ciel']
    },
    {
      id: 'test-4',
      prompt: 'Images d\'enfants et de famille',
      expectedCategory: 'famille',
      expectedTags: ['enfant', 'famille', 'joie', 'sourire']
    },
    {
      id: 'test-5',
      prompt: 'Photos de mariage et événements romantiques',
      expectedCategory: 'mariage',
      expectedTags: ['mariage', 'romantique', 'coucher-soleil', 'couple']
    }
  ];

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

  const runRecognitionTests = async () => {
    if (!user || photos.length === 0) return;

    setIsRunningTests(true);
    const results: RecognitionTest[] = [];

    for (const test of recognitionTests) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) continue;

        // Recherche sémantique
        const response = await fetch(`/api/photo-portfolio/search?userId=${user.id}&query=${encodeURIComponent(test.prompt)}&page=1&limit=1`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const result = data.photos?.[0] || null;
          
          // Calculer le score de correspondance
          let score = 0;
          let passed = false;

          if (result) {
            // Vérifier la catégorie
            if (result.category === test.expectedCategory) {
              score += 40;
            }

            // Vérifier les tags
            const matchingTags = result.tags.filter((tag: string) => 
              test.expectedTags.some(expectedTag => 
                tag.toLowerCase().includes(expectedTag.toLowerCase())
              )
            );
            score += (matchingTags.length / test.expectedTags.length) * 60;

            passed = score >= 70; // Seuil de réussite à 70%
          }

          results.push({
            ...test,
            result,
            score: Math.round(score),
            passed
          });
        }
      } catch (error) {
        console.error(`Erreur test ${test.id}:`, error);
        results.push({
          ...test,
          result: null,
          score: 0,
          passed: false
        });
      }
    }

    setTestResults(results);
    setIsRunningTests(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des tests de reconnaissance...</p>
        </div>
      </div>
    );
  }

  const passedTests = testResults.filter(test => test.passed).length;
  const totalTests = testResults.length;
  const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🧠 Test de Reconnaissance d'Images IA
              </h1>
              <p className="text-gray-600 mt-2">
                Testez les capacités de reconnaissance et classification de vos photos
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
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tests Exécutés</p>
                <p className="text-2xl font-semibold text-gray-900">{totalTests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tests Réussis</p>
                <p className="text-2xl font-semibold text-gray-900">{passedTests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Taux de Réussite</p>
                <p className="text-2xl font-semibold text-gray-900">{successRate}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Tests de Reconnaissance
              </h2>
              <p className="text-gray-600">
                {photos.length} photos disponibles pour les tests
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/photo-upload')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Upload className="w-4 h-4 mr-2 inline" />
                Uploader des Photos
              </button>
              <button
                onClick={runRecognitionTests}
                disabled={isRunningTests || photos.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunningTests ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline"></div>
                    Tests en cours...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2 inline" />
                    Lancer les Tests
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Résultats des tests */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Résultats des Tests
            </h2>
            <div className="space-y-4">
              {testResults.map((test) => (
                <div
                  key={test.id}
                  className={`border rounded-lg p-4 ${
                    test.passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{test.prompt}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        test.passed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {test.passed ? '✓ Réussi' : '✗ Échoué'}
                      </span>
                      <span className="text-sm text-gray-500">
                        Score: {test.score}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Attendu:</p>
                      <div className="flex flex-wrap gap-1">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {test.expectedCategory}
                        </span>
                        {test.expectedTags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Résultat:</p>
                      {test.result ? (
                        <div className="flex flex-wrap gap-1">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {test.result.category}
                          </span>
                          {test.result.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Aucun résultat</span>
                      )}
                    </div>
                  </div>
                  
                  {test.result && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Description IA:</p>
                      <p className="text-sm text-gray-900">{test.result.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Galerie des photos */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Mes Photos ({photos.length})
          </h2>
          
          {photos.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">Aucune photo uploadée</p>
              <p className="text-gray-400 mb-4">
                Uploadez des photos pour tester la reconnaissance d'images
              </p>
              <button
                onClick={() => router.push('/photo-upload')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Upload className="w-4 h-4 mr-2 inline" />
                Uploader des Photos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {photos.map((photo) => (
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
                    </div>
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">{photo.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {photo.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

