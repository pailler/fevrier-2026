'use client';
import { useEffect, useState } from "react";
import { supabase } from "../../../utils/supabaseClient";
import { useRouter } from "next/navigation";

interface FormationArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  categories?: string;
  author: string;
  read_time: number;
  published_at: string;
  image_url?: string;
  difficulty: string;
  duration: string;
  price: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminFormationPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [articles, setArticles] = useState<FormationArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingArticle, setEditingArticle] = useState<FormationArticle | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Catégories de niveau
  const levelCategories = [
    { value: 'Débutant', label: 'Débutant', color: 'bg-green-100 text-green-800' },
    { value: 'Intermédiaire', label: 'Intermédiaire', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Avancé', label: 'Avancé', color: 'bg-red-100 text-red-800' }
  ];

  // Catégories thématiques
  const themeCategories = [
    { value: 'Intelligence artificielle', label: 'Intelligence artificielle', color: 'bg-blue-100 text-blue-800' },
    { value: 'Impression 3D', label: 'Impression 3D', color: 'bg-purple-100 text-purple-800' },
    { value: 'Photographie', label: 'Photographie', color: 'bg-pink-100 text-pink-800' },
    { value: 'Développement Web', label: 'Développement Web', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'Logiciels', label: 'Logiciels', color: 'bg-gray-100 text-gray-800' },
    { value: 'Assistance', label: 'Assistance', color: 'bg-orange-100 text-orange-800' }
  ];

  // Toutes les catégories combinées
  const allCategories = [
    ...levelCategories,
    ...themeCategories
  ];

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    categories: [] as string[],
    author: 'IAhome Team',
    read_time: 15,
    image_url: '',
    difficulty: 'Débutant',
    duration: '15 heures',
    price: 0,
    is_published: true
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

      const isUserAdmin = data?.role === 'admin';
      setIsAdmin(isUserAdmin);

      if (isUserAdmin) {
        fetchArticles();
      } else {
        router.push('/access-denied');
      }
    } catch (err) {
      setIsAdmin(false);
      router.push('/access-denied');
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('formation_articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des formations:', error);
        return;
      }

      setArticles(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des formations:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.slug || !formData.excerpt || !formData.content) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const articleData = {
        ...formData,
        categories: JSON.stringify(formData.categories),
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (editingArticle) {
        // Update existing article
        const { error } = await supabase
          .from('formation_articles')
          .update(articleData)
          .eq('id', editingArticle.id);

        if (error) {
          console.error('Erreur lors de la mise à jour:', error);
          alert('Erreur lors de la mise à jour de la formation');
          return;
        }
      } else {
        // Create new article
        const { error } = await supabase
          .from('formation_articles')
          .insert([articleData]);

        if (error) {
          console.error('Erreur lors de la création:', error);
          alert('Erreur lors de la création de la formation');
          return;
        }
      }

      // Reset form and refresh articles
      resetForm();
      fetchArticles();
      alert(editingArticle ? 'Formation mise à jour avec succès' : 'Formation créée avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue');
    }
  };

  const handleEdit = (article: FormationArticle) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      category: article.category,
      categories: article.categories ? JSON.parse(article.categories) : [article.category],
      author: article.author,
      read_time: article.read_time,
      image_url: article.image_url || '',
      difficulty: article.difficulty,
      duration: article.duration,
      price: article.price,
      is_published: article.is_published
    });
    setShowForm(true);
  };

  const handleDelete = async (articleId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('formation_articles')
        .delete()
        .eq('id', articleId);

      if (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de la formation');
        return;
      }

      fetchArticles();
      alert('Formation supprimée avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: '',
      categories: [],
      author: 'IAhome Team',
      read_time: 15,
      image_url: '',
      difficulty: 'Débutant',
      duration: '15 heures',
      price: 0,
      is_published: true
    });
    setEditingArticle(null);
    setShowForm(false);
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès refusé</h1>
            <p className="text-gray-600">Vous devez avoir les droits d'administrateur pour accéder à cette page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Administration des Formations</h1>
          <p className="text-gray-600">Gérez les formations et leurs catégories multiples</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Total Formations</h3>
            <p className="text-3xl font-bold text-blue-600">{articles.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Publiées</h3>
            <p className="text-3xl font-bold text-green-600">{articles.filter(a => a.is_published).length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Brouillons</h3>
            <p className="text-3xl font-bold text-yellow-600">{articles.filter(a => !a.is_published).length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Catégories</h3>
            <p className="text-3xl font-bold text-purple-600">{allCategories.length}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8">
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {editingArticle ? 'Modifier la formation' : 'Nouvelle formation'}
          </button>
          {editingArticle && (
            <button
              onClick={resetForm}
              className="ml-4 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Annuler
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingArticle ? 'Modifier la formation' : 'Nouvelle formation'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Extrait *
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenu HTML *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  required
                />
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégories multiples
                </label>
                <div className="space-y-4">
                  {/* Level Categories */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Niveaux :</h4>
                    <div className="flex flex-wrap gap-2">
                      {levelCategories.map((category) => (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() => handleCategoryToggle(category.value)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            formData.categories.includes(category.value)
                              ? 'bg-blue-600 text-white'
                              : category.color
                          }`}
                        >
                          {category.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Theme Categories */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Thématiques :</h4>
                    <div className="flex flex-wrap gap-2">
                      {themeCategories.map((category) => (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() => handleCategoryToggle(category.value)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            formData.categories.includes(category.value)
                              ? 'bg-blue-600 text-white'
                              : category.color
                          }`}
                        >
                          {category.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auteur
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temps de lecture (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.read_time}
                    onChange={(e) => setFormData({...formData, read_time: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulté
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Débutant">Débutant</option>
                    <option value="Intermédiaire">Intermédiaire</option>
                    <option value="Avancé">Avancé</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    placeholder="ex: 15 heures"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de l'image
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_published" className="ml-2 block text-sm text-gray-900">
                  Publier immédiatement
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {editingArticle ? 'Mettre à jour' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Articles List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Formations ({articles.length})</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Formation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégories
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{article.title}</div>
                        <div className="text-sm text-gray-500">{article.slug}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(() => {
                          const articleCategories = article.categories ? JSON.parse(article.categories) : [article.category];
                          return articleCategories.map((cat: string, index: number) => {
                            const categoryConfig = allCategories.find(c => c.value === cat);
                            return (
                              <span 
                                key={index}
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryConfig?.color || 'bg-blue-100 text-blue-800'}`}
                              >
                                {cat}
                              </span>
                            );
                          });
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        article.is_published 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {article.is_published ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(article.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(article)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(article.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
