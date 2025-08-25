'use client';
import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabaseClient";
import Link from "next/link";
import Breadcrumb from "../../../components/Breadcrumb";
import Header from '../../../components/Header';

interface LinkedInPost {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  scheduled_at?: string;
  published_at?: string;
  created_at: string;
  linkedin_post_id?: string;
  engagement_metrics?: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
}

interface LinkedInCredentials {
  id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  profile_id: string;
  profile_name: string;
  is_active: boolean;
  created_at: string;
}

export default function LinkedInAdminPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'credentials' | 'analytics'>('posts');
  
  // États pour les posts LinkedIn
  const [linkedinPosts, setLinkedinPosts] = useState<LinkedInPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<LinkedInPost | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    scheduled_at: ''
  });
  
  // États pour les credentials
  const [credentials, setCredentials] = useState<LinkedInCredentials | null>(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [newCredentials, setNewCredentials] = useState({
    access_token: '',
    refresh_token: '',
    profile_id: '',
    profile_name: ''
  });
  
  // Statistiques
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    scheduledPosts: 0,
    draftPosts: 0,
    totalEngagement: 0,
    averageEngagement: 0
  });

  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      if (currentSession?.user) {
        setCurrentUser(currentSession.user);
        checkAdminStatus(currentSession.user.id);
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setCurrentUser(session?.user || null);
        if (session?.user) {
          checkAdminStatus(session.user.id);
        } else {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      if (error) {
        setIsAdmin(false);
        return;
      }
      const userIsAdmin = data?.role === 'admin';
      setIsAdmin(userIsAdmin);
      if (userIsAdmin) {
        fetchLinkedInData();
      }
    } catch (err) {
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchLinkedInData = async () => {
    try {
      // Charger les posts LinkedIn
      const { data: posts } = await supabase
        .from('linkedin_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (posts) {
        setLinkedinPosts(posts);
        calculateStats(posts);
      }

      // Charger les credentials
      const { data: creds } = await supabase
        .from('linkedin_credentials')
        .select('*')
        .eq('is_active', true)
        .single();

      if (creds) {
        setCredentials(creds);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données LinkedIn:', error);
    }
  };

  const calculateStats = (posts: LinkedInPost[]) => {
    const totalPosts = posts.length;
    const publishedPosts = posts.filter(post => post.status === 'published').length;
    const scheduledPosts = posts.filter(post => post.status === 'scheduled').length;
    const draftPosts = posts.filter(post => post.status === 'draft').length;
    
    const totalEngagement = posts.reduce((sum, post) => {
      if (post.engagement_metrics) {
        return sum + (post.engagement_metrics.likes + post.engagement_metrics.comments + post.engagement_metrics.shares);
      }
      return sum;
    }, 0);
    
    const averageEngagement = publishedPosts > 0 ? Math.round(totalEngagement / publishedPosts) : 0;

    setStats({
      totalPosts,
      publishedPosts,
      scheduledPosts,
      draftPosts,
      totalEngagement,
      averageEngagement
    });
  };

  const createPost = async () => {
    try {
      const { data, error } = await supabase
        .from('linkedin_posts')
        .insert([{
          title: newPost.title,
          content: newPost.content,
          status: newPost.scheduled_at ? 'scheduled' : 'draft',
          scheduled_at: newPost.scheduled_at || null
        }])
        .select()
        .single();

      if (error) throw error;

      setLinkedinPosts([data, ...linkedinPosts]);
      setNewPost({ title: '', content: '', scheduled_at: '' });
      setShowPostModal(false);
      calculateStats([data, ...linkedinPosts]);
    } catch (error) {
      console.error('Erreur lors de la création du post:', error);
    }
  };

  const publishPost = async (postId: string) => {
    try {
      // Ici, vous intégreriez l'API LinkedIn pour publier le post
      const { data, error } = await supabase
        .from('linkedin_posts')
        .update({
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', postId)
        .select()
        .single();

      if (error) throw error;

      setLinkedinPosts(linkedinPosts.map(post => 
        post.id === postId ? data : post
      ));
      calculateStats(linkedinPosts.map(post => 
        post.id === postId ? data : post
      ));
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
    }
  };

  const saveCredentials = async () => {
    try {
      const { data, error } = await supabase
        .from('linkedin_credentials')
        .upsert([{
          access_token: newCredentials.access_token,
          refresh_token: newCredentials.refresh_token,
          profile_id: newCredentials.profile_id,
          profile_name: newCredentials.profile_name,
          expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 jours
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      setCredentials(data);
      setNewCredentials({ access_token: '', refresh_token: '', profile_id: '', profile_name: '' });
      setShowCredentialsModal(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des credentials:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès refusé</h1>
            <p className="text-gray-600">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb 
          items={[
            { label: 'Admin', href: '/admin' },
            { label: 'LinkedIn', href: '/admin/linkedin' }
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion LinkedIn</h1>
          <p className="text-gray-600 mt-2">Gérez vos posts LinkedIn, configurez vos credentials et suivez vos performances.</p>
        </div>

        {/* Navigation des onglets */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'posts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Posts ({stats.totalPosts})
            </button>
            <button
              onClick={() => setActiveTab('credentials')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'credentials'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Configuration
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Posts</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalPosts}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Publiés</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.publishedPosts}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Programmés</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.scheduledPosts}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Engagement moyen</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.averageEngagement}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bouton créer un post */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Posts LinkedIn</h2>
              <button
                onClick={() => setShowPostModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Créer un post
              </button>
            </div>

            {/* Liste des posts */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Titre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date de création
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Engagement
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {linkedinPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{post.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{post.content}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            post.status === 'published' ? 'bg-green-100 text-green-800' :
                            post.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                            post.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {post.status === 'published' ? 'Publié' :
                             post.status === 'scheduled' ? 'Programmé' :
                             post.status === 'draft' ? 'Brouillon' : 'Échec'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(post.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {post.engagement_metrics ? (
                            <div className="flex space-x-2">
                              <span>❤️ {post.engagement_metrics.likes}</span>
                              <span>💬 {post.engagement_metrics.comments}</span>
                              <span>🔄 {post.engagement_metrics.shares}</span>
                            </div>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {post.status === 'draft' && (
                              <button
                                onClick={() => publishPost(post.id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Publier
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedPost(post);
                                setShowPostModal(true);
                              }}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Modifier
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'credentials' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Configuration LinkedIn</h2>
              <button
                onClick={() => setShowCredentialsModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {credentials ? 'Modifier les credentials' : 'Ajouter des credentials'}
              </button>
            </div>

            {credentials ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 ml-3">Credentials configurés</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Profil LinkedIn</label>
                    <p className="mt-1 text-sm text-gray-900">{credentials.profile_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ID du profil</label>
                    <p className="mt-1 text-sm text-gray-900">{credentials.profile_id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Statut</label>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Actif
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expire le</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(credentials.expires_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 rounded-lg p-6 text-center">
                <svg className="w-12 h-12 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Aucun credential configuré</h3>
                <p className="text-yellow-700 mb-4">
                  Vous devez configurer vos credentials LinkedIn pour pouvoir publier automatiquement du contenu.
                </p>
                <button
                  onClick={() => setShowCredentialsModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Configurer maintenant
                </button>
              </div>
            )}

            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Comment obtenir vos credentials LinkedIn ?</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>Connectez-vous à votre compte développeur LinkedIn</li>
                <li>Créez une nouvelle application</li>
                <li>Configurez les permissions nécessaires (r:emailaddress, w:member_social)</li>
                <li>Générez un access token avec les bonnes permissions</li>
                <li>Copiez l'access token et le refresh token dans le formulaire ci-dessus</li>
              </ol>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Analytics LinkedIn</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Vues totales</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {linkedinPosts.reduce((sum, post) => 
                        sum + (post.engagement_metrics?.views || 0), 0
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Likes totaux</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {linkedinPosts.reduce((sum, post) => 
                        sum + (post.engagement_metrics?.likes || 0), 0
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Commentaires totaux</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {linkedinPosts.reduce((sum, post) => 
                        sum + (post.engagement_metrics?.comments || 0), 0
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Posts les plus performants</h3>
              <div className="space-y-4">
                {linkedinPosts
                  .filter(post => post.engagement_metrics)
                  .sort((a, b) => {
                    const engagementA = (a.engagement_metrics?.likes || 0) + (a.engagement_metrics?.comments || 0) + (a.engagement_metrics?.shares || 0);
                    const engagementB = (b.engagement_metrics?.likes || 0) + (b.engagement_metrics?.comments || 0) + (b.engagement_metrics?.shares || 0);
                    return engagementB - engagementA;
                  })
                  .slice(0, 5)
                  .map((post, index) => (
                    <div key={post.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-gray-400 mr-4">#{index + 1}</span>
                        <div>
                          <h4 className="font-medium text-gray-900">{post.title}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(post.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-4 text-sm text-gray-600">
                        <span>❤️ {post.engagement_metrics?.likes || 0}</span>
                        <span>💬 {post.engagement_metrics?.comments || 0}</span>
                        <span>🔄 {post.engagement_metrics?.shares || 0}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal pour créer/modifier un post */}
      {showPostModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedPost ? 'Modifier le post' : 'Créer un nouveau post'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Titre</label>
                  <input
                    type="text"
                    value={selectedPost ? selectedPost.title : newPost.title}
                    onChange={(e) => selectedPost 
                      ? setSelectedPost({...selectedPost, title: e.target.value})
                      : setNewPost({...newPost, title: e.target.value})
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Titre du post"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contenu</label>
                  <textarea
                    value={selectedPost ? selectedPost.content : newPost.content}
                    onChange={(e) => selectedPost 
                      ? setSelectedPost({...selectedPost, content: e.target.value})
                      : setNewPost({...newPost, content: e.target.value})
                    }
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Contenu du post..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date de programmation (optionnel)</label>
                  <input
                    type="datetime-local"
                    value={selectedPost ? selectedPost.scheduled_at || '' : newPost.scheduled_at}
                    onChange={(e) => selectedPost 
                      ? setSelectedPost({...selectedPost, scheduled_at: e.target.value})
                      : setNewPost({...newPost, scheduled_at: e.target.value})
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowPostModal(false);
                    setSelectedPost(null);
                    setNewPost({ title: '', content: '', scheduled_at: '' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    if (selectedPost) {
                      // Logique pour modifier le post
                      setShowPostModal(false);
                      setSelectedPost(null);
                    } else {
                      createPost();
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {selectedPost ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour les credentials */}
      {showCredentialsModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {credentials ? 'Modifier les credentials' : 'Ajouter des credentials LinkedIn'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Access Token</label>
                  <input
                    type="password"
                    value={newCredentials.access_token}
                    onChange={(e) => setNewCredentials({...newCredentials, access_token: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Access token LinkedIn"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Refresh Token</label>
                  <input
                    type="password"
                    value={newCredentials.refresh_token}
                    onChange={(e) => setNewCredentials({...newCredentials, refresh_token: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Refresh token LinkedIn"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID du profil</label>
                  <input
                    type="text"
                    value={newCredentials.profile_id}
                    onChange={(e) => setNewCredentials({...newCredentials, profile_id: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ID du profil LinkedIn"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom du profil</label>
                  <input
                    type="text"
                    value={newCredentials.profile_name}
                    onChange={(e) => setNewCredentials({...newCredentials, profile_name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nom du profil LinkedIn"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCredentialsModal(false);
                    setNewCredentials({ access_token: '', refresh_token: '', profile_id: '', profile_name: '' });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  onClick={saveCredentials}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
