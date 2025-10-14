'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../../../utils/supabaseService';
import QuickActions from '../../../components/admin/QuickActions';

interface ContentItem {
  id: string;
  title: string;
  type: 'blog' | 'formation' | 'application' | 'essentiel' | 'page';
  status: 'published' | 'draft' | 'archived';
  published_at?: string;
  created_at: string;
  updated_at?: string;
  last_used_at?: string;
  author?: string;
  category?: string;
  views?: number;
  url?: string;
  usage_count?: number;
  max_usage?: number;
  users?: number;
}

export default function AdminContent() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    const loadContent = async () => {
      try {
        console.log('🔍 Chargement du contenu du site...');
        
        const supabase = getSupabaseClient();
        const allContent: ContentItem[] = [];

        // 1. Articles de blog
        const { data: blogArticles, error: blogError } = await supabase
          .from('blog_articles')
          .select('id, title, status, published_at, created_at, updated_at, author, category')
          .order('created_at', { ascending: false })
          .limit(50);

        if (!blogError && blogArticles) {
          blogArticles.forEach(article => {
            allContent.push({
              id: article.id,
              title: article.title,
              type: 'blog',
              status: article.status as 'published' | 'draft' | 'archived',
              published_at: article.published_at,
              created_at: article.created_at,
              updated_at: article.updated_at,
              author: article.author,
              category: article.category,
              url: `/blog/${article.id}`
            });
          });
        }

        // 2. Articles de formation
        const { data: formationArticles, error: formationError } = await supabase
          .from('formation_articles')
          .select('id, title, is_published, published_at, created_at, updated_at, author, category')
          .order('created_at', { ascending: false })
          .limit(50);

        if (!formationError && formationArticles) {
          formationArticles.forEach(article => {
            allContent.push({
              id: article.id,
              title: article.title,
              type: 'formation',
              status: article.is_published ? 'published' : 'draft',
              published_at: article.published_at,
              created_at: article.created_at,
              updated_at: article.updated_at,
              author: article.author,
              category: article.category,
              url: `/formation/${article.id}`
            });
          });
        }

        // 3. Applications (depuis user_applications)
        const { data: userApps, error: userAppsError } = await supabase
          .from('user_applications')
          .select(`
            module_id, 
            module_title,
            usage_count, 
            max_usage, 
            expires_at, 
            is_active, 
            created_at, 
            last_used_at,
            user_id
          `)
          .eq('is_active', true);

        if (!userAppsError && userApps) {
          // Grouper par module_id pour éviter les doublons
          const appGroups = userApps.reduce((acc, app) => {
            if (!acc[app.module_id]) {
              acc[app.module_id] = {
                id: app.module_id,
                title: app.module_title || app.module_id,
                usage_count: 0,
                max_usage: 0,
                users: 0,
                created_at: app.created_at,
                last_used_at: app.last_used_at,
                status: app.is_active ? 'published' : 'draft'
              };
            }
            acc[app.module_id].usage_count += app.usage_count || 0;
            acc[app.module_id].max_usage += app.max_usage || 0;
            acc[app.module_id].users++;
            if (app.last_used_at && (!acc[app.module_id].last_used_at || new Date(app.last_used_at) > new Date(acc[app.module_id].last_used_at))) {
              acc[app.module_id].last_used_at = app.last_used_at;
            }
            return acc;
          }, {} as Record<string, any>);

          // Définir les modules essentiels
          const essentialModules = ['metube', 'psitransfer', 'pdf', 'librespeed', 'qrcodes'];
          
          Object.values(appGroups).forEach((app: any) => {
            const isEssential = essentialModules.some(essentialId => 
              app.id === essentialId || 
              app.title.toLowerCase().includes(essentialId.toLowerCase())
            );

            allContent.push({
              id: app.id,
              title: app.title,
              type: isEssential ? 'essentiel' : 'application',
              status: app.status,
              created_at: app.created_at,
              last_used_at: app.last_used_at,
              usage_count: app.usage_count,
              max_usage: app.max_usage,
              users: app.users,
              url: `/card/${app.id}`
            });
          });
        }

        // 4. Pages statiques (hardcodées)
        const staticPages: ContentItem[] = [
          {
            id: 'applications',
            title: 'Applications IA',
            type: 'page',
            status: 'published',
            created_at: new Date().toISOString(),
            url: '/applications'
          },
          {
            id: 'formation',
            title: 'Formations IA',
            type: 'page',
            status: 'published',
            created_at: new Date().toISOString(),
            url: '/formation'
          },
          {
            id: 'blog',
            title: 'Blog IA',
            type: 'page',
            status: 'published',
            created_at: new Date().toISOString(),
            url: '/blog'
          },
          {
            id: 'community',
            title: 'Communauté',
            type: 'page',
            status: 'published',
            created_at: new Date().toISOString(),
            url: '/community'
          },
          {
            id: 'contact',
            title: 'Contact',
            type: 'page',
            status: 'published',
            created_at: new Date().toISOString(),
            url: '/contact'
          },
          {
            id: 'pricing',
            title: 'Tarifs',
            type: 'page',
            status: 'published',
            created_at: new Date().toISOString(),
            url: '/pricing'
          },
          {
            id: 'about',
            title: 'À propos',
            type: 'page',
            status: 'published',
            created_at: new Date().toISOString(),
            url: '/about'
          }
        ];

        allContent.push(...staticPages);

        // Trier par date de création (plus récent en premier)
        allContent.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        console.log(`✅ ${allContent.length} éléments de contenu chargés`);
        setContentItems(allContent);
      } catch (error) {
        console.error('❌ Erreur lors du chargement du contenu:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  const getTypeLabel = (type: string) => {
    const labels = {
      'blog': 'Blog',
      'formation': 'Formation',
      'application': 'Application',
      'essentiel': 'Essentiel',
      'page': 'Page'
    };
    return labels[type as keyof typeof labels] || 'Autre';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { color: 'bg-green-100 text-green-800', text: 'Publié', icon: '✅' },
      draft: { color: 'bg-yellow-100 text-yellow-800', text: 'Brouillon', icon: '📝' },
      archived: { color: 'bg-gray-100 text-gray-800', text: 'Archivé', icon: '📦' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {config.text}
      </span>
    );
  };

  const filteredContent = contentItems.filter(item => {
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesStatus = filter === 'all' || item.status === filter;
    return matchesType && matchesStatus;
  });

  const contentTypes = [
    { value: 'all', label: 'Tous', count: contentItems.length },
    { value: 'blog', label: 'Blog', count: contentItems.filter(item => item.type === 'blog').length },
    { value: 'formation', label: 'Formations', count: contentItems.filter(item => item.type === 'formation').length },
    { value: 'application', label: 'Applications', count: contentItems.filter(item => item.type === 'application').length },
    { value: 'essentiel', label: 'Essentiels', count: contentItems.filter(item => item.type === 'essentiel').length },
    { value: 'page', label: 'Pages', count: contentItems.filter(item => item.type === 'page').length },
  ];

  const statusFilters = [
    { value: 'all', label: 'Tous', count: contentItems.length },
    { value: 'published', label: 'Publiés', count: contentItems.filter(item => item.status === 'published').length },
    { value: 'draft', label: 'Brouillons', count: contentItems.filter(item => item.status === 'draft').length },
    { value: 'archived', label: 'Archivés', count: contentItems.filter(item => item.status === 'archived').length },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Gestion du contenu
        </h1>
        <p className="text-gray-600">
          Gérez tous les contenus du site : articles de blog, formations, modules et pages
        </p>
      </div>

      {/* Statistiques par type */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {contentTypes.map((type) => (
          <div 
            key={type.value}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer transition-colors ${
              typeFilter === type.value ? 'ring-2 ring-red-500' : 'hover:bg-gray-50'
            }`}
            onClick={() => setTypeFilter(type.value)}
          >
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">{type.label}</p>
              <p className="text-2xl font-bold text-gray-900">{type.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtres par statut */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtrer par statut</h3>
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((status) => (
            <button
              key={status.value}
              onClick={() => setFilter(status.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status.value
                  ? 'bg-red-100 text-red-700 border-2 border-red-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.label} ({status.count})
            </button>
          ))}
        </div>
      </div>

      {/* Liste du contenu */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {typeFilter === 'all' ? 'Tout le contenu' : `${getTypeLabel(typeFilter)} - ${filteredContent.length} éléments`}
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredContent.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-4xl mb-4">📝</div>
              <p className="text-gray-500">Aucun contenu trouvé</p>
            </div>
          ) : (
            filteredContent.map((item) => (
              <div key={item.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {item.title}
                      </h3>
                      {getStatusBadge(item.status)}
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getTypeLabel(item.type)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500 mb-2">
                      <div className="flex items-center">
                        <span className="mr-1">📅</span>
                        Créé le {new Date(item.created_at).toLocaleDateString('fr-FR')}
                      </div>
                      {item.updated_at && (
                        <div className="flex items-center">
                          <span className="mr-1">✏️</span>
                          Modifié le {new Date(item.updated_at).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                      {item.published_at && (
                        <div className="flex items-center">
                          <span className="mr-1">🚀</span>
                          Publié le {new Date(item.published_at).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                      {item.last_used_at && (
                        <div className="flex items-center">
                          <span className="mr-1">⚡</span>
                          Utilisé le {new Date(item.last_used_at).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                      {item.author && (
                        <div className="flex items-center">
                          <span className="mr-1">👤</span>
                          {item.author}
                        </div>
                      )}
                      {item.category && (
                        <div className="flex items-center">
                          <span className="mr-1">🏷️</span>
                          {item.category}
                        </div>
                      )}
                      {item.users && (
                        <div className="flex items-center">
                          <span className="mr-1">👥</span>
                          {item.users} utilisateurs
                        </div>
                      )}
                      {item.usage_count !== undefined && (
                        <div className="flex items-center">
                          <span className="mr-1">📊</span>
                          {item.usage_count}/{item.max_usage || '∞'} utilisations
                        </div>
                      )}
                    </div>

                    {item.url && (
                      <div className="text-sm text-blue-600">
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          🔗 Voir le contenu
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                      Modifier
                    </button>
                    {item.type !== 'page' && (
                      <button className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors">
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <QuickActions />
    </div>
  );
}
