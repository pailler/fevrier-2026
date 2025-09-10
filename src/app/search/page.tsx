'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../utils/supabaseClient';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'blog' | 'formation' | 'application' | 'page';
  url: string;
  category?: string;
  published_at?: string;
  price?: string;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'blog' | 'formation' | 'application' | 'page'>('all');

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    try {
      const allResults: SearchResult[] = [];

      // Recherche dans les articles de blog
      const { data: blogArticles } = await supabase
        .from('blog_articles')
        .select('id, title, content, published_at')
        .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
        .eq('is_published', true);

      if (blogArticles) {
        blogArticles.forEach(article => {
          allResults.push({
            id: article.id,
            title: article.title,
            description: article.content?.substring(0, 200) + '...' || '',
            type: 'blog',
            url: `/blog/${article.id}`,
            published_at: article.published_at
          });
        });
      }

      // Recherche dans les formations
      const { data: formationArticles } = await supabase
        .from('formation_articles')
        .select('id, title, content, published_at')
        .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
        .eq('is_published', true);

      if (formationArticles) {
        formationArticles.forEach(formation => {
          allResults.push({
            id: formation.id,
            title: formation.title,
            description: formation.content?.substring(0, 200) + '...' || '',
            type: 'formation',
            url: `/formation/${formation.id}`,
            published_at: formation.published_at
          });
        });
      }

      // Recherche dans les modules/applications
      const { data: modules } = await supabase
        .from('modules')
        .select('id, title, description, price, category')
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`);

      if (modules) {
        modules.forEach(module => {
          allResults.push({
            id: module.id,
            title: module.title,
            description: module.description || '',
            type: 'application',
            url: `/applications`,
            category: module.category,
            price: module.price
          });
        });
      }

      // Pages statiques
      const staticPages = [
        {
          id: 'applications',
          title: 'Applications IA',
          description: 'Découvrez notre collection d\'applications IA prêtes à l\'emploi',
          type: 'page' as const,
          url: '/applications'
        },
        {
          id: 'formation',
          title: 'Formations IA',
          description: 'Apprenez l\'intelligence artificielle avec nos formations complètes',
          type: 'page' as const,
          url: '/formation'
        },
        {
          id: 'blog',
          title: 'Blog IA',
          description: 'Articles, tutoriels et analyses sur l\'intelligence artificielle',
          type: 'page' as const,
          url: '/blog'
        },
        {
          id: 'community',
          title: 'Communauté',
          description: 'Rejoignez notre communauté d\'experts en IA',
          type: 'page' as const,
          url: '/community'
        },
        {
          id: 'contact',
          title: 'Contact',
          description: 'Contactez-nous pour toute question ou projet',
          type: 'page' as const,
          url: '/contact'
        }
      ];

      // Filtrer les pages statiques selon la requête
      const matchingPages = staticPages.filter(page =>
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

      allResults.push(...matchingPages);

      setResults(allResults);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = filter === 'all' 
    ? results 
    : results.filter(result => result.type === filter);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog':
        return (
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        );
      case 'formation':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'application':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'page':
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'blog': return 'Article de blog';
      case 'formation': return 'Formation';
      case 'application': return 'Application IA';
      case 'page': return 'Page';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'blog': return 'bg-orange-100 text-orange-800';
      case 'formation': return 'bg-green-100 text-green-800';
      case 'application': return 'bg-blue-100 text-blue-800';
      case 'page': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Résultats de recherche
              </h1>
              {query && (
                <p className="text-gray-600 mt-1">
                  Recherche pour : <span className="font-semibold">"{query}"</span>
                </p>
              )}
            </div>
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Barre de recherche */}
        <div className="mb-8">
          <form action="/search" method="GET" className="flex gap-4">
            <input
              type="text"
              name="q"
              placeholder="Rechercher..."
              defaultValue={query}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Rechercher
            </button>
          </form>
        </div>

        {/* Filtres */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Tous ({results.length})
            </button>
            <button
              onClick={() => setFilter('blog')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === 'blog'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Blog ({results.filter(r => r.type === 'blog').length})
            </button>
            <button
              onClick={() => setFilter('formation')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === 'formation'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Formations ({results.filter(r => r.type === 'formation').length})
            </button>
            <button
              onClick={() => setFilter('application')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === 'application'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Applications ({results.filter(r => r.type === 'application').length})
            </button>
            <button
              onClick={() => setFilter('page')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === 'page'
                  ? 'bg-gray-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Pages ({results.filter(r => r.type === 'page').length})
            </button>
          </div>
        </div>

        {/* Résultats */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Recherche en cours...</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun résultat trouvé</h3>
            <p className="mt-2 text-gray-600">
              Essayez avec d'autres mots-clés ou explorez nos sections principales.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredResults.map((result) => (
              <div key={`${result.type}-${result.id}`} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getTypeIcon(result.type)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(result.type)}`}>
                        {getTypeLabel(result.type)}
                      </span>
                      {result.category && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {result.category}
                        </span>
                      )}
                      {result.price && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {result.price === '0' || result.price === 'Gratuit' ? 'Gratuit' : result.price}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      <Link href={result.url} className="hover:text-indigo-600 transition-colors">
                        {result.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 mb-3">{result.description}</p>
                    <div className="flex items-center justify-between">
                      <Link
                        href={result.url}
                        className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                      >
                        Voir plus →
                      </Link>
                      {result.published_at && (
                        <span className="text-sm text-gray-500">
                          {new Date(result.published_at).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
