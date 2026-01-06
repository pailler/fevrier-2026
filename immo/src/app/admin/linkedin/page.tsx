'use client';

import { useState, useEffect } from 'react';

interface LinkedInPost {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  url: string | null;
  image_url: string | null;
  type: 'blog' | 'formation';
  source_id: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  error_message: string | null;
  analytics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagement: number;
  } | null;
}

interface LinkedInConfig {
  access_token: string;
  linkedin_person_id: string;
  is_active: boolean;
}

export default function AdminLinkedIn() {
  const [posts, setPosts] = useState<LinkedInPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'pending'>('all');
  const [publishing, setPublishing] = useState<string | null>(null);
  const [publishingAll, setPublishingAll] = useState(false);
  const [selectedPost, setSelectedPost] = useState<LinkedInPost | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<LinkedInConfig>({
    access_token: '',
    linkedin_person_id: '',
    is_active: false
  });
  const [savingConfig, setSavingConfig] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<LinkedInPost | null>(null);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    excerpt: '',
    url: '',
    image_url: '',
    type: 'blog' as 'blog' | 'formation'
  });
  const [savingPost, setSavingPost] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);

  // Charger la configuration
  useEffect(() => {
    loadConfig();
  }, []);

  // Charger les posts
  useEffect(() => {
    loadPosts();
  }, [statusFilter]);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/linkedin/config');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.config) {
          setConfig({
            access_token: data.config.access_token || '',
            linkedin_person_id: data.config.linkedin_person_id || '',
            is_active: data.config.is_active || false
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/linkedin/posts?status=${statusFilter}&limit=100`);
      const data = await response.json();

      if (data.success && Array.isArray(data.posts)) {
        // Normaliser les posts pour garantir la sécurité des types
        const normalizedPosts = data.posts.map((post: any) => ({
          id: String(post.id || ''),
          title: String(post.title || 'Sans titre'),
          content: String(post.content || ''),
          excerpt: post.excerpt && typeof post.excerpt === 'string' ? post.excerpt : null,
          url: post.url && typeof post.url === 'string' ? post.url : null,
          image_url: post.image_url && typeof post.image_url === 'string' ? post.image_url : null,
          type: (post.type === 'blog' || post.type === 'formation') ? post.type : 'blog',
          source_id: post.source_id ? String(post.source_id) : null,
          is_published: Boolean(post.is_published),
          published_at: post.published_at ? String(post.published_at) : null,
          created_at: String(post.created_at || new Date().toISOString()),
          error_message: post.error_message ? String(post.error_message) : null,
          analytics: post.analytics ? {
            views: Number(post.analytics.views) || 0,
            likes: Number(post.analytics.likes) || 0,
            comments: Number(post.analytics.comments) || 0,
            shares: Number(post.analytics.shares) || 0,
            engagement: Number(post.analytics.engagement) || 0
          } : null
        }));
        setPosts(normalizedPosts);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setSavingConfig(true);
      const response = await fetch('/api/linkedin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Configuration sauvegardée avec succès !');
        setShowConfig(false);
        await loadConfig();
      } else {
        alert(`❌ Erreur: ${data.error || 'Erreur inconnue'}`);
      }
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert(`❌ Erreur: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setSavingConfig(false);
    }
  };

  const handlePublish = async (postId: string) => {
    try {
      setPublishing(postId);
      const response = await fetch('/api/linkedin/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Post publié avec succès !');
        await loadPosts();
      } else {
        alert(`❌ Erreur: ${data.error || 'Erreur inconnue'}`);
      }
    } catch (error: any) {
      console.error('Erreur lors de la publication:', error);
      alert(`❌ Erreur: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setPublishing(null);
    }
  };

  const handlePublishAll = async () => {
    if (!confirm('Êtes-vous sûr de vouloir publier tous les posts en attente ?')) {
      return;
    }

    try {
      setPublishingAll(true);
      const response = await fetch('/api/linkedin/publish-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoPublish: false })
      });

      const data = await response.json();
      if (data.success) {
        alert(`✅ ${data.published || 0} post(s) publié(s), ${data.failed || 0} échec(s)`);
        await loadPosts();
      } else {
        alert(`❌ Erreur: ${data.error || 'Erreur inconnue'}`);
      }
    } catch (error: any) {
      console.error('Erreur lors de la publication en masse:', error);
      alert(`❌ Erreur: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setPublishingAll(false);
    }
  };

  const handleCreatePost = () => {
    setEditingPost(null);
    setNewPost({
      title: '',
      content: '',
      excerpt: '',
      url: '',
      image_url: '',
      type: 'blog'
    });
    setCharacterCount(0);
    setShowEditor(true);
  };

  const handleSavePost = async (publishNow: boolean = false) => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert('❌ Le titre et le contenu sont requis');
      return;
    }

    try {
      setSavingPost(true);
      const response = await fetch('/api/linkedin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPost.title.trim(),
          content: newPost.content.trim(),
          excerpt: newPost.excerpt.trim() || null,
          url: newPost.url.trim() || null,
          image_url: newPost.image_url.trim() || null,
          type: newPost.type,
          source_id: null
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Article créé avec succès !');
        setShowEditor(false);
        await loadPosts();
        
        // Publier immédiatement si demandé
        if (publishNow && data.post?.id) {
          await handlePublish(data.post.id);
        }
      } else {
        alert(`❌ Erreur: ${data.error || 'Erreur inconnue'}`);
      }
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert(`❌ Erreur: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setSavingPost(false);
    }
  };

  const updateContent = (content: string) => {
    setNewPost({ ...newPost, content });
    setCharacterCount(content.length);
  };

  const pendingCount = posts.filter(p => !p.is_published).length;
  const publishedCount = posts.filter(p => p.is_published).length;

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <span className="mr-3">💼</span>
              Partage LinkedIn - Nouveaux contenus iahome.fr
            </h1>
            <p className="text-gray-600">
              Gérez et publiez automatiquement vos nouveaux articles et formations sur LinkedIn
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCreatePost}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <span>✍️</span>
              <span>Rédiger un article</span>
            </button>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
            >
              <span>⚙️</span>
              <span>Configuration</span>
            </button>
            {pendingCount > 0 && (
              <button
                onClick={handlePublishAll}
                disabled={publishingAll}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {publishingAll ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Publication...</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Publier tout ({pendingCount})</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Configuration LinkedIn */}
      {showConfig && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Configuration LinkedIn API</h2>
            <button
              onClick={() => setShowConfig(false)}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Token LinkedIn
              </label>
              <input
                type="password"
                value={config.access_token}
                onChange={(e) => setConfig({ ...config, access_token: e.target.value })}
                placeholder="Votre access token LinkedIn"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn Person ID
              </label>
              <input
                type="text"
                value={config.linkedin_person_id}
                onChange={(e) => setConfig({ ...config, linkedin_person_id: e.target.value })}
                placeholder="Votre LinkedIn Person ID (URN)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={config.is_active}
                onChange={(e) => setConfig({ ...config, is_active: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                Activer la publication automatique
              </label>
            </div>

            <div className="flex space-x-2 pt-4">
              <button
                onClick={handleSaveConfig}
                disabled={savingConfig}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {savingConfig ? 'Sauvegarde...' : '💾 Sauvegarder'}
              </button>
              <button
                onClick={() => setShowConfig(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Publiés</p>
              <p className="text-2xl font-bold text-green-600">{publishedCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-red-100 text-red-700 border-2 border-red-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous ({posts.length})
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'published'
                ? 'bg-red-100 text-red-700 border-2 border-red-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Publiés ({publishedCount})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'pending'
                ? 'bg-red-100 text-red-700 border-2 border-red-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            En attente ({pendingCount})
          </button>
        </div>
      </div>

      {/* Liste des posts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Posts LinkedIn</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {posts.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-4xl mb-4">📭</div>
              <p className="text-gray-500">Aucun post LinkedIn trouvé</p>
              <p className="text-sm text-gray-400 mt-2">
                Les posts sont créés automatiquement lors de la publication d'articles ou de formations
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {post.title}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        post.is_published 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.is_published ? '✅ Publié' : '⏳ En attente'}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        post.type === 'formation' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {post.type === 'formation' ? '🎓 Formation' : '📝 Article'}
                      </span>
                    </div>

                    {post.excerpt && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}

                    <div className="flex items-center space-x-6 text-sm text-gray-500 mb-2">
                      {post.url && (
                        <div className="flex items-center">
                          <span className="mr-1">🔗</span>
                          <a
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline max-w-xs truncate"
                          >
                            {post.url.length > 50 ? post.url.substring(0, 50) + '...' : post.url}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center">
                        <span className="mr-1">📅</span>
                        {new Date(post.created_at).toLocaleDateString('fr-FR')}
                      </div>
                      {post.published_at && (
                        <div className="flex items-center">
                          <span className="mr-1">🚀</span>
                          Publié le {new Date(post.published_at).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                      {post.analytics && (
                        <div className="flex items-center">
                          <span className="mr-1">📊</span>
                          {post.analytics.engagement} engagements
                        </div>
                      )}
                    </div>

                    {post.error_message && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        ⚠️ {post.error_message}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedPost(post);
                        setShowModal(true);
                      }}
                      className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200"
                    >
                      👁️ Voir
                    </button>
                    {!post.is_published && (
                      <button
                        onClick={() => handlePublish(post.id)}
                        disabled={publishing === post.id}
                        className="px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 disabled:opacity-50 flex items-center space-x-1"
                      >
                        {publishing === post.id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-700"></div>
                            <span>...</span>
                          </>
                        ) : (
                          <>
                            <span>🚀</span>
                            <span>Publier</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Éditeur d'article */}
      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingPost ? 'Modifier l\'article' : '✍️ Rédiger un article LinkedIn'}
                </h2>
                <button
                  onClick={() => setShowEditor(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Type d'article */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type d'article
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="blog"
                        checked={newPost.type === 'blog'}
                        onChange={(e) => setNewPost({ ...newPost, type: e.target.value as 'blog' | 'formation' })}
                        className="mr-2"
                      />
                      <span>📝 Article de blog</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="formation"
                        checked={newPost.type === 'formation'}
                        onChange={(e) => setNewPost({ ...newPost, type: e.target.value as 'blog' | 'formation' })}
                        className="mr-2"
                      />
                      <span>🎓 Formation</span>
                    </label>
                  </div>
                </div>

                {/* Titre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="Titre accrocheur pour votre article LinkedIn"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    maxLength={200}
                  />
                  <p className="mt-1 text-xs text-gray-500">{newPost.title.length}/200 caractères</p>
                </div>

                {/* Extrait (optionnel) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Extrait (optionnel)
                  </label>
                  <textarea
                    value={newPost.excerpt}
                    onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
                    placeholder="Court résumé de l'article (sera affiché avant le contenu principal)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    maxLength={300}
                  />
                  <p className="mt-1 text-xs text-gray-500">{newPost.excerpt.length}/300 caractères</p>
                </div>

                {/* Contenu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contenu de l'article <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => updateContent(e.target.value)}
                    placeholder="Rédigez votre article LinkedIn ici... Utilisez des sauts de ligne pour structurer votre contenu."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-sans"
                    rows={12}
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      {characterCount} caractères
                      {characterCount > 3000 && (
                        <span className="text-yellow-600 ml-2">⚠️ LinkedIn recommande moins de 3000 caractères</span>
                      )}
                    </p>
                    <div className="text-xs text-gray-500">
                      💡 Astuce: Utilisez des emojis et des hashtags pour améliorer l'engagement
                    </div>
                  </div>
                </div>

                {/* URL (optionnel) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de l'article (optionnel)
                  </label>
                  <input
                    type="url"
                    value={newPost.url}
                    onChange={(e) => setNewPost({ ...newPost, url: e.target.value })}
                    placeholder="https://iahome.fr/blog/mon-article"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Lien vers l'article complet sur iahome.fr</p>
                </div>

                {/* Image URL (optionnel) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de l'image (optionnel)
                  </label>
                  <input
                    type="url"
                    value={newPost.image_url}
                    onChange={(e) => setNewPost({ ...newPost, image_url: e.target.value })}
                    placeholder="https://iahome.fr/images/article.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Image à associer au post LinkedIn</p>
                </div>

                {/* Prévisualisation */}
                {newPost.content && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">📱 Aperçu LinkedIn</h3>
                    <div className="bg-white p-4 rounded border border-gray-300">
                      <h4 className="font-semibold text-gray-900 mb-2">{newPost.title || 'Titre de l\'article'}</h4>
                      {newPost.excerpt && (
                        <p className="text-sm text-gray-600 mb-2 italic">{newPost.excerpt}</p>
                      )}
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{newPost.content}</p>
                      {newPost.url && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <a href={newPost.url} className="text-blue-600 text-sm hover:underline">
                            🔗 {newPost.url}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Boutons d'action */}
                <div className="flex space-x-2 pt-4">
                  <button
                    onClick={() => handleSavePost(false)}
                    disabled={savingPost || !newPost.title.trim() || !newPost.content.trim()}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingPost ? 'Sauvegarde...' : '💾 Sauvegarder comme brouillon'}
                  </button>
                  <button
                    onClick={() => handleSavePost(true)}
                    disabled={savingPost || !newPost.title.trim() || !newPost.content.trim()}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingPost ? 'Publication...' : '🚀 Créer et publier'}
                  </button>
                  <button
                    onClick={() => setShowEditor(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détail */}
      {showModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Détails du post LinkedIn</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                  <p className="text-gray-900">{selectedPost.title}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedPost.type === 'formation' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedPost.type === 'formation' ? '🎓 Formation' : '📝 Article'}
                  </span>
                </div>

                {selectedPost.url && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                    <a
                      href={selectedPost.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {selectedPost.url}
                    </a>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contenu du post</label>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <pre className="whitespace-pre-wrap text-sm text-gray-900 font-sans">
                      {selectedPost.content}
                    </pre>
                  </div>
                </div>

                {selectedPost.analytics && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Statistiques</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Vues</p>
                        <p className="text-lg font-bold text-blue-600">{selectedPost.analytics.views}</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600">J'aime</p>
                        <p className="text-lg font-bold text-green-600">{selectedPost.analytics.likes}</p>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Commentaires</p>
                        <p className="text-lg font-bold text-yellow-600">{selectedPost.analytics.comments}</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600">Partages</p>
                        <p className="text-lg font-bold text-purple-600">{selectedPost.analytics.shares}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2 pt-4">
                  {!selectedPost.is_published && (
                    <button
                      onClick={() => {
                        handlePublish(selectedPost.id);
                        setShowModal(false);
                      }}
                      disabled={publishing === selectedPost.id}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {publishing === selectedPost.id ? 'Publication...' : '🚀 Publier maintenant'}
                    </button>
                  )}
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



